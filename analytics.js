(()=>{
  if(window.__JUZ_ANALYTICS)return;window.__JUZ_ANALYTICS=true;
  const KEY='juzderek_analytics_v1';
  const SESSION_MS=30*60*1000;
  const clean=v=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,40);
  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
  const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
  function clientId(){let id=localStorage.getItem('juzderek_support_student_id')||localStorage.getItem('juzderek_analytics_id');if(!/^[a-zA-Z0-9-]{20,80}$/.test(id||'')){id=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);localStorage.setItem('juzderek_analytics_id',id)}return id}
  function progress(){const p=read('juzderek_game_progress',{});return p&&typeof p==='object'?p:{}}
  function masteredTopics(){const t=read('juzderek_topics_progress',{});if(!t||typeof t!=='object'||Array.isArray(t))return 0;return Object.values(t).filter(x=>x&&Array.isArray(x.completed)&&new Set(x.completed.filter(m=>['cards','quiz','person','chrono'].includes(m))).size>=4).length}
  function streak(){const candidates=['juzderek_streak','juzderek_daily_streak','juzderek_current_streak'];for(const k of candidates){const n=Number(localStorage.getItem(k));if(Number.isFinite(n)&&n>=0)return Math.min(10000,Math.floor(n))}return 0}
  function collect(){const now=Date.now(),state=read(KEY,{pageViews:0,sessions:0,lastSessionAt:0});const newSession=!state.lastSessionAt||now-state.lastSessionAt>SESSION_MS;state.pageViews=Math.min(1000000,(Number(state.pageViews)||0)+1);if(newSession){state.sessions=Math.min(100000,(Number(state.sessions)||0)+1);state.lastSessionAt=now}write(KEY,state);const p=progress(),name=clean(localStorage.getItem('juzderek_username')||'');return{studentId:clientId(),username:name,page:(location.pathname||'/').slice(0,120),pageViews:state.pageViews,sessions:state.sessions,xp:Math.max(0,Math.min(10000000,Math.floor(Number(p.xp)||0))),games:Math.max(0,Math.min(1000000,Math.floor(Number(p.games)||0))),correct:Math.max(0,Math.min(1000000,Math.floor(Number(p.correct)||0))),masteredTopics:masteredTopics(),streak:streak(),newSession}}
  let timer=null,busy=false,lastUsername=clean(localStorage.getItem('juzderek_username')||'');
  async function send(){if(busy||document.hidden)return;busy=true;try{await fetch('/api/analytics/track',{method:'POST',headers:{'content-type':'application/json'},keepalive:true,body:JSON.stringify(collect())})}catch{}finally{busy=false}}
  function queue(){clearTimeout(timer);timer=setTimeout(send,350)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue);else queue();
  window.addEventListener('juzderek:progress',queue);window.addEventListener('juzderek:tracker',queue);window.addEventListener('juzderek:username-ready',queue);window.addEventListener('storage',e=>{if(['juzderek_game_progress','juzderek_topics_progress','juzderek_username'].includes(e.key))queue()});window.addEventListener('focus',()=>{if(Date.now()-(read(KEY,{}).lastSessionAt||0)>SESSION_MS)queue()});
  const usernameWatcher=setInterval(()=>{const current=clean(localStorage.getItem('juzderek_username')||'');if(current!==lastUsername){lastUsername=current;queue()}if(current)clearInterval(usernameWatcher)},500);
  setTimeout(()=>clearInterval(usernameWatcher),30000);
})();