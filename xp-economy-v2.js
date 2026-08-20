(()=>{
  const MODE_REWARD=25;
  const TOPIC_BONUS=50;
  const TOPIC_BONUS_KEY='topic:mastery-50';
  completeMode=function(mode,score,total){
    const daily=ensureDailyBeforeCompletion();
    const t=getTopic(),pct=total?Math.round(score/total*100):100;
    t.scores=t.scores||{};
    t.rewarded=t.rewarded||{};
    t.completed=Array.isArray(t.completed)?t.completed:[];
    t.scores[mode]={score,total,pct,finishedAt:Date.now(),analysis:{...state.analysis}};
    const firstCompletion=!t.completed.includes(mode);
    if(firstCompletion)t.completed.push(mode);
    let gained=0;
    const rewardKey=`mode:${mode}`;
    if(firstCompletion&&!t.rewarded[rewardKey]){
      t.rewarded[rewardKey]=true;
      gained+=MODE_REWARD;
    }
    if(t.completed.length===MODES.length&&!t.rewarded[TOPIC_BONUS_KEY]){
      t.rewarded[TOPIC_BONUS_KEY]=true;
      t.topicBonus=true;
      gained+=TOPIC_BONUS;
    }
    t.updatedAt=Date.now();
    saveTopic(t);
    addProgress(gained,0,1);
    touchLearning();
    state.sessionXp+=gained;
    const all=safeJSON('juzderek_daily_activity',daily.all),d=all[daily.today]||{games:0,xp:0,masteredAtStart:0,bonus:false,modes:[]};
    d.games=(Number(d.games)||0)+1;
    d.xp=(Number(d.xp)||0)+gained;
    d.modes=Array.isArray(d.modes)?d.modes:[];
    if(!d.modes.includes(mode))d.modes.push(mode);
    all[daily.today]=d;
    localStorage.setItem('juzderek_daily_activity',JSON.stringify(all));
    return gained;
  };
})();
