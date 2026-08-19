(() => {
  function chronoShuffle(items){return [...items].sort(()=>Math.random()-.5)}
  function seqText(nums){return nums.join(', ')}
  function makeDistractors(correct){const seen=new Set([correct.join(',')]);const out=[];let guard=0;while(out.length<3&&guard<100){guard++;const candidate=chronoShuffle(correct),key=candidate.join(',');if(!seen.has(key)){seen.add(key);out.push(candidate)}}return chronoShuffle([correct,...out])}
  function getChronologySets(){const configured=Array.isArray(topic.chronologySets)?topic.chronologySets:[];if(configured.length)return configured.map(set=>set.map(id=>facts.find(f=>f.id===id)).filter(Boolean)).filter(set=>set.length>=3);return[facts.slice(0,5)]}
  function buildAttempt(base){const numbered=chronoShuffle(base).map((f,i)=>({...f,sourceNum:i+1}));const correctNums=[...numbered].sort((a,b)=>a.correctIndex-b.correctIndex).map(x=>x.sourceNum);return{numbered,correctNums,options:makeDistractors(correctNums)}}
  window.renderChrono=function(){
    const sets=getChronologySets(),questionIndex=state.index||0;
    if(questionIndex>=sets.length){completeMode('chrono',state.score,sets.length);showResult('Хронология аяқталды!',state.score,sets.length);return}
    const base=sets[questionIndex].map((f,idx)=>({...f,correctIndex:idx})),total=sets.length,count=base.length,progress=Math.round((questionIndex/total)*100);let firstAttempt=true;
    function renderAttempt(){
      const {numbered,correctNums,options}=buildAttempt(base);
      stage.innerHTML=`<div class="stage-top"><div class="stage-title"><h2>Хронология</h2><p>Оқиғаларды реттілігі бойынша орналастырыңыз.</p></div><span class="step-counter">${questionIndex+1} / ${total}</span></div><div class="progress-line"><span style="width:${progress}%"></span></div><div class="chrono-game"><div class="chrono-help"><span class="chrono-help-icon">1–${count}</span><span>Оқиғаларды оқып, ең ерте оқиғадан ең кейінгісіне дейінгі дұрыс сандық реттілікті таңда.</span></div><div class="chrono-facts-card"><div class="chrono-facts-head"><span>ОҚИҒАЛАР</span><small>Әр дәйектің өз нөмірі бар</small></div><ol class="chrono-facts-list">${numbered.map(f=>`<li><span class="chrono-source-num">${f.sourceNum}</span><span class="chrono-copy">${f.event}</span></li>`).join('')}</ol></div><div class="chrono-choice-title">Дұрыс реттілікті таңда</div><div class="chrono-options">${options.map((o,i)=>`<button class="chrono-option" data-seq="${o.join(',')}"><span class="chrono-option-letter">${String.fromCharCode(65+i)}</span><span class="chrono-option-seq">${seqText(o)}</span></button>`).join('')}</div><div class="chrono-result" id="chronoResult"></div></div>`;
      let answered=false;
      document.querySelectorAll('.chrono-option').forEach(btn=>btn.addEventListener('click',()=>{
        if(answered)return;answered=true;const selected=btn.dataset.seq.split(',').map(Number),ok=selected.every((n,i)=>n===correctNums[i]);
        document.querySelectorAll('.chrono-option').forEach(b=>{b.disabled=true;const nums=b.dataset.seq.split(',').map(Number);if(nums.every((n,i)=>n===correctNums[i]))b.classList.add('correct')});if(!ok)btn.classList.add('wrong');const result=document.getElementById('chronoResult');
        if(ok){if(firstAttempt){state.score++;rewardOnce(`chrono:${questionIndex}`,10,1)}const isLast=questionIndex===total-1;result.className='chrono-result show ok';result.innerHTML=`<h3 class="chrono-result-title">Дұрыс! Реттілікті таптың.</h3><p class="chrono-correct-note"><strong>Дұрыс реттілік:</strong> ${seqText(correctNums)}</p><div class="chrono-final-actions"><button class="btn primary" id="finishChrono">${isLast?'Аяқтау':'Келесі сұрақ →'}</button></div>`;document.getElementById('finishChrono').onclick=()=>{state.index++;renderChrono()};return}
        if(firstAttempt&&state.analysis)state.analysis.mistakes++;firstAttempt=false;const ordered=[...numbered].sort((a,b)=>a.correctIndex-b.correctIndex);result.className='chrono-result show bad';result.innerHTML=`<h3 class="chrono-result-title">Қатемен жұмыс</h3><p class="chrono-correct-note">Дұрыс реттілікті даталарымен бірге қарап шық.</p><div class="chrono-review-list">${ordered.map((f,i)=>`<div class="chrono-review-item"><span class="chrono-review-order">${i+1}</span><div><strong>${f.date}</strong><p>${f.event}</p></div></div>`).join('')}</div><div class="chrono-final-actions"><button class="btn primary" id="retryChrono">Қайта орындау</button></div>`;document.getElementById('retryChrono').onclick=()=>{if(state.analysis)state.analysis.retries++;renderAttempt()};
      }))
    }
    renderAttempt()
  }
})();