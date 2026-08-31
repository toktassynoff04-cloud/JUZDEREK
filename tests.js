(() => {
  'use strict';

  const TEST_URL = './data/tests/pilot-world-history-01.json';
  const state = { test: null, index: 0, answers: {}, review: false };

  const $ = (id) => document.getElementById(id);
  const els = {
    title: $('testTitle'), counter: $('questionCounter'), answered: $('answeredCounter'),
    fill: $('progressFill'), grid: $('questionGrid'), card: $('questionCard'),
    badge: $('typeBadge'), text: $('questionText'), hint: $('questionHint'),
    area: $('answerArea'), warning: $('selectionWarning'), prev: $('prevBtn'), next: $('nextBtn'),
    result: $('resultCard'), score: $('scoreValue'), scoreMax: $('scoreMax'), percent: $('scorePercent'),
    breakdown: $('resultBreakdown'), reviewBtn: $('reviewBtn'), restartBtn: $('restartBtn')
  };

  function maxScore(q) { return q.type === 'single' ? 1 : 2; }
  function totalMax() { return state.test.questions.reduce((sum, q) => sum + maxScore(q), 0); }
  function answerFor(q) { return state.answers[q.id]; }
  function isAnswered(q) {
    const a = answerFor(q);
    if (q.type === 'matching') return !!a && Object.keys(a).length === q.left.length;
    return Array.isArray(a) && a.length > 0;
  }

  function scoreSingle(q, answer) {
    return Array.isArray(answer) && answer.length === 1 && answer[0] === q.correct[0] ? 1 : 0;
  }

  function scoreMultiple(q, answer) {
    const selected = Array.isArray(answer) ? [...new Set(answer)] : [];
    if (selected.length > 3) return 0;
    const correct = new Set(q.correct);
    const right = selected.filter(x => correct.has(x)).length;
    const wrong = selected.length - right;
    const count = q.correct.length;

    if (count === 3) {
      if (right === 3 && wrong === 0) return 2;
      if (right === 2 && wrong === 0) return 1;
      return 0;
    }
    if (count === 2) {
      if (right === 2 && wrong === 0) return 2;
      if (right === 1 && wrong === 0) return 1;
      if (right === 2 && wrong === 1) return 1;
      return 0;
    }
    if (count === 1) {
      if (right === 1 && wrong === 0) return 2;
      if (right === 1 && wrong === 1) return 1;
      return 0;
    }
    return 0;
  }

  function scoreMatching(q, answer) {
    if (!answer) return 0;
    let right = 0;
    q.left.forEach(item => { if (answer[item.id] === q.correct[item.id]) right += 1; });
    if (right === q.left.length) return 2;
    if (right > 0) return 1;
    return 0;
  }

  function scoreQuestion(q) {
    const a = answerFor(q);
    if (q.type === 'single') return scoreSingle(q, a);
    if (q.type === 'multiple') return scoreMultiple(q, a);
    if (q.type === 'matching') return scoreMatching(q, a);
    return 0;
  }

  function typeLabel(q) {
    if (q.type === 'single') return 'Біржауапты · 1 балл';
    if (q.type === 'multiple') return 'Көпжауапты · ең көбі 3 жауап · 2 балл';
    return 'Сәйкестендіру · 2 балл';
  }

  function typeHint(q) {
    if (q.type === 'multiple') return '1, 2 немесе 3 жауап таңдауға болады. Ең көбі 3 нұсқа белгіленеді.';
    if (q.type === 'matching') return 'Әр жолға сәйкес келетін бір нұсқаны таңдаңыз.';
    return 'Бір дұрыс жауапты таңдаңыз.';
  }

  function renderGrid() {
    els.grid.innerHTML = '';
    state.test.questions.forEach((q, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'question-dot'; b.textContent = i + 1;
      if (isAnswered(q)) b.classList.add('answered');
      if (i === state.index) b.classList.add('active');
      b.addEventListener('click', () => { state.index = i; state.review = false; renderQuestion(); });
      els.grid.appendChild(b);
    });
  }

  function renderChoice(q, multiple) {
    const chosen = new Set(answerFor(q) || []);
    q.options.forEach(opt => {
      const label = document.createElement('label');
      label.className = 'answer-option' + (chosen.has(opt.id) ? ' selected' : '');
      const input = document.createElement('input');
      input.type = multiple ? 'checkbox' : 'radio'; input.name = 'answer'; input.checked = chosen.has(opt.id);
      input.addEventListener('change', () => {
        els.warning.textContent = '';
        if (multiple) {
          const current = new Set(answerFor(q) || []);
          if (current.has(opt.id)) current.delete(opt.id);
          else if (current.size >= 3) { input.checked = false; els.warning.textContent = 'Ең көбі 3 жауап таңдауға болады'; return; }
          else current.add(opt.id);
          state.answers[q.id] = [...current];
        } else state.answers[q.id] = [opt.id];
        renderQuestion();
      });
      const letter = document.createElement('span'); letter.className = 'answer-letter'; letter.textContent = opt.id + ')';
      const text = document.createElement('span'); text.textContent = opt.text;
      label.append(input, letter, text); els.area.appendChild(label);
    });
  }

  function renderMatching(q) {
    const wrap = document.createElement('div'); wrap.className = 'matching-wrap';
    const answer = answerFor(q) || {};
    q.left.forEach((item, idx) => {
      const row = document.createElement('div'); row.className = 'matching-row';
      const title = document.createElement('strong'); title.textContent = `${idx + 1}) ${item.text}`;
      const select = document.createElement('select'); select.className = 'matching-select';
      select.innerHTML = '<option value="">Жауапты таңдаңыз</option>' + q.options.map(o => `<option value="${o.id}">${o.id}) ${o.text}</option>`).join('');
      select.value = answer[item.id] || '';
      select.addEventListener('change', () => {
        const next = { ...(answerFor(q) || {}) };
        if (select.value) next[item.id] = select.value; else delete next[item.id];
        state.answers[q.id] = next; renderQuestion();
      });
      row.append(title, select); wrap.appendChild(row);
    });
    const options = document.createElement('div'); options.className = 'matching-options';
    options.innerHTML = q.options.map(o => `<div><strong>${o.id})</strong> ${o.text}</div>`).join('');
    els.area.append(wrap, options);
  }

  function renderQuestion() {
    const q = state.test.questions[state.index];
    els.card.hidden = false; els.result.hidden = true; els.warning.textContent = '';
    els.title.textContent = state.test.title; els.counter.textContent = `${state.index + 1} / ${state.test.questions.length}`;
    const answeredCount = state.test.questions.filter(isAnswered).length;
    els.answered.textContent = `${answeredCount} жауап берілді`;
    els.fill.style.width = `${((state.index + 1) / state.test.questions.length) * 100}%`;
    els.badge.textContent = typeLabel(q); els.text.textContent = q.text; els.hint.textContent = typeHint(q); els.area.innerHTML = '';
    if (q.type === 'single') renderChoice(q, false);
    else if (q.type === 'multiple') renderChoice(q, true);
    else renderMatching(q);
    els.prev.disabled = state.index === 0;
    els.next.textContent = state.index === state.test.questions.length - 1 ? 'Тестті аяқтау' : 'Келесі →';
    renderGrid();
  }

  function finish() {
    const unanswered = state.test.questions.findIndex(q => !isAnswered(q));
    if (unanswered !== -1 && !confirm(`Жауап берілмеген сұрақтар бар. Сонда да аяқтайсыз ба?`)) { state.index = unanswered; renderQuestion(); return; }
    const scores = state.test.questions.map(q => ({ q, score: scoreQuestion(q), max: maxScore(q) }));
    const total = scores.reduce((s, x) => s + x.score, 0), max = totalMax();
    els.card.hidden = true; els.result.hidden = false; els.score.textContent = total; els.scoreMax.textContent = `/ ${max} балл`;
    els.percent.textContent = `${Math.round((total / max) * 100)}% нәтиже`;
    const single = scores.filter(x => x.q.type === 'single'), multiple = scores.filter(x => x.q.type === 'multiple'), matching = scores.filter(x => x.q.type === 'matching');
    const block = (name, arr) => `<div class="breakdown-item"><strong>${arr.reduce((s,x)=>s+x.score,0)} / ${arr.reduce((s,x)=>s+x.max,0)}</strong><span>${name}</span></div>`;
    els.breakdown.innerHTML = block('Біржауапты', single) + block('Көпжауапты', multiple) + block('Сәйкестендіру', matching);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showReview() {
    const old = els.result.querySelector('.review-list'); if (old) { old.remove(); return; }
    const list = document.createElement('div'); list.className = 'review-list';
    state.test.questions.forEach((q, i) => {
      const score = scoreQuestion(q), max = maxScore(q);
      if (score === max) return;
      const box = document.createElement('div'); box.className = 'review-block';
      const title = document.createElement('strong'); title.textContent = `${i + 1}. ${q.text}`;
      const p = document.createElement('p'); p.textContent = `Алған балл: ${score} / ${max}`;
      box.append(title, p); list.appendChild(box);
    });
    if (!list.children.length) { const box = document.createElement('div'); box.className = 'review-block review-good'; box.textContent = 'Барлық тапсырма толық дұрыс орындалды.'; list.appendChild(box); }
    els.result.appendChild(list);
  }

  els.prev.addEventListener('click', () => { if (state.index > 0) { state.index--; renderQuestion(); } });
  els.next.addEventListener('click', () => { if (state.index < state.test.questions.length - 1) { state.index++; renderQuestion(); } else finish(); });
  els.reviewBtn.addEventListener('click', showReview);
  els.restartBtn.addEventListener('click', () => { state.answers = {}; state.index = 0; renderQuestion(); window.scrollTo({ top: 0 }); });

  fetch(TEST_URL, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('Test data failed'); return r.json(); }).then(data => {
    state.test = data; document.title = `JUZDEREK — ${data.title}`; renderQuestion();
  }).catch(() => { els.title.textContent = 'Тест жүктелмеді'; els.text.textContent = 'Тест деректерін жүктеу кезінде қате шықты.'; });
})();