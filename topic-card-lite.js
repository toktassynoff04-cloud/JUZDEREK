(()=>{
  const ERA_ASSETS={
    ancient:'./assets/ancient-topic.webp',
    medieval:'./assets/medieval-topic.webp',
    modern:'./assets/modern-topic.webp',
    contemporary:'./assets/contemporary-topic.webp'
  };
  const TOPICS=window.JUZDEREK_TOPIC_ALIASES||{};
  const MODES=['cards','quiz','person','chrono'];

  function getEra(){
    const active=document.querySelector('.period-card.active');
    if(active){
      for(const era of Object.keys(ERA_ASSETS)) if(active.classList.contains(era)) return era;
    }
    const t=(document.getElementById('topicsTitle')?.textContent||'').toLowerCase();
    if(t.includes('орта ғасыр')) return 'medieval';
    if(t.includes('жаңа заман')) return 'modern';
    if(t.includes('қазіргі заман')) return 'contemporary';
    return 'ancient';
  }

  function progress(id){
    try{
      const all=JSON.parse(localStorage.getItem('juzderek_topics_progress')||'{}');
      const t=all[id]||{};
      const completed=Array.isArray(t.completed)?[...new Set(t.completed)]:[];
      const done=MODES.filter(m=>completed.includes(m));
      return Math.round(done.length/MODES.length*100);
    }catch{return 0}
  }

  function setTextIfChanged(el,value){
    if(el && el.textContent!==value) el.textContent=value;
  }

  function decorate(){
    const grid=document.getElementById('topicGrid');
    if(!grid) return;
    const era=getEra();
    const asset=ERA_ASSETS[era]||ERA_ASSETS.ancient;

    grid.querySelectorAll('.topic-card').forEach(card=>{
      card.classList.add('jz-topic-card');
      if(card.dataset.era!==era) card.dataset.era=era;

      const idx=card.querySelector('.topic-index');
      if(idx){
        idx.classList.add('jz-era-thumb');
        const bg=`url("${asset}")`;
        if(idx.style.getPropertyValue('background-image')!==bg) idx.style.setProperty('background-image',bg,'important');
        idx.style.setProperty('background-size','78% auto','important');
        idx.style.setProperty('background-position','center','important');
        idx.style.setProperty('background-repeat','no-repeat','important');
        idx.style.setProperty('font-size','0','important');
        if(idx.textContent!=='') idx.textContent='';
      }

      const text=(card.textContent||'').trim();
      const name=Object.keys(TOPICS).find(n=>text.includes(n));
      const go=card.querySelector('.topic-go');
      const desc=card.querySelector('p');
      const meta=name?window.JUZDEREK_TOPIC_INDEX?.[TOPICS[name]]:null;

      if(name&&meta?.ready===true){
        card.classList.add('jz-available','ready');
        const pct=progress(TOPICS[name]);
        const label=pct===100?'Тақырып толық аяқталды':pct>0?`Оқу жалғасып жатыр · ${pct}%`:'Оқуды бастауға дайын';
        setTextIfChanged(desc,label);
        if(go && go.getAttribute('aria-label')!=='Тақырыпты ашу') go.setAttribute('aria-label','Тақырыпты ашу');
      }else{
        card.classList.remove('jz-available','ready');
      }
    });
  }

  let raf=0;
  function schedule(){
    if(raf) return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      decorate();
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule);
  else schedule();
  window.addEventListener('storage',schedule);
  window.addEventListener('pageshow',schedule);
  window.addEventListener('juzderek:progress',schedule);

  const grid=document.getElementById('topicGrid');
  if(grid){
    // Only watch cards being replaced/added. Do not observe subtree text updates,
    // otherwise decorate() can trigger itself forever and freeze the page.
    new MutationObserver(schedule).observe(grid,{childList:true});
  }

  if(!document.querySelector('link[href*="real-stats-progress.css"]')){
    const l=document.createElement('link');
    l.rel='stylesheet';
    l.href='./real-stats-progress.css?v=20260819-release';
    document.head.appendChild(l);
  }
  if(!document.querySelector('script[src*="real-stats-progress.js"]')){
    const s=document.createElement('script');
    s.src='./real-stats-progress.js?v=20260819-release';
    document.body.appendChild(s);
  }
})();