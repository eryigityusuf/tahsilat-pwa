import { createBusiness } from './business.mjs';
import { digest, makeRuntime } from './runtime.mjs';

const project = Deno.env.get('SUPABASE_URL')!;
const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const githubOrigin = 'https://eryigityusuf.github.io';

function allowedOrigin(origin: string | null) {
  if (!origin) return null;
  try {
    const url = new URL(origin);
    if (origin === githubOrigin || url.hostname === 'script.google.com' || url.hostname.endsWith('.googleusercontent.com')) return origin;
  } catch (_) {}
  return null;
}

async function db(path: string, body?: unknown, method='POST') {
  const response = await fetch(project + '/rest/v1/' + path, {
    method,
    headers:{
      apikey:service,
      Authorization:'Bearer ' + service,
      'Content-Type':'application/json',
      Prefer:path.startsWith('tahsilat_import_rows?') ? 'resolution=merge-duplicates,return=representation' : 'return=representation'
    },
    ...(body === undefined ? {} : { body:JSON.stringify(body) }),
    signal:AbortSignal.timeout(30000)
  });
  const value = await response.json().catch(() => null);
  if (!response.ok) {
    console.error('database', response.status, value?.code || 'unknown');
    throw new Error('Veritabanı işlemi tamamlanamadı.');
  }
  return value;
}

const rpc = (name: string, args: unknown) => db('rpc/' + name, args);

async function checkSecret(req: Request, name: string) {
  const value = req.headers.get('x-tahsilat-' + name + '-key') || '';
  if (value.length < 36) throw new Error('AUTH');
  const rows = await db(`tahsilat_secrets?name=eq.${encodeURIComponent(name)}&hash=eq.${digest(value)}&select=name`, undefined, 'GET');
  if (rows.length !== 1) throw new Error('AUTH');
}

async function importData(req: Request, input: any) {
  await checkSecret(req, 'import');
  const meta = (await db('tahsilat_meta?id=eq.1&select=initialized', undefined, 'GET'))[0];
  if (meta.initialized) throw new Error('Aktarım zaten tamamlandı.');
  if (!/^[0-9a-f-]{36}$/i.test(input.job || '')) throw new Error('Aktarım kimliği geçersiz.');
  if (input.action === 'importStart') {
    if (!input.manifest?.sizes || !input.manifest?.props?.TAHSILAT_DB_ID) throw new Error('Aktarım manifesti eksik.');
    const existing = await db(`tahsilat_import_jobs?id=eq.${input.job}&select=id`, undefined, 'GET');
    if (!existing.length) await db('tahsilat_import_jobs', { id:input.job, manifest:input.manifest });
    return { started:true };
  }
  if (input.action === 'importChunk') {
    if (typeof input.sheet !== 'string' || !Array.isArray(input.rows) || !Number.isInteger(input.start) || input.start < 1 || input.rows.length > 200) throw new Error('Aktarım paketi geçersiz.');
    const jobs = await db(`tahsilat_import_jobs?id=eq.${input.job}&select=manifest`, undefined, 'GET');
    const expected = Number(jobs[0]?.manifest?.sizes?.[input.sheet]);
    if (!Number.isInteger(expected) || input.start + input.rows.length - 1 > expected) throw new Error('Aktarım sınırı geçersiz.');
    const rows = input.rows.map((cells: unknown, i: number) => ({ job:input.job, sheet:input.sheet, row_number:input.start+i, cells }));
    await db('tahsilat_import_rows?on_conflict=job,sheet,row_number', rows);
    return { count:rows.length };
  }
  if (input.action === 'importFinish') return await rpc('tahsilat_import_finish', { p_job:input.job });
  throw new Error('İşlem geçersiz.');
}

function cacheKeys(method: string, args: any[]) {
  if (method === 'login') return [digest('login-attempt:' + String(args[0] || '').trim().toLowerCase())];
  const token = String(args[0] || '');
  return token ? [digest('session:' + token)] : [];
}

function errorCode(error: any) {
  const message = String(error?.message || error || 'İşlem tamamlanamadı.');
  if (/Oturum|yetki|Yönetici|erişim|AUTH/i.test(message)) return 'AUTH';
  if (/bulunamadı|geçersiz|zorunlu|seçin|girin|fazla|aşamaz/i.test(message)) return 'VALIDATION';
  return 'BUSINESS';
}

Deno.serve(async req => {
  const origin = req.headers.get('origin');
  const acceptedOrigin = allowedOrigin(origin);
  if (origin && !acceptedOrigin) return new Response('Kaynak geçersiz.', { status:403 });
  const headers: Record<string,string> = {
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store',
    'Access-Control-Allow-Headers':'content-type,x-tahsilat-import-key',
    'Access-Control-Allow-Methods':'POST,OPTIONS',
    ...(acceptedOrigin ? { 'Access-Control-Allow-Origin':acceptedOrigin, Vary:'Origin' } : {})
  };
  const reply = (body: unknown, status=200) => new Response(JSON.stringify(body), { status, headers });
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return reply({ ok:false, error:{ code:'METHOD', message:'POST gerekli.' } }, 405);

  try {
    const text = await req.text();
    if (text.length > 2_500_000) return reply({ ok:false, error:{ code:'SIZE', message:'İstek çok büyük.' } }, 413);
    const input = JSON.parse(text);
    if (input.action === 'health') {
      const meta = (await db('tahsilat_meta?id=eq.1&select=initialized,revision,updated_at', undefined, 'GET'))[0];
      return reply({ ok:true, data:{ ready:meta.initialized, revision:meta.revision, updatedAt:meta.updated_at, backend:'supabase' } });
    }
    if (String(input.action || '').startsWith('import')) return reply({ ok:true, data:await importData(req, input) });

    const method = String(input.method || '');
    const args = Array.isArray(input.args) ? input.args : [];
    const requestId = String(input.requestId || '');
    if (!method || !/^[0-9a-f-]{36}$/i.test(requestId)) throw new Error('İstek kimliği geçersiz.');
    if (text.length > 600_000) throw new Error('İstek güvenli boyut sınırını aşıyor.');
    const fingerprint = digest(JSON.stringify([method,args]));
    const owner = method === 'login' ? String(args[0] || '').trim().toLowerCase() : digest(String(args[0] || ''));

    for (let attempt=0; attempt<4; attempt++) {
      // Sürüm kontrolü sekiz saniyede bir çalışır. Bu hafif çağrıda tüm veri
      // satırlarını taşımak yerine yalnızca meta/properties ve oturumu yükle.
      const snapshot = await rpc('tahsilat_load', { p_keys:cacheKeys(method,args), p_sheets:method === 'getDataRevision' ? [] : null });
      if (!snapshot?.initialized) return reply({ ok:false, error:{ code:'SETUP', message:'Supabase veri aktarımı henüz tamamlanmadı.' } }, 503);
      const runtime = makeRuntime(snapshot);
      const business = createBusiness(runtime);
      let response: any;
      try {
        const value = business.call(method, args);
        if (value?.__googleMethod) throw new Error('Bu PDF işlemi Supabase geçişinin son eşitleme adımından sonra açılacaktır.');
        response = { ok:true, data:value };
      } catch (error) {
        response = { ok:false, error:{ code:errorCode(error), message:String(error?.message || error || 'İşlem tamamlanamadı.') } };
      }

      const patch = runtime.patch();
      if (!response.ok && method !== 'login') {
        patch.rows = [];
        patch.truncate = {};
        patch.cache = [];
        patch.props = null;
      }
      const changed = patch.rows.length || Object.keys(patch.truncate).length || patch.cache.length || patch.props !== null;
      if (changed) {
        const committed = await rpc('tahsilat_commit', {
          p_revision:snapshot.revision,
          p_patch:patch,
          p_id:requestId,
          p_fingerprint:fingerprint,
          p_owner:owner,
          p_response:response,
          p_method:method
        });
        if (!committed.committed) continue;
        response = committed.response;
      }
      return reply(response, response.ok ? 200 : response.error.code === 'AUTH' ? 401 : response.error.code === 'VALIDATION' ? 400 : 409);
    }
    return reply({ ok:false, error:{ code:'CONFLICT', message:'Eş zamanlı işlem var. Lütfen yeniden deneyin.' } }, 409);
  } catch (error) {
    console.error('tahsilat-api', error?.message === 'AUTH' ? 'AUTH' : error?.name || 'Error');
    const auth = error?.message === 'AUTH';
    return reply({ ok:false, error:{ code:auth?'AUTH':'UPSTREAM', message:auth?'Aktarım yetkisi geçersiz.':'Sunucu işlemi tamamlanamadı.' } }, auth?401:502);
  }
});
