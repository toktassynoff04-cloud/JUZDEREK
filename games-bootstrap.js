(()=>{
  const params=new URLSearchParams(location.search);
  const topicId=params.get('topic');
  const requestedMode=params.get('mode');
  const stage=document.getElementById('stage');
  const script=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Script failed: ${src}`));document.body.appendChild(s)});
  const optional=async(name,src)=>{try{await script(src);return true}catch(error){window.JUZ_RUNTIME_GUARD?.record?.('optional-script',error?.message||error,name);console.warn(`[JUZ Safe Mode] ${name} skipped`,error);return false}};
  const background=(name,src)=>optional(name,src).catch(()=>false);
  function friendlyUnavailable(){if(stage)stage.innerHTML='<div class="question-card"><h3>Тақырып уақытша қолжетімсіз</h3><p>Материал тексеріліп жатыр. Кезеңдерге оралып, басқа тақырыпты таңда.</p><div class="result-actions"><a class="result-action primary" href="periods.html#topicsSection">Кезеңдерге оралу</a></div></div>'}
  (async()=>{
    if(!topicId){location.replace('periods.html');return}
    try{
      await script('./runtime-guard.js?v=20260827-guard1');
      await script('./request-guard.js?v=20260827-guard1');
      background('site-header','./site-header-component.js?v=20260915-routefix1');
      await script('./progress-core.js?v=20260826-xp-simple1');
      await window.JUZDEREK_TOPIC_LOADER.loadTopic(topicId);
      background('daily-review','./daily-review.js?v=20260825-mistakes1');
      background('learning-analytics','./learning-analytics.js?v=20260827-guard1');
      await script('./games-engine-v2.js?v=20260827-cleanup1');
      await optional('term-mode','./term-game-extension.js?v=20260915-integrated1');
      if(requestedMode==='term'&&window.JUZ_TERM_MODE){window.JUZ_TERM_MODE.open()}
      else if(['cards','quiz','person'].includes(requestedMode)&&typeof window.setMode==='function'){window.setMode(requestedMode)}
      await Promise.all([script('./xp-economy-v2.js?v=20260826-xp-simple1'),script('./chrono-game-v2.js?v=20260825-quality1'),script('./result-screen.js?v=20260826-xp-simple1')]);
      if(requestedMode==='chrono'&&typeof window.setMode==='function')window.setMode('chrono');
      background('real-stats','./real-stats-progress.js?v=20260826-xp-simple1');background('achievements','./achievements-system.js?v=20260826-xp-simple1');background('mistakes','./mistakes.js?v=20260821-absolutism-fix1');
    }catch(error){window.JUZ_RUNTIME_GUARD?.record?.('core-bootstrap',error?.message||error,'games-bootstrap');console.error('[JUZDEREK Content v2 bootstrap]',error);friendlyUnavailable()}
  })();
})();