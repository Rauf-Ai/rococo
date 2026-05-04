/* =========================================================
   Rococo Mebel — Landing JS
   ========================================================= */
(() => {
  // ---------- HEADER scrolled state ----------
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');

    // back-to-top
    const bt = document.querySelector('.back-top');
    if (window.scrollY > 300) bt.classList.add('show');
    else bt.classList.remove('show');

    // hero parallax
    const video = document.querySelector('.hero-video');
    if (video) {
      const y = Math.min(window.scrollY * 0.25, 200);
      video.style.transform = `translateY(${y}px) scale(1.05)`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- BACK TO TOP ----------
  document.querySelector('.back-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- REVEAL on scroll ----------
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ---------- CATALOG FILTER ----------
  const filterBtns = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.kitchen-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c => {
        const tags = (c.dataset.tags || '').split(',');
        const show = f === 'all' || tags.includes(f);
        c.style.display = show ? '' : 'none';
      });
    });
  });

  // catalog "calculate" → scroll to quiz
  document.querySelectorAll('.kc-cta, .scroll-to-quiz').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ---------- RIPPLE on quiz buttons ----------
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.option, .btn-next, .btn-submit, .stage-tab, .filter-chip');
    if (!t) return;
    const rect = t.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size/2) + 'px';
    r.style.top  = (e.clientY - rect.top  - size/2) + 'px';
    t.appendChild(r);
    setTimeout(() => r.remove(), 700);
  });

  // ---------- QUIZ ----------
  const quizState = {
    step: 0,
    total: 7, // steps 1..6 + thanks (7)
    answers: {
      type: null,
      shape: null,
      size: 4,
      time: null,
      budget: 350000,
      name: '',
      phone: ''
    }
  };

  const stepEls   = document.querySelectorAll('.quiz-step');
  const fill      = document.querySelector('.progress-fill');
  const stepLabel = document.querySelector('.progress-step b');
  const stepTotal = document.querySelector('.progress-step .total');
  if (stepTotal) stepTotal.textContent = '6';
  const nextBtn   = document.querySelector('.btn-next');
  const backBtn   = document.querySelector('.btn-back');
  const submitBtn = document.querySelector('.btn-submit');

  function setStep(n) {
    quizState.step = n;
    stepEls.forEach((el, i) => el.classList.toggle('active', i === n));
    // progress (steps 0..5 of 6, plus 6 = thanks)
    const pct = n >= 6 ? 100 : ((n + 1) / 6) * 100;
    if (fill) fill.style.width = pct + '%';
    if (stepLabel) stepLabel.textContent = Math.min(n + 1, 6);

    if (backBtn) backBtn.disabled = n === 0 || n === 6;
    if (n === 6) {
      // thank-you: hide nav
      document.querySelector('.quiz-nav').style.display = 'none';
    } else if (n === 5) {
      // form step: show submit, hide next
      nextBtn.style.display = 'none';
      submitBtn.style.display = '';
      document.querySelector('.quiz-nav').style.display = '';
    } else {
      nextBtn.style.display = '';
      submitBtn.style.display = 'none';
      document.querySelector('.quiz-nav').style.display = '';
    }
    refreshNextEnabled();
  }

  function refreshNextEnabled() {
    if (!nextBtn) return;
    const a = quizState.answers;
    let ok = true;
    if (quizState.step === 0) ok = !!a.type;
    if (quizState.step === 1) ok = !!a.shape;
    if (quizState.step === 2) ok = a.size != null;
    if (quizState.step === 3) ok = !!a.time;
    if (quizState.step === 4) ok = a.budget != null;
    nextBtn.disabled = !ok;

    if (quizState.step === 5) {
      const ph = (a.phone || '').replace(/\D/g, '');
      submitBtn.disabled = !(a.name.trim().length >= 2 && ph.length >= 10);
    }
  }

  // Single-pick options (steps 1, 2, 4)
  document.querySelectorAll('.quiz-step .options').forEach(group => {
    group.addEventListener('click', (e) => {
      const opt = e.target.closest('.option');
      if (!opt) return;
      group.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const key = group.dataset.key;
      quizState.answers[key] = opt.dataset.value;
      refreshNextEnabled();
    });
  });

  // size slider
  const sizeRange = document.getElementById('quiz-size');
  const sizeOut   = document.getElementById('quiz-size-val');
  if (sizeRange && sizeOut) {
    const updateSize = () => {
      sizeOut.textContent = sizeRange.value;
      quizState.answers.size = +sizeRange.value;
      refreshNextEnabled();
    };
    sizeRange.addEventListener('input', updateSize);
    updateSize();
  }

  // budget slider
  const budgetRange = document.getElementById('quiz-budget');
  const budgetOut   = document.getElementById('quiz-budget-val');
  const fmtRub = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
  if (budgetRange && budgetOut) {
    const updateBudget = () => {
      budgetOut.textContent = fmtRub(+budgetRange.value);
      quizState.answers.budget = +budgetRange.value;
      refreshNextEnabled();
    };
    budgetRange.addEventListener('input', updateBudget);
    updateBudget();
  }

  // name + phone
  const nameInput  = document.getElementById('quiz-name');
  const phoneInput = document.getElementById('quiz-phone');
  if (nameInput) nameInput.addEventListener('input', () => { quizState.answers.name = nameInput.value; refreshNextEnabled(); });
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      // light formatting
      let v = phoneInput.value.replace(/\D/g, '').slice(0, 11);
      if (v.startsWith('8')) v = '7' + v.slice(1);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 5) out += ') ' + v.slice(4, 7);
      if (v.length >= 8) out += '-' + v.slice(7, 9);
      if (v.length >= 10) out += '-' + v.slice(9, 11);
      phoneInput.value = out;
      quizState.answers.phone = v;
      refreshNextEnabled();
    });
  }

  // skip-link
  document.querySelector('.skip-link')?.addEventListener('click', () => {
    quizState.answers.size = 'нужен замерщик';
    setStep(quizState.step + 1);
  });

  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (nextBtn.disabled) return;
    setStep(quizState.step + 1);
  });
  if (backBtn) backBtn.addEventListener('click', () => {
    if (backBtn.disabled) return;
    setStep(Math.max(0, quizState.step - 1));
  });
  if (submitBtn) submitBtn.addEventListener('click', () => {
    if (submitBtn.disabled) return;
    console.log('[Rococo Mebel] quiz submission', quizState.answers);
    setStep(6);
  });

  // initial
  setStep(0);

  // ---------- CONSULT FORM ----------
  const consultForm = document.querySelector('.consult-form');
  consultForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: consultForm.querySelector('input[name="name"]').value,
      phone: consultForm.querySelector('input[name="phone"]').value,
    };
    console.log('[Rococo Mebel] consult submission', data);
    const success = consultForm.querySelector('.consult-success');
    if (success) success.style.display = 'flex';
    consultForm.querySelector('.fields')?.style.setProperty('display', 'none');
  });

  // ---------- STAGES ----------
  const stages = [
    { num: '01', title: 'Замер — детально, учтём всё',
      desc: 'Мастер приедет с лазерным замерщиком, проверит коммуникации, розетки, наклон стен и пола. На месте обсудим сценарий готовки и привычки семьи.',
      cta: 'Оставить заявку на замер', img: 'images/stage_01.png' },
    { num: '02', title: 'Дизайн-проект в 3D',
      desc: 'Получите три варианта планировки в фотореалистичном 3D. Покрутите кухню под любым углом, поменяйте фасады и материалы за минуту.',
      cta: 'Хочу 3D-проект', img: 'images/stage_02.png' },
    { num: '03', title: 'Смета без сюрпризов',
      desc: 'Зафиксируем итоговую цену в договоре. Никаких «вылезших» доплат, накруток на материалы и «но это вы не заказывали».',
      cta: 'Получить смету', img: 'images/stage_03.png' },
    { num: '04', title: 'Производство на собственной фабрике',
      desc: 'Раскрой и сборка на станках с ЧПУ — миллиметровая точность и экономия до 20% за счёт минимизации ручного труда.',
      cta: 'Показать производство', img: 'images/stage_04.png' },
    { num: '05', title: 'Доставка и сборка',
      desc: 'Привезём в удобный день и аккуратно соберём за 1–2 дня. Подключим технику, выровняем фасады, уберём за собой.',
      cta: 'Узнать сроки доставки', img: 'images/stage_05.png' },
    { num: '06', title: 'Гарантия 12 месяцев',
      desc: 'После сдачи сохраняем сервисную поддержку. Подкрутим петли, заменим кромку, поможем с ремонтом любой мелочи в течение года.',
      cta: 'Подробнее о гарантии', img: 'images/stage_03.png' },
  ];

  const tabsEl    = document.querySelector('.stages-tabs');
  const stageBody = document.querySelector('.stage-content');
  if (tabsEl && stageBody) {
    stages.forEach((s, i) => {
      const t = document.createElement('button');
      t.className = 'stage-tab' + (i === 0 ? ' active' : '');
      t.dataset.idx = i;
      t.innerHTML = `<span class="num">${s.num}</span>${s.title.split(' — ')[0]}`;
      tabsEl.appendChild(t);
    });
    const renderStage = (i) => {
      const s = stages[i];
      stageBody.innerHTML = `
        <div class="stage-text">
          <div class="stage-num">${s.num}</div>
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
          <a href="#consult" class="stage-cta">${s.cta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </a>
        </div>
        <div class="stage-image">
          <div class="stage-image-glow"></div>
          <span class="stage-image-num">${s.num}</span>
          <img src="${s.img}" alt="" />
        </div>
      `;
    };
    renderStage(0);
    tabsEl.addEventListener('click', (e) => {
      const t = e.target.closest('.stage-tab');
      if (!t) return;
      tabsEl.querySelectorAll('.stage-tab').forEach(b => b.classList.remove('active'));
      t.classList.add('active');
      renderStage(+t.dataset.idx);
    });
  }

  // ---------- REVIEWS MODAL ----------
  const modal = document.querySelector('.modal-back');
  document.querySelectorAll('.review-more').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.review-card');
      modal.querySelector('.modal-name').textContent = card.querySelector('.review-name').textContent;
      modal.querySelector('.modal-meta').textContent = card.querySelector('.review-meta').textContent;
      modal.querySelector('.modal-text').innerHTML   = card.dataset.full || card.querySelector('.review-text').innerHTML;
      modal.classList.add('open');
    });
  });
  modal?.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('.modal-close')) {
      modal.classList.remove('open');
    }
  });

})();
