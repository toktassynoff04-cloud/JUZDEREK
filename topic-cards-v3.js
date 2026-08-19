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
  function decorate(){
    const grid=document.getElementById('topicGrid'); if(!grid)return;
    const era=currentEra();
    grid.dataset.era=era.key;
    grid.querySelectorAll('.topic-card').forEach((card,i)=>{
      card.classList.add('jz-topic-v3');
      card.dataset.era=era.key;
      let art=card.querySelector('.jz-era-art');
      if(!art){
        art=document.createElement('span'); art.className='jz-era-art';
        const img=document.createElement('img'); img.alt=''; img.decoding='async'; img.loading='lazy'; art.appendChild(img);
        card.insertBefore(art,card.firstChild);
      }
      const img=art.querySelector('img'); if(img&&img.getAttribute('src')!==era.img) img.src=era.img;
      const idx=card.querySelector('.topic-index'); if(idx) idx.textContent=String(i+1).padStart(2,'0');
      const status=card.querySelector('p');
      if(status){
        const ready=/Оқуды бастауға дайын|Жалғастыру|Аяқталды|Прогресс/i.test(card.textContent||'')||card.classList.contains('ready')||card.classList.contains('topic-progress-card');
        status.classList.toggle('jz-status-ready',ready);
      }
    });
  }
  let t=0; const schedule=()=>{clearTimeout(t);t=setTimeout(decorate,10)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  window.addEventListener('pageshow',schedule);
})();