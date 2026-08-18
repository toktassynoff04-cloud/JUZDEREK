(()=>{
  const AVATAR='./assets/image-Photoroom%20-%202026-08-18T223037.285.png';
  const LEVELS=[
    {level:1,name:'Ізденуші',min:0},
    {level:2,name:'Ізденуші',min:500},
    {level:3,name:'Зерттеуші',min:1200},
    {level:4,name:'Зерттеуші',min:2200},
    {level:5,name:'Білгір',min:3500},
    {level:6,name:'Білгір',min:5000},
    {level:7,name:'Білгір',min:7000},
    {level:8,name:'Сарапшы',min:9500},
    {level:9,name:'Сарапшы',min:12500},
    {level:10,name:'Сарапшы',min:16000},
    {level:11,name:'Тарихшы',min:20000},
    {level:12,name:'Тарихшы',min:25000},
    {level:13,name:'Тарихшы',min:31000},
    {level:14,name:'Аңыз',min:38000},
    {level:15,name:'Аңыз',min:46000}
  ];
  function activeKey(){const p=(location.pathname.split('/').pop()||'index.html').toLowerCase();if(p==='games.html')return'games';if(p==='periods.html'){if(location.hash==='#topicsSection')return'topics';if(location.hash==='#navProgress')return'progress';return'periods'}return'home'}
  function progress(){try{return JSON.parse(localStorage.getItem('juzderek_game_progress')||'{"xp":0,"correct":0}')}catch{return{xp:0,correct:0}}}
  function levelInfo(xp){let current=LEVELS[0];for(const item of LEVELS){if(xp>=item.min)current=item;else break}const idx=LEVELS.findIndex(x=>x.level===current.level);const next=LEVELS[idx+1]||null;if(!next)return{...current,next:null,pct:100,need:0};const span=next.min-current.min;const gained=xp-current.min;const pct=Math.max(0,Math.min(100,Math.round(gained/span*100)));return{...current,next,pct,need:Math.max(0,next.min-xp)}}
  function link(key,href,label){return `<a class="site-nav-link${activeKey()===key?' active':''}" href="${href}">${label}</a>`}
  function render(){
    const host=document.querySelector('[data-site-header]')||document.querySelector('.site-header');if(!host)return;
    const p=progress(),xp=Number(p.xp)||0,info=levelInfo(xp);
    host.className='site-header';host.setAttribute('data-shared-header','true');
    const nextText=info.next?`Келесі деңгейге ${info.need} XP`:'Максималды деңгей';
    const nextName=info.next?`Келесі: Lv.${info.next.level} · ${info.next.name}`:'Сен ең жоғары деңгейге жеттің!';
    host.innerHTML=`<div class="site-header-inner"><a class="site-brand" href="index.html"><span class="site-logo-mark"></span><span class="site-brand-text">JUZDEREK</span></a><nav class="site-nav">${link('home','index.html','Басты бет')}${link('periods','periods.html','Кезеңдер')}${link('topics','periods.html#topicsSection','Тақырыптар')}${link('games','games.html','Ойындар')}${link('progress','periods.html#navProgress','Прогресс')}${link('leaders','periods.html','Үздіктер')}</nav><div class="site-profile-wrap"><button class="site-profile" type="button" aria-expanded="false"><span class="site-avatar"><img src="${AVATAR}" alt=""></span><span class="profile-name">Азамат</span><span class="profile-header-level">Lv.${info.level}</span><span class="site-chevron">⌄</span></button><div class="profile-menu"><div class="profile-menu-head"><span class="profile-menu-avatar"><img src="${AVATAR}" alt=""></span><div><div class="profile-menu-name">Азамат</div><div class="profile-level-line"><span class="profile-menu-level">Lv. ${info.level}</span><span class="profile-rank-name">${info.name}</span></div></div></div><div class="profile-level-card"><div class="profile-level-top"><div><small>Деңгей прогресі</small><strong>${xp} XP</strong></div><span>${info.pct}%</span></div><div class="profile-level-track"><span style="width:${info.pct}%"></span></div><div class="profile-level-next">${nextText}</div><small class="profile-level-target">${nextName}</small></div><div class="profile-mini-stats"><div class="profile-mini-stat"><b>${p.correct||0}</b><span>Дұрыс әрекет</span></div><div class="profile-mini-stat"><b>12 күн</b><span>Оқу сериясы</span></div></div><div class="profile-menu-divider"></div><div class="profile-menu-links"><a class="profile-menu-link" href="periods.html#navProgress"><span class="profile-menu-icon">◎</span>Менің прогресім</a><a class="profile-menu-link" href="periods.html"><span class="profile-menu-icon">♕</span>Үздіктер тақтасы</a><button class="profile-menu-link" type="button"><span class="profile-menu-icon">⚙</span>Баптаулар</button><button class="profile-menu-link logout" type="button"><span class="profile-menu-icon">↪</span>Шығу</button></div></div></div></div>`;
    const btn=host.querySelector('.site-profile'),menu=host.querySelector('.profile-menu');const close=()=>{menu.classList.remove('open');btn.setAttribute('aria-expanded','false')};btn.onclick=e=>{e.stopPropagation();const open=!menu.classList.contains('open');menu.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open))};menu.onclick=e=>e.stopPropagation();document.addEventListener('click',close,{once:true});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()},{once:true});
  }
  window.JUZ_LEVELS=LEVELS;window.refreshSharedHeader=render;
  function init(){render();window.addEventListener('hashchange',render);window.addEventListener('storage',e=>{if(e.key==='juzderek_game_progress')render()});window.addEventListener('juzderek:progress',render)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();