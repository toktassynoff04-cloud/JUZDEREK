(()=>{
  if(window.__JUZ_FEATURE_GUIDE)return;window.__JUZ_FEATURE_GUIDE=true;
  const KEY='juzderek_seen_features_v1';
  const ONBOARDING_KEY='juzderek_onboarding_v1';
  const features=[
    {id:'daily_review_v1',target:'#dailyReview',title:'Күндік 10 — жаңа мүмкіндік',text:'Қате жіберген немесе әлсіз мәліметтерің осы жерге жиналады. Күн сайын 10 мәліметке дейін қысқа қайталап, біліміңді біртіндеп бекітесің.'},
    {id:'leaderboard_v1',target:'.leaderboard-card',title:'Үздіктер тақтасы — жаңа мүмкіндік',text:'XP жинап, басқа оқушылармен рейтингіңді салыстыр. Мұнда Top 5 көрінеді, ал «TOP 20» арқылы толық рейтинг пен өз орныңды аша аласың.'}
  ];
  const seen=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
  const save=id=>{const s=new Set(seen());s.add(id);localStorage.setItem(KEY,JSON.stringify([...s]))};
  const readyForSecondTour=()=>localStorage.getItem(ONBOARDING_KEY)==='done'&&!!localStorage.getItem('juzderek_username');
  function place(pop,target){
    const r=target.getBoundingClientRect(),w=Math.min(360,innerWidth-28),gap=16;
    let left=Math.max(14,Math.min(innerWidth-w-14,r.right-w));
    let top=r.bottom+gap;
    if(top+230>innerHeight)top=Math.max(14,r.top-230-gap);
    pop.style.left=left+'px';pop.style.top=top+'px';
  }
  function run(){
    if(!readyForSecondTour())return;
    const done=new Set(seen()),queue=features.filter(f=>!done.has(f.id)&&document.querySelector(f.target));
    if(!queue.length)return;
    let i=0,closed=false;
    const back=document.createElement('div'),pop=document.createElement('div');
    back.className='feature-guide-backdrop';pop.className='feature-guide-pop';
    document.body.append(back,pop);document.body.classList.add('juz-feature-guide-open');
    function show(){
      if(closed)return;
      const f=queue[i],target=document.querySelector(f.target);if(!target){next();return}
      document.querySelector('.feature-guide-target')?.classList.remove('feature-guide-target');
      target.classList.add('feature-guide-target');
      target.scrollIntoView({behavior:'smooth',block:'center'});
      pop.innerHTML=`<div class="feature-guide-kicker">ЖАҢА ФУНКЦИЯ</div><h3>${f.title}</h3><p>${f.text}</p><div class="feature-guide-actions"><button class="feature-guide-skip" type="button">Кейін</button><span class="feature-guide-count">${i+1} / ${queue.length}</span><button class="feature-guide-btn" type="button">${i===queue.length-1?'Түсіндім':'Келесі →'}</button></div>`;
      setTimeout(()=>{if(pop.isConnected)place(pop,target)},380);
      pop.querySelector('.feature-guide-btn').onclick=()=>{save(f.id);next()};
      pop.querySelector('.feature-guide-skip').onclick=close;
    }
    function next(){i++;if(i>=queue.length)close();else show()}
    function close(){if(closed)return;closed=true;document.querySelector('.feature-guide-target')?.classList.remove('feature-guide-target');back.remove();pop.remove();document.body.classList.remove('juz-feature-guide-open')}
    back.onclick=close;show();
    addEventListener('resize',()=>{const f=queue[i],t=f&&document.querySelector(f.target);if(t&&pop.isConnected)place(pop,t)},{passive:true});
  }
  function auto(){setTimeout(run,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',auto);else auto();
  document.addEventListener('juzderek:onboarding-done',()=>setTimeout(run,350));
  window.JUZ_FEATURE_GUIDE={run,reset:()=>{localStorage.removeItem(KEY);run()}};
})();