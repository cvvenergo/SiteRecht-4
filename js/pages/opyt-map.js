document.addEventListener('DOMContentLoaded', function () {
  (function () {
    var container = document.getElementById('geo-map');
    var map = null;
    var fallbackShown = false;
    var loadTimer = null;

    function showGeoMapFallback() {
      if (fallbackShown || !container) return;
      fallbackShown = true;
      try {
        if (loadTimer) {
          clearTimeout(loadTimer);
          loadTimer = null;
        }
      } catch (e) { /* ignore */ }
      try {
        if (map) {
          map.remove();
          map = null;
        }
      } catch (e) { /* ignore */ }
      try {
        container.innerHTML =
          '<div class="geo-map-fallback" role="alert" style="min-height:520px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center;background:#f0f4fa;color:var(--text-mid);box-sizing:border-box;">' +
          '<i class="fas fa-map-location-dot" style="font-size:40px;color:var(--blue-mid);opacity:.5;margin-bottom:16px;" aria-hidden="true"></i>' +
          '<strong data-i18n="opyt.map.error.title" style="font-size:18px;color:var(--text-dark);margin-bottom:8px;display:block;">Карта недоступна</strong>' +
          '<span data-i18n="opyt.map.error.desc" style="font-size:14px;max-width:420px;line-height:1.5;">Не удалось загрузить карту. Проверьте подключение к интернету или попробуйте позже.</span>' +
          '</div>';
        if (typeof window.__raechtI18nRefresh === 'function') {
          window.__raechtI18nRefresh();
        }
      } catch (e) { /* ignore */ }
    }

    if (!container) return;

    if (typeof maplibregl === 'undefined') {
      showGeoMapFallback();
      return;
    }

    try {
      map = new maplibregl.Map({
        container: 'geo-map',
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [72, 40],
        zoom: 2,
        scrollZoom: false
      });
    } catch (e) {
      showGeoMapFallback();
      return;
    }

    loadTimer = setTimeout(function () {
      if (fallbackShown) return;
      try {
        if (map && !map.isStyleLoaded()) {
          showGeoMapFallback();
        }
      } catch (e) {
        showGeoMapFallback();
      }
    }, 25000);

    map.on('error', function onGeoMapError() {
      try {
        if (fallbackShown || !map) return;
        var styleOk = false;
        try {
          styleOk = map.isStyleLoaded();
        } catch (e2) {
          styleOk = false;
        }
        if (!styleOk) {
          showGeoMapFallback();
        }
      } catch (e3) { /* ignore */ }
    });

    function createObjectPopupElement(name, desc) {
      var root = document.createElement('div');
      root.style.minWidth = '160px';
      var nameEl = document.createElement('strong');
      nameEl.style.fontSize = '13px';
      nameEl.style.color = '#002060';
      nameEl.textContent = name;
      var descEl = document.createElement('span');
      descEl.style.fontSize = '12px';
      descEl.style.color = '#666';
      descEl.textContent = desc;
      root.appendChild(nameEl);
      root.appendChild(document.createElement('br'));
      root.appendChild(descEl);
      return root;
    }

    var objects = [
      { name: 'Калининская АЭС',                   lat: 57.498, lng: 36.558, color: '#002060', desc: 'Тверская область' },
      { name: 'Нововоронежская АЭС',                lat: 51.289, lng: 39.212, color: '#002060', desc: 'Воронежская область' },
      { name: 'Смоленская АЭС',                     lat: 54.170, lng: 33.230, color: '#002060', desc: 'Смоленская область' },
      { name: 'Балаклавская АЭС',                   lat: 44.496, lng: 33.601, color: '#002060', desc: 'Республика Крым' },
      { name: 'Кольская АЭС',                       lat: 67.462, lng: 32.490, color: '#002060', desc: 'Мурманская область' },
      { name: 'ФГУП «Атомфлот»',                    lat: 68.980, lng: 33.092, color: '#002060', desc: 'Мурманск' },
      { name: 'Белоярская АЭС',                     lat: 56.842, lng: 61.318, color: '#002060', desc: 'Свердловская область' },
      { name: 'Кандалакшский алюминиевый завод',    lat: 67.153, lng: 32.413, color: '#e87c1e', desc: 'Мурманская область' },
      { name: 'Тобольская ТЭЦ',                     lat: 58.200, lng: 68.253, color: '#e87c1e', desc: 'Тобольск, Тюменская область' },
      { name: 'АО «СибурТюменьГаз»',               lat: 64.456, lng: 76.504, color: '#e87c1e', desc: 'Западная Сибирь' },
      { name: 'АО «Транснефть — Западная Сибирь»', lat: 57.150, lng: 65.530, color: '#e87c1e', desc: 'Тюмень' },
      { name: 'Красноярский алюминиевый завод',     lat: 55.926, lng: 92.793, color: '#e87c1e', desc: 'Красноярск' },
      { name: 'Братский алюминиевый завод',         lat: 56.134, lng: 101.610, color: '#e87c1e', desc: 'Братск, Иркутская область' },
      { name: 'Русал Новокузнецк',                  lat: 53.758, lng: 87.100,  color: '#e87c1e', desc: 'Новокузнецк, Кемеровская область' },
      { name: 'АО «Тываэнерго» (Туран)',            lat: 52.141, lng: 93.920,  color: '#e87c1e', desc: 'Туран, Республика Тыва' },
      { name: 'АЭС «Тяньвань»',                     lat: 34.609, lng: 119.461, color: '#c0392b', desc: 'Лянюньган, Китай' },
      { name: 'АЭС «Куданкулам»',                   lat:  8.171, lng:  77.712, color: '#c0392b', desc: 'Тамилнад, Индия' },
      { name: 'Южно-Украинская АЭС',                lat: 47.834, lng:  31.220, color: '#c0392b', desc: 'Николаевская область, Украина' }
    ];

    map.on('load', function () {
      try {
        if (loadTimer) {
          clearTimeout(loadTimer);
          loadTimer = null;
        }
      } catch (e) { /* ignore */ }
      try {
        objects.forEach(function (o) {
          try {
            var el = document.createElement('div');
            el.style.cssText = 'width:16px;height:16px;border-radius:50%;background:' + o.color + ';border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);cursor:pointer;';
            new maplibregl.Marker({ element: el })
              .setLngLat([o.lng, o.lat])
              .setPopup(
                new maplibregl.Popup({ offset: 12 }).setDOMContent(
                  createObjectPopupElement(o.name, o.desc)
                )
              )
              .addTo(map);
          } catch (e) { /* ignore marker errors */ }
        });
      } catch (e) { /* ignore */ }
    });
  })();
});
