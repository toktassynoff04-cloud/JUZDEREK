(()=>{
const REVIEW='juzderek_daily_review_v1',TOPICS='juzderek_topics_progress';
const read=(k,d={})=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const save=(v)=>localStorage.setItem(REVIEW,JSON.stringify(v));
const core=window.JUZ_PROGRESS_CORE;
const today=()=>core?.dayKey?.()||new Date().toISOString().slice(0,10);
function pool(){const tp=read(TOPICS,{}),state=read(REVIEW,{items:{},days:{}}),items=state.items||{};Object.entries(tp).forEach(([topicId,t])=>{const arr=t?.scores?.cards?.analysis?.repeatItems||[];arr.forEach(x=>{const key=`${topicId}:${x.id||x.date}`;if(!items[key])items[key]={key,topicId,id:x.id,date:x.date,event:x.event,addedAt:Date.now(),dueAt:0,stage:0,wrong:0};});});state.items=items;save(state);return state}
function due(){const s=pool(),now=Date.now();return Object.values(s.items).filter(x=>!x.mastered&&(Number(x.dueAt)||0)<=now).sort((a,b)=>(b.wrong||0)-(a.wrong||0)||(a.addedAt||0)-(b.addedAt||0));}
function todaySet(){const s=pool(),day=today();s.days=s.days||{};if(!Array.isArray(s.days[day]))s.days[day]=due().slice(0,10).map(x=>x.key);save(s);return s.days[day].map(k=>s.items[k]).filter(Boolean).filter(x=>!x.mastered)}
function answer(key,known){const s=pool(),x=s.items[key];if(!x)return;const DAY=86400000;if(known){x.stage=(x.stage||0)+1;if(x.stage>=3){x.mastered=true;x.masteredAt=Date.now()}else{x.dueAt=Date.now()+(x.stage===1?DAY*3:DAY*7)}}else{x.wrong=(x.wrong||0)+1;x.stage=0;x.dueAt=Date.now()}x.lastAt=Date.now();save(s);dispatchEvent(new CustomEvent('juzderek:review'));}
function stats(){const s=pool(),all=Object.values(s.items).filter(x=>!x.mastered),set=todaySet(),day=today(),keys=s.days?.[day]||[],done=keys.filter(k=>s.items[k]?.mastered||((s.items[k]?.dueAt||0)>Date.now())).length;return{total:all.length,todayTotal:keys.length,todayDone:done.length,todayLeft:set.length};}
window.JUZ_DAILY_REVIEW={pool,due,todaySet,answer,stats};
})();