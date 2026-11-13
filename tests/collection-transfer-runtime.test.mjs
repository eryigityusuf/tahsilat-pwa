import assert from 'node:assert/strict';
import { makeRuntime, digest } from '../supabase/functions/tahsilat-api/runtime.mjs';
import { createBusiness } from '../supabase/functions/tahsilat-api/business.mjs';

const token='test-session-token';
const future=new Date(Date.now()+60_000).toISOString();
const session={userId:'USR-1',name:'Test Yönetici',email:'test@example.org',role:'YÖNETİCİ',references:[],reference:'',accessRevision:'',validatedAt:Date.now()};

function row(width,values){const result=Array(width).fill('');Object.entries(values).forEach(([index,value])=>result[Number(index)]=value);return result}
function snapshot({linked=false}={}){
  const pledge=row(22,{0:'TAA-1',1:2026,2:'PERSONEL',3:'HESAP SAHİBİ',4:'0500',5:'ÖDEYEN',6:'REFERANS',7:100,8:linked?40:0,9:linked?60:100,10:linked?'Kısmi':'Ödenmedi',11:'2026-11-01',15:'AKTİF',16:'BAĞIŞ',17:'KURBAN',20:'TAKİP'});
  const movement=row(25,{0:linked?'THS-1':'HBG-1',1:'2026-11-14',2:linked?'TAA-1':'',3:linked?'HESAP SAHİBİ':'TEBERRU SAHİBİ',4:linked?'PERSONEL':'İHVAN',5:linked?'REFERANS':'TEBERRU REF',6:'ÖDEYEN',7:linked?40:30,8:'Nakit',9:'Test notu',12:'KASA-1',13:'Nakit Kasa',14:'ONAYLANDI'});
  const sheets={
    'Kullanıcılar':[row(9,{0:'Kullanıcı ID'}),row(9,{0:'USR-1',1:'Test Yönetici',2:'test@example.org',3:'YÖNETİCİ',7:true})],
    'Taahhütler':[row(22,{0:'Taahhüt ID'}),pledge],
    'Tahsilatlar':[row(25,{0:'Tahsilat ID'}),movement],
    'İşlem Günlüğü':[row(6,{0:'Zaman'})]
  };
  return {initialized:true,revision:1,sheets,sizes:Object.fromEntries(Object.entries(sheets).map(([name,rows])=>[name,rows.length])),props:{TAHSILAT_DB_ID:'supabase',TAHSILAT_DATA_REVISION:'1'},cache:{[digest('session:'+token)]:{value:JSON.stringify(session),expires_at:future}}};
}

{
  const runtime=makeRuntime(snapshot({linked:true}));
  const result=createBusiness(runtime).call('convertCollectionToDonation',[token,'THS-1']);
  assert.equal(result.target,'TEBERRU');
  const patch=runtime.patch().rows;
  const movement=patch.find(x=>x.sheet==='Tahsilatlar'&&x.row_number===2)?.cells;
  const pledge=patch.find(x=>x.sheet==='Taahhütler'&&x.row_number===2)?.cells;
  assert.equal(movement[2],'','Tahsilat taahhütten ayrılmalı.');
  assert.equal(pledge[8],0,'Taahhüdün ödeneni sıfırlanmalı.');
  assert.equal(pledge[9],100,'Taahhüdün kalanı geri açılmalı.');
}

{
  const runtime=makeRuntime(snapshot({linked:false}));
  const result=createBusiness(runtime).call('convertDonationToCollection',[token,'HBG-1','TAA-1']);
  assert.equal(result.target,'TAHSİLAT');
  const patch=runtime.patch().rows;
  const movement=patch.find(x=>x.sheet==='Tahsilatlar'&&x.row_number===2)?.cells;
  const pledge=patch.find(x=>x.sheet==='Taahhütler'&&x.row_number===2)?.cells;
  assert.equal(movement[2],'TAA-1','Teberru hedef taahhüde bağlanmalı.');
  assert.equal(movement[3],'HESAP SAHİBİ','Kayıt bilgileri hedef taahhütten alınmalı.');
  assert.equal(pledge[8],30,'Taahhüdün ödeneni artırılmalı.');
  assert.equal(pledge[9],70,'Taahhüdün kalanı azaltılmalı.');
}

console.log(JSON.stringify({ toDonation:true, toCollection:true, financialBalanceVerified:true, ok:true }));
