import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const start = source.indexOf('function collectionAccountingView');
const end = source.indexOf('function collectionColumnDefinitions');
assert.ok(start >= 0 && end > start, 'Tahsilat muhasebe görünümü işlevi bulunamadı.');

const context = {
  state: {
    data: {
      pledges: [{
        id:'TAA-OSMAN', year:2026, activity:'KURBAN', subActivity:'ADAK KURBAN',
        fullName:'OSMAN ÖZEN', reference:'OSMAN ÖZEN', donationType:'İHVAN',
        amount:14000, remaining:0,
      }],
    },
  },
};
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);

const linked = context.collectionAccountingView({
  pledgeId:'TAA-OSMAN', direct:false, activity:'', donationType:'İHVAN',
  fullName:'OSMAN ÖZEN', reference:'OSMAN ÖZEN', amount:14000, date:'2026-11-13',
});
assert.equal(linked.activity, 'KURBAN', 'Bağlı tahsilatın faaliyeti taahhütten okunmalı.');
assert.equal(linked.donationType, 'İHVAN', 'Referans Nevi ayrı alanda korunmalı.');

const direct = context.collectionAccountingView({
  pledgeId:'', direct:true, activity:'GENEL TEBERRU', donationType:'AHAVAT',
  fullName:'DOĞRUDAN TEBERRU', amount:1000, date:'2026-11-13',
});
assert.equal(direct.activity, 'GENEL TEBERRU');
assert.equal(direct.donationType, 'AHAVAT');

const blankDirect = context.collectionAccountingView({
  pledgeId:'', direct:true, activity:'', donationType:'İHVAN',
  fullName:'ESKİ KAYIT', amount:1000, date:'2026-11-13',
});
assert.equal(blankDirect.activity, '', 'Referans Nevi faaliyet yerine kullanılmamalı.');

console.log(JSON.stringify({ linkedActivity:linked.activity, linkedReferenceType:linked.donationType, ok:true }));
