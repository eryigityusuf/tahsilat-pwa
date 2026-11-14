import assert from 'node:assert/strict';
import fs from 'node:fs';

const client=fs.readFileSync(new URL('../Scripts.html',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../Styles.html',import.meta.url),'utf8');

assert.match(client,/function pledgeTable\(columns,rows/, 'Taahhüt tablosu özel sütun başlıklarını kullanmalı.');
assert.match(client,/function pledgeColumnFilterModal/, 'Her taahhüt sütunundan filtre penceresi açılabilmeli.');
assert.match(client,/function hidePledgeColumn/, 'Her taahhüt sütunu başlıktan gizlenebilmeli.');
assert.match(client,/pledgeDateStart/, 'Taahhüt tarihi sütunu tarih aralığıyla filtrelenebilmeli.');
assert.match(client,/amountMin/, 'Taahhüt tutarı alt ve üst sınırla filtrelenebilmeli.');
assert.match(client,/Gizli sütunlar \(/, 'Gizlenen taahhüt sütunları geri açılabilmeli.');
assert.match(styles,/\.data-table-pledges th\.column-filtered/, 'Filtrelenmiş taahhüt sütunu vurgulanmalı.');

console.log(JSON.stringify({pledgeHeaderFilters:true,pledgeHeaderHide:true,dateRange:true,amountRange:true,ok:true}));
