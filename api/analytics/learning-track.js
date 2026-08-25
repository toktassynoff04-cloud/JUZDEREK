const {supabase,sendError,clean}=require('../support/_lib');
const clamp=(v,max)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0};
const validId=id=>/^[a-zA-Z0-9-]{20,80}$/.test(String(id||''));
const recent=new Map(),WINDOW_MS=2500,MAX_CACHE=5000;
function tooSoon(id){const now=Date.now(),last=recent.get(id)||0;recent.set(id,now);if(recent.size>MAX_CACHE){const cutoff=now-60000;for(const[k,t]of recent){if(t<cutoff)recent.delete(k);if(recent.size<=MAX_CACHE)break}}return now-last<WINDOW_MS}
module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const b=req.body||{};if(!validId(b.studentId))return res.status(400).json({error:'Invalid student id'});const studentId=String(b.studentId);if(tooSoon(studentId))return res.status(204).end();const now=new Date().toISOString();
    const modes=(Array.isArray(b.modes)?b.modes:[]).slice(0,120).map(x=>({student_id:studentId,topic_id:clean(x.topicId,80),topic_name:clean(x.topicName,140),mode:clean(x.mode,20),starts:clamp(x.starts,100000),completions:clamp(x.completions,100000),score_sum:clamp(x.scoreSum,10000000),total_sum:clamp(x.totalSum,10000000),replays:clamp(x.replays,100000),updated_at:now})).filter(x=>x.topic_id&&x.mode);
    const mistakes=(Array.isArray(b.mistakes)?b.mistakes:[]).slice(0,250).map(x=>({student_id:studentId,topic_id:clean(x.topicId,80),topic_name:clean(x.topicName,140),mode:clean(x.mode,20),item_key:clean(x.itemKey,120),kind:clean(x.kind,20),item_label:clean(x.label,180),answer_label:clean(x.answer,220),wrong_count:clamp(x.wrongCount,100000),updated_at:now})).filter(x=>x.topic_id&&x.mode&&x.item_key);
    if(modes.length)await supabase('learning_mode_analytics?on_conflict=student_id,topic_id,mode',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(modes)});
    if(mistakes.length)await supabase('learning_mistake_analytics?on_conflict=student_id,topic_id,mode,item_key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(mistakes)});
    res.status(204).end();
  }catch(err){sendError(res,err)}
};