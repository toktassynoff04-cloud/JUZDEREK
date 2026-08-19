(()=>{
  const ERA={
    'Ежелгі заман':{key:'ancient',img:'./assets/ancient-topic.webp'},
    'Орта ғасыр':{key:'medieval',img:'./assets/medieval-topic.webp'},
    'Жаңа заман':{key:'modern',img:'./assets/modern-topic.webp'},
    'Қазіргі заман':{key:'contemporary',img:'./assets/contemporary-topic.webp'}
  };
  function currentEra(){
    const title=(document.getElementById('heroTitle')?.textContent||'Ежелгі заман').trim();
    return ERA[title]||ERA['Ежелгі заман'];
  }
  function getOriginal(card){
    const h=card.querySelector('h3');
    const p=card.querySelector('p');
    return {title:(h?.textContent||card.dataset.topic||'').trim(),status:(p?.textContent||'Контент кейін қосылады').trim()};
  }
  function rebuild(card,i,era){
    if(card.dataset.jzBuilt==='1') return;
    const {title,status}=getOriginal(card);
    card.dataset.jzBuilt='1';
    card.classList.add('jz-topic-v4');
    card.innerHTML=`<div class="jz-topic-main"><div class="jz-topic-visual"><img class="jz-topic-art" src="${era.img}" alt="" decoding="async" loading="lazy"><span class="jz-topic-number">${String(i+1).padStart(2,'0')}</span></div><div class="jz-topic-copy"><h3>${title}</h3><p class="jz-topic-status">${status}</p></div><span class="jz-topic-arrow" aria-hidden="true">→</span></div>`;
  }
  function refresh(card,i,era){
    rebuild(card,i,era);
    card.dataset.era=era.key;
    const img=card.querySelector('.jz-topic-art'); if(img&&img.getAttribute('src')!==era.img)img.src=era.img;
    const num=card.querySelector('.jz-topic-number');if(num)num.textContent=String(i+1).padStart(2,'0');
    const status=card.querySelector('.jz-topic-status');
    if(status){
      const active=card.classList.contains('ready')||card.classList.contains('topic-progress-card');
      status.classList.toggle('is-ready',active);
      if(active && /Контент кейін қосылады/.test(status.textContent||'')) status.textContent='Оқуды бастауға дайын';
    }
  }
  function decorate(){
    const grid=document.getElementById('topicGrid');if(!grid)return;
    const era=currentEra();grid.dataset.era=era.key;
    grid.querySelectorAll('.topic-card').forEach((card,i)=>refresh(card,i,era));
  }
  let t=0;function schedule(){clearTimeout(t);t=setTimeout(decorate,16)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  window.addEventListener('pageshow',schedule);
})();