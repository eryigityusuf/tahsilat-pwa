import assert from 'node:assert/strict';
import { makeRuntime, digest } from '../supabase/functions/tahsilat-api/runtime.mjs';
import { createBusiness } from '../supabase/functions/tahsilat-api/business.mjs';

const token='current-account-session';
const future=new Date(Date.now()+60_000).toISOString();
const session={userId:'USR-1',name:'Test Yönetici',email:'test@example.org',role:'YÖNETİCİ',references:[],reference:'',accessRevision:'',validatedAt:Date.now()};
function row(width,values){const result=Array(width).fill('');Object.entries(values).forEach(([index,value])=>result[Number(index)]=value);return result}
const sheets={
  'Kullanıcılar':[row(9,{0:'Kullanıcı ID'}),row(9,{0:'USR-1',1:'Test Yönetici',2:'test@example.org',3:'YÖNETİCİ',7:true})],
  'Cari Giderler':[row(10,{0:'Cari ID'}),row(10,{0:'CAR-1',1:2026,2:'ÖRNEK CARİ',3:'İaşe',4:1000,5:400,6:600,7:'Kısmi',9:'2026-10-01'}),row(10,{0:'CAR-2',1:2026,2:'ÖRNEK CARİ',3:'Kırtasiye',4:500,5:0,6:500,7:'Ödenmedi',9:'2026-11-01'})],
  'Cari Ödeme Hareketleri':[row(10,{0:'Hareket ID'}),row(10,{0:'CRH-1',1:'2026-10-15',2:'CAR-1',3:'ÖRNEK CARİ',4:400,5:'Nakit',6:'KASA-1',7:'Nakit Kasa'})]
};
['Bağış Türleri','Taahhütler','Tahsilatlar','Referans Hedefleri','Kasa Banka Hesapları','Borçlar','Borç Geri Ödemeleri','Personel Aylık Planları','Personel Ödemeleri','Personel Ödeme Hareketleri','Öğretmen Aylık Planları','Öğretmen Ödemeleri','Öğretmen Ödeme Hareketleri','Fiş Giderleri','Öğrenci Ödeme Planları','Muhasebe Aktarımları','Kullanıcı Tercihleri','İşlem Günlüğü'].forEach(name=>{if(!sheets[name])sheets[name]=[[name+' başlık']]});
const snapshot={initialized:true,revision:1,sheets,sizes:Object.fromEntries(Object.entries(sheets).map(([name,rows])=>[name,rows.length])),props:{TAHSILAT_DB_ID:'supabase',TAHSILAT_DATA_REVISION:'1'},cache:{[digest('session:'+token)]:{value:JSON.stringify(session),expires_at:future}}};
const data=createBusiness(makeRuntime(snapshot)).call('getAppData',[token,{}]);

assert.equal(data.generalExpenses.current.length,2,'Aynı carinin tahakkukları ayrı kayıt olarak korunmalı.');
assert.equal(data.generalExpenses.allPayments.length,1,'Cari ekstresi tüm ödeme hareketlerini almalı.');
assert.equal(data.generalExpenses.current[0].createdAt,'2026-11-01','Tahakkuk tarihi istemciye aktarılmalı.');
assert.equal(data.generalExpenses.summary.currentTotal,1500,'Cari tahakkuk toplamı korunmalı.');
assert.equal(data.generalExpenses.summary.currentRemaining,1100,'Cari kalan toplamı korunmalı.');

console.log(JSON.stringify({ accruals:2,payments:1,total:1500,remaining:1100,ok:true }));
