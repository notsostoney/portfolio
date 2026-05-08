/* ============================================================
   ANTOINE PORNIN — GLOBE.JS
   Three.js interactive globe with location pins
   ============================================================ */

(function () {
  'use strict';

  /* ── LOCATION DATA ──────────────────────────────────────── */
  const LOCATIONS = [
    {
      id: 'jinhua',
      name: 'Jinhua, Chine',
      lat: 29.1,
      lon: 119.6,
      type: 'Stage international',
      tagline: 'Digital communication in China',
      color: '#4B9FFF',
      colorHex: 0x4B9FFF,
      desc: 'Stage de 16 semaines en communication digitale internationale — création de vidéos courtes, adaptation interculturelle des argumentaires commerciaux, analyse TikTok / social commerce pour les marchés export.',
      skills: ['Social commerce', 'Adaptation interculturelle', 'Création contenu', 'Anglais pro'],
    },
    {
      id: 'yiwu',
      name: 'Yiwu, Chine',
      lat: 29.3,
      lon: 121.2, // slightly offset from Jinhua for visibility
      type: 'Projet entrepreneurial',
      tagline: 'Sourcing & business bridge',
      color: '#2DD4BF',
      colorHex: 0x2DD4BF,
      desc: 'Projet d\'intermédiation commerciale entre la France et Yiwu, capitale mondiale du sourcing. Présélection de fournisseurs, qualification, comparaison d\'offres, réduction de l\'incertitude pour les entreprises françaises.',
      skills: ['Sourcing', 'Négociation', 'Commerce France-Chine', 'Veille marché'],
    },
    {
      id: 'issoudun',
      name: 'Issoudun, France',
      lat: 46.9,
      lon: 2.0,
      type: 'Formation',
      tagline: 'Commercial foundation',
      color: '#FBB040',
      colorHex: 0xFBB040,
      desc: 'BUT Techniques de Commercialisation, option Commerce International à l\'IUT de l\'Indre. Environnement économique marqué par Safran et Louis Vuitton à proximité. Bases solides en marketing, vente, négociation et gestion de projet.',
      skills: ['Marketing', 'Vente', 'Négociation', 'Gestion de projet'],
    },
    {
      id: 'stgeorgen',
      name: 'Sankt Georgen, Allemagne',
      lat: 48.1,
      lon: 8.3,
      type: 'Expérience internationale',
      tagline: 'Football abroad',
      color: '#A78BFA',
      colorHex: 0xA78BFA,
      desc: 'Expérience à l\'étranger au Gymnasium de Sankt Georgen dans le cadre du football. Changer de pays pour poursuivre une opportunité : adaptation, autonomie, discipline et intégration dans un nouvel environnement culturel.',
      skills: ['Adaptabilité', 'Autonomie', 'Allemand', 'Dépassement de soi'],
    },
  ];

  /* ── UTILS ──────────────────────────────────────────────── */
  function latLonToVec3(lat, lon, r) {
    const phi   = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  /* ── GLOBE CLASS ────────────────────────────────────────── */
  class Globe {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container || typeof THREE === 'undefined') return;

      this.isDragging   = false;
      this.prevMouse    = { x: 0, y: 0 };
      this.rotY         = 0.5;  // start slightly rotated so Europe is visible
      this.rotX         = 0.1;
      this.velX         = 0;
      this.velY         = 0;
      this.autoRotate   = true;
      this.autoTimer    = null;
      this.pinMeshes    = [];
      this.clock        = new THREE.Clock();

      this.init();
      this.buildScene();
      this.buildGlobe();
      this.buildPins();
      this.setupLights();
      this.bindEvents();
      this.animate();
    }

    /* Setup renderer / scene / camera */
    init() {
      const w = this.container.offsetWidth  || 500;
      const h = this.container.offsetHeight || 500;

      this.scene    = new THREE.Scene();
      this.camera   = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
      this.camera.position.z = 2.75;

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(w, h);
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.domElement.style.position = 'absolute';
      this.renderer.domElement.style.inset    = '0';
      this.renderer.domElement.style.width    = '100%';
      this.renderer.domElement.style.height   = '100%';
      this.container.appendChild(this.renderer.domElement);

      this.raycaster = new THREE.Raycaster();
      this.mouse     = new THREE.Vector2();
    }

    /* Main globe group */
    buildScene() {
      this.globeGroup = new THREE.Group();
      this.scene.add(this.globeGroup);
      this.globeGroup.rotation.y = this.rotY;
      this.globeGroup.rotation.x = this.rotX;
    }

    buildGlobe() {
      /* ── Solid sphere ── */
      const sGeo = new THREE.SphereGeometry(1, 72, 72);
      const sMat = new THREE.MeshPhongMaterial({
        color:     0x080E28,
        emissive:  0x040810,
        shininess: 18,
        transparent: true,
        opacity: 0.96,
      });
      this.globeGroup.add(new THREE.Mesh(sGeo, sMat));

      /* ── Lat/lon wireframe ── */
      const wGeo = new THREE.SphereGeometry(1.003, 24, 24);
      const wMat = new THREE.MeshBasicMaterial({
        color:       0x4B9FFF,
        wireframe:   true,
        transparent: true,
        opacity:     0.055,
      });
      this.globeGroup.add(new THREE.Mesh(wGeo, wMat));

      /* ── Atmosphere glow (backside shell) ── */
      const atmGeo = new THREE.SphereGeometry(1.12, 36, 36);
      const atmMat = new THREE.MeshBasicMaterial({
        color:       0x2A6FD6,
        transparent: true,
        opacity:     0.045,
        side:        THREE.BackSide,
      });
      this.globeGroup.add(new THREE.Mesh(atmGeo, atmMat));

      /* ── Outer glow ring ── */
      const rimGeo = new THREE.SphereGeometry(1.18, 24, 24);
      const rimMat = new THREE.MeshBasicMaterial({
        color:       0x1A4B8C,
        transparent: true,
        opacity:     0.018,
        side:        THREE.BackSide,
      });
      this.globeGroup.add(new THREE.Mesh(rimGeo, rimMat));
    }

    buildPins() {
      this.pinsGroup = new THREE.Group();
      this.globeGroup.add(this.pinsGroup);
      this.pulseRings = [];

      LOCATIONS.forEach((loc) => {
        const pos = latLonToVec3(loc.lat, loc.lon, 1.015);

        /* Dot */
        const dotGeo = new THREE.SphereGeometry(0.022, 16, 16);
        const dotMat = new THREE.MeshBasicMaterial({ color: loc.colorHex });
        const dot    = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(pos);
        dot.userData = loc;
        this.pinsGroup.add(dot);
        this.pinMeshes.push(dot);

        /* Glow halo (slightly larger, transparent) */
        const haloGeo = new THREE.SphereGeometry(0.038, 16, 16);
        const haloMat = new THREE.MeshBasicMaterial({
          color: loc.colorHex, transparent: true, opacity: 0.18,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.copy(pos);
        this.pinsGroup.add(halo);

        /* Pulse ring (flat torus oriented outward) */
        const ringGeo = new THREE.TorusGeometry(0.045, 0.003, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: loc.colorHex, transparent: true, opacity: 0.55,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);

        // orient ring to face outward (normal = surface normal = position.normalize)
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        ring.rotateX(Math.PI / 2);

        ring.userData.basePos = pos.clone();
        ring.userData.phase   = Math.random() * Math.PI * 2;
        this.pinsGroup.add(ring);
        this.pulseRings.push(ring);
      });
    }

    setupLights() {
      const ambient = new THREE.AmbientLight(0xffffff, 0.25);
      this.scene.add(ambient);

      const key = new THREE.DirectionalLight(0x6AB8FF, 1.6);
      key.position.set(3, 2, 2);
      this.scene.add(key);

      const fill = new THREE.DirectionalLight(0x2DD4BF, 0.5);
      fill.position.set(-3, -1, -2);
      this.scene.add(fill);

      const rim = new THREE.DirectionalLight(0xffffff, 0.3);
      rim.position.set(0, 3, -3);
      this.scene.add(rim);
    }

    /* ── INTERACTION ─────────────────────────────────────── */
    bindEvents() {
      const canvas = this.renderer.domElement;

      /* Mouse down */
      canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.autoRotate = false;
        clearTimeout(this.autoTimer);
        this.prevMouse  = { x: e.clientX, y: e.clientY };
        this.dragStart  = { x: e.clientX, y: e.clientY };
      });

      /* Mouse move */
      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        this.velY = (e.clientX - this.prevMouse.x) * 0.006;
        this.velX = (e.clientY - this.prevMouse.y) * 0.004;
        this.rotY += this.velY;
        this.rotX  = Math.max(-0.55, Math.min(0.55, this.rotX + this.velX));
        this.globeGroup.rotation.y = this.rotY;
        this.globeGroup.rotation.x = this.rotX;
        this.prevMouse = { x: e.clientX, y: e.clientY };
      });

      /* Mouse up — detect click vs drag */
      window.addEventListener('mouseup', (e) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        const dx = Math.abs(e.clientX - (this.dragStart?.x || e.clientX));
        const dy = Math.abs(e.clientY - (this.dragStart?.y || e.clientY));
        if (dx < 4 && dy < 4) this._handleClick(e);
        this.autoTimer = setTimeout(() => { this.autoRotate = true; }, 3500);
      });

      /* Touch */
      canvas.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        this.isDragging = true;
        this.autoRotate = false;
        clearTimeout(this.autoTimer);
        this.prevMouse  = { x: t.clientX, y: t.clientY };
        this.dragStart  = { x: t.clientX, y: t.clientY };
      }, { passive: true });

      canvas.addEventListener('touchmove', (e) => {
        if (!this.isDragging) return;
        e.preventDefault();
        const t = e.touches[0];
        this.velY = (t.clientX - this.prevMouse.x) * 0.006;
        this.velX = (t.clientY - this.prevMouse.y) * 0.004;
        this.rotY += this.velY;
        this.rotX  = Math.max(-0.55, Math.min(0.55, this.rotX + this.velX));
        this.globeGroup.rotation.y = this.rotY;
        this.globeGroup.rotation.x = this.rotX;
        this.prevMouse = { x: t.clientX, y: t.clientY };
      }, { passive: false });

      canvas.addEventListener('touchend', (e) => {
        this.isDragging = false;
        const t = e.changedTouches[0];
        const dx = Math.abs(t.clientX - (this.dragStart?.x || t.clientX));
        const dy = Math.abs(t.clientY - (this.dragStart?.y || t.clientY));
        if (dx < 10 && dy < 10) this._handleClickTouch(t);
        this.autoTimer = setTimeout(() => { this.autoRotate = true; }, 3500);
      });

      /* Hover cursor effect on pins */
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        this.mouse.x =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top)   / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.raycaster.intersectObjects(this.pinMeshes);
        canvas.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
      });

      /* Resize */
      window.addEventListener('resize', () => this._resize());
    }

    _handleClick(e) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      this._castAndShow();
    }

    _handleClickTouch(t) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x =  ((t.clientX - rect.left) / rect.width)  * 2 - 1;
      this.mouse.y = -((t.clientY - rect.top)  / rect.height) * 2 + 1;
      this._castAndShow();
    }

    _castAndShow() {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObjects(this.pinMeshes);
      if (hits.length > 0) {
        this._showCard(hits[0].object.userData);
      }
    }

    /* ── LOCATION CARD ───────────────────────────────────── */
    _showCard(loc) {
      // Scroll to the matching world card and highlight it
      const card = document.querySelector(`.loc-card[data-loc="${loc.id}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('loc-card--active');
        setTimeout(() => card.classList.remove('loc-card--active'), 2500);
      }

      // Also show a floating tooltip near the globe
      this._showTooltip(loc);
    }

    _showTooltip(loc) {
      let tip = document.getElementById('globe-tooltip');
      if (!tip) {
        tip = document.createElement('div');
        tip.id = 'globe-tooltip';
        tip.className = 'globe-tooltip';
        document.body.appendChild(tip);
      }

      tip.innerHTML = `
        <span class="tip-type" style="color:${loc.color}">${loc.type}</span>
        <strong class="tip-name">${loc.name}</strong>
        <em class="tip-tagline">${loc.tagline}</em>
        <div class="tip-skills">
          ${loc.skills.map(s => `<span>${s}</span>`).join('')}
        </div>
      `;

      // Position near the globe container
      const rect  = this.container.getBoundingClientRect();
      const tipX  = rect.left + rect.width * 0.5;
      const tipY  = rect.top  + rect.height * 0.72;

      tip.style.cssText = `
        position: fixed;
        left: ${tipX}px;
        top: ${tipY}px;
        transform: translate(-50%, 0);
        z-index: 999;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
      `;

      requestAnimationFrame(() => { tip.style.opacity = '1'; });

      clearTimeout(this._tipTimer);
      this._tipTimer = setTimeout(() => {
        tip.style.opacity = '0';
        setTimeout(() => { if (tip.parentNode) tip.parentNode.removeChild(tip); }, 350);
      }, 3200);
    }

    /* ── ANIMATE ─────────────────────────────────────────── */
    animate() {
      requestAnimationFrame(() => this.animate());

      const t = this.clock.getElapsedTime();

      /* Auto-rotate */
      if (this.autoRotate && !this.isDragging) {
        this.rotY += 0.0018;
        this.globeGroup.rotation.y = this.rotY;
      } else if (!this.isDragging) {
        /* Momentum decay */
        this.velX *= 0.92;
        this.velY *= 0.92;
        this.rotX  = Math.max(-0.55, Math.min(0.55, this.rotX + this.velX));
        this.rotY += this.velY;
        this.globeGroup.rotation.y = this.rotY;
        this.globeGroup.rotation.x = this.rotX;
      }

      /* Pulse rings */
      this.pulseRings.forEach((ring, i) => {
        const phase = ring.userData.phase;
        const s     = 1 + 0.45 * Math.sin(t * 1.8 + phase);
        ring.scale.setScalar(s);
        ring.material.opacity = 0.22 + 0.28 * Math.sin(t * 1.8 + phase);
      });

      this.renderer.render(this.scene, this.camera);
    }

    /* ── RESIZE ──────────────────────────────────────────── */
    _resize() {
      const w = this.container.offsetWidth;
      const h = this.container.offsetHeight;
      if (!w || !h) return;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }
  }

  /* ── INIT ───────────────────────────────────────────────── */
  function initGlobe() {
    if (typeof THREE === 'undefined') {
      console.warn('Globe: Three.js not loaded');
      return;
    }
    if (!document.getElementById('hero-globe-wrap')) return;

    window._globe = new Globe('hero-globe-wrap');
  }

  /* Boot after DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobe);
  } else {
    initGlobe();
  }

  /* Inject tooltip CSS */
  const tooltipStyle = document.createElement('style');
  tooltipStyle.textContent = `
    .globe-tooltip {
      background: rgba(9,13,38,0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 14px 18px;
      min-width: 220px;
      max-width: 280px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    }
    .tip-type {
      display: block;
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .tip-name {
      display: block;
      font-family: 'Syne', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      color: rgba(230,238,255,0.95);
      margin-bottom: 2px;
    }
    .tip-tagline {
      display: block;
      font-size: 0.78rem;
      color: rgba(180,200,240,0.55);
      font-style: italic;
      margin-bottom: 10px;
    }
    .tip-skills {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .tip-skills span {
      font-size: 0.68rem;
      color: rgba(180,200,240,0.65);
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.09);
      padding: 3px 9px;
      border-radius: 99px;
    }
    .loc-card--active {
      border-color: rgba(75,159,255,0.5) !important;
      box-shadow: 0 0 0 1px rgba(75,159,255,0.2), 0 12px 40px rgba(0,0,0,0.4) !important;
      transform: translateY(-4px) !important;
    }
  `;
  document.head.appendChild(tooltipStyle);

})();
