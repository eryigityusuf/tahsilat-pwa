import assert from 'node:assert/strict';
import fs from 'node:fs';

const client=fs.readFileSync(new URL('../Scripts.html',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../Styles.html',import.meta.url),'utf8');

assert.match(client,/function pledgeMultiFilterPicker/, 'Taahhüt kategori filtreleri çoklu seçim sunmalı.');
assert.match(client,/data-pledge-filter-value/, 'Çoklu filtre seçenekleri ayrı ayrı seçilebilmeli.');
assert.match(client,/function pledgeReferenceOptions/, 'Referans alanı mevcut referanslardan açılır öneri listesi oluşturmalı.');
assert.match(client,/function pledgeTrackingOptions/, 'Takip eden alanı mevcut isimlerden açılır öneri listesi oluşturmalı.');
assert.match(client,/suggestField\('TAKİP EDEN','fGroup'/, 'Takip eden alanı açılır öneri listesi kullanmalı.');
assert.match(client,/selectField\('REFERANS NEVİ','fType'/, 'Referans nevi açılır liste olarak kalmalı.');
assert.match(styles,/\.pledge-multi-filter-list/, 'Çoklu filtre listesi görsel düzen taşımalı.');

console.log(JSON.stringify({referenceDropdown:true,trackingDropdown:true,referenceTypeDropdown:true,multiSelectFilters:true,ok:true}));
