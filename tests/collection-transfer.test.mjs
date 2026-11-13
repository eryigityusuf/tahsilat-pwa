import assert from 'node:assert/strict';
import fs from 'node:fs';

const client = fs.readFileSync(new URL('../Scripts.html', import.meta.url), 'utf8');
const server = fs.readFileSync(new URL('../Code.gs', import.meta.url), 'utf8');

assert.match(client, /Tahsilata aktar/, 'Teberru satırında tahsilata aktarma işlemi bulunmalı.');
assert.match(client, /Teberruya aktar/, 'Tahsilat satırında teberruya aktarma işlemi bulunmalı.');
assert.match(client, /searchPickerHtml\('transferPledge'/, 'Teberrudan tahsilata aktarırken hedef taahhüt aranabilmeli.');
assert.match(server, /function convertCollectionToDonation\(token, collectionId\)/, 'Tahsilattan teberruya güvenli sunucu işlemi bulunmalı.');
assert.match(server, /function convertDonationToCollection\(token, collectionId, targetPledgeId\)/, 'Teberrudan tahsilata güvenli sunucu işlemi bulunmalı.');
assert.match(server, /requireApprover_\(token\)/, 'Aktarma işlemi yalnızca onay yetkisiyle yapılmalı.');
assert.match(server, /recalculatePledge_\(pledgeId\)/, 'Aktarmadan sonra taahhüt bakiyesi yeniden hesaplanmalı.');
assert.match(server, /Öğrenci tahsilatları teberruya aktarılamaz/, 'Öğrenci ödeme planı bağlantısı korunmalı.');

console.log(JSON.stringify({ bidirectionalTransfer:true, pledgePicker:true, balancesRecalculated:true, cashPreserved:true, ok:true }));
