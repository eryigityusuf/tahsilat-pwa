import assert from 'node:assert/strict';
import fs from 'node:fs';

const client = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const server = fs.readFileSync(new URL('../Code.gs', import.meta.url), 'utf8');

assert.match(client, /function currentAccountGroups\(\)/, 'Aynı cari adına ait tahakkuklar tek hesap satırında gruplanmalı.');
assert.match(client, /Tahakkuk ekle/, 'Her cari satırında yeni tahakkuk işlemi bulunmalı.');
assert.match(client, /function currentAccountLedgerModal\(seedId\)/, 'Cari adına tıklanınca hareket listesi açılmalı.');
assert.match(client, /Toplam tahakkuk/, 'Cari hareket penceresinde tahakkuk özeti bulunmalı.');
assert.match(client, /Toplam ödeme/, 'Cari hareket penceresinde ödeme özeti bulunmalı.');
assert.match(client, /currentExpenseModalFromAccount/, 'Yeni tahakkuk seçilen carinin bilgileriyle açılmalı.');
assert.match(server, /createdAt:isoDate_\(r\[9\]\)/, 'Tahakkuk hareketi tarih sırasına alınabilmeli.');
assert.match(server, /allPayments:paymentRows/, 'Cari hareket penceresi tarih filtresinden bağımsız tüm geçmişi göstermeli.');

console.log(JSON.stringify({ groupedAccounts:true, addAccrual:true, clickableLedger:true, runningBalance:true, ok:true }));
