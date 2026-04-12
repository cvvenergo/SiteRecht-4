// ===== HERO SLIDER =====
(function () {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;
  let current = 0;
  let timer;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, 6000);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startTimer(); }));

  const btnNext = document.querySelector('.hero-next');
  const btnPrev = document.querySelector('.hero-prev');
  if (btnNext) btnNext.addEventListener('click', () => { next(); startTimer(); });
  if (btnPrev) btnPrev.addEventListener('click', () => { prev(); startTimer(); });

  startTimer();
})();

// ===== STICKY HEADER =====
(function () {
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
})();

// ===== DESKTOP NAV ACTIVE (body[data-nav-active] + .nav-link[data-nav]) =====
(function () {
  const key = document.body.dataset.navActive;
  if (!key) return;
  document.querySelectorAll('.nav-link[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === key);
  });
})();

// ===== MOBILE NAV =====
(function () {
  const btn = document.querySelector('.hamburger');
  const nav = document.querySelector('.mobile-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

// ===== TABS =====
(function () {
  const KNOWN_TAB_PANEL_IDS = new Set([
    'tab-sorbenty',
    'tab-energy',
    'tab-voda',
  ]);

  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  if (!tabBtns.length) return;

  function isAllowedTabId(id) {
    return typeof id === 'string' && KNOWN_TAB_PANEL_IDS.has(id);
  }

  function activateTab(tabId) {
    if (!isAllowedTabId(tabId)) return;
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    const btn = document.querySelector('.tab-btn[data-tab="' + tabId + '"]');
    const panel = document.getElementById(tabId);
    if (btn) btn.classList.add('active');
    if (panel) panel.classList.add('active');
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });

  // Activate tab from URL hash on page load (invalid / unknown hash: no-op, first tab stays active)
  let rawHash = window.location.hash.replace(/^#/, '');
  try {
    rawHash = decodeURIComponent(rawHash);
  } catch (_) {
    rawHash = '';
  }
  const tabFromHash = rawHash.split(/[?&#]/)[0];
  if (tabFromHash && isAllowedTabId(tabFromHash)) {
    activateTab(tabFromHash);
    setTimeout(() => {
      const section = document.querySelector('.tabs');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
})();

// ===== COUNTER ANIMATION =====
(function () {
  const counters = document.querySelectorAll('.stat-number[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const end = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 2000;
        const step = Math.ceil(end / (duration / 16));
        let current = 0;

        const update = () => {
          current = Math.min(current + step, end);
          el.textContent = current + suffix;
          if (current < end) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

// ===== SCROLL REVEAL =====
(function () {
  const els = document.querySelectorAll('.dir-card, .service-card, .news-card, .team-card, .product-card, .adv-card, .project-item');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity .5s ease ${i * 0.07}s, transform .5s ease ${i * 0.07}s`;
    observer.observe(el);
  });
})();
