(()=>{
  if(window.__JUZ_ANALYTICS)return;window.__JUZ_ANALYTICS=true;
  const KEY='juzderek_analytics_v1',SESSION_MS=30*60*1000,MIN_SEND_MS=15000,QUEUE_MS=4000,PERSONLESS=new Set(['new-era-overview']);let countedPageView=false;
  const clean=v=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,40);
  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
  const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
  function clientId(){let id=localStorage.getItem('juzderek_support_student_id')||localStorage.getItem('juzderek_analytics_id');if(!/^[a-zA-Z0-9-]{20,80}$/.test(id||'')){id=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);localStorage.setItem('juzderek_analytics_id',id)}return id}
  function progress(){const p=read('juzderek_game_progress',{});return p&&typeof p==='object'?p:{}}
  function masteredTopics(){const store=read('juzderek_topics_progress',{});if(!store||typeof store!=='object'||Array.isArray(store))return 0;return Object.entries(store).filter(([id,t])=>{const done=new Set(Array.isArray(t?.completed)?t.completed:[]),req=PERSONLESS.has(id)?['cards','quiz','chrono']:['cards','quiz','person','chrono'];return req.every(m=>done.has(m))}).length}
  function streak(){const meta=window.JUZ_PROGRESS_CORE?.learningMeta?.()||read('juzderek_learning_meta',{});const n=Number(meta?.streak);return Number.isFinite(n)&&n>=0?Math.min(10000,Math.floor(n)):0}
  function collect(){const now=Date.now(),state=read(KEY,{pageViews:0,sessions:0,lastSessionAt:0,lastSentAt:0,lastSig:''}),newSession=!state.lastSessionAt||now-state.lastSessionAt>SESSION_MS;if(!countedPageView){state.pageViews=Math.min(1000000,(Number(state.pageViews)||0)+1);countedPageView=true}if(newSession){state.sessions=Math.min(100000,(Number(state.sessions)||0)+1);state.lastSessionAt=now}write(KEY,state);const p=progress(),name=clean(localStorage.getItem('juzderek_username')||'');return{studentId:clientId(),username:name,page:(location.pathname||'/').slice(0,120),pageViews:state.pageViews,sessions:state.sessions,xp:Math.max(0,Math.min(10000000,Math.floor(Number(p.xp)||0))),games:Math.max(0,Math.min(1000000,Math.floor(Number(p.games)||0))),correct:Math.max(0,Math.min(1000000,Math.floor(Number(p.correct)||0))),masteredTopics:masteredTopics(),streak:streak(),newSession}}
  const sig=p=>JSON.stringify([p.username,p.page,p.pageViews,p.sessions,p.xp,p.games,p.correct,p.masteredTopics,p.streak]);
  let timer=null,busy=false,pending=false,lastUsername=clean(localStorage.getItem('juzderek_username')||'');
  async function send(force=false){if(busy||document.hidden&&!force)return;const payload=collect(),state=read(KEY,{}),now=Date.now(),s=sig(payload);if(!force&&s===state.lastSig)return;if(!force&&now-(Number(state.lastSentAt)||0)<MIN_SEND_MS){pending=true;queue(MIN_SEND_MS-(now-(Number(state.lastSentAt)||0)));return}busy=true;try{const r=await fetch('/api/analytics/track',{method:'POST',headers:{'content-type':'application/json'},keepalive:true,body:JSON.stringify(payload)});if(r.ok){state.lastSentAt=Date.now();state.lastSig=s;write(KEY,state);pending=false}}catch{}finally{busy=false;if(pending)queue(QUEUE_MS)}}
  function queue(delay=QUEUE_MS){clearTimeout(timer);timer=setTimeout(()=>send(false),Math.max(250,delay))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue);else queue();
  window.addEventListener('juzderek:progress',queue);
  window.addEventListener('juzderek:tracker',queue);
  window.addEventListener('juzderek:username-ready',queue);
  window.addEventListener('juzderek:xp-local',()=>send(true));
  window.addEventListener('storage',e=>{if(['juzderek_game_progress','juzderek_topics_progress','juzderek_learning_meta','juzderek_username'].includes(e.key))queue()});
  window.addEventListener('focus',()=>{if(Date.now()-(read(KEY,{}).lastSessionAt||0)>SESSION_MS)queue(500)});
  window.addEventListener('pagehide',()=>send(true));
  const usernameWatcher=setInterval(()=>{const current=clean(localStorage.getItem('juzderek_username')||'');if(current!==lastUsername){lastUsername=current;queue(300)}if(current)clearInterval(usernameWatcher)},500);setTimeout(()=>clearInterval(usernameWatcher),30000);
})();