import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const client = readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const server = readFileSync(new URL('../Code.gs', import.meta.url), 'utf8');

assert.match(client, /openDashboardAnalysisDetail\('reference'/, 'Referans Nevi kalemleri tıklanabilir olmalı.');
assert.match(client, /analysisBars\(activities,'activity'\)/, 'Faaliyet kalemleri detay penceresini açmalı.');
assert.match(client, /analysisBars\(subActivities,'subactivity'\)/, 'Alt faaliyet kalemleri detay penceresini açmalı.');
assert.match(client, /Teberruyu.*düzelt/, 'Doğrudan teberru detayında düzeltme düğmesi bulunmalı.');
assert.match(client, /Taahhüdü düzelt/, 'Bağlı tahsilatta taahhüt düzeltme düğmesi bulunmalı.');
assert.match(client, /inputField\('Faaliyet','fActivity'.*GENEL TEBERRU.*readonly/, 'Teberru faaliyeti Genel Teberru olarak sabit olmalı.');
assert.match(client, /selectField\('Alt Faaliyet','fType',state\.data\.donationTypes\)/, 'Alt faaliyet mevcut türlerden seçilmeli.');
assert.match(server, /collectionIds:\[\]/, 'Sunucu analiz kalemlerine hareket kimliklerini eklemeli.');
assert.match(server, /return 'GENEL TEBERRU'/, 'Eski doğrudan teberrular ana faaliyette Genel Teberru olmalı.');

console.log(JSON.stringify({clickableAnalysis:true,editableDetails:true,generalDonationActivity:true,ok:true}));
