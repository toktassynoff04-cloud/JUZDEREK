(()=>{
  if(window.JUZ_PROGRESS_CORE)return;
  const MODE_ORDER=['cards','quiz','person','chrono'];
  const LEVELS=[
    {level:1,name:'Ізденуші',min:0},{level:2,name:'Ізденуші',min:500},{level:3,name:'Зерттеуші',min:1200},{level:4,name:'Зерттеуші',min:2200},{level:5,name:'Білгір',min:3500},{level:6,name:'Білгір',min:5000},{level:7,name:'Білгір',min:7000},{level:8,name:'Сарапшы',min:9500},{level:9,name:'Сарапшы',min:12500},{level:10,name:'Сарапшы',min:16000},{level:11,name:'Тарихшы',min:20000},{level:12,name:'Тарихшы',min:25000},{level:13,name:'Тарихшы',min:31000},{level:14,name:'Аңыз',min:38000},{level:15,name:'Аңыз',min:46000}
  ];
  const read=(key,fallback={})=>{try{const v=JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));return v&&typeof v==='object'?v:fallback}catch{return fallback}};
  const safeNum=(v,max=1e9)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(max,n)):0};
  const almatyParts=(date=new Date())=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Almaty',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const o={};parts.forEach(p=>{if(p.type!=='literal')o[p.type]=p.value});return o};
  const dayKey=(date=new Date())=>{const p=almatyParts(date);return `${p.year}-${p.month}-${p.day}`};
  const shiftDay=(key,delta)=>{const [y,m,d]=key.split('-').map(Number);const dt=new Date(Date.UTC(y,m-1,d+delta,6));return dayKey(dt)};
  function topicMeta(id){return window.JUZDEREK_TOPIC_INDEX?.[id]||null}
  function requiredModes(id,topic=null){
    const registryTopic=topic||window.JUZDEREK_TOPICS?.[id]||null;
    if(registryTopic){const people=Array.isArray(registryTopic.people)?registryTopic.people.filter(p=>p?.distractorOnly!==true):[];return people.length?MODE_ORDER:[ 'cards','quiz','chrono' ]}
    if(id==='new-era-overview')return ['cards','quiz','chrono'];
    return MODE_ORDER;
  }
  function topicProgressStore(){return read('juzderek_topics_progress',{})}
  function topicState(id){return topicProgressStore()[id]||{completed:[],scores:{}}}
  function completedModes(id,t=null){const s=t||topicState(id),done=new Set(Array.isArray(s?.completed)?s.completed:[]);return requiredModes(id).filter(m=>done.has(m))}
  function isMastered(id,t=null){const s=t||topicState(id),done=new Set(Array.isArray(s?.completed)?s.completed:[]);return requiredModes(id).every(m=>done.has(m))}
  function masteredTopics(store=topicProgressStore()){return Object.entries(store).filter(([id,t])=>isMastered(id,t)).length}
  function uniqueGames(store=topicProgressStore()){return Object.entries(store).reduce((n,[id,t])=>n+completedModes(id,t).length,0)}
  function gameProgress(){return read('juzderek_game_progress',{xp:0,correct:0,games:0,attempts:0})}
  function xp(){return safeNum(gameProgress().xp)}
  function levelInfo(value=xp()){let current=LEVELS[0];for(const l of LEVELS){if(value>=l.min)current=l;else break}const idx=LEVELS.findIndex(l=>l.level===current.level),next=LEVELS[idx+1]||null;const pct=next?Math.max(0,Math.min(100,Math.round((value-current.min)/(next.min-current.min)*100))):100;return{...current,next,pct,need:next?Math.max(0,next.min-value):0}}
  function learningMeta(){return read('juzderek_learning_meta',{lastDay:null,streak:0,bestStreak:0,daily:{}})}
  function touchLearning(){const today=dayKey(),meta=learningMeta();if(meta.lastDay!==today){const yesterday=shiftDay(today,-1);meta.streak=meta.lastDay===yesterday?safeNum(meta.streak,36500)+1:1;meta.bestStreak=Math.max(safeNum(meta.bestStreak,36500),meta.streak);meta.lastDay=today}meta.daily=meta.daily||{};meta.daily[today]=safeNum(meta.daily[today],100000)+1;localStorage.setItem('juzderek_learning_meta',JSON.stringify(meta));return meta}
  function dailyXpStore(){return read('juzderek_daily_xp',{baseline:null,days:{}})}
  function syncDailyXp(){const total=xp(),data=dailyXpStore(),today=dayKey();data.days=data.days||{};if(data.baseline===null||!Number.isFinite(Number(data.baseline))){data.baseline=total;data.days[today]=safeNum(data.days[today])}else if(total>Number(data.baseline)){data.days[today]=safeNum(data.days[today])+total-Number(data.baseline);data.baseline=total}else if(total<Number(data.baseline)){data.baseline=total}const keys=Object.keys(data.days).sort();if(keys.length>35)keys.slice(0,-35).forEach(k=>delete data.days[k]);localStorage.setItem('juzderek_daily_xp',JSON.stringify(data));return data}
  function todayXp(){return safeNum(syncDailyXp().days?.[dayKey()])}
  function dayXp(offset=0){const d=syncDailyXp();return safeNum(d.days?.[shiftDay(dayKey(),offset)])}
  window.JUZ_LEVELS=LEVELS;
  window.JUZ_PROGRESS_CORE={MODE_ORDER,LEVELS,read,safeNum,dayKey,shiftDay,requiredModes,topicProgressStore,topicState,completedModes,isMastered,masteredTopics,uniqueGames,gameProgress,xp,levelInfo,learningMeta,touchLearning,syncDailyXp,todayXp,dayXp};
})();