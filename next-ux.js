(()=>{
  function ensureCss(href,key){
    if(document.querySelector(`link[data-${key}]`))return;
    const l=document.createElement('link');
    l.rel='stylesheet';
    l.href=href;
    l.setAttribute(`data-${key}`,'1');
    document.head.appendChild(l);
  }
  function init(){
    ensureCss('./mobile-nav-v2.css?v=20260823-2','juz-mobile-nav-v2');
    ensureCss('./profile-menu-mobile.css?v=20260823-1','juz-profile-menu-mobile');
    ensureCss('./profile-dropdown-mobile.css?v=20260823-1','juz-profile-dropdown-mobile');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();