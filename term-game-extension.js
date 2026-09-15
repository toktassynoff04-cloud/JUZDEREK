(()=>{
  const topicId=new URLSearchParams(location.search).get('topic');
  const topic=(window.JUZDEREK_TOPICS||{})[topicId];
  const terms=Array.isArray(topic?.terms)?topic.terms:[];
  const tab=document.querySelector('.game-tab[data-mode="term"]');
  if(!tab)return;
  if(!terms.length){tab.hidden=true;return}
  tab.hidden=false;

  const stage=document.getElementById('stage');
  const shuffle=a=>[...a].sort(()=>Math.random()-.5);
  const safeJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  let index=0,score=0,answered=false,completedThisRun=false;

  function topicStore(){return safeJSON('juzderek_topics_progress',{})}
  function getTopicProgress(){const all=topicStore();return all[topicId]||{completed:[],scores:{},rewarded:{},corrected:{},topicBonus:false,updatedAt:null}}
  function saveTopicProgress(value){const all=topicStore();all[topicId]=value;localStorage.setItem('juzderek_topics_progress',JSON.stringify(all))}
  function gameProgress(){return safeJSON('juzderek_game_progress',{xp:0,correct:0,games:0})}
  function writeGameProgress(p){localStorage.setItem('juzderek_game_progress',JSON.stringify(p));window.dispatchEvent(new CustomEvent('juzderek:progress',{detail:p}))}
  function updateHeader(){const p=gameProgress(),xp=document.getElementById('xpValue'),correct=document.getElementById('correctValue');if(xp)xp.textContent=(Number(p.xp)||0)+' XP';if(correct)correct.textContent=(Number(p.correct)||0)+' дұрыс'}
  function recordCorrectOnce(t){const tp=getTopicProgress();tp.corrected=tp.corrected||{};const key=`term:${t.id||t.name}`;if(tp.corrected[key])return;tp.corrected[key]=true;saveTopicProgress(tp);const gp=gameProgress();gp.correct=(Number(gp.correct)||0)+1;writeGameProgress(gp);updateHeader()}
  function activeModes(){const modes=['cards','quiz'];if(Array.isArray(topic?.people)&&topic.people.some(p=>p?.distractorOnly!==true))modes.push('person');modes.push('term','chrono');return modes}
  function completeTerm(){if(completedThisRun)return 0;completedThisRun=true;const tp=getTopicProgress();tp.completed=Array.isArray(tp.completed)?tp.completed:[];tp.scores=tp.scores||{};tp.rewarded=tp.rewarded||{};tp.scores.term={score,total:terms.length,pct:terms.length?Math.round(score/terms.length*100):100,finishedAt:Date.now()};const first=!tp.completed.includes('term');if(first)tp.completed.push('term');let gained=0;if(first&&!tp.rewarded['mode:term']){tp.rewarded['mode:term']=true;gained+=80}const modes=activeModes();if(modes.every(m=>tp.completed.includes(m))&&!tp.topicBonus){tp.topicBonus=true;gained+=200}tp.updatedAt=Date.now();saveTopicProgress(tp);if(first||gained){const gp=gameProgress();gp.xp=(Number(gp.xp)||0)+gained;if(first)gp.games=(Number(gp.games)||0)+1;writeGameProgress(gp)}updateHeader();window.JUZ_REAL_STATS?.render?.();return gained}
  function renderFlow(){const old=document.querySelector('.topic-flow');if(!old)return;const tp=getTopicProgress(),modes=activeModes(),names={cards:'Карточкалар',quiz:'Тест',person:'Тұлғаны тап',term:'Терминді тап',chrono:'Хронология'},done=modes.filter(m=>tp.completed.includes(m)).length,pct=Math.round(done/modes.length*100);old.innerHTML=`<div class="topic-flow-main"><div class="topic-flow-top"><span class="topic-flow-title">${topic.name}</span><span class="topic-flow-meta">${done}/${modes.length} бөлім аяқталды · ${pct}%</span></div><div class="topic-flow-track"><span style="width:${pct}%"></span></div></div><div class="topic-flow-steps">${modes.map(m=>`<span class="topic-flow-step ${tp.completed.includes(m)?'done':m==='term'?'current':''}"><i></i>${names[m]}</span>`).join('')}</div>`}
  function options(correct){return shuffle([...terms.filter(x=>x.name!==correct).map(x=>x.name).sort(()=>Math.random()-.5).slice(0,3),correct])}
  function render(){
    renderFlow();document.querySelectorAll('.game-tab').forEach(b=>b.classList.toggle('active',b.dataset.mode==='term'));
    const t=terms[index];
    if(!t){const gained=completeTerm();renderFlow();stage.innerHTML=`<div class="question-card"><h3>Терминді тап аяқталды!</h3><p>${score} / ${terms.length} дұрыс жауап${gained?` · +${gained} XP`:''}</p><div class="result-actions"><button class="result-action primary" id="termAgain">Қайта ойнау</button></div></div>`;document.getElementById('termAgain').onclick=()=>{index=0;score=0;answered=false;completedThisRun=false;render()};return}
    const clue=(t.clues||[]).join('\n\n').replace(/\n/g,'<br>'),opts=options(t.name);
    stage.innerHTML=`<div class="stage-top"><div class="stage-title"><h2>Терминді тап</h2><p>Анықтамаға қарап, дұрыс терминді таңда.</p></div><span class="step-counter">${index+1} / ${terms.length}</span></div><div class="progress-line"><span style="width:${Math.round(index/terms.length*100)}%"></span></div><div class="person-question"><div class="person-hero-card term-hero-card"><div class="person-copy term-copy"><span class="person-badge">БҰЛ НЕ?</span><h3>Терминді анықта</h3><div class="person-clue term-clue">${clue}</div></div></div><div class="answers person-answers">${opts.map((o,i)=>`<button class="answer person-answer" data-term="${encodeURIComponent(o)}"><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${o}</span></button>`).join('')}</div><div class="feedback" id="termFeedback"></div></div>`;
    document.querySelectorAll('[data-term]').forEach(btn=>btn.onclick=()=>{if(answered)return;answered=true;const ans=decodeURIComponent(btn.dataset.term),ok=ans===t.name;btn.classList.add(ok?'correct':'wrong');if(!ok)[...document.querySelectorAll('[data-term]')].find(b=>decodeURIComponent(b.dataset.term)===t.name)?.classList.add('correct');if(ok){score++;recordCorrectOnce(t)}const fb=document.getElementById('termFeedback');fb.classList.add('show','next-ready');fb.innerHTML=`<div class="feedback-text">${ok?'Дұрыс! '+t.name:'Дұрыс жауап: '+t.name}</div><button class="feedback-next" type="button">Келесі сұрақ →</button>`;fb.querySelector('button').onclick=()=>{index++;answered=false;render()}})
  }
  function open(){index=0;score=0;answered=false;completedThisRun=false;render()}
  tab.addEventListener('click',e=>{e.stopImmediatePropagation();open()},true);
  window.JUZ_TERM_MODE={open,renderFlow};
  queueMicrotask(renderFlow);
})();