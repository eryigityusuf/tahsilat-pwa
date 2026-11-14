import assert from 'node:assert/strict';
import fs from 'node:fs';

const client=fs.readFileSync(new URL('../Scripts.html',import.meta.url),'utf8');
const server=fs.readFileSync(new URL('../Code.gs',import.meta.url),'utf8');
const edge=fs.readFileSync(new URL('../supabase/functions/tahsilat-api/business.mjs',import.meta.url),'utf8');

const modal=client.slice(client.indexOf('function editStudentAccrualModal'),client.indexOf('function studentPledgeImportModal'));
assert.match(modal,/pledgeAccountingFields\(x,referenceTypes\)/, 'Veli teberrusu düzenlemesi taahhüt alanlarının tamamını göstermeli.');
assert.match(modal,/showModal\('Veli teberrusunu düzenle'/, 'Veli teberrusu için doğru pencere başlığı kullanılmalı.');
for(const field of ['year','reference','activity','subActivity','group','notes'])assert.match(modal,new RegExp(`${field}:`),`Veli teberrusu ${field} alanını sunucuya göndermeli.`);
for(const source of [server,edge]){
  const update=source.slice(source.indexOf('function updateStudentAccrual'),source.indexOf('function studentPlanInput_',source.indexOf('function updateStudentAccrual')));
  assert.match(update,/const reference = cleanText_\(payload\.reference/, 'Sunucu referansı doğrulamalı.');
  assert.match(update,/activity, subActivity, '', group, notes/, 'Sunucu faaliyet ve takip alanlarını kaydetmeli.');
  assert.match(update,/setValue\(feeType\)/, 'Bağlı tahsilatın referans nevi güncellenmeli.');
}

console.log(JSON.stringify({studentSourceDetected:true,fullPledgeFields:true,backendPersistence:true,linkedCollections:true,ok:true}));
