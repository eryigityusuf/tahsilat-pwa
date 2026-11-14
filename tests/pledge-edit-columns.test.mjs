import assert from 'node:assert/strict';
import fs from 'node:fs';

const client=fs.readFileSync(new URL('../Scripts.html',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../Styles.html',import.meta.url),'utf8');
const start=client.indexOf('function pledgeAccountingFields');
const end=client.indexOf('function syncPledgeYearFromDate',start);
const form=client.slice(start,end);

const labels=['TAAHHÜT TARİHİ','YIL','FAALİYET','ALT FAALİYET','HESAP ADI','KİMİN ADINA','İLETİŞİM TEL','REFERANS','REFERANS NEVİ','TAKİP EDEN','TAHAKKUK (TL)','ÖDENEN (TL)','KALAN (TL)','NOTLAR'];
for(const label of labels)assert.ok(form.includes(label),`Taahhüt düzenleme formunda ${label} görünmeli.`);
assert.match(form,/id="fPaid"[^>]*readonly/, 'Ödenen alanı hesaplanan ve salt okunur olmalı.');
assert.match(form,/id="fRemaining"[^>]*readonly/, 'Kalan alanı hesaplanan ve salt okunur olmalı.');
assert.ok(form.indexOf('TAAHHÜT TARİHİ')<form.indexOf("'YIL'"), 'Form tablo sırasına göre tarih ile başlamalı.');
assert.match(styles,/\.pledge-readonly-field/, 'Hesaplanan alanların görsel ayrımı bulunmalı.');

console.log(JSON.stringify({matchingLabels:labels.length,paidReadonly:true,remainingReadonly:true,tableOrder:true,ok:true}));
