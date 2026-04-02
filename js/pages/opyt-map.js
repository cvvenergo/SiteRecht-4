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
      { name: 'АЭС «Тяньвань»', lat: 34.686, lng: 119.458, color: '#c0392b', desc: 'Китай' },
      { name: 'АЭС «Куданкулам»', lat: 8.169, lng: 77.706, color: '#c0392b', desc: 'Индия' },
      { name: 'Балаковская АЭС', lat: 51.957, lng: 47.805, color: '#002060', desc: 'Саратовская область' },
      { name: 'Калининская АЭС', lat: 57.475, lng: 36.353, color: '#002060', desc: 'Тверская область' },
      { name: 'Кольская АЭС', lat: 67.465, lng: 32.481, color: '#002060', desc: 'Мурманская область' },
      { name: 'Нововоронежская АЭС', lat: 51.273, lng: 39.200, color: '#002060', desc: 'Воронежская область' },
      { name: 'Смоленская АЭС', lat: 54.167, lng: 33.246, color: '#002060', desc: 'Смоленская область' },
      { name: 'Южно-Украинская АЭС', lat: 47.817, lng: 31.101, color: '#c0392b', desc: 'Украина' },
      { name: 'ФГУП «Атомфлот»', lat: 68.979, lng: 33.074, color: '#002060', desc: 'Мурманск' },
      { name: 'Белоярская АЭС', lat: 56.841, lng: 61.322, color: '#002060', desc: 'Свердловская область' },
      { name: 'Тобольская ТЭЦ', lat: 58.211, lng: 68.238, color: '#e87c1e', desc: 'Тобольск, Тюменская область' },
      { name: 'АО «Тываэнерго» (ПС 220 кВ Мерген)', lat: 51.480, lng: 94.850, color: '#e87c1e', desc: 'Республика Тыва' },
      { name: 'АО «СибурТюменьГаз»', lat: 64.456, lng: 76.504, color: '#e87c1e', desc: 'ЯНАО' },
      { name: 'АО «Транснефть — Западная Сибирь» (ПС 110 кВ Вознесенка)', lat: 57.780, lng: 67.220, color: '#e87c1e', desc: 'Тюменская область' },
      { name: 'Кандалакшский алюминиевый завод', lat: 67.156, lng: 32.407, color: '#e87c1e', desc: 'Мурманская область' },
      { name: 'Красноярский алюминиевый завод', lat: 55.927, lng: 92.794, color: '#e87c1e', desc: 'Красноярск' },
      { name: 'Братский алюминиевый завод', lat: 56.132, lng: 101.614, color: '#e87c1e', desc: 'Братск, Иркутская область' },
      { name: 'Новокузнецкий алюминиевый завод', lat: 53.772, lng: 87.055, color: '#e87c1e', desc: 'Кемеровская область' },
      { name: 'Ленинградская АЭС-2', lat: 60.204, lng: 28.991, color: '#002060', desc: 'Ленинградская область' },
      { name: 'Белорусская АЭС', lat: 54.762, lng: 25.646, color: '#c0392b', desc: 'Республика Беларусь' }
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
