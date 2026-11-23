import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../Code.gs', import.meta.url), 'utf8');
const target = ['T', new Date(2026, 10, 1), new Date(2026, 10, 30), 'Işık', 100, 200, true, '', '', 'TAHSİLAT'];
const context = vm.createContext({
  APP: { sheets: { referenceTargets: 'targets' } },
  isApproverSession_: () => true,
  optionalDataRows_: () => [target],
  isoDate_: date => date.toISOString().slice(0, 10),
  inRange_: (date, start, end) => date >= start && date <= end,
  cleanText_: (value, length) => String(value ?? '').trim().slice(0, length),
});
const serverFunctions = ['referenceTargetData_', 'referenceTargetType_', 'referenceKey_', 'normalizeKey_', 'isStudentPledgeRow_',
  'collectionApprovalStatus_', 'isCollectionApprovedRow_', 'collectionReferenceType_', 'groupReferenceTypes_', 'referenceHistory_'];
for (const name of serverFunctions) {
  const start = source.indexOf('function ' + name + '(');
  const end = source.indexOf('\n}', start) + 2;
  vm.runInContext(source.slice(start, end), context);
}

const parent = [];
parent[0] = 'VELI';
parent[2] = 'İHVAN';
parent[3] = 'Deniz';
parent[6] = 'Işık';
parent[16] = 'ÖĞRENCİ';
parent[18] = 'Veli Teberrusu';
parent[20] = 'Ayşe';
const student = parent.slice();
student[0] = 'OGRENCI';
student[18] = 'Öğrenci ücreti';
function payment(id, pledgeId, amount, { reference = 'IŞIK', date = new Date(2026, 10, 15), status = 'ONAYLANDI' } = {}) {
  const row = [id, date, pledgeId, 'Deniz', 'GENEL TEBERRU', reference, '', amount];
  row[14] = status;
  return row;
}
const direct = payment('D', '', 70);
direct[25] = 'AHAVAT';
const missingType = payment('B', '', 30);
const approved = payment('A', 'VELI', 160, { reference: '' });
const rows = [direct, missingType, approved, payment('O', 'OGRENCI', 900),
  payment('P', 'VELI', 400, { status: 'BEKLİYOR' }),
  payment('E', 'VELI', 800, { date: new Date(2026, 9, 15) })];
const item = context.referenceTargetData_({}, [parent, student], rows).items[0];
assert.equal(item.actualPledged, 100);
assert.equal(item.actualCollected, 160);
assert.equal(item.collectionRemaining, 40);
assert.equal(item.totalActual, 260);
const excluded = context.referenceTargetData_({}, [parent, student], rows, false).items[0];
assert.equal(excluded.actualPledged, 100);
assert.equal(excluded.actualCollected, 0);
assert.equal(excluded.collectionRemaining, 200);
assert.equal(excluded.totalActual, 100);
const types = context.groupReferenceTypes_([parent], [direct, missingType, approved]);
assert.equal(types.find(item => item.name === 'AHAVAT').period, 70);
assert.equal(types.find(item => item.name === 'Belirtilmemiş').period, 30);
assert.equal(types.find(item => item.name === 'İHVAN').period, 160);

const client = readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const state = { data: { referenceHistory: context.referenceHistory_([parent], [direct]) } };
const ui = vm.createContext({ state });
vm.runInContext(client.split('\n').find(line => line.startsWith('function normalizeSearch')) +
  '\n' + client.slice(client.indexOf('function referenceSuggestions('), client.indexOf('function bindDonationSuggestions(')), ui);
const suggestions = ui.referenceSuggestions('deniz', 'ışık');
assert.equal(suggestions.references.length, 1);
assert.equal(suggestions.groups[0], 'Ayşe');
assert.equal(suggestions.types.length, 2);
assert.equal(ui.referenceSuggestions('başka biri', 'bilinmeyen').types.length, 0);
