/* ============================================================
   ANTOINE PORNIN — GLOBE.JS v2
   Real Earth texture · Pin labels · Expand modal · Shift + panel
   ============================================================ */

(function () {
  'use strict';

  /* ── LOCATION DATA ──────────────────────────────────────── */
  const LOCATIONS = [
    {
      id: 'jinhua',
      name: 'Jinhua',
      fullName: 'Jinhua, Chine',
      lat: 29.1, lon: 119.6,
      type: 'Stage international',
      typeColor: '#7DD4FC',
      tagline: 'Développement commercial à l\'export',
      color: '#7DD4FC',
      colorHex: 0x7DD4FC,
      flag: '🇨🇳',
      desc: 'Stage de 4 mois chez Golden Sun Health Technology Group. Ma mission : développer les ventes à l\'international d\'une entreprise dont l\'activité est jusqu\'ici essentiellement locale. Adaptation interculturelle des argumentaires commerciaux, analyse de marchés étrangers, création de contenus commerciaux pour les marchés export.',
      skills: ['Développement commercial', 'Adaptation interculturelle', 'Analyse marché export', 'Création de contenu', 'Anglais professionnel'],
    },
    {
      id: 'yiwu',
      name: 'Yiwu',
      fullName: 'Yiwu, Chine',
      lat: 29.35, lon: 121.5,
      type: 'Intermédiation commerciale',
      typeColor: '#6EE7B7',
      tagline: 'Pont entre la France et le sourcing chinois',
      color: '#6EE7B7',
      colorHex: 0x6EE7B7,
      flag: '🇨🇳',
      desc: 'Intermédiaire commercial entre la France et Yiwu, la capitale mondiale du sourcing. J\'identifie et qualifie des fournisseurs pour des entreprises françaises : présélection, comparaison d\'offres, réduction de l\'incertitude avant d\'engager un partenariat avec un fournisseur chinois.',
      skills: ['Sourcing', 'Qualification fournisseurs', 'Commerce France–Chine', 'Veille marché', 'Négociation'],
    },
    {
      id: 'issoudun',
      name: 'Issoudun',
      fullName: 'Issoudun, France',
      lat: 46.95, lon: 2.0,
      type: 'Formation',
      typeColor: '#FCD34D',
      tagline: 'Socle commercial & académique',
      color: '#FCD34D',
      colorHex: 0xFCD34D,
      flag: '🇫🇷',
      desc: 'BUT Techniques de Commercialisation, option Commerce International à l\'IUT de l\'Indre. Environnement économique fort, avec la présence de Safran et Louis Vuitton à proximité. Bases solides en marketing, vente, négociation, analyse de marché et gestion de projet.',
      skills: ['Marketing', 'Vente', 'Négociation', 'Analyse commerciale', 'Gestion de projet'],
    },
    {
      id: 'stgeorgen',
      name: 'Sankt Georgen',
      fullName: 'Sankt Georgen, Allemagne',
      lat: 48.13, lon: 8.34,
      type: 'Expérience internationale',
      typeColor: '#C4B5FD',
      tagline: 'Changer de pays pour grandir',
      color: '#C4B5FD',
      colorHex: 0xC4B5FD,
      flag: '🇩🇪',
      desc: 'Expérience à l\'étranger au Gymnasium de Sankt Georgen dans le cadre du football. Changer de pays pour poursuivre une opportunité : adaptation rapide, autonomie, discipline et intégration dans un environnement culturel différent. Une étape qui a forgé ma capacité d\'adaptation et mon ouverture internationale.',
      skills: ['Adaptabilité', 'Autonomie', 'Allemand B1/B2', 'Discipline sportive', 'Ouverture interculturelle'],
    },
  ];

  /* ── UTILS ──────────────────────────────────────────────── */
  function latLonToVec3(lat, lon, r) {
    const phi   = (90 - lat)  * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  /* ── GLOBE CLASS ────────────────────────────────────────── */
  class EarthGlobe {
    constructor() {
      this.container  = document.getElementById('globe-three-container');
      this.labelsWrap = document.getElementById('pin-labels');
      if (!this.container || typeof THREE === 'undefined') return;

      this.isDragging  = false;
      this.prevMouse   = { x: 0, y: 0 };
      this.dragStart   = { x: 0, y: 0 };
      this.rotY        = -0.4; // initial rotation so Europe is visible
      this.rotX        =  0.12;
      this.velX        = 0;
      this.velY        = 0;
      this.autoRotate  = true;
      this.autoTimer   = null;
      this.pinMeshes   = [];
      this.pinLabels   = [];
      this.pulseRings  = [];
      this.clock       = new THREE.Clock();
      this.activePin   = null;

      this.init();
      this.buildScene();
      this.buildEarth();
      this.buildPins();
      this.buildLabels();
      this.setupLights();
      this.bindEvents();
      this.animate();
    }

    /* ── SETUP ─────────────────────────────────────────────── */
    init() {
      const w = this.container.offsetWidth  || 500;
      const h = this.container.offsetHeight || 500;

      this.scene    = new THREE.Scene();
      this.camera   = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      this.camera.position.z = 2.8;

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(w, h);
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      this.container.appendChild(this.renderer.domElement);

      this.raycaster = new THREE.Raycaster();
      this.mouse     = new THREE.Vector2();
    }

    buildScene() {
      this.globeGroup = new THREE.Group();
      this.scene.add(this.globeGroup);
      this.globeGroup.rotation.y = this.rotY;
      this.globeGroup.rotation.x = this.rotX;
    }

    buildEarth() {
      /* Main sphere — grey monochrome, minimalist, NO specular hotspot */
      const sGeo = new THREE.SphereGeometry(1, 72, 72);
      const sMat = new THREE.MeshPhongMaterial({
        color:     new THREE.Color(0x5a6070),  // medium-dark grey
        shininess: 2,                           // nearly matte
        specular:  new THREE.Color(0x0a0a0f),  // almost black — no bright highlight
      });
      const sphere = new THREE.Mesh(sGeo, sMat);
      this.globeGroup.add(sphere);
      this.earthMesh = sphere;

      /* Latitude / longitude grid — visible lines on dark sphere */
      const gridGeo = new THREE.SphereGeometry(1.003, 24, 12);
      const gridMat = new THREE.MeshBasicMaterial({
        color:       0xffffff,
        wireframe:   true,
        transparent: true,
        opacity:     0.10,
      });
      this.globeGroup.add(new THREE.Mesh(gridGeo, gridMat));

      /* Soft dark rim to give depth illusion */
      const rimGeo = new THREE.SphereGeometry(1.12, 32, 32);
      const rimMat = new THREE.MeshBasicMaterial({
        color:       0x000010,
        transparent: true,
        opacity:     0.45,
        side:        THREE.BackSide,
      });
      this.globeGroup.add(new THREE.Mesh(rimGeo, rimMat));
    }

    buildPins() {
      this.pinsGroup = new THREE.Group();
      this.globeGroup.add(this.pinsGroup);

      LOCATIONS.forEach((loc, i) => {
        const pos = latLonToVec3(loc.lat, loc.lon, 1.015);

        /* Pin sphere */
        const dotGeo = new THREE.SphereGeometry(0.028, 16, 16);
        const dotMat = new THREE.MeshBasicMaterial({ color: loc.colorHex });
        const dot    = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(pos);
        dot.userData = { ...loc, index: i };
        this.pinsGroup.add(dot);
        this.pinMeshes.push(dot);

        /* Glow halo */
        const haloGeo = new THREE.SphereGeometry(0.055, 16, 16);
        const haloMat = new THREE.MeshBasicMaterial({ color: loc.colorHex, transparent: true, opacity: 0.28 });
        const halo    = new THREE.Mesh(haloGeo, haloMat);
        halo.position.copy(pos);
        this.pinsGroup.add(halo);

        /* Pulse ring (torus) */
        const ringGeo = new THREE.TorusGeometry(0.055, 0.003, 8, 36);
        const ringMat = new THREE.MeshBasicMaterial({ color: loc.colorHex, transparent: true, opacity: 0.55 });
        const ring    = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        // Orient ring to face outward
        ring.lookAt(new THREE.Vector3(0,0,0));
        ring.rotateX(Math.PI / 2);
        ring.userData.phase = i * (Math.PI / 2);
        this.pinsGroup.add(ring);
        this.pulseRings.push(ring);
      });
    }

    buildLabels() {
      if (!this.labelsWrap) return;
      this.labelsWrap.innerHTML = '';

      LOCATIONS.forEach((loc, i) => {
        const label = document.createElement('div');
        label.className = 'pin-label';
        label.dataset.index = i;
        label.innerHTML = `
          <div class="pin-label-dot" style="background:${loc.color};color:${loc.color}"></div>
          <span class="pin-label-text">${loc.name}</span>
        `;
        label.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openPanel(loc);
        });
        this.labelsWrap.appendChild(label);
        this.pinLabels.push(label);
      });
    }

    setupLights() {
      /* Soft ambient — prevents pitch-black shadow side */
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.38));

      /* Main light — gentle from top-left, low intensity so no blown-out hotspot */
      const sun = new THREE.DirectionalLight(0xdde0ee, 0.65);
      sun.position.set(-3, 4, 5);
      this.scene.add(sun);

      /* Subtle back fill to keep night side visible */
      const back = new THREE.DirectionalLight(0x8899bb, 0.18);
      back.position.set(3, -3, -4);
      this.scene.add(back);
    }

    /* ── EVENTS ─────────────────────────────────────────────── */
    bindEvents() {
      const canvas = this.renderer.domElement;

      /* Mouse drag */
      canvas.addEventListener('mousedown', (e) => {
        this.isDragging  = true;
        this.autoRotate  = false;
        clearTimeout(this.autoTimer);
        this.prevMouse  = { x: e.clientX, y: e.clientY };
        this.dragStart  = { x: e.clientX, y: e.clientY };
      });

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

      window.addEventListener('mouseup', (e) => {
        if (!this.isDragging) return;
        this.isDragging = false;
        const dx = Math.abs(e.clientX - this.dragStart.x);
        const dy = Math.abs(e.clientY - this.dragStart.y);
        if (dx < 4 && dy < 4) this._castAndOpen(e);
        this.autoTimer = setTimeout(() => { this.autoRotate = true; }, 4000);
      });

      /* Touch drag */
      canvas.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        this.isDragging  = true;
        this.autoRotate  = false;
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
        const dx = Math.abs(t.clientX - this.dragStart.x);
        const dy = Math.abs(t.clientY - this.dragStart.y);
        if (dx < 10 && dy < 10) this._castAndOpenTouch(t);
        this.autoTimer = setTimeout(() => { this.autoRotate = true; }, 4000);
      });

      /* Cursor style */
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        this.mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.raycaster.intersectObjects(this.pinMeshes);
        canvas.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
      });

      window.addEventListener('resize', () => this._resize());
    }

    _castAndOpen(e) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObjects(this.pinMeshes);
      if (hits.length > 0) this.openPanel(hits[0].object.userData);
    }

    _castAndOpenTouch(t) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x =  ((t.clientX - rect.left) / rect.width)  * 2 - 1;
      this.mouse.y = -((t.clientY - rect.top)  / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObjects(this.pinMeshes);
      if (hits.length > 0) this.openPanel(hits[0].object.userData);
    }

    /* ── PANEL ──────────────────────────────────────────────── */
    openPanel(loc) {
      this.activePin = loc;
      const stage    = document.getElementById('globe-stage');
      const panel    = document.getElementById('loc-panel');
      const content  = document.getElementById('loc-panel-content');
      if (!stage || !panel || !content) return;

      content.innerHTML = `
        <span class="loc-type-badge" style="background:${loc.color}22;color:${loc.color};border:1px solid ${loc.color}44">
          ${loc.flag} ${loc.type}
        </span>
        <h3 class="loc-panel-title">${loc.fullName}</h3>
        <p class="loc-panel-tagline">${loc.tagline}</p>
        <p class="loc-panel-desc">${loc.desc}</p>
        <div class="loc-panel-skills">
          ${loc.skills.map(s => `<span>${s}</span>`).join('')}
        </div>
      `;

      stage.classList.add('panel-open');
      panel.setAttribute('aria-hidden', 'false');

      // Slowly rotate globe to face the selected pin
      this._rotateToPinSmooth(loc);
    }

    closePanel() {
      const stage = document.getElementById('globe-stage');
      const panel = document.getElementById('loc-panel');
      if (stage) stage.classList.remove('panel-open');
      if (panel) panel.setAttribute('aria-hidden', 'true');
      this.activePin = null;
    }

    _rotateToPinSmooth(loc) {
      // Calculate target rotation so pin faces camera
      const targetRotY = -(loc.lon + 180) * (Math.PI / 180) + Math.PI;
      const targetRotX = -loc.lat * (Math.PI / 180) * 0.6;

      const startY  = this.rotY;
      const startX  = this.rotX;
      const startT  = performance.now();
      const dur     = 900;
      const ease    = (t) => 1 - Math.pow(1 - t, 3);

      const animate = (now) => {
        const p = Math.min((now - startT) / dur, 1);
        const e = ease(p);
        this.rotY = startY + (targetRotY - startY) * e;
        this.rotX = startX + (targetRotX - startX) * e;
        this.globeGroup.rotation.y = this.rotY;
        this.globeGroup.rotation.x = this.rotX;
        if (p < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }

    /* ── PIN LABEL PROJECTION ───────────────────────────────── */
    _updateLabels() {
      if (!this.labelsWrap || !this.pinMeshes.length) return;

      const cw = this.container.offsetWidth;
      const ch = this.container.offsetHeight;

      LOCATIONS.forEach((loc, i) => {
        const mesh    = this.pinMeshes[i];
        const label   = this.pinLabels[i];
        if (!mesh || !label) return;

        // World position of pin
        const worldPos = mesh.position.clone().applyMatrix4(this.globeGroup.matrixWorld);

        // Check if facing camera (dot product with camera direction)
        const toCam    = this.camera.position.clone().sub(worldPos).normalize();
        const normal   = worldPos.clone().normalize();
        const facing   = normal.dot(toCam) > 0.18; // 0.18 = slight buffer so labels don't appear on edge

        // Project to screen
        const projected = worldPos.clone().project(this.camera);
        const x = (projected.x * 0.5 + 0.5) * cw;
        const y = (1 - (projected.y * 0.5 + 0.5)) * ch;

        label.style.left    = x + 'px';
        label.style.top     = (y + 16) + 'px'; // offset below pin
        label.style.opacity = facing ? '1' : '0';
        label.style.pointerEvents = facing ? 'auto' : 'none';
        label.style.zIndex  = facing ? '10' : '-1';
      });
    }

    /* ── ANIMATE ─────────────────────────────────────────────── */
    animate() {
      requestAnimationFrame(() => this.animate());

      const t = this.clock.getElapsedTime();

      if (this.autoRotate && !this.isDragging) {
        this.rotY += 0.0016;
        this.globeGroup.rotation.y = this.rotY;
      } else if (!this.isDragging) {
        this.velX *= 0.91;
        this.velY *= 0.91;
        this.rotX  = Math.max(-0.55, Math.min(0.55, this.rotX + this.velX));
        this.rotY += this.velY;
        this.globeGroup.rotation.y = this.rotY;
        this.globeGroup.rotation.x = this.rotX;
      }

      // Pulse rings
      this.pulseRings.forEach((ring) => {
        const ph = ring.userData.phase;
        const s  = 1 + 0.5 * Math.sin(t * 1.6 + ph);
        ring.scale.setScalar(s);
        ring.material.opacity = 0.2 + 0.3 * Math.sin(t * 1.6 + ph);
      });

      this._updateLabels();
      this.renderer.render(this.scene, this.camera);
    }

    _resize() {
      const w = this.container.offsetWidth;
      const h = this.container.offsetHeight;
      if (!w || !h) return;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }
  }

  /* ── MODAL CONTROLLER ───────────────────────────────────── */
  let globeInstance = null;

  function openGlobeModal() {
    const modal = document.getElementById('globe-modal');
    if (!modal) return;

    modal.removeAttribute('aria-hidden');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Lazy-init globe on first open
    if (!globeInstance) {
      // Small delay so the container has its final size
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          globeInstance = new EarthGlobe();
          window._globe = globeInstance;
        });
      });
    } else {
      globeInstance._resize();
    }
  }

  function closeGlobeModal() {
    const modal = document.getElementById('globe-modal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (globeInstance) globeInstance.closePanel();
  }

  /* ── BIND OPEN / CLOSE TRIGGERS ────────────────────────── */
  function bindModalTriggers() {
    // All open triggers
    const openIds = ['globe-open-card', 'globe-open-hero', 'globe-open-nav', 'globe-open-mob'];
    openIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', openGlobeModal);
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openGlobeModal(); });
      }
    });

    // Close button
    const closeBtn = document.getElementById('globe-close');
    if (closeBtn) closeBtn.addEventListener('click', closeGlobeModal);

    // Close info panel
    const panelClose = document.getElementById('loc-panel-close');
    if (panelClose) panelClose.addEventListener('click', () => {
      if (globeInstance) globeInstance.closePanel();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (globeInstance && globeInstance.activePin) {
          globeInstance.closePanel();
        } else {
          closeGlobeModal();
        }
      }
    });

    // Click outside globe/panel to close panel
    const stage = document.getElementById('globe-stage');
    if (stage) {
      stage.addEventListener('click', (e) => {
        const wrap  = document.getElementById('globe-three-wrap');
        const panel = document.getElementById('loc-panel');
        if (wrap && !wrap.contains(e.target) && panel && !panel.contains(e.target)) {
          if (globeInstance) globeInstance.closePanel();
        }
      });
    }
  }

  /* ── BOOT ───────────────────────────────────────────────── */
  function boot() {
    if (typeof THREE === 'undefined') {
      console.warn('Globe: Three.js not loaded');
      return;
    }
    bindModalTriggers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
