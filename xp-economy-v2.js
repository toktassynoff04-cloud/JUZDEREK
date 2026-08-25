(()=>{
  const MODE_REWARD=25;
  const TOPIC_BONUS=50;
  const TOPIC_BONUS_KEY='topic:mastery-50';
  function updateResultXp(gained){
    const stat=document.querySelector('.result-summary .result-stat:last-child');
    const strong=stat?.querySelector('strong'),mini=stat?.querySelector('.mini');
    if(strong)strong.textContent=`+${gained}`;
    if(mini)mini.textContent=gained?'бір реттік сыйақы':'қайта ойнау';
  }
  function addAuthoritativeDailyXp(amount,daily){
    if(!amount)return;
    const all=safeJSON('juzderek_daily_activity',daily.all),d=all[daily.today]||{games:0,xp:0,masteredAtStart:0,bonus:false,modes:[]};
    d.xp=(Number(d.xp)||0)+amount;
    all[daily.today]=d;
    localStorage.setItem('juzderek_daily_activity',JSON.stringify(all));
  }
  completeMode=function(mode,score,total){
    const daily=ensureDailyBeforeCompletion();
    const t=getTopic(),pct=total?Math.round(score/total*100):100;
    t.scores=t.scores||{};
    t.rewarded=t.rewarded||{};
    t.completed=Array.isArray(t.completed)?t.completed:[];
    t.scores[mode]={score,total,pct,finishedAt:Date.now(),analysis:{...state.analysis}};
    const firstCompletion=!t.completed.includes(mode);
    if(firstCompletion)t.completed.push(mode);
    const rewardKey=`mode:${mode}`;
    if(firstCompletion&&!t.rewarded[rewardKey])t.rewarded[rewardKey]=true;
    if(MODES.every(m=>t.completed.includes(m))&&!t.rewarded[TOPIC_BONUS_KEY]){t.rewarded[TOPIC_BONUS_KEY]=true;t.topicBonus=true}
    t.updatedAt=Date.now();
    saveTopic(t);
    addProgress(0,0,firstCompletion?1:0);
    if(firstCompletion){(window.JUZ_PROGRESS_CORE?.touchLearning||touchLearning)()}
    state.sessionXp=0;
    const all=safeJSON('juzderek_daily_activity',daily.all),d=all[daily.today]||{games:0,xp:0,masteredAtStart:0,bonus:false,modes:[]};
    if(firstCompletion)d.games=(Number(d.games)||0)+1;
    d.modes=Array.isArray(d.modes)?d.modes:[];
    if(firstCompletion&&!d.modes.includes(mode))d.modes.push(mode);
    all[daily.today]=d;
    localStorage.setItem('juzderek_daily_activity',JSON.stringify(all));
    if(window.JUZ_SERVER_XP?.complete){
      window.JUZ_SERVER_XP.complete(TOPIC_ID,mode).then(result=>{
        const authoritative=Number(result?.xp)||0,serverGained=Math.max(0,Number(result?.gained)||0);
        state.sessionXp=serverGained;
        if(xpEl)xpEl.textContent=authoritative+' XP';
        addAuthoritativeDailyXp(serverGained,daily);
        updateResultXp(serverGained);
      }).catch(err=>console.warn('[JUZDEREK XP] sync queued',err?.message||err));
    }
    return 0;
  };
})();