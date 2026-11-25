import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const start = source.indexOf('function dashboardMonthKey');
const end = source.indexOf('function dashboardSummaryCards');
assert.ok(start >= 0 && end > start, 'Aylık gösterge paneli işlevleri bulunamadı.');

const context = {
  state: { data: {}, dashboardAccrualMonth:'' },
  money: value => `TL:${Number(value)}`,
  esc: value => String(value ?? ''),
  normalizeSearch: value => String(value ?? '').toLocaleLowerCase('tr-TR').replaceAll('ı','i').replaceAll('ş','s').replaceAll('ğ','g').replaceAll('ü','u').replaceAll('ö','o').replaceAll('ç','c'),
  table: (headers, rows) => `<table data-headers="${headers.join('|')}">${rows.join('')}</table>`,
  renderDashboard: () => {},
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
    payments:[
      { id:'SP-1', commitmentId:'SC-OLD', date:`${previous}-02`, amount:30, accrualPeriod:previous },
      { id:'SP-2', commitmentId:'SC-OLD', date:`${current}-02`, amount:10, accrualPeriod:previous },
      { id:'SP-3', commitmentId:'SC-NEW', date:`${current}-08`, amount:20, accrualPeriod:current },
    ],
    commitments:[
      { id:'SC-OLD', period:previous, dueDate:`${previous}-25`, total:80 },
      { id:'SC-NEW', period:current, dueDate:`${current}-25`, total:100 },
    ],
  },
  teachers: {
    payments:[{ id:'TP-1', commitmentId:'TC-OLD', date:`${current}-03`, amount:50, accrualPeriod:previous }],
    commitments:[
      { id:'TC-OLD', period:previous, dueDate:`${previous}-26`, total:90 },
      { id:'TC-NEW', period:current, dueDate:`${current}-26`, total:90 },
    ],
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
assert.match(html, /Önceki dönemden devir/);
assert.match(html, /Tahakkuk dönemi borcu/);
assert.match(html, /TL:90/, 'Mevcut ay toplam gideri 10 + 20 + 50 + 7 + 3 olmalı.');
assert.match(html, /TL:10/, 'Mevcut ay net sonucu 100 - 90 olmalı.');
assert.match(html, /TL:50/, 'Personel önceki dönem devri 80 - 30 olmalı.');
assert.match(html, /TL:140/, 'Toplam önceki dönem devri 50 + 90 olmalı.');
assert.match(html, /TL:200/, 'Yeni tahakkuklar personel 100 + öğretmen 90 + kurum 10 olmalı.');
assert.match(html, /TL:340/, 'Toplam yükümlülük 140 + 200 olmalı.');
assert.match(html, /TL:250/, 'Ay sonu kalan yükümlülük 340 - 90 olmalı.');
assert.match(html, /TL:60/, 'Veli/öğrenci vadesi gösterilmeli.');
assert.match(html, /TL:12/, 'Gecikmiş veli/öğrenci tutarı gösterilmeli.');

const staffSnapshot=context.dashboardCommitmentSnapshot(context.state.data.staff.commitments,context.state.data.staff.payments,current);
assert.equal(staffSnapshot.carryover,50);
assert.equal(staffSnapshot.currentAccrual,100);
assert.equal(staffSnapshot.paidPrior,10);
assert.equal(staffSnapshot.paidCurrent,20);
assert.equal(staffSnapshot.remaining,120);

console.log(JSON.stringify({ current, previous, ok:true }));
