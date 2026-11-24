import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../Code.gs', import.meta.url), 'utf8');
const context = vm.createContext({
  cleanText_: (value, length) => String(value ?? '').trim().slice(0, length),
});

for (const name of ['referenceKey_', 'personName_', 'personKey_']) {
  const start = source.indexOf('function ' + name + '(');
  const end = source.indexOf('\n}', start) + 2;
  vm.runInContext(source.slice(start, end), context);
}

assert.equal(context.personKey_('Yusuf ERYİĞİT'), context.personKey_('YUSUF ERYİĞİT'));
assert.equal(context.personKey_(' yusuf\u00a0eryiğit '), context.personKey_('YUSUF ERYİĞİT'));
assert.equal(context.personName_('Yusuf ERYİĞİT'), 'YUSUF ERYİĞİT');

assert.match(source, /fullName:personName_\(r\[3\]\)/, 'Taahhüt hesap adları tek biçimde gösterilmeli.');
assert.match(source, /reference:personName_\(r\[6\]\)/, 'Taahhüt referansları tek biçimde gösterilmeli.');
assert.match(source, /function staffPlanDto_\(r\).*name:personName_\(r\[1\]\)/, 'Personel adları tek biçimde gösterilmeli.');
assert.match(source, /function teacherPlanDto_\(r\).*name:personName_\(r\[1\]\)/, 'Öğretmen adları tek biçimde gösterilmeli.');

const client = readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
assert.match(client, /normalizeSearch\(x\.name\)===normalizeSearch\(name\)/, 'Öğretmen seçimleri harf duyarsız olmalı.');
assert.match(client, /const refs=normalizedTextOptions\(/, 'Referans seçenekleri harf duyarsız tekilleştirilmeli.');
