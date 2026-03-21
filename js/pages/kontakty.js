(function () {
  const form = document.getElementById('contact-form');
  const successEl = document.getElementById('form-success-msg');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.style.display = 'none';
    if (successEl) {
      successEl.style.display = 'block';
      successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (typeof window.__raechtI18nRefresh === 'function') {
      window.__raechtI18nRefresh();
    }
  });
})();
