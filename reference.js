(() => {
  const heroMascot = './assets/image-Photoroom%20-%202026-08-18T223037.285.png?v=4';
  const heroImg = document.querySelector('.hero-mascot');
  if (heroImg) { heroImg.decoding='async'; heroImg.loading='eager'; heroImg.onerror=null; heroImg.src=heroMascot; }
  const hero=document.getElementById('periodHero'), title=document.getElementById('heroTitle');
  if(hero&&title){function syncReferenceHero(){hero.classList.toggle('reference-ancient',title.textContent.trim()==='Ежелгі заман')}syncReferenceHero();new MutationObserver(syncReferenceHero).observe(title,{childList:true,characterData:true,subtree:true})}

  const VERSION='20260819-leaderboard-2';
  const oldProfileCss=document.querySelector('link[href*="profile-menu.css"]');
  if(oldProfileCss) oldProfileCss.href=`./profile-menu.css?v=${VERSION}`;
  else {const css=document.createElement('link');css.rel='stylesheet';css.href=`./profile-menu.css?v=${VERSION}`;document.head.appendChild(css)}

  if(!document.querySelector('link[href*="leaderboard-full.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href=`./leaderboard-full.css?v=${VERSION}`;document.head.appendChild(l)}
  function loadLeaderboard(cb){
    if(typeof window.openJuzLeaderboard==='function'){cb&&cb();return}
    const existing=document.querySelector('script[src*="leaderboard-full.js"]');
    if(existing){existing.addEventListener('load',()=>cb&&cb(),{once:true});return}
    const s=document.createElement('script');s.src=`./leaderboard-full.js?v=${VERSION}`;s.onload=()=>cb&&cb();document.body.appendChild(s)
  }
  loadLeaderboard();

  const oldShared=document.querySelector('script[src*="site-header-component.js"]');
  if(oldShared) oldShared.remove();
  const script=document.createElement('script');
  script.src=`./site-header-component.js?v=${VERSION}`;
  script.onload=()=>{document.documentElement.classList.add('shared-header-ready');ensureUsernameEdit()};
  document.body.appendChild(script);

  function ensureUsernameEdit(){
    const links=document.querySelector('.profile-menu-links');
    if(!links || links.querySelector('[data-change-username],#changeUsername')) return;
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='profile-menu-link';
    btn.setAttribute('data-change-username','');
    btn.innerHTML='<span class="profile-menu-icon">✎</span>Пайдаланушы атын өзгерту';
    const settings=[...links.querySelectorAll('button,a')].find(el=>/Баптаулар/i.test(el.textContent||''));
    if(settings) links.insertBefore(btn,settings); else links.appendChild(btn);
    btn.addEventListener('click',()=>{
      localStorage.removeItem('juzderek_username');
      const menu=document.querySelector('.profile-menu');
      if(menu) menu.classList.remove('open');
      if(typeof window.showJuzUsernameModal==='function') window.showJuzUsernameModal(true);
      else location.reload();
    });
  }
  const observer=new MutationObserver(()=>ensureUsernameEdit());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(ensureUsernameEdit,100);
  setTimeout(ensureUsernameEdit,500);
  setTimeout(ensureUsernameEdit,1500);

  /* Capture-phase delegation: button works even if another script replaces onclick. */
  document.addEventListener('click',e=>{
    const target=e.target.closest('.leaderboard-card .text-btn,.site-nav-link,.profile-menu-link');
    if(!target) return;
    const text=(target.textContent||'').trim();
    if(!/Толық рейтинг|Үздіктер/i.test(text)) return;
    e.preventDefault();e.stopPropagation();
    loadLeaderboard(()=>{if(typeof window.openJuzLeaderboard==='function')window.openJuzLeaderboard()});
  },true);

  const modeMap={cards:'cards',date:'quiz',person:'person',chrono:'chrono'};
  document.addEventListener('click',e=>{const gameBtn=e.target.closest('#games .game-tab');if(gameBtn){e.preventDefault();e.stopImmediatePropagation();location.href=`games.html?mode=${modeMap[gameBtn.dataset.game]||'cards'}&v=${VERSION}`;return}},true);
})();