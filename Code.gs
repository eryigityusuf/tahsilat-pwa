const APP = Object.freeze({
  name: 'Tahsilat Yönetimi',
  dbProperty: 'TAHSILAT_DB_ID',
  sessionSeconds: 21600,
  appDataCacheSeconds: 300,
  cacheSchemaVersion: 16,
  dataRevisionProperty: 'TAHSILAT_DATA_REVISION',
  sheets: {
    users: 'Kullanıcılar',
    types: 'Bağış Türleri',
    pledges: 'Taahhütler',
    collections: 'Tahsilatlar',
    referenceTargets: 'Referans Hedefleri',
    cashAccounts: 'Kasa Banka Hesapları',
    loans: 'Borçlar',
    loanRepayments: 'Borç Geri Ödemeleri',
    staffPlans: 'Personel Aylık Planları',
    staffCommitments: 'Personel Ödemeleri',
    staffPayments: 'Personel Ödeme Hareketleri',
    teacherPlans: 'Öğretmen Aylık Planları',
    teacherCommitments: 'Öğretmen Ödemeleri',
    teacherPayments: 'Öğretmen Ödeme Hareketleri',
    studentPlans: 'Öğrenci Ödeme Planları',
    accountingImports: 'Muhasebe Aktarımları',
    userPreferences: 'Kullanıcı Tercihleri',
    audit: 'İşlem Günlüğü'
  }
});

const HEADERS = Object.freeze({
  users: ['Kullanıcı ID','Ad Soyad','E-posta','Rol','Referans Adı','PIN Salt','PIN Özeti','Aktif','Oluşturma Tarihi'],
  types: ['Bağış Türü','Aktif'],
  pledges: ['Taahhüt ID','Yıl','Bağış Türü','Ad Soyad','Telefon','Ödeyen','Referans','Taahhüt Tutarı','Ödenen','Kalan','Durum','Taahhüt Tarihi','Oluşturan','Oluşturma Zamanı','Personel','Alacak Durumu','Kayıt Kaynağı','Faaliyet','Alt Faaliyet','Hesap Kodu','Grubu','Notlar'],
  collections: ['Tahsilat ID','Tarih','Taahhüt ID','Ad Soyad','Bağış Türü','Referans','Ödeyen','Tutar','Ödeme Yöntemi','Açıklama','Oluşturan','Oluşturma Zamanı','Hesap ID','Hesap Adı','Onay Durumu','Onaylayan','Onay Zamanı','Red Nedeni','Makbuz No','Grubu','Faaliyet','Telefon'],
  referenceTargets: ['Hedef ID','Başlangıç','Bitiş','Referans','Teberru Hedefi','Tahsilat Hedefi','Aktif','Açıklama','Oluşturma Zamanı','Hedef Türü'],
  cashAccounts: ['Hesap ID','Hesap Adı','Hesap Türü','Açılış Bakiyesi','Aktif','Açıklama','Oluşturma Zamanı'],
  loans: ['Borç ID','Alım Tarihi','Borç Veren','Alınan Tutar','Geri Ödenen','Kalan Borç','Durum','Hesap ID','Hesap Adı','Açıklama','Oluşturma Zamanı'],
  loanRepayments: ['Hareket ID','Tarih','Borç ID','Borç Veren','Tutar','Ödeme Yöntemi','Açıklama','Oluşturma Zamanı','Hesap ID','Hesap Adı'],
  staffPlans: ['Plan ID','Personel','Ödeme Türü','Aylık Tutar','Aktif','Açıklama','Oluşturma Zamanı'],
  staffCommitments: ['Ödeme ID','Personel','Ödeme Türü','Dönem','Toplam Tutar','Ödenen','Kalan','Vade Tarihi','Durum','Açıklama','Oluşturma Zamanı','Plan ID'],
  staffPayments: ['Hareket ID','Tarih','Ödeme ID','Personel','Tutar','Ödeme Yöntemi','Açıklama','Oluşturma Zamanı','Hesap ID','Hesap Adı'],
  teacherPlans: ['Plan ID','Öğretmen','Ders Adı','Aylık Ders Saati','Saatlik Ücret','Aktif','Açıklama','Oluşturma Zamanı'],
  teacherCommitments: ['Ödeme ID','Öğretmen','Ders Adı','Dönem','Toplam Tutar','Ödenen','Kalan','Vade Tarihi','Durum','Açıklama','Oluşturma Zamanı','Ders Saati','Saatlik Ücret','Plan ID'],
  teacherPayments: ['Hareket ID','Tarih','Ödeme ID','Öğretmen','Tutar','Ödeme Yöntemi','Açıklama','Oluşturma Zamanı','Hesap ID','Hesap Adı'],
  studentPlans: ['Plan ID','Tahakkuk ID','Toplam Bedel','Peşinat','Taksit Sayısı','İlk Taksit Tarihi','Aylık Taksit','Oluşturma Zamanı','Güncelleme Zamanı'],
  accountingImports: ['Muhasebe Kayıt No','İşlem Türü','Sistem Kayıt No','Tarih','Tutar','Aktaran','Aktarım Zamanı'],
  userPreferences: ['Kullanıcı ID','Tercih Anahtarı','Değer','Güncelleme Zamanı'],
  audit: ['Zaman','Kullanıcı','İşlem','Kayıt Türü','Kayıt ID','Detay']
});

const STAFF_PAYMENT_TYPES = Object.freeze([
  'Hediye',
  'Kira veya Ev Yardımı',
  'Yol',
  'Sosyal Yardım'
]);
const PLEDGE_COLUMN_KEYS = Object.freeze(['select','year','activity','subActivity','accountCode','fullName','payer','phone','reference','donationType','group','amount','paid','remaining','notes']);
const COLLECTION_COLUMN_KEYS = Object.freeze(['year','activity','subActivity','accountCode','fullName','payer','phone','reference','donationType','group','accrual','paid','remaining','notes','date','receiptNo','id','method','accountName','approvalStatus','actions']);

let REQUEST_DB_CACHE_ = null;
let REQUEST_ROWS_CACHE_ = {};

function resetRequestCache_() {
  REQUEST_ROWS_CACHE_ = {};
}

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle(APP.name)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** İlk kurulumda yalnızca bir kez Apps Script düzenleyicisinden çalıştırın. */
function setupSystem(adminName, adminEmail, adminPin) {
  resetRequestCache_();
  REQUEST_DB_CACHE_ = null;
  adminName = cleanText_(adminName, 100);
  adminEmail = normalizeEmail_(adminEmail);
  validatePin_(adminPin);
  if (!adminName || !adminEmail) throw new Error('Yönetici adı ve e-posta zorunludur.');

  const props = PropertiesService.getScriptProperties();
  if (props.getProperty(APP.dbProperty)) throw new Error('Sistem daha önce kurulmuş.');

  const ss = SpreadsheetApp.create(APP.name + ' Veritabanı');
  props.setProperty(APP.dbProperty, ss.getId());
  props.setProperty(APP.dataRevisionProperty, newDataRevision_());
  const first = ss.getSheets()[0];
  first.setName(APP.sheets.users);
  createSheet_(ss, APP.sheets.users, HEADERS.users, first);
  createSheet_(ss, APP.sheets.types, HEADERS.types);
  createSheet_(ss, APP.sheets.pledges, HEADERS.pledges);
  createSheet_(ss, APP.sheets.collections, HEADERS.collections);
  createSheet_(ss, APP.sheets.referenceTargets, HEADERS.referenceTargets);
  createSheet_(ss, APP.sheets.cashAccounts, HEADERS.cashAccounts);
  createSheet_(ss, APP.sheets.loans, HEADERS.loans);
  createSheet_(ss, APP.sheets.loanRepayments, HEADERS.loanRepayments);
  createSheet_(ss, APP.sheets.staffPlans, HEADERS.staffPlans);
  createSheet_(ss, APP.sheets.staffCommitments, HEADERS.staffCommitments);
  createSheet_(ss, APP.sheets.staffPayments, HEADERS.staffPayments);
  createSheet_(ss, APP.sheets.teacherPlans, HEADERS.teacherPlans);
  createSheet_(ss, APP.sheets.teacherCommitments, HEADERS.teacherCommitments);
  createSheet_(ss, APP.sheets.teacherPayments, HEADERS.teacherPayments);
  createSheet_(ss, APP.sheets.studentPlans, HEADERS.studentPlans);
  createSheet_(ss, APP.sheets.accountingImports, HEADERS.accountingImports);
  createSheet_(ss, APP.sheets.userPreferences, HEADERS.userPreferences);
  createSheet_(ss, APP.sheets.audit, HEADERS.audit);
  seedCashAccounts_(ss);

  const types = ['Kurban','İftar','Zekât','Sadaka','Fitre','Eğitim','Gıda','Genel Bağış','Diğer'];
  ss.getSheetByName(APP.sheets.types).getRange(2, 1, types.length, 2).setValues(types.map(x => [x, true]));
  const salt = Utilities.getUuid();
  ss.getSheetByName(APP.sheets.users).appendRow([
    makeId_('USR'), adminName, adminEmail, 'YÖNETİCİ', adminName,
    salt, hashPin_(adminPin, salt), true, new Date()
  ]);
  audit_(adminEmail, 'SİSTEM_KURULDU', 'Sistem', ss.getId(), 'İlk yönetici oluşturuldu.');
  return { spreadsheetId: ss.getId(), spreadsheetUrl: ss.getUrl() };
}

/** Daha önce kurulmuş sisteme yeni aylık plan sayfasını ve Plan ID sütununu ekler. */
function upgradeSystem() {
  resetRequestCache_();
  const ss = getDb_();
  if (!ss.getSheetByName(APP.sheets.cashAccounts)) createSheet_(ss, APP.sheets.cashAccounts, HEADERS.cashAccounts);
  if (!ss.getSheetByName(APP.sheets.referenceTargets)) createSheet_(ss, APP.sheets.referenceTargets, HEADERS.referenceTargets);
  if (!ss.getSheetByName(APP.sheets.loans)) createSheet_(ss, APP.sheets.loans, HEADERS.loans);
  if (!ss.getSheetByName(APP.sheets.loanRepayments)) createSheet_(ss, APP.sheets.loanRepayments, HEADERS.loanRepayments);
  seedCashAccounts_(ss);
  if (!ss.getSheetByName(APP.sheets.staffPlans)) createSheet_(ss, APP.sheets.staffPlans, HEADERS.staffPlans);
  if (!ss.getSheetByName(APP.sheets.teacherPlans)) createSheet_(ss, APP.sheets.teacherPlans, HEADERS.teacherPlans);
  if (!ss.getSheetByName(APP.sheets.accountingImports)) createSheet_(ss, APP.sheets.accountingImports, HEADERS.accountingImports);
  if (!ss.getSheetByName(APP.sheets.studentPlans)) createSheet_(ss, APP.sheets.studentPlans, HEADERS.studentPlans);
  if (!ss.getSheetByName(APP.sheets.userPreferences)) createSheet_(ss, APP.sheets.userPreferences, HEADERS.userPreferences);
  const referenceTargets = ss.getSheetByName(APP.sheets.referenceTargets);
  if (referenceTargets.getLastColumn() < HEADERS.referenceTargets.length) {
    const start = referenceTargets.getLastColumn() + 1;
    const added = HEADERS.referenceTargets.slice(start - 1);
    referenceTargets.getRange(1, start, 1, added.length).setValues([added]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
  }
  referenceTargets.getRange(1, 10).setValue('Hedef Türü').setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
  referenceTargets.getRange(1, 5).setValue('Teberru Hedefi').setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
  if (referenceTargets.getLastRow() > 1) {
    const typeRange = referenceTargets.getRange(2, 10, referenceTargets.getLastRow() - 1, 1);
    typeRange.setValues(typeRange.getValues().map(function(r) { return [referenceTargetType_(r[0])]; }));
  }
  const commitments = ss.getSheetByName(APP.sheets.staffCommitments);
  if (commitments.getLastColumn() < HEADERS.staffCommitments.length) {
    commitments.getRange(1, HEADERS.staffCommitments.length).setValue('Plan ID').setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
  }
  const teacherCommitments = ss.getSheetByName(APP.sheets.teacherCommitments);
  if (teacherCommitments.getLastColumn() < HEADERS.teacherCommitments.length) {
    const start = teacherCommitments.getLastColumn() + 1;
    const added = HEADERS.teacherCommitments.slice(start - 1);
    teacherCommitments.getRange(1, start, 1, added.length).setValues([added]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
  }
  const pledges = ss.getSheetByName(APP.sheets.pledges);
  if (pledges.getLastColumn() < HEADERS.pledges.length) {
    const start = pledges.getLastColumn() + 1;
    const added = HEADERS.pledges.slice(start - 1);
    pledges.getRange(1, start, 1, added.length).setValues([added]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
  }
  pledges.getRange(1, 17).setValue(HEADERS.pledges[16]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
  if (pledges.getLastRow() > 1) {
    const sourceRange = pledges.getRange(2, 17, pledges.getLastRow() - 1, 1);
    const sourceValues = sourceRange.getValues().map(function(r) { return [cleanText_(r[0], 30) || 'BAĞIŞ']; });
    sourceRange.setValues(sourceValues);
  }
  const collections = ss.getSheetByName(APP.sheets.collections);
  if (collections.getLastColumn() < HEADERS.collections.length) {
    const start = collections.getLastColumn() + 1;
    const added = HEADERS.collections.slice(start - 1);
    collections.getRange(1, start, 1, added.length).setValues([added]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
  }
  if (collections.getLastRow() > 1) {
    const approvalRange = collections.getRange(2, 15, collections.getLastRow() - 1, 4);
    const approvalValues = approvalRange.getValues().map(function(r) {
      const approvalStatus = cleanText_(r[0], 30);
      if (approvalStatus) {
        return [approvalStatus, cleanText_(r[1], 120), r[2] || '', cleanText_(r[3], 300)];
      }
      return ['ONAYLANDI', 'SİSTEM GEÇİŞİ', new Date(), ''];
    });
    approvalRange.setValues(approvalValues);
  }
  migrateCollectionAccounts_(ss);
  [APP.sheets.staffPayments, APP.sheets.teacherPayments].forEach(function(sheetName) {
    const sh = ss.getSheetByName(sheetName);
    const headers = sheetName === APP.sheets.staffPayments ? HEADERS.staffPayments : HEADERS.teacherPayments;
    if (sh.getLastColumn() < headers.length) {
      const start = sh.getLastColumn() + 1;
      const added = headers.slice(start - 1);
      sh.getRange(1, start, 1, added.length).setValues([added]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
    }
    migrateExpensePaymentAccounts_(sh);
  });
  invalidateAppDataCache_();
  return 'Sistem güncellendi.';
}

/** Faaliyeti Veli Teberrusu olan mevcut taahhütlerin alt faaliyetini aynı ada getirir. */
function setVeliTeberrusuSubActivities() {
  resetRequestCache_();
  const sh = getDb_().getSheetByName(APP.sheets.pledges);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return { updated:0, matched:0 };

  const range = sh.getRange(2, 18, lastRow - 1, 2);
  const values = range.getValues();
  const targetKey = normalizeKey_('Veli Teberrusu');
  let matched = 0;
  let updated = 0;

  values.forEach(function(row) {
    if (normalizeKey_(row[0]) !== targetKey) return;
    matched++;
    if (cleanText_(row[1], 120) === 'Veli Teberrusu') return;
    row[1] = 'Veli Teberrusu';
    updated++;
  });

  if (updated) range.setValues(values);
  invalidateAppDataCache_();
  audit_(Session.getEffectiveUser().getEmail() || 'SİSTEM', 'TOPLU_GÜNCELLENDİ', 'Taahhütler', '', updated + ' Veli Teberrusu alt faaliyeti güncellendi');
  Logger.log(JSON.stringify({ updated:updated, matched:matched }));
  return { updated:updated, matched:matched };
}

/** Mevcut tahsilatların gününü koruyarak tarihlerini Ekim 2026'ya taşır. */
function moveExistingCollectionsToOctober2026() {
  resetRequestCache_();
  const sh = getDb_().getSheetByName(APP.sheets.collections);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return { updated:0, skipped:0, period:'2026-10' };
  const range = sh.getRange(2, 2, lastRow - 1, 1);
  const values = range.getValues();
  let updated = 0;
  let skipped = 0;
  const mapped = values.map(function(row) {
    const source = row[0] instanceof Date ? row[0] : new Date(row[0]);
    if (isNaN(source.getTime())) {
      skipped++;
      return [row[0]];
    }
    updated++;
    return [new Date(2026, 9, source.getDate(), 12, 0, 0, 0)];
  });
  range.setValues(mapped);
  audit_('SİSTEM', 'TOPLU_TARİH_GÜNCELLENDİ', 'Tahsilatlar', '2026-10', updated + ' tahsilat Ekim 2026 dönemine taşındı; ' + skipped + ' kayıt atlandı.');
  return { updated:updated, skipped:skipped, period:'2026-10' };
}

/**
 * Mevcut listenizi topluca aktarır. Kaynak başlıklar:
 * YIL, BAĞIŞ TÜRÜ, ADI SOYADI, TELEFONU, ÖDEYEN, REFERANS, MİKTARI, ÖDENEN, KALAN.
 * Apps Script düzenleyicisinden bir kez çalıştırılır.
 */
function importExistingPledges(sourceSpreadsheetId, sourceSheetName) {
  resetRequestCache_();
  const source = SpreadsheetApp.openById(String(sourceSpreadsheetId || '').trim());
  const sh = source.getSheetByName(sourceSheetName);
  if (!sh) throw new Error('Kaynak sayfa bulunamadı.');
  const values = sh.getDataRange().getValues();
  if (values.length < 2) throw new Error('Kaynak listede aktarılacak satır yok.');
  const headers = values[0].map(normalizeHeader_);
  const col = {};
  headers.forEach((h, i) => col[h] = i);
  const required = ['YIL','BAGIS TURU','ADI SOYADI','MIKTARI'];
  required.forEach(h => { if (col[h] == null) throw new Error('Eksik başlık: ' + h); });

  const pledgeRows = [];
  const collectionRows = [];
  let skipped = 0;
  values.slice(1).forEach(r => {
    const amount = flexibleNumber_(r[col['MIKTARI']]) || 0;
    const fullName = cleanText_(r[col['ADI SOYADI']], 120);
    if (amount <= 0 || !fullName) { skipped++; return; }
    const year = Number(r[col['YIL']]) || new Date().getFullYear();
    const paidInput = col['ODENEN'] == null ? 0 : flexibleNumber_(r[col['ODENEN']]) || 0;
    const remainingInput = col['KALAN'] == null ? null : flexibleNumber_(r[col['KALAN']]);
    const paid = Math.max(0, Math.min(amount, paidInput || (isFinite(remainingInput) ? amount - remainingInput : 0)));
    const remaining = Math.max(0, amount - paid);
    const id = makeId_('TAA');
    const pledgeDate = new Date(year, 0, 1, 12, 0, 0);
    const type = cleanText_(r[col['BAGIS TURU']], 80);
    const reference = col['REFERANS'] == null ? '' : cleanText_(r[col['REFERANS']], 100);
    const payer = col['ODEYEN'] == null ? '' : cleanText_(r[col['ODEYEN']], 120);
    pledgeRows.push([
      id, year, type, fullName,
      col['TELEFONU'] == null ? '' : cleanText_(r[col['TELEFONU']], 30), payer, reference,
      amount, paid, remaining, remaining <= 0 ? 'Kapandı' : (paid > 0 ? 'Kısmi' : 'Ödenmedi'),
      pledgeDate, 'TOPLU_AKTARIM', new Date(),
      col['PERSONEL'] == null ? '' : cleanText_(r[col['PERSONEL']], 120), 'AKTİF', 'BAĞIŞ', '', '', '', '', ''
    ]);
    if (paid > 0) collectionRows.push([
      makeId_('THS'), pledgeDate, id, fullName, type, reference, payer, paid,
      'Devir', 'Mevcut listeden açılış tahsilatı', 'TOPLU_AKTARIM', new Date(), 'HSP-DEVIR', 'Devir / Belirsiz', 'ONAYLANDI', 'TOPLU_AKTARIM', new Date(), ''
    ]);
  });

  withLock_(function() {
    const db = getDb_();
    if (pledgeRows.length) {
      const target = db.getSheetByName(APP.sheets.pledges);
      target.getRange(target.getLastRow() + 1, 1, pledgeRows.length, HEADERS.pledges.length).setValues(pledgeRows);
    }
    if (collectionRows.length) {
      const target = db.getSheetByName(APP.sheets.collections);
      target.getRange(target.getLastRow() + 1, 1, collectionRows.length, HEADERS.collections.length).setValues(fitRowsWidth_(collectionRows, HEADERS.collections.length));
    }
    audit_('TOPLU_AKTARIM', 'İÇE_AKTARILDI', 'Taahhüt', '', pledgeRows.length + ' kayıt');
  });
  return { imported: pledgeRows.length, openingCollections: collectionRows.length, skipped: skipped };
}

function login(email, pin) {
  resetRequestCache_();
  email = normalizeEmail_(email);
  validateLoginPin_(pin);
  const attemptKey = 'login-attempt:' + email;
  const cache = CacheService.getScriptCache();
  const attempts = Number(cache.get(attemptKey) || 0);
  if (attempts >= 5) throw new Error('Çok fazla hatalı giriş yapıldı. 15 dakika sonra tekrar deneyin.');
  const row = findRowBy_(APP.sheets.users, 3, email);
  if (!row || row.values[7] !== true || hashPin_(pin, row.values[5]) !== row.values[6]) {
    cache.put(attemptKey, String(attempts + 1), 900);
    throw new Error('E-posta veya PIN hatalı.');
  }
  cache.remove(attemptKey);
  const token = Utilities.getUuid() + Utilities.getUuid();
  const session = {
    userId: row.values[0], name: row.values[1], email: row.values[2],
    role: row.values[3], reference: row.values[4], validatedAt: Date.now()
  };
  CacheService.getScriptCache().put('session:' + token, JSON.stringify(session), APP.sessionSeconds);
  audit_(email, 'GİRİŞ', 'Oturum', session.userId, 'Başarılı giriş.');
  return { token: token, data: getCachedAppData_(session, {}, false) };
}

function logout(token) {
  CacheService.getScriptCache().remove('session:' + token);
  return true;
}

function getAppData(token, filters, forceRefresh) {
  return getCachedAppData_(requireSession_(token), filters || {}, forceRefresh === true);
}

/**
 * Aynı kullanıcı ve filtre için hazırlanmış uygulama verisini kısa süreli önbellekten döndürür.
 * Her veri değişikliğinde sürüm yenilendiği için eski sonuçlar kendiliğinden kullanım dışı kalır.
 */
function getCachedAppData_(session, filters, forceRefresh) {
  const revision = getDataRevision_();
  const normalizedFilters = {
    start: String(filters.start || ''),
    end: String(filters.end || ''),
    applyToLists: filters.applyToLists === true || String(filters.applyToLists) === 'true'
  };
  const signature = [APP.cacheSchemaVersion, revision, session.userId, session.role, session.reference || '', normalizedFilters.start, normalizedFilters.end, normalizedFilters.applyToLists ? '1' : '0'].join('|');
  const cacheKey = 'appdata:' + sha256Hex_(signature).slice(0, 40);
  if (!forceRefresh) {
    const cached = readChunkedCache_(cacheKey);
    if (cached) {
      cached._meta = Object.assign({}, cached._meta || {}, { revision:revision, source:'server-cache' });
      return cached;
    }
  }
  const data = buildAppData_(session, normalizedFilters);
  data._meta = { revision:revision, source:'database', generatedAt:new Date().toISOString(), cacheSeconds:APP.appDataCacheSeconds };
  writeChunkedCache_(cacheKey, data, APP.appDataCacheSeconds);
  return data;
}

function generatePersonnelPledgePdf(token, personnelName) {
  const session = requireAdmin_(token);
  const personnel = cleanText_(personnelName, 120);
  if (!personnel) throw new Error('Personel seçin.');
  const pledges = dataRows_(APP.sheets.pledges).filter(function(r) {
    return normalizeKey_(r[14]) === normalizeKey_(personnel);
  });
  if (!pledges.length) throw new Error('Bu personele bağlı taahhüt bulunamadı.');
  const ids = {};
  pledges.forEach(function(r) { ids[r[0]] = true; });
  const collections = dataRows_(APP.sheets.collections).filter(function(r) { return ids[r[2]] && isCollectionApprovedRow_(r); });
  const active = pledges.filter(function(r) { return String(r[15] || 'AKTİF').toUpperCase() !== 'ŞÜPHELİ'; });
  const doubtful = pledges.filter(function(r) { return String(r[15] || 'AKTİF').toUpperCase() === 'ŞÜPHELİ'; });
  const doc = DocumentApp.create('Personel Taahhüt Tahsilat Raporu - ' + personnel);
  try {
    const body = doc.getBody();
    body.setPageWidth(842).setPageHeight(595).setMarginTop(28).setMarginBottom(28).setMarginLeft(28).setMarginRight(28);
    body.appendParagraph('Personel Bazlı Taahhüt ve Tahsilat Raporu').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph('Personel: ' + personnel + '    Rapor tarihi: ' + Utilities.formatDate(new Date(), 'Europe/Istanbul', 'dd.MM.yyyy HH:mm')).setBold(true);
    body.appendParagraph('Aktif toplam: ' + moneyText_(sum_(active, 7)) + '    Aktif tahsilat: ' + moneyText_(sum_(active, 8)) + '    Aktif kalan: ' + moneyText_(sum_(active, 9)));
    body.appendParagraph('Şüpheli alacak: ' + moneyText_(sum_(doubtful, 9)) + '    Toplam kayıt: ' + pledges.length);

    body.appendParagraph('Taahhütler').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const pledgeTable = [['Sene','Nevi','Hesap','Ödeyen','Referans','Bakiye','Ödenen','Kalan','Durum']];
    pledges.forEach(function(r) {
      pledgeTable.push([String(r[1]||''),String(r[2]||''),String(r[3]||''),String(r[5]||''),String(r[6]||''),moneyText_(r[7]),moneyText_(r[8]),moneyText_(r[9]),String(r[15]||'AKTİF')]);
    });
    styleReportTable_(body.appendTable(pledgeTable));

    body.appendParagraph('Tahsilat hareketleri').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const collectionTable = [['Tarih','Hesap','Nevi','Referans','Ödeyen','Tutar','Yöntem','Kasa / Banka']];
    collections.forEach(function(r) {
      collectionTable.push([isoDate_(r[1]),String(r[3]||''),String(r[4]||''),String(r[5]||''),String(r[6]||''),moneyText_(r[7]),String(r[8]||''),String(r[13]||'')]);
    });
    if (collectionTable.length === 1) collectionTable.push(['-','Tahsilat hareketi yok','','','','','','']);
    styleReportTable_(body.appendTable(collectionTable));
    doc.saveAndClose();
    const pdf = DriveApp.getFileById(doc.getId()).getAs(MimeType.PDF);
    const safeName = personnel.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ _-]/g, '').replace(/\s+/g, '-');
    audit_(session.email, 'PDF_OLUŞTURULDU', 'Personel Raporu', personnel, pledges.length + ' taahhüt / ' + collections.length + ' tahsilat');
    return { fileName:'personel-taahhut-tahsilat-' + safeName + '.pdf', mimeType:'application/pdf', base64:Utilities.base64Encode(pdf.getBytes()) };
  } finally {
    try { DriveApp.getFileById(doc.getId()).setTrashed(true); } catch (e) {}
  }
}

function generateTeacherPaymentReceiptPdf(token, paymentId) {
  const session = requireAdmin_(token);
  const id = cleanText_(paymentId, 60);
  const payment = findRowBy_(APP.sheets.teacherPayments, 1, id);
  if (!payment) throw new Error('Öğretmen ödeme hareketi bulunamadı.');
  const commitment = findRowBy_(APP.sheets.teacherCommitments, 1, payment.values[2]);
  if (!commitment) throw new Error('Ödemeye bağlı öğretmen tahakkuku bulunamadı.');
  const paidThroughReceipt = dataRows_(APP.sheets.teacherPayments).reduce(function(sum, r, index) {
    return r[2] === commitment.values[0] && index + 2 <= payment.row ? sum + (Number(r[4]) || 0) : sum;
  }, 0);
  const balanceAfter = Math.max(0, Math.round(((Number(commitment.values[4]) || 0) - paidThroughReceipt) * 100) / 100);
  const doc = DocumentApp.create('Öğretmen Ödeme Dekontu - ' + id);
  try {
    const body = doc.getBody();
    body.setPageWidth(595).setPageHeight(842).setMarginTop(42).setMarginBottom(42).setMarginLeft(48).setMarginRight(48);
    const title = body.appendParagraph('ÖĞRETMEN ÖDEME DEKONTU');
    title.setAlignment(DocumentApp.HorizontalAlignment.CENTER).setBold(true).setFontSize(16).setForegroundColor('#163A5F');
    body.appendParagraph('Dekont No: ' + id + '    Tarih: ' + Utilities.formatDate(new Date(payment.values[1]), 'Europe/Istanbul', 'dd.MM.yyyy')).setAlignment(DocumentApp.HorizontalAlignment.CENTER).setFontSize(9);
    body.appendParagraph('');
    const details = [
      ['Öğretmen', String(commitment.values[1] || '')],
      ['Ders adı', String(commitment.values[2] || '')],
      ['Tahakkuk dönemi', String(commitment.values[3] || '')],
      ['Aylık ders saati', String(commitment.values[11] || 0)],
      ['Saatlik ücret', moneyText_(commitment.values[12])],
      ['Tahakkuk toplamı', moneyText_(commitment.values[4])],
      ['Bu dekontla yapılan ödeme', moneyText_(payment.values[4])],
      ['Ödeme yöntemi', String(payment.values[5] || '')],
      ['Kasa / banka hesabı', String(payment.values[9] || 'Devir / Belirsiz')],
      ['Ödeme sonrası bakiye', moneyText_(balanceAfter)]
    ];
    const table = body.appendTable(details);
    for (let r = 0; r < table.getNumRows(); r++) {
      const left = table.getRow(r).getCell(0);
      const right = table.getRow(r).getCell(1);
      left.setBackgroundColor('#E8F1F9');
      left.editAsText().setBold(true).setFontSize(10).setForegroundColor('#163A5F');
      right.editAsText().setFontSize(10).setForegroundColor('#17212B');
      [left, right].forEach(function(cell) { cell.setPaddingTop(7).setPaddingBottom(7).setPaddingLeft(7).setPaddingRight(7); });
    }
    body.appendParagraph('');
    const balanceText = balanceAfter > 0
      ? 'Bu ödeme sonrasında tahakkuktan kalan bakiye ' + moneyText_(balanceAfter) + ' tutarındadır.'
      : 'Bu ödeme ile tahakkukun tüm bakiyesi kapanmıştır.';
    body.appendParagraph(balanceText).setBold(true).setFontSize(11).setForegroundColor(balanceAfter > 0 ? '#A66300' : '#14804A');
    if (payment.values[6]) body.appendParagraph('Açıklama: ' + String(payment.values[6])).setFontSize(9);
    body.appendParagraph('\n\n');
    const signature = body.appendTable([['ÖDEMEYİ ALDIM'],['Ad Soyad: ' + String(commitment.values[1] || '')],['İmza:'],['\n\n']]);
    signature.setBorderWidth(1).setBorderColor('#8FA5B8');
    signature.getRow(0).getCell(0).setBackgroundColor('#163A5F').editAsText().setBold(true).setForegroundColor('#FFFFFF').setFontSize(11);
    for (let r = 1; r < signature.getNumRows(); r++) signature.getRow(r).getCell(0).editAsText().setFontSize(10);
    body.appendParagraph('Bu belge sistem tarafından oluşturulmuştur.').setAlignment(DocumentApp.HorizontalAlignment.CENTER).setFontSize(8).setForegroundColor('#657180');
    doc.saveAndClose();
    const pdf = DriveApp.getFileById(doc.getId()).getAs(MimeType.PDF);
    audit_(session.email, 'PDF_OLUŞTURULDU', 'Öğretmen Ödeme Dekontu', id, commitment.values[1] + ' / ' + payment.values[4] + ' TL');
    return { fileName:'ogretmen-odeme-dekontu-' + id + '.pdf', mimeType:'application/pdf', base64:Utilities.base64Encode(pdf.getBytes()) };
  } finally {
    try { DriveApp.getFileById(doc.getId()).setTrashed(true); } catch (e) {}
  }
}

function generateReferenceTargetsPdf(token, sortKey, periodKey, targetType) {
  const session=requireSession_(token);
  const data=buildAppData_(session,{}).referenceTargets;
  let items=(data.items||[]).filter(function(x){return x.active;});
  periodKey=cleanText_(periodKey,7);
  if(/^\d{4}-\d{2}$/.test(periodKey)) items=items.filter(function(x){return String(x.start||'').slice(0,7)===periodKey;});
  const sorters={
    'combined-actual':function(a,b){return (Number(b.actualPledged)+Number(b.actualCollected))-(Number(a.actualPledged)+Number(a.actualCollected));},
    'pledge-target':function(a,b){return b.pledgeTarget-a.pledgeTarget;},'pledge-actual':function(a,b){return b.actualPledged-a.actualPledged;},'pledge-rate':function(a,b){return b.pledgeRate-a.pledgeRate;},
    'collection-target':function(a,b){return b.collectionTarget-a.collectionTarget;},'collection-actual':function(a,b){return b.actualCollected-a.actualCollected;},'collection-rate':function(a,b){return b.collectionRate-a.collectionRate;},
    'name':function(a,b){return a.reference.localeCompare(b.reference,'tr');}
  };
  items=items.sort(sorters[sortKey]||sorters['collection-rate']);
  if(!items.length) throw new Error('PDF için aktif referans hedefi bulunamadı.');
  const reportTitle='TEBERRU VE TAHSİLAT HEDEF PERFORMANS RAPORU';
  const doc=DocumentApp.create(reportTitle);
  try{
    const body=doc.getBody();
    body.setPageWidth(842).setPageHeight(595).setMarginTop(24).setMarginBottom(24).setMarginLeft(22).setMarginRight(22);
    body.appendParagraph(reportTitle).setAlignment(DocumentApp.HorizontalAlignment.CENTER).setBold(true).setFontSize(15).setForegroundColor('#102A43');
    body.appendParagraph((periodKey ? 'Hedef dönemi: '+periodKey+'  ·  ' : '')+'Rapor tarihi: '+Utilities.formatDate(new Date(),'Europe/Istanbul','dd.MM.yyyy HH:mm')).setAlignment(DocumentApp.HorizontalAlignment.CENTER).setFontSize(8).setForegroundColor('#657180');
    const summary=items.reduce(function(s,x){s.pledgeTarget+=x.pledgeTarget;s.actualPledged+=x.actualPledged;s.collectionTarget+=x.collectionTarget;s.actualCollected+=x.actualCollected;return s;},{pledgeTarget:0,actualPledged:0,collectionTarget:0,actualCollected:0});
    summary.totalTarget=summary.pledgeTarget+summary.collectionTarget;
    summary.totalActual=summary.actualPledged+summary.actualCollected;
    summary.totalRate=summary.totalTarget?summary.totalActual/summary.totalTarget:0;
    appendReferenceTargetSummaryCards_(body,summary);
    body.appendParagraph('').setFontSize(3);
    const rows=[['Referans','Dönem','Teberru Hedefi','Teberru','Teberru %','Tahsilat Hedefi','Tahsilat','Teberru + Tahsilat','Tahsilat %','Kalan Tahsilat','Hedef Durumu']];
    items.forEach(function(x){rows.push([x.reference,formatDateTr_(x.start)+' - '+formatDateTr_(x.end),moneyText_(x.pledgeTarget),moneyText_(x.actualPledged),percentText_(x.pledgeRate),moneyText_(x.collectionTarget),moneyText_(x.actualCollected),moneyText_(x.totalActual),percentText_(x.collectionRate),moneyText_(x.collectionRemaining),x.achievementStatus]);});
    rows.push(['GENEL TOPLAM','',moneyText_(summary.pledgeTarget),moneyText_(summary.actualPledged),percentText_(summary.pledgeTarget?summary.actualPledged/summary.pledgeTarget:0),moneyText_(summary.collectionTarget),moneyText_(summary.actualCollected),moneyText_(summary.actualPledged+summary.actualCollected),percentText_(summary.collectionTarget?summary.actualCollected/summary.collectionTarget:0),moneyText_(Math.max(0,(summary.collectionTarget||0)-(summary.actualCollected||0))),'']);
    styleReportTable_(body.appendTable(rows));
    body.appendParagraph('Şüpheli alacaklar hedef gerçekleşmelerine dahil edilmemiştir.').setFontSize(8).setForegroundColor('#657180');
    doc.saveAndClose();
    const pdf=DriveApp.getFileById(doc.getId()).getAs(MimeType.PDF);
    audit_(session.email,'PDF_OLUŞTURULDU','Teberru ve Tahsilat Hedefleri','',items.length+' hedef');
    return {fileName:'teberru-tahsilat-hedef-performans.pdf',mimeType:'application/pdf',base64:Utilities.base64Encode(pdf.getBytes())};
  }finally{try{DriveApp.getFileById(doc.getId()).setTrashed(true);}catch(e){}}
}

function appendReferenceTargetSummaryCards_(body,summary) {
  const cards=[
    ['TEBERRU HEDEFİ',moneyText_(summary.pledgeTarget)],
    ['GERÇEKLEŞEN TEBERRU',moneyText_(summary.actualPledged)],
    ['TAHSİLAT HEDEFİ',moneyText_(summary.collectionTarget)],
    ['TOPLAM TAHSİLAT',moneyText_(summary.actualCollected)],
    ['TOPLAM HEDEF',moneyText_(summary.totalTarget)],
    ['TEBERRU + TAHSİLAT',moneyText_(summary.totalActual)],
    ['GENEL GERÇEKLEŞME',percentText_(summary.totalRate)]
  ];
  [[0,4],[4,7]].forEach(function(range,rowIndex){
    const table=body.appendTable([cards.slice(range[0],range[1]).map(function(card){return card[0]+'\n'+card[1];})]);
    table.setBorderColor(rowIndex===0?'#D7E0E8':'#C9A55A').setBorderWidth(1);
    const row=table.getRow(0);
    for(let c=0;c<row.getNumCells();c++){
      const card=cards[range[0]+c];
      const cell=row.getCell(c);
      cell.setBackgroundColor(rowIndex===0?'#F3F6F8':'#FFF9EC').setPaddingTop(7).setPaddingBottom(7).setPaddingLeft(7).setPaddingRight(7);
      const text=cell.editAsText();
      const content=text.getText();
      const valueStart=card[0].length+1;
      text.setFontSize(0,card[0].length-1,7).setBold(0,card[0].length-1,true).setForegroundColor(0,card[0].length-1,'#657180');
      if(content.length>valueStart) text.setFontSize(valueStart,content.length-1,11).setBold(valueStart,content.length-1,true).setForegroundColor(valueStart,content.length-1,rowIndex===0?'#102A43':'#8A692A');
    }
    if(rowIndex===0) body.appendParagraph('').setFontSize(2);
  });
}

function styleReportTable_(table) {
  for (let r = 0; r < table.getNumRows(); r++) {
    const row = table.getRow(r);
    for (let c = 0; c < row.getNumCells(); c++) {
      const cell = row.getCell(c);
      cell.setPaddingTop(3).setPaddingBottom(3).setPaddingLeft(3).setPaddingRight(3);
      cell.editAsText().setFontSize(r === 0 ? 8 : 7).setBold(r === 0).setForegroundColor(r === 0 ? '#FFFFFF' : '#17212B');
      if (r === 0) cell.setBackgroundColor('#163A5F');
    }
  }
}

function moneyText_(value) {
  const n = Math.round((Number(value) || 0) * 100) / 100;
  return n.toLocaleString('tr-TR', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' TL';
}
function percentText_(value){return '%'+((Number(value)||0)*100).toFixed(1).replace('.',',');}
function formatDateTr_(value){const d=value instanceof Date?value:parseDate_(value,'Tarih');return Utilities.formatDate(d,'Europe/Istanbul','dd.MM.yyyy');}

function savePledge(token, payload) {
  const session = requireSession_(token);
  payload = payload || {};
  const amount = positiveNumber_(payload.amount, 'Taahhüt tutarı');
  const year = Math.trunc(Number(payload.year));
  const donationType = cleanText_(payload.donationType, 80);
  const fullName = cleanText_(payload.fullName, 120);
  const reference = isApproverSession_(session) ? cleanText_(payload.reference, 100) : session.reference;
  if (!isFinite(year) || year < 1900 || year > 2100) throw new Error('Yıl geçersiz.');
  if (!donationType || !fullName || !reference) throw new Error('Nevi, hesap adı ve referans zorunludur.');
  const date = new Date(year, 0, 1, 12, 0, 0, 0);
  const id = makeId_('TAA');
  withLock_(function() {
    appendRows_(getDb_().getSheetByName(APP.sheets.pledges), [[
      id, year, donationType, fullName,
      cleanText_(payload.phone, 30), cleanText_(payload.payer, 120), reference, amount,
      0, amount, 'Ödenmedi', date, session.email, new Date(), cleanText_(payload.personnel, 120), 'AKTİF', 'BAĞIŞ',
      cleanText_(payload.activity, 120), cleanText_(payload.subActivity, 120), cleanText_(payload.accountCode, 80),
      cleanText_(payload.group, 80), cleanText_(payload.notes, 500)
    ]], HEADERS.pledges.length);
    audit_(session.email, 'EKLENDİ', 'Taahhüt', id, amount + ' TL');
  });
  return {ok:true};
}

function updatePledge(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const id = cleanText_(payload.id, 60);
  const amount = positiveNumber_(payload.amount, 'Taahhüt tutarı');
  const year = Math.trunc(Number(payload.year));
  const donationType = cleanText_(payload.donationType, 80);
  const fullName = cleanText_(payload.fullName, 120);
  const reference = cleanText_(payload.reference, 100);
  if (!isFinite(year) || year < 1900 || year > 2100) throw new Error('Yıl geçersiz.');
  if (!donationType || !fullName || !reference) throw new Error('Nevi, hesap adı ve referans zorunludur.');
  const date = new Date(year, 0, 1, 12, 0, 0, 0);
  withLock_(function() {
    const current = findRowBy_(APP.sheets.pledges, 1, id);
    if (!current) throw new Error('Taahhüt bulunamadı.');
    if (isStudentPledgeRow_(current.values)) throw new Error('Öğrenci tahakkukunu Öğrenci ödemeleri sekmesinden düzenleyin.');
    const paid = Number(current.values[8]) || 0;
    if (amount < paid) throw new Error('Taahhüt tutarı ödenmiş tutardan küçük olamaz.');
    const remaining = Math.round((amount - paid) * 100) / 100;
    const status = remaining <= 0 ? 'Kapandı' : (paid > 0 ? 'Kısmi' : 'Ödenmedi');
    const sh = getDb_().getSheetByName(APP.sheets.pledges);
    sh.getRange(current.row, 2, 1, 10).setValues([[
      year, donationType, fullName, cleanText_(payload.phone, 30), cleanText_(payload.payer, 120), reference,
      amount, paid, remaining, status
    ]]);
    sh.getRange(current.row, 12).setValue(date);
    sh.getRange(current.row, 18, 1, 5).setValues([[
      cleanText_(payload.activity, 120), cleanText_(payload.subActivity, 120), cleanText_(payload.accountCode, 80),
      cleanText_(payload.group, 80), cleanText_(payload.notes, 500)
    ]]);
    const collectionSheet = getDb_().getSheetByName(APP.sheets.collections);
    dataRows_(APP.sheets.collections).forEach(function(r, index) {
      if (r[2] === id) collectionSheet.getRange(index + 2, 4, 1, 4).setValues([[fullName, donationType, reference, cleanText_(payload.payer, 120)]]);
    });
    audit_(session.email, 'DÜZELTİLDİ', 'Taahhüt', id, fullName + ' / ' + amount + ' TL');
  });
  return {ok:true};
}

function saveStudentAccrual(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const amount = positiveNumber_(payload.amount, 'Tahakkuk tutarı');
  const date = parseDate_(payload.accrualDate, 'Tahakkuk tarihi');
  const studentName = cleanText_(payload.studentName, 120);
  const feeType = cleanText_(payload.feeType, 80);
  if (!studentName || !feeType) throw new Error('Öğrenci adı ve ödeme türü zorunludur.');
  const plan = studentPlanInput_(payload, amount, date);
  const id = makeId_('OGR');
  withLock_(function() {
    const ss = getDb_();
    appendRows_(ss.getSheetByName(APP.sheets.pledges), [[
      id, date.getFullYear(), feeType, studentName, cleanText_(payload.phone, 30),
      cleanText_(payload.payer, 120), '', amount, 0, amount, 'Ödenmedi', date,
      session.email, new Date(), '', 'AKTİF', 'ÖĞRENCİ', '', '', '', '', ''
    ]], HEADERS.pledges.length);
    upsertStudentPlan_(ss, id, plan);
    audit_(session.email, 'EKLENDİ', 'Öğrenci Tahakkuku', id, studentName + ' / ' + amount + ' TL');
  });
  return {ok:true};
}

function updateStudentAccrual(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const id = cleanText_(payload.id, 60);
  const amount = positiveNumber_(payload.amount, 'Tahakkuk tutarı');
  const date = parseDate_(payload.accrualDate, 'Tahakkuk tarihi');
  const studentName = cleanText_(payload.studentName, 120);
  const feeType = cleanText_(payload.feeType, 80);
  if (!studentName || !feeType) throw new Error('Öğrenci adı ve ödeme türü zorunludur.');
  const plan = studentPlanInput_(payload, amount, date);
  withLock_(function() {
    const current = findRowBy_(APP.sheets.pledges, 1, id);
    if (!current || !isStudentPledgeRow_(current.values)) throw new Error('Öğrenci tahakkuku bulunamadı.');
    const paid = Number(current.values[8]) || 0;
    if (amount < paid) throw new Error('Tahakkuk tutarı ödenmiş tutardan küçük olamaz.');
    const remaining = Math.round((amount - paid) * 100) / 100;
    const status = remaining <= 0 ? 'Kapandı' : (paid > 0 ? 'Kısmi' : 'Ödenmedi');
    const payer = cleanText_(payload.payer, 120);
    const sh = getDb_().getSheetByName(APP.sheets.pledges);
    sh.getRange(current.row, 2, 1, 11).setValues([[
      date.getFullYear(), feeType, studentName, cleanText_(payload.phone, 30), payer, '',
      amount, paid, remaining, status, date
    ]]);
    sh.getRange(current.row, 17).setValue('ÖĞRENCİ');
    upsertStudentPlan_(getDb_(), id, plan);
    const collectionSheet = getDb_().getSheetByName(APP.sheets.collections);
    dataRows_(APP.sheets.collections).forEach(function(r, index) {
      if (r[2] === id) collectionSheet.getRange(index + 2, 4, 1, 4).setValues([[studentName, feeType, '', payer]]);
    });
    audit_(session.email, 'DÜZELTİLDİ', 'Öğrenci Tahakkuku', id, studentName + ' / ' + amount + ' TL');
  });
  return {ok:true};
}

function studentPlanInput_(payload, total, accrualDate) {
  const downPayment = nonNegativeNumber_(payload.downPayment, 'Peşinat');
  if (downPayment > total) throw new Error('Peşinat toplam bedelden büyük olamaz.');
  const firstInstallmentDate = parseDate_(payload.firstInstallmentDate, 'İlk taksit tarihi');
  const installmentCount = 8;
  const monthlyInstallment = Math.round(((total - downPayment) / installmentCount) * 100) / 100;
  return {
    total:total,
    downPayment:downPayment,
    installmentCount:installmentCount,
    firstInstallmentDate:firstInstallmentDate,
    monthlyInstallment:monthlyInstallment,
    accrualDate:accrualDate
  };
}

function upsertStudentPlan_(ss, pledgeId, plan) {
  const sheet = ss.getSheetByName(APP.sheets.studentPlans);
  if (!sheet) throw new Error('Öğrenci ödeme planı sayfası bulunamadı. Önce upgradeSystem işlevini çalıştırın.');
  const existing = findRowBy_(APP.sheets.studentPlans, 2, pledgeId);
  const now = new Date();
  if (existing) {
    sheet.getRange(existing.row, 3, 1, 7).setValues([[
      plan.total, plan.downPayment, plan.installmentCount, plan.firstInstallmentDate,
      plan.monthlyInstallment, existing.values[7] || now, now
    ]]);
    return;
  }
  appendRows_(sheet, [[
    makeId_('OPL'), pledgeId, plan.total, plan.downPayment, plan.installmentCount,
    plan.firstInstallmentDate, plan.monthlyInstallment, now, now
  ]], HEADERS.studentPlans.length);
}

function convertPledgesToStudentAccruals(token, pledgeIds) {
  const session = requireAdmin_(token);
  const sourceIds = Array.isArray(pledgeIds) ? pledgeIds : [pledgeIds];
  const ids = [];
  const seen = {};
  sourceIds.forEach(function(value) {
    const id = cleanText_(value, 60);
    if (id && !seen[id]) { seen[id] = true; ids.push(id); }
  });
  if (!ids.length) throw new Error('Öğrenci tahakkukuna aktarılacak en az bir taahhüt seçin.');
  if (ids.length > 500) throw new Error('Tek işlemde en fazla 500 taahhüt aktarabilirsiniz.');

  return withLock_(function() {
    const rows = dataRows_(APP.sheets.pledges);
    if (!rows.length) throw new Error('Aktarılabilecek taahhüt bulunamadı.');
    const wanted = {};
    ids.forEach(function(id) { wanted[id] = true; });
    const collectionCounts = {};
    dataRows_(APP.sheets.collections).forEach(function(row) {
      const pledgeId = String(row[2] || '');
      if (pledgeId) collectionCounts[pledgeId] = (collectionCounts[pledgeId] || 0) + 1;
    });

    let converted = 0;
    let skipped = 0;
    let linkedPayments = 0;
    const found = {};
    const sourceValues = rows.map(function(row) {
      const id = String(row[0] || '');
      let source = String(row[16] || '');
      if (!wanted[id]) return [source];
      found[id] = true;
      if (isStudentPledgeRow_(row) || String(row[15] || 'AKTİF').toUpperCase() === 'ŞÜPHELİ') {
        skipped++;
        return [source];
      }
      source = 'ÖĞRENCİ';
      converted++;
      linkedPayments += collectionCounts[id] || 0;
      return [source];
    });
    ids.forEach(function(id) { if (!found[id]) skipped++; });
    if (!converted) throw new Error('Seçilen kayıtlar aktarılamadı. Öğrenci veya şüpheli alacak durumlarını kontrol edin.');

    getDb_().getSheetByName(APP.sheets.pledges).getRange(2, 17, sourceValues.length, 1).setValues(sourceValues);
    audit_(session.email, 'ÖĞRENCİYE AKTARILDI', 'Öğrenci Tahakkukları', '', converted + ' taahhüt / ' + linkedPayments + ' bağlı tahsilat / ' + skipped + ' atlandı');
    return {ok:true, converted:converted, skipped:skipped, linkedPayments:linkedPayments};
  });
}

function bulkSavePledges(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const sourceRows = Array.isArray(payload.rows) ? payload.rows : [];
  if (!sourceRows.length) throw new Error('Dosyada aktarılacak kayıt bulunamadı.');
  if (sourceRows.length > 2000) throw new Error('Tek seferde en fazla 2000 kayıt aktarabilirsiniz.');

  const pledgeRows = [];
  const collectionRows = [];
  const errors = [];
  sourceRows.forEach(function(item, index) {
    try {
      item = item || {};
      const rowNo = index + 2;
      const year = Math.trunc(flexibleNumber_(item.year));
      const type = cleanText_(item.type, 80);
      const account = cleanText_(item.account, 120);
      const payer = cleanText_(item.payer, 120);
      const phone = cleanText_(item.phone, 30);
      const reference = cleanText_(item.reference, 100);
      const personnel = cleanText_(item.personnel, 120);
      const activity = cleanText_(item.activity, 120);
      const subActivity = cleanText_(item.subActivity, 120);
      const accountCode = cleanText_(item.accountCode, 80);
      const group = cleanText_(item.group, 120);
      const notes = cleanText_(item.notes, 500);
      const balance = flexibleNumber_(item.balance);
      const paid = item.paid === '' || item.paid == null ? 0 : flexibleNumber_(item.paid);
      const suppliedRemaining = item.remaining === '' || item.remaining == null ? null : flexibleNumber_(item.remaining);

      if (!isFinite(year) || year < 1900 || year > 2100) throw new Error('YIL geçersiz');
      if (!type) throw new Error('NEVİ boş olamaz');
      if (!account) throw new Error('HESAP ADI boş olamaz');
      if (!reference) throw new Error('REFERANS boş olamaz');
      if (!isFinite(balance) || balance <= 0) throw new Error('TAHAKKUK (TL) sıfırdan büyük olmalıdır');
      if (!isFinite(paid) || paid < 0) throw new Error('ÖDENEN (TL) geçersiz');
      if (paid > balance) throw new Error('ÖDENEN (TL), TAHAKKUK (TL) tutarından büyük olamaz');
      const remaining = Math.round((balance - paid) * 100) / 100;
      if (suppliedRemaining != null && (!isFinite(suppliedRemaining) || Math.abs(suppliedRemaining - remaining) > 0.01)) {
        throw new Error('KALAN (TL), TAHAKKUK (TL) - ÖDENEN (TL) ile uyuşmuyor');
      }

      const id = makeId_('TAA');
      const pledgeDate = new Date(year, 0, 1, 12, 0, 0);
      pledgeRows.push([
        id, year, type, account, phone, payer, reference, balance, paid, remaining,
        remaining <= 0 ? 'Kapandı' : (paid > 0 ? 'Kısmi' : 'Ödenmedi'),
        pledgeDate, session.email, new Date(), personnel, 'AKTİF', 'BAĞIŞ', activity, subActivity, accountCode, group, notes
      ]);
      if (paid > 0) collectionRows.push([
        makeId_('THS'), pledgeDate, id, account, type, reference, payer, paid,
        'Devir', 'Toplu taahhüt aktarımından açılış tahsilatı', session.email, new Date(), 'HSP-DEVIR', 'Devir / Belirsiz', 'ONAYLANDI', session.email, new Date(), ''
      ]);
    } catch (e) {
      errors.push((index + 2) + '. satır: ' + e.message);
    }
  });

  if (errors.length) {
    throw new Error('Aktarım yapılmadı. Düzeltilecek satırlar:\n' + errors.slice(0, 12).join('\n') + (errors.length > 12 ? '\n… ve ' + (errors.length - 12) + ' hata daha.' : ''));
  }

  withLock_(function() {
    const ss = getDb_();
    const pledgeSheet = ss.getSheetByName(APP.sheets.pledges);
    if (pledgeSheet.getLastColumn() < HEADERS.pledges.length) {
      const start = pledgeSheet.getLastColumn() + 1;
      const added = HEADERS.pledges.slice(start - 1);
      pledgeSheet.getRange(1, start, 1, added.length).setValues([added]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
    }
    pledgeSheet.getRange(pledgeSheet.getLastRow() + 1, 1, pledgeRows.length, HEADERS.pledges.length).setValues(pledgeRows);
    if (collectionRows.length) {
      const collectionSheet = ss.getSheetByName(APP.sheets.collections);
      collectionSheet.getRange(collectionSheet.getLastRow() + 1, 1, collectionRows.length, HEADERS.collections.length).setValues(fitRowsWidth_(collectionRows, HEADERS.collections.length));
    }
    audit_(session.email, 'TOPLU_EKLENDİ', 'Taahhüt', '', pledgeRows.length + ' kayıt / ' + collectionRows.length + ' açılış tahsilatı');
  });
  return { imported:pledgeRows.length, openingCollections:collectionRows.length };
}

function bulkImportAccounting(token, payload) {
  const session = requireAdmin_(token);
  const sourceRows = payload && Array.isArray(payload.rows) ? payload.rows : [];
  if (!sourceRows.length) throw new Error('Dosyada aktarılacak muhasebe hareketi bulunamadı.');
  if (sourceRows.length > 3000) throw new Error('Tek seferde en fazla 3000 muhasebe hareketi aktarabilirsiniz.');
  const result = { imported:0, skipped:0, collections:0, staffPayments:0, teacherPayments:0, errors:[] };

  withLock_(function() {
    const ss = getDb_();
    const importSheet=ss.getSheetByName(APP.sheets.accountingImports);
    if(!importSheet)throw new Error('Muhasebe aktarım sayfası bulunamadı. Yeni Code.gs dosyasını kaydettikten sonra upgradeSystem işlevini bir kez çalıştırın.');
    const existing = {};
    const importLastRow=importSheet.getLastRow();
    if(importLastRow>1)importSheet.getRange(2,1,importLastRow-1,1).getValues().forEach(function(r){existing[normalizeKey_(r[0])]=true;});
    const accountRows = optionalDataRows_(APP.sheets.cashAccounts);
    const accounts = {};
    accountRows.forEach(function(r) {
      const item={id:String(r[0]),name:String(r[1]),active:r[4]===true};
      accounts[normalizeKey_(item.id)]=item; accounts[normalizeKey_(item.name)]=item;
    });
    const pledgeRows = dataRows_(APP.sheets.pledges);
    const pledgeById = {}; pledgeRows.forEach(function(r){pledgeById[normalizeKey_(r[0])]=r;});
    const staffRows = dataRows_(APP.sheets.staffCommitments);
    const staffById = {}; staffRows.forEach(function(r){staffById[normalizeKey_(r[0])]=r;});
    const teacherRows = dataRows_(APP.sheets.teacherCommitments);
    const teacherById = {}; teacherRows.forEach(function(r){teacherById[normalizeKey_(r[0])]=r;});
    const collectionAdds=[], staffAdds=[], teacherAdds=[], historyAdds=[], cashDeltas={};

    sourceRows.forEach(function(item,index) {
      try {
        item=item||{};
        const rowNo=index+2;
        const externalId=cleanText_(item.externalId,100);
        if(!externalId) throw new Error('MUHASEBE KAYIT NO boş olamaz');
        const externalKey=normalizeKey_(externalId);
        if(existing[externalKey]){result.skipped++;return;}
        const type=accountingType_(item.type);
        const date=parseFlexibleDate_(item.date,'Tarih');
        const rawAmount=flexibleNumber_(item.amount);
        if(!isFinite(rawAmount)||rawAmount<=0) throw new Error('TUTAR sıfırdan büyük olmalıdır');
        const amount=Math.round(rawAmount*100)/100;
        const account=accounts[normalizeKey_(item.account)];
        if(!account||!account.active) throw new Error('Aktif KASA / BANKA hesabı bulunamadı: '+cleanText_(item.account,100));
        const method=cleanText_(item.method,50)||'Diğer';
        const note=cleanText_(item.note,300);
        const linkedId=cleanText_(item.linkedId,60);
        const name=cleanText_(item.name,120);
        const detailType=cleanText_(item.detailType,100);
        const reference=cleanText_(item.reference,100);
        const payer=cleanText_(item.payer,120);
        const period=cleanText_(item.period,30);
        let systemId='';

        if(type==='TAHSİLAT') {
          let pledge=linkedId?pledgeById[normalizeKey_(linkedId)]:null;
          if(!pledge&&!linkedId) {
            const matches=pledgeRows.filter(function(r){return normalizeKey_(r[3])===normalizeKey_(name)&&(!detailType||normalizeKey_(r[2])===normalizeKey_(detailType))&&(!reference||referenceKey_(r[6])===referenceKey_(reference))&&String(r[15]||'AKTİF').toUpperCase()!=='ŞÜPHELİ'&&(Number(r[9])||0)>0;});
            if(matches.length===1) pledge=matches[0];
            else if(matches.length>1) throw new Error('Birden fazla taahhüt eşleşti; BAĞLI KAYIT NO yazın');
          }
          if(!pledge) throw new Error('Bağlı taahhüt bulunamadı');
          if(String(pledge[15]||'AKTİF').toUpperCase()==='ŞÜPHELİ') throw new Error('Taahhüt şüpheli alacaklarda');
          if(amount>(Number(pledge[9])||0)) throw new Error('Tahsilat kalan taahhüt bakiyesinden büyük');
          systemId=makeId_('THS');
          collectionAdds.push([systemId,date,pledge[0],pledge[3],pledge[2],pledge[6],pledge[5],amount,method,note||('Muhasebe aktarımı: '+externalId),session.email,new Date(),account.id,account.name,'ONAYLANDI',session.email,new Date(),'']);
          pledge[8]=Math.round(((Number(pledge[8])||0)+amount)*100)/100;
          pledge[9]=Math.round(((Number(pledge[7])||0)-pledge[8])*100)/100;
          pledge[10]=pledge[9]<=0?'Kapandı':'Kısmi';
          cashDeltas[account.id]=(cashDeltas[account.id]||0)+amount;
          result.collections++;
        } else if(type==='HIZLI BAĞIŞ') {
          if(!name||!detailType||!reference) throw new Error('Hızlı bağışta ADI/HESAP, BAĞIŞ/ÖDEME TÜRÜ ve REFERANS zorunludur');
          systemId=makeId_('HBG');
          collectionAdds.push([systemId,date,'',name,detailType,reference,payer,amount,method,note||('Muhasebe aktarımı: '+externalId),session.email,new Date(),account.id,account.name,'ONAYLANDI',session.email,new Date(),'']);
          cashDeltas[account.id]=(cashDeltas[account.id]||0)+amount;
          result.collections++;
        } else {
          const teacher=type==='ÖĞRETMEN ÖDEMESİ';
          const rows=teacher?teacherRows:staffRows;
          const byId=teacher?teacherById:staffById;
          let commitment=linkedId?byId[normalizeKey_(linkedId)]:null;
          if(!commitment&&!linkedId) {
            const matches=rows.filter(function(r){return normalizeKey_(r[1])===normalizeKey_(name)&&(!detailType||normalizeKey_(r[2])===normalizeKey_(detailType))&&(!period||normalizeKey_(r[3])===normalizeKey_(period))&&(Number(r[6])||0)>0;});
            if(matches.length===1) commitment=matches[0];
            else if(matches.length>1) throw new Error('Birden fazla tahakkuk eşleşti; BAĞLI KAYIT NO yazın');
          }
          if(!commitment) throw new Error('Bağlı tahakkuk bulunamadı');
          if(amount>(Number(commitment[6])||0)) throw new Error('Ödeme kalan tahakkuk bakiyesinden büyük');
          systemId=makeId_(teacher?'OHR':'PHR');
          const paymentRow=[systemId,date,commitment[0],commitment[1],amount,method,note||('Muhasebe aktarımı: '+externalId),new Date(),account.id,account.name];
          (teacher?teacherAdds:staffAdds).push(paymentRow);
          commitment[5]=Math.round(((Number(commitment[5])||0)+amount)*100)/100;
          commitment[6]=Math.round(((Number(commitment[4])||0)-commitment[5])*100)/100;
          commitment[8]=commitment[6]<=0?'Ödendi':'Kısmi';
          cashDeltas[account.id]=(cashDeltas[account.id]||0)-amount;
          if(teacher)result.teacherPayments++;else result.staffPayments++;
        }
        existing[externalKey]=true;
        historyAdds.push([externalId,type,systemId,date,amount,session.email,new Date()]);
        result.imported++;
      } catch(e) {
        result.errors.push('Satır '+(index+2)+': '+e.message);
      }
    });

    assertCashDeltas_(cashDeltas,'Muhasebe toplu aktarımı');
    appendRows_(ss.getSheetByName(APP.sheets.collections),collectionAdds,HEADERS.collections.length);
    appendRows_(ss.getSheetByName(APP.sheets.staffPayments),staffAdds,HEADERS.staffPayments.length);
    appendRows_(ss.getSheetByName(APP.sheets.teacherPayments),teacherAdds,HEADERS.teacherPayments.length);
    if(pledgeRows.length)ss.getSheetByName(APP.sheets.pledges).getRange(2,9,pledgeRows.length,3).setValues(pledgeRows.map(function(r){return [r[8],r[9],r[10]];}));
    if(staffRows.length)ss.getSheetByName(APP.sheets.staffCommitments).getRange(2,6,staffRows.length,4).setValues(staffRows.map(function(r){return [r[5],r[6],r[7],r[8]];}));
    if(teacherRows.length)ss.getSheetByName(APP.sheets.teacherCommitments).getRange(2,6,teacherRows.length,4).setValues(teacherRows.map(function(r){return [r[5],r[6],r[7],r[8]];}));
    appendRows_(importSheet,historyAdds,HEADERS.accountingImports.length);
    audit_(session.email,'MUHASEBE_AKTARIMI','Toplu Hareket','',result.imported+' aktarıldı / '+result.skipped+' tekrar / '+result.errors.length+' hatalı');
  });
  result.errors=result.errors.slice(0,100);
  return result;
}

function bulkImportDonations(token, payload) {
  const session = requireApprover_(token);
  const sourceRows = payload && Array.isArray(payload.rows) ? payload.rows : [];
  if (!sourceRows.length) throw new Error('Dosyada aktarılacak bağış bulunamadı.');
  if (sourceRows.length > 3000) throw new Error('Tek seferde en fazla 3000 bağış aktarabilirsiniz.');
  const result = { imported:0, skipped:0, total:0, errors:[] };

  withLock_(function() {
    const ss = getDb_();
    const collectionSheet = ss.getSheetByName(APP.sheets.collections);
    const importSheet = ss.getSheetByName(APP.sheets.accountingImports);
    if (!importSheet) throw new Error('Muhasebe aktarım sayfası bulunamadı. Önce upgradeSystem işlevini çalıştırın.');
    if (collectionSheet.getLastColumn() < HEADERS.collections.length) {
      const start = collectionSheet.getLastColumn() + 1;
      const added = HEADERS.collections.slice(start - 1);
      collectionSheet.getRange(1, start, 1, added.length).setValues([added]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
    }

    const accounts = {};
    optionalDataRows_(APP.sheets.cashAccounts).forEach(function(r) {
      const item = { id:String(r[0]), name:String(r[1]), type:String(r[2] || ''), active:r[4] === true };
      accounts[normalizeKey_(item.id)] = item;
      accounts[normalizeKey_(item.name)] = item;
    });
    const collectionAdds = [];
    const historyAdds = [];

    sourceRows.forEach(function(item, index) {
      try {
        item = item || {};
        const receiptNo = cleanText_(item.receiptNo, 100);
        const date = parseFlexibleDate_(item.date, 'Tarih');
        const name = cleanText_(item.name, 120);
        const reference = cleanText_(item.reference, 100) || 'YURT';
        const group = cleanText_(item.group, 100);
        const activity = cleanText_(item.activity, 120);
        const phone = cleanText_(item.phone, 30);
        const paymentType = cleanText_(item.paymentType, 100);
        if (!name || !paymentType) throw new Error('KİMİN ADINA ve ÖDEME TİPİ zorunludur');
        const account = accounts[normalizeKey_(item.account)];
        if (!account || !account.active) throw new Error('Aktif GİRİŞ HESABI bulunamadı: ' + cleanText_(item.account, 100));
        const rawAmount = flexibleNumber_(item.amount);
        if (!isFinite(rawAmount) || rawAmount <= 0) throw new Error('TAHSİLAT (TL) sıfırdan büyük olmalıdır');
        const amount = Math.round(rawAmount * 100) / 100;
        const accountType = normalizeHeader_(account.type + ' ' + account.name);
        const method = accountType.indexOf('NAKIT') >= 0 ? 'Nakit' : (accountType.indexOf('POS') >= 0 || accountType.indexOf('KART') >= 0 ? 'Kart / POS' : (accountType.indexOf('BANKA') >= 0 ? 'Havale / EFT' : 'Diğer'));
        const systemId = makeId_('HBG');
        collectionAdds.push([
          systemId, date, '', name, paymentType, reference, name, amount, method,
          receiptNo ? 'Toplu teberru aktarımı · Makbuz: ' + receiptNo : 'Toplu teberru aktarımı', session.email, new Date(), account.id, account.name,
          'ONAYLANDI', session.email, new Date(), '', receiptNo, group, activity, phone
        ]);
        historyAdds.push([systemId, 'HIZLI BAĞIŞ', systemId, date, amount, session.email, new Date()]);
        result.imported++;
        result.total = Math.round((result.total + amount) * 100) / 100;
      } catch (e) {
        result.errors.push('Satır ' + (index + 2) + ': ' + e.message);
      }
    });

    appendRows_(collectionSheet, collectionAdds, HEADERS.collections.length);
    appendRows_(importSheet, historyAdds, HEADERS.accountingImports.length);
    audit_(session.email, 'TOPLU_TEBERRU_AKTARIMI', 'Doğrudan Gelir', '', result.imported + ' teberru / ' + result.total + ' TL / ' + result.errors.length + ' hatalı');
  });
  result.errors = result.errors.slice(0, 100);
  return result;
}

function accountingType_(value) {
  const key=normalizeHeader_(value);
  const map={'TAHSILAT':'TAHSİLAT','HIZLI BAGIS':'HIZLI BAĞIŞ','PERSONEL ODEMESI':'PERSONEL ÖDEMESİ','OGRETMEN ODEMESI':'ÖĞRETMEN ÖDEMESİ'};
  if(!map[key]) throw new Error('İŞLEM TÜRÜ geçersiz: '+cleanText_(value,80));
  return map[key];
}

function fitRowsWidth_(rows, width) {
  return (rows || []).map(function(row) {
    const fitted = (row || []).slice(0, width);
    while (fitted.length < width) fitted.push('');
    return fitted;
  });
}

function appendRows_(sheet, rows, width) {
  if(rows.length)sheet.getRange(sheet.getLastRow()+1,1,rows.length,width).setValues(fitRowsWidth_(rows,width));
}

function isApproverSession_(session) {
  return session && (session.role === 'YÖNETİCİ' || session.role === 'MUHASEBE SORUMLUSU');
}

function collectionApprovalStatus_(row) {
  return String((row || [])[14] || 'ONAYLANDI').toUpperCase();
}

function isCollectionApprovedRow_(row) {
  return collectionApprovalStatus_(row) === 'ONAYLANDI';
}

function collectionApprovalMeta_(session) {
  return isApproverSession_(session)
    ? ['ONAYLANDI', session.email, new Date(), '']
    : ['BEKLİYOR', '', '', ''];
}

function pendingAmountForPledge_(pledgeId, excludeCollectionId) {
  return dataRows_(APP.sheets.collections).filter(function(r) {
    return r[2] === pledgeId && r[0] !== excludeCollectionId && collectionApprovalStatus_(r) === 'BEKLİYOR';
  }).reduce(function(sum, r) { return sum + (Number(r[7]) || 0); }, 0);
}

function saveCollection(token, payload) {
  const session = requireSession_(token);
  payload = payload || {};
  const pledgeId = cleanText_(payload.pledgeId, 60);
  const amount = positiveNumber_(payload.amount, 'Tahsilat tutarı');
  const date = parseDate_(payload.date, 'Tahsilat tarihi');
  const accountId = cleanText_(payload.accountId, 60);
  const id = makeId_('THS');

  withLock_(function() {
    const current = findRowBy_(APP.sheets.pledges, 1, pledgeId);
    if (!current) throw new Error('Taahhüt bulunamadı.');
    if (String(current.values[15] || 'AKTİF').toUpperCase() === 'ŞÜPHELİ') throw new Error('Bu kayıt şüpheli alacaklarda. Tahsilat eklemeden önce aktife geri alın.');
    if (!isApproverSession_(session) && referenceKey_(current.values[6]) !== referenceKey_(session.reference)) throw new Error('Bu kayda erişiminiz yok.');
    const available = Math.max(0, (Number(current.values[9]) || 0) - pendingAmountForPledge_(pledgeId, ''));
    if (amount > available) throw new Error('Tahsilat, kalan ve onay bekleyen kayıtlar dikkate alındığında kullanılabilir ' + moneyText_(available) + ' tutarından büyük olamaz.');
    const account = findRowBy_(APP.sheets.cashAccounts, 1, accountId);
    if (!account || account.values[4] !== true) throw new Error('Aktif bir kasa veya banka hesabı seçin.');
    const ss = getDb_();
    appendRows_(ss.getSheetByName(APP.sheets.collections), [[
      id, date, current.values[0], current.values[3], current.values[2], current.values[6],
      current.values[5], amount, cleanText_(payload.method, 50), cleanText_(payload.note, 300), session.email, new Date(), account.values[0], account.values[1]
    ].concat(collectionApprovalMeta_(session))], HEADERS.collections.length);
    if (isApproverSession_(session)) {
      resetRequestCache_();
      recalculatePledge_(pledgeId);
      audit_(session.email, 'EKLENDİ_ONAYLANDI', 'Tahsilat', id, amount + ' TL / ' + current.values[0]);
    } else {
      audit_(session.email, 'ONAYA_GÖNDERİLDİ', 'Tahsilat', id, amount + ' TL / ' + current.values[0]);
    }
  });
  return {ok:true, approvalStatus:isApproverSession_(session)?'ONAYLANDI':'BEKLİYOR'};
}

function saveBulkCollections(token, payload) {
  const session = requireSession_(token);
  payload = payload || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) throw new Error('Toplu tahsilat için en az bir taahhüt seçin.');
  if (items.length > 200) throw new Error('Tek işlemde en fazla 200 tahsilat eklenebilir.');
  const date = parseDate_(payload.date, 'Tahsilat tarihi');
  const method = cleanText_(payload.method, 50);
  const note = cleanText_(payload.note, 300);
  const accountId = cleanText_(payload.accountId, 60);
  let result = null;

  withLock_(function() {
    resetRequestCache_();
    const account = findRowBy_(APP.sheets.cashAccounts, 1, accountId);
    if (!account || account.values[4] !== true) throw new Error('Aktif bir kasa veya banka hesabı seçin.');
    const pledgeRows = dataRows_(APP.sheets.pledges);
    const pledgeMap = {};
    pledgeRows.forEach(function(r, index) { pledgeMap[String(r[0])] = { values:r, index:index }; });
    const seen = {};
    const collectionRows = [];
    let total = 0;

    items.forEach(function(item, index) {
      const pledgeId = cleanText_(item && item.pledgeId, 60);
      if (!pledgeId || seen[pledgeId]) throw new Error((index + 1) + '. satırda geçersiz veya tekrar eden taahhüt seçimi var.');
      seen[pledgeId] = true;
      const record = pledgeMap[pledgeId];
      if (!record) throw new Error('Taahhüt bulunamadı: ' + pledgeId);
      const pledge = record.values;
      if (String(pledge[15] || 'AKTİF').toUpperCase() === 'ŞÜPHELİ') throw new Error(pledge[3] + ' kaydı şüpheli alacaklarda. Önce aktife geri alın.');
      if (!isApproverSession_(session) && referenceKey_(pledge[6]) !== referenceKey_(session.reference)) throw new Error(pledge[3] + ' kaydına erişiminiz yok.');
      const amount = positiveNumber_(item.amount, pledge[3] + ' tahsilat tutarı');
      const remaining = Math.max(0, (Number(pledge[9]) || 0) - pendingAmountForPledge_(pledgeId, ''));
      if (amount > remaining) throw new Error(pledge[3] + ' için tahsilat kalan ' + moneyText_(remaining) + ' tutarından büyük olamaz.');
      if (isApproverSession_(session)) {
        const paid = Math.round(((Number(pledge[8]) || 0) + amount) * 100) / 100;
        const balance = Math.round(((Number(pledge[7]) || 0) - paid) * 100) / 100;
        pledge[8] = paid;
        pledge[9] = Math.max(0, balance);
        pledge[10] = balance <= 0 ? 'Kapandı' : 'Kısmi';
      }
      total += amount;
      collectionRows.push([
        makeId_('THS') + '-' + (index + 1), date, pledge[0], pledge[3], pledge[2], pledge[6], pledge[5], amount,
        method, note, session.email, new Date(), account.values[0], account.values[1]
      ].concat(collectionApprovalMeta_(session)));
    });

    const ss = getDb_();
    const collectionSheet = ss.getSheetByName(APP.sheets.collections);
    const firstAddedRow = collectionSheet.getLastRow() + 1;
    collectionSheet.getRange(firstAddedRow, 1, collectionRows.length, HEADERS.collections.length).setValues(fitRowsWidth_(collectionRows, HEADERS.collections.length));
    try {
      if (isApproverSession_(session) && pledgeRows.length) ss.getSheetByName(APP.sheets.pledges).getRange(2, 9, pledgeRows.length, 3).setValues(pledgeRows.map(function(r) { return [r[8], r[9], r[10]]; }));
    } catch (e) {
      collectionSheet.deleteRows(firstAddedRow, collectionRows.length);
      throw e;
    }
    total = Math.round(total * 100) / 100;
    audit_(session.email, isApproverSession_(session) ? 'TOPLU_TAHSİLAT_ONAYLANDI' : 'TOPLU_TAHSİLAT_ONAYA_GÖNDERİLDİ', 'Tahsilat', '', collectionRows.length + ' hareket / ' + total + ' TL / ' + account.values[1]);
    result = { ok:true, count:collectionRows.length, total:total, approvalStatus:isApproverSession_(session)?'ONAYLANDI':'BEKLİYOR' };
  });
  return result;
}

function saveQuickDonation(token, payload) {
  const session = requireSession_(token);
  payload = payload || {};
  const amount = positiveNumber_(payload.amount, 'Bağış tutarı');
  const date = parseDate_(payload.date, 'Bağış tarihi');
  const donationType = cleanText_(payload.donationType, 80);
  const fullName = cleanText_(payload.fullName, 120);
  const reference = isApproverSession_(session) ? cleanText_(payload.reference, 100) : session.reference;
  const account = findRowBy_(APP.sheets.cashAccounts, 1, cleanText_(payload.accountId, 60));
  if (!donationType || !fullName || !reference) throw new Error('Bağış türü, bağışçı ve referans zorunludur.');
  if (!account || account.values[4] !== true) throw new Error('Aktif bir kasa veya banka hesabı seçin.');
  const id = makeId_('HBG');
  withLock_(function() {
    appendRows_(getDb_().getSheetByName(APP.sheets.collections), [[
      id, date, '', fullName, donationType, reference, cleanText_(payload.payer, 120), amount,
      cleanText_(payload.method, 50), cleanText_(payload.note, 300), session.email, new Date(), account.values[0], account.values[1]
    ].concat(collectionApprovalMeta_(session))], HEADERS.collections.length);
    audit_(session.email, isApproverSession_(session) ? 'HIZLI_BAĞIŞ_ONAYLANDI' : 'HIZLI_BAĞIŞ_ONAYA_GÖNDERİLDİ', 'Doğrudan Gelir', id, fullName + ' / ' + amount + ' TL / ' + account.values[1]);
  });
  return {ok:true, approvalStatus:isApproverSession_(session)?'ONAYLANDI':'BEKLİYOR'};
}

function updateCollection(token, payload) {
  const session = requireApprover_(token);
  payload = payload || {};
  const id = cleanText_(payload.id, 60);
  const amount = positiveNumber_(payload.amount, 'Tahsilat tutarı');
  const date = parseDate_(payload.date, 'Tahsilat tarihi');
  const account = findRowBy_(APP.sheets.cashAccounts, 1, cleanText_(payload.accountId, 60));
  if (!account || account.values[4] !== true) throw new Error('Aktif bir kasa veya banka hesabı seçin.');
  withLock_(function() {
    const current = findRowBy_(APP.sheets.collections, 1, id);
    if (!current) throw new Error('Tahsilat bulunamadı.');
    const wasApproved = isCollectionApprovedRow_(current.values);
    const pledgeId = String(current.values[2] || '');
    const pledge = pledgeId ? findRowBy_(APP.sheets.pledges, 1, pledgeId) : null;
    if (pledgeId && !pledge) throw new Error('Bağlı taahhüt bulunamadı.');
    if (pledge && String(pledge.values[15] || 'AKTİF').toUpperCase() === 'ŞÜPHELİ') throw new Error('Bu kayıt şüpheli alacaklarda. Önce aktife geri alın.');
    if (pledge) {
      const allowed = Math.max(0, (Number(pledge.values[9]) || 0) + (wasApproved ? (Number(current.values[7]) || 0) : 0) - pendingAmountForPledge_(pledgeId, id));
      if (amount > allowed) throw new Error('Tahsilat kalan bakiyeden büyük olamaz.');
    }
    let directMeta = null;
    if (!pledge) {
      const donationType = cleanText_(payload.donationType, 80);
      const fullName = cleanText_(payload.fullName, 120);
      const reference = cleanText_(payload.reference, 100);
      if (!donationType || !fullName || !reference) throw new Error('Bağış türü, bağışçı ve referans zorunludur.');
      directMeta = [fullName, donationType, reference, cleanText_(payload.payer, 120)];
    }
    if (wasApproved) {
      const deltas = {};
      const oldAccountId = String(current.values[12] || '');
      if (oldAccountId) deltas[oldAccountId] = (deltas[oldAccountId] || 0) - (Number(current.values[7]) || 0);
      deltas[account.values[0]] = (deltas[account.values[0]] || 0) + amount;
      assertCashDeltas_(deltas, 'Tahsilat düzeltme');
    }
    const sh = getDb_().getSheetByName(APP.sheets.collections);
    sh.getRange(current.row, 2).setValue(date);
    if (directMeta) sh.getRange(current.row, 4, 1, 4).setValues([directMeta]);
    sh.getRange(current.row, 8, 1, 3).setValues([[amount, cleanText_(payload.method, 50), cleanText_(payload.note, 300)]]);
    sh.getRange(current.row, 13, 1, 2).setValues([[account.values[0], account.values[1]]]);
    resetRequestCache_();
    if (pledge) recalculatePledge_(pledgeId);
    audit_(session.email, 'DÜZELTİLDİ', 'Tahsilat', id, amount + ' TL');
  });
  return {ok:true};
}

/**
 * Tahsilatlar ve doğrudan teberrular için tek istekle toplu hücre düzenleme.
 * Tüm değişiklikler önce bellekte doğrulanır; doğrulama tamamlanmadan sayfaya
 * hiçbir veri yazılmaz. Böylece analiz ve bakiye hesapları yarım kalmaz.
 */
function bulkUpdateCollections(token, payload) {
  const session = requireApprover_(token);
  const items = payload && Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) throw new Error('Kaydedilecek değişiklik bulunamadı.');
  if (items.length > 3000) throw new Error('Tek seferde en fazla 3000 kayıt düzenlenebilir.');
  let result = null;

  withLock_(function() {
    const ss = getDb_();
    const sh = ss.getSheetByName(APP.sheets.collections);
    const lastRow = sh.getLastRow();
    if (lastRow < 2) throw new Error('Tahsilat kaydı bulunamadı.');
    const rows = sh.getRange(2, 1, lastRow - 1, HEADERS.collections.length).getValues();
    const rowIndex = {};
    rows.forEach(function(r, i) { rowIndex[String(r[0])] = i; });
    const accounts = {};
    optionalDataRows_(APP.sheets.cashAccounts).forEach(function(r) { accounts[String(r[0])] = r; });
    const seen = {};
    const affectedPledges = {};
    const cashDeltas = {};

    items.forEach(function(item) {
      item = item || {};
      const id = cleanText_(item.id, 60);
      if (!id || seen[id]) throw new Error('Geçersiz veya tekrarlanan tahsilat numarası: ' + id);
      seen[id] = true;
      if (rowIndex[id] == null) throw new Error('Tahsilat bulunamadı: ' + id);
      const changes = item.changes && typeof item.changes === 'object' ? item.changes : {};
      const has = function(key) { return Object.prototype.hasOwnProperty.call(changes, key); };
      const row = rows[rowIndex[id]];
      const oldRow = row.slice();
      const pledgeId = String(row[2] || '');

      if (has('date')) row[1] = parseDate_(changes.date, 'Tahsilat tarihi');
      if (has('fullName')) row[3] = cleanText_(changes.fullName, 120);
      if (has('donationType')) row[4] = cleanText_(changes.donationType, 80);
      if (has('reference')) row[5] = cleanText_(changes.reference, 100);
      if (has('payer')) row[6] = cleanText_(changes.payer, 120);
      if (has('amount')) row[7] = positiveNumber_(changes.amount, 'Tahsilat tutarı');
      if (has('method')) row[8] = cleanText_(changes.method, 50);
      if (has('note')) row[9] = cleanText_(changes.note, 300);
      if (has('receiptNo')) row[18] = cleanText_(changes.receiptNo, 100);
      if (has('group')) row[19] = cleanText_(changes.group, 100);
      if (has('activity')) row[20] = cleanText_(changes.activity, 120);
      if (has('phone')) row[21] = cleanText_(changes.phone, 30);

      const accountId = has('accountId') ? cleanText_(changes.accountId, 60) : String(row[12] || '');
      const account = accounts[accountId];
      if (!account || account[4] !== true) throw new Error(id + ': aktif bir kasa veya banka hesabı seçin.');
      row[12] = account[0];
      row[13] = account[1];

      if (!pledgeId && (!row[3] || !row[4] || !row[5])) {
        throw new Error(id + ': Teberru için hesap adı, nevi ve referans zorunludur.');
      }
      if (pledgeId) {
        const pledge = findRowBy_(APP.sheets.pledges, 1, pledgeId);
        if (!pledge) throw new Error(id + ': bağlı taahhüt bulunamadı.');
        if (String(pledge.values[15] || 'AKTİF').toUpperCase() === 'ŞÜPHELİ') throw new Error(id + ': bağlı taahhüt şüpheli alacaklarda.');
        affectedPledges[pledgeId] = pledge;
      }

      if (isCollectionApprovedRow_(oldRow)) {
        const oldAccountId = String(oldRow[12] || '');
        if (oldAccountId) cashDeltas[oldAccountId] = (cashDeltas[oldAccountId] || 0) - (Number(oldRow[7]) || 0);
        cashDeltas[accountId] = (cashDeltas[accountId] || 0) + (Number(row[7]) || 0);
      }
    });

    // Aynı taahhüde ait birden fazla satır birlikte değiştirildiğinde toplamı
    // tek tek değil, yeni tablonun bütünü üzerinden kontrol eder.
    const reservedByPledge = {};
    rows.forEach(function(r) {
      const pledgeId = String(r[2] || '');
      const status = collectionApprovalStatus_(r);
      if (pledgeId && status !== 'REDDEDİLDİ') reservedByPledge[pledgeId] = (reservedByPledge[pledgeId] || 0) + (Number(r[7]) || 0);
    });
    Object.keys(affectedPledges).forEach(function(pledgeId) {
      const pledgeAmount = Number(affectedPledges[pledgeId].values[7]) || 0;
      if ((reservedByPledge[pledgeId] || 0) > pledgeAmount + 0.001) {
        throw new Error(pledgeId + ': Tahsilat toplamı taahhüt tutarını aşamaz.');
      }
    });
    assertCashDeltas_(cashDeltas, 'Toplu tahsilat düzeltme');

    sh.getRange(2, 1, rows.length, HEADERS.collections.length).setValues(rows);
    resetRequestCache_();
    Object.keys(affectedPledges).forEach(recalculatePledge_);
    audit_(session.email, 'TOPLU_DÜZELTİLDİ', 'Tahsilat', '', items.length + ' kayıt');
    result = { ok:true, updated:items.length, recalculatedPledges:Object.keys(affectedPledges).length };
  });
  return result;
}

function deleteCollection(token, collectionId) {
  const session = requireApprover_(token);
  const id = cleanText_(collectionId, 60);
  withLock_(function() {
    const current = findRowBy_(APP.sheets.collections, 1, id);
    if (!current) throw new Error('Tahsilat bulunamadı.');
    const pledgeId = current.values[2];
    const pledge = findRowBy_(APP.sheets.pledges, 1, pledgeId);
    if (isCollectionApprovedRow_(current.values) && (!pledge || String(pledge.values[15] || 'AKTİF').toUpperCase() !== 'ŞÜPHELİ')) {
      const delta = {}; delta[current.values[12]] = -(Number(current.values[7]) || 0);
      assertCashDeltas_(delta, 'Tahsilat silme');
    }
    const detail = (Number(current.values[7]) || 0) + ' TL / ' + pledgeId;
    getDb_().getSheetByName(APP.sheets.collections).deleteRow(current.row);
    resetRequestCache_();
    if (pledge) recalculatePledge_(pledgeId);
    audit_(session.email, 'SİLİNDİ', 'Tahsilat', id, detail);
  });
  return {ok:true};
}

function approveCollection(token, collectionId) {
  const session = requireApprover_(token);
  const id = cleanText_(collectionId, 60);
  withLock_(function() {
    const current = findRowBy_(APP.sheets.collections, 1, id);
    if (!current) throw new Error('Tahsilat bulunamadı.');
    if (collectionApprovalStatus_(current.values) !== 'BEKLİYOR') throw new Error('Yalnızca onay bekleyen tahsilatlar onaylanabilir.');
    const account = findRowBy_(APP.sheets.cashAccounts, 1, current.values[12]);
    if (!account || account.values[4] !== true) throw new Error('Tahsilatın seçili kasa veya banka hesabı aktif değil. Önce kaydı düzeltin.');
    const pledgeId = String(current.values[2] || '');
    if (pledgeId) {
      const pledge = findRowBy_(APP.sheets.pledges, 1, pledgeId);
      if (!pledge) throw new Error('Bağlı taahhüt bulunamadı.');
      if (String(pledge.values[15] || 'AKTİF').toUpperCase() === 'ŞÜPHELİ') throw new Error('Taahhüt şüpheli alacaklarda. Önce aktife geri alın.');
      if ((Number(current.values[7]) || 0) > (Number(pledge.values[9]) || 0)) throw new Error('Tahsilat mevcut kalan bakiyeden büyük. Tutarı düzeltin.');
    }
    const sh = getDb_().getSheetByName(APP.sheets.collections);
    sh.getRange(current.row, 15, 1, 4).setValues([['ONAYLANDI', session.email, new Date(), '']]);
    resetRequestCache_();
    if (pledgeId) recalculatePledge_(pledgeId);
    audit_(session.email, 'ONAYLANDI', 'Tahsilat', id, (Number(current.values[7]) || 0) + ' TL / ' + current.values[3]);
  });
  return {ok:true};
}

function rejectCollection(token, collectionId, reason) {
  const session = requireApprover_(token);
  const id = cleanText_(collectionId, 60);
  const rejectionReason = cleanText_(reason, 300);
  if (!rejectionReason) throw new Error('Red nedeni zorunludur.');
  withLock_(function() {
    const current = findRowBy_(APP.sheets.collections, 1, id);
    if (!current) throw new Error('Tahsilat bulunamadı.');
    if (collectionApprovalStatus_(current.values) !== 'BEKLİYOR') throw new Error('Yalnızca onay bekleyen tahsilatlar reddedilebilir.');
    getDb_().getSheetByName(APP.sheets.collections).getRange(current.row, 15, 1, 4).setValues([['REDDEDİLDİ', session.email, new Date(), rejectionReason]]);
    audit_(session.email, 'REDDEDİLDİ', 'Tahsilat', id, rejectionReason);
  });
  return {ok:true};
}

function reopenCollectionApproval(token, collectionId) {
  const session = requireApprover_(token);
  const id = cleanText_(collectionId, 60);
  withLock_(function() {
    const current = findRowBy_(APP.sheets.collections, 1, id);
    if (!current) throw new Error('Tahsilat bulunamadı.');
    const status = collectionApprovalStatus_(current.values);
    if (status === 'BEKLİYOR') throw new Error('Tahsilat zaten onay bekliyor.');
    if (status === 'ONAYLANDI') {
      const delta = {}; delta[current.values[12]] = -(Number(current.values[7]) || 0);
      assertCashDeltas_(delta, 'Tahsilat onayını geri alma');
    }
    getDb_().getSheetByName(APP.sheets.collections).getRange(current.row, 15, 1, 4).setValues([['BEKLİYOR', '', '', '']]);
    resetRequestCache_();
    if (current.values[2]) recalculatePledge_(current.values[2]);
    audit_(session.email, 'ONAY_GERİ_ALINDI', 'Tahsilat', id, (Number(current.values[7]) || 0) + ' TL / ' + current.values[3]);
  });
  return {ok:true};
}

function setPledgeReceivableStatus(token, pledgeId, doubtful) {
  const session = requireAdmin_(token);
  const id = cleanText_(pledgeId, 60);
  withLock_(function() {
    const current = findRowBy_(APP.sheets.pledges, 1, id);
    if (!current) throw new Error('Taahhüt bulunamadı.');
    if (isStudentPledgeRow_(current.values)) throw new Error('Öğrenci tahakkukları şüpheli alacak işlemine alınamaz.');
    if (doubtful && (Number(current.values[9]) || 0) <= 0) throw new Error('Kalan bakiyesi olmayan kayıt şüpheli alacağa taşınamaz.');
    if (doubtful && String(current.values[15] || 'AKTİF').toUpperCase() !== 'ŞÜPHELİ') assertCashDeltas_(pledgeCollectionCashDeltas_(id, -1), 'Şüpheli alacağa taşıma');
    const sh = getDb_().getSheetByName(APP.sheets.pledges);
    if (sh.getLastColumn() < HEADERS.pledges.length) {
      const start = sh.getLastColumn() + 1;
      const added = HEADERS.pledges.slice(start - 1);
      sh.getRange(1, start, 1, added.length).setValues([added]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
    }
    sh.getRange(current.row, 16).setValue(doubtful ? 'ŞÜPHELİ' : 'AKTİF');
    audit_(session.email, doubtful ? 'ŞÜPHELİYE_TAŞINDI' : 'AKTİFE_ALINDI', 'Taahhüt', id, current.values[3]);
  });
  return {ok:true};
}

function deletePledge(token, pledgeId) {
  const session = requireAdmin_(token);
  const id = cleanText_(pledgeId, 60);
  let deletedCollections = 0;
  withLock_(function() {
    const current = findRowBy_(APP.sheets.pledges, 1, id);
    if (!current) throw new Error('Taahhüt bulunamadı.');
    if (String(current.values[15] || 'AKTİF').toUpperCase() !== 'ŞÜPHELİ') assertCashDeltas_(pledgeCollectionCashDeltas_(id, -1), 'Taahhüt silme');
    const ss = getDb_();
    const collectionSheet = ss.getSheetByName(APP.sheets.collections);
    const collectionRows = dataRows_(APP.sheets.collections);
    for (let i = collectionRows.length - 1; i >= 0; i--) {
      if (collectionRows[i][2] === id) {
        collectionSheet.deleteRow(i + 2);
        deletedCollections++;
      }
    }
    ss.getSheetByName(APP.sheets.pledges).deleteRow(current.row);
    const studentPlan = findRowBy_(APP.sheets.studentPlans, 2, id);
    if (studentPlan) ss.getSheetByName(APP.sheets.studentPlans).deleteRow(studentPlan.row);
    audit_(session.email, 'SİLİNDİ', 'Taahhüt', id, current.values[3] + ' / ' + deletedCollections + ' tahsilat hareketi');
  });
  return { deletedCollections:deletedCollections };
}

function deleteAllPledges(token, confirmation) {
  const session = requireAdmin_(token);
  if (String(confirmation || '').trim().toUpperCase() !== 'TÜMÜNÜ SİL') throw new Error('Toplu silme onayı geçersiz.');
  let pledgeCount = 0, collectionCount = 0, backupUrl = '';
  withLock_(function() {
    const ss = getDb_();
    const pledgeSheet = ss.getSheetByName(APP.sheets.pledges);
    const collectionSheet = ss.getSheetByName(APP.sheets.collections);
    pledgeCount = Math.max(0, pledgeSheet.getLastRow() - 1);
    collectionCount = Math.max(0, collectionSheet.getLastRow() - 1);
    const activeIds = {};
    dataRows_(APP.sheets.pledges).forEach(function(r) { if (String(r[15] || 'AKTİF').toUpperCase() !== 'ŞÜPHELİ') activeIds[r[0]] = true; });
    const deltas = {};
    dataRows_(APP.sheets.collections).forEach(function(r) {
      if (activeIds[r[2]] && r[12] && isCollectionApprovedRow_(r)) {
        deltas[r[12]] = (deltas[r[12]] || 0) - (Number(r[7]) || 0);
      }
    });
    assertCashDeltas_(deltas, 'Toplu taahhüt silme');
    backupUrl = backupPledgeData_(pledgeSheet, collectionSheet);
    if (pledgeCount) pledgeSheet.getRange(2, 1, pledgeCount, pledgeSheet.getLastColumn()).clearContent();
    if (collectionCount) collectionSheet.getRange(2, 1, collectionCount, collectionSheet.getLastColumn()).clearContent();
    const studentPlanSheet = ss.getSheetByName(APP.sheets.studentPlans);
    if (studentPlanSheet && studentPlanSheet.getLastRow() > 1) studentPlanSheet.getRange(2, 1, studentPlanSheet.getLastRow() - 1, studentPlanSheet.getLastColumn()).clearContent();
    audit_(session.email, 'TOPLU_SİLİNDİ', 'Taahhütler', '', pledgeCount + ' taahhüt / ' + collectionCount + ' tahsilat hareketi');
  });
  return { pledgeCount:pledgeCount, collectionCount:collectionCount, backupUrl:backupUrl };
}

function deleteAllDonations(token, confirmation) {
  const session = requireAdmin_(token);
  if (String(confirmation || '').trim().toUpperCase() !== 'TEBERRULARI SİL') throw new Error('Toplu teberru silme onayı geçersiz.');
  let donationCount = 0, total = 0, backupUrl = '';
  withLock_(function() {
    const ss = getDb_();
    const collectionSheet = ss.getSheetByName(APP.sheets.collections);
    const rows = dataRows_(APP.sheets.collections);
    const donations = rows.filter(function(r) { return !String(r[2] || '').trim(); });
    const remaining = rows.filter(function(r) { return String(r[2] || '').trim(); });
    donationCount = donations.length;
    if (!donationCount) return;
    const deltas = {};
    donations.forEach(function(r) {
      total = Math.round((total + (Number(r[7]) || 0)) * 100) / 100;
      if (r[12] && isCollectionApprovedRow_(r)) deltas[r[12]] = (deltas[r[12]] || 0) - (Number(r[7]) || 0);
    });
    assertCashDeltas_(deltas, 'Toplu teberru silme');
    backupUrl = backupDonationData_(donations);
    if (collectionSheet.getLastRow() > 1) collectionSheet.getRange(2, 1, collectionSheet.getLastRow() - 1, collectionSheet.getLastColumn()).clearContent();
    appendRows_(collectionSheet, remaining, HEADERS.collections.length);
    resetRequestCache_();
    audit_(session.email, 'TOPLU_SİLİNDİ', 'Teberrular', '', donationCount + ' kayıt / ' + total + ' TL');
  });
  return { donationCount:donationCount, total:total, backupUrl:backupUrl };
}

function backupDonationData_(rows) {
  const stamp = Utilities.formatDate(new Date(), 'Europe/Istanbul', 'yyyyMMdd-HHmmss');
  const backup = SpreadsheetApp.create('Teberru Yedeği ' + stamp);
  const sheet = backup.getSheets()[0];
  sheet.setName('Teberrular');
  const values = [HEADERS.collections].concat(rows || []);
  sheet.getRange(1, 1, values.length, HEADERS.collections.length).setValues(values);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.collections.length).setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
  return backup.getUrl();
}

function backupPledgeData_(pledgeSheet, collectionSheet) {
  const stamp = Utilities.formatDate(new Date(), 'Europe/Istanbul', 'yyyyMMdd-HHmmss');
  const backup = SpreadsheetApp.create('Tahsilat Sistemi Yedek ' + stamp);
  const first = backup.getSheets()[0];
  first.setName(APP.sheets.pledges);
  const pledgeValues = pledgeSheet.getDataRange().getValues();
  if (pledgeValues.length && pledgeValues[0].length) first.getRange(1, 1, pledgeValues.length, pledgeValues[0].length).setValues(pledgeValues);
  const second = backup.insertSheet(APP.sheets.collections);
  const collectionValues = collectionSheet.getDataRange().getValues();
  if (collectionValues.length && collectionValues[0].length) second.getRange(1, 1, collectionValues.length, collectionValues[0].length).setValues(collectionValues);
  first.setFrozenRows(1); second.setFrozenRows(1);
  return backup.getUrl();
}

function saveReferenceTarget(token, payload) {
  const session=requireAdmin_(token);payload=payload||{};
  const targetType=referenceTargetType_(payload.targetType);
  const reference=cleanText_(payload.reference,120), start=parseDate_(payload.start,'Başlangıç tarihi'), end=parseDate_(payload.end,'Bitiş tarihi');
  if(!reference) throw new Error('Referans adı zorunludur.');
  if(end<start) throw new Error('Bitiş tarihi başlangıçtan önce olamaz.');
  const pledgeTarget=targetType==='TEBERRU'?0:nonNegativeNumber_(payload.pledgeTarget,'Teberru hedefi'), collectionTarget=nonNegativeNumber_(payload.collectionTarget,targetType==='TEBERRU'?'Teberru hedefi':'Tahsilat hedefi');
  if(pledgeTarget<=0&&collectionTarget<=0) throw new Error('En az bir hedef sıfırdan büyük olmalıdır.');
  const duplicate=optionalDataRows_(APP.sheets.referenceTargets).some(function(r){return referenceTargetType_(r[9])===targetType&&referenceKey_(r[3])===referenceKey_(reference)&&isoDate_(r[1])===isoDate_(start)&&isoDate_(r[2])===isoDate_(end);});
  if(duplicate) throw new Error('Bu referans ve dönem için hedef zaten var.');
  const id=makeId_('HDF');
  getDb_().getSheetByName(APP.sheets.referenceTargets).appendRow([id,start,end,reference,pledgeTarget,collectionTarget,true,cleanText_(payload.note,300),new Date(),targetType]);
  audit_(session.email,'EKLENDİ',targetType==='TEBERRU'?'Teberru Hedefi':'Tahsilat Hedefi',id,reference);
  return {ok:true};
}

function saveBulkReferenceTargets(token, payload) {
  const session=requireAdmin_(token);payload=payload||{};
  const targetType=referenceTargetType_(payload.targetType);
  const range=targetMonthRange_(payload.month,'Hedef ayı');
  const pledgeTarget=targetType==='TEBERRU'?0:nonNegativeNumber_(payload.pledgeTarget,'Teberru hedefi');
  const collectionTarget=nonNegativeNumber_(payload.collectionTarget,targetType==='TEBERRU'?'Teberru hedefi':'Tahsilat hedefi');
  if(pledgeTarget<=0&&collectionTarget<=0) throw new Error('En az bir hedef sıfırdan büyük olmalıdır.');
  const source=Array.isArray(payload.references)?payload.references:[];
  if(!source.length) throw new Error('En az bir referans seçin.');
  if(source.length>300) throw new Error('Tek işlemde en fazla 300 referansa hedef verilebilir.');
  const names=[], seen={};
  source.forEach(function(value){const name=cleanText_(value,120),key=normalizeKey_(name);if(name&&!seen[key]){seen[key]=true;names.push(name);}});
  if(!names.length) throw new Error('Geçerli bir referans seçin.');
  let result=null;
  withLock_(function(){
    resetRequestCache_();
    const existing={};optionalDataRows_(APP.sheets.referenceTargets).forEach(function(r){existing[referenceTargetType_(r[9])+'|'+referenceKey_(r[3])+'|'+isoDate_(r[1])+'|'+isoDate_(r[2])]=true;});
    const rows=[];let skipped=0;const note=cleanText_(payload.note,300);
    names.forEach(function(name){const key=targetType+'|'+normalizeKey_(name)+'|'+range.startIso+'|'+range.endIso;if(existing[key]){skipped++;return;}existing[key]=true;rows.push([makeId_('HDF'),range.start,range.end,name,pledgeTarget,collectionTarget,true,note,new Date(),targetType]);});
    if(rows.length) appendRows_(getDb_().getSheetByName(APP.sheets.referenceTargets),rows,HEADERS.referenceTargets.length);
    audit_(session.email,'TOPLU_EKLENDİ','Referans Hedefleri',range.key,rows.length+' hedef / '+skipped+' atlandı');
    result={ok:true,created:rows.length,skipped:skipped,period:range.label};
  });
  return result;
}

function copyReferenceTargetsMonth(token, payload) {
  const session=requireAdmin_(token);payload=payload||{};
  const targetType=referenceTargetType_(payload.targetType);
  const source=targetMonthRange_(payload.sourceMonth,'Kaynak ay');
  const target=targetMonthRange_(payload.targetMonth,'Hedef ay');
  if(source.key===target.key) throw new Error('Kaynak ve hedef ay aynı olamaz.');
  let result=null;
  withLock_(function(){
    resetRequestCache_();
    const all=optionalDataRows_(APP.sheets.referenceTargets);
    const sourceRows=all.filter(function(r){return r[6]===true&&referenceTargetType_(r[9])===targetType&&isoDate_(r[1])===source.startIso&&isoDate_(r[2])===source.endIso;});
    if(!sourceRows.length) throw new Error(source.label+' döneminde devredilecek aktif hedef bulunamadı.');
    const existing={};all.forEach(function(r){existing[referenceTargetType_(r[9])+'|'+normalizeKey_(r[3])+'|'+isoDate_(r[1])+'|'+isoDate_(r[2])]=true;});
    const rows=[];let skipped=0;
    sourceRows.forEach(function(r){const key=targetType+'|'+referenceKey_(r[3])+'|'+target.startIso+'|'+target.endIso;if(existing[key]){skipped++;return;}existing[key]=true;const sourceNote=cleanText_(r[7],220);const carryNote=source.label+' döneminden devredildi';rows.push([makeId_('HDF'),target.start,target.end,r[3],Number(r[4])||0,Number(r[5])||0,true,cleanText_((sourceNote?sourceNote+' · ':'')+carryNote,300),new Date(),targetType]);});
    if(rows.length) appendRows_(getDb_().getSheetByName(APP.sheets.referenceTargets),rows,HEADERS.referenceTargets.length);
    audit_(session.email,'AYA_DEVREDİLDİ','Referans Hedefleri',source.key+' -> '+target.key,rows.length+' hedef / '+skipped+' atlandı');
    result={ok:true,created:rows.length,skipped:skipped,sourcePeriod:source.label,targetPeriod:target.label};
  });
  return result;
}

function updateReferenceTarget(token,payload) {
  const session=requireAdmin_(token);payload=payload||{};
  const id=cleanText_(payload.id,60), row=findRowBy_(APP.sheets.referenceTargets,1,id);
  if(!row) throw new Error('Referans hedefi bulunamadı.');
  const targetType=referenceTargetType_(payload.targetType||row.values[9]);
  const reference=cleanText_(payload.reference,120), start=parseDate_(payload.start,'Başlangıç tarihi'), end=parseDate_(payload.end,'Bitiş tarihi');
  if(!reference) throw new Error('Referans adı zorunludur.');
  if(end<start) throw new Error('Bitiş tarihi başlangıçtan önce olamaz.');
  const pledgeTarget=targetType==='TEBERRU'?0:nonNegativeNumber_(payload.pledgeTarget,'Teberru hedefi'), collectionTarget=nonNegativeNumber_(payload.collectionTarget,targetType==='TEBERRU'?'Teberru hedefi':'Tahsilat hedefi');
  if(pledgeTarget<=0&&collectionTarget<=0) throw new Error('En az bir hedef sıfırdan büyük olmalıdır.');
  const duplicate=optionalDataRows_(APP.sheets.referenceTargets).some(function(r){return r[0]!==id&&referenceTargetType_(r[9])===targetType&&referenceKey_(r[3])===referenceKey_(reference)&&isoDate_(r[1])===isoDate_(start)&&isoDate_(r[2])===isoDate_(end);});
  if(duplicate) throw new Error('Bu referans ve dönem için başka bir hedef var.');
  getDb_().getSheetByName(APP.sheets.referenceTargets).getRange(row.row,2,1,9).setValues([[start,end,reference,pledgeTarget,collectionTarget,row.values[6]===true,cleanText_(payload.note,300),row.values[8]||new Date(),targetType]]);
  audit_(session.email,'DÜZELTİLDİ','Referans Hedefi',id,reference);
  return {ok:true};
}

function setReferenceTargetActive(token,targetId,active) {
  const session=requireAdmin_(token), row=findRowBy_(APP.sheets.referenceTargets,1,cleanText_(targetId,60));
  if(!row) throw new Error('Referans hedefi bulunamadı.');
  getDb_().getSheetByName(APP.sheets.referenceTargets).getRange(row.row,7).setValue(Boolean(active));
  audit_(session.email,active?'AKTİF':'PASİF','Referans Hedefi',targetId,row.values[3]);
  return {ok:true};
}

function deleteReferenceTarget(token,targetId) {
  const session=requireAdmin_(token), row=findRowBy_(APP.sheets.referenceTargets,1,cleanText_(targetId,60));
  if(!row) throw new Error('Referans hedefi bulunamadı.');
  getDb_().getSheetByName(APP.sheets.referenceTargets).deleteRow(row.row);
  audit_(session.email,'SİLİNDİ','Referans Hedefi',targetId,row.values[3]);
  return {ok:true};
}

function saveCashAccount(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const name = cleanText_(payload.name, 100);
  const type = cleanText_(payload.type, 50);
  const opening = flexibleNumber_(payload.openingBalance);
  if (!name || !type) throw new Error('Hesap adı ve hesap türü zorunludur.');
  if (!isFinite(opening) || opening < 0) throw new Error('Açılış bakiyesi sıfırdan küçük olamaz.');
  const id = makeId_('HSP');
  getDb_().getSheetByName(APP.sheets.cashAccounts).appendRow([id, name, type, Math.round(opening*100)/100, true, cleanText_(payload.note, 300), new Date()]);
  audit_(session.email, 'EKLENDİ', 'Kasa/Banka Hesabı', id, name);
  return {ok:true};
}

function updateCashAccount(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const id = cleanText_(payload.id, 60);
  const row = findRowBy_(APP.sheets.cashAccounts, 1, id);
  if (!row) throw new Error('Hesap bulunamadı.');
  const name = cleanText_(payload.name, 100);
  const type = cleanText_(payload.type, 50);
  const opening = flexibleNumber_(payload.openingBalance);
  if (!name || !type) throw new Error('Hesap adı ve hesap türü zorunludur.');
  if (!isFinite(opening) || opening < 0) throw new Error('Açılış bakiyesi sıfırdan küçük olamaz.');
  const after = cashAccountCurrentBalance_(id) - (Number(row.values[3]) || 0) + opening;
  if (after < 0) throw new Error('Bu açılış bakiyesi hesabı eksiye düşürür.');
  const sh = getDb_().getSheetByName(APP.sheets.cashAccounts);
  sh.getRange(row.row, 2, 1, 3).setValues([[name, type, Math.round(opening * 100) / 100]]);
  sh.getRange(row.row, 6).setValue(cleanText_(payload.note, 300));
  updateAccountNameReferences_(id, name);
  audit_(session.email, 'DÜZELTİLDİ', 'Kasa/Banka Hesabı', id, name);
  return {ok:true};
}

function setCashAccountActive(token, accountId, active) {
  const session = requireAdmin_(token);
  const row = findRowBy_(APP.sheets.cashAccounts, 1, cleanText_(accountId, 60));
  if (!row) throw new Error('Hesap bulunamadı.');
  getDb_().getSheetByName(APP.sheets.cashAccounts).getRange(row.row, 5).setValue(Boolean(active));
  audit_(session.email, active ? 'AKTİF' : 'PASİF', 'Kasa/Banka Hesabı', accountId, row.values[1]);
  return {ok:true};
}

function saveLoan(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const lender = cleanText_(payload.lender, 120);
  const amount = positiveNumber_(payload.amount, 'Borç tutarı');
  const date = parseDate_(payload.date, 'Borç alım tarihi');
  const account = findRowBy_(APP.sheets.cashAccounts, 1, cleanText_(payload.accountId, 60));
  if (!lender) throw new Error('Borç veren kişi veya kurum zorunludur.');
  if (!account || account.values[4] !== true) throw new Error('Aktif bir kasa veya banka hesabı seçin.');
  const id = makeId_('BRC');
  withLock_(function() {
    getDb_().getSheetByName(APP.sheets.loans).appendRow([
      id, date, lender, amount, 0, amount, 'Açık', account.values[0], account.values[1], cleanText_(payload.note, 300), new Date()
    ]);
    audit_(session.email, 'BORÇ_ALINDI', 'Borç', id, lender + ' / ' + amount + ' TL / ' + account.values[1]);
  });
  return {ok:true};
}

function updateLoan(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const id = cleanText_(payload.id, 60);
  const current = findRowBy_(APP.sheets.loans, 1, id);
  if (!current) throw new Error('Borç kaydı bulunamadı.');
  const lender = cleanText_(payload.lender, 120);
  const amount = positiveNumber_(payload.amount, 'Borç tutarı');
  const date = parseDate_(payload.date, 'Borç alım tarihi');
  const account = findRowBy_(APP.sheets.cashAccounts, 1, cleanText_(payload.accountId, 60));
  if (!lender) throw new Error('Borç veren kişi veya kurum zorunludur.');
  if (!account || account.values[4] !== true) throw new Error('Aktif bir kasa veya banka hesabı seçin.');
  const repaid = Number(current.values[4]) || 0;
  if (amount < repaid) throw new Error('Borç tutarı geri ödenmiş tutardan küçük olamaz.');
  const deltas = {};
  deltas[current.values[7]] = (deltas[current.values[7]] || 0) - (Number(current.values[3]) || 0);
  deltas[account.values[0]] = (deltas[account.values[0]] || 0) + amount;
  assertCashDeltas_(deltas, 'Borç düzeltme');
  const remaining = Math.round((amount - repaid) * 100) / 100;
  const status = remaining <= 0 ? 'Kapandı' : (repaid > 0 ? 'Kısmi' : 'Açık');
  const ss = getDb_();
  ss.getSheetByName(APP.sheets.loans).getRange(current.row, 2, 1, 9).setValues([[date,lender,amount,repaid,remaining,status,account.values[0],account.values[1],cleanText_(payload.note,300)]]);
  const repaymentSheet = ss.getSheetByName(APP.sheets.loanRepayments);
  dataRows_(APP.sheets.loanRepayments).forEach(function(r,index){if(r[2]===id)repaymentSheet.getRange(index+2,4).setValue(lender);});
  audit_(session.email, 'DÜZELTİLDİ', 'Borç', id, lender + ' / ' + amount + ' TL');
  return {ok:true};
}

function saveLoanRepayment(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const loanId = cleanText_(payload.loanId, 60);
  const amount = positiveNumber_(payload.amount, 'Geri ödeme tutarı');
  const date = parseDate_(payload.date, 'Geri ödeme tarihi');
  const accountId = cleanText_(payload.accountId, 60);
  const account = findRowBy_(APP.sheets.cashAccounts, 1, accountId);
  if (!account || account.values[4] !== true) throw new Error('Aktif bir kasa veya banka hesabı seçin.');
  const id = makeId_('BRH');
  withLock_(function() {
    const loan = findRowBy_(APP.sheets.loans, 1, loanId);
    if (!loan) throw new Error('Borç kaydı bulunamadı.');
    if (amount > (Number(loan.values[5]) || 0)) throw new Error('Geri ödeme kalan borçtan büyük olamaz.');
    const available = cashAccountCurrentBalance_(accountId);
    if (amount > available) throw new Error('Seçilen hesapta yeterli bakiye yok. Kullanılabilir bakiye: ' + moneyText_(available));
    const ss = getDb_();
    ss.getSheetByName(APP.sheets.loanRepayments).appendRow([
      id, date, loanId, loan.values[2], amount, cleanText_(payload.method, 50), cleanText_(payload.note, 300), new Date(), account.values[0], account.values[1]
    ]);
    recalculateLoan_(loanId);
    audit_(session.email, 'BORÇ_ÖDENDİ', 'Borç Geri Ödemesi', id, loan.values[2] + ' / ' + amount + ' TL');
  });
  return {ok:true};
}

function updateLoanRepayment(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const id = cleanText_(payload.id, 60);
  const current = findRowBy_(APP.sheets.loanRepayments, 1, id);
  if (!current) throw new Error('Borç geri ödeme hareketi bulunamadı.');
  const loan = findRowBy_(APP.sheets.loans, 1, current.values[2]);
  if (!loan) throw new Error('Bağlı borç kaydı bulunamadı.');
  const amount = positiveNumber_(payload.amount, 'Geri ödeme tutarı');
  const allowed = (Number(loan.values[5]) || 0) + (Number(current.values[4]) || 0);
  if (amount > allowed) throw new Error('Geri ödeme kalan borçtan büyük olamaz.');
  const date = parseDate_(payload.date, 'Geri ödeme tarihi');
  const accountId = cleanText_(payload.accountId, 60);
  const account = findRowBy_(APP.sheets.cashAccounts, 1, accountId);
  if (!account || account.values[4] !== true) throw new Error('Aktif bir kasa veya banka hesabı seçin.');
  const available = cashAccountCurrentBalance_(accountId) + (current.values[8] === accountId ? (Number(current.values[4]) || 0) : 0);
  if (amount > available) throw new Error('Seçilen hesapta yeterli bakiye yok. Kullanılabilir bakiye: ' + moneyText_(available));
  const sh = getDb_().getSheetByName(APP.sheets.loanRepayments);
  sh.getRange(current.row, 2).setValue(date);
  sh.getRange(current.row, 5, 1, 3).setValues([[amount,cleanText_(payload.method,50),cleanText_(payload.note,300)]]);
  sh.getRange(current.row, 9, 1, 2).setValues([[account.values[0],account.values[1]]]);
  recalculateLoan_(current.values[2]);
  audit_(session.email, 'DÜZELTİLDİ', 'Borç Geri Ödemesi', id, amount + ' TL');
  return {ok:true};
}

function deleteLoanRepayment(token, repaymentId) {
  const session = requireAdmin_(token);
  const id = cleanText_(repaymentId, 60);
  withLock_(function() {
    const row = findRowBy_(APP.sheets.loanRepayments, 1, id);
    if (!row) throw new Error('Borç geri ödeme hareketi bulunamadı.');
    const loanId = row.values[2];
    getDb_().getSheetByName(APP.sheets.loanRepayments).deleteRow(row.row);
    recalculateLoan_(loanId);
    audit_(session.email, 'SİLİNDİ', 'Borç Geri Ödemesi', id, row.values[3] + ' / ' + row.values[4] + ' TL');
  });
  return {ok:true};
}

function deleteLoan(token, loanId) {
  const session = requireAdmin_(token);
  const id = cleanText_(loanId, 60);
  withLock_(function() {
    const row = findRowBy_(APP.sheets.loans, 1, id);
    if (!row) throw new Error('Borç kaydı bulunamadı.');
    if (dataRows_(APP.sheets.loanRepayments).some(function(r) { return r[2] === id; })) throw new Error('Bu borca bağlı geri ödeme var. Önce geri ödeme hareketlerini silin.');
    const balanceAfterDelete = cashAccountCurrentBalance_(row.values[7]) - (Number(row.values[3]) || 0);
    if (balanceAfterDelete < 0) throw new Error('Bu borç silinirse bağlı kasa/banka hesabı eksiye düşer. Önce hesaba gelir veya başka bir borç girişi kaydedin.');
    getDb_().getSheetByName(APP.sheets.loans).deleteRow(row.row);
    audit_(session.email, 'SİLİNDİ', 'Borç', id, row.values[2] + ' / ' + row.values[3] + ' TL');
  });
  return {ok:true};
}

function saveStaffPlan(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const name = cleanText_(payload.name, 120);
  const paymentType = cleanText_(payload.paymentType, 100);
  const amount = positiveNumber_(payload.amount, 'Aylık tutar');
  if (!name || !paymentType) throw new Error('Personel ve ödeme türü zorunludur.');
  const sh = getDb_().getSheetByName(APP.sheets.staffPlans);
  if (!sh) throw new Error('Önce upgradeSystem işlevini bir kez çalıştırın.');
  const id = makeId_('PLN');
  sh.appendRow([id, name, paymentType, amount, true, cleanText_(payload.note, 300), new Date()]);
  audit_(session.email, 'EKLENDİ', 'Personel Aylık Planı', id, name + ' / ' + amount + ' TL');
  return {ok:true};
}

function updateStaffPlan(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const id = cleanText_(payload.id,60);
  const row = findRowBy_(APP.sheets.staffPlans,1,id);
  if(!row) throw new Error('Personel aylık planı bulunamadı.');
  const name=cleanText_(payload.name,120), paymentType=cleanText_(payload.paymentType,100);
  const amount=positiveNumber_(payload.amount,'Aylık tutar');
  if(!name||!paymentType) throw new Error('Personel ve ödeme türü zorunludur.');
  const duplicate=optionalDataRows_(APP.sheets.staffPlans).some(function(r){return r[0]!==id&&normalizeKey_(r[1])===normalizeKey_(name)&&normalizeKey_(r[2])===normalizeKey_(paymentType);});
  if(duplicate) throw new Error('Bu personel ve ödeme türü için başka bir plan var.');
  getDb_().getSheetByName(APP.sheets.staffPlans).getRange(row.row,2,1,5).setValues([[name,paymentType,amount,row.values[4]===true,cleanText_(payload.note,300)]]);
  audit_(session.email,'DÜZELTİLDİ','Personel Aylık Planı',id,name+' / '+paymentType);
  return {ok:true};
}

function saveStaffPlanSet(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const name = cleanText_(payload.name, 120);
  const note = cleanText_(payload.note, 300);
  const amounts = payload.amounts || {};
  if (!name) throw new Error('Personel adı zorunludur.');

  const selected = STAFF_PAYMENT_TYPES.map(function(type) {
    const amount = Number(amounts[type]) || 0;
    return { type:type, amount:Math.round(amount * 100) / 100 };
  }).filter(function(x) { return x.amount > 0; });
  if (!selected.length) throw new Error('En az bir ödeme türü için tutar girin.');

  withLock_(function() {
    const sh = getDb_().getSheetByName(APP.sheets.staffPlans);
    if (!sh) throw new Error('Önce upgradeSystem işlevini bir kez çalıştırın.');
    const rows = optionalDataRows_(APP.sheets.staffPlans);
    selected.forEach(function(item) {
      const index = rows.findIndex(function(r) {
        return normalizeKey_(r[1]) === normalizeKey_(name) && normalizeKey_(r[2]) === normalizeKey_(item.type);
      });
      if (index >= 0) {
        sh.getRange(index + 2, 4, 1, 3).setValues([[item.amount, true, note]]);
      } else {
        sh.appendRow([makeId_('PLN'), name, item.type, item.amount, true, note, new Date()]);
      }
    });
    audit_(session.email, 'TOPLU_PLAN_KAYDI', 'Personel Aylık Planı', name, selected.length + ' ödeme türü');
  });
  return {ok:true};
}

function setStaffPlanActive(token, planId, active) {
  const session = requireAdmin_(token);
  const row = findRowBy_(APP.sheets.staffPlans, 1, cleanText_(planId, 60));
  if (!row) throw new Error('Aylık plan bulunamadı.');
  getDb_().getSheetByName(APP.sheets.staffPlans).getRange(row.row, 5).setValue(Boolean(active));
  audit_(session.email, active ? 'AKTİF' : 'PASİF', 'Personel Aylık Planı', planId, row.values[1]);
  return {ok:true};
}

function generateMonthlyStaffCommitments(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const month = String(payload.month || '');
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error('Ay seçimi geçersiz.');
  const parts = month.split('-').map(Number);
  const year = parts[0], monthIndex = parts[1] - 1;
  const period = monthLabel_(year, monthIndex);
  const dueDate = payload.dueDate ? parseDate_(payload.dueDate, 'Vade tarihi') : new Date(year, monthIndex + 1, 0, 12, 0, 0);
  const staffName = cleanText_(payload.staffName, 120);
  const requestedTypes = Array.isArray(payload.paymentTypes)
    ? payload.paymentTypes.map(function(x) { return cleanText_(x, 100); })
    : STAFF_PAYMENT_TYPES.slice();
  const plans = optionalDataRows_(APP.sheets.staffPlans).filter(function(r) {
    if (r[4] !== true) return false;
    if (staffName && normalizeKey_(r[1]) !== normalizeKey_(staffName)) return false;
    return requestedTypes.some(function(type) { return normalizeKey_(type) === normalizeKey_(r[2]); });
  });
  if (!plans.length) throw new Error('Aktif aylık personel planı bulunamadı.');
  let created = 0, skipped = 0;
  withLock_(function() {
    const ss = getDb_();
    const sh = ss.getSheetByName(APP.sheets.staffCommitments);
    const existing = dataRows_(APP.sheets.staffCommitments);
    const rows = [];
    plans.forEach(plan => {
      const duplicate = existing.some(function(r) {
        return r[3] === period && normalizeKey_(r[1]) === normalizeKey_(plan[1]) && normalizeKey_(r[2]) === normalizeKey_(plan[2]);
      });
      if (duplicate) { skipped++; return; }
      const total = Number(plan[3]) || 0;
      rows.push([makeId_('PRS'), plan[1], plan[2], period, total, 0, total, dueDate, 'Ödenmedi', plan[5], new Date(), plan[0]]);
      created++;
    });
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.staffCommitments.length).setValues(rows);
    audit_(session.email, 'AY_OLUŞTURULDU', 'Personel Ödemeleri', period, created + ' kayıt, ' + skipped + ' atlandı');
  });
  return { created:created, skipped:skipped, period:period };
}

function copyStaffCommitmentsMonth(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const source = parseMonth_(payload.sourceMonth, 'Kaynak ay');
  const target = parseMonth_(payload.targetMonth, 'Hedef ay');
  const sourcePeriod = monthLabel_(source.year, source.monthIndex);
  const targetPeriod = monthLabel_(target.year, target.monthIndex);
  if (sourcePeriod === targetPeriod) throw new Error('Kaynak ve hedef ay aynı olamaz.');
  const dueDate = payload.dueDate
    ? parseDate_(payload.dueDate, 'Vade tarihi')
    : new Date(target.year, target.monthIndex + 1, 0, 12, 0, 0);
  const staffName = cleanText_(payload.staffName, 120);
  const requestedTypes = Array.isArray(payload.paymentTypes)
    ? payload.paymentTypes.map(function(x) { return cleanText_(x, 100); })
    : STAFF_PAYMENT_TYPES.slice();
  let created = 0, skipped = 0;

  withLock_(function() {
    const sh = getDb_().getSheetByName(APP.sheets.staffCommitments);
    const existing = dataRows_(APP.sheets.staffCommitments);
    const sourceRows = existing.filter(function(r) {
      if (r[3] !== sourcePeriod) return false;
      if (staffName && normalizeKey_(r[1]) !== normalizeKey_(staffName)) return false;
      return requestedTypes.some(function(type) { return normalizeKey_(type) === normalizeKey_(r[2]); });
    });
    if (!sourceRows.length) throw new Error(sourcePeriod + ' döneminde kopyalanacak tahakkuk bulunamadı.');

    const rows = [];
    sourceRows.forEach(function(r) {
      const duplicate = existing.some(function(x) {
        return x[3] === targetPeriod && normalizeKey_(x[1]) === normalizeKey_(r[1]) && normalizeKey_(x[2]) === normalizeKey_(r[2]);
      });
      if (duplicate) { skipped++; return; }
      const total = Number(r[4]) || 0;
      rows.push([makeId_('PRS'), r[1], r[2], targetPeriod, total, 0, total, dueDate, 'Ödenmedi', r[9], new Date(), r[11] || '']);
      created++;
    });
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.staffCommitments.length).setValues(rows);
    audit_(session.email, 'AY_KOPYALANDI', 'Personel Ödemeleri', sourcePeriod + ' -> ' + targetPeriod, created + ' kayıt, ' + skipped + ' atlandı');
  });
  return { created:created, skipped:skipped, sourcePeriod:sourcePeriod, targetPeriod:targetPeriod };
}

function saveTeacherPlan(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const name = cleanText_(payload.name, 120);
  const lessonName = cleanText_(payload.lessonName, 100);
  const lessonHours = positiveNumber_(payload.lessonHours, 'Aylık ders saati');
  const hourlyRate = positiveNumber_(payload.hourlyRate, 'Saatlik ücret');
  const note = cleanText_(payload.note, 300);
  if (!name || !lessonName) throw new Error('Öğretmen ve ders adı zorunludur.');
  withLock_(function() {
    const sh = getDb_().getSheetByName(APP.sheets.teacherPlans);
    if (!sh) throw new Error('Önce upgradeSystem işlevini bir kez çalıştırın.');
    const rows = optionalDataRows_(APP.sheets.teacherPlans);
    const index = rows.findIndex(function(r) {
      return normalizeKey_(r[1]) === normalizeKey_(name) && normalizeKey_(r[2]) === normalizeKey_(lessonName);
    });
    if (index >= 0) {
      sh.getRange(index + 2, 4, 1, 4).setValues([[lessonHours, hourlyRate, true, note]]);
    } else {
      sh.appendRow([makeId_('OPL'), name, lessonName, lessonHours, hourlyRate, true, note, new Date()]);
    }
    audit_(session.email, 'PLAN_KAYDI', 'Öğretmen Aylık Planı', name, lessonName + ' / ' + lessonHours + ' saat');
  });
  return {ok:true};
}

function updateTeacherPlan(token, payload) {
  const session=requireAdmin_(token);
  payload=payload||{};
  const id=cleanText_(payload.id,60);
  const row=findRowBy_(APP.sheets.teacherPlans,1,id);
  if(!row) throw new Error('Öğretmen aylık planı bulunamadı.');
  const name=cleanText_(payload.name,120), lessonName=cleanText_(payload.lessonName,100);
  const hours=positiveNumber_(payload.lessonHours,'Aylık ders saati'), rate=positiveNumber_(payload.hourlyRate,'Saatlik ücret');
  if(!name||!lessonName) throw new Error('Öğretmen ve ders adı zorunludur.');
  const duplicate=optionalDataRows_(APP.sheets.teacherPlans).some(function(r){return r[0]!==id&&normalizeKey_(r[1])===normalizeKey_(name)&&normalizeKey_(r[2])===normalizeKey_(lessonName);});
  if(duplicate) throw new Error('Bu öğretmen ve ders için başka bir plan var.');
  getDb_().getSheetByName(APP.sheets.teacherPlans).getRange(row.row,2,1,6).setValues([[name,lessonName,hours,rate,row.values[5]===true,cleanText_(payload.note,300)]]);
  audit_(session.email,'DÜZELTİLDİ','Öğretmen Aylık Planı',id,name+' / '+lessonName);
  return {ok:true};
}

function setTeacherPlanActive(token, planId, active) {
  const session = requireAdmin_(token);
  const row = findRowBy_(APP.sheets.teacherPlans, 1, cleanText_(planId, 60));
  if (!row) throw new Error('Öğretmen aylık planı bulunamadı.');
  getDb_().getSheetByName(APP.sheets.teacherPlans).getRange(row.row, 6).setValue(Boolean(active));
  audit_(session.email, active ? 'AKTİF' : 'PASİF', 'Öğretmen Aylık Planı', planId, row.values[1]);
  return {ok:true};
}

function generateMonthlyTeacherAccruals(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const parsed = parseMonth_(payload.month, 'Ay');
  const period = monthLabel_(parsed.year, parsed.monthIndex);
  const dueDate = payload.dueDate ? parseDate_(payload.dueDate, 'Vade tarihi') : new Date(parsed.year, parsed.monthIndex + 1, 0, 12, 0, 0);
  const teacherName = cleanText_(payload.teacherName, 120);
  const plans = optionalDataRows_(APP.sheets.teacherPlans).filter(function(r) {
    return r[5] === true && (!teacherName || normalizeKey_(r[1]) === normalizeKey_(teacherName));
  });
  if (!plans.length) throw new Error('Aktif öğretmen aylık planı bulunamadı.');
  let created = 0, skipped = 0;
  withLock_(function() {
    const sh = getDb_().getSheetByName(APP.sheets.teacherCommitments);
    const existing = dataRows_(APP.sheets.teacherCommitments);
    const rows = [];
    plans.forEach(function(plan) {
      const duplicate = existing.some(function(r) {
        return r[3] === period && normalizeKey_(r[1]) === normalizeKey_(plan[1]) && normalizeKey_(r[2]) === normalizeKey_(plan[2]);
      });
      if (duplicate) { skipped++; return; }
      const hours = Number(plan[3]) || 0;
      const rate = Number(plan[4]) || 0;
      const total = Math.round(hours * rate * 100) / 100;
      rows.push([makeId_('OGR'), plan[1], plan[2], period, total, 0, total, dueDate, 'Ödenmedi', plan[6], new Date(), hours, rate, plan[0]]);
      created++;
    });
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.teacherCommitments.length).setValues(rows);
    audit_(session.email, 'AY_OLUŞTURULDU', 'Öğretmen Tahakkukları', period, created + ' kayıt, ' + skipped + ' atlandı');
  });
  return { created:created, skipped:skipped, period:period };
}

function copyTeacherAccrualsMonth(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const source = parseMonth_(payload.sourceMonth, 'Kaynak ay');
  const target = parseMonth_(payload.targetMonth, 'Hedef ay');
  const sourcePeriod = monthLabel_(source.year, source.monthIndex);
  const targetPeriod = monthLabel_(target.year, target.monthIndex);
  if (sourcePeriod === targetPeriod) throw new Error('Kaynak ve hedef ay aynı olamaz.');
  const dueDate = payload.dueDate ? parseDate_(payload.dueDate, 'Vade tarihi') : new Date(target.year, target.monthIndex + 1, 0, 12, 0, 0);
  const teacherName = cleanText_(payload.teacherName, 120);
  let created = 0, skipped = 0;
  withLock_(function() {
    const sh = getDb_().getSheetByName(APP.sheets.teacherCommitments);
    const existing = dataRows_(APP.sheets.teacherCommitments);
    const sourceRows = existing.filter(function(r) {
      return r[3] === sourcePeriod && (!teacherName || normalizeKey_(r[1]) === normalizeKey_(teacherName));
    });
    if (!sourceRows.length) throw new Error(sourcePeriod + ' döneminde kopyalanacak öğretmen tahakkuku bulunamadı.');
    const rows = [];
    sourceRows.forEach(function(r) {
      const duplicate = existing.some(function(x) {
        return x[3] === targetPeriod && normalizeKey_(x[1]) === normalizeKey_(r[1]) && normalizeKey_(x[2]) === normalizeKey_(r[2]);
      });
      if (duplicate) { skipped++; return; }
      const total = Number(r[4]) || 0;
      rows.push([makeId_('OGR'), r[1], r[2], targetPeriod, total, 0, total, dueDate, 'Ödenmedi', r[9], new Date(), Number(r[11])||0, Number(r[12])||0, r[13]||'']);
      created++;
    });
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.teacherCommitments.length).setValues(rows);
    audit_(session.email, 'AY_KOPYALANDI', 'Öğretmen Tahakkukları', sourcePeriod + ' -> ' + targetPeriod, created + ' kayıt, ' + skipped + ' atlandı');
  });
  return { created:created, skipped:skipped, sourcePeriod:sourcePeriod, targetPeriod:targetPeriod };
}

function saveExpenseCommitment(token, kind, payload) {
  const session = requireAdmin_(token);
  const cfg = expenseConfig_(kind);
  payload = payload || {};
  const lessonHours = kind === 'teacher' ? positiveNumber_(payload.lessonHours, 'Ders saati') : 0;
  const hourlyRate = kind === 'teacher' ? positiveNumber_(payload.hourlyRate, 'Saatlik ücret') : 0;
  const total = kind === 'teacher' ? Math.round(lessonHours * hourlyRate * 100) / 100 : positiveNumber_(payload.total, 'Toplam tutar');
  const name = cleanText_(payload.name, 120);
  if (!name) throw new Error(cfg.label + ' adı zorunludur.');
  const dueDate = payload.dueDate ? parseDate_(payload.dueDate, 'Vade tarihi') : '';
  const id = makeId_(kind === 'staff' ? 'PRS' : 'OGR');
  withLock_(function() {
    const base = [id, name, cleanText_(payload.paymentType, 100), cleanText_(payload.period, 40), total, 0, total, dueDate, 'Ödenmedi', cleanText_(payload.note, 300), new Date()];
    if (kind === 'teacher') base.push(lessonHours, hourlyRate, '');
    else base.push('');
    getDb_().getSheetByName(cfg.commitments).appendRow(base);
    audit_(session.email, 'EKLENDİ', cfg.label + ' Tahakkuku', id, total + ' TL');
  });
  return {ok:true};
}

function updateStaffAccrual(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const id = cleanText_(payload.id, 60);
  const name = cleanText_(payload.name, 120);
  const paymentType = cleanText_(payload.paymentType, 100);
  const period = cleanText_(payload.period, 40);
  const total = positiveNumber_(payload.total, 'Tahakkuk tutarı');
  const dueDate = payload.dueDate ? parseDate_(payload.dueDate, 'Vade tarihi') : '';
  const note = cleanText_(payload.note, 300);
  if (!name || !paymentType || !period) throw new Error('Personel, ödeme türü ve dönem zorunludur.');

  withLock_(function() {
    const current = findRowBy_(APP.sheets.staffCommitments, 1, id);
    if (!current) throw new Error('Personel tahakkuku bulunamadı.');
    const paid = dataRows_(APP.sheets.staffPayments)
      .filter(function(r) { return r[2] === id; })
      .reduce(function(sum, r) { return sum + (Number(r[4]) || 0); }, 0);
    if (total < paid) throw new Error('Tahakkuk tutarı, ödenmiş ' + paid + ' TL tutarından küçük olamaz.');
    const remaining = Math.round((total - paid) * 100) / 100;
    const status = remaining <= 0 ? 'Ödendi' : (paid > 0 ? 'Kısmi' : 'Ödenmedi');
    const ss = getDb_();
    ss.getSheetByName(APP.sheets.staffCommitments).getRange(current.row, 2, 1, 9).setValues([[
      name, paymentType, period, total, paid, remaining, dueDate, status, note
    ]]);
    const paymentsSheet = ss.getSheetByName(APP.sheets.staffPayments);
    const paymentRows = dataRows_(APP.sheets.staffPayments);
    paymentRows.forEach(function(r, index) {
      if (r[2] === id && r[3] !== name) paymentsSheet.getRange(index + 2, 4).setValue(name);
    });
    audit_(session.email, 'DÜZELTİLDİ', 'Personel Tahakkuku', id, name + ' / ' + total + ' TL');
  });
  return {ok:true};
}

function updateTeacherAccrual(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const id = cleanText_(payload.id, 60);
  const name = cleanText_(payload.name, 120);
  const lessonName = cleanText_(payload.paymentType, 100);
  const period = cleanText_(payload.period, 40);
  const lessonHours = positiveNumber_(payload.lessonHours, 'Aylık ders saati');
  const hourlyRate = positiveNumber_(payload.hourlyRate, 'Saatlik ücret');
  const total = Math.round(lessonHours * hourlyRate * 100) / 100;
  const dueDate = payload.dueDate ? parseDate_(payload.dueDate, 'Vade tarihi') : '';
  const note = cleanText_(payload.note, 300);
  if (!name || !lessonName || !period) throw new Error('Öğretmen, ders adı ve dönem zorunludur.');
  withLock_(function() {
    const current = findRowBy_(APP.sheets.teacherCommitments, 1, id);
    if (!current) throw new Error('Öğretmen tahakkuku bulunamadı.');
    const paid = dataRows_(APP.sheets.teacherPayments).filter(function(r) { return r[2] === id; }).reduce(function(sum, r) { return sum + (Number(r[4]) || 0); }, 0);
    if (total < paid) throw new Error('Yeni ders saati ve ücret toplamı, ödenmiş ' + paid + ' TL tutarından küçük olamaz.');
    const remaining = Math.round((total - paid) * 100) / 100;
    const status = remaining <= 0 ? 'Ödendi' : (paid > 0 ? 'Kısmi' : 'Ödenmedi');
    const ss = getDb_();
    const sh = ss.getSheetByName(APP.sheets.teacherCommitments);
    sh.getRange(current.row, 2, 1, 9).setValues([[name, lessonName, period, total, paid, remaining, dueDate, status, note]]);
    sh.getRange(current.row, 12, 1, 2).setValues([[lessonHours, hourlyRate]]);
    const paymentsSheet = ss.getSheetByName(APP.sheets.teacherPayments);
    dataRows_(APP.sheets.teacherPayments).forEach(function(r, index) {
      if (r[2] === id && r[3] !== name) paymentsSheet.getRange(index + 2, 4).setValue(name);
    });
    audit_(session.email, 'DÜZELTİLDİ', 'Öğretmen Tahakkuku', id, name + ' / ' + lessonHours + ' saat x ' + hourlyRate + ' TL');
  });
  return {ok:true};
}

function deleteStaffAccrual(token, accrualId) {
  const session = requireAdmin_(token);
  const id = cleanText_(accrualId, 60);
  withLock_(function() {
    const current = findRowBy_(APP.sheets.staffCommitments, 1, id);
    if (!current) throw new Error('Personel tahakkuku bulunamadı.');
    const hasPayments = dataRows_(APP.sheets.staffPayments).some(function(r) { return r[2] === id; });
    if (hasPayments) throw new Error('Bu tahakkuka bağlı ödeme hareketleri var. Önce ödeme hareketlerini silin.');
    getDb_().getSheetByName(APP.sheets.staffCommitments).deleteRow(current.row);
    audit_(session.email, 'SİLİNDİ', 'Personel Tahakkuku', id, current.values[1] + ' / ' + current.values[4] + ' TL');
  });
  return {ok:true};
}

function deleteTeacherAccrual(token, accrualId) {
  const session=requireAdmin_(token);
  const id=cleanText_(accrualId,60);
  withLock_(function(){
    const current=findRowBy_(APP.sheets.teacherCommitments,1,id);
    if(!current) throw new Error('Öğretmen tahakkuku bulunamadı.');
    if(dataRows_(APP.sheets.teacherPayments).some(function(r){return r[2]===id;})) throw new Error('Bu tahakkuka bağlı ödeme hareketleri var. Önce ödeme hareketlerini silin.');
    getDb_().getSheetByName(APP.sheets.teacherCommitments).deleteRow(current.row);
    audit_(session.email,'SİLİNDİ','Öğretmen Tahakkuku',id,current.values[1]+' / '+current.values[4]+' TL');
  });
  return {ok:true};
}

function saveExpensePayment(token, kind, payload) {
  const session = requireAdmin_(token);
  const cfg = expenseConfig_(kind);
  payload = payload || {};
  const commitmentId = cleanText_(payload.commitmentId, 60);
  const amount = positiveNumber_(payload.amount, 'Ödeme tutarı');
  const accountId = cleanText_(payload.accountId, 60);
  const id = makeId_('HRK');
  withLock_(function() {
    const current = findRowBy_(cfg.commitments, 1, commitmentId);
    if (!current) throw new Error('Ödeme tahakkuku bulunamadı.');
    if (amount > (Number(current.values[6]) || 0)) throw new Error('Ödeme kalan tutardan büyük olamaz.');
    const currentAccount = findRowBy_(APP.sheets.cashAccounts, 1, accountId);
    if (!currentAccount || currentAccount.values[4] !== true) throw new Error('Seçilen kasa veya banka hesabı aktif değil.');
    const available = cashAccountCurrentBalance_(accountId);
    if (amount > available) throw new Error('Seçilen hesapta yeterli bakiye yok. Kullanılabilir bakiye: ' + moneyText_(available));
    const ss = getDb_();
    appendRows_(ss.getSheetByName(cfg.payments), [[
      id, parseDate_(payload.date, 'Ödeme tarihi'), current.values[0], current.values[1],
      amount, cleanText_(payload.method, 50), cleanText_(payload.note, 300), new Date(), currentAccount.values[0], currentAccount.values[1]
    ]], kind === 'staff' ? HEADERS.staffPayments.length : HEADERS.teacherPayments.length);
    const paid = Number(current.values[5] || 0) + amount;
    const balance = Number(current.values[4] || 0) - paid;
    const status = balance <= 0 ? 'Ödendi' : 'Kısmi';
    ss.getSheetByName(cfg.commitments).getRange(current.row, 6, 1, 4).setValues([[paid, balance, current.values[7], status]]);
    audit_(session.email, 'EKLENDİ', cfg.label + ' Ödemesi', id, amount + ' TL / ' + current.values[0]);
  });
  return {ok:true};
}

function saveBulkExpensePayments(token, kind, payload) {
  const session = requireAdmin_(token);
  if (kind !== 'staff') throw new Error('Toplu ödeme yalnızca personel tahakkukları için kullanılabilir.');
  const cfg = expenseConfig_(kind);
  payload = payload || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) throw new Error('Toplu ödeme için en az bir personel tahakkuku seçin.');
  if (items.length > 200) throw new Error('Tek işlemde en fazla 200 ödeme eklenebilir.');
  const date = parseDate_(payload.date, 'Ödeme tarihi');
  const method = cleanText_(payload.method, 50);
  const note = cleanText_(payload.note, 300);
  const accountId = cleanText_(payload.accountId, 60);
  let result = null;

  withLock_(function() {
    resetRequestCache_();
    const account = findRowBy_(APP.sheets.cashAccounts, 1, accountId);
    if (!account || account.values[4] !== true) throw new Error('Aktif bir kasa veya banka hesabı seçin.');
    const commitmentRows = dataRows_(cfg.commitments);
    const commitmentMap = {};
    commitmentRows.forEach(function(r, index) { commitmentMap[String(r[0])] = { values:r, index:index }; });
    const seen = {};
    const paymentRows = [];
    let total = 0;

    items.forEach(function(item, index) {
      const commitmentId = cleanText_(item && item.commitmentId, 60);
      if (!commitmentId || seen[commitmentId]) throw new Error((index + 1) + '. satırda geçersiz veya tekrar eden tahakkuk seçimi var.');
      seen[commitmentId] = true;
      const record = commitmentMap[commitmentId];
      if (!record) throw new Error('Personel tahakkuku bulunamadı: ' + commitmentId);
      const commitment = record.values;
      const amount = positiveNumber_(item.amount, commitment[1] + ' ödeme tutarı');
      const remaining = Number(commitment[6]) || 0;
      if (amount > remaining) throw new Error(commitment[1] + ' için ödeme kalan ' + moneyText_(remaining) + ' tutarından büyük olamaz.');
      const paid = Math.round(((Number(commitment[5]) || 0) + amount) * 100) / 100;
      const balance = Math.round(((Number(commitment[4]) || 0) - paid) * 100) / 100;
      commitment[5] = paid;
      commitment[6] = Math.max(0, balance);
      commitment[8] = balance <= 0 ? 'Ödendi' : 'Kısmi';
      total += amount;
      paymentRows.push([
        makeId_('HRK') + '-' + (index + 1), date, commitment[0], commitment[1], amount, method, note,
        new Date(), account.values[0], account.values[1]
      ]);
    });

    total = Math.round(total * 100) / 100;
    const available = cashAccountCurrentBalance_(accountId);
    if (total > available) throw new Error('Seçilen hesapta toplu ödeme için yeterli bakiye yok. Gerekli: ' + moneyText_(total) + ', kullanılabilir: ' + moneyText_(available));
    const ss = getDb_();
    const paymentSheet = ss.getSheetByName(cfg.payments);
    const firstAddedRow = paymentSheet.getLastRow() + 1;
    paymentSheet.getRange(firstAddedRow, 1, paymentRows.length, HEADERS.staffPayments.length).setValues(paymentRows);
    try {
      if (commitmentRows.length) ss.getSheetByName(cfg.commitments).getRange(2, 6, commitmentRows.length, 4).setValues(commitmentRows.map(function(r) { return [r[5], r[6], r[7], r[8]]; }));
    } catch (e) {
      paymentSheet.deleteRows(firstAddedRow, paymentRows.length);
      throw e;
    }
    audit_(session.email, 'TOPLU_ÖDEME', 'Personel Ödemesi', '', paymentRows.length + ' hareket / ' + total + ' TL / ' + account.values[1]);
    result = { ok:true, count:paymentRows.length, total:total };
  });
  return result;
}

function updateExpensePayment(token, kind, payload) {
  const session = requireAdmin_(token);
  const cfg = expenseConfig_(kind);
  payload = payload || {};
  const id = cleanText_(payload.id, 60);
  const amount = positiveNumber_(payload.amount, 'Ödeme tutarı');
  const date = parseDate_(payload.date, 'Ödeme tarihi');
  const accountId = cleanText_(payload.accountId, 60);
  const account = findRowBy_(APP.sheets.cashAccounts, 1, accountId);
  if (!account || account.values[4] !== true) throw new Error('Aktif bir kasa veya banka hesabı seçin.');
  withLock_(function() {
    const current = findRowBy_(cfg.payments, 1, id);
    if (!current) throw new Error('Ödeme hareketi bulunamadı.');
    const commitment = findRowBy_(cfg.commitments, 1, current.values[2]);
    if (!commitment) throw new Error('Bağlı ödeme tahakkuku bulunamadı.');
    const allowed = (Number(commitment.values[6]) || 0) + (Number(current.values[4]) || 0);
    if (amount > allowed) throw new Error('Ödeme kalan tutardan büyük olamaz.');
    const available = cashAccountCurrentBalance_(accountId) + (current.values[8] === accountId ? (Number(current.values[4]) || 0) : 0);
    if (amount > available) throw new Error('Seçilen hesapta yeterli bakiye yok. Kullanılabilir bakiye: ' + moneyText_(available));
    const sh = getDb_().getSheetByName(cfg.payments);
    sh.getRange(current.row, 2).setValue(date);
    sh.getRange(current.row, 5, 1, 3).setValues([[amount, cleanText_(payload.method, 50), cleanText_(payload.note, 300)]]);
    sh.getRange(current.row, 9, 1, 2).setValues([[account.values[0], account.values[1]]]);
    recalculateExpenseCommitment_(cfg, current.values[2]);
    audit_(session.email, 'DÜZELTİLDİ', cfg.label + ' Ödemesi', id, amount + ' TL');
  });
  return {ok:true};
}

function deleteExpensePayment(token, kind, paymentId) {
  const session = requireAdmin_(token);
  const cfg = expenseConfig_(kind);
  const id = cleanText_(paymentId, 60);
  withLock_(function() {
    const current = findRowBy_(cfg.payments, 1, id);
    if (!current) throw new Error('Ödeme hareketi bulunamadı.');
    const commitmentId = current.values[2];
    const detail = (Number(current.values[4]) || 0) + ' TL / ' + commitmentId;
    getDb_().getSheetByName(cfg.payments).deleteRow(current.row);
    recalculateExpenseCommitment_(cfg, commitmentId);
    audit_(session.email, 'SİLİNDİ', cfg.label + ' Ödemesi', id, detail);
  });
  return {ok:true};
}

function saveUser(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const email = normalizeEmail_(payload.email);
  const name = cleanText_(payload.name, 100);
  const reference = cleanText_(payload.reference, 100);
  const role = normalizeUserRole_(payload.role);
  if (!name) throw new Error('Ad soyad zorunludur.');
  if (role === 'KULLANICI' && !reference) throw new Error('Tahsilat kullanıcısı için referans adı zorunludur.');
  if (findRowBy_(APP.sheets.users, 3, email)) throw new Error('Bu e-posta zaten kayıtlı.');
  validatePin_(payload.pin);
  const salt = Utilities.getUuid();
  const id = makeId_('USR');
  getDb_().getSheetByName(APP.sheets.users).appendRow([
    id, name, email, role,
    reference || name, salt, hashPin_(payload.pin, salt), true, new Date()
  ]);
  audit_(session.email, 'EKLENDİ', 'Kullanıcı', id, email);
  return {ok:true};
}

function updateUser(token, payload) {
  const session = requireAdmin_(token);
  payload = payload || {};
  const id = cleanText_(payload.id, 60);
  const current = findRowBy_(APP.sheets.users, 1, id);
  if (!current) throw new Error('Kullanıcı bulunamadı.');
  const name = cleanText_(payload.name, 100);
  const email = normalizeEmail_(payload.email);
  const role = normalizeUserRole_(payload.role);
  const reference = cleanText_(payload.reference, 100);
  if (!name || !email) throw new Error('Ad soyad ve e-posta zorunludur.');
  if (role === 'KULLANICI' && !reference) throw new Error('Tahsilat kullanıcısı için referans adı zorunludur.');
  if (current.values[2] === session.email && role !== 'YÖNETİCİ') throw new Error('Kendi yönetici rolünüzü kaldıramazsınız.');
  const duplicate = dataRows_(APP.sheets.users).some(function(r) { return r[0] !== id && normalizeEmail_(r[2]) === email; });
  if (duplicate) throw new Error('Bu e-posta başka bir kullanıcıda kayıtlı.');
  let salt = current.values[5];
  let pinHash = current.values[6];
  if (String(payload.pin || '').trim()) {
    validatePin_(payload.pin);
    salt = Utilities.getUuid();
    pinHash = hashPin_(payload.pin, salt);
  }
  const actorEmail = session.email;
  getDb_().getSheetByName(APP.sheets.users).getRange(current.row, 2, 1, 6).setValues([[
    name, email, role, reference || name, salt, pinHash
  ]]);
  if (current.values[2] === session.email) {
    session.name = name;
    session.email = email;
    session.role = role;
    session.reference = reference || name;
    CacheService.getScriptCache().put('session:' + token, JSON.stringify(session), APP.sessionSeconds);
  }
  audit_(actorEmail, 'DÜZELTİLDİ', 'Kullanıcı', id, email + (String(payload.pin || '').trim() ? ' / PIN yenilendi' : ''));
  return {ok:true};
}

function setUserActive(token, userId, active) {
  const session = requireAdmin_(token);
  const row = findRowBy_(APP.sheets.users, 1, cleanText_(userId, 60));
  if (!row) throw new Error('Kullanıcı bulunamadı.');
  if (row.values[2] === session.email && active === false) throw new Error('Kendi hesabınızı pasif yapamazsınız.');
  getDb_().getSheetByName(APP.sheets.users).getRange(row.row, 8).setValue(Boolean(active));
  audit_(session.email, active ? 'AKTİF' : 'PASİF', 'Kullanıcı', userId, row.values[2]);
  return {ok:true};
}

function userPreferencesSheet_() {
  const ss = getDb_();
  let sh = ss.getSheetByName(APP.sheets.userPreferences);
  if (!sh) {
    createSheet_(ss, APP.sheets.userPreferences, HEADERS.userPreferences);
    sh = ss.getSheetByName(APP.sheets.userPreferences);
  }
  return sh;
}

function pledgeHiddenColumnsForUser_(userId) {
  const sh = userPreferencesSheet_();
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  const rows = sh.getRange(2, 1, lastRow - 1, HEADERS.userPreferences.length).getValues();
  const row = rows.find(function(r) { return String(r[0]) === String(userId) && String(r[1]) === 'pledgeHiddenColumns'; });
  if (!row) return [];
  try {
    const parsed = JSON.parse(String(row[2] || '[]'));
    return Array.isArray(parsed) ? parsed.filter(function(key, index) { return PLEDGE_COLUMN_KEYS.indexOf(key) >= 0 && parsed.indexOf(key) === index; }) : [];
  } catch (e) {
    return [];
  }
}

function collectionHiddenColumnsForUser_(userId) {
  const sh = userPreferencesSheet_();
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  const rows = sh.getRange(2, 1, lastRow - 1, HEADERS.userPreferences.length).getValues();
  const row = rows.find(function(r) { return String(r[0]) === String(userId) && String(r[1]) === 'collectionHiddenColumns'; });
  if (!row) return [];
  try {
    const parsed = JSON.parse(String(row[2] || '[]'));
    return Array.isArray(parsed) ? parsed.filter(function(key, index) { return COLLECTION_COLUMN_KEYS.indexOf(key) >= 0 && parsed.indexOf(key) === index; }) : [];
  } catch (e) {
    return [];
  }
}

function savePledgeColumnPreferences(token, hiddenColumns) {
  const session = requireSession_(token);
  const requested = Array.isArray(hiddenColumns) ? hiddenColumns : [];
  const hidden = requested.filter(function(key, index) { return PLEDGE_COLUMN_KEYS.indexOf(key) >= 0 && requested.indexOf(key) === index; });
  if (hidden.length >= PLEDGE_COLUMN_KEYS.length) throw new Error('En az bir sütun görünür kalmalıdır.');
  withLock_(function() {
    const sh = userPreferencesSheet_();
    const lastRow = sh.getLastRow();
    const rows = lastRow > 1 ? sh.getRange(2, 1, lastRow - 1, HEADERS.userPreferences.length).getValues() : [];
    const index = rows.findIndex(function(r) { return String(r[0]) === String(session.userId) && String(r[1]) === 'pledgeHiddenColumns'; });
    const value = JSON.stringify(hidden);
    if (index >= 0) sh.getRange(index + 2, 3, 1, 2).setValues([[value, new Date()]]);
    else sh.appendRow([session.userId, 'pledgeHiddenColumns', value, new Date()]);
    audit_(session.email, 'TERCİH GÜNCELLENDİ', 'Kullanıcı', session.userId, 'Taahhüt görünür sütunları: ' + (PLEDGE_COLUMN_KEYS.length - hidden.length));
  });
  invalidateAppDataCache_();
  return { hiddenColumns:hidden };
}

function saveCollectionColumnPreferences(token, hiddenColumns) {
  const session = requireSession_(token);
  const requested = Array.isArray(hiddenColumns) ? hiddenColumns : [];
  const hidden = requested.filter(function(key, index) { return COLLECTION_COLUMN_KEYS.indexOf(key) >= 0 && requested.indexOf(key) === index; });
  if (hidden.length >= COLLECTION_COLUMN_KEYS.length) throw new Error('En az bir sütun görünür kalmalıdır.');
  withLock_(function() {
    const sh = userPreferencesSheet_();
    const lastRow = sh.getLastRow();
    const rows = lastRow > 1 ? sh.getRange(2, 1, lastRow - 1, HEADERS.userPreferences.length).getValues() : [];
    const index = rows.findIndex(function(r) { return String(r[0]) === String(session.userId) && String(r[1]) === 'collectionHiddenColumns'; });
    const value = JSON.stringify(hidden);
    if (index >= 0) sh.getRange(index + 2, 3, 1, 2).setValues([[value, new Date()]]);
    else sh.appendRow([session.userId, 'collectionHiddenColumns', value, new Date()]);
    audit_(session.email, 'TERCİH GÜNCELLENDİ', 'Kullanıcı', session.userId, 'Tahsilat görünür sütunları: ' + (COLLECTION_COLUMN_KEYS.length - hidden.length));
  });
  invalidateAppDataCache_();
  return { hiddenColumns:hidden };
}

function normalizeUserRole_(value) {
  const role = String(value || '').toUpperCase();
  if (role === 'YÖNETİCİ' || role === 'MUHASEBE SORUMLUSU') return role;
  return 'KULLANICI';
}

function reconcileSystem(token) {
  const session=requireAdmin_(token);
  let pledgeCount=0, staffCount=0, teacherCount=0, loanCount=0;
  withLock_(function(){
    dataRows_(APP.sheets.pledges).forEach(function(r){recalculatePledge_(r[0]);pledgeCount++;});
    const staffCfg=expenseConfig_('staff');
    dataRows_(APP.sheets.staffCommitments).forEach(function(r){recalculateExpenseCommitment_(staffCfg,r[0]);staffCount++;});
    const teacherCfg=expenseConfig_('teacher');
    dataRows_(APP.sheets.teacherCommitments).forEach(function(r){recalculateExpenseCommitment_(teacherCfg,r[0]);teacherCount++;});
    optionalDataRows_(APP.sheets.loans).forEach(function(r){recalculateLoan_(r[0]);loanCount++;});
  });
  const negatives=optionalDataRows_(APP.sheets.cashAccounts).map(function(r){return {name:r[1],balance:cashAccountCurrentBalance_(r[0])};}).filter(function(x){return x.balance<0;});
  audit_(session.email,'BAKIM','Sistem','','Taahhüt '+pledgeCount+', personel '+staffCount+', öğretmen '+teacherCount+', borç '+loanCount);
  return {counts:{pledges:pledgeCount,staff:staffCount,teachers:teacherCount,loans:loanCount},negativeAccounts:negatives};
}

function buildAppData_(session, filters) {
  const start = filters.start ? parseDate_(filters.start, 'Başlangıç tarihi') : new Date(new Date().getFullYear(), 0, 1);
  const end = filters.end ? parseDate_(filters.end, 'Bitiş tarihi') : new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);
  end.setHours(23, 59, 59, 999);
  const applyToLists = filters.applyToLists === true || String(filters.applyToLists) === 'true';
  const admin = session.role === 'YÖNETİCİ';
  const approver = isApproverSession_(session);
  const accessiblePledgeRows = dataRows_(APP.sheets.pledges).filter(r => approver || referenceKey_(r[6]) === referenceKey_(session.reference));
  const doubtfulIds = {};
  accessiblePledgeRows.forEach(function(r) { if (String(r[15] || 'AKTİF').toUpperCase() === 'ŞÜPHELİ') doubtfulIds[r[0]] = true; });
  const pledgeRows = accessiblePledgeRows.filter(function(r) { return !doubtfulIds[r[0]]; });
  const allCollectionRows = dataRows_(APP.sheets.collections).filter(function(r) { return (approver || referenceKey_(r[5]) === referenceKey_(session.reference)) && !doubtfulIds[r[2]]; });
  const collectionRows = allCollectionRows.filter(isCollectionApprovedRow_);
  const periodCollections = collectionRows.filter(r => inRange_(r[1], start, end));
  const periodPledges = pledgeRows.filter(r => inRange_(r[11], start, end));
  const referencePledgeRows = pledgeRows.filter(function(r) { return !isStudentPledgeRow_(r); });
  const studentPledgeIds = {};
  pledgeRows.forEach(function(r) { if (isStudentPledgeRow_(r)) studentPledgeIds[String(r[0])] = true; });
  const referenceCollectionRows = collectionRows.filter(function(r) { return !studentPledgeIds[String(r[2])]; });
  const referencePledgeCollectionRows = referenceCollectionRows.filter(function(r) { return Boolean(String(r[2] || '').trim()); });
  const referenceDonationRows = referenceCollectionRows.filter(function(r) { return !String(r[2] || '').trim(); });
  const referencePeriodCollections = referenceCollectionRows.filter(function(r) { return inRange_(r[1], start, end); });
  const referencePeriodPledgeCollections = referencePledgeCollectionRows.filter(function(r) { return inRange_(r[1], start, end); });
  const referencePeriodDonations = referenceDonationRows.filter(function(r) { return inRange_(r[1], start, end); });
  const referencePeriodPledges = referencePledgeRows.filter(function(r) { return inRange_(r[11], start, end); });
  const totalPledge = sum_(pledgeRows, 7);
  const totalCollected = sum_(collectionRows, 7);
  const totalRemaining = sum_(pledgeRows, 9);

  const response = {
    user: session,
    filters: { start: isoDate_(start), end: isoDate_(end), applyToLists:applyToLists },
    donationTypes: dataRows_(APP.sheets.types).filter(r => r[1] === true).map(r => r[0]),
    methods: ['Nakit','Havale / EFT','Kredi Kartı','POS','Diğer'],
    preferences: {
      pledgeHiddenColumns:pledgeHiddenColumnsForUser_(session.userId),
      collectionHiddenColumns:collectionHiddenColumnsForUser_(session.userId)
    },
    summary: {
      totalPledge: totalPledge,
      totalCollected: totalCollected,
      totalRemaining: totalRemaining,
      periodCollected: sum_(periodCollections, 7),
      pledgeCount: pledgeRows.length
    },
    // Taahhüt listesi kendi yıl ve sütun filtrelerini kullanır. Üst tarih aralığı yalnızca
    // dönemsel tahsilat/analizleri süzer; aksi halde Ekim tahsilatları görünürken yıl başı
    // tarihli taahhütler yanlışlıkla listeden kayboluyordu.
    pledges: accessiblePledgeRows.slice().reverse().map(pledgeDto_),
    collections: (applyToLists?allCollectionRows.filter(function(r){return inRange_(r[1],start,end);}):allCollectionRows).slice().reverse().map(collectionDto_),
    donationAnalysis: groupSubActivities_(pledgeRows, collectionRows, periodCollections),
    referenceAnalysis: groupReferences_(referencePledgeRows, referencePledgeCollectionRows, referencePeriodPledgeCollections, referencePeriodPledges),
    referenceDonationAnalysis: groupDonationReferences_(referenceDonationRows, referencePeriodDonations),
    referenceTargets: referenceTargetData_(session, referencePledgeRows, referenceCollectionRows),
    cash: {
      accounts: optionalDataRows_(APP.sheets.cashAccounts).filter(function(r) { return r[4] === true; }).map(function(r) { return { id:r[0], name:r[1], type:r[2], active:true }; })
    }
  };
  if (approver) {
    response.approvals = {
      items: allCollectionRows.slice().reverse().map(collectionDto_),
      pendingCount: allCollectionRows.filter(function(r){return collectionApprovalStatus_(r)==='BEKLİYOR';}).length,
      pendingTotal: allCollectionRows.filter(function(r){return collectionApprovalStatus_(r)==='BEKLİYOR';}).reduce(function(s,r){return s+(Number(r[7])||0);},0)
    };
    response.referenceNames = uniqueReferenceNames_();
    response.cash = cashData_(collectionRows);
  }
  if (admin) {
    response.users = dataRows_(APP.sheets.users).map(userDto_);
    response.staff = expenseData_('staff', start, end, applyToLists);
    response.staffPlans = optionalDataRows_(APP.sheets.staffPlans).map(staffPlanDto_);
    response.staffPaymentTypes = STAFF_PAYMENT_TYPES.slice();
    response.staffNames = uniqueStaffNames_();
    response.teachers = expenseData_('teacher', start, end, applyToLists);
    response.teacherPlans = optionalDataRows_(APP.sheets.teacherPlans).map(teacherPlanDto_);
    response.teacherNames = uniqueTeacherNames_();
    response.pledgePersonnelNames = uniquePledgePersonnelNames_(accessiblePledgeRows);
    response.students = studentData_(pledgeRows, collectionRows, periodCollections, start, end, applyToLists);
    response.debts = debtData_(start,end,applyToLists);
    response.accountingImports = recentAccountingImports_(100).map(accountingImportDto_);
  }
  return response;
}

function studentData_(pledges, collections, periodCollections, start, end, applyToLists) {
  const studentRows = (pledges || []).filter(isStudentPledgeRow_);
  const ids = {};
  studentRows.forEach(function(r) { ids[String(r[0])] = true; });
  const payments = (collections || []).filter(function(r) { return ids[String(r[2])]; });
  const periodPayments = (periodCollections || []).filter(function(r) { return ids[String(r[2])]; });
  const planMap = {};
  optionalDataRows_(APP.sheets.studentPlans).forEach(function(r) { planMap[String(r[1])] = r; });
  const paymentMap = {};
  payments.forEach(function(r) {
    const id = String(r[2]);
    (paymentMap[id] || (paymentMap[id] = [])).push(r);
  });
  const enriched = studentRows.map(function(r) {
    const dto = pledgeDto_(r);
    dto.paymentPlan = studentPaymentPlanDto_(r, planMap[String(r[0])], paymentMap[String(r[0])] || []);
    return dto;
  });
  const enrichedMap = {};
  enriched.forEach(function(x) { enrichedMap[String(x.id)] = x; });
  const visibleAccruals = applyToLists ? studentRows.filter(function(r) { return inRange_(r[11], start, end); }) : studentRows;
  const visiblePayments = applyToLists ? payments.filter(function(r) { return inRange_(r[1], start, end); }) : payments;
  const overdueItems = enriched.filter(function(x) { return x.paymentPlan && x.paymentPlan.overdueAmount > 0; });
  return {
    summary: {
      total: sum_(studentRows, 7),
      paid: sum_(payments, 7),
      remaining: sum_(studentRows, 9),
      period: sum_(periodPayments, 7),
      overdue: overdueItems.reduce(function(s, x) { return s + x.paymentPlan.overdueAmount; }, 0),
      overdueCount: overdueItems.length
    },
    accruals: visibleAccruals.slice().reverse().map(function(r) { return enrichedMap[String(r[0])]; }),
    overdueItems: overdueItems.slice().sort(function(a, b) { return b.paymentPlan.overdueAmount - a.paymentPlan.overdueAmount; }),
    payments: visiblePayments.slice().reverse().map(collectionDto_)
  };
}

function addMonthsClamped_(value, months) {
  const source = value instanceof Date ? value : new Date(value);
  const day = source.getDate();
  const result = new Date(source.getFullYear(), source.getMonth() + months, 1, 12, 0, 0, 0);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

function studentPaymentPlanDto_(pledgeRow, planRow, paymentRows) {
  const total = Number(pledgeRow[7]) || 0;
  const paid = (paymentRows || []).reduce(function(s, r) { return s + (Number(r[7]) || 0); }, 0);
  if (!planRow) return { configured:false, total:total, paid:paid, remaining:Math.max(0, total - paid), overdueAmount:0, schedule:[] };
  const downPayment = Math.max(0, Number(planRow[3]) || 0);
  const count = Math.max(1, Number(planRow[4]) || 8);
  const firstDate = planRow[5] instanceof Date ? planRow[5] : new Date(planRow[5]);
  const installmentTotal = Math.max(0, total - downPayment);
  const baseInstallment = Math.round((Number(planRow[6]) || installmentTotal / count) * 100) / 100;
  const accrualDate = pledgeRow[11] instanceof Date ? pledgeRow[11] : new Date(pledgeRow[11]);
  const raw = [{ label:'Peşinat', dueDate:accrualDate, amount:downPayment }];
  for (let i = 0; i < count; i++) {
    const amount = i === count - 1 ? Math.max(0, Math.round((installmentTotal - baseInstallment * (count - 1)) * 100) / 100) : baseInstallment;
    raw.push({ label:(i + 1) + '. Taksit', dueDate:addMonthsClamped_(firstDate, i), amount:amount });
  }
  let allocatable = paid;
  const today = new Date(); today.setHours(23, 59, 59, 999);
  const schedule = raw.map(function(item, index) {
    const allocated = Math.min(item.amount, Math.max(0, allocatable));
    allocatable = Math.max(0, allocatable - allocated);
    const remaining = Math.max(0, Math.round((item.amount - allocated) * 100) / 100);
    const overdue = remaining > 0 && item.dueDate <= today;
    return {
      order:index,
      label:item.label,
      dueDate:isoDate_(item.dueDate),
      amount:item.amount,
      paid:allocated,
      remaining:remaining,
      overdue:overdue,
      status:remaining <= 0 ? 'Ödendi' : (allocated > 0 ? (overdue ? 'Gecikmiş / Kısmi' : 'Kısmi') : (overdue ? 'Gecikmiş' : 'Bekliyor'))
    };
  });
  const overdueAmount = schedule.reduce(function(s, item) { return s + (item.overdue ? item.remaining : 0); }, 0);
  const nextDue = schedule.find(function(item) { return item.remaining > 0; }) || null;
  return {
    configured:true,
    total:total,
    downPayment:downPayment,
    installmentCount:count,
    monthlyInstallment:baseInstallment,
    firstInstallmentDate:isoDate_(firstDate),
    paid:paid,
    remaining:Math.max(0, Math.round((total - paid) * 100) / 100),
    overdueAmount:Math.round(overdueAmount * 100) / 100,
    nextDueDate:nextDue ? nextDue.dueDate : '',
    status:paid >= total ? 'Tamamlandı' : (overdueAmount > 0 ? 'Gecikmiş' : 'Devam ediyor'),
    schedule:schedule
  };
}

function groupSubActivities_(pledges, collections, periodCollections) {
  const map = {};
  const pledgeMap = {};
  function nameForPledge_(row) { return cleanText_(row && row[18],120) || cleanText_(row && row[17],120) || cleanText_(row && row[2],120) || 'Belirtilmemiş'; }
  function item_(name) {
    name = cleanText_(name,120) || 'Belirtilmemiş';
    const key = normalizeKey_(name) || 'belirtilmemis';
    return map[key] || (map[key] = { name:name, pledged:0, collected:0, period:0 });
  }
  function collectionName_(row) {
    const pledge = pledgeMap[String(row && row[2] || '')];
    // Bu grafik yalnızca taahhütlerin Alt Faaliyet alanını gösterir. Taahhüde
    // bağlı olmayan teberruların ödeme tipi veya kasa adı burada kategori olamaz.
    return pledge ? nameForPledge_(pledge) : '';
  }
  (pledges || []).forEach(function(r) {
    pledgeMap[String(r[0])] = r;
    item_(nameForPledge_(r)).pledged += Number(r[7] || 0);
  });
  (collections || []).forEach(function(r) {
    const name = collectionName_(r);
    if (name) item_(name).collected += Number(r[7] || 0);
  });
  (periodCollections || []).forEach(function(r) {
    const name = collectionName_(r);
    if (name) item_(name).period += Number(r[7] || 0);
  });
  return Object.keys(map).map(k => Object.assign(map[k], { remaining: map[k].pledged - map[k].collected }));
}

function groupReferences_(pledges, collections, periodCollections, periodPledges) {
  const map = {};
  function item_(value) { const name=cleanText_(value,120)||'Referanssız'; const key=referenceKey_(name)||'referanssiz'; return map[key]||(map[key]={name:name,count:0,pledged:0,collected:0,period:0,periodPledged:0}); }
  pledges.forEach(r => { const x=item_(r[6]); x.count++; x.pledged+=Number(r[7]||0); });
  collections.forEach(r => { const x=item_(r[5]); x.collected+=Number(r[7]||0); });
  periodCollections.forEach(r => { const x=item_(r[5]); x.period+=Number(r[7]||0); });
  (periodPledges||[]).forEach(r => { const x=item_(r[6]); x.periodPledged+=Number(r[7]||0); });
  return Object.keys(map).map(k => Object.assign(map[k], { remaining: map[k].pledged-map[k].collected, rate: map[k].pledged ? map[k].collected/map[k].pledged : 0 })).sort((a,b)=>b.period-a.period);
}

function groupDonationReferences_(collections, periodCollections) {
  const map = {};
  function item_(value) {
    const name = cleanText_(value, 120) || 'Referanssız';
    const key = referenceKey_(name) || 'referanssiz';
    return map[key] || (map[key] = { name:name, count:0, collected:0, period:0 });
  }
  (collections || []).forEach(function(r) { const x=item_(r[5]); x.count++; x.collected+=Number(r[7]||0); });
  (periodCollections || []).forEach(function(r) { item_(r[5]).period+=Number(r[7]||0); });
  const total = Object.keys(map).reduce(function(sum,key) { return sum + map[key].collected; }, 0);
  const periodTotal = Object.keys(map).reduce(function(sum,key) { return sum + map[key].period; }, 0);
  return Object.keys(map).map(function(key) {
    const item = map[key];
    item.rate = total ? item.collected / total : 0;
    item.periodRate = periodTotal ? item.period / periodTotal : 0;
    return item;
  }).sort(function(a,b) { return b.period - a.period; });
}

function expenseData_(kind, start, end, applyToLists) {
  const cfg = expenseConfig_(kind);
  const commitments = dataRows_(cfg.commitments);
  const payments = dataRows_(cfg.payments);
  const commitmentMap = {};
  commitments.forEach(function(r) { commitmentMap[String(r[0])] = r; });
  return {
    summary: { total:sum_(commitments,4), paid:sum_(payments,4), remaining:sum_(commitments,6), period:sum_(payments.filter(r=>inRange_(r[1],start,end)),4) },
    remainingItems: expenseRemainingItems_(commitments),
    commitments: (applyToLists?commitments.filter(function(r){return r[7]&&inRange_(r[7],start,end);}):commitments).slice().reverse().map(function(r) { return expenseCommitmentDto_(r, kind); }),
    payments: (applyToLists?payments.filter(function(r){return inRange_(r[1],start,end);}):payments).slice().reverse().map(function(r) { return expensePaymentDto_(r, commitmentMap[String(r[2])]); })
  };
}

function expenseRemainingItems_(commitments) {
  const map = {};
  (commitments || []).forEach(function(r) {
    const remaining = Number(r[6]) || 0;
    if (remaining <= 0) return;
    const name = String(r[1] || 'İsimsiz');
    const paymentType = String(r[2] || 'Belirtilmemiş');
    const period = String(r[3] || 'Dönemsiz');
    const key = normalizeKey_(name) + '|' + normalizeKey_(paymentType) + '|' + normalizeKey_(period);
    const item = map[key] || (map[key] = { name:name, paymentType:paymentType, period:period, count:0, total:0, paid:0, remaining:0 });
    item.count++;
    item.total += Number(r[4]) || 0;
    item.paid += Number(r[5]) || 0;
    item.remaining += remaining;
  });
  return Object.keys(map).map(function(key) {
    const x = map[key];
    x.total = Math.round(x.total * 100) / 100;
    x.paid = Math.round(x.paid * 100) / 100;
    x.remaining = Math.round(x.remaining * 100) / 100;
    return x;
  }).sort(function(a, b) { return b.remaining - a.remaining; });
}

function pledgeDto_(r) { return { id:r[0], year:r[1], donationType:r[2], fullName:r[3], phone:r[4], payer:r[5], reference:r[6], amount:n_(r[7]), paid:n_(r[8]), remaining:n_(r[9]), status:r[10], pledgeDate:isoDate_(r[11]), personnel:r[14]||'', receivableStatus:String(r[15]||'AKTİF').toUpperCase(), source:String(r[16]||'BAĞIŞ').toUpperCase(), activity:r[17]||'', subActivity:r[18]||'', accountCode:r[19]||'', group:r[20]||'', notes:r[21]||'' }; }
function collectionDto_(r) { return { id:r[0], date:isoDate_(r[1]), pledgeId:r[2], direct:!r[2], fullName:r[3], donationType:r[4], reference:r[5], payer:r[6], amount:n_(r[7]), method:r[8], note:r[9], createdBy:r[10]||'', createdAt:r[11] instanceof Date?Utilities.formatDate(r[11],'Europe/Istanbul','dd.MM.yyyy HH:mm'):String(r[11]||''), accountId:r[12]||'', accountName:r[13]||'', approvalStatus:collectionApprovalStatus_(r), approvedBy:r[15]||'', approvedAt:r[16] instanceof Date?Utilities.formatDate(r[16],'Europe/Istanbul','dd.MM.yyyy HH:mm'):String(r[16]||''), rejectionReason:r[17]||'', receiptNo:r[18]||'', group:r[19]||'', activity:r[20]||'', phone:r[21]||'' }; }
function expenseCommitmentDto_(r, kind) { return { id:r[0], name:r[1], paymentType:r[2], period:r[3], total:n_(r[4]), paid:n_(r[5]), remaining:n_(r[6]), dueDate:isoDate_(r[7]), status:r[8], note:r[9], lessonHours:kind==='teacher'?n_(r[11]):0, hourlyRate:kind==='teacher'?n_(r[12]):0 }; }
function expensePaymentDto_(r, commitment) { return { id:r[0], date:isoDate_(r[1]), commitmentId:r[2], name:r[3], amount:n_(r[4]), method:r[5], note:r[6], accountId:r[8]||'', accountName:r[9]||'', accrualPeriod:commitment?String(commitment[3]||''):'', paymentType:commitment?String(commitment[2]||''):'' }; }
function staffPlanDto_(r) { return { id:r[0], name:r[1], paymentType:r[2], amount:n_(r[3]), active:r[4]===true, note:r[5] }; }
function teacherPlanDto_(r) { return { id:r[0], name:r[1], lessonName:r[2], lessonHours:n_(r[3]), hourlyRate:n_(r[4]), amount:Math.round(n_(r[3])*n_(r[4])*100)/100, active:r[5]===true, note:r[6] }; }
function userDto_(r) { return { id:r[0], name:r[1], email:r[2], role:r[3], reference:r[4], active:r[7]===true, createdAt:isoDate_(r[8]) }; }
function loanDto_(r) { return {id:r[0],date:isoDate_(r[1]),lender:r[2],amount:n_(r[3]),repaid:n_(r[4]),remaining:n_(r[5]),status:r[6],accountId:r[7],accountName:r[8],note:r[9]}; }
function loanRepaymentDto_(r) { return {id:r[0],date:isoDate_(r[1]),loanId:r[2],lender:r[3],amount:n_(r[4]),method:r[5],note:r[6],accountId:r[8],accountName:r[9]}; }
function accountingImportDto_(r) { return {externalId:r[0],type:r[1],systemId:r[2],date:isoDate_(r[3]),amount:n_(r[4]),user:r[5],importedAt:r[6] instanceof Date?Utilities.formatDate(r[6],'Europe/Istanbul','dd.MM.yyyy HH:mm'):String(r[6]||'')}; }
function recentAccountingImports_(limit) {
  const sh=getDb_().getSheetByName(APP.sheets.accountingImports);if(!sh)return [];
  const last=sh.getLastRow();if(last<2)return [];
  const count=Math.min(Math.max(1,Number(limit)||100),last-1);
  return sh.getRange(last-count+1,1,count,HEADERS.accountingImports.length).getValues().reverse();
}
function referenceTargetData_(session, pledges, collections) {
  const admin=isApproverSession_(session);
  const today=isoDate_(new Date());
  const rows=optionalDataRows_(APP.sheets.referenceTargets).filter(function(r){return admin||(r[6]===true&&referenceKey_(r[3])===referenceKey_(session.reference));});
  const items=rows.map(function(r){
    const start=new Date(r[1]), end=new Date(r[2]); end.setHours(23,59,59,999);
    const key=referenceKey_(r[3]);
    const targetType=referenceTargetType_(r[9]);
    const actualPledged=(collections||[]).filter(function(c){return !String(c[2]||'').trim()&&referenceKey_(c[5])===key&&inRange_(c[1],start,end);}).reduce(function(s,c){return s+(Number(c[7])||0);},0);
    const actualCollected=(collections||[]).filter(function(c){return Boolean(String(c[2]||'').trim())&&referenceKey_(c[5])===key&&inRange_(c[1],start,end);}).reduce(function(s,c){return s+(Number(c[7])||0);},0);
    const pledgeTarget=targetType==='TEBERRU'?(Number(r[5])||0):(Number(r[4])||0), collectionTarget=targetType==='TEBERRU'?0:(Number(r[5])||0);
    const startIso=isoDate_(r[1]),endIso=isoDate_(r[2]);
    const reached=(pledgeTarget<=0||actualPledged>=pledgeTarget)&&(collectionTarget<=0||actualCollected>=collectionTarget);
    const achievementStatus=reached?'Hedefe ulaşıldı':(today<startIso?'Bekliyor':(today>endIso?'Hedef tamamlanmadı':'Devam ediyor'));
    return {id:r[0],targetType:targetType,start:startIso,end:endIso,periodKey:startIso.slice(0,7),reference:r[3],pledgeTarget:pledgeTarget,collectionTarget:collectionTarget,actualPledged:actualPledged,actualCollected:actualCollected,totalTarget:pledgeTarget+collectionTarget,totalActual:actualPledged+actualCollected,totalRate:(pledgeTarget+collectionTarget)?(actualPledged+actualCollected)/(pledgeTarget+collectionTarget):0,pledgeRate:pledgeTarget?actualPledged/pledgeTarget:0,collectionRate:collectionTarget?actualCollected/collectionTarget:0,pledgeRemaining:Math.max(0,pledgeTarget-actualPledged),collectionRemaining:Math.max(0,collectionTarget-actualCollected),achievementStatus:achievementStatus,active:r[6]===true,note:r[7]};
  });
  const activeItems=items.filter(function(x){return x.active;});
  const summary={pledgeTarget:activeItems.reduce(function(s,x){return s+x.pledgeTarget;},0),actualPledged:activeItems.reduce(function(s,x){return s+x.actualPledged;},0),collectionTarget:activeItems.reduce(function(s,x){return s+x.collectionTarget;},0),actualCollected:activeItems.reduce(function(s,x){return s+x.actualCollected;},0)};
  summary.totalTarget=summary.pledgeTarget+summary.collectionTarget;summary.totalActual=summary.actualPledged+summary.actualCollected;summary.totalRate=summary.totalTarget?summary.totalActual/summary.totalTarget:0;
  return {items:items,summary:summary};
}

function referenceTargetType_(value) {
  return String(value || '').trim().toLocaleUpperCase('tr-TR') === 'TEBERRU' ? 'TEBERRU' : 'TAHSİLAT';
}
function debtData_(start,end,applyToLists) {
  const loans=optionalDataRows_(APP.sheets.loans);
  const repayments=optionalDataRows_(APP.sheets.loanRepayments);
  const loanList=applyToLists?loans.filter(function(r){return inRange_(r[1],start,end);}):loans;
  const repaymentList=applyToLists?repayments.filter(function(r){return inRange_(r[1],start,end);}):repayments;
  return {loans:loanList.slice().reverse().map(loanDto_),repayments:repaymentList.slice().reverse().map(loanRepaymentDto_),summary:{borrowed:sum_(loans,3),repaid:sum_(repayments,4),remaining:sum_(loans,5)}};
}
function cashAccountDto_(r, collections, staffPayments, teacherPayments, loans, loanRepayments) {
  const collected=collections.filter(function(c){return c[12]===r[0];}).reduce(function(s,c){return s+(Number(c[7])||0);},0);
  const staffExpense=staffPayments.filter(function(p){return p[8]===r[0];}).reduce(function(s,p){return s+(Number(p[4])||0);},0);
  const teacherExpense=teacherPayments.filter(function(p){return p[8]===r[0];}).reduce(function(s,p){return s+(Number(p[4])||0);},0);
  const borrowed=loans.filter(function(x){return x[7]===r[0];}).reduce(function(s,x){return s+(Number(x[3])||0);},0);
  const debtRepaid=loanRepayments.filter(function(x){return x[8]===r[0];}).reduce(function(s,x){return s+(Number(x[4])||0);},0);
  const opening=n_(r[3]);
  return {id:r[0],name:r[1],type:r[2],openingBalance:opening,collected:collected,borrowed:borrowed,staffExpense:staffExpense,teacherExpense:teacherExpense,debtRepaid:debtRepaid,totalExpense:staffExpense+teacherExpense+debtRepaid,balance:opening+collected+borrowed-staffExpense-teacherExpense-debtRepaid,active:r[4]===true,note:r[5]};
}
function cashData_(collections) {
  const staffPayments=optionalDataRows_(APP.sheets.staffPayments);
  const teacherPayments=optionalDataRows_(APP.sheets.teacherPayments);
  const loans=optionalDataRows_(APP.sheets.loans);
  const loanRepayments=optionalDataRows_(APP.sheets.loanRepayments);
  const accounts=optionalDataRows_(APP.sheets.cashAccounts).map(function(r){return cashAccountDto_(r,collections,staffPayments,teacherPayments,loans,loanRepayments);});
  return {
    accounts:accounts,
    totalBalance:accounts.reduce(function(s,a){return s+a.balance;},0),
    totalCollected:accounts.reduce(function(s,a){return s+a.collected;},0),
    totalBorrowed:accounts.reduce(function(s,a){return s+a.borrowed;},0),
    totalStaffExpense:accounts.reduce(function(s,a){return s+a.staffExpense;},0),
    totalTeacherExpense:accounts.reduce(function(s,a){return s+a.teacherExpense;},0),
    totalDebtRepaid:accounts.reduce(function(s,a){return s+a.debtRepaid;},0),
    totalExpense:accounts.reduce(function(s,a){return s+a.totalExpense;},0)
  };
}
function cashAccountCurrentBalance_(accountId) {
  const account=findRowBy_(APP.sheets.cashAccounts,1,accountId);
  if(!account)return 0;
  const doubtful={};
  dataRows_(APP.sheets.pledges).forEach(function(r){if(String(r[15]||'AKTİF').toUpperCase()==='ŞÜPHELİ')doubtful[r[0]]=true;});
  const income=dataRows_(APP.sheets.collections).filter(function(r){return r[12]===accountId&&!doubtful[r[2]]&&isCollectionApprovedRow_(r);}).reduce(function(s,r){return s+(Number(r[7])||0);},0);
  const staff=optionalDataRows_(APP.sheets.staffPayments).filter(function(r){return r[8]===accountId;}).reduce(function(s,r){return s+(Number(r[4])||0);},0);
  const teacher=optionalDataRows_(APP.sheets.teacherPayments).filter(function(r){return r[8]===accountId;}).reduce(function(s,r){return s+(Number(r[4])||0);},0);
  const borrowed=optionalDataRows_(APP.sheets.loans).filter(function(r){return r[7]===accountId;}).reduce(function(s,r){return s+(Number(r[3])||0);},0);
  const debtRepaid=optionalDataRows_(APP.sheets.loanRepayments).filter(function(r){return r[8]===accountId;}).reduce(function(s,r){return s+(Number(r[4])||0);},0);
  return (Number(account.values[3])||0)+income+borrowed-staff-teacher-debtRepaid;
}
function assertCashDeltas_(deltas, operation) {
  Object.keys(deltas || {}).forEach(function(accountId) {
    if (!accountId) return;
    const after = Math.round((cashAccountCurrentBalance_(accountId) + (Number(deltas[accountId]) || 0)) * 100) / 100;
    if (after < 0) {
      const account = findRowBy_(APP.sheets.cashAccounts, 1, accountId);
      throw new Error((operation || 'İşlem') + ' sonucunda ' + (account ? account.values[1] : accountId) + ' hesabı eksiye düşer. İşlem iptal edildi.');
    }
  });
}
function pledgeCollectionCashDeltas_(pledgeId, direction) {
  const deltas = {};
  dataRows_(APP.sheets.collections).forEach(function(r) {
    if (r[2] === pledgeId && r[12] && isCollectionApprovedRow_(r)) deltas[r[12]] = (deltas[r[12]] || 0) + (Number(direction) || 0) * (Number(r[7]) || 0);
  });
  return deltas;
}
function updateAccountNameReferences_(accountId, accountName) {
  [
    [APP.sheets.collections, 13, 14], [APP.sheets.staffPayments, 9, 10], [APP.sheets.teacherPayments, 9, 10],
    [APP.sheets.loans, 8, 9], [APP.sheets.loanRepayments, 9, 10]
  ].forEach(function(cfg) {
    const sh = getDb_().getSheetByName(cfg[0]);
    if (!sh || sh.getLastRow() < 2) return;
    const ids = sh.getRange(2, cfg[1], sh.getLastRow() - 1, 1).getValues();
    ids.forEach(function(r, index) { if (r[0] === accountId) sh.getRange(index + 2, cfg[2]).setValue(accountName); });
  });
}

function expenseConfig_(kind) {
  if (kind === 'staff') return { commitments:APP.sheets.staffCommitments, payments:APP.sheets.staffPayments, label:'Personel' };
  if (kind === 'teacher') return { commitments:APP.sheets.teacherCommitments, payments:APP.sheets.teacherPayments, label:'Öğretmen' };
  throw new Error('Geçersiz ödeme türü.');
}

function recalculatePledge_(pledgeId) {
  const ss = getDb_();
  const pledge = findRowBy_(APP.sheets.pledges, 1, pledgeId);
  if (!pledge) return;
  const paid = dataRows_(APP.sheets.collections).filter(r => r[2] === pledgeId && isCollectionApprovedRow_(r)).reduce((s,r) => s + (Number(r[7]) || 0), 0);
  const total = Number(pledge.values[7]) || 0;
  const remaining = Math.max(0, total - paid);
  const status = remaining <= 0 ? 'Kapandı' : (paid > 0 ? 'Kısmi' : 'Ödenmedi');
  ss.getSheetByName(APP.sheets.pledges).getRange(pledge.row, 9, 1, 3).setValues([[paid, remaining, status]]);
}

function recalculateExpenseCommitment_(cfg, commitmentId) {
  const ss = getDb_();
  const commitment = findRowBy_(cfg.commitments, 1, commitmentId);
  if (!commitment) return;
  const paid = dataRows_(cfg.payments).filter(r => r[2] === commitmentId).reduce((s,r) => s + (Number(r[4]) || 0), 0);
  const total = Number(commitment.values[4]) || 0;
  const remaining = Math.max(0, total - paid);
  const status = remaining <= 0 ? 'Ödendi' : (paid > 0 ? 'Kısmi' : 'Ödenmedi');
  ss.getSheetByName(cfg.commitments).getRange(commitment.row, 6, 1, 4).setValues([[paid, remaining, commitment.values[7], status]]);
}

function recalculateLoan_(loanId) {
  const ss = getDb_();
  const loan = findRowBy_(APP.sheets.loans, 1, loanId);
  if (!loan) return;
  const repaid = dataRows_(APP.sheets.loanRepayments).filter(function(r) { return r[2] === loanId; }).reduce(function(s, r) { return s + (Number(r[4]) || 0); }, 0);
  const total = Number(loan.values[3]) || 0;
  const remaining = Math.max(0, Math.round((total - repaid) * 100) / 100);
  const status = remaining <= 0 ? 'Kapandı' : (repaid > 0 ? 'Kısmi' : 'Açık');
  ss.getSheetByName(APP.sheets.loans).getRange(loan.row, 5, 1, 3).setValues([[repaid, remaining, status]]);
}

function monthLabel_(year, monthIndex) {
  const names = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  return names[monthIndex] + ' ' + year;
}

function parseMonth_(value, label) {
  const month = String(value || '');
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error(label + ' seçimi geçersiz.');
  const parts = month.split('-').map(Number);
  if (parts[1] < 1 || parts[1] > 12) throw new Error(label + ' seçimi geçersiz.');
  return { year:parts[0], monthIndex:parts[1] - 1 };
}

function targetMonthRange_(value, label) {
  const parsed=parseMonth_(value,label);
  const start=new Date(parsed.year,parsed.monthIndex,1,12,0,0,0);
  const end=new Date(parsed.year,parsed.monthIndex+1,0,12,0,0,0);
  return {key:String(parsed.year)+'-'+String(parsed.monthIndex+1).padStart(2,'0'),label:monthLabel_(parsed.year,parsed.monthIndex),start:start,end:end,startIso:isoDate_(start),endIso:isoDate_(end)};
}

function uniqueStaffNames_() {
  const map = {};
  optionalDataRows_(APP.sheets.staffPlans).forEach(function(r) {
    const name = cleanText_(r[1], 120);
    if (name) map[normalizeKey_(name)] = name;
  });
  dataRows_(APP.sheets.staffCommitments).forEach(function(r) {
    const name = cleanText_(r[1], 120);
    if (name && !map[normalizeKey_(name)]) map[normalizeKey_(name)] = name;
  });
  return Object.keys(map).map(function(k) { return map[k]; }).sort();
}

function uniqueTeacherNames_() {
  const map = {};
  optionalDataRows_(APP.sheets.teacherPlans).forEach(function(r) {
    const name = cleanText_(r[1], 120);
    if (name) map[normalizeKey_(name)] = name;
  });
  dataRows_(APP.sheets.teacherCommitments).forEach(function(r) {
    const name = cleanText_(r[1], 120);
    if (name && !map[normalizeKey_(name)]) map[normalizeKey_(name)] = name;
  });
  return Object.keys(map).map(function(k) { return map[k]; }).sort();
}

function uniquePledgePersonnelNames_(rows) {
  const map = {};
  (rows || []).forEach(function(r) {
    const name = cleanText_(r[14], 120);
    if (name) map[normalizeKey_(name)] = name;
  });
  return Object.keys(map).map(function(k) { return map[k]; }).sort();
}

function uniqueReferenceNames_() {
  const map={};
  dataRows_(APP.sheets.users).forEach(function(r){const name=cleanText_(r[4],120);if(name)map[referenceKey_(name)]=name;});
  const studentIds={};
  dataRows_(APP.sheets.pledges).forEach(function(r){if(isStudentPledgeRow_(r)){studentIds[String(r[0])]=true;return;}const name=cleanText_(r[6],120);if(name&&!map[referenceKey_(name)])map[referenceKey_(name)]=name;});
  dataRows_(APP.sheets.collections).forEach(function(r){if(studentIds[String(r[2])])return;const name=cleanText_(r[5],120);if(name&&!map[referenceKey_(name)])map[referenceKey_(name)]=name;});
  return Object.keys(map).map(function(k){return map[k];}).sort(function(a,b){return a.localeCompare(b,'tr');});
}

function isStudentPledgeRow_(row) {
  return String((row || [])[16] || '').toUpperCase() === 'ÖĞRENCİ';
}

function normalizeKey_(value) {
  return String(value || '').trim().toLocaleLowerCase('tr-TR');
}

function referenceKey_(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/[ıi]/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createSheet_(ss, name, headers, existing) {
  const sh = existing || ss.insertSheet(name);
  sh.clear();
  sh.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold').setFontColor('#ffffff').setBackground('#163A5F');
  sh.setFrozenRows(1);
  sh.getRange(1,1,sh.getMaxRows(),headers.length).setVerticalAlignment('middle');
  sh.autoResizeColumns(1, headers.length);
}
function seedCashAccounts_(ss) {
  const sh = ss.getSheetByName(APP.sheets.cashAccounts);
  if (!sh || sh.getLastRow() > 1) return;
  sh.getRange(2, 1, 5, HEADERS.cashAccounts.length).setValues([
    ['HSP-NAKIT','Nakit Kasa','KASA',0,true,'',new Date()],
    ['HSP-BANKA','Banka Hesabı','BANKA',0,true,'',new Date()],
    ['HSP-POS','POS / Kredi Kartı','POS',0,true,'',new Date()],
    ['HSP-DIGER','Diğer Tahsilatlar','DİĞER',0,true,'',new Date()],
    ['HSP-DEVIR','Devir / Belirsiz','DEVİR',0,true,'Eski veya aktarılan kayıtlar',new Date()]
  ]);
}
function migrateCollectionAccounts_(ss) {
  const sh = ss.getSheetByName(APP.sheets.collections);
  const last = sh.getLastRow();
  if (last < 2) return;
  const rows = sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues();
  const mapped = rows.map(function(r) {
    if (r[12]) return [r[12], r[13]];
    const method = normalizeKey_(r[8]);
    if (method.indexOf('nakit') >= 0) return ['HSP-NAKIT','Nakit Kasa'];
    if (method.indexOf('havale') >= 0 || method.indexOf('eft') >= 0) return ['HSP-BANKA','Banka Hesabı'];
    if (method.indexOf('kart') >= 0 || method.indexOf('pos') >= 0) return ['HSP-POS','POS / Kredi Kartı'];
    if (method.indexOf('devir') >= 0) return ['HSP-DEVIR','Devir / Belirsiz'];
    return ['HSP-DIGER','Diğer Tahsilatlar'];
  });
  sh.getRange(2, 13, mapped.length, 2).setValues(mapped);
}
function migrateExpensePaymentAccounts_(sh) {
  const last = sh.getLastRow();
  if (last < 2) return;
  const rows = sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues();
  const mapped = rows.map(function(r) {
    if (r[8]) return [r[8], r[9]];
    const method = normalizeKey_(r[5]);
    if (method.indexOf('nakit') >= 0) return ['HSP-NAKIT','Nakit Kasa'];
    if (method.indexOf('havale') >= 0 || method.indexOf('eft') >= 0) return ['HSP-BANKA','Banka Hesabı'];
    if (method.indexOf('kart') >= 0 || method.indexOf('pos') >= 0) return ['HSP-POS','POS / Kredi Kartı'];
    return ['HSP-DEVIR','Devir / Belirsiz'];
  });
  sh.getRange(2, 9, mapped.length, 2).setValues(mapped);
}
function getDb_() {
  if (REQUEST_DB_CACHE_) return REQUEST_DB_CACHE_;
  const id=PropertiesService.getScriptProperties().getProperty(APP.dbProperty);
  if(!id) throw new Error('Sistem kurulmamış. Önce setupSystem çalıştırın.');
  REQUEST_DB_CACHE_=SpreadsheetApp.openById(id);
  return REQUEST_DB_CACHE_;
}
function newDataRevision_() {
  return Date.now().toString(36) + '-' + Utilities.getUuid().slice(0, 8);
}
function getDataRevision_() {
  const props = PropertiesService.getScriptProperties();
  let revision = props.getProperty(APP.dataRevisionProperty);
  if (!revision) {
    revision = newDataRevision_();
    props.setProperty(APP.dataRevisionProperty, revision);
  }
  return revision;
}
function invalidateAppDataCache_() {
  PropertiesService.getScriptProperties().setProperty(APP.dataRevisionProperty, newDataRevision_());
  resetRequestCache_();
}
function sha256Hex_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value), Utilities.Charset.UTF_8)
    .map(function(b) { return ('0' + ((b < 0 ? b + 256 : b).toString(16))).slice(-2); }).join('');
}
function writeChunkedCache_(baseKey, value, ttlSeconds) {
  try {
    const json = JSON.stringify(value);
    const zipped = Utilities.gzip(Utilities.newBlob(json, 'application/json'));
    const encoded = Utilities.base64Encode(zipped.getBytes());
    const chunkSize = 70000;
    const count = Math.ceil(encoded.length / chunkSize);
    if (!count || count > 80) return false;
    const entries = {};
    entries[baseKey + ':meta'] = JSON.stringify({ count:count, hash:sha256Hex_(encoded), format:'gzip-base64' });
    for (let i = 0; i < count; i++) entries[baseKey + ':' + i] = encoded.slice(i * chunkSize, (i + 1) * chunkSize);
    CacheService.getScriptCache().putAll(entries, Math.min(21600, Math.max(30, Number(ttlSeconds) || 300)));
    return true;
  } catch (e) {
    return false;
  }
}
function readChunkedCache_(baseKey) {
  try {
    const cache = CacheService.getScriptCache();
    const rawMeta = cache.get(baseKey + ':meta');
    if (!rawMeta) return null;
    const meta = JSON.parse(rawMeta);
    if (!meta.count || meta.count > 80) return null;
    const keys = [];
    for (let i = 0; i < meta.count; i++) keys.push(baseKey + ':' + i);
    const parts = cache.getAll(keys);
    let encoded = '';
    for (let i = 0; i < keys.length; i++) {
      if (!parts[keys[i]]) return null;
      encoded += parts[keys[i]];
    }
    if (sha256Hex_(encoded) !== meta.hash) return null;
    const json = Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(encoded))).getDataAsString('UTF-8');
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}
function dataRows_(sheetName) {
  if (Object.prototype.hasOwnProperty.call(REQUEST_ROWS_CACHE_,sheetName)) return REQUEST_ROWS_CACHE_[sheetName];
  const sh=getDb_().getSheetByName(sheetName);
  if(!sh) throw new Error('Veri sayfası bulunamadı: '+sheetName);
  const last=sh.getLastRow();
  return REQUEST_ROWS_CACHE_[sheetName]=last<2?[]:sh.getRange(2,1,last-1,sh.getLastColumn()).getValues();
}
function optionalDataRows_(sheetName) {
  if (Object.prototype.hasOwnProperty.call(REQUEST_ROWS_CACHE_,sheetName)) return REQUEST_ROWS_CACHE_[sheetName];
  const sh=getDb_().getSheetByName(sheetName);
  if(!sh)return REQUEST_ROWS_CACHE_[sheetName]=[];
  const last=sh.getLastRow();
  return REQUEST_ROWS_CACHE_[sheetName]=last<2?[]:sh.getRange(2,1,last-1,sh.getLastColumn()).getValues();
}
function findRowBy_(sheetName, column, value) { const sh=getDb_().getSheetByName(sheetName); const last=sh.getLastRow(); if(last<2)return null; const vals=sh.getRange(2,1,last-1,sh.getLastColumn()).getValues(); for(let i=0;i<vals.length;i++){ if(String(vals[i][column-1]).toLowerCase()===String(value).toLowerCase()) return {row:i+2,values:vals[i]}; } return null; }
function requireSession_(token) {
  resetRequestCache_();
  const cache=CacheService.getScriptCache();
  const key='session:'+token;
  const raw=cache.get(key);
  if(!raw) throw new Error('Oturum süreniz doldu. Lütfen yeniden giriş yapın.');
  const session=JSON.parse(raw);
  if (!session.validatedAt || Date.now() - Number(session.validatedAt) > 120000) {
    const row=findRowBy_(APP.sheets.users,1,session.userId);
    if(!row||row.values[7]!==true){cache.remove(key);throw new Error('Kullanıcı hesabı pasif veya silinmiş. Lütfen yeniden giriş yapın.');}
    session.name=row.values[1];session.email=row.values[2];session.role=row.values[3];session.reference=row.values[4];session.validatedAt=Date.now();
  }
  cache.put(key,JSON.stringify(session),APP.sessionSeconds);
  return session;
}
function requireAdmin_(token) { const s=requireSession_(token); if(s.role!=='YÖNETİCİ') throw new Error('Bu işlem için yönetici yetkisi gerekir.'); return s; }
function requireApprover_(token) { const s=requireSession_(token); if(!isApproverSession_(s)) throw new Error('Bu işlem için yönetici veya muhasebe sorumlusu yetkisi gerekir.'); return s; }
function withLock_(fn) { const lock=LockService.getScriptLock(); lock.waitLock(20000); try{return fn();}finally{lock.releaseLock();} }
function audit_(email, action, type, id, detail) {
  try { appendRows_(getDb_().getSheetByName(APP.sheets.audit), [[new Date(),email,action,type,id,detail]], HEADERS.audit.length); } catch(e) {}
  if (action !== 'GİRİŞ' && action !== 'PDF_OLUŞTURULDU') invalidateAppDataCache_();
}
function hashPin_(pin,salt){ const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(pin)+String(salt),Utilities.Charset.UTF_8); return bytes.map(b=>('0'+((b<0?b+256:b).toString(16))).slice(-2)).join(''); }
function validatePin_(pin){ if(!/^\d{6,8}$/.test(String(pin||''))) throw new Error('PIN 6-8 rakam olmalıdır.'); }
function validateLoginPin_(pin){ if(!/^\d{4,8}$/.test(String(pin||''))) throw new Error('PIN geçersiz.'); }
function normalizeEmail_(v){ const x=String(v||'').trim().toLowerCase(); if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x)) throw new Error('Geçerli bir e-posta girin.'); return x; }
function cleanText_(v,max){ return String(v==null?'':v).replace(/[<>]/g,'').trim().slice(0,max||250); }
function normalizeHeader_(v){ return String(v||'').trim().toUpperCase().replace(/İ/g,'I').replace(/Ş/g,'S').replace(/Ğ/g,'G').replace(/Ü/g,'U').replace(/Ö/g,'O').replace(/Ç/g,'C').replace(/\s+/g,' '); }
function positiveNumber_(v,label){ const n=Number(v); if(!isFinite(n)||n<=0) throw new Error(label+' sıfırdan büyük olmalıdır.'); return Math.round(n*100)/100; }
function nonNegativeNumber_(v,label){ const n=flexibleNumber_(v); if(!isFinite(n)||n<0) throw new Error(label+' sıfırdan küçük olamaz.'); return Math.round(n*100)/100; }
function flexibleNumber_(value){
  if (typeof value === 'number') return value;
  let s=String(value==null?'':value).trim().replace(/\s|₺|TL/gi,'');
  if (!s) return NaN;
  const comma=s.lastIndexOf(','), dot=s.lastIndexOf('.');
  if (comma>=0 && dot>=0) {
    if (comma>dot) s=s.replace(/\./g,'').replace(',','.');
    else s=s.replace(/,/g,'');
  } else if (comma>=0) {
    s=s.replace(/\./g,'').replace(',','.');
  } else if (dot>=0 && /^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s=s.replace(/\./g,'');
  }
  return Number(s);
}
function parseDate_(v,label){ const d=v instanceof Date?v:new Date(String(v||'')+'T12:00:00'); if(isNaN(d.getTime())) throw new Error(label+' geçersiz.'); return d; }
function parseFlexibleDate_(value,label) {
  if(value instanceof Date&&!isNaN(value.getTime()))return value;
  if(typeof value==='number'&&isFinite(value)){const d=new Date(1899,11,30,12,0,0);d.setDate(d.getDate()+Math.floor(value));return d;}
  const text=String(value||'').trim();
  let m=text.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
  if(m){const d=new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),12,0,0);if(d.getFullYear()===Number(m[3])&&d.getMonth()===Number(m[2])-1&&d.getDate()===Number(m[1]))return d;}
  m=text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if(m){const d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),12,0,0);if(d.getFullYear()===Number(m[1])&&d.getMonth()===Number(m[2])-1&&d.getDate()===Number(m[3]))return d;}
  throw new Error((label||'Tarih')+' geçersiz. GG.AA.YYYY veya YYYY-AA-GG kullanın.');
}
function inRange_(v,start,end){ const d=v instanceof Date?v:new Date(v); return !isNaN(d.getTime())&&d>=start&&d<=end; }
function isoDate_(v){ if(!v)return ''; const d=v instanceof Date?v:new Date(v); if(isNaN(d.getTime()))return ''; return Utilities.formatDate(d,'Europe/Istanbul','yyyy-MM-dd'); }
function n_(v){ return Number(v)||0; }
function sum_(rows,index){ return rows.reduce((s,r)=>s+(Number(r[index])||0),0); }
function makeId_(prefix){ return prefix+'-'+Utilities.formatDate(new Date(),'Europe/Istanbul','yyyyMMddHHmmss')+'-'+Math.floor(1000+Math.random()*9000); }

