(()=> {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const json=(k,f={})=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const dayKey=(d=new Date())=>d.toISOString().slice(0,10);
  const yesterdayKey=()=>{const d=new Date();d.setDate(d.getDate()-1);return dayKey(d)};
  const currentPage=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  function masteredTopics(){
    const all=json('juzderek_topics_progress',{});
    return Object.values(all).filter(t=>Array.isArray(t?.completed)&&new Set(t.completed).size>=4).length
  }
  function totalXp(){return Number(json('juzderek_game_progress',{xp:0}).xp)||0}
  function rankName(xp=totalXp()){
    const ranks=[['Ізденуші',0],['Зерттеуші',1200],['Білгір',3500],['Сарапшы',9500],['Тарихшы',20000],['Аңыз',38000]];
    let n='Ізденуші';for(const [name,min] of ranks){if(xp>=min)n=name;else break}return n
  }
  function dailyStore(){
    const s=json('juzderek_daily_activity',{});
    const t=dayKey();
    if(!s[t])s[t]={games:0,xp:0,masteredAtStart:masteredTopics(),bonus:false};
    save('juzderek_daily_activity',s);return s
  }
  function todayData(){const s=dailyStore();return s[dayKey()]}
  function missionState(){
    const d=todayData(), masteredNow=masteredTopics();
    const items=[
      {id:'game1',label:'1 ойын аяқта',done:d.games>=1},
      {id:'xp100',label:'100 XP жина',done:d.xp>=100},
      {id:'game2',label:'2 ойын аяқта',done:d.games>=2},
      {id:'topic1',label:'1 тақырыпты толық меңгер',done:(masteredNow-(d.masteredAtStart||0))>=1}
    ];
    return {items,done:items.filter(x=>x.done).length,data:d}
  }
  function touchStreak(){
    const t=dayKey(), y=yesterdayKey(), m=json('juzderek_learning_meta',{lastDay:null,streak:0,bestStreak:0,daily:{}});
    if(m.lastDay!==t){m.streak=m.lastDay===y?(Number(m.streak)||0)+1:1;m.bestStreak=Math.max(Number(m.bestStreak)||0,m.streak);m.lastDay=t}
    m.daily=m.daily||{};m.daily[t]=Math.max(1,Number(m.daily[t])||0);save('juzderek_learning_meta',m)
  }
  function grantMissionBonus(){
    const st=missionState();if(st.done<4||st.data.bonus)return false;
    const all=dailyStore(), d=all[dayKey()];d.bonus=true;d.xp+=50;all[dayKey()]=d;save('juzderek_daily_activity',all);
    const gp=json('juzderek_game_progress',{xp:0});gp.xp=(Number(gp.xp)||0)+50;save('juzderek_game_progress',gp);
    window.dispatchEvent(new CustomEvent('juzderek:progress',{detail:gp}));confetti();return true
  }

  function ensureOverlay(id,html){
    let el=q('#'+id);if(!el){document.body.insertAdjacentHTML('beforeend',html);el=q('#'+id)}
    return el
  }
  function closeOverlay(el){el?.classList.remove('show');document.body.classList.remove('juz-overlay-open')}
  function showOverlay(el){el?.classList.add('show');document.body.classList.add('juz-overlay-open')}

  const quotes=['Бір тақырып — бір жеңіс.','Бүгін кешегіден бір қадам алға жүр.','Тарихты жаттама, түсін.','Аз-аздан, бірақ күн сайын.','Қателесу — үйренудің бір бөлігі.'];
  function quoteForToday(){const n=Number(dayKey().replaceAll('-',''));return quotes[n%quotes.length]}

  function missionModal(){
    const st=missionState();
    const el=ensureOverlay('dailyMissionOverlay',`<div class="juz-overlay" id="dailyMissionOverlay"><section class="juz-board mission-board"><button class="juz-close" type="button">×</button><div class="mission-hero"><img src="./assets/mascot-daily-mission.webp" alt="JUZDEREK маскоты"><div class="mission-bubble"><span>БҮГІНГІ МИССИЯҢ</span><h2>Бүгін не істейміз?</h2><p id="missionQuote"></p></div></div><div class="mission-summary"><strong id="missionDone"></strong><span id="missionPercent"></span></div><div class="mission-track"><i id="missionTrack"></i></div><div class="mission-list" id="missionList"></div><div class="mission-finish" id="missionFinish">Барлық миссияны аяқтасаң, +50 XP бонус аласың.</div></section></div>`);
    q('.juz-close',el).onclick=()=>closeOverlay(el);el.onclick=e=>{if(e.target===el)closeOverlay(el)};
    q('#missionQuote',el).textContent='«'+quoteForToday()+'»';
    q('#missionDone',el).textContent=`${st.done} / 4 орындалды`;q('#missionPercent',el).textContent=Math.round(st.done/4*100)+'%';q('#missionTrack',el).style.width=(st.done/4*100)+'%';
    q('#missionList',el).innerHTML=st.items.map((x,i)=>`<div class="mission-item ${x.done?'done':''}"><span>${x.done?'✓':i+1}</span><strong>${x.label}</strong><b>${x.done?'Орындалды':'Күтуде'}</b></div>`).join('');
    if(st.done===4){q('#missionFinish',el).textContent='Керемет! Бүгінгі миссия толық орындалды.';grantMissionBonus()}
    showOverlay(el)
  }

  function dayData(key){return json('juzderek_daily_activity',{})[key]||{games:0,xp:0}}
  function last7(){
    const out=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=dayKey(d), labels=['Жс','Дс','Сс','Ср','Бс','Жм','Сб'];out.push({label:labels[d.getDay()],xp:Number(dayData(key).xp)||0})}return out
  }
  function progressModal(){
    const today=Number(todayData().xp)||0, yesterday=Number(dayData(yesterdayKey()).xp)||0, delta=today-yesterday, pct=yesterday?Math.round(delta/yesterday*100):0, bars=last7(), max=Math.max(1,...bars.map(x=>x.xp));
    const el=ensureOverlay('progressBoardOverlay',`<div class="juz-overlay" id="progressBoardOverlay"><section class="juz-board progress-modal"><button class="juz-close" type="button">×</button><div class="progress-modal-head"><div><span>СЕНІҢ ДИНАМИКАҢ</span><h2>Прогресс тақтасы</h2><p>Өзіңнің соңғы күндердегі өсуіңді бақыла.</p></div><b id="progressRank"></b></div><div class="progress-modal-compare"><div><span>Кеше</span><strong id="pmYesterday"></strong></div><div class="today"><span>Бүгін</span><strong id="pmToday"></strong></div><div class="grow"><span>Өсім</span><strong id="pmDelta"></strong><small id="pmPct"></small></div></div><div class="progress-modal-week"><div class="progress-week-title"><strong>Соңғы 7 күн</strong><span>Күндік XP</span></div><div class="progress-modal-bars" id="pmBars"></div></div></section></div>`);
    q('.juz-close',el).onclick=()=>closeOverlay(el);el.onclick=e=>{if(e.target===el)closeOverlay(el)};
    q('#progressRank',el).textContent=rankName();q('#pmYesterday',el).textContent=yesterday+' XP';q('#pmToday',el).textContent=today+' XP';q('#pmDelta',el).textContent=(delta>=0?'+':'')+delta+' XP';q('#pmPct',el).textContent=(pct>=0?'+':'')+pct+'%';
    q('#pmBars',el).innerHTML=bars.map(x=>`<div><span><i style="height:${Math.max(4,Math.round(x.xp/max*100))}%"></i></span><b>${x.label}</b><small>${x.xp}</small></div>`).join('');
    showOverlay(el)
  }

  function patchPeriods(){
    const enc=q('.encourage-mascot');if(enc)enc.src='./assets/mascot-progress-card.webp';
    const hero=q('#periodHero'), title=q('#heroTitle');
    const syncHero=()=>{if(!hero||!title)return;hero.classList.remove('reference-medieval','reference-modern','reference-contemporary');const t=title.textContent.trim();if(t==='Орта ғасыр')hero.classList.add('reference-medieval');if(t==='Жаңа заман')hero.classList.add('reference-modern');if(t==='Қазіргі заман')hero.classList.add('reference-contemporary')};
    syncHero();if(title&&!title.dataset.uxObserved){title.dataset.uxObserved='1';new MutationObserver(syncHero).observe(title,{childList:true,subtree:true,characterData:true})}

    const metric=qa('.metric-card').find(x=>/Күнделікті мақсат|Бүгінгі миссия/.test(x.textContent||''));if(metric){const st=missionState();metric.classList.add('mission-metric');q('small',metric).textContent='Бүгінгі миссия';q('strong',metric).textContent=`${st.done} / 4`;const desc=metric.querySelector('div>span');if(desc)desc.textContent=st.done===4?'Барлық миссия орындалды':st.items.find(x=>!x.done)?.label||'Миссияны жалғастыр';const tr=q('.thin-track span',metric);if(tr)tr.style.width=(st.done/4*100)+'%';metric.onclick=missionModal}
    const old=q('.leaderboard-card');if(old){const today=Number(todayData().xp)||0,yesterday=Number(dayData(yesterdayKey()).xp)||0,delta=today-yesterday;old.className='content-card progress-board-card';old.innerHTML=`<div class="section-head"><div><h2>Прогресс тақтасы</h2><p>Кешегі және бүгінгі нәтижеңді салыстыр.</p></div><span class="progress-rank">${rankName()}</span></div><div class="progress-mini"><div><span>Кеше</span><strong>${yesterday} XP</strong></div><div><span>Бүгін</span><strong>${today} XP</strong></div><div class="delta"><span>Өсім</span><strong>${delta>=0?'+':''}${delta} XP</strong></div></div><button class="progress-open" type="button">Толық прогресті көру <span>›</span></button>`;old.onclick=progressModal}
    if(location.hash==='#dailyMission')setTimeout(missionModal,80)
  }

  function patchQuickLinks(){qa('.quick-card').forEach(c=>{c.onclick=()=>location.href='periods.html'})}
  function patchHeaderLinks(){
    qa('.site-nav-link').forEach(a=>{if((a.textContent||'').trim()==='Ойындар')a.href='periods.html';if(/Үздіктер/.test(a.textContent||'')){a.textContent='Бүгінгі миссия';a.href='periods.html#dailyMission'}});
  }

  function confetti(){
    const layer=document.createElement('div');layer.className='mini-confetti';document.body.appendChild(layer);
    for(let i=0;i<22;i++){const p=document.createElement('i');p.style.setProperty('--x',(Math.random()*440-220)+'px');p.style.setProperty('--y',(Math.random()*-260-60)+'px');p.style.setProperty('--r',(Math.random()*720-360)+'deg');layer.appendChild(p)}
    setTimeout(()=>layer.remove(),1200)
  }

  function setupGameRewards(){
    if(currentPage!=='games.html')return;
    const params=new URLSearchParams(location.search), topic=params.get('topic');
    if(!topic){location.replace('periods.html');return}
    const base={cards:50,quiz:100,person:80,chrono:100};
    let startXp=totalXp(), startMode=q('.game-tab.active')?.dataset.mode||params.get('mode')||'cards';
    const captureStart=mode=>{startXp=totalXp();startMode=mode||q('.game-tab.active')?.dataset.mode||'cards';dailyStore()};
    document.addEventListener('click',e=>{const b=e.target.closest('.game-tab');if(b)captureStart(b.dataset.mode)},true);
    window.addEventListener('load',()=>setTimeout(()=>captureStart(q('.game-tab.active')?.dataset.mode),0));
    const original=window.showResult;
    if(typeof original!=='function'||original.__taskWrapped)return;
    function wrapped(title,score,total,...rest){
      const mode=q('.game-tab.active')?.dataset.mode||startMode, pct=total?Math.round(score/total*100):100;
      const rewardMap=json('juzderek_task_rewards',{}), key=`${topic}:${mode}`, first=!rewardMap[key];
      let factor=pct===100?1.2:pct>=80?1:pct>=60?.7:.5, award=first?Math.round((base[mode]||80)*factor):0;
      if(first){rewardMap[key]={xp:award,pct,at:Date.now()};save('juzderek_task_rewards',rewardMap)}
      const bonuses=json('juzderek_topic_task_bonus',{}), tp=json('juzderek_topics_progress',{})[topic]||{}, full=Array.isArray(tp.completed)&&new Set(tp.completed).size>=4;
      let topicBonus=0;if(full&&!bonuses[topic]){bonuses[topic]=true;topicBonus=200;save('juzderek_topic_task_bonus',bonuses)}
      const gp=json('juzderek_game_progress',{xp:0,correct:0});gp.xp=startXp+award+topicBonus;gp.games=(Number(gp.games)||0)+1;save('juzderek_game_progress',gp);try{state.sessionXp=award+topicBonus}catch{};
      const ds=dailyStore(), d=ds[dayKey()];d.games=(Number(d.games)||0)+1;d.xp=(Number(d.xp)||0)+award+topicBonus;ds[dayKey()]=d;save('juzderek_daily_activity',ds);touchStreak();grantMissionBonus();
      window.dispatchEvent(new CustomEvent('juzderek:progress',{detail:gp}));
      const result=original.call(this,title,score,total,...rest);setTimeout(()=>{if(typeof window.refreshSharedHeader==='function')window.refreshSharedHeader()},0);return result
    }
    wrapped.__taskWrapped=true;window.showResult=wrapped
  }

  function init(){
    dailyStore();patchHeaderLinks();patchQuickLinks();patchPeriods();setupGameRewards();
    document.addEventListener('keydown',e=>{if(e.key==='Escape')qa('.juz-overlay.show').forEach(closeOverlay)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()
})();