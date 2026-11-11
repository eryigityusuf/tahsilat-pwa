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
  .replace("  <?!= include('Styles'); ?>", [
    '  <meta name="description" content="Tahsilat, taahhüt, öğrenci, personel ve öğretmen ödemeleri yönetimi">',
    '  <link rel="manifest" href="./manifest.webmanifest">',
    '  <link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">',
    '  <link rel="stylesheet" href="./styles.css?v=58">',
  ].join('\n'))
  .replace("  <?!= include('Scripts'); ?>", '  <script src="./app.js?v=58" defer></script>');

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
