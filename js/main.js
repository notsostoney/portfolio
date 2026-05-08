/* ============================================================
   ANTOINE PORNIN — MAIN.JS v2
   Cursor · Scroll progress · Nav · Reveal · Counters · Bars · Filter
   ============================================================ */

(function () {
  'use strict';

  /* ── CUSTOM CURSOR ──────────────────────────────────────── */
  (function initCursor() {
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring || window.matchMedia('(pointer:coarse)').matches) return;

    let mx = -200, my = -200;
    let rx = -200, ry = -200;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    document.addEventListener('mousedown', () => ring.classList.add('clicked'));
    document.addEventListener('mouseup',   () => ring.classList.remove('clicked'));

    const hoverable = 'a, button, [role="button"], .proj-card, .exp-card, .loc-card, .contact-link, .glass-panel, .filter-btn, .hero-globe-card, .pin-label, canvas';

    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverable)) ring.classList.add('hovered');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverable)) ring.classList.remove('hovered');
    });

    function loop() {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(loop);
    }
    loop();
  })();

  /* ── SCROLL PROGRESS ────────────────────────────────────── */
  (function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ── SMOOTH ANCHOR SCROLL ───────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });

  /* ── ACTIVE NAV ─────────────────────────────────────────── */
  (function initActiveNav() {
    const sections = document.querySelectorAll('section[data-section]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const mobLinks = document.querySelectorAll('.mob-link[data-section]');

    function setActive(id) {
      navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
      mobLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
    }

    new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.dataset.section); });
    }, { threshold: 0.30 }).observe && sections.forEach(s => {
      new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.dataset.section); });
      }, { threshold: 0.30 }).observe(s);
    });
  })();

  /* ── SCROLL REVEAL ──────────────────────────────────────── */
  (function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    const obs   = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('revealed'), i * 55);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.10 });
    items.forEach(el => obs.observe(el));
  })();

  /* ── NUMBER COUNTERS ────────────────────────────────────── */
  (function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    function ease(p) { return 1 - Math.pow(1 - p, 4); }

    function animateNum(el, target) {
      const dur   = target > 100 ? 1800 : 900;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(ease(p) * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateNum(e.target, parseInt(e.target.dataset.count, 10));
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    nums.forEach(el => obs.observe(el));
  })();

  /* ── SKILL BARS ─────────────────────────────────────────── */
  (function initSkillBars() {
    const bars = document.querySelectorAll('.skill-fill');
    if (!bars.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('animated');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(b => obs.observe(b));
  })();

  /* ── PROJECT FILTER ─────────────────────────────────────── */
  (function initFilter() {
    const btns  = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.proj-card');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        cards.forEach(card => {
          const show = f === 'all' || card.dataset.category === f;
          card.classList.toggle('hidden', !show);
          if (show) {
            card.classList.remove('revealed');
            setTimeout(() => card.classList.add('revealed'), 50);
          }
        });
      });
    });

    // Start all cards revealed
    setTimeout(() => cards.forEach(c => c.classList.add('revealed')), 700);
  })();

  /* ── HERO STAGGER ANIMATION ─────────────────────────────── */
  (function initHeroAnim() {
    const els = [
      document.querySelector('.hero-badge'),
      document.querySelector('.name-first'),
      document.querySelector('.name-last'),
      document.querySelector('.hero-role'),
      document.querySelector('.hero-desc'),
      document.querySelector('.hero-cta'),
    ].filter(Boolean);

    els.forEach((el, i) => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(18px)';
      el.style.transition = `opacity 0.65s cubic-bezier(0.25,0.46,0.45,0.94) ${120 + i*100}ms, transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94) ${120 + i*100}ms`;
    });

    // Hero side panels
    ['.hero-globe-card', '.hero-stats-card'].forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.style.opacity    = '0';
      el.style.transform  = 'translateX(18px)';
      el.style.transition = `opacity 0.65s ease ${300 + i*120}ms, transform 0.65s ease ${300 + i*120}ms`;
    });

    setTimeout(() => {
      els.forEach(el => {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      });
      ['.hero-globe-card', '.hero-stats-card'].forEach(sel => {
        const el = document.querySelector(sel);
        if (el) { el.style.opacity = '1'; el.style.transform = 'translateX(0)'; }
      });
    }, 80);
  })();

  /* ── RESIZE GLOBE ───────────────────────────────────────── */
  window.addEventListener('resize', () => {
    if (window._globe && window._globe._resize) window._globe._resize();
  });

})();
