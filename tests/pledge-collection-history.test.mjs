import assert from 'node:assert/strict';
import fs from 'node:fs';

const client = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../Styles.html', import.meta.url), 'utf8');

assert.match(client, /Tahsilatları göster/, 'Seçili taahhüt işlemlerinde tahsilatları göster düğmesi bulunmalı.');
assert.match(client, /function pledgeCollectionsModal\(id\)/, 'Taahhüt tahsilat geçmişi penceresi tanımlanmalı.');
assert.match(client, /filter\(x=>String\(x\.pledgeId\|\|''\)===String\(id\)\)/, 'Yalnızca seçilen taahhüde bağlı tahsilatlar gösterilmeli.');
assert.match(client, /Onaylanan.*Onay bekleyen.*Güncel kalan/s, 'Pencere tahsilat durum özetlerini göstermeli.');
assert.match(client, /\['Tarih','Tutar','Açıklama','Yöntem','Kasa \/ Banka','Onay','Kalan'\]/, 'Her tahsilatın ardından kalan bakiye gösterilmeli.');
assert.doesNotMatch(client, /\['Tarih','Makbuz No','Tutar'/, 'Tahsilat geçmişinde makbuz numarası öncelikli sütun olmamalı.');
assert.match(client, /\['Tarih','Tutar','Açıklama'/, 'Tutar ve açıklama ilk görünür sütunlarda olmalı.');
assert.match(styles, /\.pledge-collection-summary/, 'Tahsilat geçmişi için duyarlı özet tasarımı bulunmalı.');

console.log(JSON.stringify({ selectedPledgeAction:true, linkedCollections:true, approvalSummary:true, responsive:true, ok:true }));
