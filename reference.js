(() => {
  const heroMascot='./assets/image-Photoroom%20-%202026-08-18T223037.285.png?v=4';
  const heroImg=document.querySelector('.hero-mascot');
  if(heroImg){heroImg.decoding='async';heroImg.loading='eager';heroImg.onerror=null;heroImg.src=heroMascot}

  const VERSION='20260819-flow-2';
  const oldProfileCss=document.querySelector('link[href*="profile-menu.css"]');
  if(oldProfileCss) oldProfileCss.href=`./profile-menu.css?v=${VERSION}`;
  else {const css=document.createElement('link');css.rel='stylesheet';css.href=`./profile-menu.css?v=${VERSION}`;document.head.appendChild(css)}

  const oldShared=document.querySelector('script[src*="site-header-component.js"]');
  if(oldShared)oldShared.remove();
  const script=document.createElement('script');
  script.src=`./site-header-component.js?v=${VERSION}`;
  script.onload=()=>{document.documentElement.classList.add('shared-header-ready');ensureUsernameEdit()};
  document.body.appendChild(script);

  function ensureUsernameEdit(){
    const links=document.querySelector('.profile-menu-links');
    if(!links||links.querySelector('[data-change-username],#changeUsername'))return;
    const btn=document.createElement('button');
    btn.type='button';btn.className='profile-menu-link';btn.setAttribute('data-change-username','');
    btn.innerHTML='<span class="profile-menu-icon">✎</span>Пайдаланушы атын өзгерту';
    links.appendChild(btn);
    btn.addEventListener('click',()=>{
      localStorage.removeItem('juzderek_username');
      const menu=document.querySelector('.profile-menu');if(menu)menu.classList.remove('open');
      if(typeof window.showJuzUsernameModal==='function')window.showJuzUsernameModal(true);else location.reload()
    })
  }
  new MutationObserver(()=>ensureUsernameEdit()).observe(document.documentElement,{childList:true,subtree:true});

  function currentTopicId(){
    const title=document.querySelector('#studyView h1')?.textContent||'';
    const aliases=window.JUZDEREK_TOPIC_ALIASES||{'Ежелгі Парсы мемлекеті':'ancient-persia','Ежелгі Грекия өркениеті':'ancient-greece'};
    return Object.keys(aliases).find(n=>title.includes(n)) ? aliases[Object.keys(aliases).find(n=>title.includes(n))] : 'ancient-persia'
  }
  document.addEventListener('click',e=>{
    const gameBtn=e.target.closest('#games .game-tab');
    if(!gameBtn)return;
    const map={cards:'cards',date:'quiz',person:'person',chrono:'chrono'};
    e.preventDefault();e.stopImmediatePropagation();
    location.href=`games.html?topic=${encodeURIComponent(currentTopicId())}&mode=${map[gameBtn.dataset.game]||'cards'}`
  },true);
})();