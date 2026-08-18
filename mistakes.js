(() => {
  const KEY='juzderek_attempt_mistakes';
  const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||'{}')}catch{return {}}};
  const write=data=>sessionStorage.setItem(KEY,JSON.stringify(data));
  const reset=mode=>{const data=read();data[mode]=[];write(data)};
  const add=(mode,item)=>{const data=read();if(!Array.isArray(data[mode]))data[mode]=[];const exists=data[mode].some(x=>x.question===item.question&&x.userAnswer===item.userAnswer);if(!exists)data[mode].push(item);write(data)};
  const get=mode=>{const data=read();return Array.isArray(data[mode])?data[mode]:[]};

  window.juzMistakes={get,reset,add};

  // A fresh page load starts a fresh attempt for the currently opened mode.
  try{if(typeof state!=='undefined'&&state.mode)reset(state.mode)}catch{}

  // Switching between games starts a new attempt for that mode.
  document.querySelectorAll('.game-tab').forEach(tab=>tab.addEventListener('click',()=>reset(tab.dataset.mode)));

  // The original game handler runs first. By the time this bubbles to document,
  // .wrong/.correct classes already tell us what happened.
  document.addEventListener('click',e=>{
    const btn=e.target.closest('.answer');
    if(!btn||!btn.classList.contains('wrong'))return;
    let mode='quiz';
    let question='';
    let userAnswer=btn.innerText.trim();
    let correctAnswer='';

    if(btn.classList.contains('person-answer')){
      mode='person';
      const clue=document.querySelector('.person-clue');
      question=clue?clue.textContent.trim():'Тарихи тұлғаны анықта';
      const correct=document.querySelector('.person-answer.correct');
      correctAnswer=correct?correct.innerText.trim():'';
    }else{
      mode='quiz';
      const date=document.querySelector('.date-accent');
      question=date?`${date.textContent.trim()} — қандай оқиға болды?`:'Датаны оқиғамен сәйкестендір';
      const correct=document.querySelector('.answer.correct');
      correctAnswer=correct?correct.innerText.trim():'';
    }

    add(mode,{question,userAnswer,correctAnswer});
  });

  window.openMistakeReview=mode=>{
    const items=get(mode);
    if(!items.length)return;
    const label=mode==='person'?'Тұлғаны тап':'Тест';
    stage.innerHTML=`<div class="mistake-review"><div class="mistake-review-head"><span class="mistake-kicker">ҚАТЕЛЕРМЕН ЖҰМЫС</span><h2>${label}: қай жерден қателестің?</h2><p>Дұрыс жауаптарды қарап шық. Содан кейін ойынды қайта орындап, нәтижеңді жақсарт.</p></div><div class="mistake-list">${items.map((m,i)=>`<article class="mistake-card"><div class="mistake-num">${i+1}</div><div class="mistake-body"><h3>${m.question}</h3><div class="mistake-answer wrong"><small>Сенің жауабың</small><strong>${m.userAnswer}</strong></div><div class="mistake-answer right"><small>Дұрыс жауап</small><strong>${m.correctAnswer}</strong></div></div></article>`).join('')}</div><div class="mistake-actions"><button class="result-action secondary" id="backToResult">Нәтижеге оралу</button><button class="result-action primary" id="retryMistakes">Қайта орындау →</button></div></div>`;
    document.getElementById('retryMistakes').onclick=()=>{reset(mode);setMode(mode)};
    document.getElementById('backToResult').onclick=()=>showResult(`${label} аяқталды!`,Math.max(0,(mode==='quiz'?facts.length:people.length)-items.length),mode==='quiz'?facts.length:people.length);
  };
})();