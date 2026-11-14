import assert from 'node:assert/strict';
import { makeRuntime, digest } from '../supabase/functions/tahsilat-api/runtime.mjs';
import { createBusiness } from '../supabase/functions/tahsilat-api/business.mjs';

const token='running-balance-session';
const future=new Date(Date.now()+60_000).toISOString();
const session={userId:'USR-1',name:'Test Yönetici',email:'test@example.org',role:'YÖNETİCİ',references:[],reference:'',accessRevision:'',validatedAt:Date.now()};
function row(width,values){const result=Array(width).fill('');Object.entries(values).forEach(([index,value])=>result[Number(index)]=value);return result}
const pledge=row(22,{0:'TAA-1',1:2026,2:'PERSONEL',3:'ÖRNEK HESAP',6:'REFERANS',7:14000,8:2000,9:12000,10:'Kısmi',11:'2026-11-01',15:'AKTİF'});
const first=row(26,{0:'THS-1',1:'2026-11-02',2:'TAA-1',3:'ÖRNEK HESAP',4:'PERSONEL',5:'REFERANS',7:1000,11:'2026-11-02T10:00:00Z',14:'ONAYLANDI'});
const pending=row(26,{0:'THS-BEKLEYEN',1:'2026-11-03',2:'TAA-1',3:'ÖRNEK HESAP',4:'PERSONEL',5:'REFERANS',7:500,11:'2026-11-03T10:00:00Z',14:'BEKLİYOR'});
const second=row(26,{0:'THS-2',1:'2026-11-04',2:'TAA-1',3:'ÖRNEK HESAP',4:'PERSONEL',5:'REFERANS',7:1000,11:'2026-11-04T10:00:00Z',14:'ONAYLANDI'});
const sheets={
  'Kullanıcılar':[row(9,{0:'Kullanıcı ID'}),row(9,{0:'USR-1',1:'Test Yönetici',2:'test@example.org',3:'YÖNETİCİ',7:true})],
  'Bağış Türleri':[['Bağış Türü','Aktif'],['PERSONEL',true]],
  'Taahhütler':[row(22,{0:'Taahhüt ID'}),pledge],
  'Tahsilatlar':[row(26,{0:'Tahsilat ID'}),first,pending,second]
};
['Referans Hedefleri','Kasa Banka Hesapları','Borçlar','Borç Geri Ödemeleri','Personel Aylık Planları','Personel Ödemeleri','Personel Ödeme Hareketleri','Öğretmen Aylık Planları','Öğretmen Ödemeleri','Öğretmen Ödeme Hareketleri','Cari Giderler','Cari Ödeme Hareketleri','Fiş Giderleri','Öğrenci Ödeme Planları','Muhasebe Aktarımları','Kullanıcı Tercihleri','İşlem Günlüğü'].forEach(name=>{if(!sheets[name])sheets[name]=[[name+' başlık']]});
const snapshot={initialized:true,revision:1,sheets,sizes:Object.fromEntries(Object.entries(sheets).map(([name,rows])=>[name,rows.length])),props:{TAHSILAT_DB_ID:'supabase',TAHSILAT_DATA_REVISION:'1'},cache:{[digest('session:'+token)]:{value:JSON.stringify(session),expires_at:future}}};
const data=createBusiness(makeRuntime(snapshot)).call('getAppData',[token,{}]);
const byId=Object.fromEntries(data.collections.map(x=>[x.id,x]));

assert.equal(byId['THS-1'].remainingAfter,13000,'İlk 1.000 TL tahsilattan sonra 13.000 TL kalmalı.');
assert.equal(byId['THS-BEKLEYEN'].remainingAfter,13000,'Bekleyen tahsilat bakiyeyi azaltmamalı.');
assert.equal(byId['THS-2'].remainingAfter,12000,'İkinci 1.000 TL tahsilattan sonra 12.000 TL kalmalı.');
assert.equal(byId['THS-2'].remainingAfter,data.pledges[0].remaining,'Son tahsilat bakiyesi taahhüt bakiyesiyle eşleşmeli.');

console.log(JSON.stringify({firstRemaining:13000,pendingRemaining:13000,lastRemaining:12000,ok:true}));
