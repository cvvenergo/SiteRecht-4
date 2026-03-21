// ===== INTERNATIONALIZATION (i18n) — JSON по страницам =====
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

  var translations = { ru: null, en: null };
  var loadedFlat = { ru: null, en: null };

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
    if (loadedFlat[lang]) return Promise.resolve(loadedFlat[lang]);
    var bundles = getBundlesToLoad();
    var tasks = bundles.map(function (name) {
      return fetchJson(BASE + name + '.' + lang + '.json');
    });
    return Promise.all(tasks).then(function (parts) {
      var flat = {};
      parts.forEach(function (p) {
        merge(flat, p);
      });
      loadedFlat[lang] = flat;
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
    loadLocale(lang).then(
      function (flat) {
        translations[lang] = flat;
        applyTranslations(lang);
      },
      function (err) {
        console.error(err);
      }
    );
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

    loadLocale(lang).then(
      function (flat) {
        translations[lang] = flat;
        applyTranslations(lang);
      },
      function (err) {
        console.error(err);
      }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
