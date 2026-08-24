(()=>{
  if(window.__JUZ_WELCOME_GIFT)return;window.__JUZ_WELCOME_GIFT=true;
  const GIFT_KEY='juzderek_welcome_card_v1';
  const STATE_KEY='juzderek_collection_state_v1';
  const ONBOARD_KEY='juzderek_onboarding_v1';
  const PEOPLE=[
    {id:'napoleon',name:'Наполеон Бонапарт',years:'1769–1821',rarity:'legendary',label:'Аңыздық',image:'./assets/napoleon-bonapart.webp'},
    {id:'ramses-ii',name:'II Рамсес',years:'б.з.б. 1303–1213',rarity:'epic',label:'Эпикалық',image:'./assets/ramses-ii.webp'},
    {id:'alexander-great',name:'Александр Македонский',years:'б.з.б. 356–323',rarity:'legendary',label:'Аңыздық',image:'./assets/alexander-great.webp'},
    {id:'julius-caesar',name:'Гай Юлий Цезарь',years:'б.з.б. 100–44',rarity:'epic',label:'Эпикалық',image:'./assets/julius-caesar.webp'},
    {id:'genghis-khan',name:'Шыңғыс хан',years:'шамамен 1162–1227',rarity:'rare',label:'Сирек',image:'./assets/genghis-khan.webp'},
    {id:'joan-of-arc',name:'Жанна д’Арк',years:'1412–1431',rarity:'epic',label:'Эпикалық',image:'./assets/joan-of-arc.webp'},
    {id:'leonardo-da-vinci',name:'Леонардо да Винчи',years:'1452–1519',rarity:'rare',label:'Сирек',image:'./assets/leonardo-da-vinci.webp'},
    {id:'elizabeth-i',name:'Елизавета I',years:'1533–1603',rarity:'rare',label:'Сирек',image:'./assets/elizabeth-i.webp'},
    {id:'abraham-lincoln',name:'Авраам Линкольн',years:'1809–1865',rarity:'rare',label:'Сирек',image:'./assets/abraham-lincoln.webp'},
    {id:'albert-einstein',name:'Альберт Эйнштейн',years:'1879–1955',rarity:'rare',label:'Сирек',image:'./assets/albert-einstein.webp'}
  ];
  const readState=()=>{try{const v=JSON.parse(localStorage.getItem(STATE_KEY)||'{}');return v&&typeof v==='object'?v:{}}catch{return{}}};
  const saveCard=p=>{const s=readState(),unlocked=Array.isArray(s.unlocked)?s.unlocked.filter(x=>typeof x==='string'):[];if(!unlocked.includes(p.id))unlocked.push(p.id);localStorage.setItem(STATE_KEY,JSON.stringify({...s,unlocked:[...new Set(unlocked)]}));localStorage.setItem(GIFT_KEY,p.id);window.dispatchEvent(new CustomEvent('juzderek:collection',{detail:{id:p.id}}))};
  let root=null,busy=false,selected=null;
  function ensureCss(){if(document.querySelector('link[data-welcome-gift]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='./welcome-gift.css?v=20260824-01';l.dataset.welcomeGift='1';document.head.appendChild(l)}
  function open(){if(root||localStorage.getItem(GIFT_KEY))return;ensureCss();root=document.createElement('div');root.className='welcome-gift';root.innerHTML=`<section class="welcome-gift-card" role="dialog" aria-modal="true" aria-label="Алғашқы сыйлық"><div class="wg-kicker">АЛҒАШҚЫ СЫЙЛЫҚ</div><h2>Саған тегін <span>бір карта!</span></h2><p>JUZDEREK-ке алғаш кіргенің үшін бір сандық сыйлаймыз. Ішінен кез келген тұлға түсуі мүмкін.</p><div class="wg-stage"><div class="wg-rays"></div><img class="wg-chest" src="./assets/chest-closed.webp" alt="Сандық"><div class="wg-reveal" hidden></div></div><button class="wg-open" type="button">Сандықты ашу →</button><small class="wg-note">Түскен карта бірден коллекцияңа қосылады.</small></section>`;document.body.appendChild(root);requestAnimationFrame(()=>root.classList.add('show'));root.querySelector('.wg-open').onclick=reveal}
  function reveal(){if(busy)return;busy=true;const btn=root.querySelector('.wg-open'),chest=root.querySelector('.wg-chest'),reveal=root.querySelector('.wg-reveal');btn.disabled=true;btn.textContent='Ашылуда...';chest.src='./assets/chest-opening.webp';selected=PEOPLE[Math.floor(Math.random()*PEOPLE.length)];setTimeout(()=>{chest.src='./assets/chest-open.webp'},650);setTimeout(()=>{saveCard(selected);reveal.hidden=false;reveal.innerHTML=`<article class="wg-person ${selected.rarity}"><div class="wg-rarity">◆ ${selected.label.toUpperCase()}</div><img src="${selected.image}" alt="${selected.name}"><strong>${selected.name}</strong><small>${selected.years}</small></article><div class="wg-success"><b>Коллекцияңа қосылды!</b><span>${selected.label} карта түсті.</span></div>`;root.querySelector('.wg-stage').classList.add('revealed');btn.disabled=false;btn.textContent='Керемет! →';btn.onclick=()=>{root.classList.remove('show');setTimeout(()=>{root.remove();root=null},220)}} ,1300)}
  function ready(){return !localStorage.getItem(GIFT_KEY)&&!!localStorage.getItem('juzderek_username')&&localStorage.getItem(ONBOARD_KEY)==='done'&&!document.querySelector('.juz-onboarding.show')}
  let tries=0;const timer=setInterval(()=>{tries++;if(ready()){clearInterval(timer);setTimeout(open,320)}else if(tries>450)clearInterval(timer)},400);
  window.JUZ_WELCOME_GIFT={open,reset:()=>{localStorage.removeItem(GIFT_KEY);open()}};
})();