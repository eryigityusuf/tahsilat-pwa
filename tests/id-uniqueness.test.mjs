import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const files = [
  new URL('../Code.gs', import.meta.url),
  new URL('../supabase/functions/tahsilat-api/business.mjs', import.meta.url),
];

test('all server implementations generate IDs with a UUID component', async () => {
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    assert.match(source, /function makeId_\(prefix\)[\s\S]*?Utilities\.getUuid\(\)/);
    assert.doesNotMatch(
      source,
      /function makeId_\(prefix\)[^}]*Math\.floor\(1000\s*\+\s*Math\.random\(\)\s*\*\s*9000\)/,
    );
  }
});

test('the new ID shape remains unique under a large same-second batch', () => {
  const timestamp = '20261114120000';
  const ids = Array.from({ length: 25_000 }, () => {
    const uniquePart = randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase();
    return `TAA-${timestamp}-${uniquePart}`;
  });

  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every((id) => /^TAA-\d{14}-[0-9A-F]{12}$/.test(id)));
});
