(()=>{
  const RANKS=[
    {name:'Ізденуші',min:0},
    {name:'Зерттеуші',min:2500},
    {name:'Білгір',min:7500},
    {name:'Сарапшы',min:15000},
    {name:'Тарихшы',min:25000},
    {name:'Аңыз',min:40000}
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
  function journeyHTML(activeIndex){return RANKS.map((rank,index)=>{const state=index<activeIndex?'done':index===activeIndex?'current':'locked';return `<div class="level-journey-step ${state}"><div class="level-journey-dot"><span>${index<activeIndex?'✓':index+1}</span></div><div class="level-journey-step-copy"><strong>${rank.name}</strong><small>${rank.min.toLocaleString('kk-KZ')} XP</small></div></div>`}).join('')}
  function render(){
    const recentCard=document.querySelector('.recent-card');if(!recentCard)return;
    const xp=currentXp(),level=levelInfo(xp),rank=rankInfo(xp);
    let host=recentCard.querySelector('#levelJourney');if(!host){host=document.createElement('section');host.id='levelJourney';host.className='level-journey';recentCard.appendChild(host)}
    const nextLevelText=`Келесі level-ге ${level.need.toLocaleString('kk-KZ')} XP қалды`;
    host.innerHTML=`<div class="level-journey-head"><div><span class="level-journey-kicker">СЕНІҢ ДЕҢГЕЙІҢ</span><div class="level-journey-title-row"><h3>${rank.current.name}</h3><span class="level-chip">Lv.${level.level}</span></div><p>${nextLevelText}</p></div><div class="level-xp-total"><strong>${xp.toLocaleString('kk-KZ')} XP</strong><span>${rank.next?`Келесі атақ: ${rank.next.name}`:'Максималды атақ'}</span></div></div><div class="level-progress-wrap"><div class="level-progress-meta"><span>${level.min.toLocaleString('kk-KZ')} XP</span><strong>${level.pct}%</strong><span>${level.nextMin.toLocaleString('kk-KZ')} XP</span></div><div class="level-progress-track"><span style="width:${level.pct}%"></span></div></div><div class="level-journey-route">${journeyHTML(rank.index)}</div>`;
  }
  const schedule=()=>requestAnimationFrame(render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
  window.addEventListener('juzderek:progress',schedule);
  window.addEventListener('storage',event=>{if(event.key==='juzderek_game_progress')schedule()});
  window.addEventListener('pageshow',schedule);
})();
