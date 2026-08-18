const facts=[
 {date:"Б.з.б. 558 жылдары",event:"Парсылардың патшасы болып ІІ Кир сайланып, Ахеменидтер династиясының негізін қалады.",person:"ІІ Кир"},
 {date:"Б.з.б. 547–546 жылдары",event:"ІІ Кир Армения мен Каппадокияны, Лидияны жаулап алды.",person:"ІІ Кир"},
 {date:"Б.з.б. 538 жылдары",event:"ІІ Кир Вавилон мемлекетін басып алып, оны Парсының құрамына қосты.",person:"ІІ Кир"},
 {date:"Б.з.б. 529 жылы",event:"Каспий даласында массагеттермен болған шайқаста Кир қаза тапты.",person:"ІІ Кир"},
 {date:"Б.з.б. 526 жылы",event:"Камбиз Египетке қарсы жорыққа аттанды.",person:"Камбиз"},
 {date:"Б.з.б. 525 жылы",event:"Камбиз Египет мемлекетін басып алды.",person:"Камбиз"},
 {date:"Б.з.б. 523 жылы",event:"Камбиз қаза болған соң империяның көптеген аймақтарында көтерілістер болды.",person:"Камбиз"},
 {date:"Б.з.б. 521–486 жылдары",event:"І Дарийдің билік құрған кезеңі. Парсы патшалығының ең өркендеген тұсы.",person:"І Дарий"}
];
const persons=[
 {name:"ІІ Кир",clue:"Ахеменидтер династиясының негізін қалады; Мидияны, Лидияны және Вавилонды бағындырды."},
 {name:"Астиаг",clue:"Мидия патшасы. ІІ Кирден жеңіліп, мемлекеті талқандалды."},
 {name:"Камбиз",clue:"ІІ Кирдің ұлы. Египетке жорық жасап, оны басып алды."},
 {name:"І Дарий",clue:"Сатрапилер жүйесін күшейтіп, «Дарик» алтын монетасын шығарды."},
 {name:"Ариад",clue:"Египеттің сатрапы. Өз бетінше күміс ақша жасай бастағаны үшін І Дарийдің қаһарына ұшырады."}
];
const tips=[
 "Датаны жеке жаттама — оны оқиға және тұлғамен байланыстырып есте сақта.",
 "Хронологияны жаттағанда алдымен 3 тірек датаны таңда.",
 "Тұлғаны есте сақтау үшін оның бір ерекше ісін тірек ретінде ал.",
 "Күніне 5–10 минуттық қысқа қайталау ұзақ бір реттік оқудан тиімді."
];
const KEY="juzderek_light_v1";
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{xp:0,streak:0,lastVisit:null,cardsViewed:[],gamesDone:0,dailyCount:0,dailyDate:null,cardIndex:0};
function dayKey(d=new Date()){return d.toISOString().slice(0,10)}
function initDay(){const today=dayKey();if(state.lastVisit!==today){const y=new Date();y.setDate(y.getDate()-1);state.streak=state.lastVisit===dayKey(y)?Math.max(1,state.streak+1):1;state.lastVisit=today}if(state.dailyDate!==today){state.dailyDate=today;state.dailyCount=0}save()}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function addProgress(xp=0,game=false){state.xp+=xp;if(game)state.gamesDone++;state.dailyCount=Math.min(10,state.dailyCount+1);save();sync()}
function league(){const levels=[{name:"Бастапқы лига",min:0,max:200},{name:"Қола лига",min:200,max:500},{name:"Күміс лига",min:500,max:900},{name:"Алтын лига",min:900,max:1500},{name:"Платина лига",min:1500,max:2400},{name:"Гауһар лига",min:2400,max:999999}];return levels.find(x=>state.xp>=x.min&&state.xp<x.max)||levels.at(-1)}
function sync(){
 document.getElementById("topStreak").textContent=state.streak+" күн";
 document.getElementById("streakValue").textContent=state.streak+" күн";
 document.getElementById("topXp").textContent=state.xp.toLocaleString("kk-KZ")+" XP";
 document.getElementById("xpValue").textContent=state.xp.toLocaleString("kk-KZ");
 document.getElementById("cardsViewed").textContent=state.cardsViewed.length;
 document.getElementById("gamesDone").textContent=state.gamesDone;
 document.getElementById("goalText").textContent=state.dailyCount+"/10";
 document.getElementById("goalBar").style.width=(state.dailyCount*10)+"%";
 const total=facts.length+20,done=state.cardsViewed.length+state.gamesDone,pct=Math.min(100,Math.round(done/total*100));
 document.getElementById("progressPct").textContent=pct+"%";document.getElementById("progressBar").style.width=pct+"%";
 const l=league();document.getElementById("leagueName").textContent=l.name;
 if(l.max>900000){document.getElementById("leagueNext").textContent="Ең жоғары лига";document.getElementById("leagueBar").style.width="100%"}else{const need=l.max-state.xp;document.getElementById("leagueNext").textContent="Келесі лигаға: "+need+" XP";document.getElementById("leagueBar").style.width=Math.max(0,Math.min(100,(state.xp-l.min)/(l.max-l.min)*100))+"%"}
 const labels=["Дс","Сс","Ср","Бс","Жм","Сн","Жс"],today=(new Date().getDay()+6)%7;document.getElementById("week").innerHTML=labels.map((x,i)=>`<div class="day">${x}<div class="dot ${i<=today&&state.streak>0?"done":""}">${i<=today&&state.streak>0?"✓":""}</div></div>`).join("")
}
const stage=document.getElementById("stage");
function markCardViewed(i){const id="c"+i;if(!state.cardsViewed.includes(id)){state.cardsViewed.push(id);save();sync()}}
function renderCard(){
 const i=state.cardIndex%facts.length,f=facts[i];markCardViewed(i);
 stage.innerHTML=`<div class="paper-wrap"><div class="paper-back"></div><div class="binder">📎</div><article class="paper" id="paperCard"><div class="paper-head"><span>JUZDEREK • Карточка</span><span>${i+1}/${facts.length}</span></div><div class="card-bubble">${i+1}</div><h1 id="cardMain">${f.event}</h1><p id="cardSub">Карточканы аударсаң — осы оқиғаның датасы шығады.</p><div class="paper-foot"><span>Күніне 5–10 минут қайталау жеткілікті.</span><div class="paper-actions"><button class="mini-btn" id="prevCard">←</button><button class="mini-btn primary" id="flipCard">Аудару</button><button class="mini-btn" id="nextCard">→</button></div></div></article></div>`;
 let flipped=false;const flip=()=>{flipped=!flipped;document.getElementById("cardMain").textContent=flipped?f.date:f.event;document.getElementById("cardMain").className=flipped?"flip-date":"";document.getElementById("cardSub").textContent=flipped?f.event:"Карточканы аударсаң — осы оқиғаның датасы шығады."};
 document.getElementById("flipCard").onclick=flip;document.getElementById("paperCard").onclick=e=>{if(!e.target.closest("button"))flip()};
 document.getElementById("nextCard").onclick=()=>{state.cardIndex=(i+1)%facts.length;save();renderCard()};document.getElementById("prevCard").onclick=()=>{state.cardIndex=(i-1+facts.length)%facts.length;save();renderCard()}
}
function renderDate(){const q=facts[Math.floor(Math.random()*facts.length)],opts=[q.date,...facts.filter(x=>x.date!==q.date).sort(()=>Math.random()-.5).slice(0,3).map(x=>x.date)].sort(()=>Math.random()-.5);stage.innerHTML=`<div class="quiz-shell"><div class="quiz-title">ДАТАНЫ ТАП</div><div class="quiz-q">${q.event}</div><div class="answers">${opts.map(x=>`<button class="answer">${x}</button>`).join("")}</div><div class="feedback" id="fb"></div></div>`;let done=false;stage.querySelectorAll(".answer").forEach(b=>b.onclick=()=>{if(done)return;done=true;const ok=b.textContent===q.date;b.classList.add(ok?"correct":"wrong");stage.querySelectorAll(".answer").forEach(x=>{if(x.textContent===q.date)x.classList.add("correct")});const fb=document.getElementById("fb");fb.style.display="block";fb.innerHTML=ok?"✅ Дұрыс! +30 XP":"Дұрыс жауап: <b>"+q.date+"</b>";addProgress(ok?30:0,true);fb.innerHTML+=`<br><button class="mini-btn primary" style="margin-top:10px" onclick="renderDate()">Келесі сұрақ →</button>`})}
function renderPerson(){const q=persons[Math.floor(Math.random()*persons.length)],opts=[q.name,...persons.filter(x=>x.name!==q.name).sort(()=>Math.random()-.5).slice(0,3).map(x=>x.name)].sort(()=>Math.random()-.5);stage.innerHTML=`<div class="quiz-shell"><div class="quiz-title">ТҰЛҒАНЫ ТАП</div><div class="quiz-q">${q.clue}</div><div class="answers">${opts.map(x=>`<button class="answer">${x}</button>`).join("")}</div><div class="feedback" id="fb"></div></div>`;let done=false;stage.querySelectorAll(".answer").forEach(b=>b.onclick=()=>{if(done)return;done=true;const ok=b.textContent===q.name;b.classList.add(ok?"correct":"wrong");stage.querySelectorAll(".answer").forEach(x=>{if(x.textContent===q.name)x.classList.add("correct")});const fb=document.getElementById("fb");fb.style.display="block";fb.innerHTML=ok?"✅ Дұрыс! +30 XP":"Дұрыс жауап: <b>"+q.name+"</b>";addProgress(ok?30:0,true);fb.innerHTML+=`<br><button class="mini-btn primary" style="margin-top:10px" onclick="renderPerson()">Келесі тұлға →</button>`})}
function yearVal(s){const m=s.match(/(\d{3,4})/);return m?Number(m[1]):0}
function renderChrono(){const chosen=facts.slice(0,5).sort(()=>Math.random()-.5);let order=[];stage.innerHTML=`<div class="chrono-shell"><div class="quiz-title">ХРОНОЛОГИЯ</div><div class="quiz-q">Оқиғаларды ертеден кешке қарай орналастыр.</div><div class="chrono-list">${chosen.map((x,i)=>`<button class="chrono-item" data-i="${i}">${x.event}</button>`).join("")}</div><div class="chosen">Таңдалғаны: <span id="chosenText">—</span></div><button class="mini-btn primary" id="checkChrono" style="margin-top:12px">Тексеру</button></div>`;stage.querySelectorAll(".chrono-item").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.i);if(order.includes(i)){order=order.filter(x=>x!==i);b.classList.remove("selected")}else{order.push(i);b.classList.add("selected")}document.getElementById("chosenText").textContent=order.map((x,j)=>(j+1)+". "+chosen[x].date).join(" → ")||"—"});document.getElementById("checkChrono").onclick=()=>{if(order.length!==chosen.length){alert("Барлық оқиғаны таңда.");return}const selected=order.map(i=>chosen[i]),correct=[...chosen].sort((a,b)=>yearVal(b.date)-yearVal(a.date)),ok=selected.every((x,i)=>x.date===correct[i].date);document.querySelector(".chosen").innerHTML=ok?"✅ Дұрыс! +50 XP":"Дұрыс рет: <b>"+correct.map(x=>x.date).join(" → ")+"</b>";addProgress(ok?50:0,true)}}
function setGame(name){document.querySelectorAll(".game-tab").forEach(b=>b.classList.toggle("active",b.dataset.game===name));if(name==="cards")renderCard();if(name==="date")renderDate();if(name==="person")renderPerson();if(name==="chrono")renderChrono()}
document.querySelectorAll(".game-tab").forEach(b=>b.onclick=()=>setGame(b.dataset.game));document.getElementById("tipBtn").onclick=()=>document.getElementById("dailyTip").textContent=tips[Math.floor(Math.random()*tips.length)];
initDay();sync();setGame("cards");