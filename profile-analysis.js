(()=>{
'use strict';
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
const $=id=>document.getElementById(id);
const index=window.JUZDEREK_TOPIC_INDEX||{};
const store=read('juzderek_topics_progress',{});
const MODE_LABELS={cards:'Карточкалар',quiz:'Тест',person:'Тұлғалар',chrono:'Хронология'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function pct(score,total){const s=Number(score)||0,t=Number(total)||0;return t>0?Math.max(0,Math.min(100,Math.round(s/t*100))):null}
function topicRows(){return Object.entries(store).map(([id,t])=>{if(!t||typeof t!=='object')return null;const scores=t.scores&&typeof t.scores==='object'?t.scores:{};let score=0,total=0,done=0;for(const mode of Object.keys(MODE_LABELS)){const x=scores[mode];if(!x)continue;const s=Number(x.score)||0,tt=Number(x.total)||0;if(tt<=0)continue;score+=s;total+=tt;done++}if(!total)return null;return{id,name:index[id]?.name||id,accuracy:pct(score,total),done,totalModes:Object.keys(MODE_LABELS).length,updatedAt:Number(t.updatedAt)||0}}).filter(Boolean)}
function renderTopicList(hostId,items){const host=$(hostId);if(!host)return;if(!items.length){host.innerHTML='<div class="empty-state">Бұл санатта әзірге тақырып жоқ.</div>';return}host.innerHTML=items.map(x=>`<a class="topic-row" href="games.html?topic=${encodeURIComponent(x.id)}"><div class="topic-row-top"><strong>${esc(x.name)}</strong><span class="topic-percent">${x.accuracy}%</span></div><small>${x.done} ойын форматы бойынша нәтиже</small></a>`).join('')}
function renderSkills(){const totals={cards:{s:0,t:0,n:0},quiz:{s:0,t:0,n:0},person:{s:0,t:0,n:0},chrono:{s:0,t:0,n:0}};for(const t of Object.values(store)){const scores=t?.scores||{};for(const mode of Object.keys(totals)){const x=scores[mode],tt=Number(x?.total)||0;if(tt<=0)continue;totals[mode].s+=Number(x.score)||0;totals[mode].t+=tt;totals[mode].n++}}
const host=$('skillsGrid');host.innerHTML=Object.entries(totals).map(([mode,x])=>{const p=x.t?Math.round(x.s/x.t*100):0;return`<article class="skill-card"><div class="skill-top"><strong>${MODE_LABELS[mode]}</strong><span>${x.t?p+'%':'—'}</span></div><div class="skill-track"><i style="width:${p}%"></i></div><small>${x.n?`${x.n} тақырып бойынша`:'Әзірге нәтиже жоқ'}</small></article>`}).join('')}
const topics=topicRows();const overallTotal=topics.reduce((s,x)=>s+x.accuracy,0),overall=topics.length?Math.round(overallTotal/topics.length):0;
const attention=topics.filter(x=>x.accuracy<60).sort((a,b)=>a.accuracy-b.accuracy||b.updatedAt-a.updatedAt);
const reinforce=topics.filter(x=>x.accuracy>=60&&x.accuracy<80).sort((a,b)=>a.accuracy-b.accuracy||b.updatedAt-a.updatedAt);
const strong=topics.filter(x=>x.accuracy>=80).sort((a,b)=>b.accuracy-a.accuracy||b.updatedAt-a.updatedAt);
$('masteryValue').textContent=topics.length?`${overall}%`:'—';$('masteryMeta').textContent=topics.length?`${topics.length} тақырып бойынша`:'Алдымен ойындарды орындап баста';$('masteryRing').style.setProperty('--pct',`${overall}%`);
[['attention',attention],['reinforce',reinforce],['strong',strong]].forEach(([key,list])=>{$(`${key}Count`).textContent=list.length;$(`${key}Badge`).textContent=list.length;renderTopicList(`${key}List`,list)});
renderSkills();
})();