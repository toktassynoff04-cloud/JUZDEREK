(() => {
  function chronoShuffle(items){return [...items].sort(()=>Math.random()-.5)}
  function sequenceHtml(nums){return nums.map((n,i)=>`${i?'<span class="chrono-seq-arrow">→</span>':''}<span class="chrono-seq-num">${n}</span>`).join('')}

  window.renderChrono=function(){
    const base=facts.slice(0,5).map((f,idx)=>({...f,correctIndex:idx}));
    const initial=chronoShuffle(base);
    const numbered=initial.map((f,i)=>({...f,sourceNum:i+1}));
    window.__chronoOrder=numbered;

    stage.innerHTML=`<div class="stage-top"><div class="stage-title"><h2>Хронология</h2><p>Оқиғаларды реттілігі бойынша орналастырыңыз.</p></div><span class="step-counter">5 оқиға</span></div><div class="progress-line"><span style="width:0%"></span></div><div class="chrono-game"><div class="chrono-help"><span class="chrono-help-icon">↕</span><span>Әр оқиғаға тұрақты сан берілді. Карточкаларды жоғары-төмен жылжытып, ең ерте оқиғадан ең кейінгісіне дейін ретте.</span></div><div class="chrono-list" id="chronoList"></div><div class="chrono-actions"><button class="btn soft" id="resetChrono">Бастапқы ретке қайтару</button><button class="btn primary" id="checkChrono">Реттілікті тексеру</button></div><div class="chrono-result" id="chronoResult"></div></div>`;

    const list=document.getElementById('chronoList');
    function renderList(){
      list.innerHTML=window.__chronoOrder.map((f,i)=>`<div class="chrono-item" draggable="true" data-num="${f.sourceNum}"><span class="chrono-source-num">${f.sourceNum}</span><span class="chrono-copy">${f.event}</span><span class="chrono-controls"><button class="chrono-move" data-dir="up" ${i===0?'disabled':''} aria-label="Жоғары жылжыту">↑</button><button class="chrono-move" data-dir="down" ${i===window.__chronoOrder.length-1?'disabled':''} aria-label="Төмен жылжыту">↓</button></span></div>`).join('');
      bindRows();
    }

    function moveItem(index,delta){
      const next=index+delta;if(next<0||next>=window.__chronoOrder.length)return;
      const arr=[...window.__chronoOrder];[arr[index],arr[next]]=[arr[next],arr[index]];window.__chronoOrder=arr;renderList();
    }

    function bindRows(){
      const rows=[...list.querySelectorAll('.chrono-item')];
      rows.forEach((row,index)=>{
        row.querySelector('[data-dir="up"]')?.addEventListener('click',e=>{e.stopPropagation();moveItem(index,-1)});
        row.querySelector('[data-dir="down"]')?.addEventListener('click',e=>{e.stopPropagation();moveItem(index,1)});
        row.addEventListener('dragstart',()=>{row.classList.add('dragging');window.__chronoDragged=row});
        row.addEventListener('dragend',()=>{row.classList.remove('dragging');window.__chronoDragged=null});
        row.addEventListener('dragover',e=>{e.preventDefault();const dragged=window.__chronoDragged;if(!dragged||dragged===row)return;const current=[...list.querySelectorAll('.chrono-item')];const from=current.indexOf(dragged);const to=current.indexOf(row);const arr=[...window.__chronoOrder];const [moved]=arr.splice(from,1);arr.splice(to,0,moved);window.__chronoOrder=arr;renderList()});
      });
    }

    renderList();
    const initialOrder=[...numbered];
    document.getElementById('resetChrono').onclick=()=>{window.__chronoOrder=[...initialOrder];renderList();const result=document.getElementById('chronoResult');result.className='chrono-result';result.innerHTML=''};
    document.getElementById('checkChrono').onclick=()=>{
      const userNums=window.__chronoOrder.map(x=>x.sourceNum);
      const correctNums=[...numbered].sort((a,b)=>a.correctIndex-b.correctIndex).map(x=>x.sourceNum);
      const ok=userNums.every((n,i)=>n===correctNums[i]);
      const result=document.getElementById('chronoResult');
      result.className='chrono-result show '+(ok?'ok':'bad');
      result.innerHTML=`<h3 class="chrono-result-title">${ok?'Керемет! Реттілік дұрыс.':'Реттілікті тағы бір тексеріп көр.'}</h3><div class="chrono-sequence"><span class="chrono-sequence-label">Сенің реттілігің:</span>${sequenceHtml(userNums)}</div>${ok?`<p class="chrono-correct-note"><strong>Дұрыс жауап:</strong> ${correctNums.join(', ')}</p><div class="chrono-final-actions"><button class="btn primary" id="finishChrono">Аяқтау · +50 XP</button></div>`:`<p class="chrono-correct-note">Мысалы, соңғы жауап <strong>${correctNums.join(', ')}</strong> форматында шығады. Карточкаларды тағы жылжытып көр.</p>`}`;
      if(ok){
        document.getElementById('checkChrono').disabled=true;
        document.getElementById('finishChrono').onclick=()=>{saveProgress(50,1);showResult('Хронология аяқталды!',1,1)};
      }
    };
  };
})();
