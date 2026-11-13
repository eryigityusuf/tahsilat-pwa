import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../Code.gs', import.meta.url), 'utf8');
const start = source.indexOf('function groupSubActivities_');
const end = source.indexOf('function groupReferenceTypes_');
assert.ok(start >= 0 && end > start, 'Analiz işlevleri bulunamadı.');

const context = {
  cleanText_: (value, max = 250) => String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max),
  normalizeKey_: value => String(value || '').trim().toLocaleLowerCase('tr-TR'),
  normalizeHeader_: value => String(value || '').trim().toUpperCase()
    .replace(/İ/g, 'I').replace(/Ş/g, 'S').replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U').replace(/Ö/g, 'O').replace(/Ç/g, 'C').replace(/\s+/g, ' '),
};
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);

const pledge = (id, activity, subActivity, type = '') => {
  const row = Array(22).fill('');
  row[0] = id; row[2] = type; row[7] = 100; row[17] = activity; row[18] = subActivity;
  return row;
};
const collection = (id, pledgeId, type, amount, activity = '') => {
  const row = Array(25).fill('');
  row[0] = id; row[2] = pledgeId; row[4] = type; row[7] = amount; row[20] = activity;
  return row;
};

const pledges = [
  pledge('P1', 'KURBAN', 'BAĞIŞ KURBAN'),
  pledge('P2', 'RAMAZAN-I ŞERİF', 'SAHUR'),
  pledge('P3', 'GENEL TEBERRU', 'DİĞER'),
  pledge('P4', 'GENEL TEBERRU', 'GIDA'),
];
const period = [
  collection('C1', 'P1', '', 2000),
  collection('C2', '', 'Kurban', 14000),
  collection('C3', '', 'Kurban', 1000),
  collection('C4', '', 'Kurban', 2000),
  collection('C5', '', 'Diğer', 1808),
  collection('C6', '', 'Gıda', 9270),
  collection('C7', 'P2', '', 200),
];

const activities = context.groupActivities_(pledges, period, period);
const subActivities = context.groupSubActivities_(pledges, period, period);
const sum = items => items.reduce((total, item) => total + Number(item.period || 0), 0);
const byName = (items, name) => items.find(item => context.normalizeHeader_(item.name) === context.normalizeHeader_(name));

assert.equal(sum(activities), 30278, 'Faaliyet toplamı tüm dönem gelirlerini içermeli.');
assert.equal(sum(subActivities), 30278, 'Alt faaliyet toplamı faaliyet toplamına eşit olmalı.');
assert.equal(byName(activities, 'DİĞER').period, 1808, 'Diğer geliri faaliyet toplamından çıkarılmamalı.');
assert.equal(byName(subActivities, 'BAĞIŞ KURBAN').period, 19000, 'Kurban teberruları Bağış Kurban altında birleşmeli.');
assert.equal(byName(subActivities, 'GIDA').period, 9270);
assert.equal(byName(subActivities, 'SAHUR').period, 200);

console.log(JSON.stringify({ activityTotal: sum(activities), subActivityTotal: sum(subActivities), ok: true }));
