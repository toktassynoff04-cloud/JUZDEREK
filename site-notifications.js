(()=>{
  const notice={
    id:'welcome-notice-2026-09-v2',
    kicker:'JUZDEREK ХАБАРЛАМАСЫ',
    title:'Саған хабарлама бар! 🔔',
    body:'JUZDEREK ішінде жаңа мүмкіндіктер біртіндеп қосылып жатыр. Маңызды жаңалықтар осында көрінеді.',
    cta:'Түсіндім'
  };
  const key=`juzderek_notice_seen_${notice.id}`;
  if(localStorage.getItem(key)==='1')return;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let shown=false;
  function blocked(){return document.querySelector('.username-onboarding')||document.querySelector('.welcome-gift-modal')||document.querySelector('.onboarding-overlay')}
  function show(){
    if(shown||localStorage.getItem(key)==='1'||document.querySelector('.juz-notice')||blocked())return false;
    shown=true;
    const el=document.createElement('aside');
    el.className='juz-notice';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    el.innerHTML=`<div class="juz-notice-head"><div class="juz-notice-icon">🔔</div><div class="juz-notice-copy"><span class="juz-notice-kicker">${esc(notice.kicker)}</span><h3>${esc(notice.title)}</h3><p>${esc(notice.body)}</p></div><button class="juz-notice-close" type="button" aria-label="Жабу">×</button></div><div class="juz-notice-actions"><button class="juz-notice-btn secondary" type="button" data-later>Кейін</button><button class="juz-notice-btn primary" type="button" data-read>${esc(notice.cta)}</button></div>`;
    document.body.appendChild(el);
    requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('show')));
    const close=(markSeen)=>{if(markSeen)localStorage.setItem(key,'1');el.classList.remove('show');setTimeout(()=>el.remove(),220)};
    el.querySelector('[data-read]').onclick=()=>close(true);
    el.querySelector('.juz-notice-close').onclick=()=>close(true);
    el.querySelector('[data-later]').onclick=()=>{shown=false;close(false)};
    return true;
  }
  function tryShow(){if(document.visibilityState!=='hidden')show()}
  const observer=new MutationObserver(()=>{if(!shown&&!blocked())setTimeout(tryShow,350)});
  function init(){
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(tryShow,900);
    setTimeout(tryShow,2500);
    setTimeout(tryShow,6000);
    window.addEventListener('pageshow',()=>setTimeout(tryShow,500));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(tryShow,500)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();