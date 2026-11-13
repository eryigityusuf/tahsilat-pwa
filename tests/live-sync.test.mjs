import assert from 'node:assert/strict';
import fs from 'node:fs';

const client = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const server = fs.readFileSync(new URL('../Code.gs', import.meta.url), 'utf8');
const edge = fs.readFileSync(new URL('../supabase/functions/tahsilat-api/index.ts', import.meta.url), 'utf8');

assert.match(client, /REMOTE_REVISION_INTERVAL_MS=8000/, 'Arka plan denetim aralığı tanımlanmalı.');
assert.match(client, /server\('getDataRevision',state\.token\)/, 'İstemci güvenli sürüm uç noktasını kullanmalı.');
assert.match(client, /function openApp\(\).*startRemoteDataWatcher\(\)/, 'Tüm kullanıcı oturumlarında izleyici başlamalı.');
assert.match(client, /acceptAppData\(fresh\);updateProfile\(\);render\(\)/, 'Değişiklik tüm aktif görünümü yenilemeli.');
assert.match(server, /function getDataRevision\(token\)\s*{\s*requireSession_\(token\)/, 'Sürüm denetimi geçerli oturum istemeli.');
assert.match(edge, /p_sheets:method === 'getDataRevision' \? \['Kullanıcılar'\] : null/, 'Sürüm denetimi oturumun periyodik yetki doğrulaması için yalnızca kullanıcıları yüklemeli.');

console.log(JSON.stringify({ intervalMs:8000, globalViews:true, sessionRequired:true, lightweight:true, periodicSessionValidation:true, ok:true }));
