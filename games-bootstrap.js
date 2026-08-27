(()=>{
  const params=new URLSearchParams(location.search);
  const topicId=params.get('topic');
  const stage=document.getElementById('stage');
  const script=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Script failed: ${src}`));document.body.appendChild(s)});
  const optional=async(name,src)=>{try{await script(src);return true}catch(error){window.JUZ_RUNTIME_GUARD?.record?.('optional-script',error?.message||error,name);console.warn(`[JUZ Safe Mode] ${name} skipped`,error);return false}};
  function friendlyUnavailable(){if(stage)stage.innerHTML='<div class="question-card"><h3>Тақырып уақытша қолжетімсіз</h3><p>Материал тексеріліп жатыр. Кезеңдерге оралып, басқа тақырыпты таңда.</p><div class="result-actions"><a class="result-action primary" href="periods.html#topicsSection">Кезеңдерге оралу</a></div></div>'}
  (async()=>{
    if(!topicId){location.replace('periods.html');return}
    try{
      await script('./runtime-guard.js?v=20260827-guard1');
      await script('./request-guard.js?v=20260827-guard1');
      await optional('site-header','./site-header-component.js?v=20260823-mobile-1');
      await script('./progress-core.js?v=20260826-xp-simple1');
      await optional('daily-review','./daily-review.js?v=20260825-mistakes1');
      await optional('learning-analytics','./learning-analytics.js?v=20260827-guard1');
      await window.JUZDEREK_TOPIC_LOADER.loadTopic(topicId);
      await optional('real-stats','./real-stats-progress.js?v=20260826-xp-simple1');
      await optional('achievements','./achievements-system.js?v=20260826-xp-simple1');
      await script('./games-engine-v2.js?v=20260827-cleanup1');
      await script('./xp-economy-v2.js?v=20260826-xp-simple1');
      await script('./chrono-game-v2.js?v=20260825-quality1');
      await optional('mistakes','./mistakes.js?v=20260821-absolutism-fix1');
      await script('./result-screen.js?v=20260826-xp-simple1');
      const mode=params.get('mode');
      if(['cards','quiz','person','chrono'].includes(mode)&&typeof window.setMode==='function')window.setMode(mode);
    }catch(error){
      window.JUZ_RUNTIME_GUARD?.record?.('core-bootstrap',error?.message||error,'games-bootstrap');
      console.error('[JUZDEREK Content v2 bootstrap]',error);
      friendlyUnavailable();
    }
  })();
})();