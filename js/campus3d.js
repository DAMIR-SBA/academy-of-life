'use strict';
/* ===== 3D-кампус на Three.js ===== */
const Campus = {
  emojiTex(emoji, size = 128) {
    const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
    x.font = `${size * .78}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(emoji, size / 2, size / 2 + size * .05);
    const t = new THREE.CanvasTexture(c); return t;
  },
  create(container, opts = {}) {
    if (!window.THREE) return null;
    let W = container.clientWidth || 600, H = container.clientHeight || 400;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(W, H); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    const dark = App.isDark();
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(dark ? 0x0a0d18 : 0xdfe9f5, 75, 160);
    const camera = new THREE.PerspectiveCamera(45, W / H, .1, 200);
    let theta = .6, phi = .92, dist = opts.interactive ? 50 : 46;
    const target = new THREE.Vector3(0, 1, 0);
    const placeCam = () => { camera.position.set(target.x + dist * Math.sin(phi) * Math.sin(theta), target.y + dist * Math.cos(phi), target.z + dist * Math.sin(phi) * Math.cos(theta)); camera.lookAt(target); };

    scene.add(new THREE.HemisphereLight(dark ? 0x8899ff : 0xffffff, dark ? 0x101820 : 0x88aa77, dark ? .55 : .75));
    const sun = new THREE.DirectionalLight(dark ? 0xaab4ff : 0xfff1d6, dark ? .7 : 1.0);
    sun.position.set(18, 30, 12); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 80 }); scene.add(sun);

    // земля
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(30, 31, 1.2, 64), new THREE.MeshStandardMaterial({ color: dark ? 0x1f3b2c : 0x9bd17f, roughness: 1 }));
    ground.position.y = -.6; ground.receiveShadow = true; scene.add(ground);
    const ring = new THREE.Mesh(new THREE.RingGeometry(14, 17, 64), new THREE.MeshStandardMaterial({ color: dark ? 0x3a4256 : 0xe9e1cf, roughness: 1 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = .02; ring.receiveShadow = true; scene.add(ring);
    const plaza = new THREE.Mesh(new THREE.CircleGeometry(6.5, 48), new THREE.MeshStandardMaterial({ color: dark ? 0x3a4256 : 0xe9e1cf }));
    plaza.rotation.x = -Math.PI / 2; plaza.position.y = .03; scene.add(plaza);
    // вода вокруг
    const water = new THREE.Mesh(new THREE.CircleGeometry(90, 64), new THREE.MeshStandardMaterial({ color: dark ? 0x0d1b33 : 0x8ec9f0, roughness: .3, metalness: .1 }));
    water.rotation.x = -Math.PI / 2; water.position.y = -1.1; scene.add(water);

    const pickables = [], labels = [], anim = [];
    const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: .6 });
    // центральная башня — Экзамен
    const tower = new THREE.Group();
    const tb = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 7, 8), mat(dark ? 0x4c3fb0 : 0x6d5efc)); tb.position.y = 3.5; tb.castShadow = true; tower.add(tb);
    const tr = new THREE.Mesh(new THREE.ConeGeometry(3, 3.5, 8), mat(0xf5c542)); tr.position.y = 8.75; tr.castShadow = true; tower.add(tr);
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(.8, 1), new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: .8 })); orb.position.y = 11.6; tower.add(orb);
    anim.push(t => { orb.rotation.y = t; orb.position.y = 11.6 + Math.sin(t * 2) * .3; });
    tower.userData.id = 'exam'; tb.userData.id = 'exam'; tr.userData.id = 'exam'; pickables.push(tb, tr); scene.add(tower);
    if (opts.labels) labels.push({ obj: orb, id: 'exam', html: `🏛️ Экзамен${completedCount() === 12 ? '' : ' 🔒'}` });

    // 12 зданий
    const N = FACULTIES.length, R = 21;
    FACULTIES.forEach((f, i) => {
      const a = i / N * Math.PI * 2, g = new THREE.Group();
      g.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); g.rotation.y = a + Math.PI;
      const col = new THREE.Color(f.color); const st = Store.fac(f.id);
      const hgt = 3 + (i % 3) * .9;
      const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, hgt, 3.6), mat(col)); body.position.y = hgt / 2; body.castShadow = true; body.receiveShadow = true; g.add(body);
      const base = new THREE.Mesh(new THREE.BoxGeometry(5, .4, 4.4), mat(dark ? 0x2d3448 : 0xf1f5f9)); base.position.y = .2; base.receiveShadow = true; g.add(base);
      let roof;
      if (i % 3 === 0) { roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 2.2, 4), mat(col.clone().multiplyScalar(.7))); roof.rotation.y = Math.PI / 4; roof.position.y = hgt + 1.1; }
      else if (i % 3 === 1) { roof = new THREE.Mesh(new THREE.SphereGeometry(1.8, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(col.clone().multiplyScalar(.7))); roof.position.y = hgt; }
      else { roof = new THREE.Mesh(new THREE.BoxGeometry(4.6, .5, 4), mat(col.clone().multiplyScalar(.65))); roof.position.y = hgt + .25; }
      roof.castShadow = true; g.add(roof);
      // окна
      const winMat = new THREE.MeshStandardMaterial({ color: 0xfff7cc, emissive: 0xffe28a, emissiveIntensity: dark ? .9 : .25 });
      for (let r = 0; r < Math.floor(hgt / 1.2); r++) for (let c = -1; c <= 1; c++) {
        if (r === 0 && c === 0) continue;
        const w = new THREE.Mesh(new THREE.BoxGeometry(.7, .6, .05), winMat); w.position.set(c * 1.3, .9 + r * 1.15, 1.82); g.add(w);
      }
      const door = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, .08), mat(0x3b2a1a)); door.position.set(0, .95, 1.82); g.add(door);
      // эмблема-иконка
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: Campus.emojiTex(f.icon), transparent: true })); sp.scale.set(2.2, 2.2, 1); sp.position.y = hgt + 3.2; g.add(sp);
      anim.push(t => { sp.position.y = hgt + 3.2 + Math.sin(t * 2 + i) * .25; });
      // звёзды-кристаллы
      for (let s = 0; s < st.stars; s++) { const star = new THREE.Mesh(new THREE.OctahedronGeometry(.28), new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: .7 })); star.position.set((s - 1) * .8, hgt + 1.9 + (i % 3 === 0 ? .9 : 0), 0); g.add(star); anim.push(t => { star.rotation.y = t * 2 + s; }); }
      if (st.done) { const flag = new THREE.Mesh(new THREE.BoxGeometry(.9, .55, .04), mat(0x22c55e)); flag.position.set(2.1, hgt + 1.3, 1.2); g.add(flag); const pole = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 1.6), mat(0xdddddd)); pole.position.set(1.65, hgt + .8, 1.2); g.add(pole); }
      [body, roof, door, base].forEach(m => { m.userData.id = f.id; pickables.push(m); });
      g.userData = { id: f.id, body };
      scene.add(g);
      if (opts.labels) labels.push({ obj: sp, id: f.id, html: `${f.icon} ${f.name}<br><span class="st">${'★'.repeat(st.stars)}${'☆'.repeat(3 - st.stars)}</span>` });
    });
    // деревья
    const trunkM = mat(0x7c4a24), leafM = mat(dark ? 0x166534 : 0x22c55e), leafM2 = mat(dark ? 0x14532d : 0x16a34a);
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2; const r = i < 30 ? 25 + Math.random() * 4 : 8 + Math.random() * 4.5;
      if (i >= 30 && (a % (Math.PI * 2 / 12)) < .2) continue;
      const t = new THREE.Group(); t.position.set(Math.sin(a) * r, 0, Math.cos(a) * r);
      const s = .7 + Math.random() * .6;
      const tr2 = new THREE.Mesh(new THREE.CylinderGeometry(.15 * s, .2 * s, 1 * s), trunkM); tr2.position.y = .5 * s; tr2.castShadow = true; t.add(tr2);
      const lf = new THREE.Mesh(new THREE.ConeGeometry(.9 * s, 2 * s, 8), i % 2 ? leafM : leafM2); lf.position.y = 1.9 * s; lf.castShadow = true; t.add(lf);
      scene.add(t);
    }
    // фонари на площади
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + .2; const l = new THREE.Mesh(new THREE.SphereGeometry(.25, 12, 8), new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd36b, emissiveIntensity: dark ? 1.2 : .3 })); l.position.set(Math.sin(a) * 6.2, 2, Math.cos(a) * 6.2); scene.add(l); const p = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 2), mat(0x475569)); p.position.set(Math.sin(a) * 6.2, 1, Math.cos(a) * 6.2); scene.add(p); }
    // облака
    const cloudM = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: dark ? .15 : .85 });
    const clouds = [];
    for (let i = 0; i < 6; i++) { const c = new THREE.Group(); for (let k = 0; k < 4; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(1 + Math.random(), 12, 8), cloudM); s.position.set(k * 1.3, Math.random() * .5, Math.random()); c.add(s); } c.position.set((Math.random() - .5) * 60, 14 + Math.random() * 4, (Math.random() - .5) * 60); scene.add(c); clouds.push(c); }

    // HTML-подписи
    const labelEls = labels.map(l => { const e = document.createElement('div'); e.className = 'map-label'; e.innerHTML = l.html; e.onclick = () => opts.onPick && opts.onPick(l.id); container.appendChild(e); return e; });

    // управление
    let drag = false, moved = 0, lx = 0, ly = 0, hover = null, pinch = 0, lastInteract = 0;
    const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
    const pick = (cx, cy) => { const r = renderer.domElement.getBoundingClientRect(); mouse.set((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1); ray.setFromCamera(mouse, camera); const hit = ray.intersectObjects(pickables, false)[0]; return hit ? hit.object.userData.id : null; };
    const el = renderer.domElement;
    if (opts.interactive) {
      el.addEventListener('pointerdown', e => { drag = true; moved = 0; lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId); lastInteract = performance.now(); });
      el.addEventListener('pointermove', e => {
        if (drag && !pinch) { const dx = e.clientX - lx, dy = e.clientY - ly; moved += Math.abs(dx) + Math.abs(dy); theta -= dx * .006; phi = clamp(phi - dy * .004, .35, 1.35); lx = e.clientX; ly = e.clientY; lastInteract = performance.now(); }
        else if (!drag) { const id = pick(e.clientX, e.clientY); if (id !== hover) { hover = id; el.style.cursor = id ? 'pointer' : 'grab'; } }
      });
      el.addEventListener('pointerup', e => { drag = false; if (moved < 6) { const id = pick(e.clientX, e.clientY); if (id && opts.onPick) { Sound.play('click'); opts.onPick(id); } } });
      el.addEventListener('wheel', e => { e.preventDefault(); dist = clamp(dist + e.deltaY * .03, 22, 95); lastInteract = performance.now(); }, { passive: false });
      el.addEventListener('touchstart', e => { if (e.touches.length === 2) pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }, { passive: true });
      el.addEventListener('touchmove', e => { if (e.touches.length === 2 && pinch) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); dist = clamp(dist * pinch / d, 22, 95); pinch = d; } }, { passive: true });
      el.addEventListener('touchend', () => { pinch = 0; });
    }
    const resize = () => { W = container.clientWidth; H = container.clientHeight; if (!W || !H) return; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); if (W < 600) dist = Math.max(dist, opts.interactive ? 80 : 70); };
    addEventListener('resize', resize); resize();

    let raf, alive = true; const t0 = performance.now(); const v = new THREE.Vector3();
    const loop = () => {
      if (!alive) return;
      const t = (performance.now() - t0) / 1000;
      if (opts.auto || (opts.interactive && performance.now() - lastInteract > 6000 && !drag)) theta += .0018;
      placeCam();
      anim.forEach(f => f(t));
      clouds.forEach((c, i) => { c.position.x += .01 + i * .002; if (c.position.x > 40) c.position.x = -40; });
      scene.children.forEach(o => { if (o.userData && o.userData.body) { const s = o.userData.id === hover ? 1.08 : 1; o.scale.lerp(v.set(s, s, s), .2); } });
      renderer.render(scene, camera);
      labels.forEach((l, i) => {
        l.obj.getWorldPosition(v); const d = v.distanceTo(camera.position); v.project(camera);
        const e = labelEls[i]; if (v.z > 1) { e.style.display = 'none'; return; }
        e.style.display = ''; e.style.left = ((v.x + 1) / 2 * W) + 'px'; e.style.top = ((-v.y + 1) / 2 * H - 18) + 'px';
        e.style.opacity = clamp(1.6 - (d - 25) / 30, .35, 1); e.style.zIndex = Math.round(1000 - d);
      });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return {
      dispose() { alive = false; cancelAnimationFrame(raf); removeEventListener('resize', resize); renderer.dispose(); scene.traverse(o => { if (o.geometry) o.geometry.dispose(); }); renderer.domElement.remove(); labelEls.forEach(e => e.remove()); }
    };
  }
};
