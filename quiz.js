/* =========================================================
   Rococo Mebell — Quiz JS
   ========================================================= */
(() => {

/* ── STATE ─────────────────────────────────────────────── */
const state = {
  kitchenStep:  0,
  wardrobeStep: 0,
  k: { type: null, shape: null, size: 4, sizeL: '', sizeD: '', sizeH: '', time: null, budget: 350000, name: '', phone: '' },
  w: { room: null, type: null, sizeL: '', sizeD: '', sizeH: '', style: null, time: null, name: '', phone: '' }
};

/* ── SCREEN NAVIGATION ──────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

window.goHome = function() {
  state.kitchenStep = 0;
  state.wardrobeStep = 0;
  showScreen('screen-landing');
};

/* ── LANDING ────────────────────────────────────────────── */
document.getElementById('btn-start').addEventListener('click', () => {
  showScreen('screen-product');
});

/* ── PRODUCT SELECTION ──────────────────────────────────── */
window.startKitchen = function() {
  state.kitchenStep = 0;
  state.k = { type: null, shape: null, size: 4, sizeL: '', sizeD: '', sizeH: '', time: null, budget: 350000, name: '', phone: '' };
  showScreen('screen-kitchen');
  renderKitchenStep(0);
};

window.startWardrobe = function() {
  state.wardrobeStep = 0;
  state.w = { room: null, type: null, sizeL: '', sizeD: '', sizeH: '', style: null, time: null, name: '', phone: '' };
  showScreen('screen-wardrobe');
  renderWardrobeStep(0);
};

/* ── RIPPLE ─────────────────────────────────────────────── */
document.addEventListener('click', e => {
  const t = e.target.closest('.opt-btn,.btn-next-quiz,.btn-submit-quiz,.product-card,.btn-start');
  if (!t) return;
  const rect = t.getBoundingClientRect();
  const r = document.createElement('span');
  r.className = 'ripple';
  const size = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
  t.style.position = 'relative'; t.style.overflow = 'hidden';
  t.appendChild(r);
  setTimeout(() => r.remove(), 650);
});

/* ── PHONE FORMAT ───────────────────────────────────────── */
function formatPhone(input) {
  let v = input.value.replace(/\D/g, '').slice(0, 11);
  if (v.startsWith('8')) v = '7' + v.slice(1);
  let out = '+7';
  if (v.length > 1) out += ' (' + v.slice(1, 4);
  if (v.length >= 5) out += ') ' + v.slice(4, 7);
  if (v.length >= 8) out += '-' + v.slice(7, 9);
  if (v.length >= 10) out += '-' + v.slice(9, 11);
  input.value = out;
  return v;
}

const fmtRub = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

/* ── HTML BUILDERS ──────────────────────────────────────── */
function buildOfferCard(beaver, offerText, offerSub) {
  return `
    <div class="offer-card">
      <div class="beaver-wrap"><img src="images/${beaver}" alt="Бобёр Rococo" /></div>
      <div class="offer-text">${offerText}</div>
      ${offerSub ? `<div class="offer-sub">${offerSub}</div>` : ''}
    </div>`;
}

function buildOptions(opts, key, selectedVal, product) {
  return opts.map(o => `
    <button class="opt-btn${selectedVal === o.val ? ' selected' : ''}"
      data-key="${key}" data-val="${o.val}" data-product="${product}">
      ${o.label}
    </button>`).join('');
}

/* ── OPTION CLICK DELEGATION ────────────────────────────── */
document.addEventListener('click', e => {
  const btn = e.target.closest('.opt-btn[data-product]');
  if (!btn) return;
  const { key, val, product } = btn.dataset;

  // deselect siblings
  btn.closest('.options-grid').querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  if (product === 'k') { state.k[key] = val; refreshKitchenNext(); }
  if (product === 'w') { state.w[key] = val; refreshWardrobeNext(); }
});

/* ═══════════════════════════════════════════════════════════
   KITCHEN QUIZ
   ═══════════════════════════════════════════════════════════ */

const kitchenSteps = [
  {
    label: 'Шаг 1 — Стиль кухни',
    title: 'Какой тип кухни вас интересует?',
    hint: 'Выберите стиль — мы подберём идеальные фасады и фурнитуру.',
    beaver: 'beaver_2.png',
    offer: 'Если вы ещё не знаете что выбрать — мы поможем подобрать идеальный вариант для вас!',
    offerSub: 'Наш дизайнер работает с любыми стилями',
    render: () => `
      <div class="options-grid">
        ${buildOptions([
          { val:'modern',  label:'Современный' },
          { val:'classic', label:'Классика' },
          { val:'loft',    label:'Лофт' },
          { val:'other',   label:'Другой стиль' }
        ], 'type', state.k.type, 'k')}
      </div>`
  },
  {
    label: 'Шаг 2 — Форма',
    title: 'Какая форма кухни предпочтительнее?',
    hint: 'От формы зависит планировка и количество рабочей поверхности.',
    beaver: 'beaver_3.png',
    offer: 'Реализуем ваш проект кухни в любом ракурсе и конфигурации!',
    offerSub: 'Прямая, угловая, П-образная — сделаем всё',
    render: () => `
      <div class="options-grid">
        ${buildOptions([
          { val:'straight', label:'Прямая' },
          { val:'corner',   label:'Угловая' },
          { val:'u',        label:'П-образная' },
          { val:'island',   label:'С островом' },
          { val:'other',    label:'Другой вариант' }
        ], 'shape', state.k.shape, 'k')}
      </div>`
  },
  {
    label: 'Шаг 3 — Размер',
    title: 'Укажите примерный размер кухонного гарнитура',
    hint: 'Используйте слайдер для указания общей длины в погонных метрах.',
    beaver: 'beaver_4.png',
    offer: 'По этим размерам мы сможем определить стоимость вашего заказа!',
    offerSub: 'Точные замеры сделает наш мастер бесплатно',
    render: () => `
      <div class="slider-block">
        <div class="slider-val"><span id="k-size-val">${state.k.size}</span><small>пог. м</small></div>
        <input type="range" id="k-size-range" min="1" max="10" step="0.5" value="${state.k.size}" />
        <div class="slider-ticks"><span>1 м</span><span>5 м</span><span>10 м</span></div>
      </div>
      <div class="size-fields">
        <div class="size-field"><label>Длина, м</label><input type="number" id="k-size-l" placeholder="напр. 3.2" min="0" step="0.1" value="${state.k.sizeL}" /></div>
        <div class="size-field"><label>Глубина, м</label><input type="number" id="k-size-d" placeholder="напр. 0.6" min="0" step="0.1" value="${state.k.sizeD}" /></div>
        <div class="size-field"><label>Высота, м</label><input type="number" id="k-size-h" placeholder="напр. 2.1" min="0" step="0.1" value="${state.k.sizeH}" /></div>
      </div>`
  },
  {
    label: 'Шаг 4 — Сроки',
    title: 'Планируемое время заказа кухни?',
    hint: 'Это поможет нам определить приоритет вашего заказа.',
    beaver: 'beaver_5.png',
    offer: 'Так мы сможем понять, как скоро вам нужна мебель 🪑',
    offerSub: 'Согласуем удобные сроки производства и доставки',
    render: () => `
      <div class="options-grid cols-1">
        ${buildOptions([
          { val:'now',   label:'Сейчас, готов(а) обсудить' },
          { val:'week',  label:'На этой неделе' },
          { val:'month', label:'В течение месяца' },
          { val:'later', label:'Через 2–3 месяца' }
        ], 'time', state.k.time, 'k')}
      </div>`
  },
  {
    label: 'Шаг 5 — Бюджет',
    title: 'Планируемый бюджет на кухню?',
    hint: 'Примерная сумма — мы подберём подходящие материалы и качество.',
    beaver: 'beaver_6.png',
    offer: 'Благодаря примерному бюджету мы подберём подходящие материалы и учтём качество изделий!',
    render: () => `
      <div class="slider-block">
        <div class="slider-val"><span id="k-budget-val">${fmtRub(state.k.budget)}</span></div>
        <input type="range" id="k-budget-range" min="60000" max="1000000" step="10000" value="${state.k.budget}" />
        <div class="slider-ticks"><span>60 000 ₽</span><span>~500 000 ₽</span><span>1 млн ₽</span></div>
      </div>`
  },
  {
    label: 'Шаг 6 — Контакты',
    title: 'Осталось совсем чуть-чуть!',
    hint: 'Заполните форму — пришлём расчёт и свяжемся с вами.',
    beaver: 'beaver_7.png',
    offer: 'Вы уже у цели 🎯',
    offerSub: 'Расчёт отправим в течение 10 минут',
    render: () => `
      <div class="contact-form">
        <div class="form-field"><label>Как к вам обращаться?</label><input type="text" id="k-name" placeholder="Ваше имя" value="${state.k.name}" /></div>
        <div class="form-field"><label>Телефон для связи</label><input type="tel" id="k-phone" placeholder="+7 (___) ___-__-__" value="${state.k.phone || ''}" /></div>
      </div>`
  }
];

function renderKitchenStep(n) {
  state.kitchenStep = n;
  const isThanks = n === 6;

  // Progress
  document.getElementById('k-step-cur').textContent = Math.min(n + 1, 7);
  document.getElementById('k-progress-fill').style.width = (isThanks ? 100 : ((n + 1) / 7) * 100) + '%';
  document.getElementById('k-btn-back').disabled = n === 0 || isThanks;

  // Footer
  const footer = document.getElementById('k-quiz-footer');
  const btnNext = document.getElementById('k-btn-next');
  const btnSubmit = document.getElementById('k-btn-submit');
  if (isThanks) {
    footer.style.display = 'none';
  } else {
    footer.style.display = '';
    if (n === 5) {
      btnNext.style.display = 'none';
      btnSubmit.style.display = '';
    } else {
      btnNext.style.display = '';
      btnSubmit.style.display = 'none';
    }
  }

  // Content
  const content = document.getElementById('kitchen-step-content');
  if (isThanks) {
    content.innerHTML = buildThanksScreen('kitchen');
    return;
  }

  const step = kitchenSteps[n];
  content.innerHTML = `
    <div class="step-inner">
      ${buildOfferCard(step.beaver, step.offer, step.offerSub || '')}
      <div class="question-panel">
        <div class="q-label">${step.label}</div>
        <div class="q-title">${step.title}</div>
        <div class="q-hint">${step.hint}</div>
        ${step.render()}
      </div>
    </div>`;

  // Wire up dynamic inputs
  if (n === 2) wireKitchenSize();
  if (n === 4) wireKitchenBudget();
  if (n === 5) wireKitchenContact();

  refreshKitchenNext();
}

function wireKitchenSize() {
  const range = document.getElementById('k-size-range');
  const val   = document.getElementById('k-size-val');
  const update = () => { state.k.size = +range.value; val.textContent = range.value; refreshKitchenNext(); };
  range.addEventListener('input', update);

  ['k-size-l','k-size-d','k-size-h'].forEach((id, i) => {
    const inp = document.getElementById(id);
    inp.addEventListener('input', () => {
      if (i===0) state.k.sizeL = inp.value;
      if (i===1) state.k.sizeD = inp.value;
      if (i===2) state.k.sizeH = inp.value;
      refreshKitchenNext();
    });
  });
}

function wireKitchenBudget() {
  const range = document.getElementById('k-budget-range');
  const val   = document.getElementById('k-budget-val');
  const update = () => { state.k.budget = +range.value; val.textContent = fmtRub(+range.value); refreshKitchenNext(); };
  range.addEventListener('input', update);
}

function wireKitchenContact() {
  const nameEl  = document.getElementById('k-name');
  const phoneEl = document.getElementById('k-phone');
  nameEl.addEventListener('input', () => { state.k.name = nameEl.value; refreshKitchenNext(); });
  phoneEl.addEventListener('input', () => { state.k.phone = formatPhone(phoneEl); refreshKitchenNext(); });
  if (state.k.phone) phoneEl.value = state.k.phone;
}

function refreshKitchenNext() {
  const n = state.kitchenStep;
  const k = state.k;
  let ok = true;
  if (n === 0) ok = !!k.type;
  if (n === 1) ok = !!k.shape;
  if (n === 2) ok = k.size != null;
  if (n === 3) ok = !!k.time;
  if (n === 4) ok = k.budget != null;

  const btnNext   = document.getElementById('k-btn-next');
  const btnSubmit = document.getElementById('k-btn-submit');
  if (n !== 5) { if (btnNext) btnNext.disabled = !ok; }
  if (n === 5) {
    const ph = (k.phone || '').replace(/\D/g,'');
    const valid = k.name.trim().length >= 2 && ph.length >= 10;
    if (btnSubmit) btnSubmit.disabled = !valid;
  }
}

window.kitchenNext = function() {
  if (state.kitchenStep < 5) renderKitchenStep(state.kitchenStep + 1);
};

window.kitchenBack = function() {
  if (state.kitchenStep === 0) { showScreen('screen-product'); return; }
  if (state.kitchenStep > 0)   renderKitchenStep(state.kitchenStep - 1);
};

window.kitchenSubmit = function() {
  console.log('[Rococo] Kitchen submission', state.k);
  renderKitchenStep(6);
};

/* ═══════════════════════════════════════════════════════════
   WARDROBE QUIZ
   ═══════════════════════════════════════════════════════════ */

const wardrobeSteps = [
  {
    label: 'Шаг 1 — Помещение',
    title: 'В какую комнату нужен шкаф?',
    hint: 'Мы учтём особенности планировки этого помещения.',
    beaver: 'beaver_2.png',
    offer: 'Пройдите короткий тест и получите подарок за экономию времени нашего менеджера!',
    render: () => `
      <div class="options-grid">
        ${buildOptions([
          { val:'hallway',  label:'Прихожая' },
          { val:'bedroom',  label:'Спальня' },
          { val:'living',   label:'Гостиная' },
          { val:'kids',     label:'Детская' },
          { val:'dressing', label:'Гардеробная' },
          { val:'other',    label:'Пока не знаю' }
        ], 'room', state.w.room, 'w')}
      </div>`
  },
  {
    label: 'Шаг 2 — Тип шкафа',
    title: 'Какой тип шкафа вам нужен?',
    hint: 'Каждый тип имеет свои преимущества.',
    beaver: 'beaver_3.png',
    offer: 'Если вы ещё не определились — наш дизайнер обязательно поможет и проконсультирует вас!',
    render: () => `
      <div class="options-grid">
        ${buildOptions([
          { val:'straight', label:'Прямой' },
          { val:'corner',   label:'Угловой' },
          { val:'u',        label:'П-образный' },
          { val:'radius',   label:'Радиусный' },
          { val:'other',    label:'Пока не знаю' }
        ], 'type', state.w.type, 'w')}
      </div>`
  },
  {
    label: 'Шаг 3 — Размеры',
    title: 'Укажите примерные размеры будущего шкафа',
    hint: 'Введите значения в сантиметрах. Наш мастер уточнит размеры при замере.',
    beaver: 'beaver_4.png',
    offer: 'По этим размерам мы сможем определить стоимость вашего заказа!',
    offerSub: 'Бесплатный замер — уточним всё на месте',
    render: () => `
      <div class="wardrobe-schema">
        <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Front view -->
          <rect x="20" y="30" width="110" height="140" rx="4" stroke="#D4AF37" stroke-width="2" fill="#FDF8F0"/>
          <line x1="75" y1="30" x2="75" y2="170" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="4 3"/>
          <line x1="20" y1="100" x2="130" y2="100" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="4 3"/>
          <!-- door handles -->
          <rect x="64" y="78" width="4" height="20" rx="2" fill="#B8961F"/>
          <rect x="82" y="78" width="4" height="20" rx="2" fill="#B8961F"/>
          <!-- Width arrow -->
          <line x1="20" y1="185" x2="130" y2="185" stroke="#6B5B4F" stroke-width="1.5" marker-start="url(#arr)" marker-end="url(#arr)"/>
          <text x="75" y="197" text-anchor="middle" font-size="11" fill="#6B5B4F" font-family="Inter,sans-serif">Длина</text>
          <!-- Height arrow -->
          <line x1="8" y1="30" x2="8" y2="170" stroke="#6B5B4F" stroke-width="1.5"/>
          <text x="4" y="105" text-anchor="middle" font-size="11" fill="#6B5B4F" font-family="Inter,sans-serif" transform="rotate(-90 4 105)">Высота</text>
          <!-- Top view (right side) -->
          <rect x="160" y="50" width="90" height="40" rx="3" stroke="#D4AF37" stroke-width="2" fill="#F0E6D2"/>
          <text x="205" y="44" text-anchor="middle" font-size="10" fill="#6B5B4F" font-family="Inter,sans-serif">Вид сверху</text>
          <line x1="160" y1="100" x2="250" y2="100" stroke="#6B5B4F" stroke-width="1.5"/>
          <text x="205" y="112" text-anchor="middle" font-size="11" fill="#6B5B4F" font-family="Inter,sans-serif">Глубина</text>
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="none" stroke="#6B5B4F" stroke-width="1"/>
            </marker>
          </defs>
        </svg>
      </div>
      <div class="size-fields" style="margin-top:16px;">
        <div class="size-field"><label>Длина, см</label><input type="number" id="w-size-l" placeholder="напр. 200" min="0" value="${state.w.sizeL}" /></div>
        <div class="size-field"><label>Глубина, см</label><input type="number" id="w-size-d" placeholder="напр. 60" min="0" value="${state.w.sizeD}" /></div>
        <div class="size-field"><label>Высота, см</label><input type="number" id="w-size-h" placeholder="напр. 240" min="0" value="${state.w.sizeH}" /></div>
      </div>`
  },
  {
    label: 'Шаг 4 — Оформление',
    title: 'Какое оформление шкафа вы хотите?',
    hint: 'Выберите стиль фасада и материал.',
    beaver: 'beaver_5.png',
    offer: 'Если вы ещё не определились с выбором — поможем подобрать материал на любой вкус и цвет!',
    render: () => `
      <div class="options-grid">
        ${buildOptions([
          { val:'mirror', label:'Зеркальный' },
          { val:'combo',  label:'Комбинированный' },
          { val:'solid',  label:'Цельный (ЛДСП/МДФ)' },
          { val:'open',   label:'Открытый' },
          { val:'other',  label:'Пока не знаю' }
        ], 'style', state.w.style, 'w')}
      </div>`
  },
  {
    label: 'Шаг 5 — Сроки',
    title: 'Планируемое время заказа шкафа?',
    hint: 'Это поможет нам согласовать удобные сроки.',
    beaver: 'beaver_6.png',
    offer: 'Так мы сможем понять, как скоро вам нужна мебель 🪑',
    offerSub: 'Согласуем удобные сроки производства и доставки',
    render: () => `
      <div class="options-grid cols-1">
        ${buildOptions([
          { val:'now',   label:'Сейчас, готов(а) обсудить' },
          { val:'week',  label:'На этой неделе' },
          { val:'month', label:'В течение месяца' },
          { val:'later', label:'Через 2–3 месяца' }
        ], 'time', state.w.time, 'w')}
      </div>`
  },
  {
    label: 'Шаг 6 — Контакты',
    title: 'Осталось совсем чуть-чуть!',
    hint: 'Заполните форму — пришлём расчёт и свяжемся с вами.',
    beaver: 'beaver_7.png',
    offer: 'Вы уже у цели 🎯',
    offerSub: 'Расчёт отправим в течение 10 минут',
    render: () => `
      <div class="contact-form">
        <div class="form-field"><label>Как к вам обращаться?</label><input type="text" id="w-name" placeholder="Ваше имя" value="${state.w.name}" /></div>
        <div class="form-field"><label>Телефон для связи</label><input type="tel" id="w-phone" placeholder="+7 (___) ___-__-__" value="${state.w.phone || ''}" /></div>
      </div>`
  }
];

function renderWardrobeStep(n) {
  state.wardrobeStep = n;
  const isThanks = n === 6;

  document.getElementById('w-step-cur').textContent = Math.min(n + 1, 7);
  document.getElementById('w-progress-fill').style.width = (isThanks ? 100 : ((n + 1) / 7) * 100) + '%';
  document.getElementById('w-btn-back').disabled = n === 0 || isThanks;

  const footer    = document.getElementById('w-quiz-footer');
  const btnNext   = document.getElementById('w-btn-next');
  const btnSubmit = document.getElementById('w-btn-submit');
  if (isThanks) {
    footer.style.display = 'none';
  } else {
    footer.style.display = '';
    if (n === 5) { btnNext.style.display = 'none'; btnSubmit.style.display = ''; }
    else         { btnNext.style.display = ''; btnSubmit.style.display = 'none'; }
  }

  const content = document.getElementById('wardrobe-step-content');
  if (isThanks) { content.innerHTML = buildThanksScreen('wardrobe'); return; }

  const step = wardrobeSteps[n];
  content.innerHTML = `
    <div class="step-inner">
      ${buildOfferCard(step.beaver, step.offer, step.offerSub || '')}
      <div class="question-panel">
        <div class="q-label">${step.label}</div>
        <div class="q-title">${step.title}</div>
        <div class="q-hint">${step.hint}</div>
        ${step.render()}
      </div>
    </div>`;

  if (n === 2) wireWardrobeSize();
  if (n === 5) wireWardrobeContact();
  refreshWardrobeNext();
}

function wireWardrobeSize() {
  ['w-size-l','w-size-d','w-size-h'].forEach((id, i) => {
    const inp = document.getElementById(id);
    if (!inp) return;
    inp.addEventListener('input', () => {
      if (i===0) state.w.sizeL = inp.value;
      if (i===1) state.w.sizeD = inp.value;
      if (i===2) state.w.sizeH = inp.value;
      refreshWardrobeNext();
    });
  });
}

function wireWardrobeContact() {
  const nameEl  = document.getElementById('w-name');
  const phoneEl = document.getElementById('w-phone');
  nameEl.addEventListener('input',  () => { state.w.name  = nameEl.value; refreshWardrobeNext(); });
  phoneEl.addEventListener('input', () => { state.w.phone = formatPhone(phoneEl); refreshWardrobeNext(); });
}

function refreshWardrobeNext() {
  const n = state.wardrobeStep;
  const w = state.w;
  let ok = true;
  if (n === 0) ok = !!w.room;
  if (n === 1) ok = !!w.type;
  if (n === 2) ok = true; // size fields optional
  if (n === 3) ok = !!w.style;
  if (n === 4) ok = !!w.time;

  const btnNext   = document.getElementById('w-btn-next');
  const btnSubmit = document.getElementById('w-btn-submit');
  if (n !== 5) { if (btnNext) btnNext.disabled = !ok; }
  if (n === 5) {
    const ph = (w.phone || '').replace(/\D/g,'');
    if (btnSubmit) btnSubmit.disabled = !(w.name.trim().length >= 2 && ph.length >= 10);
  }
}

window.wardrobeNext = function() {
  if (state.wardrobeStep < 5) renderWardrobeStep(state.wardrobeStep + 1);
};

window.wardrobeBack = function() {
  if (state.wardrobeStep === 0) { showScreen('screen-product'); return; }
  renderWardrobeStep(state.wardrobeStep - 1);
};

window.wardrobeSubmit = function() {
  console.log('[Rococo] Wardrobe submission', state.w);
  renderWardrobeStep(6);
};

/* ── THANKS SCREEN ──────────────────────────────────────── */
function buildThanksScreen(product) {
  const name = product === 'kitchen' ? (state.k.name || 'друг') : (state.w.name || 'друг');
  return `
    <div class="thanks-inner">
      <div class="thanks-content">
        <div class="thanks-icon">🎉</div>
        <h2>Поздравляем, ${name}!</h2>
        <p>Ваша заявка принята. Перезвоним в течение 10 минут.</p>
        <ul class="gifts-list">
          <li>
            <span class="gift-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="4 12 10 18 20 6"/></svg></span>
            Бесплатный выезд замерщика на дом
          </li>
          <li>
            <span class="gift-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="4 12 10 18 20 6"/></svg></span>
            Бесплатный 3D дизайн-проект
          </li>
          <li>
            <span class="gift-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="4 12 10 18 20 6"/></svg></span>
            Скидка 5% на ваш первый заказ
          </li>
        </ul>
        <a href="https://t.me/rococomeb00" target="_blank" rel="noopener" class="btn-tg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 3 2 10.5l5.5 1.7L18.5 6 9.8 13.6 9.5 19l3.4-3.2 4.6 3.4L22 3z"/></svg>
          Подписаться на Telegram
        </a>
        <p class="tg-note">Подпишись и узнай больше о нас, акциях и новых проектах!</p>
      </div>
      <div class="thanks-beaver">
        <img src="images/beaver_8.png" alt="Бобёр Rococo радуется" />
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   CAROUSEL
   ══════════════════════════════════════════════════════════ */
(function initCarousel() {
  const carousel = document.getElementById('carousel');
  if (!carousel) return;

  const slides    = carousel.querySelectorAll('.carousel-slide');
  const dotsWrap  = document.getElementById('carousel-dots');
  const btnPrev   = document.getElementById('carousel-prev');
  const btnNext   = document.getElementById('carousel-next');
  const total     = slides.length;
  let current     = 0;
  let timer       = null;

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Слайд ' + (i + 1));
    d.addEventListener('click', () => goSlide(i));
    dotsWrap.appendChild(d);
  });

  function goSlide(n) {
    current = (n + total) % total;
    carousel.scrollTo({ left: current * carousel.offsetWidth, behavior: 'smooth' });
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goSlide(current + 1), 3500);
  }

  // Sync dot on manual scroll
  carousel.addEventListener('scroll', () => {
    const idx = Math.round(carousel.scrollLeft / carousel.offsetWidth);
    if (idx !== current) {
      current = idx;
      dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }
  }, { passive: true });

  btnPrev.addEventListener('click', () => goSlide(current - 1));
  btnNext.addEventListener('click', () => goSlide(current + 1));

  resetTimer();
})();

})();
