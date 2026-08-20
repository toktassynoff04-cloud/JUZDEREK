(()=>{
  const params=new URLSearchParams(location.search);
  const topicId=params.get('topic');
  const stage=document.getElementById('stage');
  const script=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Script failed: ${src}`));document.body.appendChild(s)});
  function friendlyUnavailable(){
    if(stage)stage.innerHTML='<div class="question-card"><h3>Тақырып уақытша қолжетімсіз</h3><p>Материал тексеріліп жатыр. Кезеңдерге оралып, басқа тақырыпты таңда.</p><div class="result-actions"><a class="result-action primary" href="periods.html#topicsSection">Кезеңдерге оралу</a></div></div>';
  }
  (async()=>{
    if(!topicId){location.replace('periods.html');return}
    try{
      await window.JUZDEREK_TOPIC_LOADER.loadTopic(topicId);
      await script('./real-stats-progress.js?v=20260821-absolutism-fix2');
      await script('./achievements-system.js?v=20260821-absolutism-fix2');
      await script('./games-engine-v2.js?v=20260821-absolutism-fix2');
      await script('./xp-economy-v2.js?v=20260820-xp3');
      await script('./chrono-game-v2.js?v=20260821-absolutism-fix2');
      await script('./mistakes.js?v=20260821-absolutism-fix2');
      await script('./result-screen.js?v=20260820-board-final');
      await script('./site-header-component.js?v=20260821-absolutism-fix2');
      const mode=params.get('mode');
      if(['cards','quiz','person','chrono'].includes(mode)&&typeof window.setMode==='function')window.setMode(mode);
    }catch(error){
      console.error('[JUZDEREK Content v2 bootstrap]',error);
      friendlyUnavailable();
    }
  })();
})();
