/* ─── NAVBAR ─────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navbar.classList.toggle('menu-open');
  });
}

// Close menu when link clicked
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navbar.classList.remove('menu-open'));
});

/* ─── ACTIVE PAGE NAV LINK ───────────────────────────────────── */
(function() {
  const page = document.body.dataset.page;
  document.querySelectorAll('.nav-links a[data-nav]').forEach(a => {
    a.classList.toggle('page-active', a.dataset.nav === page);
  });
})();

/* ─── SCROLL ANIMATIONS ──────────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('in-view');
      }, parseInt(delay));
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

/* ─── LANGUAGE BAR ANIMATION ─────────────────────────────────── */
const langObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.lang-fill').forEach(bar => {
        setTimeout(() => bar.classList.add('animated'), 200);
      });
    }
  });
}, { threshold: 0.3 });

const langSection = document.querySelector('.languages-row');
if (langSection) langObserver.observe(langSection);

/* ─── PROJECT FILTER ─────────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const cat = card.dataset.category;
      const show = filter === 'all' || cat === filter;
      card.style.opacity = show ? '1' : '0';
      card.style.transform = show ? '' : 'scale(.95)';
      card.style.display = show ? 'flex' : 'none';
    });
  });
});

/* ─── MODAL DATA ─────────────────────────────────────────────── */
const modals = {
  'modal-benchmark': {
    title: 'Benchmark concurrentiel – Communication',
    domain: 'Marketing',
    emoji: '📈',
    bg: 'linear-gradient(135deg, #1B3D5C, #2A5580)',
    desc: "Lors de mon stage chez Clen, j'ai réalisé un benchmark concurrentiel dans le domaine de la communication. J'ai analysé les pratiques de communication d'acteurs concurrents ou similaires : canaux utilisés, messages véhiculés, image de marque et supports mobilisés. Cette analyse a permis d'identifier des opportunités d'amélioration et des bonnes pratiques transposables.",
    skills: ['Benchmark', 'Analyse concurrentielle', 'Communication', 'Esprit de synthèse']
  },
  'modal-dashboard': {
    title: 'Tableau de bord de suivi de projet',
    domain: 'Marketing / Gestion de projet',
    emoji: '📊',
    bg: 'linear-gradient(135deg, #1E4A6E, #1B3D5C)',
    desc: "Dans le cadre de différents projets académiques et professionnels, j'ai conçu des tableaux de bord pour suivre l'avancement des actions, les indicateurs clés et le bon déroulement des jalons. Ces outils permettent d'avoir une vision claire et synthétique de la progression d'un projet.",
    skills: ['Excel', 'Suivi de projet', 'Analyse', 'Organisation', 'Indicateurs']
  },
  'modal-choco': {
    title: "Analyse de l'offre – Marché du chocolat",
    domain: 'Marketing',
    emoji: '🍫',
    bg: 'linear-gradient(135deg, #4A2812, #7B3F1A)',
    desc: "J'ai réalisé une analyse de l'offre sur le marché du chocolat afin d'identifier les principaux acteurs, les gammes de produits, les positionnements, les stratégies de différenciation et les tendances du secteur. Ce travail a permis de dresser un panorama complet et structuré du marché.",
    skills: ['Analyse de marché', 'Segmentation', 'Concurrence', 'Synthèse']
  },
  'modal-evian': {
    title: 'Analyse de marque – Evian & Losange de Kapferer',
    domain: 'Marketing',
    emoji: '💧',
    bg: 'linear-gradient(135deg, #1B5E8C, #2596BE)',
    desc: "J'ai utilisé le prisme d'identité de Kapferer pour analyser l'identité de la marque Evian selon six facettes : physique, personnalité, culture, relation, reflet et mentalisation. Cette analyse structurée permet de comprendre la cohérence de l'identité de marque et ses leviers de différenciation.",
    skills: ['Branding', 'Image de marque', 'Analyse stratégique', 'Kapferer']
  },
  'modal-pestel': {
    title: 'Analyse PESTEL – Marché du chocolat',
    domain: 'Marketing',
    emoji: '🌍',
    bg: 'linear-gradient(135deg, #1B4D3E, #2D7D60)',
    desc: "J'ai identifié et analysé les facteurs macro-environnementaux influençant le marché du chocolat : politique, économique, social, technologique, environnemental et légal. Cette analyse a notamment mis en lumière l'inflation du prix des matières premières et les enjeux politiques liés aux programmes de santé et de nutrition.",
    skills: ['PESTEL', 'Veille stratégique', 'Analyse environnementale', 'Synthèse']
  },
  'modal-devis': {
    title: 'Création de devis commercial',
    domain: 'Vente',
    emoji: '📋',
    bg: 'linear-gradient(135deg, #1B3D5C, #3D7AB0)',
    desc: "Dans le cadre de mises en situation de négociation commerciale, j'ai conçu un devis structuré et adaptable. Cet outil permet d'arriver en entretien avec une offre claire, chiffrée et modulable selon les besoins du prospect. Il facilite la discussion, renforce la crédibilité et accélère la prise de décision.",
    skills: ['Vente', 'Négociation', 'Chiffrage', "Outils d'aide à la vente"]
  },
  'modal-plaquette': {
    title: 'Plaquette commerciale recto-verso',
    domain: 'Vente / Communication',
    emoji: '📄',
    bg: 'linear-gradient(135deg, #C9A86C, #A88040)',
    desc: "J'ai conçu une plaquette commerciale recto-verso destinée à présenter les offres, services et tarifs de manière claire et attractive. Ce support polyvalent accompagne les prises de contact, les rendez-vous commerciaux et les envois de devis, en offrant une vision synthétique et professionnelle de l'offre.",
    skills: ['Canva', 'Communication commerciale', 'Design de support', "Clarté de l'offre"]
  },
  'modal-croc': {
    title: 'CROC & Traitement des objections',
    domain: 'Vente',
    emoji: '🗣',
    bg: 'linear-gradient(135deg, #3D2B5C, #6B4899)',
    desc: "J'ai créé un outil CROC (Contact, Raison, Objectif, Conclusion) afin de préparer efficacement les échanges téléphoniques et de structurer les réponses aux barrages et objections lors d'une prospection commerciale. Cet outil rassure l'interlocuteur et augmente le taux de transformation.",
    skills: ['Prospection', 'Argumentation', 'Relation client', 'Traitement des objections', 'Phoning']
  },
  'modal-cartes': {
    title: 'Cartes de visite',
    domain: 'Communication',
    emoji: '🪪',
    bg: 'linear-gradient(135deg, #1B3D5C, #C9A86C)',
    desc: "J'ai conçu des cartes de visite professionnelles en respectant l'identité visuelle d'une entreprise : logo, couleurs, typographie, hiérarchie de l'information et lisibilité. Le résultat final est un support de communication cohérent, professionnel et mémorable.",
    skills: ['Identité visuelle', 'Design graphique', 'Communication professionnelle', 'Canva']
  },
  'modal-packaging': {
    title: 'Packaging Sanex',
    domain: 'Communication',
    emoji: '🧴',
    bg: 'linear-gradient(135deg, #1B5E3B, #27AE60)',
    desc: "J'ai conçu un packaging pour un produit Sanex en respectant scrupuleusement l'identité de la marque : valeurs santé, simplicité et respect de la peau. Le design privilégie la clarté visuelle en rayon, une information produit lisible et une cohérence forte avec l'univers graphique existant.",
    skills: ['Packaging', 'Communication visuelle', 'Branding', 'Design produit']
  },
  'modal-affiche': {
    title: 'Affiche – Sortie Commerce International à Paris',
    domain: 'Communication',
    emoji: '🗺',
    bg: 'linear-gradient(135deg, #C0392B, #8B1A1A)',
    desc: "J'ai réalisé une affiche événementielle pour promouvoir une sortie Commerce International à Paris. L'objectif était de créer un support visuel clair, attractif et engageant, capable de transmettre une information essentielle tout en suscitant l'envie de participer.",
    skills: ['Affichage', 'Hiérarchie visuelle', 'Communication événementielle', 'Design']
  },
  'modal-parfum-site': {
    title: 'Site internet – Parfum solide',
    domain: 'Communication / Digital',
    emoji: '🌿',
    bg: 'linear-gradient(135deg, #4A2C5C, #C9A86C)',
    desc: "J'ai conçu sur Canva un site web one-page dédié à un parfum solide. L'univers visuel reposait sur une vidéo immersive, une musique douce et des tons beige, vert et brun pour évoquer un univers naturel, premium et sensoriel. Ce projet m'a permis de travailler le storytelling et la communication digitale.",
    skills: ['Webdesign', 'Storytelling', 'Identité visuelle', 'Communication digitale', 'Canva']
  },
  'modal-gantt': {
    title: 'Planning Gantt',
    domain: 'Transverse / Gestion de projet',
    emoji: '📅',
    bg: 'linear-gradient(135deg, #1B3D5C, #2A5580)',
    desc: "J'ai élaboré un planning Gantt dans le cadre d'une campagne destinée à récompenser des franchisés. Cet outil a permis de planifier les différentes étapes du projet, de coordonner les actions entre les parties prenantes et d'anticiper les ajustements nécessaires pour respecter les délais.",
    skills: ['Gestion de projet', 'Planification', 'Organisation', 'Coordination', 'Excel']
  },
  'modal-trek': {
    title: 'Engagement associatif – Trek Tours Endurance',
    domain: 'Transverse',
    emoji: '🏃',
    bg: 'linear-gradient(135deg, #1B4D3E, #1B3D5C)',
    desc: "Je suis membre actif de l'association Trek Tours Endurance, qui organise deux trails par an. Je participe à la logistique de l'événement, à la sécurisation du parcours, et j'assure des missions de commissaire de course, d'ouvreur ou de fermeur. Cet engagement m'a appris l'organisation rigoureuse, la gestion d'imprévus et le travail en équipe.",
    skills: ['Organisation', 'Gestion du stress', 'Réactivité', 'Travail en équipe', 'Engagement']
  },
  'modal-parfum': {
    title: 'Projet entrepreneurial – Parfum solide',
    domain: 'Entrepreneuriat / Marketing / Communication',
    emoji: '✨',
    bg: 'linear-gradient(135deg, #C9A86C, #1B3D5C)',
    desc: "En 2024, j'ai participé à un projet tutoré entrepreneurial autour de la co-création d'un concept de parfum solide innovant. Le projet comprenait une étude de marché approfondie, l'élaboration d'un business model, du prototypage produit et un pitch final présenté devant un jury. Ce projet m'a permis de mobiliser l'ensemble de mes compétences en marketing, communication et gestion de projet.",
    skills: ['Entrepreneuriat', 'Étude de marché', 'Business model', 'Prototypage', 'Pitch', 'Gestion de projet']
  }
};

/* ─── MODAL OPEN / CLOSE ─────────────────────────────────────── */
function openModal(id) {
  const data = modals[id];
  if (!data) return;
  document.getElementById('modalContent').innerHTML = `
    <div class="modal-visual" style="background:${data.bg}">
      <span style="font-size:4rem">${data.emoji}</span>
    </div>
    <span class="modal-tag">${data.domain}</span>
    <h2>${data.title}</h2>
    <p>${data.desc}</p>
    <div class="modal-skills">
      ${data.skills.map(s => `<span>${s}</span>`).join('')}
    </div>
  `;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ─── CONTACT FORM ───────────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name    = document.getElementById('name').value;
    const email   = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const mailto  = `mailto:antoine.pornin.fr@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Nom : ${name}\nEmail : ${email}\n\n${message}`)}`;
    window.location.href = mailto;
  });
}

/* ─── SMOOTH SCROLL FOR ANCHOR LINKS ────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ═══════════════════════════════════════════════════════════════
   ✦  PREMIUM — Scroll progress · Cursor · Counters · Marquee
   ═══════════════════════════════════════════════════════════════ */

/* ─── Scroll Progress Bar ─────────────────────────────────── */
(function () {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 0})`;
  }, { passive: true });
})();

/* ─── Custom Cursor ───────────────────────────────────────── */
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const dot  = Object.assign(document.createElement('div'), { className: 'cursor-dot'  });
  const ring = Object.assign(document.createElement('div'), { className: 'cursor-ring' });
  document.body.append(dot, ring);

  let mx = -200, my = -200, rx = -200, ry = -200;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function tick() {
    rx += (mx - rx) * .14;
    ry += (my - ry) * .14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  })();

  const interactive = 'a, button, [onclick], .btn-project, .filter-btn, .lang-switch-btn, .project-card, .exp-card, .certif-card, .projpro-card, .axe-card';
  document.querySelectorAll(interactive).forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('hovered'); ring.classList.add('hovered'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('hovered'); ring.classList.remove('hovered'); });
  });

  window.addEventListener('mousedown', () => dot.classList.add('clicked'));
  window.addEventListener('mouseup',   () => dot.classList.remove('clicked'));

  document.body.addEventListener('mouseleave', () => {
    dot.style.opacity = '0'; ring.style.opacity = '0';
  });
  document.body.addEventListener('mouseenter', () => {
    dot.style.opacity = '1'; ring.style.opacity = '1';
  });
})();

/* ─── Number Counters ─────────────────────────────────────── */
(function () {
  const counters = document.querySelectorAll('.stat-num[data-count]');
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      obs.unobserve(target);
      const end = +target.dataset.count;
      const dur = end > 100 ? 2000 : 1200;
      const t0  = performance.now();
      (function step(now) {
        const p    = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        target.textContent = Math.round(ease * end);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: .5 });
  counters.forEach(c => obs.observe(c));
})();

/* ─── Marquee Build ───────────────────────────────────────── */
(function () {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  const items = [
    'Commerce International', 'Business Development', 'Stage en Chine',
    'TOEIC 885', 'Marketing & Vente', '3 Langues', 'Social Commerce',
    'Développement Commercial', 'Analyse de Marché', 'Communication Digitale'
  ];
  const chunk = items.map(t =>
    `<span>${t}</span><span class="marquee-dot">✦</span>`
  ).join('');
  track.innerHTML = chunk + chunk; // doubled for seamless loop
})();
