(()=>{
  const RANKS=[
    {name:'Ізденуші',min:0,image:'./assets/level-seeker.webp'},
    {name:'Зерттеуші',min:2500,image:'./assets/level-researcher.webp'},
    {name:'Білгір',min:7500,image:'./assets/level-scholar.webp'},
    {name:'Сарапшы',min:15000,image:'./assets/level-expert.webp'},
    {name:'Тарихшы',min:25000,image:'./assets/level-historian.webp'},
    {name:'Аңыз',min:40000,image:'./assets/level-legend.webp'}
  ];
  const safeJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const currentXp=()=>Math.max(0,Number(safeJSON('juzderek_game_progress',{xp:0}).xp)||0);
  function levelInfo(xp){
    const level=Math.floor(xp/500)+1;
    const min=(level-1)*500,nextMin=level*500;
    return{level,min,nextMin,need:Math.max(0,nextMin-xp),pct:clamp(Math.round(((xp-min)/500)*100),0,100)};
  }
  function rankInfo(xp){let current=RANKS[0];for(const rank of RANKS){if(xp>=rank.min)current=rank;else break}const index=RANKS.indexOf(current);return{current,index,next:RANKS[index+1]||null}}
  function journeyHTML(activeIndex){return RANKS.map((rank,index)=>{const state=index<activeIndex?'done':index===activeIndex?'current':'locked';return `<div class="level-journey-step ${state}" data-rank-index="${index}"><div class="level-character-wrap"><img class="level-character" src="${rank.image}" alt="${rank.name}" loading="lazy"></div><div class="level-journey-dot"><span>${index<activeIndex?'✓':index+1}</span></div><div class="level-journey-step-copy"><strong>${rank.name}</strong><small>${rank.min.toLocaleString('kk-KZ')} XP</small></div></div>`}).join('')}
  function mobileSummaryHTML(xp,level,rank){
    const next=rank.next;
    const rankTarget=next?.min||rank.current.min;
    const rankBase=rank.current.min;
    const rankRange=Math.max(1,rankTarget-rankBase);
    const rankPct=next?clamp(Math.round(((xp-rankBase)/rankRange)*100),0,100):100;
    const rankNeed=next?Math.max(0,next.min-xp):0;
    return `<div class="level-mobile-summary"><div class="level-mobile-current"><img src="${rank.current.image}" alt="${rank.current.name}" class="level-mobile-character"><div class="level-mobile-copy"><div class="level-mobile-title"><strong>${rank.current.name}</strong><span class="level-chip">Lv.${level.level}</span></div><b>${xp.toLocaleString('kk-KZ')} / ${(next?.min||xp).toLocaleString('kk-KZ')} XP</b><div class="level-mobile-track"><span style="width:${rankPct}%"></span></div><small>${next?`${next.name}ге ${rankNeed.toLocaleString('kk-KZ')} XP қалды`:'Ең жоғары атаққа жеттің!'}</small></div></div>${next?`<div class="level-mobile-next"><span class="level-mobile-next-label">КЕЛЕСІ ДЕҢГЕЙ</span><div class="level-mobile-next-card"><img src="${next.image}" alt="${next.name}"><div><strong>${next.name}</strong><small>${next.min.toLocaleString('kk-KZ')} XP</small></div><span class="level-mobile-arrow">›</span></div></div>`:''}</div>`;
  }
  function centerActiveStep(host,activeIndex){
    if(!window.matchMedia('(max-width:640px)').matches)return;
    requestAnimationFrame(()=>{
      const route=host.querySelector('.level-journey-route');
      const active=route?.querySelector(`[data-rank-index="${activeIndex}"]`);
      if(route&&active){const left=active.offsetLeft-(route.clientWidth-active.offsetWidth)/2;route.scrollTo({left:Math.max(0,left),behavior:'auto'})}
    });
  }
  function render(){
    const recentCard=document.querySelector('.recent-card');if(!recentCard)return;
    const xp=currentXp(),level=levelInfo(xp),rank=rankInfo(xp);
    let host=recentCard.querySelector('#levelJourney');if(!host){host=document.createElement('section');host.id='levelJourney';host.className='level-journey';recentCard.appendChild(host)}
    const nextLevelText=`Келесі level-ге ${level.need.toLocaleString('kk-KZ')} XP қалды`;
    host.innerHTML=`<div class="level-desktop-summary"><div class="level-journey-head"><div><span class="level-journey-kicker">СЕНІҢ ДЕҢГЕЙІҢ</span><div class="level-journey-title-row"><h3>${rank.current.name}</h3><span class="level-chip">Lv.${level.level}</span></div><p>${nextLevelText}</p></div><div class="level-xp-total"><strong>${xp.toLocaleString('kk-KZ')} XP</strong><span>${rank.next?`Келесі атақ: ${rank.next.name}`:'Максималды атақ'}</span></div></div><div class="level-progress-wrap"><div class="level-progress-meta"><span>${level.min.toLocaleString('kk-KZ')} XP</span><strong>${level.pct}%</strong><span>${level.nextMin.toLocaleString('kk-KZ')} XP</span></div><div class="level-progress-track"><span style="width:${level.pct}%"></span></div></div></div>${mobileSummaryHTML(xp,level,rank)}<div class="level-journey-route" aria-label="Атақтар жолы">${journeyHTML(rank.index)}</div><div class="level-mobile-hint">← Сырғытып, барлық деңгейлерді көр →</div>`;
    centerActiveStep(host,rank.index);
  }
  const schedule=()=>requestAnimationFrame(render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
  window.addEventListener('juzderek:progress',schedule);
  window.addEventListener('storage',event=>{if(event.key==='juzderek_game_progress')schedule()});
  window.addEventListener('pageshow',schedule);
  window.addEventListener('resize',()=>{const host=document.querySelector('#levelJourney');if(host)centerActiveStep(host,rankInfo(currentXp()).index)});
})();
