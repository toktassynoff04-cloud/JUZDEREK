(()=>{
  if(window.JUZ_LEARNING_ANALYTICS)return;
  const KEY='juzderek_learning_quality_v1';
  const clean=(v,max=140)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'?v:{modes:{},mistakes:{}}}catch{return{modes:{},mistakes:{}}};
  const write=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}};
  const id=()=>{let x=localStorage.getItem('juzderek_support_student_id')||localStorage.getItem('juzderek_analytics_id');if(!/^[a-zA-Z0-9-]{20,80}$/.test(x||'')){x=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);localStorage.setItem('juzderek_analytics_id',x)}return x};
  const state=read();state.modes=state.modes||{};state.mistakes=state.mistakes||{};
  const dirtyModes=new Set(Object.keys(state.modes)),dirtyMistakes=new Set(Object.keys(state.mistakes));let timer=null,busy=false;
  function modeKey(topicId,mode){return`${topicId}:${mode}`}
  function mistakeKey(topicId,mode,itemKey){return`${topicId}:${mode}:${itemKey}`}
  function baseMode(topicId,topicName,mode){const k=modeKey(topicId,mode);if(!state.modes[k])state.modes[k]={topicId:clean(topicId,80),topicName:clean(topicName),mode:clean(mode,20),starts:0,completions:0,scoreSum:0,totalSum:0,replays:0,updatedAt:0};return[state.modes[k],k]}
  function queue(){clearTimeout(timer);timer=setTimeout(flush,900)}
  function start(topicId,topicName,mode,replay=false){const[x,k]=baseMode(topicId,topicName,mode);x.starts=(Number(x.starts)||0)+1;if(replay)x.replays=(Number(x.replays)||0)+1;x.updatedAt=Date.now();dirtyModes.add(k);write(state);queue()}
  function complete(topicId,topicName,mode,score,total){const[x,k]=baseMode(topicId,topicName,mode);x.completions=(Number(x.completions)||0)+1;x.scoreSum=(Number(x.scoreSum)||0)+Math.max(0,Number(score)||0);x.totalSum=(Number(x.totalSum)||0)+Math.max(0,Number(total)||0);x.updatedAt=Date.now();dirtyModes.add(k);write(state);queue()}
  function mistake(v){const topicId=clean(v?.topicId,80),mode=clean(v?.mode,20),itemKey=clean(v?.itemKey||v?.id||v?.label,120);if(!topicId||!mode||!itemKey)return;const k=mistakeKey(topicId,mode,itemKey);const x=state.mistakes[k]||(state.mistakes[k]={topicId,topicName:clean(v.topicName),mode,itemKey,kind:clean(v.kind,20),label:clean(v.label,180),answer:clean(v.answer,220),wrongCount:0,updatedAt:0});x.wrongCount=(Number(x.wrongCount)||0)+1;x.label=clean(v.label,180)||x.label;x.answer=clean(v.answer,220)||x.answer;x.topicName=clean(v.topicName)||x.topicName;x.kind=clean(v.kind,20)||x.kind;x.updatedAt=Date.now();dirtyMistakes.add(k);write(state);queue()}
  async function flush(){if(busy||document.hidden||(!dirtyModes.size&&!dirtyMistakes.size))return;busy=true;const modeKeys=[...dirtyModes],mistakeKeys=[...dirtyMistakes];const modes=modeKeys.map(k=>state.modes[k]).filter(Boolean),mistakes=mistakeKeys.map(k=>state.mistakes[k]).filter(Boolean);try{const r=await fetch('/api/analytics/learning-track',{method:'POST',headers:{'content-type':'application/json'},keepalive:true,body:JSON.stringify({studentId:id(),modes,mistakes})});if(r.ok){modeKeys.forEach(k=>dirtyModes.delete(k));mistakeKeys.forEach(k=>dirtyMistakes.delete(k))}}catch{}finally{busy=false}}
  window.addEventListener('focus',queue);document.addEventListener('visibilitychange',()=>{if(!document.hidden)queue()});window.JUZ_LEARNING_ANALYTICS={start,complete,mistake,flush};setTimeout(queue,1400);
})();