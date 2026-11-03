'use strict';
/* ================= 10. ПДД — «Безопасный город» ================= */
GAMES.pdd = function (el, ctx) {
  const LEVELS_P = [
    { name: 'Дом → Школа', goal: '🏫', map: ['gbbbgggbbbGb', 'ssssssssssss', 'rrrrrzrrrrrr', 'rrrrrzrrrrrr', 'ssssssssssss', 'gHgggggggggg'], txt: 'Дойди до школы. Переходи дорогу только по «зебре» и на зелёный сигнал.' },
    { name: 'Дом → Парк', goal: '🌳', map: ['bbbbbbbbbbGb', 'ssssssssssss', 'rrrrrrrrzrrr', 'rrrrrrrrzrrr', 'ssssssssssss', 'gggsgggggggg', 'ssssssssssss', 'rrrrrrzrrrrr', 'rrrrrrzrrrrr', 'ssuussssssss', 'gHgggggggggg'], headphones: true, txt: 'Два перехода и автобус на остановке. И ты в наушниках!' },
    { name: 'Вечером в магазин', goal: '🏪', map: ['gbGbbbbbbbbg', 'ssssssssssss', 'rrrrrrrrzrrr', 'rrrrrrrrzrrr', 'ssssssssssss', 'gggggggggbHg'], dark: true, txt: 'Стемнело. Водители плохо видят пешеходов…' },
    { name: 'На самокате', goal: '🏁', map: ['bbbbbbbbbbbG', 'ssssssssssss', 'rrrrrrzrrrrr', 'rrrrrrzrrrrr', 'ssssssssssss', 'Hggggggggggg'], scooter: true, txt: 'Едешь на самокате. Помни про шлем и правила на переходе.' }
  ];
  UI.tabs(el, [{ label: '🚦 Безопасный город', render: city }, { label: '⚠️ Знаки', render: signs }, { label: '🛑 Тормозной путь', render: brake }]);

  function city(box) {
    let li = 0; const save = Store.fac('pdd'); save.pl = save.pl || 0;
    const pickLevel = () => {
      box.innerHTML = `<p class="muted">Проведи персонажа по городу. Управление: стрелки / WASD или кнопки. Пройдено уровней: ${save.pl} из 4.</p><div class="grid g4">${LEVELS_P.map((L, k) => `<button class="opt center" data-k="${k}" style="text-align:center" ${k > save.pl ? 'disabled' : ''}><div style="font-size:2.2rem">${L.goal}</div><b>${k + 1}. ${L.name}</b><div class="small muted">${k < save.pl ? '✅ пройден' : k > save.pl ? '🔒' : 'доступен'}</div></button>`).join('')}</div>`;
      $$('.opt', box).forEach(b => b.onclick = () => play(+b.dataset.k));
    };
    const play = k => {
      li = k; const L = LEVELS_P[k]; const M = L.map, R = M.length, C = M[0].length;
      box.innerHTML = `<div class="row between" style="margin-bottom:8px"><b>Уровень ${k + 1}: ${L.name}</b><span class="pill" id="err">Ошибок: 0</span></div>
        <p class="small" style="margin:0 0 8px">${L.txt}</p>
        <div class="pdd-wrap" id="pw"><canvas id="cv"></canvas></div>
        <div class="row between" style="margin-top:12px;align-items:flex-start">
          <div class="row" id="acts">${L.headphones ? '<button class="btn sm" id="hp">🎧 Снять наушники</button>' : ''}${L.dark ? '<button class="btn sm" id="fl">✨ Надеть фликер</button>' : ''}${L.scooter ? '<button class="btn sm" id="hm">🪖 Надеть шлем</button><button class="btn sm" id="sc">🚶 Спешиться</button>' : ''}<button class="btn sm ghost" id="back">← Уровни</button></div>
          <div class="dpad"><span></span><button data-d="0,-1">⬆️</button><span></span><button data-d="-1,0">⬅️</button><button data-d="0,0" title="Ждать">⏸</button><button data-d="1,0">➡️</button><span></span><button data-d="0,1">⬇️</button><span></span></div></div>`;
      const cv = $('#cv', box), x = cv.getContext('2d');
      let T = 40, W = 0, H = 0;
      const fit = () => { const w = $('#pw', box).clientWidth; T = Math.floor(w / C); W = T * C; H = T * R; const dpr = Math.min(devicePixelRatio || 1, 2); cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px'; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
      fit(); App.listen(window, 'resize', fit);
      const at = (c, r) => (r < 0 || r >= R || c < 0 || c >= C) ? 'X' : M[r][c];
      let px = 0, py = 0; M.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'H') { px = c; py = r; } }));
      const st = { hp: !!L.headphones, fl: false, helmet: false, riding: !!L.scooter, errors: 0, busy: false, won: false };
      // дороги и полосы
      const roadRows = []; for (let r = 0; r < R; r++) if (/[rz]/.test(M[r])) roadRows.push(r);
      const lanes = roadRows.map(r => ({ r, dir: (roadRows.includes(r + 1)) ? -1 : 1 }));
      const zebraCols = r => [...M[r]].map((c, i) => c === 'z' ? i : -1).filter(i => i >= 0);
      const busTiles = []; M.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'u') busTiles.push([c, r]); }));
      const bus = busTiles.length ? { x0: Math.min(...busTiles.map(b => b[0])), len: busTiles.length, row: busTiles[0][1], state: 'stop', t: 8, off: 0 } : null;
      const busHere = () => bus && bus.state !== 'gone';
      const busZone = (c, r) => busHere() && Math.abs(r - busTiles[0][1]) <= 2 && c >= Math.min(...busTiles.map(b => b[0])) - 1 && c <= Math.max(...busTiles.map(b => b[0])) + 1;
      const cars = []; const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#e5e7eb', '#0ea5e9', '#f97316'];
      lanes.forEach(l => { for (let i = 0; i < 2; i++) cars.push({ lane: l, x: Math.random() * W, v: 0, len: 1.5, c: colors[(Math.random() * 8) | 0], sc: 0 }); });
      // светофор
      const cycle = [['green', 6], ['flash', 2.5], ['red', 7]]; let ph = 2, phT = 3; const light = () => cycle[ph][0];
      const onRoad = (c, r) => /[rz]/.test(at(c, r));
      const errMsg = {
        nozebra: 'Ты переходишь дорогу вне пешеходного перехода! Переходить можно только по «зебре» или на зелёный сигнал светофора.',
        red: 'Красный сигнал! Машины едут. Дождись зелёного.',
        bus: 'Выход из-за стоящего автобуса! Автобус закрывает обзор и тебе, и водителям: ты не видишь машину, а она — тебя. Даже когда автобус уедет, переходить здесь нельзя: дойди до «зебры» и дождись зелёного.',
        hp: 'Ты переходишь в наушниках! Ты не услышишь сигнал или звук тормозов. Сними наушники и убери телефон.',
        fl: 'В темноте водитель видит пешехода без световозвращателя только с 25–50 м — он не успеет затормозить (тормозной путь на 60 км/ч — 30–40 м). Со фликером тебя видно со 150–400 м.',
        sc: 'Через пешеходный переход нельзя ехать на самокате — нужно спешиться и вести его рядом. Тогда ты пешеход и у тебя преимущество.'
      };
      const danger = (kind, c, r) => {
        st.errors++; st.busy = true; $('#err', box).textContent = 'Ошибок: ' + st.errors;
        const lane = lanes.find(l => l.r === r) || lanes[0];
        const car = cars.filter(cc => cc.lane === lane).sort((a, b) => Math.abs(a.x - c * T) - Math.abs(b.x - c * T))[0];
        if (car) { car.x = lane.dir > 0 ? c * T - T * 2.2 : (c + 1) * T + T * .7; car.sc = 1.2; car.v = 0; }
        Sound.play('brake');
        const ov = h('<div class="overlay-msg">⚠️ Опасная ситуация!</div>'); $('#pw', box).appendChild(ov);
        App.timeout(() => { ov.remove(); ctx.answer(false, `<p>${errMsg[kind]}</p>`, () => { st.busy = false; }, { title: 'Машина резко затормозила!', btn: 'Понятно, попробую снова' }); }, 900);
      };
      const move = (dx, dy) => {
        if (st.busy || st.won) return;
        if (L.scooter && !st.helmet) { App.toast('🪖 Сначала надень шлем — на самокате и велосипеде он обязателен!'); return; }
        if (!dx && !dy) return;
        const nx = px + dx, ny = py + dy, t = at(nx, ny);
        if ('Xgb'.includes(t)) return;
        if (t === 'u' && busHere()) { App.toast('🚌 Здесь стоит автобус — обойди его по тротуару'); return; }
        const fromRoad = onRoad(px, py), toRoad = onRoad(nx, ny);
        if (toRoad) {
          if (!fromRoad) {
            if (st.hp) return danger('hp', nx, ny);
            if (L.dark && !st.fl) return danger('fl', nx, ny);
            if (t === 'r') return danger(busZone(nx, ny) ? 'bus' : 'nozebra', nx, ny);
            if (st.riding) return danger('sc', nx, ny);
            if (light() === 'red') return danger('red', nx, ny);
            if (light() === 'flash') { st.busy = true; ctx.answer(false, '<p>Мигающий зелёный — сигнал скоро сменится. Начинать переход уже нельзя: подожди следующий зелёный.</p>', () => { st.busy = false; }, { title: 'Стоп! Мигает зелёный', btn: 'Подожду' }); return; }
          } else if (t === 'r') return danger('nozebra', nx, ny);
        }
        px = nx; py = ny; Sound.play('tick');
        if (t === 'G') win();
      };
      const win = () => {
        st.won = true; const ok = st.errors === 0;
        if (k >= save.pl) { save.pl = k + 1; Store.save(); }
        App.timeout(() => ctx.answer(ok, `<p>${ok ? 'Без единой ошибки! Ты настоящий пешеход-профи.' : `Цель достигнута, но было опасных ситуаций: ${st.errors}.`}</p><p class="small">Помни: переход только по «зебре» на зелёный, смотри налево, потом направо, без наушников, в темноте — фликер.</p>`, () => {
          if (save.pl >= 4) ctx.done('Все 4 уровня пройдены!');
          if (k < 3) play(k + 1); else pickLevel();
        }, { title: `${L.goal} Уровень ${k + 1} пройден!`, btn: k < 3 ? 'Следующий уровень →' : 'К списку уровней' }), 200);
      };
      $$('.dpad button', box).forEach(b => b.onclick = () => { const [dx, dy] = b.dataset.d.split(',').map(Number); move(dx, dy); });
      App.listen(document, 'keydown', e => { if ($('.sheet-wrap')) return; const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] }[e.code]; if (m) { e.preventDefault(); move(...m); } });
      const hp = $('#hp', box); if (hp) hp.onclick = () => { st.hp = !st.hp; hp.textContent = st.hp ? '🎧 Снять наушники' : '🎧 Надеть наушники'; if (!st.hp) App.toast('👂 Теперь ты слышишь машины'); };
      const fl = $('#fl', box); if (fl) fl.onclick = () => { st.fl = true; fl.disabled = true; fl.textContent = '✨ Фликер надет'; App.toast('✨ Теперь водители видят тебя издалека'); };
      const hm = $('#hm', box); if (hm) hm.onclick = () => { st.helmet = true; hm.disabled = true; hm.textContent = '🪖 Шлем надет'; };
      const sc = $('#sc', box); if (sc) sc.onclick = () => { st.riding = !st.riding; sc.textContent = st.riding ? '🚶 Спешиться' : '🛴 Сесть на самокат'; };
      $('#back', box).onclick = pickLevel;
      // отрисовка
      let alive = true, last = performance.now(); App.onClean(() => alive = false);
      const rr = (X, Y, w, hh, r) => { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + hh, r); x.arcTo(X + w, Y + hh, X, Y + hh, r); x.arcTo(X, Y + hh, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); };
      const emoji = (e, cx, cy, s) => { x.font = `${s}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, cx, cy); };
      const frame = now => {
        if (!alive || !box.isConnected) return;
        const dt = Math.min(.05, (now - last) / 1000); last = now;
        phT -= dt; if (phT <= 0) { ph = (ph + 1) % 3; phT = cycle[ph][1]; }
        const pedOnZebra = r => at(px, py) === 'z' && (py === r || roadRows.includes(py));
        // машины
        cars.forEach(c => {
          const d = c.lane.dir, len = c.len * T, vmax = T * (2.2 + (k * .3));
          let target = vmax;
          zebraCols(c.lane.r).forEach(zc => { const z0 = zc * T, z1 = (zc + 1) * T; const dist = d > 0 ? z0 - (c.x + len) : c.x - z1; if (dist > -2 && dist < T * .9 && (light() !== 'red' || pedOnZebra(c.lane.r))) target = 0; });
          cars.forEach(o => { if (o === c || o.lane !== c.lane) return; const gap = d > 0 ? o.x - (c.x + len) : c.x - (o.x + o.len * T); if (gap > 0 && gap < T * .6) target = Math.min(target, 0); });
          if (c.sc > 0) { c.sc -= dt; target = 0; }
          c.v += (target - c.v) * Math.min(1, dt * (target < c.v ? 6 : 1.5)); c.x += c.v * d * dt;
          if (d > 0 && c.x > W + T) { c.x = -len - Math.random() * T * 4; c.c = colors[(Math.random() * 8) | 0]; }
          if (d < 0 && c.x < -len - T) { c.x = W + Math.random() * T * 4; c.c = colors[(Math.random() * 8) | 0]; }
        });
        // фон
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
          const ch = M[r][c], X = c * T, Y = r * T;
          if (ch === 'g' || ch === 'H') { x.fillStyle = (r + c) % 2 ? '#4ade80' : '#45d07a'; x.fillRect(X, Y, T, T); if (ch === 'g' && (r * 7 + c * 3) % 5 === 0) emoji('🌳', X + T / 2, Y + T / 2, T * .7); }
          else if (ch === 'b') { x.fillStyle = '#94a3b8'; x.fillRect(X, Y, T, T); x.fillStyle = ['#f87171', '#60a5fa', '#fbbf24', '#a78bfa'][c % 4]; x.fillRect(X + 3, Y + 3, T - 6, T - 6); x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(X + T * .2, Y + T * .25, T * .2, T * .2); x.fillRect(X + T * .6, Y + T * .25, T * .2, T * .2); }
          else if (ch === 's' || ch === 'u' || ch === 'G') { x.fillStyle = '#d6d3d1'; x.fillRect(X, Y, T, T); x.strokeStyle = '#bdb8b3'; x.strokeRect(X + .5, Y + .5, T - 1, T - 1); }
          else if (ch === 'r' || ch === 'z') { x.fillStyle = '#374151'; x.fillRect(X, Y, T, T); if (ch === 'z') { x.fillStyle = '#f8fafc'; for (let i = 0; i < 5; i++) x.fillRect(X + T * .08 + i * T * .18, Y + 2, T * .1, T - 4); } }
          if (ch === 'H') emoji('🏠', X + T / 2, Y + T / 2, T * .8);
          if (ch === 'G') emoji(L.goal, X + T / 2, Y + T / 2, T * .8);
        }
        // разметка
        roadRows.forEach(r => { if (roadRows.includes(r + 1)) { x.strokeStyle = '#facc15'; x.setLineDash([T * .4, T * .3]); x.lineWidth = 2; x.beginPath(); x.moveTo(0, (r + 1) * T); x.lineTo(W, (r + 1) * T); x.stroke(); x.setLineDash([]); } });
        // автобус
        if (bus) {
          const onBay = py === bus.row && px >= bus.x0 && px < bus.x0 + bus.len;
          if (bus.state === 'stop') { bus.t -= dt; if (bus.t <= 0) { bus.state = 'leave'; App.toast('🚌 Автобус уехал. Но переходить всё равно нужно по «зебре»!'); } }
          else if (bus.state === 'leave') { bus.off += T * 3 * dt; if (bus.off > W) { bus.state = 'gone'; bus.t = 9; } }
          else if (bus.state === 'gone') { bus.t -= dt; if (bus.t <= 0 && !onBay) { bus.state = 'arrive'; bus.off = -(bus.x0 + bus.len + 1) * T; } }
          else if (bus.state === 'arrive') { bus.off += T * 3 * dt; if (bus.off >= 0) { bus.off = 0; bus.state = 'stop'; bus.t = 8; } }
        }
        if (bus && bus.state !== 'gone') { const bx = bus.x0 * T + bus.off, by = (bus.state === 'stop' ? bus.row : bus.row - 1) * T; x.fillStyle = '#f59e0b'; rr(bx + 2, by + 4, T * busTiles.length - 4, T - 8, 8); x.fill(); x.fillStyle = '#bae6fd'; for (let i = 0; i < busTiles.length * 2; i++) x.fillRect(bx + 6 + i * T * .48, by + 8, T * .36, T * .3); x.fillStyle = '#111'; x.font = `bold ${T * .22}px sans-serif`; x.fillText('BUS', bx + T * busTiles.length / 2, by + T * .72); }
        // светофоры
        roadRows.forEach(r => { if (roadRows.includes(r - 1)) return; zebraCols(r).forEach(zc => { [r - 1, r + 2].forEach(sr => { if (sr < 0 || sr >= R) return; const X = zc * T + T * .78, Y = sr * T + T * .1; x.fillStyle = '#111827'; rr(X, Y, T * .2, T * .44, 3); x.fill(); const lt = light(); const on = lt === 'green' || (lt === 'flash' && Math.floor(now / 300) % 2 === 0); x.fillStyle = lt === 'red' ? '#ef4444' : '#3f1d1d'; x.beginPath(); x.arc(X + T * .1, Y + T * .11, T * .07, 0, 7); x.fill(); x.fillStyle = on ? '#22c55e' : '#14351f'; x.beginPath(); x.arc(X + T * .1, Y + T * .32, T * .07, 0, 7); x.fill(); }); }); });
        // машины
        cars.forEach(c => {
          const len = c.len * T, Y = c.lane.r * T + T * .14, hh = T * .72;
          x.fillStyle = c.c; rr(c.x, Y, len, hh, 7); x.fill();
          x.fillStyle = 'rgba(15,23,42,.7)'; const wx = c.lane.dir > 0 ? c.x + len * .55 : c.x + len * .15; x.fillRect(wx, Y + hh * .15, len * .28, hh * .7);
          if (L.dark) { x.fillStyle = 'rgba(254,240,138,.35)'; x.beginPath(); const fx = c.lane.dir > 0 ? c.x + len : c.x; x.moveTo(fx, Y + hh / 2); x.lineTo(fx + c.lane.dir * T * 2.2, Y - T * .2); x.lineTo(fx + c.lane.dir * T * 2.2, Y + hh + T * .2); x.fill(); }
          if (c.sc > 0) { x.fillStyle = '#ef4444'; const bx2 = c.lane.dir > 0 ? c.x : c.x + len - 5; x.fillRect(bx2, Y + 3, 5, hh - 6); emoji('❗', c.x + len / 2, Y - T * .15, T * .5); }
        });
        // игрок
        const PX = px * T + T / 2, PY = py * T + T / 2;
        if (st.fl) { x.fillStyle = 'rgba(253,224,71,.45)'; x.beginPath(); x.arc(PX, PY, T * .5, 0, 7); x.fill(); }
        emoji(st.riding ? '🛴' : '🧑', PX, PY, T * .72);
        if (st.hp) emoji('🎧', PX + T * .28, PY - T * .3, T * .34);
        if (st.helmet) emoji('🪖', PX, PY - T * .38, T * .32);
        // темнота
        if (L.dark) { const g = x.createRadialGradient(PX, PY, T * .6, PX, PY, T * (st.fl ? 4.5 : 2.2)); g.addColorStop(0, 'rgba(2,6,23,0)'); g.addColorStop(1, 'rgba(2,6,23,.82)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    pickLevel();
  }

  function signSvg(k) {
    const T = (e, s = 44, y = 62) => `<text x="50" y="${y}" font-size="${s}" text-anchor="middle" dominant-baseline="middle">${e}</text>`;
    const tri = c => `<polygon points="50,6 96,90 4,90" fill="#fff" stroke="#dc2626" stroke-width="8" stroke-linejoin="round"/>${c}`;
    const circ = (fill, stroke, c) => `<circle cx="50" cy="50" r="44" fill="${fill}" stroke="${stroke}" stroke-width="8"/>${c}`;
    const sq = (c, f = '#2563eb') => `<rect x="6" y="6" width="88" height="88" rx="8" fill="${f}" stroke="#fff" stroke-width="3"/>${c}`;
    const S = {
      crossing: sq(`<polygon points="50,18 84,80 16,80" fill="#fff"/>${T('🚶', 34, 60)}`),
      kids: tri(T('🚸', 36, 64)),
      noped: circ('#fff', '#dc2626', `${T('🚶', 46, 54)}<line x1="20" y1="20" x2="80" y2="80" stroke="#dc2626" stroke-width="8"/>`),
      bike: circ('#2563eb', '#fff', T('🚲', 46, 54)),
      stop: `<polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="#dc2626" stroke="#fff" stroke-width="4"/><text x="50" y="58" font-size="24" font-weight="900" fill="#fff" text-anchor="middle" font-family="sans-serif">STOP</text>`,
      yield: `<polygon points="4,10 96,10 50,92" fill="#fff" stroke="#dc2626" stroke-width="8" stroke-linejoin="round"/>`,
      noentry: circ('#dc2626', '#dc2626', '<rect x="18" y="42" width="64" height="16" fill="#fff"/>'),
      main: `<polygon points="50,4 96,50 50,96 4,50" fill="#fff" stroke="#111" stroke-width="2"/><polygon points="50,16 84,50 50,84 16,50" fill="#facc15"/>`,
      speed: circ('#fff', '#dc2626', '<text x="50" y="62" font-size="36" font-weight="900" text-anchor="middle" font-family="sans-serif">40</text>'),
      bus: sq(T('🚌', 46, 54)),
      walk: circ('#2563eb', '#fff', T('🚶', 46, 54)),
      lights: tri(T('🚦', 34, 64)),
      works: tri(T('🚧', 34, 64)),
      under: sq(`${T('🚶', 30, 40)}<path d="M25 80 h15 v-10 h15 v-10 h15 v-10" stroke="#fff" stroke-width="5" fill="none"/>`),
      parking: sq('<text x="50" y="70" font-size="60" font-weight="900" fill="#fff" text-anchor="middle" font-family="sans-serif">P</text>')
    };
    return `<svg viewBox="0 0 100 100" class="sign">${S[k]}</svg>`;
  }
  function signs(box) {
    const L = [['crossing', 'Пешеходный переход', 'Синий квадрат с человечком — здесь переход. Водители обязаны уступить дорогу пешеходам.'], ['kids', 'Осторожно, дети', 'Треугольник с красной каймой — предупреждающий знак. Рядом школа или детская площадка.'], ['noped', 'Движение пешеходов запрещено', 'Красный круг с перечёркнутым человечком — пешеходам здесь ходить нельзя.'], ['bike', 'Велосипедная дорожка', 'Синий круг с велосипедом — дорожка для велосипедистов (и самокатов).'], ['stop', 'Движение без остановки запрещено (STOP)', 'Водитель обязан полностью остановиться перед знаком.'], ['yield', 'Уступите дорогу', 'Перевёрнутый треугольник — водитель уступает дорогу на перекрёстке.'], ['noentry', 'Въезд запрещён («кирпич»)', 'Въезд всем транспортным средствам в этом направлении запрещён.'], ['main', 'Главная дорога', 'Жёлтый ромб — водители на этой дороге имеют преимущество на перекрёстках.'], ['speed', 'Ограничение максимальной скорости', 'Нельзя ехать быстрее 40 км/ч.'], ['bus', 'Место остановки автобуса', 'Здесь останавливается общественный транспорт. Не выходи на дорогу из-за автобуса!'], ['walk', 'Пешеходная дорожка', 'Синий круг с человечком — дорожка только для пешеходов.'], ['lights', 'Светофорное регулирование', 'Предупреждение: впереди светофор.'], ['works', 'Дорожные работы', 'Впереди ремонт дороги — будь внимателен.'], ['under', 'Подземный пешеходный переход', 'Самый безопасный способ перейти дорогу — под землёй.'], ['parking', 'Парковка', 'Место для стоянки автомобилей.']];
    const list = shuffle(L); let i = 0, sc = 0;
    const show = () => {
      if (i >= list.length) { box.innerHTML = `<div class="q-wrap"><div class="card center pop"><h2>⚠️ ${sc} из ${list.length} знаков</h2><p class="muted">Форма подсказывает смысл: <b>треугольник</b> предупреждает, <b>красный круг</b> запрещает, <b>синий</b> — разрешает или информирует.</p><button class="btn" id="ag">↻ Ещё раз</button></div></div>`; $('#ag', box).onclick = () => signs(box); return; }
      const [k, name, why] = list[i]; const others = shuffle(L.filter(x => x[0] !== k)).slice(0, 3);
      const w = h('<div class="q-wrap"></div>'); box.innerHTML = ''; box.appendChild(w);
      UI.choice(w, { head: `<div class="muted small">Знак ${i + 1} из ${list.length}</div><div style="margin:10px 0 16px">${signSvg(k)}</div>`, q: 'Что означает этот знак?', opts: [{ t: name, ok: true }].concat(others.map(o => ({ t: o[1] }))), explain: why, ctx, onDone: ok => { if (ok) sc++; i++; show(); } });
    };
    show();
  }
  function brake(box) {
    let tries = new Set();
    box.innerHTML = `<div class="q-wrap"><div class="card"><h2>🛑 Тормозной путь</h2><p class="muted">Выбери скорость и погоду. Пешеход стоит в 35 м от машины. Водитель реагирует ~1 секунду, потом тормозит.</p>
      <div class="row"><b>Скорость:</b>${[20, 40, 60, 80, 100].map(v => `<button class="btn sm" data-v="${v}">${v} км/ч</button>`).join('')}</div>
      <div class="row" style="margin-top:8px"><b>Дорога:</b><button class="btn sm" data-w="0.7">☀️ Сухая</button><button class="btn sm" data-w="0.4">🌧️ Мокрая</button><button class="btn sm" data-w="0.15">🧊 Гололёд</button></div>
      <div class="road-strip" id="strip" style="margin-top:16px"></div><div id="res" style="margin-top:12px"></div><div class="center"><button class="btn fc" id="go" style="margin-top:8px">▶ Затормозить!</button></div></div></div>`;
    let v = 60, mu = .7; const MAXD = 120;
    const sel = () => { $$('[data-v]', box).forEach(b => b.classList.toggle('fc', +b.dataset.v === v)); $$('[data-w]', box).forEach(b => b.classList.toggle('fc', +b.dataset.w === mu)); };
    const strip = $('#strip', box);
    const draw = () => { strip.innerHTML = [0, 20, 40, 60, 80, 100, 120].map(m => `<div class="mark" style="left:${m / MAXD * 92 + 2}%"><span>${m} м</span></div>`).join('') + `<div class="ped" style="left:${35 / MAXD * 92 + 2}%">🧍</div><div class="car" id="car" style="left:0%">🚗</div>`; };
    $$('[data-v]', box).forEach(b => b.onclick = () => { v = +b.dataset.v; sel(); draw(); });
    $$('[data-w]', box).forEach(b => b.onclick = () => { mu = +b.dataset.w; sel(); draw(); });
    $('#go', box).onclick = () => {
      draw(); const ms = v / 3.6, react = ms * 1, br = ms * ms / (2 * mu * 9.81), tot = react + br;
      const car = $('#car', box); void car.offsetWidth; car.style.left = (Math.min(tot, MAXD) / MAXD * 92 - 2) + '%';
      Sound.play('brake'); const hit = tot > 35;
      App.timeout(() => {
        $('#res', box).innerHTML = `<div class="take" style="--fc:${hit ? 'var(--bad)' : 'var(--ok)'}"><span>Путь реакции: <b>${react.toFixed(1)} м</b> + тормозной путь: <b>${br.toFixed(1)} м</b> = <b>${tot.toFixed(1)} м</b>. ${hit ? '💥 Машина не успела остановиться перед пешеходом!' : '✅ Машина успела остановиться.'}</span></div><p class="small muted">На 60 км/ч по сухой дороге машине нужно около 30–40 метров. На мокрой — больше, на льду — в разы больше. Поэтому никогда не выбегай перед близко идущей машиной!</p>`;
        tries.add(v + '_' + mu); if (tries.size === 3) App.addXP(15, 'исследователь тормозного пути');
      }, 2000);
    };
    sel(); draw();
  }
};

/* ================= 11. ИСТОРИЯ — «Машина времени» ================= */
GAMES.history = function (el, ctx) {
  const EP = [
    { y: '~2560 г. до н.э.', icon: '🔺', name: 'Древний Египет', sc: [['🏜️🐪🔺', 'Машина времени со скрежетом приземлилась в пустыне. Перед тобой — строящаяся пирамида Хеопса!'], ['👷‍♂️🍞🍺', 'Рядом посёлок строителей: им выдают хлеб, пиво и даже лечат травмы. Это не рабы, а оплачиваемые рабочие!']],
      task: { type: 'odd', q: 'Найди предмет, которого не может быть в Древнем Египте:', items: [['🐪', 'верблюд'], ['🏺', 'кувшин'], ['📱', 'смартфон'], ['🌾', 'пшеница'], ['🔨', 'молот'], ['🐊', 'крокодил']], odd: 2, why: 'Смартфоны появились в XXI веке, а не 4500 лет назад! Кстати, о том, что пирамиды строили оплачиваемые рабочие, знают по найденным поселениям строителей.' } },
    { y: '~1440 г.', icon: '📖', name: 'Майнц, Германия', sc: [['✍️📜🕯️', 'Средние века. Монахи переписывают книги вручную — одна книга занимает месяцы.'], ['⚙️🔠📖', 'Иоганн Гутенберг собирает станок с подвижными металлическими буквами…']],
      task: { type: 'q', q: 'Что изменило книгопечатание Гутенберга?', opts: [{ t: 'Книги стали дешевле, знания начали распространяться быстро', ok: true }, { t: 'Появились первые компьютеры' }, { t: 'Книги стали дороже и редкими' }], why: 'Книгопечатание сделало книги доступными. Это первая информационная революция — как интернет, только 580 лет назад.' } },
    { y: '1492', icon: '⛵', name: 'Атлантический океан', sc: [['🌊⛵🌊', 'Три корабля Колумба плывут на запад, чтобы найти путь в Индию.'], ['🏝️🌽🍅', 'Земля! Но это не Индия, а неизвестный европейцам континент — Америка.']],
      task: { type: 'q', q: 'Какой продукт попал в Европу из Америки?', opts: [{ t: '🥔 Картофель', ok: true }, { t: '🌾 Пшеница' }, { t: '🍇 Виноград' }, { t: '🍏 Яблоки' }], why: 'Картофель, томаты, кукуруза, какао — всё это пришло из Америки. Без Колумба не было бы ни картошки фри, ни пиццы с томатами!' } },
    { y: '1769', icon: '🚂', name: 'Англия', sc: [['🏭💨⚙️', 'Мастерская в Англии. Шотландский инженер Джеймс Уатт улучшает паровой двигатель.'], ['🔥➡️⚙️', 'Его машина тратит намного меньше угля — и вскоре заработают фабрики и паровозы.']],
      task: { type: 'odd', q: 'Что лишнее в мастерской Уатта в 1769 году?', items: [['⚙️', 'шестерни'], ['🔥', 'топка'], ['🕯️', 'свеча'], ['🔨', 'молот'], ['🪵', 'дрова'], ['💡', 'электролампа']], odd: 5, why: 'Лампочку Эдисон сделал практичной только в 1879 году — через 110 лет! А в честь Уатта названа единица мощности — ватт.' } },
    { y: '1928', icon: '💊', name: 'Лаборатория в Лондоне', sc: [['🔬🧫🦠', 'Лаборатория Александра Флеминга. Он вернулся из отпуска и разбирает чашки с бактериями.'], ['🧫🍄❓', 'В одной чашке выросла плесень… и вокруг неё бактерии погибли!']],
      task: { type: 'decide', q: 'Как бы ты поступил на месте Флеминга?', opts: [{ t: '🗑️ Выбросить испорченную чашку' }, { t: '🔬 Изучить, почему бактерии погибли', ok: true }], why: 'Флеминг не выбросил чашку, а изучил её — так открыли пенициллин, первый антибиотик. Он спас сотни миллионов жизней. Внимательность к «ошибкам» ведёт к открытиям!' } },
    { y: '1939–1945', icon: '🕊️', name: 'Вторая мировая война', sc: [['🌍💥😢', 'Самая разрушительная война в истории. Погибли десятки миллионов людей.'], ['🕊️🤝🌐', 'В 1945 году страны договорились создать организацию, чтобы решать споры без войн.']],
      task: { type: 'q', q: 'Какая организация была создана в 1945 году по итогам войны?', opts: [{ t: 'ООН — Организация Объединённых Наций', ok: true }, { t: 'Европейский союз' }, { t: 'Лига Наций' }, { t: 'Олимпийский комитет' }], why: 'ООН создана в 1945 году. Лига Наций появилась ещё в 1920-м, а Евросоюз — только в 1993-м.' } },
    { y: '12 апреля 1961', icon: '🚀', name: 'Байконур', sc: [['🚀🔥🌫️', 'Космодром Байконур. Ракета «Восток» готова к старту.'], ['👨‍🚀🌍✨', 'Юрий Гагарин — первый человек в космосе. Полёт вокруг Земли длился 108 минут.']],
      task: { type: 'q', q: 'Какое знаменитое слово сказал Гагарин на старте?', opts: [{ t: '«Поехали!»', ok: true }, { t: '«Вперёд!»' }, { t: '«Ура!»' }, { t: '«Старт!»' }], why: '«Поехали!» — сказал Гагарин. 12 апреля теперь отмечают День космонавтики.' } },
    { y: '1969', icon: '🌕', name: 'Луна', sc: [['🚀🌕', 'Корабль «Аполлон-11» летит к Луне.'], ['👨‍🚀👣🌕', 'Нил Армстронг ступает на Луну: «Это маленький шаг для человека, но огромный скачок для человечества».']],
      task: { type: 'q', q: 'Что мощнее: бортовой компьютер «Аполлона-11» или современный смартфон?', opts: [{ t: 'Смартфон — в миллионы раз', ok: true }, { t: 'Компьютер «Аполлона»' }, { t: 'Они одинаковые' }], why: 'Компьютер «Аполлона» имел около 4 КБ оперативной памяти. Твой смартфон мощнее в миллионы раз!' } },
    { y: '1989–1991', icon: '🌐', name: 'Берлин и ЦЕРН', sc: [['🧱🔨🎉', '1989 год. Берлинская стена, разделявшая город, пала.'], ['💻🌐🔗', '1991 год. Тим Бернерс-Ли в ЦЕРНе запускает первый веб-сайт — рождается Всемирная паутина.']],
      task: { type: 'decide', q: 'Бернерс-Ли мог запатентовать веб и брать деньги за использование. Как бы поступил ты?', opts: [{ t: '🆓 Сделать веб бесплатным для всех', ok: true }, { t: '💰 Брать плату за каждый сайт' }], why: 'Бернерс-Ли сделал веб бесплатным — поэтому интернет стал всемирным. Первый сайт до сих пор работает!', anyOk: true } },
    { y: '2007', icon: '📱', name: 'Сан-Франциско', sc: [['🎤📱👏', 'Стив Джобс показывает первый iPhone: «Телефон, плеер и интернет-устройство в одном».'], ['🌍📱📱', 'Начинается эпоха смартфонов — карты, банк, камера и школа в одном кармане.']],
      task: { type: 'q', q: 'Чего НЕ было в первом iPhone (2007)?', opts: [{ t: 'Магазина приложений App Store', ok: true }, { t: 'Сенсорного экрана' }, { t: 'Камеры' }, { t: 'Интернета' }], why: 'App Store появился только в 2008 году — через год после первого iPhone.' } }
  ];
  const ORDER = [['🔺', 'Пирамида Хеопса', -2560], ['📖', 'Книгопечатание Гутенберга', 1440], ['⛵', 'Колумб доплыл до Америки', 1492], ['🚂', 'Паровой двигатель Уатта', 1769], ['💊', 'Открытие пенициллина', 1928], ['🕊️', 'Создание ООН', 1945], ['🚀', 'Полёт Гагарина', 1961], ['🌕', 'Человек на Луне', 1969], ['🌐', 'Первый веб-сайт', 1991], ['📱', 'Первый iPhone', 2007]];
  const MYTH = [['Наполеон был очень низкого роста', false, 'Миф! Его рост — около 168–170 см, средний для того времени. Путаница из-за разницы французских и английских дюймов и карикатур.'], ['Викинги носили рогатые шлемы', false, 'Миф! Рога придумали художники и театр XIX века. В бою рога только мешали бы.'], ['Клеопатра жила ближе ко времени запуска iPhone, чем к постройке пирамиды Хеопса', true, 'Правда! Клеопатра жила около 30 г. до н.э.: до пирамиды ~2500 лет, а до iPhone ~2040 лет.'], ['Великую Китайскую стену видно из космоса невооружённым глазом', false, 'Миф! Стена длинная, но узкая — с орбиты её без оптики не разглядеть.'], ['Пирамиды строили рабы', false, 'Миф! Строили оплачиваемые рабочие — это знают по найденным поселениям строителей.'], ['Первый компьютерный «баг» был настоящим насекомым', true, 'Правда! В 1947 году в компьютере Mark II нашли мотылька, застрявшего в реле.'], ['Эйнштейн плохо учился по математике', false, 'Миф! Эйнштейн отлично знал математику уже в школе.'], ['Оксфордский университет старше империи ацтеков', true, 'Правда! В Оксфорде учили уже в 1096 году, а столицу ацтеков Теночтитлан основали около 1325 года.'], ['Колумб доказал, что Земля круглая', false, 'Миф! О том, что Земля — шар, знали ещё древние греки.'], ['Когда строили пирамиды, на Земле ещё жили мамонты', true, 'Правда! Последние мамонты жили на острове Врангеля примерно до 2000 г. до н.э.'], ['Гагарин облетел Землю один раз', true, 'Правда! Полёт длился 108 минут — один виток вокруг Земли.'], ['В Средние века все люди считали Землю плоской', false, 'Миф! Образованные люди Средневековья знали, что Земля — шар.']];
  let crystals = 0;
  const hud = () => `<div class="row between" style="margin-bottom:10px"><b>⏳ Машина времени</b><div class="crystals">${EP.map((e, k) => `<span class="${k < crystals ? 'on' : ''}">💎</span>`).join('')}</div></div>`;
  const start = () => {
    crystals = 0;
    el.innerHTML = `<div class="q-wrap"><div class="card center"><div class="big-emoji float">⏳</div><h2>Машина времени сломалась!</h2><p>Чтобы вернуться домой, нужно собрать <b>10 кристаллов</b> в разных эпохах. В каждой — история и задание.</p><p class="muted small">Потом — «Расставь по порядку» и «Правда или миф».</p><button class="btn fc lg" id="go">🚀 Отправиться в прошлое</button></div></div>`;
    $('#go', el).onclick = () => epoch(0);
  };
  const epoch = i => {
    if (i >= EP.length) return timeline();
    const e = EP[i]; let s = 0;
    const scene = () => {
      if (s >= e.sc.length) return task();
      el.innerHTML = hud() + `<div class="q-wrap"><div class="card fade-in"><div class="tag">${e.y} · ${e.name}</div><div class="scene" style="margin:12px 0;font-size:4rem">${e.sc[s][0]}</div><p style="font-size:1.12rem">${e.sc[s][1]}</p><div class="row between"><span class="muted small">Эпоха ${i + 1} из 10 · экран ${s + 1}/${e.sc.length}</span><button class="btn fc" id="nx">Далее →</button></div></div></div>`;
      $('#nx', el).onclick = () => { s++; scene(); };
    };
    const got = () => { crystals++; Sound.play('coin'); epoch(i + 1); };
    const task = () => {
      const t = e.task;
      if (t.type === 'odd') {
        el.innerHTML = hud() + `<div class="q-wrap"><div class="q-card"><div class="tag">${e.icon} ${e.y}</div><div class="q-text" style="margin-top:8px">${t.q}</div><div class="odd-grid">${t.items.map((it, k) => `<button data-k="${k}">${it[0]}<small>${it[1]}</small></button>`).join('')}</div></div></div>`;
        $$('.odd-grid button', el).forEach(b => b.onclick = () => { const ok = +b.dataset.k === t.odd; $$('.odd-grid button', el)[t.odd].style.borderColor = 'var(--ok)'; if (!ok) b.style.borderColor = 'var(--bad)'; ctx.answer(ok, `<p>${t.why}</p><p>💎 Кристалл получен!</p>`, got); });
      } else {
        const w = h('<div class="q-wrap"></div>'); el.innerHTML = hud(); el.appendChild(w);
        if (t.anyOk) {
          UI.choice(w, { head: `<div class="tag">${e.icon} ${e.y} · Как поступил бы ты?</div>`, q: t.q, opts: t.opts.map(o => Object.assign({}, o, { ok: true })), ctx: { answer: (ok, html, next) => { App.answer(true); App.feedback({ ok: true, kind: 'info', title: 'А что было на самом деле?', html: `<p>${t.why}</p><p>💎 Кристалл получен!</p>`, onNext: next }); } }, onDone: got });
          $$('.opt', w).forEach(b => b.classList.remove('correct'));
        } else UI.choice(w, { head: `<div class="tag">${e.icon} ${e.y}${t.type === 'decide' ? ' · Как поступил бы ты?' : ''}</div>`, q: t.q, opts: t.opts, explain: t.why + '<br>💎 Кристалл получен!', ctx, title: t.type === 'decide' ? 'А что было на самом деле?' : undefined, onDone: got });
      }
    };
    scene();
  };
  const timeline = () => {
    let items = shuffle(shuffle(ORDER).slice(0, 8));
    const draw = (checked) => {
      el.innerHTML = `<div class="q-wrap"><div class="card"><h2>📅 Расставь по порядку</h2><p class="muted">От самого древнего (сверху) к самому новому. Перетаскивай или используй стрелки.</p><div class="order-list" id="ol">${items.map((it, k) => `<div class="order-item ${checked ? (correctPos(it, k) ? 'good' : 'badp') : ''}" draggable="${!checked}" data-k="${k}"><span style="font-size:1.6rem">${it[0]}</span><span>${it[1]}${checked ? ` <span class="muted small">— ${it[2] < 0 ? '~' + (-it[2]) + ' г. до н.э.' : it[2]}</span>` : ''}</span>${checked ? '' : `<span class="arr"><button data-u="${k}">▲</button><button data-d="${k}">▼</button></span>`}</div>`).join('')}</div>
        <div class="row" style="justify-content:flex-end;margin-top:12px">${checked ? '<button class="btn fc" id="nx">Дальше: Правда или миф →</button>' : '<button class="btn fc" id="chk">Проверить</button>'}</div></div></div>`;
      if (checked) { $('#nx', el).onclick = myths; return; }
      $$('[data-u]', el).forEach(b => b.onclick = () => { const k = +b.dataset.u; if (k > 0) { [items[k - 1], items[k]] = [items[k], items[k - 1]]; Sound.play('click'); draw(); } });
      $$('[data-d]', el).forEach(b => b.onclick = () => { const k = +b.dataset.d; if (k < items.length - 1) { [items[k + 1], items[k]] = [items[k], items[k + 1]]; Sound.play('click'); draw(); } });
      let from = null;
      $$('.order-item', el).forEach(it => { it.addEventListener('dragstart', () => { from = +it.dataset.k; }); it.addEventListener('dragover', e => e.preventDefault()); it.addEventListener('drop', e => { e.preventDefault(); const to = +it.dataset.k; if (from == null || from === to) return; const [m] = items.splice(from, 1); items.splice(to, 0, m); draw(); }); });
      $('#chk', el).onclick = () => { const good = items.filter((it, k) => correctPos(it, k)).length; draw(true); ctx.answer(good === items.length, `<p>На своих местах: <b>${good} из ${items.length}</b>.</p><p>Правильный порядок показан с датами — запомни его!</p>`, () => { }); };
    };
    const sorted = () => items.slice().sort((a, b) => a[2] - b[2]);
    const correctPos = (it, k) => sorted()[k] === it;
    draw(false);
  };
  const myths = () => {
    const list = shuffle(MYTH); let i = 0, sc = 0;
    const show = () => {
      if (i >= list.length) {
        el.innerHTML = `<div class="q-wrap"><div class="card center pop"><div class="big-emoji">🏠</div><h2>Машина времени починена!</h2><p>Кристаллов: 10/10 · «Правда или миф»: <b>${sc} из ${list.length}</b></p><p class="muted">Совет историка: проверяй «общеизвестные факты» — многие из них оказываются мифами.</p><button class="btn" id="ag">↻ Новое путешествие</button></div></div>`;
        $('#ag', el).onclick = start; ctx.done('Путешествие во времени завершено!'); return;
      }
      const [s, truth, why] = list[i];
      el.innerHTML = `<div class="q-wrap"><div class="row between" style="margin-bottom:8px"><b>Правда или миф? ${i + 1} из ${list.length}</b><span class="pill">✅ ${sc}</span></div><div class="q-card center"><div class="q-text">«${s}»</div><div class="row" style="justify-content:center"><button class="btn ok lg" data-v="1">✅ Правда</button><button class="btn bad lg" data-v="0">🧌 Миф</button></div></div></div>`;
      $$('[data-v]', el).forEach(b => b.onclick = () => { const ok = (b.dataset.v === '1') === truth; if (ok) sc++; ctx.answer(ok, `<p><b>${truth ? '✅ Правда.' : '🧌 Миф.'}</b> ${why.replace(/^(Миф!|Правда!)\s*/, '')}</p>`, () => { i++; show(); }); });
    };
    show();
  };
  start();
};

/* ================= 12. ПРАВА — «Знай свои права» ================= */
GAMES.rights = function (el, ctx) {
  const C = [
    { who: '👱‍♀️', name: 'Ольга, 17 лет', story: 'Купила куртку, а дома поняла, что не подходит цвет. Прошло 5 дней, куртку не носила, ярлыки на месте.', ev: [['🧾', 'Чек', 'МАГАЗИН «СТИЛЬ»\nКуртка демисез. ........ 5 990 ₽\nДата: 5 дней назад\nОплата: карта'], ['🏷️', 'Ярлыки', 'Ярлыки и бирки на месте.\nКуртка не была в употреблении,\nтоварный вид сохранён.']],
      law: [['Ст. 25 Закона «О защите прав потребителей» — возврат товара надлежащего качества', true], ['Ст. 18 — права при обнаружении брака', false], ['Трудовой кодекс РФ', false]],
      adv: [['Вернуть куртку: прошло меньше 14 дней, ярлыки на месте — можно обменять или получить деньги', true, 'Товар надлежащего качества можно вернуть в течение 14 дней, если он не был в употреблении и сохранены вид и ярлыки.'], ['Ничего не сделать — куртка же не бракованная', false, 'Вернуть можно и товар без брака — если он просто не подошёл (14 дней).'], ['Подождать месяц, вдруг цвет понравится', false, 'Через месяц срок в 14 дней истечёт.']], res: 'Магазин принял куртку и вернул 5 990 ₽. 🎉' },
    { who: '🧑', name: 'Денис, 16 лет', story: 'Купил беспроводные наушники, через 2 недели перестал работать левый. Чек потерялся.', ev: [['🏦', 'Выписка из банка', 'ВЫПИСКА ПО КАРТЕ\n14.10  ТЕХНОМИР  −3 490 ₽\n«Наушники TWS Pro»'], ['📄', 'Гарантийный талон', 'Гарантийный срок: 12 месяцев\nс даты покупки.']],
      law: [['Ст. 18 Закона «О защите прав потребителей» — права при недостатках товара', true], ['Ст. 25 — возврат товара надлежащего качества', false], ['Закон «О рекламе»', false]],
      adv: [['Требовать ремонт, замену или возврат денег — покупку подтвердит выписка из банка', true, 'Брак в гарантийный срок — право на ремонт, замену, скидку или возврат. Чек не обязателен: подойдёт выписка или свидетели.'], ['Без чека ничего не сделать', false, 'Это миф! Отсутствие чека не лишает прав — подойдёт выписка из банка.'], ['Купить новые, раз так вышло', false, 'Зачем платить дважды? Закон на твоей стороне.']], res: 'Магазин заменил наушники на новые. 🎧' },
    { who: '👵', name: 'Бабушка Нина', story: 'На ценнике у сыра — 199 ₽, а на кассе пробили 249 ₽. Кассир говорит: «Ценник старый, платите».', ev: [['🏷️', 'Фото ценника', 'СЫР «РОССИЙСКИЙ» 200 г\n        199 ₽\nДата печати: сегодня'], ['🧾', 'Чек', 'СЫР РОССИЙСКИЙ 200Г .... 249,00']],
      law: [['Ценник — публичная оферта: продавец обязан продать по указанной цене (ГК РФ, Закон о защите прав потребителей)', true], ['Касса всегда права', false], ['Ст. 25 — возврат в течение 14 дней', false]],
      adv: [['Требовать продать по цене ценника, при отказе — жалоба в Роспотребнадзор', true, 'Если на кассе пробили дороже, чем на ценнике, можно требовать продать по цене ценника. Фото ценника — доказательство.'], ['Заплатить 249 ₽ — ценник же «старый»', false, 'Ответственность за ценники несёт магазин, а не покупатель.'], ['Устроить скандал и уйти с сыром без оплаты', false, 'Свои права защищают законно, а не самоуправством.']], res: 'Администратор извинился и пробил сыр за 199 ₽. 🧀' },
    { who: '🧒', name: 'Артём, 15 лет', story: 'Работал курьером месяц. Договор не подписывали, а теперь работодатель не платит: «Ты же без договора».', ev: [['💬', 'Переписка', 'Работодатель: Выходи завтра с 9 до 18, оплата 15 000 в месяц\nАртём: Хорошо!\n…\nАртём: Когда зарплата?\nРаботодатель: Ты ж без договора 😏'], ['📄', 'Договор', 'ТРУДОВОЙ ДОГОВОР — не оформлен.\nСогласие родителя — отсутствует.']],
      law: [['Трудовой кодекс: с 14 лет — лёгкий труд с согласия родителя, трудовой договор обязателен, укороченный день', true], ['Закон «О защите прав потребителей»', false], ['Подросткам работать нельзя совсем', false]],
      adv: [['Вместе с родителями обратиться в трудовую инспекцию — работодатель нарушил закон', true, 'Обязанность оформить договор — на работодателе. Переписка подтверждает работу. Трудовая инспекция поможет взыскать деньги.'], ['Ничего не поделаешь — сам виноват', false, 'Нарушил закон работодатель, а не подросток.'], ['Устроиться к кому-то ещё без договора', false, 'Без договора нет защиты — история может повториться.']], res: 'После жалобы в трудовую инспекцию работодатель выплатил зарплату и получил штраф. 💰' },
    { who: '👧', name: 'Вика, 14 лет', story: 'Одноклассник выложил её неудачное фото в соцсеть с обидной подписью. Удалять отказывается.', ev: [['📱', 'Скриншот поста', '@petya_cool: Смотрите, кто тут спит на уроке 😂😂😂\n❤️ 47  💬 23'], ['💬', 'Переписка', 'Вика: Удали, пожалуйста\nПетя: Удалю, когда захочу 😎']],
      law: [['Право на изображение и персональные данные: распространять фото без согласия нельзя (ГК РФ, ст. 152.1)', true], ['Всё, что в интернете, — общее', false], ['Закон о рекламе', false]],
      adv: [['Потребовать удалить, пожаловаться в соцсеть и рассказать родителям или учителю', true, 'Никто не имеет права распространять твои фото без согласия. Соцсети удаляют такие посты по жалобе.'], ['Выложить его фото в ответ', false, 'Месть делает тебя таким же нарушителем.'], ['Смириться и молчать', false, 'Молчание помогает обидчику. Ты имеешь право требовать удаления.']], res: 'Соцсеть удалила пост по жалобе, а классный руководитель провёл беседу. 🛡️' },
    { who: '🧔', name: 'Максим, 18 лет', story: 'Купил смартфон 3 дня назад. Он исправен, но разонравился. Магазин отказывается возвращать деньги.', ev: [['🧾', 'Чек', 'СМАРТФОН X12 128GB ..... 24 990 ₽\nДата: 3 дня назад'], ['🔍', 'Проверка', 'Телефон полностью исправен,\nнедостатков не обнаружено.']],
      law: [['Перечень товаров, не подлежащих возврату: технически сложные товары (смартфоны) надлежащего качества', true], ['Ст. 25 — вернуть можно всё в течение 14 дней', false], ['Ст. 18 — права при браке', false]],
      adv: [['Магазин прав: исправный смартфон не возвращают. Но если найдётся брак — магазин обязан принять', true, 'Техника надлежащего качества входит в перечень исключений. При браке — другое дело: ремонт, замена или возврат.'], ['Требовать деньги — 14 дней же не прошло!', false, 'Правило 14 дней не действует для товаров из перечня исключений.'], ['Разбить телефон и сказать, что брак', false, 'Это обман — экспертиза покажет, что повреждение механическое.']], res: 'Максим понял, что магазин прав, и продал телефон на сайте объявлений. Перед покупкой техники стоит всё хорошо обдумать! 📱' },
    { who: '👩‍🦰', name: 'Аня, 16 лет', story: 'Устроилась в кафе по договору. Теперь управляющий ставит её в ночные смены с 22:00 до 6:00.', ev: [['📅', 'График смен', 'Анна К. — Пт 22:00–06:00\nАнна К. — Сб 22:00–06:00'], ['📄', 'Трудовой договор', 'Работник: Анна К., 16 лет\nДолжность: помощник бариста']],
      law: [['Трудовой кодекс запрещает ночную и вредную работу несовершеннолетних', true], ['Раз есть договор — можно всё', false], ['Закон «О защите прав потребителей»', false]],
      adv: [['Отказаться от ночных смен — это законно, при давлении обратиться в трудовую инспекцию', true, 'Подросткам положен укороченный рабочий день, а ночная работа запрещена.'], ['Согласиться, иначе уволят', false, 'Работодатель нарушает закон — уволить за отказ он не вправе.'], ['Работать и не говорить родителям', false, 'Ночные смены вредят здоровью и учёбе, а закон защищает подростков.']], res: 'Управляющий переделал график: теперь Аня работает днём по 4 часа. ☕' },
    { who: '🧑‍🎓', name: 'Кирилл, 15 лет', story: 'На выходе из магазина охранник требует открыть рюкзак: «Покажи, что там, или не выпущу!»', ev: [['🪪', 'Удостоверение охранника', 'Частная охранная организация «Щит»\nОхранник 4 разряда'], ['📘', 'Справка о законе', 'Закон о частной охранной деятельности:\nохранник не вправе проводить личный досмотр\nи досмотр вещей без согласия.']],
      law: [['Досмотр вещей вправе проводить только полиция; охранник может лишь попросить или вызвать полицию', true], ['Охранник вправе обыскать любого', false], ['Подростков можно обыскивать без разрешения', false]],
      adv: [['Вежливо отказаться и предложить вызвать полицию, если у охранника есть подозрения', true, 'Охранник не имеет права обыскивать — только вызвать полицию. Показывать вещи можно лишь добровольно.'], ['Отдать рюкзак — охраннику можно всё', false, 'Охранник не полиция, обыскивать он не вправе.'], ['Убежать', false, 'Бегство создаёт подозрения и конфликт. Спокойствие и знание закона — лучшая защита.']], res: 'Охранник извинился и отпустил Кирилла. 🎒' }
  ];
  let i = 0, score = 0;
  const intro = () => {
    el.innerHTML = `<div class="q-wrap"><div class="card center"><div class="big-emoji">⚖️</div><h2>Бюро Справедливости</h2><p>Ты — молодой юрист. К тебе идут клиенты с 8 делами. Изучи улики, выбери закон и дай совет.</p><button class="btn fc lg" id="go">Открыть бюро</button></div></div>`;
    $('#go', el).onclick = () => { i = 0; score = 0; caseView(); };
  };
  const caseView = () => {
    if (i >= C.length) {
      el.innerHTML = `<div class="q-wrap"><div class="card center pop"><div class="big-emoji">🏆</div><h2>Все дела закрыты!</h2><p>Верных решений: <b>${score} из ${C.length * 2}</b></p><p class="muted">Куда обращаться: Роспотребнадзор (покупки), трудовая инспекция (работа), уполномоченный по правам ребёнка, бесплатная юридическая помощь.</p><button class="btn" id="ag">↻ Начать заново</button></div></div>`;
      $('#ag', el).onclick = intro; ctx.done('Все дела закрыты!'); return;
    }
    const c = C[i]; const seen = new Set();
    el.innerHTML = `<div class="q-wrap"><div class="row between" style="margin-bottom:10px"><b>📁 Дело ${i + 1} из ${C.length}</b><span class="pill">✅ ${score}</span></div>
      <div class="card"><div class="row"><span style="font-size:3rem">${c.who}</span><div><b>${c.name}</b><p style="margin:4px 0 0">${c.story}</p></div></div>
      <p style="margin-top:16px"><b>🔍 Улики</b> <span class="muted small">— изучи все, чтобы принять решение</span></p>
      <div class="evidence">${c.ev.map((e, k) => `<button class="ev" data-k="${k}">${e[0]} ${e[1]}</button>`).join('')}</div>
      <div class="center" style="margin-top:16px"><button class="btn fc" id="dec" disabled>⚖️ К решению</button></div></div></div>`;
    $$('.ev', el).forEach(b => b.onclick = () => { const e = c.ev[+b.dataset.k]; seen.add(+b.dataset.k); b.classList.add('seen'); Sound.play('click'); App.modal(`<h3>${e[0]} ${e[1]}</h3><div class="doc">${esc(e[2])}</div><div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn fc" data-close>Закрыть</button></div>`); if (seen.size === c.ev.length) $('#dec', el).disabled = false; });
    $('#dec', el).onclick = () => {
      const w = h('<div class="q-wrap"></div>'); el.innerHTML = ''; el.appendChild(w);
      UI.choice(w, { head: `<div class="muted small">Дело ${i + 1} · ${c.who} ${c.name} · шаг 1 из 2</div>`, q: 'Какой закон применить?', opts: c.law.map(l => ({ t: l[0], ok: l[1] })), explain: 'Правильный закон: <b>' + c.law.find(l => l[1])[0] + '</b>', ctx, onDone: ok => {
        if (ok) score++;
        UI.choice(w, { head: `<div class="muted small">Дело ${i + 1} · ${c.who} ${c.name} · шаг 2 из 2</div>`, q: 'Что посоветуешь клиенту?', opts: c.adv.map(a => ({ t: a[0], ok: a[1], why: a[2] })), ctx, onDone: ok2 => {
          if (ok2) score++;
          App.feedback({ ok: true, kind: 'info', title: '📋 Результат дела', html: `<p>${ok2 ? c.res : 'Клиент последовал другому совету… Но ты теперь знаешь, как правильно: ' + c.adv[0][2]}</p>`, btn: i < C.length - 1 ? 'Следующий клиент →' : 'Итоги', onNext: () => { i++; caseView(); } });
        } });
      } });
    };
  };
  intro();
};
