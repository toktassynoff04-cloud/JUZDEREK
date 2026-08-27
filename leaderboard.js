(()=>{
  const host=document.getElementById('leaderboardHost');
  if(!host)return;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>(Number(n)||0).toLocaleString('kk-KZ');
  const read=(key,fallback={})=>{try{const v=JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));return v&&typeof v==='object'?v:fallback}catch{return fallback}};
  const clientId=()=>localStorage.getItem('juzderek_support_student_id')||localStorage.getItem('juzderek_analytics_id')||'';
  const username=()=>String(localStorage.getItem('juzderek_username')||'').trim().slice(0,40);
  function masteredTopics(){
    const store=read('juzderek_topics_progress',{});
    return Object.entries(store).filter(([id,t])=>{
      const done=new Set(Array.isArray(t?.completed)?t.completed:[]);
      const required=id==='new-era-overview'?['cards','quiz','chrono']:['cards','quiz','person','chrono'];
      return required.every(m=>done.has(m));
    }).length;
  }
  function localSnapshot(){
    const id=clientId(),name=username();
    if(!id||!name)return null;
    const p=read('juzderek_game_progress',{}),meta=read('juzderek_learning_meta',{}),a=read('juzderek_analytics_v1',{});
    return{
      studentId:id,
      username:name,
      page:(location.pathname||'/').slice(0,120),
      pageViews:Number(a.pageViews)||0,
      sessions:Number(a.sessions)||0,
      xp:Math.max(0,Math.floor(Number(p.xp)||0)),
      games:Math.max(0,Math.floor(Number(p.games)||0)),
      correct:Math.max(0,Math.floor(Number(p.correct)||0)),
      masteredTopics:masteredTopics(),
      streak:Math.max(0,Math.floor(Number(meta.streak)||0))
    };
  }
  async function syncSelf(){
    const payload=localSnapshot();
    if(!payload)return;
    try{
      await fetch('/api/analytics/track',{method:'POST',headers:{'content-type':'application/json'},cache:'no-store',body:JSON.stringify(payload)});
    }catch{}
  }
  let cache=null,loading=false;
  function medal(rank){
    if(rank>3)return`<span class="leader-num">${rank}</span>`;
    const cls=rank===1?'gold':rank===2?'silver':'bronze';
    return`<span class="rank-medal ${cls}"><img src="./assets/stat-trophy.svg" alt="${rank}-орын"></span>`;
  }
  function row(x,me,compact=false){
    const mine=me&&x.studentId===me.studentId;
    return`<div class="leader-row${mine?' is-me':''}${x.rank<=3?' top-rank':''}"><div class="leader-rank-visual">${medal(x.rank)}</div><div class="leader-person"><div class="leader-name">${esc(x.username)}${mine?' <span class="inline-me">Сен</span>':''}</div><div class="leader-title">Lv.${x.level} · ${esc(x.title)}</div></div>${compact?'':`<div class="leader-stat">${fmt(x.masteredTopics)} тақырып</div><div class="leader-stat">${fmt(x.streak)} күн серия</div>`}<div class="leader-xp">${fmt(x.xp)} XP</div></div>`;
  }
  function myCard(me,gap){
    if(!me)return'<div class="my-rank-card guest"><div><small>СЕНІҢ НӘТИЖЕҢ</small><strong>Рейтингке қосылу үшін атыңды енгіз</strong></div></div>';
    return`<div class="my-rank-card"><div class="my-rank-place"><small>СЕНІҢ ОРНЫҢ</small><strong>#${me.rank}</strong></div><div class="my-rank-main"><b>${esc(me.username)}</b><span>Lv.${me.level} · ${esc(me.title)}</span></div><div class="my-rank-xp"><strong>${fmt(me.xp)} XP</strong><span>${me.rank<=20?'Top 20 ішіндесің ✓':`Top 20-ға дейін ${fmt(gap)} XP`}</span></div></div>`;
  }
  function ensureModal(){
    let el=document.getElementById('leaderboardOverlay');
    if(el)return el;
    document.body.insertAdjacentHTML('beforeend','<div class="leaderboard-overlay" id="leaderboardOverlay"><section class="leaderboard-modal"><button class="leaderboard-close" type="button" aria-label="Жабу">×</button><div class="leaderboard-modal-head"><span>JUZDEREK РЕЙТИНГІ</span><h2>Үздіктер тақтасы</h2><p>XP бойынша үздік 20 оқушы</p></div><div id="leaderboardModalHost"></div></section></div>');
    el=document.getElementById('leaderboardOverlay');
    el.querySelector('.leaderboard-close').onclick=closeModal;
    el.onclick=e=>{if(e.target===el)closeModal()};
    return el;
  }
  function openModal(){
    if(!cache)return;
    const el=ensureModal(),mh=el.querySelector('#leaderboardModalHost'),a=cache.items||[],me=cache.me||null;
    mh.innerHTML=`${myCard(me,Number(cache.xpToTop20)||0)}<div class="leaderboard-modal-list">${a.map(x=>row(x,me,false)).join('')}</div>`;
    el.classList.add('show');
    document.body.classList.add('juz-overlay-open');
  }
  function closeModal(){
    document.getElementById('leaderboardOverlay')?.classList.remove('show');
    document.body.classList.remove('juz-overlay-open');
  }
  async function load(){
    if(loading)return;
    loading=true;
    try{
      await syncSelf();
      const id=clientId(),url='/api/leaderboard'+(id?`?studentId=${encodeURIComponent(id)}`:'');
      const r=await fetch(url,{cache:'no-store'}),d=await r.json();
      if(!r.ok)throw new Error(d.error||'Leaderboard unavailable');
      cache=d;
      const a=Array.isArray(d.items)?d.items:[],top5=a.slice(0,5),me=d.me||null;
      host.innerHTML=`${myCard(me,Number(d.xpToTop20)||0)}<div class="leaderboard-list compact">${top5.map(x=>row(x,me,true)).join('')}</div>${top5.length?'<button class="leaderboard-full-btn" type="button">Толық Top 20-ны көру →</button>':'<div class="leader-empty">Рейтингке қатысатын оқушылар әзірге жоқ.</div>'}`;
      host.querySelector('.leaderboard-full-btn')?.addEventListener('click',openModal);
      if(document.getElementById('leaderboardOverlay')?.classList.contains('show'))openModal();
    }catch{
      host.innerHTML='<div class="leader-empty">Үздіктер тақтасын жүктеу мүмкін болмады.</div>';
    }finally{loading=false}
  }
  document.getElementById('leaderboardOpen')?.addEventListener('click',()=>{if(cache)openModal()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
  load();
  addEventListener('focus',load);
  addEventListener('juzderek:progress',()=>setTimeout(load,250));
})();