// ===== Theme toggle =====
(function () {
  const t = document.querySelector('[data-theme-toggle]'),
    r = document.documentElement;
  let d = 'light';
  r.setAttribute('data-theme', d);
  const sun = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const moon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const setIcon = () => { if (t) t.innerHTML = d === 'dark' ? sun : moon; };
  setIcon();
  t && t.addEventListener('click', () => {
    d = d === 'dark' ? 'light' : 'dark';
    r.setAttribute('data-theme', d);
    setIcon();
  });
})();

// ===== Sticky header shadow =====
(function () {
  const h = document.getElementById('header');
  const onScroll = () => h.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ===== Burger / mobile nav =====
(function () {
  const b = document.getElementById('burger'),
    nav = document.getElementById('mobileNav');
  if (!b) return;
  b.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    b.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      b.setAttribute('aria-expanded', 'false');
    })
  );
})();

// ===== Preloader (spinning logo intro) =====
(function () {
  const pre = document.getElementById('preloader');
  const circle = document.getElementById('preloader-circle');
  if (!pre || !circle) return;
  const finish = () => {
    pre.classList.add('is-hidden');
    setTimeout(() => {
      pre.style.display = 'none';
      document.body.style.overflow = '';
    }, 600);
  };
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  document.body.style.overflow = 'hidden';
  if (reduce) { setTimeout(finish, 200); return; }
  const start = () => {
    circle.classList.add('rotate-animation');
    circle.addEventListener('animationend', () => setTimeout(finish, 300), { once: true });
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
  // Safety fallback in case animationend never fires
  setTimeout(finish, 4500);
})();

// ===== Services carousel + mega-menu jump =====
(function () {
  const track = document.getElementById('svcTrack');
  if (!track) return;
  const slides = Array.from(track.querySelectorAll('.service-slide'));
  const prev = document.getElementById('svcPrev');
  const next = document.getElementById('svcNext');
  const dots = Array.from(document.querySelectorAll('#svcDots .carousel__dot'));
  const total = slides.length;
  let idx = 0;

  const render = () => {
    track.style.transform = 'translateX(' + (-idx * 100) + '%)';
    dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
  };
  const goTo = (i) => { idx = (i % total + total) % total; render(); };

  prev && prev.addEventListener('click', () => goTo(idx - 1));
  next && next.addEventListener('click', () => goTo(idx + 1));
  dots.forEach((d) => d.addEventListener('click', () => goTo(parseInt(d.dataset.go, 10) || 0)));

  // Keyboard arrows when carousel is in view focus
  document.addEventListener('keydown', (e) => {
    const car = document.getElementById('servicesCarousel');
    if (!car) return;
    const r = car.getBoundingClientRect();
    const inView = r.top < window.innerHeight * 0.8 && r.bottom > window.innerHeight * 0.2;
    if (!inView) return;
    if (e.key === 'ArrowLeft') goTo(idx - 1);
    if (e.key === 'ArrowRight') goTo(idx + 1);
  });

  // Map service slug -> slide index
  const indexOfService = (slug) => slides.findIndex((s) => s.dataset.service === slug);

  // Mega-menu links jump carousel to the matching slide
  document.querySelectorAll('.mega__link[data-svc-go]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = indexOfService(btn.dataset.svcGo);
      if (target >= 0) goTo(target);
      const sec = document.getElementById('services');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const menu = btn.closest('.nav__item--has-menu');
      if (menu) menu.classList.remove('open');
    });
  });

  // Touch / swipe support
  let startX = null;
  const vp = track.closest('.carousel__viewport');
  if (vp) {
    vp.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    vp.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) goTo(idx + (dx < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });
  }

  render();
})();

// ===== Mega-menu tap-to-open on touch devices =====
(function () {
  const item = document.querySelector('.nav__item--has-menu');
  if (!item) return;
  const link = item.querySelector('.nav__link');
  const isTouch = matchMedia('(hover:none)').matches;
  if (link && isTouch) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      item.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!item.contains(e.target)) item.classList.remove('open');
    });
  }
})();

// ===== Order form -> Google Forms submission =====
(function () {
  const form = document.getElementById('orderForm');
  if (!form) return;
  const note = document.getElementById('orderFormNote');
  const defaultNote = note ? note.textContent : '';
  const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdqFq2_rfZLl2pJPM9XFWuwRsSzUvfTx1sWh5u794IynMQmZg/formResponse';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const nameValue = (document.getElementById('form-name') || {}).value || '';
    const phoneValue = (document.getElementById('form-phone') || {}).value || '';

    const formData = new URLSearchParams();
    formData.append('entry.1658913786', nameValue);
    formData.append('entry.132678891', phoneValue);

    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Надсилаємо…'; }

    fetch(googleFormUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    }).then(function () {
      form.reset();
      if (note) { note.textContent = 'Дякуємо! Заявку отримано — передзвонимо протягом 15 хвилин.'; note.style.color = 'var(--color-primary)'; }
      if (btn) { btn.disabled = false; btn.textContent = 'Отримати розрахунок'; }
      if (window.dataLayer) { window.dataLayer.push({ event: 'order_form_submit' }); }
    }).catch(function () {
      if (note) { note.textContent = 'Не вдалося надіслати. Зателефонуйте, будь ласка: +38 (063) 189-48-25'; note.style.color = '#e25555'; }
      if (btn) { btn.disabled = false; btn.textContent = 'Отримати розрахунок'; }
    });
  });
})();

// ===== Discount promo popup (after 10s) =====
(function () {
  const promo = document.getElementById('promo');
  if (!promo) return;
  const closeBtn = document.getElementById('promoClose');
  const cta = document.getElementById('promoCta');
  let shown = false;

  const open = () => {
    if (shown) return;
    // Don't reopen if the user already dismissed it this session
    try { if (sessionStorage.getItem('promoDismissed') === '1') return; } catch (e) {}
    shown = true;
    promo.classList.add('is-open');
    promo.setAttribute('aria-hidden', 'false');
  };
  const close = () => {
    promo.classList.remove('is-open');
    promo.setAttribute('aria-hidden', 'true');
    try { sessionStorage.setItem('promoDismissed', '1'); } catch (e) {}
  };

  setTimeout(open, 10000);
  closeBtn && closeBtn.addEventListener('click', close);
  // Clicking the CTA scrolls to the order form and closes the popup
  cta && cta.addEventListener('click', () => setTimeout(close, 150));
})();

// ===== Reveal on scroll (progressive enhancement) =====
(function () {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const els = document.querySelectorAll('.section__head, .step, .review-card, .quality__content, .quality__media');
  els.forEach(el => { el.style.opacity = 0; el.style.transform = 'translateY(24px)'; el.style.transition = 'opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)'; });
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => { e.target.style.opacity = 1; e.target.style.transform = 'none'; }, (i % 4) * 70);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
  // Safety: ensure everything is visible after load regardless
  window.addEventListener('load', () => setTimeout(() => els.forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }), 2500));
})();

// ===== Order modal (open form on "Замовити" clicks) =====
(function () {
  const modal = document.getElementById('orderModal');
  const slot = document.getElementById('orderModalSlot');
  const form = document.getElementById('orderForm');
  if (!modal || !slot || !form) return;

  // Remember where the form lives so we can restore it on close
  const homeParent = form.parentNode;
  const placeholder = document.createComment('order-form-home');
  homeParent.insertBefore(placeholder, form);

  let lastFocus = null;

  const open = () => {
    if (form.parentNode !== slot) slot.appendChild(form);
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const firstInput = form.querySelector('input, select, button');
    if (firstInput) setTimeout(() => firstInput.focus(), 80);
  };
  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    // Move the form back to its original place in the page
    if (placeholder.parentNode) placeholder.parentNode.insertBefore(form, placeholder);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  // Any element linking to #order (header CTA, hero, service cards, final CTA, promo CTA) opens the modal
  document.querySelectorAll('a[href="#order"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      // Close mobile nav / promo popup if open
      const mobileNav = document.getElementById('mobileNav');
      if (mobileNav) mobileNav.classList.remove('open');
      open();
    });
  });

  modal.querySelectorAll('[data-modal-close]').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) close(); });

  // Auto-close shortly after a successful submission (note text changes to a thank-you)
  const note = document.getElementById('orderFormNote');
  if (note) {
    const obs = new MutationObserver(() => {
      if (/Дякуємо/i.test(note.textContent)) setTimeout(close, 2600);
    });
    obs.observe(note, { childList: true, characterData: true, subtree: true });
  }
})();
