import assert from 'node:assert/strict';
import fs from 'node:fs';

const client = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');

assert.match(client, /pledgeSort:'date-desc'/, 'Taahhüt listesi varsayılan olarak en yeni tarihe göre sıralanmalı.');
assert.match(client, /key:'pledgeDate',label:'TAAHHÜT TARİHİ'/, 'Taahhüt tarihi tabloda görünür olmalı.');
assert.match(client, /'date-desc':\(a,b\)=>String\(b\.pledgeDate\|\|''\)\.localeCompare\(String\(a\.pledgeDate\|\|''\)\)/, 'En yeni tarih sıralayıcısı tanımlanmalı.');
assert.match(client, /value="date-desc"[^>]*>Taahhüt tarihi: en yeni/, 'En yeni tarih sıralama seçeneği bulunmalı.');
assert.match(client, /value="date-asc"[^>]*>Taahhüt tarihi: en eski/, 'En eski tarih sıralama seçeneği bulunmalı.');

console.log(JSON.stringify({ defaultSort:'date-desc', visibleDateColumn:true, sortOptions:2, ok:true }));
