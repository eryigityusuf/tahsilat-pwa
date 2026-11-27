import assert from 'node:assert/strict';
import fs from 'node:fs';
import { makeRuntime, digest } from '../supabase/functions/tahsilat-api/runtime.mjs';
import { createBusiness } from '../supabase/functions/tahsilat-api/business.mjs';

const client=fs.readFileSync(new URL('../Scripts.html',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../Styles.html',import.meta.url),'utf8');
assert.match(client,/\['KASA','BANKA','ÇEK'\]/,'Cari ve fiş ödemelerinde Çek hesabı seçilebilmeli.');
assert.match(client,/function currentAccountKey\(value\)\{return normalizeSearch\(value\)/,'Cari adları Türkçe büyük-küçük harf farkından bağımsız gruplanmalı.');
assert.match(client,/function currentExpensePaymentModal[\s\S]*?const groups=currentAccountGroups\(\)/,'Cari ödeme seçimi tahakkukları değil tekil firma hesaplarını göstermeli.');
assert.match(client,/Alacaklı/,'Fazla ödeme cari alacak durumu olarak gösterilmeli.');
assert.match(styles,/\.money,[^\n]+font-family:Cambria,"Times New Roman",Georgia,serif/,'Parasal sayılar klasik yazı karakteri kullanmalı.');

const token='check-account-session';
const future=new Date(Date.now()+60_000).toISOString();
const session={userId:'USR-1',name:'Test Yönetici',email:'test@example.org',role:'YÖNETİCİ',references:[],reference:'',accessRevision:'',validatedAt:Date.now()};
function row(width,values={}){const result=Array(width).fill('');Object.entries(values).forEach(([index,value])=>result[Number(index)]=value);return result}
const sheets={
  'Kullanıcılar':[row(9,{0:'Kullanıcı ID'}),row(9,{0:'USR-1',1:'Test Yönetici',2:'test@example.org',3:'YÖNETİCİ',7:true})],
  'Bağış Türleri':[['Bağış Türü','Aktif'],['GENEL BAĞIŞ',true]],
  'Taahhütler':[row(22,{0:'Taahhüt ID'}),row(22,{0:'TAA-1',1:2026,2:'GENEL BAĞIŞ',3:'TEST BAĞIŞÇI',6:'TEST REFERANS',7:1000,8:0,9:1000,10:'Ödenmedi',11:'2026-11-01',15:'AKTİF',17:'GENEL TEBERRU',18:'GENEL BAĞIŞ'})],
  'Tahsilatlar':[row(25,{0:'Tahsilat ID'})],
  'Kasa Banka Hesapları':[row(10,{0:'Hesap ID'}),row(10,{0:'HSP-CEK',1:'Çek Portföyü',2:'ÇEK',3:500000,4:true}),row(10,{0:'HSP-NAKIT',1:'Nakit Kasa',2:'KASA',3:1000,4:true})],
  'Hesap Transferleri':[row(19,{0:'Transfer ID'})],
  'Cari Giderler':[row(10,{0:'Cari ID'}),row(10,{0:'CAR-1',1:2026,2:'AKDENİZ TOROS',3:'İaşe',4:86000,5:0,6:86000,7:'Ödenmedi',9:'2026-11-01'})],
  'Cari Ödeme Hareketleri':[row(10,{0:'Hareket ID'})],
  'İşlem Günlüğü':[row(6,{0:'Zaman'})]
};
['Referans Hedefleri','Borçlar','Borç Geri Ödemeleri','Personel Aylık Planları','Personel Ödemeleri','Personel Ödeme Hareketleri','Öğretmen Aylık Planları','Öğretmen Ödemeleri','Öğretmen Ödeme Hareketleri','Fiş Giderleri','Öğrenci Ödeme Planları','Muhasebe Aktarımları','Kullanıcı Tercihleri'].forEach(name=>{if(!sheets[name])sheets[name]=[[name+' başlık']]});
const snapshot={initialized:true,revision:1,sheets,sizes:Object.fromEntries(Object.entries(sheets).map(([name,rows])=>[name,rows.length])),props:{TAHSILAT_DB_ID:'supabase',TAHSILAT_DATA_REVISION:'1'},cache:{[digest('session:'+token)]:{value:JSON.stringify(session),expires_at:future}}};
const runtime=makeRuntime(snapshot);
const business=createBusiness(runtime);

business.call('saveCollection',[token,{pledgeId:'TAA-1',amount:250,date:'2026-11-27',method:'Çek',accountId:'HSP-CEK',checkNo:'CHK-001',checkDueDate:'2026-12-15',checkDrawer:'TEST KEŞİDECİ',checkBank:'TEST BANKA',note:'Çek tahsilatı'}]);
business.call('saveCurrentExpensePayment',[token,{currentId:'CAR-1',amount:200000,date:'2026-11-27',accountId:'HSP-CEK',note:'Fazla ödeme ile cari alacak'}]);
const savedCheckId=runtime.patch().rows.find(x=>x.sheet==='Tahsilatlar'&&x.row_number===2)?.cells?.[0];
business.call('saveAccountTransfer',[token,{sourceAccountId:'HSP-CEK',targetAccountId:'HSP-NAKIT',amount:250,date:'2026-12-15',checkId:savedCheckId,note:'Çek tahsili'}]);

const patchRows=runtime.patch().rows;
const collection=patchRows.find(x=>x.sheet==='Tahsilatlar'&&x.row_number===2)?.cells;
const currentPayment=patchRows.find(x=>x.sheet==='Cari Ödeme Hareketleri'&&x.row_number===2)?.cells;
const accountTransfer=patchRows.find(x=>x.sheet==='Hesap Transferleri'&&x.row_number===2)?.cells;
assert.equal(collection?.[8],'Çek','Tahsilat yöntemi Çek olarak kaydedilmeli.');
assert.equal(collection?.[12],'HSP-CEK','Tahsilat Çek hesabına bağlanmalı.');
assert.equal(currentPayment?.[5],'Çek','Cari ödeme yöntemi hesap türünden Çek olarak üretilmeli.');
assert.equal(currentPayment?.[6],'HSP-CEK','Cari ödeme Çek hesabından düşmeli.');
assert.equal(accountTransfer?.[2],'HSP-CEK','Tahsil edilen çek Çek hesabından çıkmalı.');
assert.equal(accountTransfer?.[4],'HSP-NAKIT','Tahsil edilen çek Nakit Kasaya girmeli.');

const data=business.call('getAppData',[token,{}]);
assert.ok(data.methods.includes('Çek'),'Çek yöntemi kullanıcı arayüzüne gönderilmeli.');
assert.equal(data.cash.checks[0].status,'TAHSİL EDİLDİ','Tahsil edilen çek portföyde kapalı görünmeli.');
assert.equal(data.generalExpenses.summary.currentRemaining,0,'Fazla ödemede cari borç bakiyesi sıfırlanmalı.');
assert.equal(data.generalExpenses.summary.currentCredit,114000,'86.000 TL borca 200.000 TL ödeme 114.000 TL cari alacak üretmeli.');
console.log(JSON.stringify({checkCollection:true,checkPayment:true,classicNumbers:true,currentGrouping:true,currentCredit:114000,ok:true}));
