import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const start = source.indexOf('function dashboardMonthKey');
const end = source.indexOf('function dashboardSummaryCards');
assert.ok(start >= 0 && end > start, 'Aylık gösterge paneli işlevleri bulunamadı.');

const context = {
  state: { data: {} },
  money: value => `TL:${Number(value)}`,
  table: (headers, rows) => `<table data-headers="${headers.join('|')}">${rows.join('')}</table>`,
};
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);

const current = context.dashboardMonthInfo(0).key;
const previous = context.dashboardMonthInfo(-1).key;
context.state.data = {
  collections: [
    { date:`${current}-05`, amount:100, approvalStatus:'ONAYLANDI' },
    { date:`${previous}-05`, amount:50, approvalStatus:'ONAYLANDI' },
    { date:`${current}-06`, amount:999, approvalStatus:'BEKLİYOR' },
  ],
  staff: {
    payments:[{ date:`${current}-02`, amount:10 }, { date:`${previous}-02`, amount:5 }],
    commitments:[{ dueDate:`${current}-25`, total:80 }],
  },
  teachers: {
    payments:[{ date:`${current}-03`, amount:20 }],
    commitments:[{ dueDate:`${current}-26`, total:90 }],
  },
  generalExpenses: {
    payments:[{ date:`${current}-04`, amount:7 }],
    receipts:[{ date:`${current}-04`, amount:3 }],
  },
  students: {
    summary:{ overdue:12, overdueCount:2 },
    accruals:[{ paymentPlan:{ schedule:[{ dueDate:`${current}-15`, amount:60 }] } }],
  },
};

const html = context.dashboardMonthlyAnalysis();
assert.match(html, /Personel gideri/);
assert.match(html, /Öğretmen gideri/);
assert.match(html, /Kurum gideri/);
assert.match(html, /Veli \/ öğrenci ödeme vadesi/);
assert.match(html, />TL:40</, 'Mevcut ay toplam gideri 10 + 20 + 7 + 3 olmalı.');
assert.match(html, />TL:60</, 'Mevcut ay net sonucu 100 - 40 olmalı.');
assert.match(html, />TL:80</, 'Personel tahakkuk vadesi gösterilmeli.');
assert.match(html, />TL:90</, 'Öğretmen tahakkuk vadesi gösterilmeli.');
assert.match(html, />TL:12</, 'Gecikmiş veli/öğrenci tutarı gösterilmeli.');

console.log(JSON.stringify({ current, previous, ok:true }));
