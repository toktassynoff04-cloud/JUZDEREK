(() => {
  const modeMeta={
    cards:{label:'Карточкалар',next:'quiz',nextLabel:'Тестке өту'},
    quiz:{label:'Тест',next:'person',nextLabel:'Тұлғаны тапқа өту'},
    person:{label:'Тұлғаны тап',next:'chrono',nextLabel:'Хронологияға өту'},
    chrono:{label:'Хронология',next:'cards',nextLabel:'Карточкаларға оралу'}
  };

  function getModeTotal(mode,total){
    if(total) return total;
    if(mode==='cards' && typeof facts!=='undefined') return facts.length;
    if(mode==='person' && typeof people!=='undefined') return people.length;
    if(mode==='chrono') return 5;
    return 0;
  }

  window.showResult=function(title,score,total){
    const mode=state.mode;
    const meta=modeMeta[mode]||modeMeta.cards;
    const realTotal=getModeTotal(mode,total);
    const safeScore=Math.min(score||0,realTotal||score||0);
    const pct=realTotal?Math.round((safeScore/realTotal)*100):100;
    const gainedXp=mode==='quiz'?safeScore*20:mode==='person'?safeScore*25:mode==='cards'?safeScore*10:50;
    let headline='Керемет жұмыс!';
    let sub='Тақырып бойынша нәтижең сақталды.';
    if(pct<50){headline='Тағы бір қайталап шығайық';sub='Негізгі ұғымдарды тағы бір рет бекітсең, нәтижең тез өседі.'}
    else if(pct<80){headline='Жақсы нәтиже!';sub='Бірнеше сұрақты қайталап, нәтижені одан әрі жақсарта аласың.'}
    else if(pct>=90){headline='Өте жақсы!';sub='Тақырыпты сенімді меңгеріп келе жатырсың.'}
    const missed=Math.max(realTotal-safeScore,0);
    const reviewText=missed?`${missed} тапсырманы қайта қарап шық. Қате кеткен сұрақтарды қайта орындау нәтижеңді бекітеді.`:'Қайталауды қажет ететін тапсырма жоқ. Осы қарқынмен жалғастыр!';
    const goodText=pct>=80?'Негізгі даталар, оқиғалар мен тұлғаларды жақсы меңгердің.':'Дұрыс жауап берген тапсырмаларың — сенің мықты жағың. Сол логиканы сақта.';
    stage.innerHTML=`<div class="result-shell"><div class="result-hero"><span class="result-badge">${meta.label} аяқталды</span><div class="result-check">✓</div><h2>${headline}</h2><p>${sub}</p></div><div class="result-summary"><div class="result-stat"><small>Дұрыс жауап</small><strong>${safeScore}/${realTotal}</strong><span class="mini">тапсырма</span></div><div class="result-stat orange"><small>Дәлдік</small><strong>${pct}%</strong><span class="mini">жалпы нәтиже</span></div><div class="result-stat"><small>Жиналған XP</small><strong>+${gainedXp}</strong><span class="mini">осы ойында</span></div></div><div class="result-insight-grid"><div class="result-insight review"><h3>Қайталау керек</h3><p>${reviewText}</p></div><div class="result-insight good"><h3>Жақсы меңгердің</h3><p>${goodText}</p></div></div><div class="result-actions"><button class="result-action secondary" id="retryResult">Қайта орындау</button><button class="result-action primary" id="nextResult">${meta.nextLabel} →</button></div></div>`;
    document.getElementById('retryResult').onclick=()=>setMode(mode);
    document.getElementById('nextResult').onclick=()=>setMode(meta.next);
  };
})();