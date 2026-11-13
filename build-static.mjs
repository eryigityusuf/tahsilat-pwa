import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('.', import.meta.url);
const target = new URL('./github-pages-pwa-hazir/', root);

const [indexTemplate, stylesTemplate, scriptsTemplate] = await Promise.all([
  readFile(fileURLToPath(new URL('../outputs/drive-tahsilat-web/kodlar/Index.html', root)), 'utf8'),
  readFile(new URL('./Styles.html', root), 'utf8'),
  readFile(new URL('./Scripts.html', root), 'utf8'),
]);

const index = indexTemplate
  .replace('<body>', '<body class="session-restoring">')
  .replace('<main id="loginView" class="login-shell">', '<main id="loginView" class="login-shell hidden">')
  .replace("  <?!= include('Styles'); ?>", [
    '  <meta name="description" content="Tahsilat, taahhüt, öğrenci, personel ve öğretmen ödemeleri yönetimi">',
    '  <link rel="manifest" href="./manifest.webmanifest">',
    '  <link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">',
    '  <link rel="stylesheet" href="./styles.css?v=73">',
  ].join('\n'))
  .replace("  <?!= include('Scripts'); ?>", [
    '  <div id="sessionWarning" class="session-warning hidden" role="alertdialog" aria-modal="true" aria-labelledby="sessionWarningTitle">',
    '    <div class="session-warning-card">',
    '      <div class="session-warning-icon" aria-hidden="true">⌛</div>',
    '      <strong id="sessionWarningTitle">Oturum kapanmak üzere</strong>',
    '      <p>Uzun süredir işlem yapılmadı. Oturumunuz <span id="sessionCountdown">2:00</span> içinde kapanacak.</p>',
    '      <button class="btn primary" type="button" onclick="continueSession()">Oturuma devam et</button>',
    '    </div>',
    '  </div>',
    '  <script src="./app.js?v=73" defer></script>',
  ].join('\n'));

const styles = stylesTemplate
  .replace(/^\s*<style>\s*/i, '')
  .replace(/\s*<\/style>\s*$/i, '') + '\n';

const scripts = scriptsTemplate
  .replace(/^\s*<script>\s*/i, '')
  .replace(/\s*<\/script>\s*$/i, '') + [
    '',
    "if ('serviceWorker' in navigator) {",
    "  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));",
    '}',
    '',
  ].join('\n');

await Promise.all([
  writeFile(new URL('./index.html', target), index, 'utf8'),
  writeFile(new URL('./styles.css', target), styles, 'utf8'),
  writeFile(new URL('./app.js', target), scripts, 'utf8'),
]);

console.log('Statik PWA dosyaları oluşturuldu.');
