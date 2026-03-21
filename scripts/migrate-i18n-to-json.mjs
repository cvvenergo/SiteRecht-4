/**
 * Однократная миграция: читает js/i18n.js (монолит с const translations = { ... }),
 * выносит строки в i18n/locales/*.json, перезаписывает js/i18n.js загрузчиком.
 * Запуск: node scripts/migrate-i18n-to-json.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const i18nJsPath = path.join(root, 'js', 'i18n.js');
const localesDir = path.join(root, 'i18n', 'locales');

function skipString(s, i, q) {
  i++;
  while (i < s.length) {
    if (s[i] === '\\') {
      i += 2;
      continue;
    }
    if (s[i] === q) return i + 1;
    i++;
  }
  return i;
}

function matchClosingBrace(s, openIdx) {
  let depth = 0;
  let i = openIdx;
  if (s[i] !== '{') throw new Error('expected {');
  depth = 1;
  i++;
  while (i < s.length && depth > 0) {
    const c = s[i];
    if (c === "'" || c === '"') {
      i = skipString(s, i, c);
      continue;
    }
    if (c === '/' && s[i + 1] === '/') {
      i += 2;
      while (i < s.length && s[i] !== '\n' && s[i] !== '\r') i++;
      continue;
    }
    if (c === '/' && s[i + 1] === '*') {
      i += 2;
      while (i < s.length - 1 && !(s[i] === '*' && s[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') depth--;
    i++;
  }
  return i - 1;
}

const PREFIX_TO_BUNDLE = {
  addr: 'common',
  nav: 'common',
  footer: 'common',
  btn: 'common',
  breadcrumb: 'common',
  hero: 'common',
  index: 'index',
  sorb: 'sorbenty',
  ener: 'energosistemy',
  inzh: 'inzhiniring',
  voda: 'vodoochistka',
  ruk: 'rukovodstvo',
  opyt: 'opyt',
  lic: 'licenzii',
  kont: 'kontakty',
  rza: 'rza',
  nad: 'nadezhnost',
};

function bundleForKey(key) {
  const dot = key.indexOf('.');
  const prefix = dot === -1 ? key : key.slice(0, dot);
  const b = PREFIX_TO_BUNDLE[prefix];
  if (!b) throw new Error(`Unknown key prefix for "${key}"`);
  return b;
}

function splitLocale(flat) {
  const bundles = {};
  for (const [key, val] of Object.entries(flat)) {
    const b = bundleForKey(key);
    if (!bundles[b]) bundles[b] = {};
    bundles[b][key] = val;
  }
  return bundles;
}

const marker = 'const translations = ';
const src = fs.readFileSync(i18nJsPath, 'utf8').replace(/\r\n/g, '\n');
const mPos = src.indexOf(marker);
if (mPos === -1) throw new Error('const translations = not found (already migrated?)');
let braceStart = src.indexOf('{', mPos);
const braceEnd = matchClosingBrace(src, braceStart);
const literal = src.slice(braceStart, braceEnd + 1);

// eslint-disable-next-line no-eval
const translations = eval('(' + literal + ')');

if (!translations.ru || !translations.en) throw new Error('Expected ru and en');

fs.mkdirSync(localesDir, { recursive: true });

const ruBundles = splitLocale(translations.ru);
const enBundles = splitLocale(translations.en);

const bundleNames = new Set([...Object.keys(ruBundles), ...Object.keys(enBundles)]);
for (const name of bundleNames) {
  const ruObj = ruBundles[name] || {};
  const enObj = enBundles[name] || {};
  fs.writeFileSync(
    path.join(localesDir, `${name}.ru.json`),
    JSON.stringify(ruObj, null, 2) + '\n',
    'utf8'
  );
  fs.writeFileSync(
    path.join(localesDir, `${name}.en.json`),
    JSON.stringify(enObj, null, 2) + '\n',
    'utf8'
  );
}

const newI18nJs = `// ===== INTERNATIONALIZATION (i18n) — JSON по страницам =====
(function () {
  var BASE = 'i18n/locales/';

  var TITLE_KEY_TO_BUNDLE = {
    'index.title': 'index',
    'sorb.title': 'sorbenty',
    'ener.title': 'energosistemy',
    'inzh.title': 'inzhiniring',
    'voda.title': 'vodoochistka',
    'ruk.title': 'rukovodstvo',
    'opyt.title': 'opyt',
    'lic.title': 'licenzii',
    'kont.title': 'kontakty',
    'rza.title': 'rza',
    'nad.title': 'nadezhnost',
  };

  var BUNDLE_ORDER = [
    'common',
    'index',
    'sorbenty',
    'energosistemy',
    'inzhiniring',
    'vodoochistka',
    'rukovodstvo',
    'opyt',
    'licenzii',
    'kontakty',
    'rza',
    'nadezhnost',
  ];

  var translations = { ru: null, en: null };
  var mergedRu = {};
  var mergedEn = {};

  function fetchJson(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('i18n: ' + url + ' ' + r.status);
      return r.json();
    });
  }

  function merge(target, obj) {
    for (var k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) target[k] = obj[k];
    }
  }

  function getBundlesToLoad() {
    var titleKey = document.body && document.body.getAttribute('data-page-title');
    var page = titleKey ? TITLE_KEY_TO_BUNDLE[titleKey] : null;
    var list = ['common'];
    if (page && list.indexOf(page) === -1) list.push(page);
    return list;
  }

  function loadLocale(lang) {
    var bundles = getBundlesToLoad();
    var tasks = bundles.map(function (name) {
      return fetchJson(BASE + name + '.' + lang + '.json');
    });
    return Promise.all(tasks).then(function (parts) {
      var flat = {};
      parts.forEach(function (p) {
        merge(flat, p);
      });
      return flat;
    });
  }

  function applyTranslations(lang) {
    var t = translations[lang];
    if (!t) return;

    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
    });

    var titleKey = document.body.getAttribute('data-page-title');
    if (titleKey && t[titleKey]) document.title = t[titleKey];

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  function setLang(lang) {
    try {
      localStorage.setItem('raecht_lang', lang);
    } catch (e) {}
    loadLocale(lang).then(function (flat) {
      translations[lang] = flat;
      applyTranslations(lang);
    });
  }

  function init() {
    var savedLang;
    try {
      savedLang = localStorage.getItem('raecht_lang');
    } catch (e) {}
    var lang = savedLang || 'ru';

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang'));
      });
    });

    loadLocale(lang).then(function (flat) {
      translations[lang] = flat;
      applyTranslations(lang);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;

fs.writeFileSync(i18nJsPath, newI18nJs, 'utf8');
console.log('Wrote JSON bundles to', localesDir);
console.log('Replaced', i18nJsPath, 'with fetch-based loader');
