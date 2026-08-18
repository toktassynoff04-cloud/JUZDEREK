(()=>{
  const AVATAR='./assets/image-Photoroom%20-%202026-08-18T223037.285.png';
  function activeKey(){const p=(location.pathname.split('/').pop()||'index.html').toLowerCase();if(p==='games.html')return'games';if(p==='periods.html'){if(location.hash==='#topicsSection')return'topics';if(location.hash==='#navProgress')return'progress';return'periods'}return'home'}
  function progress(){try{return JSON.parse(localStorage.getItem('juzderek_game_progress')||'{"xp":0,"correct":0}')}catch{return{xp:0,correct:0}}}
  function link(key,href,label){return `<a class="site-nav-link${activeKey()===key?' active':''}" href="${href}">${label}</a>`}
  function render(){
    const host=document.querySelector('[data-site-header]')||document.querySelector('.site-header');
    if(!host)return;
    const p=progress(),xp=Number(p.xp)||0,level=Math.max(1,Math.floor(xp/250)+1);
    host.className='site-header';host.setAttribute('data-shared-header','true');
    host.innerHTML=`<div class="site-header-inner"><a class="site-brand" href="index.html" aria-label="JUZDEREK басты бет"><span class="site-logo-mark"></span><span class="site-brand-text">JUZDEREK</span></a><nav class="site-nav">${link('home','index.html','Басты бет')}${link('periods','periods.html','Кезеңдер')}${link('topics','periods.html#topicsSection','Тақырыптар')}${link('games','games.html','Ойындар')}${link('progress','periods.html#navProgress','Прогресс')}${link('leaders','periods.html','Үздіктер')}</nav><div class="site-profile-wrap"><button class="site-profile" type="button" aria-expanded="false"><span class="site-avatar"><img src="${AVATAR}" alt=""></span><span class="profile-name">Азамат</span><span class="site-chevron">⌄</span></button><div class="profile-menu"><div class="profile-menu-head"><span class="profile-menu-avatar"><img src="${AVATAR}" alt=""></span><div><div class="profile-menu-name">Азамат</div><span class="profile-menu-level">Lv. ${level}</span></div></div><div class="profile-mini-stats"><div class="profile-mini-stat"><b>${xp} XP</b><span>Жиналған ұпай</span></div><div class="profile-mini-stat"><b>12 күн</b><span>Оқу сериясы</span></div></div><div class="profile-menu-divider"></div><div class="profile-menu-links"><a class="profile-menu-link" href="periods.html#navProgress"><span class="profile-menu-icon">◎</span>Менің прогресім</a><a class="profile-menu-link" href="periods.html"><span class="profile-menu-icon">♕</span>Үздіктер тақтасы</a><button class="profile-menu-link" type="button"><span class="profile-menu-icon">⚙</span>Баптаулар</button><button class="profile-menu-link logout" type="button"><span class="profile-menu-icon">↪</span>Шығу</button></div></div></div></div>`;
    const btn=host.querySelector('.site-profile'),menu=host.querySelector('.profile-menu');
    const close=()=>{menu.classList.remove('open');btn.setAttribute('aria-expanded','false')};
    btn.onclick=e=>{e.stopPropagation();const open=!menu.classList.contains('open');menu.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open))};menu.onclick=e=>e.stopPropagation();document.addEventListener('click',close);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
  window.addEventListener('hashchange',render);
})();