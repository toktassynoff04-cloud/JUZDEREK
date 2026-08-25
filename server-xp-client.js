(()=>{
  if(window.JUZ_SERVER_XP)return;
  const QUEUE_KEY='juzderek_server_xp_queue_v1',SYNC_KEY='juzderek_server_xp_synced_at',SYNC_MS=5*60*1000;
  const id=()=>{let v=localStorage.getItem('juzderek_support_student_id')||localStorage.getItem('juzderek_analytics_id');if(!/^[a-zA-Z0-9-]{20,80}$/.test(v||'')){v=crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;localStorage.setItem('juzderek_analytics_id',v)}if(!localStorage.getItem('juzderek_support_student_id'))localStorage.setItem('juzderek_support_student_id',v);return v};
  const token=()=>{let v=localStorage.getItem('juzderek_support_student_token');if(!/^[a-f0-9]{64}$/.test(v||'')){const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);v=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem('juzderek_support_student_token',v)}return v};
  const readProgress=()=>{try{return JSON.parse(localStorage.getItem('juzderek_game_progress')||'{}')||{}}catch{return{}}};
  const readQueue=()=>{try{const q=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');return Array.isArray(q)?q:[]}catch{return[]}};
  const writeQueue=q=>{try{localStorage.setItem(QUEUE_KEY,JSON.stringify(q.slice(-60)))}catch{}};
  const dayKey=()=>window.JUZ_PROGRESS_CORE?.dayKey?.()||new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Almaty',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function alignDailyBaseline(authoritativeXp){try{const total=Math.max(0,Number(authoritativeXp)||0);const data=JSON.parse(localStorage.getItem('juzderek_daily_xp')||'{"baseline":null,"days":{}}')||{};data.days=data.days&&typeof data.days==='object'?data.days:{};const today=dayKey();const todayValue=Math.max(0,Number(data.days[today])||0);if(todayValue>total)data.days[today]=0;data.baseline=total;localStorage.setItem('juzderek_daily_xp',JSON.stringify(data))}catch{}}
  function applyXp(xp){const p=readProgress();p.xp=Math.max(0,Number(xp)||0);alignDailyBaseline(p.xp);localStorage.setItem('juzderek_game_progress',JSON.stringify(p));localStorage.setItem(SYNC_KEY,String(Date.now()));window.dispatchEvent(new CustomEvent('juzderek:progress',{detail:p}));window.dispatchEvent(new CustomEvent('juzderek:xp-synced',{detail:{xp:p.xp}}));return p.xp}
  async function post(path,body){const r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},cache:'no-store',body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'XP sync failed');return d}
  async function request(topicId,mode){const d=await post('/api/xp/complete',{studentId:id(),studentToken:token(),topicId,mode});applyXp(d.xp);return d}
  async function sync(force=false){const last=Number(localStorage.getItem(SYNC_KEY)||0);if(!force&&Date.now()-last<SYNC_MS)return readProgress().xp||0;const d=await post('/api/xp/state',{studentId:id(),studentToken:token()});return applyXp(d.xp)}
  let flushing=false;
  function enqueue(topicId,mode){const key=`${topicId}:${mode}`,q=readQueue();if(!q.some(x=>x.key===key))q.push({key,topicId,mode});writeQueue(q)}
  async function flush(){if(flushing||!navigator.onLine)return;flushing=true;try{let q=readQueue();while(q.length){const item=q[0];try{await request(item.topicId,item.mode);q.shift();writeQueue(q)}catch{break}}}finally{flushing=false}}
  async function complete(topicId,mode){enqueue(topicId,mode);try{const d=await request(topicId,mode);writeQueue(readQueue().filter(x=>x.key!==`${topicId}:${mode}`));return d}catch(err){setTimeout(flush,5000);throw err}}
  addEventListener('online',()=>{flush().finally(()=>sync(true).catch(()=>{}))});
  addEventListener('focus',()=>{flush();sync(true).catch(()=>{})});
  addEventListener('pageshow',()=>sync(true).catch(()=>{}));
  addEventListener('storage',e=>{if(e.key==='juzderek_game_progress'||e.key===QUEUE_KEY){flush();sync(true).catch(()=>{})}});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){flush();sync(true).catch(()=>{})}});
  setTimeout(()=>{sync(true).catch(()=>{});flush()},1200);
  window.JUZ_SERVER_XP={studentId:id,studentToken:token,applyXp,complete,flush,sync};
})();