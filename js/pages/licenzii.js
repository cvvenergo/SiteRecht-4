(function () {
  const slidesData = {
    ru: [
      { src: 'assets/razreshenie-znaka.png', caption: 'Разрешение на применение знака соответствия', sub: 'Орган ЦТКАО-эксперт | Действует с 17.12.2025 по 16.12.2028' },
      { src: 'assets/cert-9001.png', caption: 'Сертификат соответствия ГОСТ Р ИСО 9001-2015', sub: 'Система менеджмента качества | Рег. № RA.RU.13НА77-0185 | До 16.12.2028' },
      { src: 'assets/cert-14001.png', caption: 'Сертификат соответствия ГОСТ Р ИСО 14001-2016', sub: 'Система экологического менеджмента | Рег. № RA.RU.13НА77-0186 | До 16.12.2028' },
      { src: 'assets/cert-45001.png', caption: 'Сертификат соответствия ГОСТ Р ИСО 45001-2020', sub: 'Охрана здоровья и безопасность труда | Рег. № RA.RU.13НА77-0187 | До 16.12.2028' },
      { src: 'assets/cert-19443.png', caption: 'Сертификат соответствия ГОСТ Р ИСО 19443-2020', sub: 'СМК для атомной отрасли | Рег. № RA.RU.13НА77-0188 | До 16.12.2028' }
    ],
    en: [
      { src: 'assets/razreshenie-znaka.png', caption: 'Authorization to Use the Conformity Mark', sub: 'TSTKAO-expert | Valid 17.12.2025–16.12.2028' },
      { src: 'assets/cert-9001.png', caption: 'Compliance Certificate GOST R ISO 9001-2015', sub: 'Quality Management System | Reg. No. RA.RU.13NA77-0185 | Until 16.12.2028' },
      { src: 'assets/cert-14001.png', caption: 'Compliance Certificate GOST R ISO 14001-2016', sub: 'Environmental Management System | Reg. No. RA.RU.13NA77-0186 | Until 16.12.2028' },
      { src: 'assets/cert-45001.png', caption: 'Compliance Certificate GOST R ISO 45001-2020', sub: 'Occupational Health & Safety | Reg. No. RA.RU.13NA77-0187 | Until 16.12.2028' },
      { src: 'assets/cert-19443.png', caption: 'Compliance Certificate GOST R ISO 19443-2020', sub: 'QMS for Nuclear Industry | Reg. No. RA.RU.13NA77-0188 | Until 16.12.2028' }
    ]
  };

  function getSlides() {
    const lang = document.documentElement.lang || 'ru';
    return slidesData[lang] || slidesData.ru;
  }

  let current = 0;

  function openLightbox(index) {
    current = index;
    updateLightbox();
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const slides = getSlides();
    const s = slides[current];
    document.getElementById('lightbox-img').src = s.src;
    document.getElementById('lightbox-img').alt = s.caption;
    document.getElementById('lightbox-caption').textContent = s.caption;
    document.getElementById('lightbox-sub').textContent = s.sub;
    document.getElementById('lightbox-counter').textContent = (current + 1) + ' / ' + slides.length;
  }

  function prevSlide() {
    const slides = getSlides();
    current = (current - 1 + slides.length) % slides.length;
    updateLightbox();
  }

  function nextSlide() {
    const slides = getSlides();
    current = (current + 1) % slides.length;
    updateLightbox();
  }

  function bindLightboxUi() {
    const lightbox = document.getElementById('lightbox');
    const grid = document.getElementById('lic-gallery-grid');
    const btnClose = document.getElementById('lightbox-close');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');
    if (!lightbox) return;

    if (grid) {
      grid.addEventListener('click', function (e) {
        const item = e.target.closest('.gallery-item[data-gallery-index]');
        if (!item) return;
        const idx = parseInt(item.getAttribute('data-gallery-index'), 10);
        if (!Number.isNaN(idx)) openLightbox(idx);
      });
    }

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    if (btnClose) {
      btnClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closeLightbox();
      });
    }
    if (btnPrev) {
      btnPrev.addEventListener('click', function (e) {
        e.stopPropagation();
        prevSlide();
      });
    }
    if (btnNext) {
      btnNext.addEventListener('click', function (e) {
        e.stopPropagation();
        nextSlide();
      });
    }
  }

  bindLightboxUi();

  document.addEventListener('keydown', function (e) {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });
})();
