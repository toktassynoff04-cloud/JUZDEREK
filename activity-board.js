(()=>{
  const LOG_KEY='juzderek_activity_log';
  const MODE_META={cards:{label:'Карточка',icon:'cards.webp'},quiz:{label:'Тест',icon:'test.webp'},person:{label:'Тұлғаны тап',icon:'person.webp'},chrono:{label:'Хронология',icon:'chronology.webp'}};
  const q=(s,r=document)=>r.querySelector(s);
  const read=(k,f=[])=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
  const log=()=>{const x=read(LOG_KEY,[]);return Array.isArray(x)?x:[]};
  const fmtTime=ts=>new Intl.DateTimeFormat('kk-KZ',{hour:'2-digit',minute:'2-digit'}).format(new Date(ts));
  const dayKey=ts=>{const d=new Date(ts);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const todayKey=()=>dayKey(Date.now());
  const yesterdayKey=()=>dayKey(Date.now()-86400000);
  const dayTitle=k=>k===todayKey()?'Бүгін':k===yesterdayKey()?'Кеше':new Intl.DateTimeFormat('kk-KZ',{day:'numeric',month:'long'}).format(new Date(k+'T12:00:00'));
  const topicProgress=id=>{const all=read('juzderek_topics_progress',{}),done=[...new Set(Array.isArray(all?.[id]?.completed)?all[id].completed:[])];return{done:done.length,pct:Math.round(done.length/4*100)}};
  const masteredThisWeek=()=>{const weekAgo=Date.now()-7*86400000;return new Set(log().filter(x=>x.ts>=weekAgo&&x.topicComplete).map(x=>x.topicId)).size};
  const weekStats=()=>{const weekAgo=Date.now()-7*86400000,items=log().filter(x=>x.ts>=weekAgo);return{games:items.length,xp:items.reduce((s,x)=>s+(Number(x.xp)||0),0),mastered:masteredThisWeek()}};
  function loadCss(){if(q('link[data-activity-board]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./activity-board.css?v=20260820-final';l.dataset.activityBoard='1';document.head.appendChild(l)}
  function latest(){return log().sort((a,b)=>(b.ts||0)-(a.ts||0))[0]||null}
  function renderRecent(){
    const card=q('.recent-card');if(!card)return;
    const item=latest(),row=q('.activity-row',card),btn=q('#recentViewAll',card);
    if(btn){btn.textContent='Барлығын көру ›';btn.onclick=e=>{e.preventDefault();openHistory()}}
    if(!item){if(row)row.outerHTML='<div class="recent-empty">Әзірге белсенділік жоқ. Бір ойын аяқтағаннан кейін осы жерде көрінеді.</div>';return}
    if(!row)return;
    const meta=MODE_META[item.mode]||MODE_META.cards,prog=topicProgress(item.topicId),icon=q('.activity-icon',row),copy=q('.activity-copy',row),pct=q('#recentPct',row),track=q('#recentTrack',row),cont=q('#recentContinue',row);
    if(icon)icon.innerHTML=`<img src="./assets/${meta.icon}" alt="">`;
    if(copy)copy.innerHTML=`<strong>${item.topicName||'Тақырып'}</strong><span class="activity-mode"><b>${meta.label}</b>${fmtTime(item.ts)} · ${item.score??0}/${item.total??0}</span>`;
    if(pct)pct.textContent=`${prog.pct}%`;
    if(track)track.style.width=`${prog.pct}%`;
    if(cont){cont.textContent=prog.pct===100?'Қайта ойнау ›':'Жалғастыру ›';cont.onclick=()=>location.href=`games.html?topic=${encodeURIComponent(item.topicId)}&mode=${encodeURIComponent(item.mode||'cards')}`}
  }
  function ensureModal(){
    let el=q('#activityHistoryOverlay');if(el)return el;
    document.body.insertAdjacentHTML('beforeend',`<div class="activity-history-overlay" id="activityHistoryOverlay"><section class="activity-history-modal"><button class="activity-history-close" type="button" aria-label="Жабу">×</button><div class="activity-history-head"><span class="activity-history-kicker">БЕЛСЕНДІЛІК ТАРИХЫ</span><h2>Соңғы белсенділік</h2><p>Қай тақырыпта не істегеніңді және нәтижелеріңді бір жерден көр.</p></div><div class="activity-summary" id="activitySummary"></div><div class="activity-filter-row" id="activityFilters"></div><div class="activity-history-list" id="activityHistoryList"></div></section></div>`);
    el=q('#activityHistoryOverlay');q('.activity-history-close',el).onclick=closeHistory;el.onclick=e=>{if(e.target===el)closeHistory()};return el
  }
  function renderHistory(filter='all'){
    const el=ensureModal(),stats=weekStats(),items=log().sort((a,b)=>(b.ts||0)-(a.ts||0));
    q('#activitySummary',el).innerHTML=`<div><span>Осы аптада</span><strong>${stats.games} ойын</strong></div><div><span>Жиналған XP</span><strong>${stats.xp} XP</strong></div><div><span>Меңгерілген тақырып</span><strong>${stats.mastered}</strong></div>`;
    const filters=[['all','Барлығы'],['cards','Карточка'],['quiz','Тест'],['person','Тұлға'],['chrono','Хронология']];
    q('#activityFilters',el).innerHTML=filters.map(([id,label])=>`<button class="activity-filter ${id===filter?'active':''}" data-filter="${id}">${label}</button>`).join('');
    q('#activityFilters',el).querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>renderHistory(b.dataset.filter));
    const shown=filter==='all'?items:items.filter(x=>x.mode===filter),groups={};shown.forEach(x=>(groups[dayKey(x.ts)] ||= []).push(x));
    q('#activityHistoryList',el).innerHTML=shown.length?Object.entries(groups).map(([day,arr])=>`<section class="activity-day-group"><h3>${dayTitle(day)}</h3>${arr.map(x=>{const m=MODE_META[x.mode]||MODE_META.cards;return `<article class="activity-history-item" data-topic="${x.topicId}" data-mode="${x.mode||'cards'}"><div class="activity-history-icon"><img src="./assets/${m.icon}" alt=""></div><div class="activity-history-copy"><strong>${x.topicName||'Тақырып'}</strong><span>${m.label} · ${x.score??0}/${x.total??0} · ${x.pct??0}%</span></div><div class="activity-history-side"><strong>+${Number(x.xp)||0} XP</strong><span>${fmtTime(x.ts)}</span></div></article>`}).join('')}</section>`).join(''):'<div class="activity-history-empty">Бұл фильтр бойынша белсенділік жоқ.</div>';
    q('#activityHistoryList',el).querySelectorAll('.activity-history-item').forEach(row=>row.onclick=()=>location.href=`games.html?topic=${encodeURIComponent(row.dataset.topic)}&mode=${encodeURIComponent(row.dataset.mode)}`)
  }
  function openHistory(){const el=ensureModal();renderHistory('all');el.classList.add('show');document.body.classList.add('juz-overlay-open')}
  function closeHistory(){q('#activityHistoryOverlay')?.classList.remove('show');document.body.classList.remove('juz-overlay-open')}
  function boot(){loadCss();renderRecent()}
  window.JUZ_ACTIVITY_BOARD={renderRecent,openHistory};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.addEventListener('storage',e=>{if(e.key===LOG_KEY||e.key==='juzderek_topics_progress')renderRecent()});
  window.addEventListener('juzderek:progress',renderRecent);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeHistory()});
})();