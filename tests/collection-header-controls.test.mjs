import assert from 'node:assert/strict';
import fs from 'node:fs';

const client=fs.readFileSync(new URL('../Scripts.html',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../Styles.html',import.meta.url),'utf8');

assert.match(client,/function collectionTable\(columns,rows/, 'Tahsilat tablosu özel sütun başlıklarını kullanmalı.');
assert.match(client,/collectionColumnFilterModal/, 'Her sütundan filtre penceresi açılabilmeli.');
assert.match(client,/hideCollectionColumn/, 'Her sütun başlığından sütun gizlenebilmeli.');
assert.match(client,/Gizli sütunlar \(/, 'Gizlenen sütunları geri açma kontrolü bulunmalı.');
assert.match(client,/Tüm filtreleri temizle/, 'Başlık filtreleri topluca temizlenebilmeli.');
assert.match(styles,/\.column-tool\.active/, 'Etkin sütun filtresi başlıkta görsel olarak belirtilmeli.');
assert.match(styles,/\.data-table-collections th\.column-filtered/, 'Filtrelenmiş sütun başlığı vurgulanmalı.');

console.log(JSON.stringify({headerFilters:true,headerHide:true,restoreHidden:true,activeState:true,ok:true}));
