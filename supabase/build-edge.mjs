import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const source = await readFile(resolve(root, 'kodlar', 'Code.gs'), 'utf8');
const client = await readFile(resolve(root, 'kodlar', 'Scripts.html'), 'utf8');
const discovered = new Set(['getAppData', 'login', 'logout']);
for (const match of client.matchAll(/(?:server|submit)\('([A-Za-z0-9_]+)/g)) discovered.add(match[1]);
for (const name of ['reconcileSystem', 'generateFullDataBackup', 'restorePledgeBackup']) discovered.add(name);
for (const name of ['beginAppDataTransfer', 'getAppDataTransferChunk']) discovered.delete(name);
const methods = [...discovered].sort();
const remote = ['generatePersonnelPledgePdf', 'generateReferenceTargetsPdf', 'generateTeacherPaymentReceiptPdf'];

const output = `// Generated from kodlar/Code.gs by supabase/build-edge.mjs.
// Do not hand-edit this file; edit Code.gs and rebuild.
export function createBusiness(runtime) {
  const { SpreadsheetApp, PropertiesService, CacheService, LockService, Utilities, MimeType } = runtime;
${source}

  // PostgreSQL already records an immutable mutation backup. The legacy
  // Google-Drive pre-delete copy is therefore represented by this audit label.
  backupPledgeData_ = function() { return 'Supabase otomatik işlem yedeği'; };
  backupDonationData_ = function() { return 'Supabase otomatik işlem yedeği'; };
  const originalRestorePledgeBackup = restorePledgeBackup;
  restorePledgeBackup = function(token, payload) {
    if (payload && payload.spreadsheetId) throw new Error('Supabase sürümünde geri yükleme için JSON yedek dosyasını kullanın.');
    return originalRestorePledgeBackup(token, payload);
  };

  const api = { ${methods.join(', ')} };
  const googleMethods = new Set(${JSON.stringify(remote)});
  return {
    googleMethods,
    call(method, args) {
      if (googleMethods.has(method)) return { __googleMethod: method, args };
      if (method === 'getAppData') {
        const session = requireSession_(args[0]);
        const data = buildAppData_(session, args[1] || {});
        data._meta = { source:'supabase', generatedAt:new Date().toISOString() };
        return data;
      }
      const fn = api[method];
      if (typeof fn !== 'function') throw new Error('İşlem desteklenmiyor: ' + method);
      return fn.apply(null, args || []);
    }
  };
}
`;

const target = resolve(here, 'functions', 'tahsilat-api', 'business.mjs');
await mkdir(dirname(target), { recursive:true });
await writeFile(target, output, 'utf8');
console.log(JSON.stringify({ target, methods:methods.length, bytes:Buffer.byteLength(output) }));
