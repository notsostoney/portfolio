/* ============================================================
   ANTOINE PORNIN — MAIN.JS
   Cursor · Stars · Scroll progress · Nav · Counters · Reveals
   Filter · Skill bars
   ============================================================ */

(function () {
  'use strict';

  /* ── CURSOR ─────────────────────────────────────────────── */
  (function initCursor() {
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring || window.matchMedia('(pointer:coarse)').matches) return;

    let mx = -200, my = -200;
    let rx = -200, ry = -200;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    document.addEventListener('mousedown', () => ring.classList.add('clicked'));
    document.addEventListener('mouseup',   () => ring.classList.remove('clicked'));

    const hoverTargets = 'a, button, [role="button"], .proj-card, .exp-card, .loc-card, .contact-link, .glass-panel, .filter-btn, .lang-btn, canvas';

    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverTargets)) ring.classList.add('hovered');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverTargets)) ring.classList.remove('hovered');
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

  /* ── STARS CANVAS ───────────────────────────────────────── */
  (function initStars() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const STAR_COUNT = 140;
    let stars = [];
    let W, H;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function createStars() {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x:    Math.random() * W,
        y:    Math.random() * H * 0.7,  // upper 70% of screen
        r:    Math.random() * 1.2 + 0.2,
        a:    Math.random(),
        da:   (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
        aMin: 0.1,
        aMax: 0.9,
      }));
    }

    function drawStars() {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.a += s.da;
        if (s.a <= s.aMin || s.a >= s.aMax) s.da *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${s.a})`;
        ctx.fill();
      });
      requestAnimationFrame(drawStars);
    }

    resize();
    createStars();
    drawStars();
    window.addEventListener('resize', () => { resize(); createStars(); });
  })();

  /* ── SCROLL PROGRESS ────────────────────────────────────── */
  (function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    function update() {
      const max  = document.documentElement.scrollHeight - window.innerHeight;
      const pct  = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ── SMOOTH ANCHOR SCROLL ───────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id  = link.getAttribute('href').slice(1);
      const el  = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const offset = 80; // nav height clearance
      const top    = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── ACTIVE NAV ─────────────────────────────────────────── */
  (function initActiveNav() {
    const sections  = document.querySelectorAll('section[data-section]');
    const navLinks  = document.querySelectorAll('.nav-link[data-section]');
    const mobLinks  = document.querySelectorAll('.mob-link[data-section]');

    function setActive(id) {
      navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
      mobLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.dataset.section); });
    }, { threshold: 0.35 });

    sections.forEach(s => obs.observe(s));
  })();

  /* ── REVEAL ON SCROLL ───────────────────────────────────── */
  (function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const delay = i * 60;
          setTimeout(() => e.target.classList.add('revealed'), delay);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(el => obs.observe(el));
  })();

  /* ── NUMBER COUNTERS ────────────────────────────────────── */
  (function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    function ease(p) { return 1 - Math.pow(1 - p, 4); }

    function animateNum(el, target) {
      const dur   = target > 100 ? 2000 : 1000;
      const start = performance.now();

      function tick(now) {
        const p   = Math.min((now - start) / dur, 1);
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
    }, { threshold: 0.6 });

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
    }, { threshold: 0.5 });

    bars.forEach(bar => obs.observe(bar));
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

        const filter = btn.dataset.filter;
        cards.forEach(card => {
          const match = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('hidden', !match);

          // Re-trigger reveal animation
          if (match) {
            card.classList.remove('revealed');
            setTimeout(() => card.classList.add('revealed'), 50);
          }
        });
      });
    });

    // Ensure all cards start revealed
    setTimeout(() => cards.forEach(c => c.classList.add('revealed')), 800);
  })();

  /* ── HERO NAME STAGGER ──────────────────────────────────── */
  (function initHeroAnim() {
    const first = document.querySelector('.name-first');
    const last  = document.querySelector('.name-last');
    const badge = document.querySelector('.hero-badge');
    const role  = document.querySelector('.hero-role');
    const desc  = document.querySelector('.hero-desc');
    const cta   = document.querySelector('.hero-cta');
    const stats = document.querySelector('.hero-stats');

    const els = [badge, first, last, role, desc, cta, stats].filter(Boolean);

    els.forEach((el, i) => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(22px)';
      el.style.transition= `opacity 0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 110}ms, transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 110}ms`;
    });

    // Trigger after tiny delay (allow fonts to load)
    setTimeout(() => {
      els.forEach(el => {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      });
    }, 150);
  })();

  /* ── GLOBE HINT AUTO-HIDE ───────────────────────────────── */
  (function initGlobeHint() {
    const hint   = document.querySelector('.globe-hint');
    const canvas = document.querySelector('#hero-globe-wrap canvas');
    if (!hint || !canvas) return;

    function hide() {
      hint.style.opacity    = '0';
      hint.style.transition = 'opacity 0.5s';
      setTimeout(() => { if (hint.parentNode) hint.remove(); }, 500);
    }

    canvas.addEventListener('mousedown', hide, { once: true });
    canvas.addEventListener('touchstart', hide, { once: true });
    setTimeout(hide, 7000);
  })();

  /* ── LOC CARD SCROLL-REVEAL STAGGER ─────────────────────── */
  (function initLocCards() {
    const cards = document.querySelectorAll('.loc-card');
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 80}ms`;
    });
  })();

  /* ── RESIZE GLOBE ON WINDOW RESIZE ─────────────────────── */
  window.addEventListener('resize', () => {
    if (window._globe && window._globe._resize) {
      window._globe._resize();
    }
  });

})();
