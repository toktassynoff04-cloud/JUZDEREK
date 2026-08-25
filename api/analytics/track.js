const {supabase,sendError,clean}=require('../support/_lib');
const clamp=(v,max)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0};
const validId=id=>/^[a-zA-Z0-9-]{20,80}$/.test(String(id||''));
const recent=new Map(),WINDOW_MS=2500,MAX_CACHE=5000;
function tooSoon(id){const now=Date.now(),last=recent.get(id)||0;recent.set(id,now);if(recent.size>MAX_CACHE){const cutoff=now-60000;for(const[k,t]of recent){if(t<cutoff)recent.delete(k);if(recent.size<=MAX_CACHE)break}}return now-last<WINDOW_MS}
module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const b=req.body||{};if(!validId(b.studentId))return res.status(400).json({error:'Invalid student id'});const studentId=String(b.studentId);if(tooSoon(studentId))return res.status(204).end();
    const username=clean(b.username,40)||'Аты көрсетілмеген';
    const row={student_id:studentId,username,last_page:clean(b.page,120)||'/',last_seen:new Date().toISOString(),page_views:clamp(b.pageViews,1000000),sessions:clamp(b.sessions,100000),games:clamp(b.games,1000000),correct:clamp(b.correct,1000000),mastered_topics:clamp(b.masteredTopics,10000),streak:clamp(b.streak,10000)};
    await supabase('student_analytics?on_conflict=student_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(row)});
    res.status(204).end();
  }catch(err){sendError(res,err)}
};