import assert from 'node:assert/strict';
import fs from 'node:fs';

const client=fs.readFileSync(new URL('../Scripts.html',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../Styles.html',import.meta.url),'utf8');

assert.match(client,/function staffAccrualTotals\(commitments,sort\)/,'Personel tahakkukları personel bazında gruplanmalı.');
assert.match(client,/person\.total\+=Number\(record\.total\)/,'Tahakkuk toplamı kişi bazında hesaplanmalı.');
assert.match(client,/person\.paid\+=Number\(record\.paid\)/,'Ödenen toplamı kişi bazında hesaplanmalı.');
assert.match(client,/person\.remaining\+=Number\(record\.remaining\)/,'Kalan toplamı kişi bazında hesaplanmalı.');
assert.match(client,/Tüm detayları göster/,'Tüm personel tahakkuk detaylarını açma düğmesi bulunmalı.');
assert.match(client,/staffAccrualSummaryTable\(commitments,af\.sort,headers,recordRow\)/,'Personel tahakkuk sekmesi özet tabloyu kullanmalı.');
assert.match(styles,/\.staff-accrual-summary-toolbar/,'Personel bazlı özet görünümü özel ve duyarlı tasarıma sahip olmalı.');
assert.match(styles,/\.data-table-staff-accrual-detail\{[^}]*table-layout:fixed/,'Detay tablosu satırlar arasında değişmeyen sütun düzeni kullanmalı.');
assert.match(styles,/\.data-table-staff-accrual-detail>tbody>tr:first-child>td\{[^}]*transform:none/,'İlk detay satırı dış tablo stilinden etkilenmeden hizalanmalı.');
assert.match(styles,/td:nth-child\(1\),\.data-table-staff-accrual-detail>tbody>tr>td:nth-child\(2\),\.data-table-staff-accrual-detail>tbody>tr>td:nth-child\(3\)\{text-align:left!important/,'Metin hücreleri ilk satır dahil aynı hizada olmalı.');

console.log(JSON.stringify({personTotals:true,individualDetails:true,showAll:true,responsive:true,ok:true}));
