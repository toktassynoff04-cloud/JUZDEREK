(()=>{
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const json=(k,f={})=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
  const localDay=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`};
  const dayStart=()=>{const d=new Date();d.setHours(0,0,0,0);return d.getTime()};
  const masteredTopics=()=>Object.values(json('juzderek_topics_progress',{})).filter(t=>Array.isArray(t?.completed)&&new Set(t.completed).size>=4).length;
  const daily=()=>{const all=json('juzderek_daily_activity',{});return all[localDay()]||{games:0,xp:0,masteredAtStart:masteredTopics(),bonus:false}};
  const modeDoneToday=mode=>Object.entries(json('juzderek_task_rewards',{})).some(([key,v])=>key.endsWith(':'+mode)&&Number(v?.at)>=dayStart());
  const seed=()=>Number(localDay().replaceAll('-',''));
  const pick=(arr,offset)=>arr[(seed()+offset)%arr.length];
  function todayMissions(){
    const d=daily(), masteredNow=masteredTopics();
    const games=pick([
      {id:'g1',label:'1 ойын аяқта',done:d.games>=1},
      {id:'g2',label:'2 ойын аяқта',done:d.games>=2},
      {id:'g3',label:'3 ойын аяқта',done:d.games>=3}
    ],1);
    const xp=pick([
      {id:'x80',label:'80 XP жина',done:d.xp>=80},
      {id:'x100',label:'100 XP жина',done:d.xp>=100},
      {id:'x150',label:'150 XP жина',done:d.xp>=150}
    ],2);
    const mode=pick([
      {id:'cards',label:'Карточкалар ойынын аяқта',done:modeDoneToday('cards')},
      {id:'quiz',label:'Тест ойынын аяқта',done:modeDoneToday('quiz')},
      {id:'person',label:'Тұлғаны тап ойынын аяқта',done:modeDoneToday('person')},
      {id:'chrono',label:'Хронология ойынын аяқта',done:modeDoneToday('chrono')}
    ],3);
    const mastery={id:'topic',label:'1 тақырыпты толық меңгер',done:(masteredNow-(Number(d.masteredAtStart)||0))>=1};
    const items=[games,xp,mode,mastery];
    return {items,done:items.filter(x=>x.done).length};
  }
  const quotes=['Бір тақырып — бір жеңіс.','Бүгін кешегіден бір қадам алға жүр.','Тарихты жаттама, түсін.','Аз-аздан, бірақ күн сайын.','Қателесу — үйренудің бір бөлігі.','Бүгінгі қадам — ертеңгі нәтиже.'];
  function quote(){return quotes[seed()%quotes.length]}
  function ensureModal(){
    let el=q('#dailyMissionOverlayV2');if(el)return el;
    document.body.insertAdjacentHTML('beforeend',`<div id="dailyMissionOverlayV2"><section class="daily-mission-board-v2"><button class="daily-mission-close-v2" type="button">×</button><div class="daily-mission-hero-v2"><img src="./assets/mascot-daily-mission.webp" alt="JUZDEREK маскоты"><div class="daily-mission-bubble-v2"><span>БҮГІНГІ МИССИЯҢ</span><h2>Бүгінгі миссия</h2><p id="dailyMissionQuoteV2"></p></div></div><div class="daily-mission-summary-v2"><strong id="dailyMissionDoneV2"></strong><span id="dailyMissionPctV2"></span></div><div class="daily-mission-track-v2"><i id="dailyMissionTrackV2"></i></div><div class="daily-mission-list-v2" id="dailyMissionListV2"></div><div class="daily-mission-foot-v2">Миссиялар күн сайын жаңарады.</div></section></div>`);
    el=q('#dailyMissionOverlayV2');q('.daily-mission-close-v2',el).onclick=()=>closeMission();el.onclick=e=>{if(e.target===el)closeMission()};return el
  }
  function openMission(){
    const el=ensureModal(),st=todayMissions();
    q('#dailyMissionQuoteV2',el).textContent='«'+quote()+'»';q('#dailyMissionDoneV2',el).textContent=`${st.done} / 4 орындалды`;q('#dailyMissionPctV2',el).textContent=Math.round(st.done/4*100)+'%';q('#dailyMissionTrackV2',el).style.width=(st.done/4*100)+'%';q('#dailyMissionListV2',el).innerHTML=st.items.map((x,i)=>`<div class="daily-mission-item-v2 ${x.done?'done':''}"><span>${x.done?'✓':i+1}</span><strong>${x.label}</strong><b>${x.done?'Орындалды':'Күтуде'}</b></div>`).join('');el.classList.add('show');document.body.classList.add('juz-overlay-open')
  }
  function closeMission(){const el=q('#dailyMissionOverlayV2');el?.classList.remove('show');document.body.classList.remove('juz-overlay-open');if(location.hash==='#dailyMission')history.replaceState(null,'',location.pathname+location.search)}
  function patchMissionCard(){
    const metric=qa('.metric-card').find(x=>/Күнделікті мақсат|Бүгінгі миссия/.test(x.textContent||''));if(!metric)return;
    const st=todayMissions();metric.classList.add('mission-metric');const small=q('small',metric),strong=q('strong',metric),desc=q('#goalNeed',metric)||metric.querySelector('div>span');if(small)small.textContent='Бүгінгі миссия';if(strong)strong.textContent=`${st.done} / 4`;if(desc)desc.textContent=st.done===4?'Барлығы орындалды':'Миссияларды көру';const tr=q('.thin-track span',metric);if(tr)tr.style.width=(st.done/4*100)+'%';metric.onclick=e=>{e.preventDefault();e.stopPropagation();openMission()}
  }
  document.addEventListener('click',e=>{const a=e.target.closest('a.site-nav-link,a.profile-menu-link');if(a&&/Бүгінгі миссия/.test(a.textContent||'')){const same=(location.pathname.split('/').pop()||'index.html').toLowerCase()==='periods.html';if(same){e.preventDefault();e.stopImmediatePropagation();openMission()}}},true);
  window.addEventListener('hashchange',()=>{if(location.hash==='#dailyMission')openMission()});
  function run(){patchMissionCard();if(location.hash==='#dailyMission')setTimeout(openMission,50)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,250));else setTimeout(run,250);
  window.addEventListener('juzderek:progress',()=>setTimeout(patchMissionCard,50));
  window.addEventListener('storage',()=>setTimeout(patchMissionCard,50));
})();
