(()=>{
  if(window.__JUZ_FEATURE_GUIDE)return;window.__JUZ_FEATURE_GUIDE=true;
  const KEY='juzderek_spotlight_tour_v2';
  const ONBOARDING_KEY='juzderek_onboarding_v1';
  const steps=[
    {id:'periods',target:'.period-grid',title:'Кезеңдер',text:'Тарих төрт кезеңге бөлінген. Қажетті кезеңді таңдап, сол дәуірдің тақырыптарына өтесің.'},
    {id:'daily_review',target:'#dailyReview',title:'Күндік 10',text:'Қате жіберген немесе әлсіз мәліметтерің осында жиналады. Күн сайын қысқа қайталау арқылы оларды бекітесің.'},
    {id:'today_progress',target:'.progress-section',title:'Бүгінгі прогресс',text:'Серияңды, XP-ыңды және бүгінгі миссияңды осы жерден бірден бақылайсың.'},
    {id:'progress_board',target:'#progressBoardMount',title:'Прогресс тақтасы',text:'Соңғы күндердегі XP динамикаң мен өсуіңді көресің. Қай күндері белсендірек болғаның бірден байқалады.'},
    {id:'leaderboard',target:'.leaderboard-card',title:'Үздіктер тақтасы',text:'XP бойынша Top 5 осы жерде. Толық Top 20 рейтингін ашып, өз орныңды да көре аласың.'},
    {id:'topics',target:'#topicsSection',title:'Тақырыптар мен ойындар',text:'Тақырыпты таңда да карточка, тест, хронология және тұлғаны тану ойындары арқылы біліміңді бекіт.'},
    {id:'tracker',target:'a[href="tracker.html"]',title:'Тақырыптар трекері',text:'Қай тақырыпты бастадың, қайсысын толық меңгердің — бәрін трекерден бақылауға болады.'},
    {id:'achievements',target:'a[href="achievements.html"]',title:'Жетістіктер',text:'Белсенділігің мен нәтижелерің үшін ашылған жетістіктерің осы бөлімде сақталады.'},
    {id:'collection',target:'a[href="collection.html"]',title:'Коллекция',text:'Сандықтардан тарихи тұлғалардың Сирек, Эпикалық және Аңыздық карталарын ашып, өз коллекцияңды жинайсың.'}
  ];
  const ready=()=>localStorage.getItem(ONBOARDING_KEY)==='done'&&!!localStorage.getItem('juzderek_username');
  function place(pop,target){const r=target.getBoundingClientRect(),w=Math.min(380,innerWidth-28),gap=16;let left=Math.max(14,Math.min(innerWidth-w-14,r.right-w)),top=r.bottom+gap;if(top+245>innerHeight)top=Math.max(14,r.top-245-gap);pop.style.left=left+'px';pop.style.top=top+'px'}
  function run(force=false){
    if(!ready()||(!force&&localStorage.getItem(KEY)==='done'))return;
    const queue=steps.filter(s=>document.querySelector(s.target));if(!queue.length)return;
    let i=0,closed=false;const back=document.createElement('div'),pop=document.createElement('div');back.className='feature-guide-backdrop';pop.className='feature-guide-pop';document.body.append(back,pop);document.body.classList.add('juz-feature-guide-open');
    function show(){if(closed)return;const s=queue[i],target=document.querySelector(s.target);if(!target){next();return}document.querySelector('.feature-guide-target')?.classList.remove('feature-guide-target');target.classList.add('feature-guide-target');target.scrollIntoView({behavior:'smooth',block:'center'});pop.innerHTML=`<div class="feature-guide-kicker">JUZDEREK ТУРЫ</div><h3>${s.title}</h3><p>${s.text}</p><div class="feature-guide-actions"><button class="feature-guide-skip" type="button">Өткізу</button><span class="feature-guide-count">${i+1} / ${queue.length}</span><button class="feature-guide-btn" type="button">${i===queue.length-1?'Дайын ✓':'Келесі →'}</button></div>`;setTimeout(()=>{if(pop.isConnected)place(pop,target)},420);pop.querySelector('.feature-guide-btn').onclick=next;pop.querySelector('.feature-guide-skip').onclick=()=>close(true)}
    function next(){i++;if(i>=queue.length)close(true);else show()}
    function close(done){if(closed)return;closed=true;if(done)localStorage.setItem(KEY,'done');document.querySelector('.feature-guide-target')?.classList.remove('feature-guide-target');back.remove();pop.remove();document.body.classList.remove('juz-feature-guide-open')}
    back.onclick=()=>{};show();addEventListener('resize',()=>{const s=queue[i],t=s&&document.querySelector(s.target);if(t&&pop.isConnected)place(pop,t)},{passive:true});
  }
  function auto(){setTimeout(()=>run(false),1000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',auto);else auto();
  document.addEventListener('juzderek:onboarding-done',()=>setTimeout(()=>run(false),500));
  window.JUZ_FEATURE_GUIDE={run,reset:()=>{localStorage.removeItem(KEY);run(true)}};
})();