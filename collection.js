(()=>{
  const PEOPLE=[
    {id:'napoleon',name:'Наполеон Бонапарт',years:'1769–1821',rarity:'legendary',label:'Аңыздық',image:'./assets/napoleon-bonapart.webp'},
    {id:'ramses-ii',name:'II Рамсес',years:'б.з.б. 1303–1213',rarity:'epic',label:'Эпикалық',image:'./assets/ramses-ii.webp'},
    {id:'alexander-great',name:'Александр Македонский',years:'б.з.б. 356–323',rarity:'legendary',label:'Аңыздық',image:'./assets/alexander-great.webp'},
    {id:'julius-caesar',name:'Гай Юлий Цезарь',years:'б.з.б. 100–44',rarity:'epic',label:'Эпикалық',image:'./assets/julius-caesar.webp'},
    {id:'genghis-khan',name:'Шыңғыс хан',years:'шамамен 1162–1227',rarity:'rare',label:'Сирек',image:'./assets/genghis-khan.webp'},
    {id:'joan-of-arc',name:'Жанна д’Арк',years:'1412–1431',rarity:'epic',label:'Эпикалық',image:'./assets/joan-of-arc.webp'},
    {id:'leonardo-da-vinci',name:'Леонардо да Винчи',years:'1452–1519',rarity:'rare',label:'Сирек',image:'./assets/leonardo-da-vinci.webp'},
    {id:'elizabeth-i',name:'Елизавета I',years:'1533–1603',rarity:'rare',label:'Сирек',image:'./assets/elizabeth-i.webp'},
    {id:'abraham-lincoln',name:'Авраам Линкольн',years:'1809–1865',rarity:'rare',label:'Сирек',image:'./assets/abraham-lincoln.webp'},
    {id:'albert-einstein',name:'Альберт Эйнштейн',years:'1879–1955',rarity:'rare',label:'Сирек',image:'./assets/albert-einstein.webp'}
  ];
  const RANK_IMAGES={'Ізденуші':'./assets/level-seeker.webp','Зерттеуші':'./assets/level-researcher.webp','Білгір':'./assets/level-scholar.webp','Сарапшы':'./assets/level-expert.webp','Тарихшы':'./assets/level-historian.webp','Аңыз':'./assets/level-legend.webp'};
  const LOCAL_PREVIEW=['localhost','127.0.0.1','::1'].includes(location.hostname);
  const ADMIN=LOCAL_PREVIEW&&new URLSearchParams(location.search).get('admin')==='1';
  const STATE_KEY='juzderek_collection_state_v1';
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const safeInt=(v,max=100000)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0};
  const validIds=new Set(PEOPLE.map(p=>p.id));
  function loadState(){const raw=read(STATE_KEY,{}),unlocked=Array.isArray(raw?.unlocked)?raw.unlocked.filter(id=>typeof id==='string'&&validIds.has(id)):[];return{unlocked:[...new Set(unlocked)].slice(0,PEOPLE.length),chests:safeInt(raw?.chests,1000),claimedTopicMilestones:safeInt(raw?.claimedTopicMilestones,10000),claimedLevelMilestones:safeInt(raw?.claimedLevelMilestones,10000)}}
  let state=loadState();
  const saveState=()=>{if(!ADMIN)localStorage.setItem(STATE_KEY,JSON.stringify(state))};
  const clientId=()=>localStorage.getItem('juzderek_support_student_id')||localStorage.getItem('juzderek_analytics_id')||'';
  async function claimRemoteBonus(){
    if(ADMIN)return;
    const studentId=clientId();
    if(!/^[a-zA-Z0-9-]{20,80}$/.test(studentId))return;
    try{
      const r=await fetch('/api/collection-grants',{method:'POST',headers:{'content-type':'application/json'},cache:'no-store',body:JSON.stringify({studentId})});
      if(!r.ok)return;
      const data=await r.json().catch(()=>({}));
      const amount=safeInt(data?.chests,100);
      if(!amount)return;
      state.chests=Math.min(1000,state.chests+amount);
      saveState();
      renderCounts();
      refreshOpenButton();
    }catch{}
  }
  const core=()=>window.JUZ_PROGRESS_CORE;
  const gameProgress=()=>core()?.gameProgress?.()||read('juzderek_game_progress',{xp:0});
  const masteredTopics=()=>core()?.masteredTopics?.()||0;
  const levelInfo=xp=>core()?.levelInfo?.(xp)||{level:1,name:'Ізденуші',min:0,next:null,pct:0};
  function syncRewards(level){if(ADMIN)return;const topicMilestones=Math.floor(masteredTopics()/7),levelMilestones=Math.floor(level.level/5);const newTopics=Math.max(0,topicMilestones-state.claimedTopicMilestones),newLevels=Math.max(0,levelMilestones-state.claimedLevelMilestones);if(newTopics||newLevels){state.chests=Math.min(1000,state.chests+newTopics+newLevels);state.claimedTopicMilestones=Math.max(state.claimedTopicMilestones,topicMilestones);state.claimedLevelMilestones=Math.max(state.claimedLevelMilestones,levelMilestones);saveState()}}
  const unlockedSet=()=>ADMIN?new Set(PEOPLE.map(p=>p.id)):new Set(state.unlocked);
  let view='all',rarity='all',ascending=true;
  const grid=document.getElementById('collectionGrid');
  function cardHTML(p,isUnlocked){if(!isUnlocked)return `<article class="person-card locked"><div class="locked-art"><img src="./assets/mystery-person.webp" alt="Құпия тұлға"><span class="lock-dot" aria-hidden="true">⌾</span></div><div class="person-info"><strong>Әлі ашылмаған</strong><small>ҚҰПИЯ ТҰЛҒА</small></div></article>`;return `<article class="person-card ${p.rarity}"><div class="card-ornament" aria-hidden="true"></div><div class="person-rarity"><i></i>${p.label.toUpperCase()}</div><div class="person-art"><img src="${p.image}" alt="${p.name}" loading="lazy"></div><div class="person-info"><strong>${p.name}</strong><small>${p.years}</small></div></article>`}
  function renderCollection(){const unlocked=unlockedSet();let list=PEOPLE.map(p=>({...p,isUnlocked:unlocked.has(p.id)}));if(view==='unlocked')list=list.filter(p=>p.isUnlocked);if(rarity!=='all')list=list.filter(p=>p.isUnlocked&&p.rarity===rarity);list.sort((a,b)=>{if(a.isUnlocked!==b.isUnlocked)return a.isUnlocked?-1:1;if(!a.isUnlocked)return 0;return ascending?a.name.localeCompare(b.name,'kk'):b.name.localeCompare(a.name,'kk')});grid.innerHTML=list.map(p=>cardHTML(p,p.isUnlocked)).join('')}
  document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{view=['all','unlocked'].includes(btn.dataset.view)?btn.dataset.view:'all';document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b===btn));renderCollection()}));
  document.querySelectorAll('[data-rarity]').forEach(btn=>btn.addEventListener('click',()=>{rarity=['all','rare','epic','legendary'].includes(btn.dataset.rarity)?btn.dataset.rarity:'all';document.querySelectorAll('[data-rarity]').forEach(b=>b.classList.toggle('active',b===btn));renderCollection()}));
  document.getElementById('sortBtn')?.addEventListener('click',e=>{ascending=!ascending;e.currentTarget.textContent=ascending?'А–Я ↑':'Я–А ↓';renderCollection()});
  document.getElementById('sideCollectionBtn')?.addEventListener('click',()=>document.getElementById('collectionBoard')?.scrollIntoView({behavior:'smooth',block:'start'}));
  const progress=gameProgress(),xp=safeInt(progress.xp,10000000),level=levelInfo(xp);syncRewards(level);const rankImage=RANK_IMAGES[level.name]||RANK_IMAGES['Ізденуші'];
  document.getElementById('rankName').textContent=level.name;document.getElementById('levelChip').textContent=`Lv.${level.level}`;document.getElementById('xpLine').textContent=level.next?`${xp.toLocaleString('kk-KZ')} / ${level.next.min.toLocaleString('kk-KZ')} XP`:`${xp.toLocaleString('kk-KZ')} XP`;document.getElementById('levelTrack').style.width=`${level.pct}%`;document.getElementById('levelCharacter').src=rankImage;document.getElementById('heroCharacter').src=rankImage;document.getElementById('heroRank').textContent=level.name;document.getElementById('heroLevel').textContent=`Lv.${level.level}`;
  const topics=masteredTopics(),topicCycle=topics%7,nextLevelTarget=Math.floor(level.level/5)*5+5,levelBase=Math.floor(level.level/5)*5,levelCycle=Math.max(0,Math.min(5,level.level-levelBase));
  document.getElementById('topicProgressText').textContent=`${topicCycle} / 7`;document.getElementById('topicProgressBar').style.width=`${topicCycle/7*100}%`;document.getElementById('levelRewardText').textContent=`Lv.${level.level} / Lv.${nextLevelTarget}`;document.getElementById('levelRewardBar').style.width=`${levelCycle/5*100}%`;
  function renderCounts(){const unlocked=unlockedSet().size,pct=Math.round(unlocked/PEOPLE.length*100),chests=ADMIN?'∞':String(state.chests);document.getElementById('collectionCount').textContent=`${unlocked} / ${PEOPLE.length}`;document.getElementById('sideCollectionCount').textContent=`${unlocked} / ${PEOPLE.length}`;document.getElementById('progressCount').textContent=`${unlocked} / ${PEOPLE.length}`;document.getElementById('progressPercent').textContent=`${pct}%`;document.getElementById('progressRing').style.background=`conic-gradient(#ff6818 0 ${pct}%,#eee8e3 ${pct}% 100%)`;document.getElementById('chestCount').textContent=chests;document.getElementById('availableChests').textContent=ADMIN?'Шексіз preview':`${state.chests} сандық бар`}
  if(ADMIN){document.getElementById('adminBadge').hidden=false;document.getElementById('newChip').textContent='PREVIEW';document.getElementById('revealTitle').textContent='Карточка preview';document.body.classList.add('admin-preview')}
  const stages=['ready','opening','card','reveal'];let stage=0,busy=false,selected=null;const openBtn=document.getElementById('openChestBtn'),flip=document.getElementById('revealFlip');
  function showStage(i){i=Math.max(0,Math.min(stages.length-1,Number(i)||0));stage=i;document.querySelectorAll('[data-stage]').forEach(el=>el.classList.toggle('current',el.dataset.stage===stages[i]));if(i!==3)flip?.classList.remove('flipped')}
  function availablePeople(){const unlocked=new Set(state.unlocked);return PEOPLE.filter(p=>ADMIN||!unlocked.has(p.id))}
  function weightedPick(list){if(!list.length)return null;const r=Math.random(),wanted=r<.60?'rare':r<.90?'epic':'legendary',pool=list.filter(p=>p.rarity===wanted);const source=pool.length?pool:list;return source[Math.floor(Math.random()*source.length)]}
  function prepareReveal(person){if(!person||!validIds.has(person.id))return;const front=document.getElementById('revealFront');front.className=`flip-face flip-front ${person.rarity}`;document.getElementById('revealRarity').textContent=`◆ ${person.label.toUpperCase()}`;document.getElementById('revealImage').src=person.image;document.getElementById('revealImage').alt=person.name;document.getElementById('revealName').textContent=person.name;document.getElementById('revealYears').textContent=person.years}
  function refreshOpenButton(){const locked=PEOPLE.length-state.unlocked.length;if(ADMIN){openBtn.disabled=false;openBtn.textContent=stage===3?'Тағы preview':'Сандықты ашу';document.getElementById('readyCopy').textContent='Admin режимінде сандық шексіз ашылады.';return}if(locked<=0){openBtn.disabled=true;openBtn.textContent='Коллекция толық';document.getElementById('readyCopy').textContent='Барлық 10 тұлға жиналды!';return}if(state.chests<=0){openBtn.disabled=true;openBtn.textContent='Сандық жоқ';document.getElementById('readyCopy').textContent='7 тақырыпты аяқта немесе әр 5 level сайын сандық ал.';return}openBtn.disabled=false;openBtn.textContent=stage===3?'Қайта ашу':'Сандықты ашу'}
  function runOpening(){if(busy)return;if(stage===3){showStage(0);refreshOpenButton();return}const pool=ADMIN?PEOPLE:availablePeople();if(!pool.length)return;selected=weightedPick(pool);if(!selected)return;if(!ADMIN){if(state.chests<=0)return;state.chests-=1;if(!state.unlocked.includes(selected.id))state.unlocked.push(selected.id);saveState()}prepareReveal(selected);busy=true;openBtn.disabled=true;openBtn.textContent='Ашылуда...';showStage(1);setTimeout(()=>showStage(2),820);setTimeout(()=>{showStage(3);flip?.classList.remove('flipped');setTimeout(()=>flip?.classList.add('flipped'),620)},1650);setTimeout(()=>{busy=false;renderCollection();renderCounts();refreshOpenButton()},2550)}
  openBtn?.addEventListener('click',runOpening);document.querySelector('[data-stage="ready"]')?.addEventListener('click',()=>{if(!openBtn.disabled)runOpening()});document.getElementById('continueBtn')?.addEventListener('click',()=>{showStage(0);refreshOpenButton();document.getElementById('collectionBoard')?.scrollIntoView({behavior:'smooth',block:'start'})});renderCollection();renderCounts();refreshOpenButton();claimRemoteBonus();
})();