(()=>{
  if(window.JUZ_SERVER_XP)return;
  const QUEUE_KEY='juzderek_server_xp_queue_v1',SYNC_KEY='juzderek_server_xp_synced_at',SYNC_MS=5*60*1000;
  const MODE_BITS={cards:1,quiz:2,person:4,chrono:8};
  const id=()=>{let v=localStorage.getItem('juzderek_support_student_id')||localStorage.getItem('juzderek_analytics_id');if(!/^[a-zA-Z0-9-]{20,80}$/.test(v||'')){v=crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;localStorage.setItem('juzderek_analytics_id',v)}if(!localStorage.getItem('juzderek_support_student_id'))localStorage.setItem('juzderek_support_student_id',v);return v};
  const token=()=>{let v=localStorage.getItem('juzderek_support_student_token');if(!/^[a-f0-9]{64}$/.test(v||'')){const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);v=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem('juzderek_support_student_token',v)}return v};
  const readJSON=(key,fallback={})=>{try{const v=JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));return v&&typeof v==='object'?v:fallback}catch{return fallback}};
  const readProgress=()=>readJSON('juzderek_game_progress',{});
  const readQueue=()=>{const q=readJSON(QUEUE_KEY,[]);return Array.isArray(q)?q:[]};
  const writeQueue=q=>{try{const next=JSON.stringify(q.slice(-60)),raw=localStorage.getItem(QUEUE_KEY);if(next!==raw)localStorage.setItem(QUEUE_KEY,next)}catch{}};
  function applyXp(xp){const p=readProgress(),nextXp=Math.max(0,Number(xp)||0),changed=Number(p.xp)!==nextXp;p.xp=nextXp;if(changed)localStorage.setItem('juzderek_game_progress',JSON.stringify(p));localStorage.setItem(SYNC_KEY,String(Date.now()));if(changed){window.dispatchEvent(new CustomEvent('juzderek:progress',{detail:p}));window.dispatchEvent(new CustomEvent('juzderek:xp-synced',{detail:{xp:nextXp}}))}window.JUZ_PROGRESS_CORE?.syncDailyXp?.();return nextXp}
  function applyRewards(rewards){
    if(!rewards||typeof rewards!=='object'||Array.isArray(rewards))return false;
    const all=readJSON('juzderek_topics_progress',{});let changed=false;
    for(const [topicId,rawMask] of Object.entries(rewards)){
      if(!/^[a-z0-9-]{2,80}$/.test(topicId))continue;
      const mask=Number(rawMask)||0;if(!mask)continue;
      const t=all[topicId]&&typeof all[topicId]==='object'?all[topicId]:{};
      const completed=new Set(Array.isArray(t.completed)?t.completed:[]),rewarded=t.rewarded&&typeof t.rewarded==='object'?{...t.rewarded}:{};
      for(const [mode,bit] of Object.entries(MODE_BITS))if(mask&bit){if(!completed.has(mode)){completed.add(mode);changed=true}if(!rewarded[`mode:${mode}`]){rewarded[`mode:${mode}`]=true;changed=true}}
      if(mask&16){if(!t.topicBonus){t.topicBonus=true;changed=true}if(!rewarded['topic:mastery-50']){rewarded['topic:mastery-50']=true;changed=true}}
      t.completed=[...completed];t.rewarded=rewarded;all[topicId]=t;
    }
    if(changed){localStorage.setItem('juzderek_topics_progress',JSON.stringify(all));window.dispatchEvent(new CustomEvent('juzderek:progress',{detail:{serverRewards:true}}))}
    return changed;
  }
  async function post(path,body){const r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},cache:'no-store',body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok){const err=new Error(d.error||'XP sync failed');err.status=r.status;throw err}return d}
  async function request(topicId,mode){const d=await post('/api/xp/complete',{studentId:id(),studentToken:token(),topicId,mode});applyXp(d.xp);return d}
  let syncing=null;
  async function sync(force=false){const last=Number(localStorage.getItem(SYNC_KEY)||0);if(!force&&Date.now()-last<SYNC_MS)return readProgress().xp||0;if(syncing)return syncing;syncing=post('/api/xp/state',{studentId:id(),studentToken:token()}).then(d=>{applyRewards(d.rewards);return applyXp(d.xp)}).finally(()=>{syncing=null});return syncing}
  let flushing=false;
  function enqueue(topicId,mode){const key=`${topicId}:${mode}`,q=readQueue();if(!q.some(x=>x.key===key))q.push({key,topicId,mode});writeQueue(q)}
  async function flush(){if(flushing||!navigator.onLine)return;flushing=true;try{let q=readQueue();while(q.length){const item=q[0];try{await request(item.topicId,item.mode);q.shift();writeQueue(q)}catch{break}}}finally{flushing=false}}
  async function complete(topicId,mode){enqueue(topicId,mode);try{const d=await request(topicId,mode);writeQueue(readQueue().filter(x=>x.key!==`${topicId}:${mode}`));return d}catch(err){setTimeout(flush,5000);throw err}}
  addEventListener('online',()=>{flush().finally(()=>sync(true).catch(()=>{}))});
  addEventListener('focus',()=>{flush();sync().catch(()=>{})});
  setTimeout(()=>{sync().catch(()=>{});flush()},1200);
  window.JUZ_SERVER_XP={studentId:id,studentToken:token,applyXp,applyRewards,complete,flush,sync};
})();