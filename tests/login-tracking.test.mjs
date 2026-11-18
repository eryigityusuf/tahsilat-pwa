import assert from 'node:assert/strict';
import fs from 'node:fs';

const server = fs.readFileSync(new URL('../Code.gs', import.meta.url), 'utf8');
const client = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');

assert.match(server, /Son Başarılı Giriş','Son Hatalı Giriş','Hatalı Giriş Sayısı','Son Giriş Durumu'/, 'Kullanıcı giriş izleme sütunları tanımlanmalı.');
assert.match(server, /GİRİŞ_HATALI/, 'Hatalı girişler işlem günlüğüne kaydedilmeli.');
assert.match(server, /function resetUserLoginAttempts\(/, 'Yönetici giriş kilidini kaldırabilmeli.');
assert.match(server, /lastLoginAt:loginTime_\(r\[9\]\).*lastFailedLoginAt:loginTime_\(r\[10\]\).*failedLoginCount:Number\(r\[11\]\)/s, 'Giriş bilgileri kullanıcı DTO verisine eklenmeli.');
assert.match(client, /Son Başarılı Giriş','Son Hatalı Giriş','Hatalı Deneme'/, 'Kullanıcı listesi giriş durumlarını göstermeli.');
assert.match(client, /submit\('resetUserLoginAttempts',id\)/, 'Kilit açma işlemi sunucuya gönderilmeli.');

console.log(JSON.stringify({ loginTracking:true, failedAttempts:true, unlock:true, ok:true }));
