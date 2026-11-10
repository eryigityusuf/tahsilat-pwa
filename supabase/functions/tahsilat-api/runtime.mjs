import { Buffer } from 'node:buffer';
import { createHash, randomUUID } from 'node:crypto';

export const digest = value => createHash('sha256').update(String(value), 'utf8').digest('hex');

export function encode(value) {
  if (value instanceof Date) return { $date:value.toISOString() };
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, encode(v)]));
  return value;
}

export function decode(value) {
  if (value && typeof value === 'object' && typeof value.$date === 'string') return new Date(value.$date);
  if (Array.isArray(value)) return value.map(decode);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, decode(v)]));
  return value;
}

const dateFormatters = new Map();
export function formatDate(date, zone, pattern) {
  const value = date instanceof Date ? date : new Date(date);
  if (!Number.isFinite(value.getTime())) throw new Error('Geçersiz tarih.');
  const timeZone = zone || 'Europe/Istanbul';
  let formatter = dateFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-GB', { timeZone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23' });
    dateFormatters.set(timeZone, formatter);
  }
  const parts = Object.fromEntries(formatter.formatToParts(value).map(x => [x.type, x.value]));
  return pattern.replace(/yyyy|MM|dd|HH|mm|ss/g, key => parts[{ yyyy:'year', MM:'month', dd:'day', HH:'hour', mm:'minute', ss:'second' }[key]]);
}

function makeBlob(value, type='application/octet-stream', name='blob') {
  const bytes = value instanceof Uint8Array ? value : value instanceof ArrayBuffer ? new Uint8Array(value) : new TextEncoder().encode(String(value));
  return {
    getBytes:() => [...bytes],
    getDataAsString:() => new TextDecoder().decode(bytes),
    getName:() => name,
    getContentType:() => type
  };
}

export function makeRuntime(snapshot) {
  const sheets = decode(snapshot.sheets || {});
  const props = { ...(snapshot.props || {}) };
  const cache = { ...(snapshot.cache || {}) };
  const sizes = { ...(snapshot.sizes || {}) };
  const changes = new Map();
  const truncations = {};
  const cacheChanges = new Map();
  let propsChanged = false;
  let dataRevision = 0;

  for (const name of Object.keys(sizes)) {
    if (!Array.isArray(sheets[name])) sheets[name] = [];
    while (sheets[name].length < Number(sizes[name] || 0)) sheets[name].push([]);
  }

  const clone = value => decode(encode(value));
  const mark = (name, row) => {
    dataRevision++;
    changes.set(name + '\0' + row, { sheet:name, row_number:row, cells:encode(sheets[name][row - 1] || []) });
  };

  function createWorkbook(initialSheets, persisted, id) {
    const bookSheets = initialSheets;
    function sheet(name) {
      if (!Object.prototype.hasOwnProperty.call(bookSheets, name)) return null;
      const api = {
        getName:() => name,
        setName(next) {
          if (!next || next === name) return api;
          bookSheets[next] = bookSheets[name]; delete bookSheets[name];
          if (persisted) { sizes[next] = sizes[name] || bookSheets[next].length; delete sizes[name]; }
          name = next; return api;
        },
        getLastRow:() => persisted ? Number(sizes[name] ?? bookSheets[name].length) : bookSheets[name].length,
        getLastColumn:() => Math.max(1, ...bookSheets[name].filter(Boolean).map(row => row.length)),
        getMaxRows:() => Math.max(1000, api.getLastRow()),
        insertRowsAfter:() => api,
        setFrozenRows:() => api,
        autoResizeColumns:() => api,
        appendRow(row) {
          bookSheets[name].push(clone(row));
          if (persisted) { sizes[name] = bookSheets[name].length; mark(name, bookSheets[name].length); }
          return api;
        },
        deleteRow(n) {
          if (!Number.isInteger(n) || n < 1 || n > bookSheets[name].length) throw new Error('Geçersiz satır.');
          bookSheets[name].splice(n - 1, 1);
          if (persisted) {
            sizes[name] = bookSheets[name].length;
            for (let i=n; i<=bookSheets[name].length; i++) mark(name, i);
            truncations[name] = bookSheets[name].length;
            changes.delete(name + '\0' + (bookSheets[name].length + 1));
          }
          return api;
        },
        getDataRange() { return api.getRange(1, 1, Math.max(1, api.getLastRow()), api.getLastColumn()); },
        getRange(r, c, h=1, w=1) {
          if (typeof r === 'string') {
            const match = r.match(/^([A-Z]+)(\d+)$/);
            if (!match) throw new Error('Geçersiz aralık.');
            c = [...match[1]].reduce((sum, ch) => sum * 26 + ch.charCodeAt(0) - 64, 0);
            r = Number(match[2]);
          }
          if (![r,c,h,w].every(x => Number.isInteger(x) && x > 0)) throw new Error('Geçersiz aralık.');
          const range = {
            getValues:() => Array.from({ length:h }, (_,i) => Array.from({ length:w }, (_,j) => clone(bookSheets[name][r+i-1]?.[c+j-1] ?? ''))),
            getDisplayValues() { return this.getValues().map(row => row.map(v => v instanceof Date ? formatDate(v, 'Europe/Istanbul', 'dd.MM.yyyy HH:mm:ss') : v == null ? '' : String(v))); },
            getValue() { return this.getValues()[0][0]; },
            getDisplayValue() { const value=this.getValue(); return value instanceof Date ? formatDate(value,'Europe/Istanbul','dd.MM.yyyy HH:mm:ss') : String(value ?? ''); },
            setValue(value) { return this.setValues([[value]]); },
            setNumberFormat() { return this; },
            clearContent() {
              const values = Array.from({ length:h }, () => Array.from({ length:w }, () => ''));
              return this.setValues(values);
            },
            setValues(values) {
              if (values.length !== h || values.some(row => row.length !== w)) throw new Error('Satır/sütun boyutu uyuşmuyor.');
              for (let i=0; i<h; i++) {
                while (bookSheets[name].length < r+i) bookSheets[name].push([]);
                const row = bookSheets[name][r+i-1] || (bookSheets[name][r+i-1] = []);
                for (let j=0; j<w; j++) {
                  while (row.length < c+j) row.push('');
                  row[c+j-1] = clone(values[i][j]);
                }
                if (persisted) { sizes[name] = Math.max(Number(sizes[name] || 0), r+i); mark(name, r+i); }
              }
              return this;
            }
          };
          return range;
        }
      };
      return api;
    }
    return {
      getId:() => id,
      getUrl:() => persisted ? 'supabase://tahsilat' : 'supabase://automatic-backup',
      getSpreadsheetTimeZone:() => 'Europe/Istanbul',
      getSheetByName:sheet,
      getSheets:() => Object.keys(bookSheets).map(sheet),
      insertSheet(name) {
        if (sheet(name)) throw new Error('Sekme zaten var.');
        bookSheets[name] = [];
        if (persisted) sizes[name] = 0;
        return sheet(name);
      }
    };
  }

  const mainWorkbook = createWorkbook(sheets, true, 'supabase');
  const scriptCache = {
    get(key) { const item=cache[digest(key)]; return item && Date.parse(item.expires_at)>Date.now() ? item.value : null; },
    getAll(keys) { return Object.fromEntries(keys.map(key => [key, this.get(key)]).filter(([,value]) => value !== null)); },
    put(key, value, seconds) {
      const item={ key:digest(key), value:String(value), expires_at:new Date(Date.now()+Math.max(1,Number(seconds)||1)*1000).toISOString() };
      cache[item.key]=item; cacheChanges.set(item.key,item);
    },
    putAll(values, seconds) { Object.entries(values || {}).forEach(([key,value]) => this.put(key,value,seconds)); },
    remove(key) { const hashed=digest(key); delete cache[hashed]; cacheChanges.set(hashed,{ key:hashed, value:null, expires_at:null }); }
  };
  const properties = {
    getProperty:key => props[key] ?? null,
    setProperty(key,value) { props[key]=String(value); propsChanged=true; return this; },
    deleteProperty(key) { delete props[key]; propsChanged=true; return this; },
    getProperties:() => ({ ...props })
  };

  return {
    SpreadsheetApp:{
      openById:() => mainWorkbook,
      create(name) { const temporary={ Sheet1:[] }; return createWorkbook(temporary,false,'temporary-'+digest(name).slice(0,12)); },
      flush(){}
    },
    PropertiesService:{ getScriptProperties:() => properties },
    CacheService:{ getScriptCache:() => scriptCache },
    LockService:{ getScriptLock:() => ({ waitLock(){}, tryLock:() => true, releaseLock(){} }) },
    Utilities:{
      getUuid:randomUUID,
      formatDate,
      Charset:{ UTF_8:'utf8' },
      DigestAlgorithm:{ SHA_256:'sha256' },
      computeDigest(_algorithm,value) { return [...createHash('sha256').update(String(value),'utf8').digest()]; },
      base64Encode:value => Buffer.from(value).toString('base64'),
      base64Decode:value => [...Buffer.from(String(value),'base64')],
      newBlob:makeBlob
    },
    MimeType:{ PDF:'application/pdf' },
    getDataRevision:() => dataRevision,
    exportSession(token) { const raw=scriptCache.get('session:'+token); return raw ? JSON.parse(raw) : null; },
    patch:() => ({ rows:[...changes.values()], truncate:truncations, cache:[...cacheChanges.values()], props:propsChanged?props:null })
  };
}
