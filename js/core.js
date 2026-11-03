'use strict';
/* ===== Утилиты ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
const fmt = n => Math.round(n).toLocaleString('ru-RU');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const GAMES = {};

/* ===== Переводы (RU / UZ / EN) ===== */
const I18N = { lang: 'ru', dict: null, core: null, pats: [], obs: null };
const CYR_RE = /[А-Яа-яЁё]/;
function i18nSetup(lang) {
  I18N.lang = lang;
  const dict = lang === 'en' ? window.I18N_EN : lang === 'uz' ? window.I18N_UZ : null;
  if (!dict) { I18N.lang = 'ru'; return; }
  I18N.dict = dict; I18N.core = {}; I18N.pats = [];
  const strip = t => t.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
  for (const k in dict) {
    if (/\{\d+\}/.test(k)) {
      const lit = k.replace(/\{\d+\}/g, '');
      const re = new RegExp('^' + k.split(/(\{\d+\})/).map(part => /^\{\d+\}$/.test(part) ? '([\\s\\S]*?)' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*')).join('') + '$');
      const order = (k.match(/\{(\d+)\}/g) || []).map(x => +x.slice(1, -1));
      I18N.pats.push({ re, order, tr: dict[k], w: lit.length });
    } else { const c = strip(k); if (c && !(c in I18N.core)) I18N.core[c] = strip(dict[k]); }
  }
  I18N.pats.sort((a, b) => b.w - a.w);
  document.documentElement.lang = lang;
}
function T(s, depth = 0) {
  if (!I18N.dict || s == null) return s;
  const raw = String(s); if (!CYR_RE.test(raw) || depth > 3) return raw;
  const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
  const t = raw.replace(/\s+/g, ' ').trim();
  const wrap = r => lead + r + trail;
  let r = I18N.dict[t]; if (r != null) return wrap(r);
  const m = t.match(/^([^\p{L}]*)([\s\S]*?)([^\p{L}]*)$/u);
  if (m && m[2]) { r = I18N.core[m[2]]; if (r != null) return wrap(m[1] + r + m[3]); }
  for (const p of I18N.pats) {
    const mm = t.match(p.re); if (!mm) continue;
    const caps = mm.slice(1); const byIdx = {}; p.order.forEach((n, i) => { byIdx[n] = caps[i]; });
    return wrap(p.tr.replace(/\{(\d+)\}/g, (_, n) => T(byIdx[n] == null ? '' : byIdx[n], depth + 1)));
  }
  return raw;
}
function i18nNode(root) {
  if (!I18N.dict || !root) return;
  if (root.nodeType === 3) { if (CYR_RE.test(root.nodeValue)) { const v = T(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; } return; }
  if (root.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA)$/.test(root.tagName)) return;
  i18nAttrs(root); root.querySelectorAll('[title],[placeholder]').forEach(i18nAttrs);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { if (CYR_RE.test(n.nodeValue) && !(n.parentNode && /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentNode.tagName))) { const v = T(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; } }
}
function i18nAttrs(el) { ['title', 'placeholder'].forEach(a => { const v = el.getAttribute && el.getAttribute(a); if (v && CYR_RE.test(v)) { const t = T(v); if (t !== v) el.setAttribute(a, t); } }); }
function i18nStart() {
  if (!I18N.dict) return;
  document.title = T(document.title);
  i18nNode(document.body);
  I18N.obs = new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') i18nNode(m.target); else if (m.type === 'attributes') i18nAttrs(m.target); else m.addedNodes.forEach(i18nNode); } });
  I18N.obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['title', 'placeholder'] });
}
function fmtDate(ts) {
  const d = new Date(ts);
  if (I18N.lang === 'uz') return `${d.getFullYear()}-yil ${d.getDate()}-${['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'][d.getMonth()]}`;
  return d.toLocaleDateString(I18N.lang === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ===== Хранилище ===== */
const Store = {
  key: 'academy_life_v1', d: null,
  defaults() { return { name: '', avatar: 0, xp: 0, coins: 0, theme: 'auto', sound: true, fac: {}, badges: [], stats: { correct: 0, wrong: 0, lessons: 0 }, exam: null, grad: null }; },
  load() { try { this.d = Object.assign(this.defaults(), JSON.parse(localStorage.getItem(this.key) || '{}')); } catch (e) { this.d = this.defaults(); } },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch (e) { } },
  fac(id) { const f = this.d.fac[id]; if (f && f.__ok) return f; return (this.d.fac[id] = Object.assign({ lesson: false, game: false, stars: 0, best: 0, done: false, gameMistakes: 99 }, f || {}, { __ok: 1 })); }
};
function levelOf(xp) { let i = 0; LEVELS.forEach((l, k) => { if (xp >= l.xp) i = k; }); return i; }
function starsHtml(n, max = 3) { let s = ''; for (let i = 0; i < max; i++) s += i < n ? '★' : '<span class="off">★</span>'; return `<span class="stars">${s}</span>`; }
function avatarHtml(i, size = 44) { return `<span class="av" style="width:${size}px;height:${size}px;font-size:${size * .55}px;background:${AVATAR_BG[i % 8]}">${AVATARS[i % 8]}</span>`; }

/* ===== Звук ===== */
const Sound = {
  ctx: null,
  ac() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } return this.ctx; },
  tone(f, d, type = 'sine', vol = .07, delay = 0) {
    const c = this.ac(); if (!c) return;
    const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + .05);
  },
  play(n) {
    if (!Store.d.sound) return;
    const T = (...a) => this.tone(...a);
    if (n === 'ok') { T(660, .12, 'triangle'); T(990, .18, 'triangle', .07, .09); }
    else if (n === 'bad') { T(180, .25, 'sawtooth', .05); T(140, .3, 'sawtooth', .05, .1); }
    else if (n === 'click') T(520, .05, 'square', .03);
    else if (n === 'win') [523, 659, 784, 1046].forEach((f, i) => T(f, .25, 'triangle', .07, i * .11));
    else if (n === 'level') [392, 523, 659, 784, 1046, 1318].forEach((f, i) => T(f, .3, 'triangle', .06, i * .09));
    else if (n === 'tick') T(1200, .03, 'square', .02);
    else if (n === 'beat') T(880, .05, 'sine', .06);
    else if (n === 'brake') { T(900, .5, 'sawtooth', .04); T(700, .5, 'sawtooth', .03, .05); }
    else if (n === 'coin') { T(988, .08, 'square', .03); T(1319, .15, 'square', .03, .07); }
  }
};

/* ===== Конфетти ===== */
const Confetti = {
  parts: [], running: false,
  burst(n = 160) {
    const cv = $('#confetti'); cv.width = innerWidth; cv.height = innerHeight;
    const cols = ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#06b6d4'];
    for (let i = 0; i < n; i++) this.parts.push({ x: innerWidth / 2 + (Math.random() - .5) * innerWidth * .6, y: innerHeight * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 4, c: cols[i % cols.length], a: Math.random() * 6, va: (Math.random() - .5) * .3, life: 0 });
    if (!this.running) { this.running = true; requestAnimationFrame(() => this.step()); }
  },
  step() {
    const cv = $('#confetti'), x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height);
    this.parts.forEach(p => { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life++; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore(); });
    this.parts = this.parts.filter(p => p.y < cv.height + 40 && p.life < 400);
    if (this.parts.length) requestAnimationFrame(() => this.step()); else { this.running = false; x.clearRect(0, 0, cv.width, cv.height); }
  }
};

/* ===== Речь (английский) ===== */
function speak(text, lang = 'en-GB') {
  try {
    if (!window.speechSynthesis) { App.toast('🔇 Озвучка не поддерживается в этом браузере'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/’/g, "'")); u.lang = lang; u.rate = .9;
    const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith(lang.slice(0, 2)));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { }
}

/* ===== Бейджи ===== */
const BADGES = FACULTIES.map(f => ({ id: 'fac_' + f.id, icon: f.icon, name: f.badge, desc: `3 звезды: ${f.name}` })).concat([
  { id: 'first', icon: '🚀', name: 'Первые шаги', desc: 'Пройди первый урок' },
  { id: 'flawless', icon: '🎯', name: 'Без ошибок', desc: 'Игра и тест факультета без единой ошибки' },
  { id: 'speed', icon: '⚡', name: 'Скоростной', desc: 'Тест на 5/5 быстрее 40 секунд' },
  { id: 'allknow', icon: '🧠', name: 'Всезнайка', desc: 'Пройди все 12 факультетов' },
  { id: 'grad', icon: '🎓', name: 'Выпускник', desc: 'Сдай Экзамен Академии' }
]);

/* ===== Приложение ===== */
const App = {
  streak: 0, cleanups: [], current: null,
  init() {
    Store.load();
    i18nSetup(Store.d.lang || 'ru');
    this.applyTheme();
    const ls = $('#langSel'); if (ls) { ls.value = I18N.lang; ls.onchange = () => { Store.d.lang = ls.value; Store.save(); location.reload(); }; }
    i18nStart();
    $('#themeBtn').onclick = () => { const cur = this.isDark(); Store.d.theme = cur ? 'light' : 'dark'; Store.save(); this.applyTheme(); Sound.play('click'); if (this.onTheme) this.onTheme(); };
    $('#soundBtn').onclick = () => { Store.d.sound = !Store.d.sound; Store.save(); this.refreshHeader(); Sound.play('click'); };
    addEventListener('hashchange', () => this.route());
    if (window.speechSynthesis) speechSynthesis.getVoices();
    this.route();
  },
  isDark() { const t = Store.d.theme; if (t === 'dark') return true; if (t === 'light') return false; return matchMedia('(prefers-color-scheme: dark)').matches; },
  applyTheme() {
    const t = Store.d.theme; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
    $('#themeBtn').textContent = this.isDark() ? '☀️' : '🌙';
  },
  refreshHeader() {
    const d = Store.d; $('#soundBtn').textContent = d.sound ? '🔊' : '🔇';
    $('#hud').innerHTML = d.name ? `<span class="pill" title="Уровень">⭐ ${fmt(d.xp)} XP</span><span class="pill coins" title="Монеты">🪙 ${fmt(d.coins)}</span>` : '';
  },
  /* таймеры, привязанные к текущему экрану */
  timeout(fn, ms) { const id = setTimeout(fn, ms); this.cleanups.push(() => clearTimeout(id)); return id; },
  interval(fn, ms) { const id = setInterval(fn, ms); this.cleanups.push(() => clearInterval(id)); return id; },
  listen(t, ev, fn, o) { t.addEventListener(ev, fn, o); this.cleanups.push(() => t.removeEventListener(ev, fn, o)); },
  onClean(fn) { this.cleanups.push(fn); },
  clean() { this.cleanups.forEach(f => { try { f(); } catch (e) { } }); this.cleanups = []; $$('.sheet-wrap,.modal-wrap').forEach(e => e.remove()); try { speechSynthesis.cancel(); } catch (e) { } },

  route() {
    this.clean(); this.streak = 0;
    const hash = location.hash.replace(/^#\/?/, '') || 'home';
    const [page, arg] = hash.split(/[\/-]/);
    const needReg = ['map', 'profile', 'encyclopedia', 'fac', 'exam', 'grad'];
    if (needReg.includes(page) && !Store.d.name) { location.hash = '#register'; return; }
    $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.r === page));
    this.refreshHeader();
    const app = $('#app'); app.innerHTML = ''; scrollTo(0, 0);
    const fn = Pages[page] || Pages.home;
    fn(app, arg);
  },
  go(h) { location.hash = h; },

  toast(html, cls = '') { const t = h(`<div class="toast ${cls}">${html}</div>`); $('#toasts').appendChild(t); setTimeout(() => t.remove(), 3100); },
  addXP(n, why = '') {
    const before = levelOf(Store.d.xp); Store.d.xp += n; Store.save();
    this.toast(`+${n} XP ${why ? '<span class="muted small">· ' + why + '</span>' : ''}`, 'xp');
    const after = levelOf(Store.d.xp);
    if (after > before) { Sound.play('level'); Confetti.burst(120); this.toast(`🎉 Новый уровень: <b>${LEVELS[after].n}</b>!`, 'badge'); }
    this.refreshHeader();
  },
  coins(n) { Store.d.coins += n; Store.save(); this.refreshHeader(); },
  unlock(id) {
    if (Store.d.badges.includes(id)) return false;
    const b = BADGES.find(x => x.id === id); if (!b) return false;
    Store.d.badges.push(id); Store.save(); Sound.play('coin');
    setTimeout(() => this.toast(`${b.icon} Новый значок: <b>${b.name}</b>`, 'badge'), 400);
    return true;
  },
  /* правильный / неправильный ответ в любой игре */
  answer(ok, el) {
    const s = Store.d.stats;
    if (ok) {
      s.correct++; this.streak++;
      let bonus = this.streak >= 5 ? 10 : this.streak >= 3 ? 5 : 0;
      this.addXP(10 + bonus, bonus ? `серия ×${this.streak} 🔥` : ''); Store.d.coins += 1; Sound.play('ok');
    } else {
      s.wrong++; this.streak = 0; Sound.play('bad');
      if (el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
      try { navigator.vibrate && navigator.vibrate(80); } catch (e) { }
    }
    Store.save(); this.refreshHeader();
  },
  feedback({ ok = true, title, html = '', btn = 'Далее →', onNext, kind }) {
    const k = kind || (ok ? 'ok' : 'bad');
    const t = title || (ok ? 'Верно!' : 'Неверно');
    const icon = k === 'info' ? '💡' : ok ? '✅' : '❌';
    const w = h(`<div class="sheet-wrap"><div class="sheet ${k}"><h3>${icon} ${t}</h3><div class="why">${html}</div><div class="row" style="margin-top:16px;justify-content:flex-end"><button class="btn primary">${btn}</button></div></div></div>`);
    document.body.appendChild(w);
    const close = () => { w.remove(); document.removeEventListener('keydown', key); onNext && onNext(); };
    const key = e => { if (e.key === 'Enter') { e.preventDefault(); close(); } };
    setTimeout(() => document.addEventListener('keydown', key), 250);
    $('button', w).onclick = close; $('button', w).focus({ preventScroll: true });
    return w;
  },
  modal(html, onClose) {
    const w = h(`<div class="modal-wrap"><div class="modal">${html}</div></div>`);
    document.body.appendChild(w);
    const close = () => { w.remove(); onClose && onClose(); };
    w.addEventListener('click', e => { if (e.target === w || e.target.closest('[data-close]')) close(); });
    return { el: w, close };
  }
};

/* ===== Общие UI-компоненты для игр ===== */
const UI = {
  tabs(root, tabs) {
    const bar = h(`<div class="tabs">${tabs.map((t, i) => `<button data-i="${i}">${t.label}</button>`).join('')}</div>`);
    const body = h('<div></div>'); root.append(bar, body);
    const show = i => { App.clean(); $$('button', bar).forEach((b, k) => b.classList.toggle('on', k === i)); body.innerHTML = ''; tabs[i].render(body); };
    bar.onclick = e => { const b = e.target.closest('button'); if (b) { Sound.play('click'); show(+b.dataset.i); } };
    show(0); return { show };
  },
  /* универсальный вопрос с вариантами: opts = [{t, ok, why}] */
  choice(el, { head = '', q, opts, explain = '', onDone, ctx, shuffleOpts = true, title }) {
    const list = shuffleOpts ? shuffle(opts) : opts;
    const box = h(`<div class="q-card fade-in">${head}${q ? `<div class="q-text">${q}</div>` : ''}<div class="opts">${list.map((o, i) => `<button class="opt" data-i="${i}">${o.t}</button>`).join('')}</div></div>`);
    el.innerHTML = ''; el.appendChild(box);
    $$('.opt', box).forEach(b => b.onclick = () => {
      const o = list[+b.dataset.i]; const ok = !!o.ok;
      $$('.opt', box).forEach((x, i) => { x.disabled = true; if (list[i].ok) x.classList.add('correct'); });
      if (!ok) b.classList.add('wrong');
      const right = list.find(x => x.ok);
      const html = (o.why ? `<p>${o.why}</p>` : '') + (explain ? `<p>${explain}</p>` : '') + (!ok && right && !o.why ? `<p>Правильно: <b>${right.t}</b></p>` : '');
      ctx.answer(ok, html, () => onDone && onDone(ok, o), { title, shake: box });
    });
    return box;
  },
  doneBar(root, text, btnText, onClick) {
    const bar = h(`<div class="done-bar fade-in"><span>✅ ${text}</span><button class="btn fc sm">${btnText}</button></div>`);
    $('button', bar).onclick = onClick; root.prepend(bar); return bar;
  }
};

/* ===== Квиз (итоговый тест и экзамен) ===== */
function runQuiz(el, qs, { timeLimit = 0, onFinish, label = 'Вопрос' }) {
  let i = 0, score = 0, finished = false; const t0 = Date.now(); const answers = [];
  const wrap = h(`<div class="q-wrap"><div class="row between" style="margin-bottom:10px"><b class="qn"></b><span class="pill tm hidden">⏱ <span></span></span></div><div class="progress" style="margin-bottom:16px"><i style="width:0"></i></div><div class="qbox"></div></div>`);
  el.innerHTML = ''; el.appendChild(wrap);
  const finish = () => { if (finished) return; finished = true; $$('.sheet-wrap').forEach(e => e.remove()); onFinish({ score, total: qs.length, time: (Date.now() - t0) / 1000, answers }); };
  if (timeLimit) {
    const tm = $('.tm', wrap); tm.classList.remove('hidden');
    const upd = () => { const left = Math.max(0, timeLimit - (Date.now() - t0) / 1000); $('span', tm).textContent = `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`; if (left <= 0) { App.toast('⏰ Время вышло!'); finish(); } };
    upd(); App.interval(upd, 500);
  }
  const show = () => {
    if (finished) return;
    if (i >= qs.length) return finish();
    const q = qs[i]; $('.qn', wrap).textContent = `${label} ${i + 1} из ${qs.length}`; $('.progress i', wrap).style.width = (i / qs.length * 100) + '%';
    const opts = shuffle(q.a.map((t, k) => ({ t, ok: k === 0 })));
    const box = h(`<div class="q-card fade-in">${q.fac ? `<div class="tag" style="--fc:${q.fac.color};margin-bottom:8px">${q.fac.icon} ${q.fac.name}</div>` : ''}<div class="q-text">${q.q}</div><div class="opts">${opts.map((o, k) => `<button class="opt" data-k="${k}">${o.t}</button>`).join('')}</div></div>`);
    const qb = $('.qbox', wrap); qb.innerHTML = ''; qb.appendChild(box);
    $$('.opt', box).forEach(b => b.onclick = () => {
      const o = opts[+b.dataset.k]; $$('.opt', box).forEach((x, k) => { x.disabled = true; if (opts[k].ok) x.classList.add('correct'); });
      if (!o.ok) b.classList.add('wrong'); else score++;
      answers.push({ q, ok: o.ok }); App.answer(o.ok, box);
      App.feedback({ ok: o.ok, html: (o.ok ? '' : `<p>Правильный ответ: <b>${q.a[0]}</b></p>`) + `<p>${q.e}</p>`, onNext: () => { i++; show(); } });
    });
  };
  show();
}

/* ===== Страницы ===== */
const Pages = {};

Pages.home = (app) => {
  const reg = !!Store.d.name;
  app.innerHTML = `<div class="container">
  <section class="hero">
    <div class="fade-in">
      <span class="pill">🎮 12 факультетов · 60+ мини-игр и сценариев</span>
      <h1 style="margin-top:16px">Академия Жизни</h1>
      <div class="slogan">Научись жить — играя</div>
      <p class="muted" style="font-size:1.08rem;max-width:520px">Финансы, кибербезопасность, первая помощь, эмоции, права и ещё 7 тем, которым не учат в школе. Короткие уроки, игры с последствиями и тесты — по 5 минут на факультет.</p>
      <div class="row" style="margin-top:24px"><a class="btn primary lg" href="${reg ? '#map' : '#register'}">${reg ? '▶ Продолжить' : '🚀 Начать'}</a><a class="btn lg" href="#about">О проекте</a></div>
      ${reg ? `<p class="muted small" style="margin-top:12px">С возвращением, <b>${esc(Store.d.name)}</b>! ${avatarHtml(Store.d.avatar, 22)}</p>` : ''}
    </div>
    <div class="hero-3d fade-in" id="hero3d"></div>
  </section>
  <section class="section">
    <div class="section-title"><h2>Почему это важно</h2><p class="muted">Знания, которые реально пригодятся завтра</p></div>
    <div class="grid g3">
      <div class="card fact"><div class="big">27,5 млрд ₽</div><b>украли мошенники у россиян за 2024 год</b><p class="muted small">по данным Банка России. Большинство переводов люди сделали сами — под давлением «службы безопасности банка».</p></div>
      <div class="card fact"><div class="big">−10%</div><b>шансов выжить с каждой минутой без СЛР</b><p class="muted small">при остановке сердца. Скорая едет дольше — первым помочь можешь только ты.</p></div>
      <div class="card fact"><div class="big">1 из 3</div><b>взрослых в мире финансово грамотен</b><p class="muted small">по глобальному исследованию S&amp;P FinLit. Бюджет, кредиты и сложный процент в школе не проходят.</p></div>
    </div>
  </section>
  <section class="section">
    <div class="section-title"><h2>12 факультетов</h2><p class="muted">Каждый — отдельное здание на 3D-кампусе</p></div>
    <div class="grid g3">${FACULTIES.map(f => `<a class="fac-preview" style="--fc:${f.color}" href="${reg ? '#fac-' + f.id : '#register'}"><div class="ic">${f.icon}</div><div><b>${f.name}</b><div class="muted small">«${f.game}»</div></div></a>`).join('')}</div>
  </section>
  <section class="section">
    <div class="section-title"><h2>Как это работает</h2></div>
    <div class="steps">
      <div class="card step-c"><div class="n">📖</div><b>Урок</b><p class="muted small">5–8 карточек с правилами и примерами. 1–2 минуты.</p></div>
      <div class="card step-c"><div class="n">🎮</div><b>Игра</b><p class="muted small">Применяешь знания на практике и видишь последствия.</p></div>
      <div class="card step-c"><div class="n">📝</div><b>Тест</b><p class="muted small">5 вопросов с разбором каждой ошибки.</p></div>
      <div class="card step-c"><div class="n">🏅</div><b>Значок</b><p class="muted small">Звёзды, XP, значки и сертификат выпускника.</p></div>
    </div>
    <div class="center" style="margin-top:32px"><a class="btn primary lg" href="${reg ? '#map' : '#register'}">${reg ? 'На карту Академии →' : 'Поступить в Академию →'}</a></div>
  </section>
  </div><footer class="foot">«Академия Жизни» · Демо-проект · Всё работает в браузере, прогресс хранится на твоём устройстве</footer>`;
  const c = typeof Campus !== 'undefined' && Campus.create($('#hero3d'), { auto: true, labels: false, interactive: false });
  if (c) App.onClean(() => c.dispose());
  else $('#hero3d').innerHTML = `<div style="display:grid;place-items:center;height:100%;font-size:5rem" class="float">🏛️</div>`;
};

Pages.register = (app) => {
  let av = Store.d.avatar || 0;
  app.innerHTML = `<div class="container" style="max-width:560px"><div class="card fade-in" style="padding:28px">
    <h1 class="display" style="font-size:1.6rem">Поступление в Академию</h1>
    <p class="muted">Как тебя зовут? Имя будет на сертификате выпускника.</p>
    <input type="text" id="nm" maxlength="24" placeholder="Твоё имя" value="${esc(Store.d.name)}">
    <p style="margin-top:22px"><b>Выбери аватар</b></p>
    <div class="avatars">${AVATARS.map((a, i) => `<div class="avatar ${i === av ? 'sel' : ''}" data-i="${i}" style="background:${AVATAR_BG[i]}">${a}</div>`).join('')}</div>
    <button class="btn primary lg" id="go" style="width:100%;margin-top:24px">Поступить 🎓</button>
  </div></div>`;
  $$('.avatar').forEach(a => a.onclick = () => { av = +a.dataset.i; $$('.avatar').forEach(x => x.classList.toggle('sel', x === a)); Sound.play('click'); });
  const go = () => {
    const n = $('#nm').value.trim();
    if (!n) { $('#nm').classList.add('shake'); setTimeout(() => $('#nm').classList.remove('shake'), 500); $('#nm').focus(); return; }
    const first = !Store.d.name; Store.d.name = n; Store.d.avatar = av; Store.save();
    if (first) { Sound.play('win'); Confetti.burst(100); App.toast(`Добро пожаловать в Академию, ${esc(n)}! 🎓`); }
    App.go('#map');
  };
  $('#go').onclick = go; $('#nm').onkeydown = e => { if (e.key === 'Enter') go(); };
  $('#nm').focus();
};

function completedCount() { return FACULTIES.filter(f => Store.fac(f.id).done).length; }
function totalStars() { return FACULTIES.reduce((s, f) => s + Store.fac(f.id).stars, 0); }

Pages.map = (app) => {
  const done = completedCount();
  app.innerHTML = `<div class="container">
    <div class="row between" style="margin-bottom:14px"><div><h1 class="display" style="font-size:1.6rem;margin:0">Карта Академии</h1><p class="muted" style="margin:0">Вращай кампус, нажми на здание, чтобы войти</p></div>
    <div class="row"><span class="pill">🏛️ ${done}/12 пройдено</span><span class="pill">★ ${totalStars()}/36</span></div></div>
    <div class="map-wrap" id="map3d"><div class="map-hint">🖱️ Тяни — вращать · колесо/щипок — масштаб</div></div>
    ${done === 12 ? `<a href="#exam" class="card exam-banner row between" style="margin-top:16px;text-decoration:none"><div><b style="font-size:1.2rem">🏛️ Экзамен Академии открыт!</b><div style="opacity:.8">24 вопроса на время — и ты выпускник</div></div><span class="btn">Сдать →</span></a>` : `<div class="card flat row between" style="margin-top:16px"><div><b>🏛️ Экзамен Академии</b><div class="muted small">Откроется после прохождения всех 12 факультетов (${done}/12)</div></div><div class="progress" style="width:160px"><i style="width:${done / 12 * 100}%;background:var(--accent)"></i></div></div>`}
    <h2 style="margin-top:28px">Все факультеты</h2>
    <div class="grid g3">${FACULTIES.map(f => { const s = Store.fac(f.id); return `<a class="bld-card" style="--fc:${f.color}" href="#fac-${f.id}"><div class="ic">${f.icon}</div><div style="flex:1"><b>${f.name}</b><div class="muted small">«${f.game}»</div></div><div class="center">${starsHtml(s.stars)}<div class="muted small">${s.done ? 'пройден' : s.lesson ? 'в процессе' : 'новый'}</div></div></a>`; }).join('')}</div>
  </div>`;
  const c = typeof Campus !== 'undefined' && Campus.create($('#map3d'), { auto: false, labels: true, interactive: true, onPick: id => App.go(id === 'exam' ? '#exam' : '#fac-' + id) });
  if (c) App.onClean(() => c.dispose());
  else $('#map3d').innerHTML = `<div class="grid g4" style="padding:16px;overflow:auto;height:100%">${FACULTIES.map(f => `<a class="bld-card" style="--fc:${f.color}" href="#fac-${f.id}"><div class="ic">${f.icon}</div><b>${f.name}</b></a>`).join('')}</div>`;
};

/* ===== Факультет: Урок → Игра → Тест → Итоги ===== */
Pages.fac = (app, id) => {
  const f = FAC_BY_ID[id]; if (!f) return App.go('#map');
  const st = Store.fac(id);
  app.innerHTML = `<div class="container fac-page" style="--fc:${f.color}">
    <div class="fac-head"><a href="#map" class="btn ghost sm">← Карта</a><div class="fic">${f.icon}</div><div style="flex:1;min-width:200px"><div class="muted small">Факультет ${f.index} из 12</div><h1>${f.name} — «${f.game}»</h1></div><div id="fstars">${starsHtml(st.stars)}</div></div>
    <div class="stepper" id="stepper"></div><div id="stage"></div></div>`;
  const stage = $('#stage');
  const steps = [['lesson', '📖', 'Урок'], ['game', '🎮', 'Игра'], ['test', '📝', 'Тест'], ['sum', '🏅', 'Итоги']];
  const can = k => k === 'lesson' || (k === 'game' && st.lesson) || (k === 'test' && st.game) || (k === 'sum' && st.done);
  const isDone = k => (k === 'lesson' && st.lesson) || (k === 'game' && st.game) || (k === 'test' && st.done) || (k === 'sum' && st.done);
  let cur;
  const renderStepper = () => {
    $('#stepper').innerHTML = steps.map(([k, ic, n]) => `<button data-k="${k}" class="${k === cur ? 'cur' : isDone(k) ? 'done' : ''}" ${can(k) ? '' : 'disabled'}>${isDone(k) && k !== cur ? '✓' : ic} ${n}</button>`).join('');
    $$('#stepper button').forEach(b => b.onclick = () => go(b.dataset.k));
    $('#fstars').innerHTML = starsHtml(st.stars);
  };
  const go = k => { App.clean(); App.streak = 0; cur = k; renderStepper(); stage.innerHTML = ''; scrollTo({ top: 0, behavior: 'smooth' }); ({ lesson: showLesson, game: showGame, test: showTest, sum: showSum })[k](); };

  function showLesson() {
    let i = 0; const L = f.lesson;
    const wrap = h(`<div class="lesson">${f.timeline ? '<div class="tl" id="tl"></div>' : ''}<div id="lc"></div><div class="dots" id="dots"></div>
      <div class="row between"><button class="btn" id="prev">← Назад</button><span class="muted small">Свайп или <span class="kbd">←</span> <span class="kbd">→</span></span><button class="btn fc" id="next">Далее →</button></div></div>`);
    stage.appendChild(wrap);
    if (f.timeline) {
      $('#tl').innerHTML = L.map((c, k) => `<div class="tp" data-k="${k}"><i></i><span>${c[1].split(' — ')[0]}</span></div>`).join('');
      $$('#tl .tp').forEach(t => t.onclick = () => { const k = +t.dataset.k; const d = k > i ? 1 : -1; i = k; draw(d); });
    }
    const draw = (dir = 1) => {
      const c = L[i];
      const phrases = c[4] ? c[4].map(p => `<div class="phrase"><button class="say" data-say="${esc(p[0])}">🔊</button><div><b>${p[0]}</b><div class="muted small">${p[1]}</div></div></div>`).join('') : '';
      $('#lc').innerHTML = `<div class="lcard ${dir > 0 ? 'slide-l' : 'slide-r'}"><div class="muted small" style="position:relative;z-index:1">Карточка ${i + 1} из ${L.length}</div><div class="lic">${c[0]}</div><h2>${c[1]}</h2><div class="txt">${c[2]}</div>${phrases}<div class="ex"><b>${f.timeline ? '🌍' : '📌 Пример из жизни:'}</b> ${c[3]}</div></div>`;
      $$('#lc .say').forEach(b => b.onclick = () => speak(b.dataset.say));
      $('#dots').innerHTML = L.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
      $('#prev').disabled = i === 0; $('#next').textContent = i === L.length - 1 ? 'Урок пройден ✓' : 'Далее →';
      if (f.timeline) { $$('#tl .tp').forEach((t, k) => t.classList.toggle('on', k <= i)); const on = $$('#tl .tp')[i]; on && on.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }
      Sound.play('click');
    };
    const next = () => {
      if (i < L.length - 1) { i++; draw(1); return; }
      if (!st.lesson) { st.lesson = true; Store.d.stats.lessons++; Store.save(); App.addXP(20, 'урок пройден'); App.unlock('first'); }
      go('game');
    };
    const prev = () => { if (i > 0) { i--; draw(-1); } };
    $('#next').onclick = next; $('#prev').onclick = prev;
    App.listen(document, 'keydown', e => { if ($('.sheet-wrap')) return; if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); });
    let sx = null; const lc = $('#lc');
    lc.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lc.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) dx < 0 ? next() : prev(); sx = null; });
    draw(1);
  }

  function showGame() {
    const root = h('<div class="game-root fade-in"></div>'); stage.appendChild(root);
    const ctx = {
      fac: f, mistakes: 0, root,
      answer(ok, html, next, o = {}) { if (!ok) this.mistakes++; App.answer(ok, o.shake || root); App.feedback({ ok, title: o.title, html, onNext: next, btn: o.btn }); },
      done(text = 'Игра пройдена!') {
        const first = !st.game; st.game = true; st.gameMistakes = Math.min(this.mistakes, st.game && !first ? st.gameMistakes : 99); st.lastGameMistakes = this.mistakes; Store.save();
        if (first) { App.addXP(30, 'игра пройдена'); App.coins(5); }
        Sound.play('win'); Confetti.burst(90); renderStepper();
        if (!$('.done-bar', root)) UI.doneBar(root, text + ' Можно переходить к тесту.', 'К итоговому тесту →', () => go('test'));
        scrollTo({ top: 0, behavior: 'smooth' });
      },
      restart() { go('game'); }
    };
    if (st.game) UI.doneBar(root, 'Игра уже пройдена — можно сыграть ещё раз.', 'К итоговому тесту →', () => go('test'));
    const area = h('<div></div>'); root.appendChild(area);
    try { GAMES[f.id](area, ctx); } catch (e) { console.error(e); area.innerHTML = `<div class="card">Ошибка игры: ${esc(e.message)}</div>`; }
  }

  function showTest() {
    const intro = h(`<div class="q-wrap fade-in"><div class="card center" style="padding:32px"><div class="big-emoji">📝</div><h2>Итоговый тест</h2><p class="muted">5 вопросов. За 5/5 — 3 звезды, 4/5 — 2 звезды, 3/5 — 1 звезда.<br>После каждого ответа — разбор.</p><button class="btn fc lg" id="start">Начать тест</button></div></div>`);
    stage.appendChild(intro);
    $('#start').onclick = () => runQuiz(stage, f.test, { onFinish: res });
    function res({ score, time }) {
      const stars = score >= 5 ? 3 : score === 4 ? 2 : score === 3 ? 1 : 0;
      const firstPass = !st.done && stars > 0; const improved = stars > st.stars;
      if (stars > 0) {
        if (firstPass) { App.addXP(50, 'тест сдан'); App.coins(10 * stars); }
        else if (improved) { App.addXP(20, 'улучшен результат'); App.coins(5); }
        st.done = true; st.stars = Math.max(st.stars, stars); st.best = Math.max(st.best, score);
      }
      Store.save();
      if (stars === 3) App.unlock('fac_' + f.id);
      if (score === 5 && (st.lastGameMistakes === 0)) App.unlock('flawless');
      if (score === 5 && time < 40) App.unlock('speed');
      if (completedCount() === 12) App.unlock('allknow');
      if (stars > 0) { Sound.play('win'); Confetti.burst(stars * 70); }
      renderStepper();
      stage.innerHTML = `<div class="q-wrap"><div class="card center pop" style="padding:32px">
        <div class="result-stars">${[0, 1, 2].map(k => `<span class="${k < stars ? '' : 'off'}">⭐</span>`).join('')}</div>
        <h2>${stars === 3 ? 'Превосходно!' : stars === 2 ? 'Отлично!' : stars === 1 ? 'Неплохо!' : 'Попробуй ещё раз'}</h2>
        <p style="font-size:1.2rem">Результат: <b>${score} из 5</b> · ${Math.round(time)} сек</p>
        ${stars === 0 ? '<p class="muted">Нужно минимум 3 правильных ответа. Повтори урок — и всё получится!</p>' : ''}
        <div class="row" style="justify-content:center;margin-top:16px">
          ${stars > 0 ? '<button class="btn fc lg" id="toSum">Что ты узнал →</button>' : '<button class="btn fc" id="toLesson">📖 Повторить урок</button>'}
          <button class="btn" id="retry">↻ Пройти тест заново</button></div></div></div>`;
      $('#retry').onclick = () => go('test');
      const ts = $('#toSum'); if (ts) ts.onclick = () => go('sum');
      const tl = $('#toLesson'); if (tl) tl.onclick = () => go('lesson');
    }
  }

  function showSum() {
    const idx = FACULTIES.indexOf(f); const nextF = FACULTIES.slice(idx + 1).concat(FACULTIES.slice(0, idx)).find(x => !Store.fac(x.id).done);
    stage.innerHTML = `<div class="q-wrap fade-in"><div class="card" style="padding:28px">
      <div class="row between"><h2 style="margin:0">🎓 Что ты узнал</h2>${starsHtml(st.stars)}</div>
      <p class="muted">Эти выводы сохранены в твою <a href="#encyclopedia">Энциклопедию</a>.</p>
      ${f.takeaways.map(t => `<div class="take">${t}</div>`).join('')}
      <div class="card flat" style="margin-top:16px;background:var(--card2)"><b>💪 Ты теперь умеешь:</b> ${f.skill.toLowerCase()}.</div>
      ${st.stars === 3 ? `<p class="center" style="margin-top:16px">🏅 Значок «<b>${f.badge}</b>» получен!</p>` : '<p class="muted small center" style="margin-top:16px">Набери 5/5 в тесте, чтобы получить 3 звезды и значок факультета.</p>'}
      <div class="row" style="justify-content:center;margin-top:20px">
        <a class="btn" href="#map">🗺️ На карту</a>
        ${nextF ? `<a class="btn fc" href="#fac-${nextF.id}">Следующий: ${nextF.icon} ${nextF.name} →</a>` : completedCount() === 12 ? '<a class="btn primary" href="#exam">🏛️ К Экзамену Академии →</a>' : ''}
      </div></div></div>`;
  }

  go(!st.lesson ? 'lesson' : !st.game ? 'game' : !st.done ? 'test' : 'sum');
};

Pages.profile = (app) => {
  const d = Store.d, li = levelOf(d.xp), L = LEVELS[li], N = LEVELS[li + 1];
  const pct = N ? (d.xp - L.xp) / (N.xp - L.xp) * 100 : 100;
  const facts = FACULTIES.reduce((s, f) => s + (Store.fac(f.id).done ? f.lesson.length + f.takeaways.length : 0), 0);
  app.innerHTML = `<div class="container">
    <div class="card fade-in row" style="gap:24px;padding:28px">
      ${avatarHtml(d.avatar, 110)}
      <div style="flex:1;min-width:220px"><h1 style="margin:0">${esc(d.name)}</h1><div class="pill" style="margin:6px 0">🎖️ ${L.n}</div>
        <div class="row small muted" style="margin-bottom:6px"><span>${fmt(d.xp)} XP</span>${N ? `<span>· до «${N.n}» ${fmt(N.xp - d.xp)} XP</span>` : '<span>· максимальный уровень!</span>'}</div>
        <div class="progress" style="height:12px"><i style="width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--accent2))"></i></div></div>
      <a class="btn sm" href="#register">✏️ Изменить</a>
    </div>
    <div class="grid g4" style="margin-top:16px">
      <div class="card center"><div class="big-emoji" style="font-size:2rem">⭐</div><b style="font-size:1.4rem">${fmt(d.xp)}</b><div class="muted small">опыт (XP)</div></div>
      <div class="card center"><div class="big-emoji" style="font-size:2rem">🪙</div><b style="font-size:1.4rem">${fmt(d.coins)}</b><div class="muted small">монеты</div></div>
      <div class="card center"><div class="big-emoji" style="font-size:2rem">🏛️</div><b style="font-size:1.4rem">${completedCount()}/12</b><div class="muted small">факультетов</div></div>
      <div class="card center"><div class="big-emoji" style="font-size:2rem">📚</div><b style="font-size:1.4rem">${facts}</b><div class="muted small">фактов изучено</div></div>
      <div class="card center"><div class="big-emoji" style="font-size:2rem">✅</div><b style="font-size:1.4rem">${d.stats.correct}</b><div class="muted small">верных ответов</div></div>
      <div class="card center"><div class="big-emoji" style="font-size:2rem">🏅</div><b style="font-size:1.4rem">${d.badges.length}/${BADGES.length}</b><div class="muted small">значков</div></div>
    </div>
    <div class="card" style="margin-top:16px"><h2>🎖️ Уровни</h2><div class="row">${LEVELS.map((l, k) => `<span class="pill" style="${k <= li ? 'background:var(--accent);color:#fff;border-color:var(--accent)' : ''}">${k <= li ? '✓' : '🔒'} ${l.n} · ${l.xp}</span>`).join('')}</div></div>
    <div class="card" style="margin-top:16px"><h2>🏅 Значки</h2><div class="badges">${BADGES.map(b => `<div class="badge ${d.badges.includes(b.id) ? '' : 'locked'}"><div class="bi">${b.icon}</div><div class="bn">${b.name}</div><div class="bd">${b.desc}</div></div>`).join('')}</div></div>
    <div class="card" style="margin-top:16px"><h2>📈 Прогресс по факультетам</h2>
      <div class="col">${FACULTIES.map(f => { const s = Store.fac(f.id); const p = (s.lesson ? 1 : 0) + (s.game ? 1 : 0) + (s.done ? 1 : 0); return `<a href="#fac-${f.id}" class="row" style="text-decoration:none;--fc:${f.color}"><span style="width:28px;font-size:1.3rem">${f.icon}</span><span style="width:170px;font-weight:700">${f.name}</span><div class="progress" style="flex:1;min-width:80px"><i style="width:${p / 3 * 100}%"></i></div>${starsHtml(s.stars)}</a>`; }).join('')}</div></div>
    <div class="card" style="margin-top:16px"><h2>📜 Сертификат и экзамен</h2>
      ${d.grad ? `<p>Ты — выпускник Академии Жизни! 🎓</p><a class="btn primary" href="#grad">Открыть сертификат</a>` : `<p class="muted">Пройди все 12 факультетов (${completedCount()}/12) и сдай Экзамен Академии, чтобы получить сертификат.</p>${completedCount() === 12 ? '<a class="btn primary" href="#exam">🏛️ Сдать экзамен</a>' : ''}`}
    </div>
    <div class="card flat" style="margin-top:16px"><h3>⚙️ Настройки</h3><div class="row">
      <button class="btn sm" id="demo">🧪 Демо-режим: открыть все факультеты</button>
      <button class="btn sm bad" id="reset">🗑️ Сбросить прогресс</button></div>
      <p class="muted small">Демо-режим отмечает все факультеты пройденными на 2 звезды — удобно, чтобы показать экзамен и сертификат.</p></div>
  </div>`;
  $('#reset').onclick = () => { const m = App.modal(`<h2>Сбросить прогресс?</h2><p>Будут удалены XP, звёзды, значки и сертификат. Это нельзя отменить.</p><div class="row" style="justify-content:flex-end"><button class="btn" data-close>Отмена</button><button class="btn bad" id="doReset">Удалить прогресс</button></div>`); $('#doReset', m.el).onclick = () => { try { localStorage.removeItem(Store.key); } catch (e) { } Store.d = Store.defaults(); m.close(); App.go('#home'); App.route(); }; };
  $('#demo').onclick = () => { FACULTIES.forEach(f => { const s = Store.fac(f.id); if (!s.done) Object.assign(s, { lesson: true, game: true, done: true, stars: 2, best: 4 }); }); Store.d.xp = Math.max(Store.d.xp, 1500); Store.save(); App.toast('🧪 Все факультеты открыты'); App.route(); };
};

Pages.encyclopedia = (app) => {
  app.innerHTML = `<div class="container"><h1 class="display" style="font-size:1.6rem">📚 Энциклопедия</h1>
    <p class="muted">Все правила и выводы, которые ты открыл. Закрытые разделы откроются после прохождения факультета.</p>
    <input type="text" id="q" placeholder="🔍 Поиск по правилам…" style="margin:8px 0 20px">
    <div class="grid g2" id="encList"></div></div>`;
  const draw = (q = '') => {
    q = q.toLowerCase();
    $('#encList').innerHTML = FACULTIES.map(f => {
      const open = Store.fac(f.id).done;
      const rules = f.lesson.filter(c => !q || (c[1] + c[2]).toLowerCase().includes(q));
      const tk = f.takeaways.filter(t => !q || t.toLowerCase().includes(q));
      if (q && open && !rules.length && !tk.length) return '';
      return `<div class="card enc ${open ? '' : 'locked'}" style="--fc:${f.color}">
        <h3><span>${f.icon}</span>${f.name} ${open ? starsHtml(Store.fac(f.id).stars) : '🔒'}</h3>
        ${open ? '' : `<div class="lock"><div>🔒<br>Пройди факультет «${f.name}»,<br>чтобы открыть раздел<br><a class="btn sm fc" style="margin-top:8px" href="#fac-${f.id}">Перейти</a></div></div>`}
        <div class="enc-body"><div class="tag">Главные выводы</div>${tk.map(t => `<div class="take" style="margin-top:8px">${t}</div>`).join('')}
        <div class="tag" style="margin-top:12px">Правила урока</div>${rules.map(c => `<div class="rule"><b>${c[0]} ${c[1]}</b><div class="small">${c[2]}</div></div>`).join('')}</div></div>`;
    }).join('');
  };
  draw(); $('#q').oninput = e => draw(e.target.value);
};

Pages.leaders = (app) => {
  const me = Store.d.name ? [[Store.d.name, Store.d.avatar, Store.d.xp, true]] : [];
  const rows = DEMO_PLAYERS.map(p => [...p, false]).concat(me).sort((a, b) => b[2] - a[2]);
  app.innerHTML = `<div class="container" style="max-width:720px"><h1 class="display" style="font-size:1.6rem">🏆 Таблица лидеров</h1><p class="muted">Рейтинг по опыту (XP). Обгони демо-игроков!</p>
    <div class="card">${rows.map((r, i) => `<div class="lb-row ${r[3] ? 'me' : ''}"><span class="pos">${['🥇', '🥈', '🥉'][i] || i + 1}</span>${avatarHtml(r[1], 40)}<b style="flex:1">${esc(r[0])}${r[3] ? ' <span class="muted">(ты)</span>' : ''}</b><span class="pill">🎖️ ${LEVELS[levelOf(r[2])].n}</span><b>${fmt(r[2])} XP</b></div>`).join('')}</div>
    ${Store.d.name ? '' : '<p class="center"><a class="btn primary" href="#register">Присоединиться</a></p>'}</div>`;
};

Pages.about = (app) => {
  app.innerHTML = `<div class="container" style="max-width:900px">
    <h1 class="display" style="font-size:1.8rem">О проекте «Академия Жизни»</h1>
    <div class="grid g2" style="margin-top:20px">
      <div class="card"><h2>❗ Проблема</h2><p>Школа учит формулам, но не учит распознавать мошенников, планировать бюджет, оказывать первую помощь, справляться со стрессом.</p></div>
      <div class="card"><h2>💡 Решение</h2><p>«Академия Жизни» — 12 игровых факультетов, каждый: урок → практика → разбор → тест.</p></div>
      <div class="card"><h2>👥 Для кого</h2><p>Подростки 12–18 лет, студенты, их родители; школы — как дополнение к урокам ОБЖ, обществознания, информатики.</p></div>
      <div class="card"><h2>⭐ Чем отличаемся</h2><p>Обучение через действие и последствия, а не через чтение; короткие сессии по 5 минут.</p></div>
    </div>
    <div class="card" style="margin-top:16px"><h2>🚀 Планы развития</h2><div class="grid g4">
      <div class="card flat center"><div class="big-emoji" style="font-size:2.2rem">📱</div><b>Мобильное приложение</b></div>
      <div class="card flat center"><div class="big-emoji" style="font-size:2.2rem">👩‍🏫</div><b>Режим для учителя</b><div class="muted small">класс и статистика</div></div>
      <div class="card flat center"><div class="big-emoji" style="font-size:2.2rem">🏛️</div><b>Новые факультеты</b></div>
      <div class="card flat center"><div class="big-emoji" style="font-size:2.2rem">🏆</div><b>Соревнования между школами</b></div></div></div>
    <div class="card" style="margin-top:16px"><h2>📊 В цифрах</h2><div class="grid g4 center">
      <div><div class="display" style="font-size:2rem;color:var(--accent)">12</div>факультетов</div>
      <div><div class="display" style="font-size:2rem;color:var(--accent)">${FACULTIES.reduce((s, f) => s + f.lesson.length, 0)}</div>карточек-правил</div>
      <div><div class="display" style="font-size:2rem;color:var(--accent)">25+</div>игр и мини-игр</div>
      <div><div class="display" style="font-size:2rem;color:var(--accent)">60</div>вопросов в тестах</div></div></div>
    <div class="card flat" style="margin-top:16px"><h3>🛠️ Технологии</h3><p class="muted">HTML, CSS, JavaScript, Three.js (3D-кампус и 3D-лабиринт), Web Audio API (звуки), Web Speech API (озвучка английского), Canvas (ПДД, сертификат). Работает без сервера, прогресс хранится в localStorage.</p></div>
    <p class="center" style="margin-top:24px"><a class="btn primary lg" href="${Store.d.name ? '#map' : '#register'}">Попробовать →</a></p></div>`;
};

/* ===== Финальный экзамен ===== */
Pages.exam = (app) => {
  if (completedCount() < 12) {
    app.innerHTML = `<div class="container" style="max-width:640px"><div class="card center" style="padding:32px"><div class="big-emoji">🔒</div><h2>Экзамен пока закрыт</h2><p class="muted">Пройди все 12 факультетов. Сейчас: ${completedCount()}/12.</p><a class="btn primary" href="#map">На карту</a></div></div>`; return;
  }
  app.innerHTML = `<div class="container" style="--fc:var(--accent)"><div class="q-wrap"><div class="card center" style="padding:32px" id="ex">
    <div class="big-emoji">🏛️</div><h1 class="display" style="font-size:1.6rem">Экзамен Академии</h1>
    <p class="muted">24 случайных вопроса — по 2 с каждого факультета. На всё — <b>6 минут</b>.<br>Чтобы стать выпускником, нужно ответить верно минимум на 16.</p>
    <button class="btn primary lg" id="go">Начать экзамен ⏱</button></div></div></div>`;
  $('#go').onclick = () => {
    const qs = shuffle(FACULTIES.flatMap(f => shuffle(f.test).slice(0, 2).map(q => Object.assign({}, q, { fac: f }))));
    runQuiz($('.q-wrap'), qs, {
      timeLimit: 360, onFinish: ({ score, total, time }) => {
        const pass = score >= 16;
        Store.d.exam = { score: Math.max(score, (Store.d.exam && Store.d.exam.score) || 0), total };
        if (pass) {
          if (!Store.d.grad) { Store.d.grad = { date: Date.now() }; App.addXP(200, 'экзамен сдан'); App.coins(100); }
          App.unlock('grad'); Store.save(); App.go('#grad'); return;
        }
        Store.save();
        $('.q-wrap').innerHTML = `<div class="card center pop" style="padding:32px"><div class="big-emoji">📚</div><h2>${score} из ${total}</h2><p>Для выпуска нужно минимум 16. Загляни в Энциклопедию и попробуй снова!</p><div class="row" style="justify-content:center"><a class="btn" href="#encyclopedia">📚 Энциклопедия</a><button class="btn primary" onclick="App.route()">↻ Пересдать</button></div></div>`;
      }
    });
  };
};

Pages.grad = (app) => {
  if (!Store.d.grad) { App.go('#exam'); return; }
  const d = Store.d; const date = fmtDate(d.grad.date);
  app.innerHTML = `<div class="container" style="max-width:900px">
    <div class="grad-caps">${['🎓', '🎓', '🎓', '🎓', '🎓'].map((c, i) => `<span style="animation-delay:${i * .15}s">${c}</span>`).join('')}</div>
    <h1 class="display center" style="font-size:clamp(1.6rem,4vw,2.4rem)">Поздравляем с выпуском, ${esc(d.name)}!</h1>
    <p class="center muted">Экзамен: ${d.exam ? d.exam.score + ' из ' + d.exam.total : '—'} · Звёзд: ${totalStars()}/36 · ${LEVELS[levelOf(d.xp)].n}</p>
    <canvas id="cert" class="cert-prev" width="1600" height="1130"></canvas>
    <div class="row" style="justify-content:center;margin:20px 0">
      <button class="btn primary lg" id="dl">⬇️ Скачать сертификат (PNG)</button><button class="btn lg" id="share">📤 Поделиться результатом</button></div>
    <p class="center muted small" style="margin-top:-8px">Если скачивание не началось — нажми на сертификат правой кнопкой (или удерживай на телефоне) и выбери «Сохранить изображение».</p>
    <div class="card"><h2>💪 Ты теперь умеешь</h2><div class="grid g2">${FACULTIES.map(f => `<div class="take" style="--fc:${f.color}"><span><b>${f.icon} ${f.name}:</b> ${f.skill.toLowerCase()}</span></div>`).join('')}</div></div></div>`;
  drawCert($('#cert'), d.name, date, totalStars());
  Sound.play('win'); Confetti.burst(220); App.timeout(() => Confetti.burst(160), 900);
  $('#dl').onclick = () => { const a = document.createElement('a'); a.download = 'Сертификат_Академия_Жизни.png'; a.href = $('#cert').toDataURL('image/png'); a.click(); };
  $('#share').onclick = () => {
    const txt = `🎓 Я окончил(а) «Академию Жизни»! ⭐ ${totalStars()}/36 звёзд, экзамен ${d.exam.score}/${d.exam.total}, уровень «${LEVELS[levelOf(d.xp)].n}». Теперь я умею распознавать мошенников, планировать бюджет, оказывать первую помощь и многое другое. Научись жить — играя!`;
    const done = () => App.toast('📋 Результат скопирован!');
    const manual = () => { const m = App.modal(`<h3>📤 Скопируй результат</h3><textarea id="shareTxt" rows="6" style="width:100%">${esc(txt)}</textarea><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn fc" data-close>Готово</button></div>`); const ta = $('#shareTxt', m.el); ta.focus(); ta.select(); };
    try { if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, manual); else manual(); } catch (e) { manual(); }
  };
};

function drawCert(cv, name, date, stars) {
  const x = cv.getContext('2d'), W = cv.width, H = cv.height;
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#f3ecff'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = '#6d5efc'; x.lineWidth = 14; x.strokeRect(40, 40, W - 80, H - 80);
  x.strokeStyle = '#d4a017'; x.lineWidth = 4; x.strokeRect(70, 70, W - 140, H - 140);
  x.textAlign = 'center'; x.fillStyle = '#1e1b4b';
  x.font = '120px serif'; x.fillText('🎓', W / 2, 230);
  x.font = '800 44px Manrope, sans-serif'; x.fillStyle = '#6d5efc'; x.fillText(T('СЕРТИФИКАТ'), W / 2, 310);
  x.font = '800 70px Unbounded, Manrope, sans-serif'; x.fillStyle = '#1e1b4b'; x.fillText(T('Выпускник Академии Жизни'), W / 2, 410);
  x.font = '500 34px Manrope, sans-serif'; x.fillStyle = '#475569'; x.fillText(T('Настоящим подтверждается, что'), W / 2, 500);
  x.font = '800 96px Manrope, sans-serif'; x.fillStyle = '#0f172a'; x.fillText(name, W / 2, 620);
  x.fillStyle = '#d4a017'; x.fillRect(W / 2 - 300, 650, 600, 4);
  x.font = '500 32px Manrope, sans-serif'; x.fillStyle = '#475569';
  x.fillText(T('успешно прошёл(а) все 12 факультетов и сдал(а) Экзамен Академии:'), W / 2, 720);
  x.font = '600 26px Manrope, sans-serif'; x.fillText(FACULTIES.slice(0, 6).map(f => T(f.name)).join(' · '), W / 2, 775);
  x.fillText(FACULTIES.slice(6).map(f => T(f.name)).join(' · '), W / 2, 815);
  x.font = '800 44px Manrope, sans-serif'; x.fillStyle = '#f59e0b'; x.fillText('★'.repeat(Math.min(12, Math.round(stars / 3))) + `  ${stars}/36`, W / 2, 900);
  x.font = '600 30px Manrope, sans-serif'; x.fillStyle = '#334155'; x.textAlign = 'left'; x.fillText(T('Дата: ') + date, 160, 1000);
  x.textAlign = 'right'; x.fillText(T('Ректор Академии Жизни'), W - 160, 1000);
  x.beginPath(); x.arc(W - 330, 940, 60, 0, Math.PI * 2); x.strokeStyle = '#6d5efc'; x.lineWidth = 5; x.stroke(); x.textAlign = 'center'; x.font = '800 22px Manrope'; x.fillStyle = '#6d5efc'; x.fillText(T('АЖ'), W - 330, 948);
}
