import assert from 'node:assert/strict';
import fs from 'node:fs';

const client = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const server = fs.readFileSync(new URL('../Code.gs', import.meta.url), 'utf8');

assert.match(client, /inputField\('Taahhüt Tarihi','fPledgeDate','date'/, 'Yeni taahhüt formunda tarih alanı bulunmalı.');
assert.match(client, /pledgeDate:\$\('#fPledgeDate'\)\.value/, 'Seçilen taahhüt tarihi sunucuya gönderilmeli.');
assert.match(client, /validateModalFields\(\['fYear','fPledgeDate','fName','fReference','fType','fAmount'\]\)/, 'Tarih zorunlu alan olarak doğrulanmalı.');
assert.match(server, /parseDate_\(payload\.pledgeDate, 'Taahhüt tarihi'\)/, 'Sunucu taahhüt tarihini doğrulamalı.');
assert.match(server, /date\.getFullYear\(\) !== year/, 'Yıl ve taahhüt tarihi tutarlı olmalı.');

console.log(JSON.stringify({ visibleDateField:true, required:true, persisted:true, yearSync:true, ok:true }));
