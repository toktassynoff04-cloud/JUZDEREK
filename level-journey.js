(() => {
  const LEVELS = [
    { level: 1,  name: 'Ізденуші', min: 0 },
    { level: 2,  name: 'Ізденуші', min: 500 },
    { level: 3,  name: 'Зерттеуші', min: 1200 },
    { level: 4,  name: 'Зерттеуші', min: 2200 },
    { level: 5,  name: 'Білгір', min: 3500 },
    { level: 6,  name: 'Білгір', min: 5000 },
    { level: 7,  name: 'Білгір', min: 7000 },
    { level: 8,  name: 'Сарапшы', min: 9500 },
    { level: 9,  name: 'Сарапшы', min: 12500 },
    { level: 10, name: 'Сарапшы', min: 16000 },
    { level: 11, name: 'Тарихшы', min: 20000 },
    { level: 12, name: 'Тарихшы', min: 25000 },
    { level: 13, name: 'Тарихшы', min: 31000 },
    { level: 14, name: 'Аңыз', min: 38000 },
    { level: 15, name: 'Аңыз', min: 46000 }
  ];

  const RANKS = [
    { name: 'Ізденуші', min: 0 },
    { name: 'Зерттеуші', min: 1200 },
    { name: 'Білгір', min: 3500 },
    { name: 'Сарапшы', min: 9500 },
    { name: 'Тарихшы', min: 20000 },
    { name: 'Аңыз', min: 38000 }
  ];

  const safeJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function currentXp(){const progress=safeJSON('juzderek_game_progress',{xp:0});return Math.max(0,Number(progress.xp)||0)}
  function levelInfo(xp){let current=LEVELS[0];for(const item of LEVELS){if(xp>=item.min)current=item;else break}const index=LEVELS.findIndex(item=>item.level===current.level),next=LEVELS[index+1]||null,pct=next?clamp(Math.round(((xp-current.min)/(next.min-current.min))*100),0,100):100;return{...current,next,pct,need:next?Math.max(0,next.min-xp):0}}
  function rankInfo(xp){let current=RANKS[0];for(const rank of RANKS){if(xp>=rank.min)current=rank;else break}const index=RANKS.findIndex(rank=>rank.name===current.name);return{current,index,next:RANKS[index+1]||null}}
  function journeyHTML(activeIndex){return RANKS.map((rank,index)=>{const state=index<activeIndex?'done':index===activeIndex?'current':'locked';return `<div class="level-journey-step ${state}"><div class="level-journey-dot"><span>${index<activeIndex?'✓':index+1}</span></div><div class="level-journey-step-copy"><strong>${rank.name}</strong><small>${rank.min.toLocaleString('kk-KZ')} XP</small></div></div>`}).join('')}
  function render(){const recentCard=document.querySelector('.recent-card');if(!recentCard)return;const xp=currentXp(),level=levelInfo(xp),rank=rankInfo(xp);let host=recentCard.querySelector('#levelJourney');if(!host){host=document.createElement('section');host.id='levelJourney';host.className='level-journey';recentCard.appendChild(host)}const nextLevelText=level.next?`Келесі level-ге ${level.need.toLocaleString('kk-KZ')} XP қалды`:'Сен ең жоғары level-ге жеттің',levelEnd=level.next?level.next.min:level.min,levelStart=level.min;host.innerHTML=`<div class="level-journey-head"><div><span class="level-journey-kicker">СЕНІҢ ДЕҢГЕЙІҢ</span><div class="level-journey-title-row"><h3>${rank.current.name}</h3><span class="level-chip">Lv.${level.level}</span></div><p>${nextLevelText}</p></div><div class="level-xp-total"><strong>${xp.toLocaleString('kk-KZ')} XP</strong><span>${rank.next?`Келесі атақ: ${rank.next.name}`:'Максималды атақ'}</span></div></div><div class="level-progress-wrap"><div class="level-progress-meta"><span>${levelStart.toLocaleString('kk-KZ')} XP</span><strong>${level.pct}%</strong><span>${levelEnd.toLocaleString('kk-KZ')} XP</span></div><div class="level-progress-track"><span style="width:${level.pct}%"></span></div></div><div class="level-journey-route">${journeyHTML(rank.index)}</div>`}
  const schedule=()=>requestAnimationFrame(render);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
  window.addEventListener('juzderek:progress',schedule);window.addEventListener('storage',event=>{if(event.key==='juzderek_game_progress')schedule()});window.addEventListener('pageshow',schedule);
})();