const {supabase,sendError,requireAdmin}=require('../support/_lib');
const empty=()=>({summary:{},hardTopics:[],topMistakes:[],modeDropoffs:[],replayedTopics:[]});
const safeDbError=e=>({status:Number(e?.status)||500,message:String(e?.message||'Database request failed').slice(0,180),code:String(e?.detail?.code||'').slice(0,80)});
module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  try{
    requireAdmin(req);
    let modes=[],mistakes=[];
    try{
      modes=await supabase('learning_mode_analytics?select=student_id,topic_id,topic_name,mode,starts,completions,score_sum,total_sum,replays&limit=10000');
    }catch(e){
      const diagnostic=safeDbError(e);
      console.error('[quality-summary] learning_mode_analytics read failed',diagnostic);
      const missingTable=diagnostic.code==='PGRST205'||diagnostic.code==='42P01'||/could not find|does not exist|schema cache/i.test(diagnostic.message);
      return res.status(200).json({ready:false,reason:missingTable?'migration_required':'database_unavailable',diagnostic,...empty()});
    }
    try{
      mistakes=await supabase('learning_mistake_analytics?select=topic_id,topic_name,mode,item_key,kind,item_label,answer_label,wrong_count&order=wrong_count.desc&limit=10000');
    }catch(e){
      console.error('[quality-summary] learning_mistake_analytics read failed',safeDbError(e));
      mistakes=[];
    }
    modes=Array.isArray(modes)?modes:[];mistakes=Array.isArray(mistakes)?mistakes:[];
    const topicMap=new Map(),modeMap=new Map(),mistakeMap=new Map();
    for(const x of modes){const tk=x.topic_id||'unknown',tn=x.topic_name||tk,tm=topicMap.get(tk)||{topicId:tk,topicName:tn,starts:0,completions:0,scoreSum:0,totalSum:0,replays:0,mistakes:0};tm.starts+=Number(x.starts)||0;tm.completions+=Number(x.completions)||0;tm.scoreSum+=Number(x.score_sum)||0;tm.totalSum+=Number(x.total_sum)||0;tm.replays+=Number(x.replays)||0;topicMap.set(tk,tm);const mk=x.mode||'unknown',mm=modeMap.get(mk)||{mode:mk,starts:0,completions:0,scoreSum:0,totalSum:0,replays:0,mistakes:0};mm.starts+=Number(x.starts)||0;mm.completions+=Number(x.completions)||0;mm.scoreSum+=Number(x.score_sum)||0;mm.totalSum+=Number(x.total_sum)||0;mm.replays+=Number(x.replays)||0;modeMap.set(mk,mm)}
    for(const x of mistakes){const count=Number(x.wrong_count)||0,tk=x.topic_id||'unknown',tm=topicMap.get(tk)||{topicId:tk,topicName:x.topic_name||tk,starts:0,completions:0,scoreSum:0,totalSum:0,replays:0,mistakes:0};tm.mistakes+=count;topicMap.set(tk,tm);const mk=x.mode||'unknown',mm=modeMap.get(mk)||{mode:mk,starts:0,completions:0,scoreSum:0,totalSum:0,replays:0,mistakes:0};mm.mistakes+=count;modeMap.set(mk,mm);const ik=`${tk}:${x.item_key}`,it=mistakeMap.get(ik)||{topicId:tk,topicName:x.topic_name||tk,mode:mk,kind:x.kind||'',label:x.item_label||x.item_key,answer:x.answer_label||'',wrongCount:0};it.wrongCount+=count;mistakeMap.set(ik,it)}
    const withMetrics=x=>({...x,accuracy:x.totalSum?Math.round(x.scoreSum/x.totalSum*100):0,dropoffs:Math.max(0,x.starts-x.completions),dropoffRate:x.starts?Math.round(Math.max(0,x.starts-x.completions)/x.starts*100):0});
    const topics=[...topicMap.values()].map(withMetrics),modeDropoffs=[...modeMap.values()].map(withMetrics).sort((a,b)=>b.dropoffRate-a.dropoffRate||b.dropoffs-a.dropoffs),topMistakes=[...mistakeMap.values()].sort((a,b)=>b.wrongCount-a.wrongCount).slice(0,30),hardTopics=topics.filter(x=>x.completions||x.mistakes).sort((a,b)=>a.accuracy-b.accuracy||b.mistakes-a.mistakes).slice(0,30),replayedTopics=[...topics].sort((a,b)=>b.replays-a.replays).slice(0,30);
    const totalScore=topics.reduce((a,x)=>a+x.scoreSum,0),totalQuestions=topics.reduce((a,x)=>a+x.totalSum,0),starts=topics.reduce((a,x)=>a+x.starts,0),completions=topics.reduce((a,x)=>a+x.completions,0),replays=topics.reduce((a,x)=>a+x.replays,0),mistakeCount=topics.reduce((a,x)=>a+x.mistakes,0);
    const summary={avgAccuracy:totalQuestions?Math.round(totalScore/totalQuestions*100):0,starts,completions,dropoffs:Math.max(0,starts-completions),dropoffRate:starts?Math.round(Math.max(0,starts-completions)/starts*100):0,replays,mistakes:mistakeCount,topicsTracked:topics.length};
    res.setHeader('Cache-Control','no-store');res.status(200).json({ready:true,summary,hardTopics,topMistakes,modeDropoffs,replayedTopics});
  }catch(err){sendError(res,err)}
};