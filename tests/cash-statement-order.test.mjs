import assert from 'node:assert/strict';
import fs from 'node:fs';

const client = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const server = fs.readFileSync(new URL('../Code.gs', import.meta.url), 'utf8');

assert.match(client, /const activeRows=sortedAccounts\.filter\(x=>x\.active\)/, 'Aktif hesaplar ana tabloda ayrılmalı.');
assert.match(client, /<details class="inactive-account-drawer">/, 'Pasif hesaplar kapalı bir bölümde tutulmalı.');
assert.match(client, /Mevcut toplamları etkilemeyen \$\{inactiveRows\.length\} hesap/, 'Pasif hesap bölümünün etkisi açıklanmalı.');
assert.match(server, /function cashMovementDescription_\(primary, details, note\)/, 'Ekstre açıklamaları ortak bir kuralla üretilmeli.');
assert.match(server, /\['Ödeme türü',c\[2\]\],\['Dönem',c\[3\]\]/, 'Personel açıklamasında ödeme türü ve dönem bulunmalı.');
assert.match(server, /\['Ders',c\[2\]\],\['Dönem',c\[3\]\]/, 'Öğretmen açıklamasında ders ve dönem bulunmalı.');
assert.doesNotMatch(server, /'Personel ödemesi',\(r\[3\]\|\|''\)\+' · '\+\(r\[2\]\|\|''\)/, 'İç tahakkuk numarası açıklama olarak gösterilmemeli.');

console.log(JSON.stringify({ inactiveAccountsCollapsed:true, standardizedDescriptions:true, internalIdsHidden:true, ok:true }));
