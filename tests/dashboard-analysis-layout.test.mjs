import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const start = source.indexOf('function dashboardAnalysisPanel');
const end = source.indexOf('function dashboardMonthKey');
assert.ok(start >= 0 && end > start, 'Gösterge paneli analiz bileşenleri bulunamadı.');

const context = {
  state:{data:{
    referenceTypeAnalysis:[{name:'İHVAN',period:100},{name:'AHAVAT',period:50}],
    activityAnalysis:[{name:'KURBAN',period:125},{name:'BOŞ',period:0}],
    donationAnalysis:[{name:'BAĞIŞ KURBAN',period:75}],
  }},
  esc:value=>String(value ?? ''),
  money:value=>`TL:${Number(value)}`,
  referenceTypeCards:()=>'<div>REFERANS KARTLARI</div>',
  analysisBars:items=>`<div>${items.map(x=>x.name).join('|')}</div>`,
};
vm.createContext(context);
vm.runInContext(source.slice(start,end),context);

const panel=context.dashboardAnalysisPanel(1,'Referans Nevi dağılımı','Açıklama',[{period:100},{period:200},{period:0}],'<b>İçerik</b>','reference');
assert.match(panel,/01/);
assert.match(panel,/2 kategori/);
assert.match(panel,/TL:300/);
assert.match(panel,/dashboard-analysis-total/);

const overview=context.dashboardAnalysisOverview();
assert.match(overview,/dashboard-analysis-columns/);
assert.match(overview,/01/);
assert.match(overview,/02/);
assert.match(overview,/03/);
assert.match(overview,/Faaliyet dağılımı/);
assert.match(overview,/Alt faaliyet dağılımı/);

console.log(JSON.stringify({sections:3,responsiveColumns:true,summaryTotals:true,ok:true}));
