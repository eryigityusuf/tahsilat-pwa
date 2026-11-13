import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const start = source.indexOf('function staffReportItems');
const end = source.indexOf('function staffAccrualReportModal');
assert.ok(start >= 0 && end > start, 'Personel rapor işlevi bulunamadı.');

const context = {
  state: { data: { staff: { commitments: [] } } },
  normalizeSearch: value => String(value || '').trim().toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c'),
};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('function staffPeriodSort'), end), context);

const item = (name, paymentType, period, total) => ({ name, paymentType, period, total, paid: 0, remaining: total });
context.state.data.staff.commitments = [
  item('Ayşe', 'Hediye', '2026-10', 100),
  item('Ayşe', 'Yol', '2026-10', 20),
  item('Ayşe', 'Kira veya Ev Yardımı', '2026-10', 50),
  item('Ayşe', 'Kira veya Ev Yardımı', '2026-11', 60),
  item('Berk', 'Ev Yardımı', '2026-11', 40),
  item('Ayşe', 'Hediye', '2026-11', 110),
];

const report = context.staffReportItems('2026-10');
assert.deepEqual(
  JSON.parse(JSON.stringify(report.map(x => [x.paymentType, x.period, x.total]))),
  [
    ['Hediye', '2026-10', 100],
    ['Kira veya Ev Yardımı', '2026-11', 60],
    ['Yol', '2026-10', 20],
    ['Ev Yardımı', '2026-11', 40],
  ],
  'Rapor seçilen ayın kira dışı tahakkukları ile sonraki ayın kirasını içermeli.',
);
assert.equal(report.reduce((sum, x) => sum + x.total, 0), 220);

console.log(JSON.stringify({ count: report.length, total: 220, ok: true }));
