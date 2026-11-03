'use strict';
/* ================= 7. ЭКОЛОГИЯ — «Сортировка» ================= */
GAMES.eco = function (el, ctx) {
  const BINS = { plastic: ['🟡', 'Пластик', '#ca8a04'], paper: ['📘', 'Бумага', '#2563eb'], glass: ['🟢', 'Стекло', '#059669'], metal: ['⚙️', 'Металл', '#64748b'], organic: ['🍂', 'Органика', '#92400e'], hazard: ['☢️', 'Опасные', '#dc2626'], none: ['🗑️', 'Не перераб.', '#374151'] };
  const IT = [
    ['🧴', 'Бутылка из-под воды', 'plastic', 'ПЭТ-бутылка (маркировка 1) — принимают в переработку. Смять и снять крышку.'],
    ['📰', 'Газета', 'paper', 'Газеты — отличная макулатура.'],
    ['🥫', 'Банка из-под колы', 'metal', 'Алюминиевая банка — ценный металл, перерабатывается бесконечно.'],
    ['🫙', 'Стеклянная банка', 'glass', 'Стеклянная тара — в контейнер для стекла. Стекло разлагается тысячи лет.'],
    ['🍌', 'Банановая кожура', 'organic', 'Органика — можно компостировать.'],
    ['🔋', 'Батарейка', 'hazard', 'Батарейки — опасные отходы: одна может загрязнить около 20 м² земли. Только в спецбокс.'],
    ['🌡️', 'Ртутный градусник', 'hazard', 'Ртуть очень ядовита — градусники сдают в пункты приёма опасных отходов.'],
    ['💡', 'Энергосберегающая лампа', 'hazard', 'Внутри ртуть — сдавать в спецпункты, нельзя в обычный мусор.'],
    ['🧾', 'Чек из магазина', 'none', 'Чек из магазина — это термобумага, она не перерабатывается.'],
    ['🍕', 'Жирная коробка от пиццы', 'none', 'Жир портит макулатуру — такая коробка не перерабатывается. Чистую крышку можно оторвать и сдать.'],
    ['📦', 'Картонная коробка', 'paper', 'Картон — макулатура. Сложи коробку, чтобы занимала меньше места.'],
    ['🥛', 'Молочный пакет (тетрапак)', ['paper', 'none'], 'Тетрапак — многослойный (картон, пластик, фольга). Его принимают не везде: проверь свой пункт приёма.'],
    ['🔵', 'Крышка от бутылки', 'plastic', 'Крышки — пластик PP (5). Их часто сдают отдельно, например в благотворительные акции.'],
    ['☕', 'Стаканчик из-под кофе', 'none', 'Бумажный стаканчик покрыт плёнкой изнутри — смешанный материал, обычно не перерабатывается.'],
    ['📱', 'Старый телефон', 'hazard', 'Электроника — спецсбор: в ней есть токсичные вещества и ценные металлы.'],
    ['🍾', 'Стеклянная бутылка', 'glass', 'Стеклянная бутылка — в контейнер для стекла.'],
    ['🥚', 'Яичная скорлупа', 'organic', 'Скорлупа — органика, полезна для компоста.'],
    ['🍎', 'Огрызок яблока', 'organic', 'Пищевые отходы — органика.'],
    ['🧃', 'Пакет сока (тетрапак)', ['paper', 'none'], 'Тетрапак — многослойный, принимают не везде. Если в твоём пункте не берут — в общие отходы.'],
    ['📓', 'Старая тетрадь', 'paper', 'Тетради — макулатура (скрепки лучше снять).'],
    ['🥤', 'Пластиковый стаканчик (PS 6)', 'none', 'Полистирол (6) перерабатывается плохо — его почти нигде не принимают.'],
    ['🍴', 'Одноразовая вилка', 'none', 'Одноразовая посуда из смешанных материалов не перерабатывается. Лучше многоразовая (Reduce!).'],
    ['🧻', 'Грязная салфетка', 'none', 'Грязные салфетки не перерабатываются.'],
    ['🧴', 'Флакон шампуня (HDPE 2)', 'plastic', 'HDPE (2) — канистры и флаконы шампуня обычно принимают. Ополосни перед сдачей.'],
    ['🥡', 'Пластиковый контейнер (PP 5)', 'plastic', 'PP (5) — контейнеры обычно принимают в переработку.'],
    ['🛢️', 'Канистра (HDPE 2)', 'plastic', 'HDPE (2) — хорошо перерабатывается.'],
    ['🥫', 'Консервная банка', 'metal', 'Жестяная банка — металл. Ополосни её.'],
    ['🔩', 'Старые гвозди и шурупы', 'metal', 'Металлолом — в металл.'],
    ['🗝️', 'Старый ключ', 'metal', 'Металл — перерабатывается.'],
    ['🫖', 'Чайная заварка', 'organic', 'Органика — отлично подходит для компоста.'],
    ['🥔', 'Картофельные очистки', 'organic', 'Пищевые отходы — органика.'],
    ['💐', 'Увядшие цветы', 'organic', 'Растения — органика.'],
    ['🖨️', 'Картридж принтера', 'hazard', 'Картриджи содержат остатки тонера — спецсбор (их часто принимают в магазинах техники).'],
    ['💊', 'Просроченные лекарства', 'hazard', 'Лекарства — опасные отходы. В некоторых аптеках есть боксы для них.'],
    ['🎨', 'Банка из-под краски', 'hazard', 'Остатки краски токсичны — в пункт приёма опасных отходов.'],
    ['🪞', 'Разбитое зеркало', 'none', 'Зеркала и оконное стекло имеют другой состав, чем тара — с бутылками их не перерабатывают.'],
    ['🧸', 'Пластиковая игрушка', 'none', 'Игрушки из смешанных пластиков с металлом обычно не перерабатываются. Лучше отдать другому ребёнку (Reuse!).'],
    ['🪥', 'Зубная щётка', 'none', 'Щётка — смесь разных пластиков и нейлона, не перерабатывается.'],
    ['💿', 'CD-диск', 'none', 'Диски из поликарбоната с металлическим слоем — не перерабатываются обычным способом.'],
    ['🥚', 'Картонный лоток от яиц', 'paper', 'Картонный лоток — макулатура.'],
    ['🧊', 'Пенопласт', 'none', 'Пенопласт (PS 6) перерабатывается плохо.'],
    ['☕', 'Кофейная гуща', 'organic', 'Кофейная гуща — органика, отличное удобрение.'],
    ['🍽️', 'Разбитая керамическая тарелка', 'none', 'Керамика — не стекло! Она не плавится вместе со стеклом и портит партию.'],
    ['🔌', 'Старая зарядка', 'hazard', 'Электроника — спецсбор.'],
    ['🗞️', 'Журнал', 'paper', 'Журналы — макулатура.']
  ];
  UI.tabs(el, [{ label: '♻️ Сортировка', render: sort }, { label: '🏙️ Эко-город', render: city }]);

  function sort(box) {
    const queue = shuffle(IT).slice(0, 20);
    let lives = 3, combo = 0, score = 0, sorted = 0, paused = true, items = [], speed = 38, last = 0, spawned = 0, sel = null, over = false, mistakesList = [];
    box.innerHTML = `<div class="row between" style="margin-bottom:8px"><span class="pill" id="lv">❤️❤️❤️</span><span class="pill" id="sc">Очки: 0</span><span class="pill" id="cb">Комбо ×1</span><span class="pill" id="pr">0 / 20</span></div>
      <div class="eco-field" id="field"><div id="startMsg" style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:20px;z-index:5"><div><div class="big-emoji">♻️</div><p><b>Перетаскивай падающие предметы в нужный контейнер</b><br><span class="muted small">или нажми на предмет, а потом на контейнер</span></p><button class="btn fc lg" id="go">Начать</button></div></div></div>
      <div class="bins" id="bins">${Object.entries(BINS).map(([k, b]) => `<div class="bin" data-b="${k}" style="background:${b[2]}"><span class="be">${b[0]}</span>${b[1]}</div>`).join('')}</div>`;
    const field = $('#field', box);
    const hud = () => { $('#lv', box).textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives); $('#sc', box).textContent = 'Очки: ' + score; $('#cb', box).textContent = 'Комбо ×' + Math.max(1, combo); $('#pr', box).textContent = `${sorted} / 20`; };
    const spawn = () => {
      if (spawned >= queue.length) return; const d = queue[spawned++];
      const it = { d, y: -60, x: 70 + Math.random() * (field.clientWidth - 140), el: h(`<div class="falling"><span class="em">${d[0]}</span><span class="nm">${d[1]}</span></div>`) };
      field.appendChild(it.el); items.push(it); bindDrag(it);
    };
    const place = it => { it.el.style.left = it.x + 'px'; it.el.style.top = it.y + 'px'; };
    const remove = it => { it.el.remove(); items = items.filter(x => x !== it); if (sel === it) sel = null; };
    const pause = (html, ok, cb) => { paused = true; ctx.answer(ok, html, () => { if (lives <= 0 || over) return end(); paused = false; last = performance.now(); cb && cb(); }, { title: ok ? 'Верно!' : 'Ошибка сортировки', shake: field }); };
    const judge = (it, bin) => {
      const d = it.d, okBins = Array.isArray(d[2]) ? d[2] : [d[2]]; remove(it); sorted++;
      if (okBins.includes(bin)) {
        combo++; score += 10 * Math.max(1, Math.min(combo, 5)); Sound.play('ok'); App.streak++; Store.d.stats.correct++;
        if (combo % 5 === 0) { App.addXP(10, `комбо ×${combo}`); }
        if (Array.isArray(d[2])) pause(`<p><b>${d[1]}</b> → ${okBins.map(b => BINS[b][1]).join(' или ')}. ${d[3]}</p>`, true);
        hud(); checkEnd();
      } else { combo = 0; lives--; hud(); mistakesList.push(d); pause(`<p><b>${d[0]} ${d[1]}</b> → правильно: <b>${okBins.map(b => BINS[b][1]).join(' / ')}</b>.</p><p>${d[3]}</p>`, false, checkEnd); }
    };
    const checkEnd = () => { if (sorted >= queue.length && !paused) end(); else if (sorted >= queue.length) over = true; };
    const bindDrag = it => {
      let sx, sy, moved = 0, dragging = false;
      it.el.addEventListener('pointerdown', e => {
        if (paused) return; e.preventDefault(); dragging = true; moved = 0; sx = e.clientX; sy = e.clientY; it.drag = true; it.el.classList.add('dragging'); it.el.setPointerCapture(e.pointerId);
      });
      it.el.addEventListener('pointermove', e => {
        if (!dragging) return; const dx = e.clientX - sx, dy = e.clientY - sy; moved += Math.abs(dx) + Math.abs(dy); sx = e.clientX; sy = e.clientY;
        it.x += dx; it.y += dy; place(it);
        $$('.bin', box).forEach(b => { const r = b.getBoundingClientRect(); b.classList.toggle('hot', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom); });
      });
      it.el.addEventListener('pointerup', e => {
        if (!dragging) return; dragging = false; it.drag = false; it.el.classList.remove('dragging'); $$('.bin', box).forEach(b => b.classList.remove('hot'));
        if (moved < 8) { if (sel) sel.el.classList.remove('sel'); sel = it; it.el.classList.add('sel'); return; }
        const bin = $$('.bin', box).find(b => { const r = b.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; });
        if (bin) judge(it, bin.dataset.b); else { it.x = clamp(it.x, 55, field.clientWidth - 55); it.y = clamp(it.y, -20, field.clientHeight - 80); place(it); }
      });
    };
    $$('.bin', box).forEach(b => b.onclick = () => { if (sel && !paused) judge(sel, b.dataset.b); else if (!paused) App.toast('Сначала выбери падающий предмет'); });
    const loop = now => {
      if (!box.isConnected) return;
      if (!paused) {
        const dt = Math.min(.05, (now - last) / 1000); last = now;
        const maxOn = sorted < 6 ? 1 : 2;
        if (items.length < maxOn && spawned < queue.length && (items.length === 0 || items[items.length - 1].y > 150)) spawn();
        speed = 38 + sorted * 3.2;
        items.slice().forEach(it => { if (it.drag) return; it.y += speed * dt * (sel === it ? .35 : 1); place(it); if (it.y > field.clientHeight - 60) { remove(it); sorted++; lives--; combo = 0; hud(); const okb = Array.isArray(it.d[2]) ? it.d[2] : [it.d[2]]; mistakesList.push(it.d); pause(`<p>⬇️ <b>${it.d[1]}</b> упал(а) мимо! Правильный контейнер: <b>${okb.map(b => BINS[b][1]).join(' / ')}</b>.</p><p>${it.d[3]}</p>`, false, checkEnd); } });
      }
      requestAnimationFrame(loop);
    };
    $('#go', box).onclick = () => { $('#startMsg', box).remove(); paused = false; last = performance.now(); requestAnimationFrame(loop); };
    const end = () => {
      if (box.dataset.ended) return; box.dataset.ended = 1; paused = true; items.forEach(i => i.el.remove());
      const win = lives > 0;
      box.innerHTML = `<div class="q-wrap"><div class="card center pop"><div class="big-emoji">${win ? '🌍' : '🗑️'}</div><h2>${win ? 'Отличная сортировка!' : 'Жизни закончились'}</h2><p>Очки: <b>${score}</b> · Отсортировано: ${sorted} · Ошибок: ${mistakesList.length}</p>
        ${mistakesList.length ? `<div style="text-align:left"><b>Запомни:</b>${mistakesList.map(d => `<div class="take">${d[0]} ${d[1]} → ${(Array.isArray(d[2]) ? d[2] : [d[2]]).map(b => BINS[b][1]).join(' / ')}</div>`).join('')}</div>` : ''}
        <button class="btn" id="ag">↻ Играть ещё</button></div></div>`;
      $('#ag', box).onclick = () => sort(box);
      if (win || sorted >= 10) ctx.done('Сортировка пройдена!');
    };
    hud();
  }

  function city(box) {
    const D = [
      ['♻️', 'Во дворах один общий мусорный бак. Что сделать?', ['Поставить контейнеры для раздельного сбора', -12, 'Раздельный сбор позволяет отправлять пластик, бумагу и стекло на переработку вместо свалки.'], ['Оставить как есть', 3, 'Всё уходит на свалку, а пластиковая бутылка разлагается до 450 лет.']],
      ['🚲', 'Жители просят велодорожки.', ['Построить сеть велодорожек', -8, 'Велосипед не загрязняет воздух, а жители становятся здоровее.'], ['Лучше расширить дорогу для машин', 8, 'Больше дорог — больше машин и выхлопов.']],
      ['🌳', 'В центре большой пустырь.', ['Посадить парк', -10, 'Деревья очищают воздух, дают тень и место для отдыха.'], ['Построить парковку', 5, 'Ещё больше асфальта и машин.']],
      ['🔋', 'Жители выбрасывают батарейки в обычный мусор.', ['Поставить боксы для батареек в магазинах и школах', -6, 'Одна батарейка может загрязнить около 20 м² земли. Боксы решают проблему.'], ['Не тратить на это деньги', 4, 'Тяжёлые металлы из батареек попадают в почву и воду.']],
      ['🏭', 'Завод сбрасывает отходы в реку.', ['Выписать штраф и обязать поставить фильтры', -12, 'Очистные фильтры защищают реку и здоровье жителей.'], ['Закрыть глаза — завод платит налоги', 10, 'Отравленная река — это болезни и гибель рыбы.']],
      ['🚌', 'Пора обновлять городские автобусы.', ['Закупить электробусы', -9, 'Электробусы не дают выхлопов на улицах города.'], ['Купить дешёвые старые дизельные', 5, 'Старые дизели сильно загрязняют воздух.']],
      ['🛍️', 'В магазинах раздают бесплатные пакеты.', ['Раздать многоразовые сумки и ввести плату за пакеты', -5, 'Reduce — меньше потреблять — самое важное из правила 3R.'], ['Пусть раздают дальше', 3, 'Тысячи пакетов в день оказываются на свалке и в природе.']],
      ['🗑️', 'Городская свалка переполнена.', ['Построить сортировочную станцию', -10, 'Сортировка отправляет ценное сырьё на переработку, а на свалку — только остатки.'], ['Сжигать мусор без фильтров', 9, 'Сжигание без фильтров выбрасывает в воздух токсичный дым.']],
      ['💧', 'Город тратит слишком много воды.', ['Счётчики воды и кампания «Закрой кран, пока чистишь зубы»', -4, 'Закрытый кран экономит до 10–12 литров за раз.'], ['Ничего не делать', 2, 'Вода — ограниченный ресурс, а её очистка требует энергии.']],
      ['🏫', 'Школы предлагают эко-уроки и субботники.', ['Поддержать и выделить деньги', -6, 'Экологическая грамотность с детства меняет привычки всего города.'], ['Отказать — не до этого', 2, 'Без знаний люди продолжают сорить и не сортируют мусор.']]
    ];
    let i = 0, pol = 75; const icons = { trees: 1, bikes: 0, bins: 0, cars: 4, fact: 2 };
    const scene = () => `<div class="city"><div class="smog" style="opacity:${pol / 110}"></div><span style="position:absolute;top:10px;right:14px;font-size:2rem">${pol < 40 ? '☀️' : pol < 65 ? '🌤️' : '🌫️'}</span>${'🏭'.repeat(icons.fact)}${'🏢🏠'}${'🌳'.repeat(icons.trees)}${'🚗'.repeat(icons.cars)}${'🚲'.repeat(icons.bikes)}${'♻️'.repeat(icons.bins)}</div>
      <div class="stat" style="margin:12px 0"><div class="lbl"><span>🌫️ Уровень загрязнения</span><span>${pol}%</span></div><div class="bar"><i style="width:${pol}%;background:${pol > 60 ? '#ef4444' : pol > 35 ? '#f59e0b' : '#22c55e'}"></i></div></div>`;
    const show = () => {
      if (i >= D.length) {
        const good = pol < 35; box.innerHTML = scene() + `<div class="card center pop"><h2>${good ? '🌿 Зелёный город!' : pol < 60 ? '🙂 Город стал чище' : '😷 Город задыхается'}</h2><p>Итоговое загрязнение: <b>${pol}%</b> (было 75%).</p><p class="muted">Каждое решение мэра — это тысячи людей. А в своей жизни мэр — это ты: сортируй, экономь воду, выбирай многоразовое.</p><button class="btn" id="ag">↻ Ещё раз</button></div>`;
        $('#ag', box).onclick = () => city(box); return;
      }
      const [ic, q, a, b] = D[i];
      box.innerHTML = scene(); const w = h('<div></div>'); box.appendChild(w);
      UI.choice(w, { head: `<div class="row between"><b>Решение мэра ${i + 1} из ${D.length}</b><span style="font-size:2rem">${ic}</span></div>`, q, opts: [{ t: a[0], ok: true, why: a[2], d: a[1] }, { t: b[0], why: b[2], d: b[1] }], ctx, onDone: (ok, o) => {
        pol = clamp(pol + o.d, 0, 100);
        if (ok) { if (i === 1) icons.bikes += 3; if (i === 2) icons.trees += 3; if (i === 0 || i === 7) icons.bins += 1; if (i === 4) icons.fact = Math.max(1, icons.fact - 1); if (i === 5) icons.cars = Math.max(1, icons.cars - 1); }
        else { if (i === 1) icons.cars += 2; if (i === 2) icons.cars += 1; if (i === 4 || i === 7) icons.fact += 1; }
        i++; show();
      } });
    };
    show();
  }
};

/* ================= 8. ЭМОЦИИ — «Помоги другу» ================= */
GAMES.emotions = function (el, ctx) {
  const R = (t, d, reply, why) => ({ t, d, reply, why });
  const P = [
    { name: 'Лиза', av: '👧', story: 'Боится завтрашнего экзамена и не может уснуть', msgs: ['Привет… Завтра экзамен по математике, а я не могу уснуть. Кажется, я всё забуду и провалюсь 😰'], rounds: [
      [R('Похоже, ты очень волнуешься — это нормально перед экзаменом. Хочешь, расскажу про дыхание 4-7-8?', 25, 'Да… давай. Мне правда страшно.', 'Ты назвал эмоцию, показал, что она нормальна, и предложил конкретную технику.'), R('Да не парься, это всего лишь экзамен', -10, 'Тебе легко говорить…', '«Не парься» обесценивает чувства: тревога не уходит, а человеку становится ещё и стыдно.'), R('Я вот тоже ничего не учил, вообще жесть будет', -5, 'Мне от этого не легче 😕', 'Разговор ушёл на тебя, а Лизе нужна поддержка.')],
      [R('Вдох на 4, задержка на 7, выдох на 8. И убери телефон — до сна час. Ты готовилась, ты справишься!', 20, 'Спасибо! Уже спокойнее 💜 Пойду спать.', 'Дыхание 4-7-8 успокаивает за 1–2 минуты, а сон помогает памяти.'), R('Посиди ещё ночь и выучи всё заново', -15, 'Я тогда вообще не высплюсь…', 'Недосып ухудшает память — ночная зубрёжка перед экзаменом вредит.'), R('Выпей энергетик, чтобы не спать', -20, '…Это точно хорошая идея?', 'Энергетики усиливают тревогу и мешают уснуть.')]], mid: 'Ещё что-нибудь посоветуешь?' },
    { name: 'Тимур', av: '👦', story: 'Поссорился с лучшим другом из-за игры', msgs: ['Артём меня выбесил! Слил катку и ещё на меня наорал. Больше с ним не общаюсь!!! 😡'], rounds: [
      [R('Звучит так, будто ты очень разозлился. Что случилось?', 25, 'Ну он ошибся, а потом сказал, что это я виноват. Обидно.', 'Активное слушание: назвать чувство и дать человеку выговориться.'), R('Правильно, он тебе не друг!', -10, 'Ну… вообще-то он мой лучший друг…', 'Подливать масла в огонь — не помощь. Ссора из-за игры не повод терять друга.'), R('Это же просто игра, чего ты', -10, 'Тебе не понять 😤', 'Обесценивание: для Тимура это важно.')],
      [R('Когда остынешь, скажи ему Я-сообщением: «Мне было обидно, когда ты сказал, что я виноват»', 20, 'Хм, попробую. Звучит лучше, чем «ты придурок» 😅', 'Я-сообщение говорит о твоих чувствах — человеку не нужно защищаться.'), R('Напиши ему всё, что о нём думаешь, прямо сейчас', -15, 'Боюсь, я наговорю лишнего…', 'На пике злости легко сказать то, о чём потом пожалеешь.'), R('Заблокируй его везде', -15, 'Ну это как-то слишком…', 'Блокировать друга из-за одной ссоры — слишком резко. Лучше поговорить.')]], mid: 'И что мне теперь делать?' },
    { name: 'Миша', av: '🧒', story: 'Новенький в классе сидит один на перемене', sys: 'Новенький Миша всю перемену сидит один и смотрит в телефон. Ты подходишь.', msgs: ['…Привет.'], rounds: [
      [R('Привет! Ты же новенький? Пойдём с нами в столовую?', 25, 'О… давай! Спасибо, я тут пока никого не знаю.', 'Простое приглашение — лучший способ помочь новенькому.'), R('Ты чего один сидишь, странный что ли?', -25, '…', 'Такой вопрос ранит и отталкивает.'), R('(Молча пройти мимо)', -10, '…', 'Новенькому сложно начать разговор первым — помочь можешь именно ты.')],
      [R('Понимаю, на новом месте всегда непросто. Хочешь, познакомлю с ребятами из нашего кружка?', 20, 'Было бы круто! 😊', 'Ты признал его чувства и предложил конкретную помощь.'), R('Да всем на тебя всё равно', -20, 'Ясно…', 'Это не поддержка, а обесценивание.'), R('Ну, у нас тут свои компании', -10, 'Понятно 😔', 'Звучит как закрытая дверь.')]], mid: 'А тут вообще нормально? Я переживаю, что не впишусь.' },
    { name: 'Саша', av: '🧑', story: 'Уже несколько недель ничего не хочется', msgs: ['Слушай… мне уже несколько недель ничего не хочется. Всё надоело, даже игры. Не знаю, зачем всё это.'], rounds: [
      [R('Спасибо, что рассказал. Мне важно, что с тобой. Расскажешь, что происходит?', 25, 'Да просто… сил нет. В школе всё плохо, дома тоже напряжённо.', 'Сначала — выслушать, не перебивая и не осуждая.'), R('Да ладно, взбодрись! Пойдём гулять, и всё пройдёт', -10, 'Не хочу. Ты не понимаешь.', 'Когда плохо несколько недель, «взбодрись» не помогает — это может быть серьёзно.'), R('У всех бывает, не ной', -25, '…Ладно, забудь.', 'Обесценивание может заставить человека закрыться — это опасно.')],
      [R('Я рядом. Но тебе важно поговорить со взрослым, которому доверяешь, или со школьным психологом. Есть телефон доверия 8-800-2000-122 — бесплатно и анонимно', 25, 'Спасибо… Может, правда позвоню. Хорошо, что ты есть.', 'Когда плохо долго — нужна помощь взрослого или специалиста. Телефон доверия для детей и подростков: 8-800-2000-122 (бесплатно, анонимно).'), R('Хорошо, никому не скажу, само пройдёт', -20, 'Ага…', 'Если человеку плохо несколько недель, молчать опасно. Важно мягко направить к взрослому или психологу.'), R('Тебе просто надо больше спать', -10, 'Если бы всё было так просто…', 'Сон важен, но здесь нужна поддержка специалиста.')]], mid: 'Не знаю, что делать. Только никому не говори, ладно?' },
    { name: 'Катя', av: '👩', story: 'Её высмеивают в общем чате', sys: 'В общем чате класса выложили мем с фото Кати. Все ставят 😂. Катя пишет тебе в личку.', msgs: ['Ты видел?.. Мне так стыдно, я не хочу завтра идти в школу 😭'], rounds: [
      [R('Видел. Это очень неприятно, и ты ни в чём не виновата. Я с тобой', 25, 'Спасибо… Я думала, все надо мной смеются.', 'Жертве травли важно знать, что она не одна.'), R('Да это же шутка, не обращай внимания', -15, 'Мне не смешно…', 'Травля — не шутка. Обесценивание делает только хуже.'), R('Ну, мем правда смешной 😂', -25, '…', 'Смеясь, ты присоединяешься к обидчикам.')],
      [R('Давай сохраним скриншоты и расскажем классному руководителю. Молчание помогает обидчику', 20, 'Хорошо. Вдвоём не так страшно.', 'Буллинг останавливают с помощью взрослых. Скриншоты — доказательства.'), R('Ответь им ещё обиднее', -15, 'Я не хочу становиться такой же…', 'Ответная агрессия только раскручивает конфликт.'), R('Просто терпи, само утихнет', -15, 'А если нет?..', 'Травля редко прекращается сама. Молчание помогает обидчику.')]], mid: 'Что мне делать?' },
    { name: 'Даня', av: '👶', story: 'Младший брат злится, что проиграл, и кричит', sys: 'Младший брат Даня проиграл в настольную игру, кричит и швыряет фишки.', msgs: ['ЭТО НЕЧЕСТНО!!! Я БОЛЬШЕ НИКОГДА НЕ БУДУ ИГРАТЬ!!!'], rounds: [
      [R('Ты очень злишься, потому что проиграл. Это обидно, я понимаю', 25, '…Да. Я так старался!', 'Назвать эмоцию за человека — значит снизить её силу.'), R('Хватит орать! Ты как маленький', -20, 'Я НЕ МАЛЕНЬКИЙ!!!', 'Крик в ответ на крик только разжигает злость.'), R('Ха-ха, проиграл!', -25, '😭😭😭', 'Насмешка унижает.')],
      [R('Давай подышим вместе: вдох на 4, задержка на 7, выдох на 8. Злиться можно, а бросать вещи — нет', 20, 'Ладно… Давай ещё партию?', 'Все эмоции нормальны — важно выражать их без вреда себе и другим.'), R('Разбрасывай, мне всё равно', -10, 'Ну ок… (фишки летят под диван)', 'Важно учиться выражать злость без вреда.'), R('Иди в свою комнату и не выходи', -10, 'Ну и пожалуйста!', 'Наказание без объяснений не учит справляться с эмоциями.')]], mid: 'А что делать, если хочется всё разбросать?' },
    { name: 'Ты сам', av: '🪞', story: 'Получил плохую оценку и злишься на себя', sys: 'Ты получил двойку за контрольную. Внутри всё кипит. Как ты поговоришь с собой?', msgs: ['Ну всё. Двойка. Ты ничего не можешь…'], rounds: [
      [R('Стоп. Я злюсь и расстроен — это нормально. Одна оценка не определяет меня', 25, 'Хм… Да, это просто одна контрольная.', 'Назвать эмоцию и не обобщать — первый шаг к спокойствию.'), R('Да, я тупой, у меня никогда ничего не получится', -25, 'Вот и не пытайся…', 'Жёсткая самокритика отнимает силы и не помогает.'), R('Плевать, учиться вообще не нужно', -10, 'Но ведь неприятно же…', 'Отрицание не убирает эмоцию, а прячет её.')],
      [R('Подышу 4-7-8, потом разберу ошибки и спрошу учителя, как исправить', 20, 'Вот это план! 💪', 'Сначала успокоиться, потом действовать — лучшая стратегия.'), R('Спрячу дневник от родителей', -15, 'А если узнают — будет хуже…', 'Скрывать проблемы — значит копить их.'), R('Весь вечер буду себя ругать', -15, 'Легче не стало…', 'Самобичевание не исправляет ситуацию.')]], mid: 'И что теперь?' },
    { name: 'Гоша', av: '🧑‍🎤', story: 'Просит списать, а ты не хочешь', msgs: ['Дай списать домашку по физике, а? Очень надо, плиз 🙏'], rounds: [
      [R('Слушай, не хочу давать списывать. Но могу объяснить задачу на перемене', 25, 'Ну… ладно, объяснишь. Спасибо!', 'Вежливое «нет» + альтернатива: ты сохранил границы и помог по-настоящему.'), R('Ладно, держи… (хотя не хочется)', -10, 'Спасибо! Буду каждый день просить 😎', 'Соглашаясь против воли, ты учишь других не считаться с твоими границами.'), R('Отвали, сам делай!', -15, 'Ну и ладно, жадина…', 'Отказать можно вежливо — без грубости.')],
      [R('Не жалко. Просто мне важно, чтобы было честно. Помочь разобраться — пожалуйста', 20, 'Окей, уважаю. Давай на перемене?', 'Я-сообщение о своих ценностях — без обвинений.'), R('Ну ладно, бери…', -10, 'Изи 😏', 'Под давлением сдаваться не обязательно — «нет» можно спокойно повторить.'), R('Потому что ты лентяй', -15, 'Сам такой!', 'Обвинение превращает отказ в ссору.')]], mid: 'А чего ты не хочешь? Жалко, что ли?' }
  ];
  UI.tabs(el, [{ label: '💬 Помоги другу', render: chats }, { label: '🌬️ Дыхание 4-7-8', render: breath }, { label: '💬 Я-сообщение', render: imsg }, { label: '🎭 Угадай эмоцию', render: guess }]);

  function chats(box) {
    let pi = 0, results = [];
    const run = () => {
      if (pi >= P.length) {
        const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
        box.innerHTML = `<div class="q-wrap"><div class="card center pop"><div class="big-emoji">💜</div><h2>Ты помог всем друзьям!</h2><p>Среднее доверие: <b>${avg}%</b></p><div style="text-align:left">${P.map((p, k) => `<div class="row" style="padding:6px 0"><span style="font-size:1.6rem">${p.av}</span><b style="flex:1">${p.name}</b><div class="progress" style="width:120px"><i style="width:${results[k]}%"></i></div><span>${results[k]}%</span></div>`).join('')}</div><p class="muted small">Главное: выслушать, назвать чувства, предложить помощь. Телефон доверия: 8-800-2000-122.</p><button class="btn" id="ag">↻ Ещё раз</button></div></div>`;
        $('#ag', box).onclick = () => chats(box); ctx.done('Все друзья получили поддержку!'); return;
      }
      const p = P[pi]; let trust = 50, r = 0;
      box.innerHTML = `<div class="q-wrap"><div class="row between" style="margin-bottom:10px"><div class="row"><span style="font-size:2.4rem">${p.av}</span><div><b>${p.name}</b><div class="small muted">${p.story}</div></div></div><span class="pill">${pi + 1} / ${P.length}</span></div>
        <div class="stat" style="margin-bottom:10px"><div class="lbl"><span>🤝 Доверие</span><span id="tv">${trust}%</span></div><div class="bar"><i id="tb" style="width:${trust}%;background:var(--fc)"></i></div></div>
        <div class="chat" id="chat"></div><div class="opts" id="opts" style="margin-top:12px"></div></div>`;
      const chat = $('#chat', box);
      const add = (cls, html) => { const m = h(`<div class="msg ${cls}">${html}</div>`); chat.appendChild(m); chat.scrollTop = chat.scrollHeight; return m; };
      const typing = (text, cb) => { const t = add('them', '<span class="typing"><i></i><i></i><i></i></span>'); App.timeout(() => { t.innerHTML = text; Sound.play('tick'); chat.scrollTop = chat.scrollHeight; cb && cb(); }, 900); };
      const setT = v => { trust = clamp(v, 0, 100); $('#tv', box).textContent = trust + '%'; $('#tb', box).style.width = trust + '%'; };
      const ask = () => {
        const opts = shuffle(P[pi].rounds[r]);
        $('#opts', box).innerHTML = opts.map((o, k) => `<button class="opt" data-k="${k}">${o.t}</button>`).join('');
        $$('#opts .opt', box).forEach(b => b.onclick = () => {
          const o = opts[+b.dataset.k]; $('#opts', box).innerHTML = ''; add('me', o.t); setT(trust + o.d);
          const best = P[pi].rounds[r][0];
          typing(o.reply, () => {
            ctx.answer(o.d > 0, `<p>${o.why}</p>${o.d <= 0 ? `<p class="small">Лучше было бы: <b>«${best.t}»</b></p>` : ''}`, () => {
              r++;
              if (r < p.rounds.length) typing(p.mid, ask);
              else { results.push(trust); add('sys', `Доверие: ${trust}%`); App.timeout(() => { pi++; run(); }, 900); }
            }, { title: o.d > 0 ? 'Хорошая поддержка!' : 'Можно лучше' });
          });
        });
      };
      if (p.sys) add('sys', p.sys);
      let k = 0; const nextMsg = () => { if (k < p.msgs.length) typing(p.msgs[k++], nextMsg); else ask(); }; nextMsg();
    };
    run();
  }

  function breath(box) {
    box.innerHTML = `<div class="q-wrap"><div class="card center"><h2>🌬️ Дыхание 4-7-8</h2><p class="muted">Вдох через нос — 4 секунды, задержка — 7, медленный выдох через рот — 8. Сделаем 3 цикла.</p><div class="breath" id="ball">Готов?</div><div id="cyc" class="muted">Цикл 0 из 3</div><button class="btn fc lg" id="go" style="margin-top:12px">▶ Начать</button></div></div>`;
    const ball = $('#ball', box);
    $('#go', box).onclick = () => {
      $('#go', box).disabled = true; let c = 0;
      const phase = (txt, sec, scale, next) => { let t = sec; ball.style.transition = `transform ${sec}s ease-in-out`; ball.style.transform = `scale(${scale})`; const up = () => { ball.innerHTML = `${txt}<br><span style="font-size:2rem">${t}</span>`; }; up(); const iv = App.interval(() => { t--; if (t <= 0) { clearInterval(iv); next(); } else up(); }, 1000); };
      const cycle = () => { if (c >= 3) { ball.innerHTML = 'Готово 💜'; ball.style.transform = 'scale(.8)'; ctx.answer(true, '<p>Длинный выдох включает «тормоз» нервной системы. Используй 4-7-8 перед экзаменом, выступлением или когда злишься.</p>', null, { title: 'Ты спокоен 😌' }); $('#go', box).disabled = false; return; } c++; $('#cyc', box).textContent = `Цикл ${c} из 3`; phase('Вдох', 4, 1, () => phase('Задержка', 7, 1, () => phase('Выдох', 8, .55, cycle))); };
      cycle();
    };
  }

  function imsg(box) {
    const L = [
      ['«Ты вечно опаздываешь!»', 'Я расстраиваюсь, когда жду тебя, потому что не успеваю по своим делам', ['Ты никогда не ценишь моё время!', 'Ладно, опаздывай дальше, мне всё равно']],
      ['«Ты меня постоянно перебиваешь!»', 'Мне обидно, когда меня перебивают — я теряю мысль', ['Ты невоспитанный!', 'Замолчи и дай сказать!']],
      ['«Ты опять взял мои наушники без спроса!»', 'Я злюсь, когда мои вещи берут без спроса. Спроси меня, пожалуйста', ['Ты вор!', 'Ещё раз возьмёшь — пожалеешь']],
      ['«Ты никогда мне не помогаешь по дому!»', 'Мне тяжело, когда я убираюсь одна. Давай распределим дела?', ['Ты ленивый, как всегда!', 'Ну и сиди, я всё сама']],
      ['«Ты меня не слушаешь!»', 'Мне важно, чтобы ты меня услышал. Можешь отложить телефон на пару минут?', ['С тобой бесполезно разговаривать!', 'Тебе вообще на всех плевать']]
    ];
    let i = 0;
    const show = () => {
      if (i >= L.length) { box.innerHTML = `<div class="q-wrap"><div class="card center pop"><h2>💬 Формула Я-сообщения</h2><p style="font-size:1.1rem">«Я чувствую <b>[эмоция]</b>, когда <b>[ситуация]</b>, потому что <b>[причина]</b>. Мне бы хотелось <b>[просьба]</b>»</p><button class="btn" id="ag">↻ Ещё раз</button></div></div>`; $('#ag', box).onclick = () => imsg(box); return; }
      const [acc, good, bad] = L[i]; const w = h('<div class="q-wrap"></div>'); box.innerHTML = ''; box.appendChild(w);
      UI.choice(w, { head: `<div class="muted small">Фраза ${i + 1} из ${L.length} · Переделай обвинение в Я-сообщение</div>`, q: acc, opts: [{ t: good, ok: true, why: 'Это Я-сообщение: ты говоришь о своих чувствах и просьбе, а не обвиняешь.' }].concat(bad.map(b => ({ t: b, why: 'Это по-прежнему обвинение или угроза — человек начнёт защищаться.' }))), ctx, onDone: () => { i++; show(); } });
    };
    show();
  }

  function guess(box) {
    const E = ['Радость', 'Грусть', 'Злость', 'Страх', 'Тревога', 'Обида', 'Вина', 'Стыд'];
    const S = [['Тебя не позвали на день рождения, куда пошли все друзья.', 'Обида', 'Обида — когда нас обделили или отвергли люди, которые нам важны.'], ['Завтра выступление перед всей школой, и ты всё время об этом думаешь.', 'Тревога', 'Тревога — страх перед будущим событием. Поможет дыхание 4-7-8 или заземление 5-4-3-2-1.'], ['Кто-то сломал твой велосипед и просто ушёл.', 'Злость', 'Злость возникает, когда нарушают наши границы или поступают несправедливо.'], ['Ты выиграл олимпиаду, к которой долго готовился!', 'Радость', 'Радость — когда сбывается то, к чему стремился.'], ['Лучший друг переезжает в другой город.', 'Грусть', 'Грусть — эмоция потери. Её нормально проживать и говорить о ней.'], ['Поздно вечером в тёмном подъезде ты слышишь шорох.', 'Страх', 'Страх — реакция на опасность прямо сейчас. Он помогает быть осторожным.'], ['Ты случайно сломал вещь друга и не признался.', 'Вина', 'Вина — когда мы понимаем, что поступили плохо. Лучшее решение — признаться и исправить.'], ['Ты споткнулся и упал при всех в столовой.', 'Стыд', 'Стыд или смущение — когда кажется, что все смотрят и оценивают. Это проходит быстрее, чем кажется!']];
    const list = shuffle(S); let i = 0;
    const show = () => {
      if (i >= list.length) { box.innerHTML = `<div class="q-wrap"><div class="card center pop"><h2>🎭 Ты отлично разбираешься в эмоциях!</h2><p>Умение назвать эмоцию — уже половина дела: просто сказать себе «я злюсь» снижает её силу.</p><button class="btn" id="ag">↻ Ещё раз</button></div></div>`; $('#ag', box).onclick = () => guess(box); return; }
      const [s, e, why] = list[i]; const others = shuffle(E.filter(x => x !== e)).slice(0, 3);
      const w = h('<div class="q-wrap"></div>'); box.innerHTML = ''; box.appendChild(w);
      UI.choice(w, { head: `<div class="muted small">Ситуация ${i + 1} из ${list.length} · Какую эмоцию, скорее всего, чувствует человек?</div>`, q: s, opts: [{ t: e, ok: true }].concat(others.map(o => ({ t: o }))), explain: why, ctx, onDone: () => { i++; show(); } });
    };
    show();
  }
};

/* ================= 9. АНГЛИЙСКИЙ — «Турист» ================= */
GAMES.english = function (el, ctx) {
  const O = (en, kind, react, why) => ({ t: en, ok: kind === 'ok', kind, react, why });
  const LOC = [
    { icon: '✈️', name: 'Аэропорт Хитроу', turns: [
      { who: '👮', nm: 'Officer', line: 'Good morning! May I see your passport, please?', ru: 'Доброе утро! Можно ваш паспорт, пожалуйста?', o: [O('Yes, of course. Here you are.', 'ok', 'Thank you. Welcome to London!', 'Вежливо и по делу: «Да, конечно. Вот, пожалуйста».'), O('Take it.', 'rude', '…Thank you, I guess. 🤨', '«Take it» звучит как приказ. Без please и thank you — грубо.'), O('I would like a coffee, please.', 'wrong', 'Sir, this is passport control, not a café! 😅', 'Тебя просят показать паспорт, а ты заказываешь кофе.')] },
      { who: '🧑‍✈️', nm: 'Airport staff', line: 'Hello! Can I help you?', ru: 'Здравствуйте! Чем могу помочь?', o: [O('Excuse me, where is my gate? It’s B12.', 'ok', 'Gate B12 is straight on, then left.', '«Where is my gate?» — «Где мой выход на посадку?» Начинаем с «Excuse me».'), O('Gate. Now.', 'rude', 'Excuse me?! 😠', 'Без вежливых слов просьба звучит грубо.'), O('I have a reservation.', 'wrong', 'This is an airport, not a hotel! 🙂', '«Reservation» — бронь в отеле или ресторане.')] }] },
    { icon: '🚇', name: 'Метро', turns: [
      { who: '🧑‍💼', nm: 'Ticket officer', line: 'Where would you like to go?', ru: 'Куда вы хотите поехать?', o: [O('How can I get to the British Museum, please?', 'ok', 'Take the Central line to Tottenham Court Road.', '«How can I get to…?» — «Как добраться до…?»'), O('Museum. Fast.', 'rude', 'Well, aren’t you charming. 🙄', 'Звучит как команда, а не просьба.'), O('The bill, please.', 'wrong', 'The… bill? This is the Underground! 😂', '«The bill, please» — просьба принести счёт в кафе.')] },
      { who: '🧑‍💼', nm: 'Ticket officer', line: 'When you leave the station, go straight on and turn left.', ru: 'Когда выйдете со станции, идите прямо и поверните налево.', o: [O('Thank you very much!', 'ok', 'You’re welcome! Enjoy London!', 'Поблагодарить — обязательно. «You’re welcome» — «пожалуйста» в ответ.'), O('Whatever.', 'rude', 'Charming… 😒', '«Whatever» — «да без разницы», звучит пренебрежительно.'), O('So I turn right? Great!', 'wrong', 'No, LEFT! 😄', 'Left — налево, right — направо, straight on — прямо.')] }] },
    { icon: '🏨', name: 'Отель', turns: [
      { who: '💁‍♀️', nm: 'Receptionist', line: 'Good afternoon! How can I help you?', ru: 'Добрый день! Чем могу помочь?', o: [O('Hello! I have a reservation. My name is Alex.', 'ok', 'Welcome, Alex! Your room is 305.', '«I have a reservation» — «У меня бронь».'), O('Give me a room.', 'rude', 'Do you… have a reservation? 😬', 'Звучит как приказ. Лучше: «I have a reservation».'), O('Where is my gate?', 'wrong', 'Your gate? This is a hotel, darling! 🙃', 'Gate — выход на посадку в аэропорту.')] },
      { who: '💁‍♀️', nm: 'Receptionist', line: 'Here is your key. Anything else?', ru: 'Вот ваш ключ. Что-нибудь ещё?', o: [O('What time is check-out?', 'ok', 'Check-out is at 11 am.', '«What time is check-out?» — «Во сколько выезд?»'), O('No. Bye.', 'rude', 'Okay… have a nice day? 😐', 'Коротко и холодно — без thank you звучит невежливо.'), O('I need a doctor!', 'wrong', 'Oh my! Are you ill?! 😮', '«I need a doctor» — «Мне нужен врач». Ты просто хотел спросить про выезд.')] }] },
    { icon: '☕', name: 'Кафе', turns: [
      { who: '🧑‍🍳', nm: 'Waiter', line: 'Hi there! What can I get you?', ru: 'Привет! Что вам принести?', o: [O('Can I have a tea and a sandwich, please?', 'ok', 'Of course! Coming right up.', '«Can I have…, please?» — вежливая просьба «Можно мне…?»'), O('Tea. Sandwich.', 'rude', 'Please…? 🤨', 'Без please в Англии заказ звучит грубо.'), O('Where is the station?', 'wrong', 'Erm… do you want food or directions? 😅', 'Официант спрашивает про заказ, а не про дорогу.')] },
      { who: '🧑‍🍳', nm: 'Waiter', line: 'Is everything okay? Would you like anything else?', ru: 'Всё в порядке? Хотите что-нибудь ещё?', o: [O('No, thank you. The bill, please.', 'ok', 'Sure! That’s eight pounds fifty.', '«The bill, please» — «Счёт, пожалуйста».'), O('Money! Now!', 'rude', 'Are you robbing me?! 😱', 'Звучит как ограбление, а не просьба счёта 😄'), O('I have a reservation.', 'wrong', 'You’re already sitting here! 😂', 'Бронь нужна до того, как ты сел за столик.')] }] },
    { icon: '🏛️', name: 'Британский музей', turns: [
      { who: '🧑‍🏫', nm: 'Guide', line: 'The Egyptian gallery is on the second floor, turn right after the shop.', ru: 'Египетский зал на втором этаже, поверните направо после магазина.', fast: true, o: [O('Sorry, I don’t understand. Can you repeat, please?', 'ok', 'Of course! Second floor… turn right… after the shop.', '«I don’t understand. Can you repeat, please?» — переспросить вежливо — абсолютно нормально.'), O('What?! Speak normal!', 'rude', 'How rude! 😤', 'Резко и невежливо.'), O('Thank you, the bill, please.', 'wrong', 'Entry is free! No bill! 🙂', 'В музее не просят счёт.')] },
      { who: '🧑‍🏫', nm: 'Guide', line: 'Would you like a guide book? It’s five pounds.', ru: 'Хотите путеводитель? Он стоит пять фунтов.', o: [O('Yes, please. Here you are. Thank you!', 'ok', 'Thank you! Enjoy the museum!', 'Please и thank you — постоянно, это норма вежливости.'), O('Book. Free. Now.', 'rude', 'I’m afraid it’s not free… 😑', 'Команды вместо просьб звучат грубо.'), O('What time is check-out?', 'wrong', 'This is a museum, not a hotel! 😆', 'Check-out — выезд из отеля.')] }] },
    { icon: '💊', name: 'Аптека', turns: [
      { who: '👩‍⚕️', nm: 'Pharmacist', line: 'Hello! What’s wrong?', ru: 'Здравствуйте! Что случилось?', o: [O('I have a headache. Can I have some medicine, please?', 'ok', 'Of course. Take one tablet with water.', '«I have a headache» — «У меня болит голова».'), O('Medicine. Give.', 'rude', 'Please…? 🙄', 'Снова без please — звучит как приказ.'), O('Where is my gate?', 'wrong', 'This is a pharmacy, not an airport! 😄', 'Ответ не по смыслу.')] },
      { who: '🧓', nm: 'Passer-by', line: 'Oh no! That man has fallen down! He isn’t moving!', ru: 'О нет! Этот мужчина упал! Он не двигается!', o: [O('Help! I need a doctor! Please call an ambulance!', 'ok', 'I’m calling 999 now!', '«Help! I need a doctor!» В Великобритании экстренный номер — 999, но 112 тоже работает.'), O('Not my problem.', 'rude', 'How can you say that?! 😠', 'В экстренной ситуации важно позвать на помощь.'), O('How much is it?', 'wrong', 'What?! This is an emergency! 😱', '«How much is it?» — «Сколько стоит?» — совсем не к месту.')] }] }
  ];
  UI.tabs(el, [{ label: '🇬🇧 Турист в Лондоне', render: trip }, { label: '🧩 Собери фразу', render: build }, { label: '📇 Словарь путешественника', render: dict }]);

  function trip(box) {
    let li = 0, ti = 0, score = 0;
    const show = () => {
      if (li >= LOC.length) {
        box.innerHTML = `<div class="q-wrap"><div class="card center pop"><div class="big-emoji">🇬🇧</div><h2>Ты прошёл весь Лондон!</h2><p>Верных ответов: <b>${score} из 12</b></p><p class="muted">Главный секрет: <b>please</b> и <b>thank you</b> — всегда!</p><button class="btn" id="ag">↻ Ещё раз</button></div></div>`;
        $('#ag', box).onclick = () => trip(box); ctx.done('Путешествие завершено!'); return;
      }
      const L = LOC[li], T = L.turns[ti]; const opts = shuffle(T.o);
      box.innerHTML = `<div class="q-wrap"><div class="row" style="gap:6px;margin-bottom:12px;flex-wrap:nowrap;overflow-x:auto">${LOC.map((l, k) => `<span class="pill" style="${k === li ? 'background:var(--fc);color:#fff;border-color:var(--fc)' : k < li ? '' : 'opacity:.5'}">${k < li ? '✓' : l.icon} ${l.name}</span>`).join('')}</div>
        <div class="q-card"><div class="row"><div style="font-size:3.4rem">${T.who}</div><div style="flex:1"><div class="small muted">${L.icon} ${L.name} · ${T.nm}</div><div class="msg them" style="max-width:100%;font-size:1.15rem;margin-top:6px"><b>${T.line}</b></div>
          <div class="row" style="margin-top:8px"><button class="btn sm" id="say">🔊 Прослушать</button><button class="btn sm ghost" id="tr">🇷🇺 Перевод</button></div><div class="small muted hidden" id="ru" style="margin-top:6px">${T.ru}</div></div></div>
          <p style="margin:16px 0 8px"><b>Что ответишь?</b></p><div class="opts">${opts.map((o, k) => `<div class="row" style="gap:6px;flex-wrap:nowrap"><button class="opt" style="flex:1" data-k="${k}">${o.t}</button><button class="say" data-s="${k}" title="Прослушать">🔊</button></div>`).join('')}</div></div></div>`;
      speak(T.line);
      $('#say', box).onclick = () => speak(T.line); $('#tr', box).onclick = () => $('#ru', box).classList.toggle('hidden');
      $$('[data-s]', box).forEach(b => b.onclick = () => speak(opts[+b.dataset.s].t));
      $$('.opt', box).forEach(b => b.onclick = () => {
        const o = opts[+b.dataset.k]; $$('.opt', box).forEach((x, k) => { x.disabled = true; if (opts[k].ok) x.classList.add('correct'); }); if (!o.ok) b.classList.add('wrong'); if (o.ok) score++;
        speak(o.t); App.timeout(() => speak(o.react), 1400);
        const right = T.o[0];
        ctx.answer(o.ok, `<div class="msg them" style="max-width:100%;margin-bottom:10px">${T.who} <i>${o.react}</i></div><p>${o.why}</p>${o.ok ? '' : `<p>Правильно: <b>${right.t}</b> <span class="muted small">— ${right.why}</span></p>`}`, () => { ti++; if (ti >= L.turns.length) { ti = 0; li++; } show(); }, { title: o.ok ? 'Perfect! 👍' : o.kind === 'rude' ? 'Это грубо 😬' : 'Не по смыслу 🤔' });
      });
    };
    show();
  }

  function build(box) {
    const S = ['Can I have a coffee, please?', 'Where is the station?', 'How can I get to the museum?', 'I have a reservation.', 'The bill, please.', 'Can you repeat, please?', 'What time is check-out?', 'I need a doctor.', 'Where is my gate?', 'How much is it?'];
    const RU = ['Можно мне кофе?', 'Где станция?', 'Как добраться до музея?', 'У меня бронь.', 'Счёт, пожалуйста.', 'Повторите, пожалуйста.', 'Во сколько выезд?', 'Мне нужен врач.', 'Где мой выход на посадку?', 'Сколько стоит?'];
    const order = shuffle(S.map((s, i) => i)).slice(0, 6); let i = 0, score = 0;
    const show = () => {
      if (i >= order.length) { box.innerHTML = `<div class="q-wrap"><div class="card center pop"><h2>🧩 ${score} из ${order.length} фраз собрано без ошибок</h2><button class="btn" id="ag">↻ Ещё раз</button></div></div>`; $('#ag', box).onclick = () => build(box); return; }
      const k = order[i], words = S[k].split(' '); let pick = [];
      const pool = shuffle(words.map((w, j) => ({ w, j })));
      box.innerHTML = `<div class="q-wrap"><div class="q-card"><div class="muted small">Фраза ${i + 1} из ${order.length}</div><div class="q-text">🇷🇺 ${RU[k]}</div>
        <div id="ans" style="min-height:54px;padding:10px;border-radius:14px;border:2px dashed var(--border);display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px"></div>
        <div class="chips" id="pool">${pool.map((p, n) => `<button class="chip" data-n="${n}">${p.w}</button>`).join('')}</div>
        <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn sm" id="undo">↶ Стереть</button><button class="btn fc" id="chk">Проверить</button></div></div></div>`;
      const draw = () => { $('#ans', box).innerHTML = pick.map(n => `<span class="chip" style="cursor:default">${pool[n].w}</span>`).join(''); $$('#pool .chip', box).forEach(c => c.classList.toggle('used', pick.includes(+c.dataset.n))); };
      $$('#pool .chip', box).forEach(c => c.onclick = () => { pick.push(+c.dataset.n); Sound.play('click'); draw(); });
      $('#undo', box).onclick = () => { pick.pop(); draw(); };
      $('#chk', box).onclick = () => { if (pick.length < words.length) { App.toast('Используй все слова'); return; } const ans = pick.map(n => pool[n].w).join(' '); const ok = ans === S[k]; if (ok) score++; speak(S[k]); ctx.answer(ok, `<p>${ok ? '' : `Твой вариант: <s>${ans}</s><br>`}Правильно: <b>${S[k]}</b> — ${RU[k]}</p>`, () => { i++; show(); }); };
    };
    show();
  }

  function dict(box) {
    const cards = shuffle(FAC_BY_ID.english.lesson.flatMap(c => c[4] || [])); let i = 0, known = 0;
    const show = () => {
      if (i >= cards.length) { box.innerHTML = `<div class="q-wrap"><div class="card center pop"><h2>📇 Словарь пройден</h2><p>Знаю: <b>${known}</b> из ${cards.length}</p><button class="btn" id="ag">↻ Повторить</button></div></div>`; $('#ag', box).onclick = () => dict(box); if (known >= cards.length * .7 && !box.dataset.r) { box.dataset.r = 1; App.addXP(15, 'словарь'); } return; }
      const [en, ru] = cards[i]; let flipped = false;
      box.innerHTML = `<div class="q-wrap"><div class="muted small center">Карточка ${i + 1} из ${cards.length} · нажми на карточку, чтобы перевернуть</div>
        <div class="card center" id="fc" style="min-height:200px;display:grid;place-items:center;cursor:pointer;margin:10px 0;font-size:1.5rem;font-weight:800">${en}</div>
        <div class="row" style="justify-content:center"><button class="btn" id="sp">🔊</button><button class="btn bad" id="no">🔁 Повторить</button><button class="btn ok" id="yes">✅ Знаю</button></div></div>`;
      speak(en);
      $('#fc', box).onclick = () => { flipped = !flipped; $('#fc', box).innerHTML = flipped ? `<div><div class="muted small">${en}</div>${ru}</div>` : en; Sound.play('click'); };
      $('#sp', box).onclick = () => speak(en);
      $('#yes', box).onclick = () => { known++; i++; show(); };
      $('#no', box).onclick = () => { cards.push(cards[i]); i++; show(); };
    };
    show();
  }
};
