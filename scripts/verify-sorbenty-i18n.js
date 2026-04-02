/**
 * Asserts every data-i18n / data-i18n-html / data-i18n-aria key on sorbenty.html
 * exists in both translations.ru and translations.en (js/i18n.js), via line-start 'key': scan.
 * Run from repo root: node scripts/verify-sorbenty-i18n.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'sorbenty.html');
const i18nPath = path.join(root, 'js', 'i18n.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const src = fs.readFileSync(i18nPath, 'utf8');

const used = new Set();
const attrRe = /data-i18n(?:-html|-aria)?="([^"]*)"/g;
let am;
while ((am = attrRe.exec(html)) !== null) {
  if (am[1].trim()) used.add(am[1].trim());
}

const t0 = src.indexOf('const translations');
const ruI = src.indexOf('ru: {', t0);
const enI = src.indexOf('en: {', ruI);
const enEnd = src.indexOf('\n  };', enI);
if (ruI < 0 || enI < 0 || enEnd < 0) {
  console.error('FAIL: could not locate translations.ru / translations.en blocks in js/i18n.js');
  process.exit(1);
}

/** Line-anchored 'key': avoids false positives inside string values and // comments. */
const keyLine = /^\s*'([\w.-]+)'\s*:/gm;
function keysIn(block) {
  const s = new Set();
  for (const m of block.matchAll(keyLine)) s.add(m[1]);
  return s;
}

const ruKeys = keysIn(src.slice(ruI, enI));
const enKeys = keysIn(src.slice(enI, enEnd));

const missRu = [...used].filter((k) => !ruKeys.has(k));
const missEn = [...used].filter((k) => !enKeys.has(k));

if (missRu.length || missEn.length) {
  console.error('FAIL: sorbenty.html i18n keys missing from js/i18n.js');
  if (missRu.length) console.error('  missing in ru:', missRu.join(', '));
  if (missEn.length) console.error('  missing in en:', missEn.join(', '));
  process.exit(1);
}

console.log('OK:', used.size, 'unique keys on sorbenty.html present in ru and en.');
