(()=>{
  const categories=[
    {id:'islands',icon:'🏝️',name:'Аралдар',count:17,copy:'Аралдар мен архипелагтарды картадан тап.'},
    {id:'peninsulas',icon:'🧭',name:'Түбектер',count:10,copy:'Түбектерге арналған жеке карта.'},
    {id:'seas',icon:'🌊',name:'Теңіздер',count:15,copy:'Теңіздерді су аймақтары бойынша тап.'},
    {id:'oceans',icon:'🌐',name:'Мұхиттар',count:4,copy:'Негізгі мұхиттарды дүниежүзі картасынан тап.'},
    {id:'gulfs',icon:'🌀',name:'Шығанақтар',count:4,copy:'Шығанақтарға ыңғайлы жеке карта.'},
    {id:'straits',icon:'↔️',name:'Бұғаздар',count:5,copy:'Ұсақ нысандар үшін жақындатылған карта.'},
    {id:'rivers',icon:'〰️',name:'Өзендер',count:12,copy:'Өзен арналары анық көрінетін карта.'},
    {id:'historical',icon:'🏺',name:'Тарихи-географиялық аймақтар',count:9,copy:'Тарихтағы маңызды аймақтарды картадан тап.'}
  ];

  const home=document.getElementById('mapHome'),play=document.getElementById('mapPlay'),grid=document.getElementById('categoryGrid');
  const playCategory=document.getElementById('playCategory'),playTitle=document.getElementById('playTitle'),progressChip=document.getElementById('progressChip');
  const questionMeta=document.getElementById('questionMeta'),questionText=document.getElementById('questionText'),progressBar=document.getElementById('progressBar');
  const foundCount=document.getElementById('foundCount'),missCount=document.getElementById('missCount'),feedback=document.getElementById('feedback');
  const mapImage=document.getElementById('mapImage'),mapPlaceholder=document.getElementById('mapPlaceholder'),mapStatus=document.getElementById('mapStatus'),hitLayer=document.getElementById('hitLayer');
  const viewport=document.getElementById('mapViewport'),canvas=document.getElementById('mapCanvas');

  categories.forEach(c=>{
    const b=document.createElement('button');b.type='button';b.className='map-category';
    b.innerHTML=`<span class="map-category-icon">${c.icon}</span><div><strong>${c.name}</strong><small>${c.copy}</small></div><small>${c.count} нысан</small>`;
    b.addEventListener('click',()=>openCategory(c));grid.appendChild(b)
  });

  function openCategory(c){
    home.hidden=true;play.hidden=false;playCategory.textContent=c.name.toUpperCase();playTitle.textContent='Картадан тап';progressChip.textContent=`1 / ${c.count}`;
    questionMeta.textContent=`${c.name} · Сұрақ 1 / ${c.count}`;questionText.textContent='Карта дайын болғанда бірінші сұрақ осы жерде шығады.';
    progressBar.style.width='0%';foundCount.textContent='0';missCount.textContent='0';feedback.className='map-feedback';feedback.textContent='Нысанның дәл үстін бас.';
    mapImage.hidden=true;mapImage.removeAttribute('src');mapPlaceholder.hidden=false;hitLayer.innerHTML='';mapStatus.textContent=`${c.name}: карта кейін жеке WebP ретінде жалғанады`;
    resetView();window.scrollTo({top:0,behavior:'smooth'});
  }

  document.getElementById('backToCategories').addEventListener('click',()=>{play.hidden=true;home.hidden=false;resetView()});

  let scale=1,tx=0,ty=0,drag=false,sx=0,sy=0,stx=0,sty=0;
  function apply(){canvas.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`}
  function resetView(){scale=1;tx=0;ty=0;apply()}
  function zoom(next){scale=Math.max(1,Math.min(5,next));apply()}
  document.getElementById('zoomIn').addEventListener('click',()=>zoom(scale+.35));
  document.getElementById('zoomOut').addEventListener('click',()=>zoom(scale-.35));
  document.getElementById('zoomReset').addEventListener('click',resetView);
  viewport.addEventListener('pointerdown',e=>{if(e.target.closest('[data-hit]'))return;drag=true;sx=e.clientX;sy=e.clientY;stx=tx;sty=ty;viewport.setPointerCapture?.(e.pointerId)});
  viewport.addEventListener('pointermove',e=>{if(!drag)return;tx=stx+(e.clientX-sx);ty=sty+(e.clientY-sy);apply()});
  viewport.addEventListener('pointerup',()=>{drag=false});
})();