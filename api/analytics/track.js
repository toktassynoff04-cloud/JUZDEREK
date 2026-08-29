const {supabase,sendError,clean}=require('../support/_lib');
const clamp=(v,max)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0};
const validId=id=>/^[a-zA-Z0-9-]{20,80}$/.test(String(id||''));
module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const b=req.body||{};
    if(!validId(b.studentId))return res.status(400).json({error:'Invalid student id'});
    const studentId=String(b.studentId);
    const username=clean(b.username,40);
    if(!username||username.toLocaleLowerCase('kk-KZ')==='оқушы'||username.toLocaleLowerCase('kk-KZ')==='аты көрсетілмеген')return res.status(400).json({error:'Student name is required'});
    const row={
      student_id:studentId,
      username,
      last_page:clean(b.page,120)||'/',
      last_seen:new Date().toISOString(),
      page_views:clamp(b.pageViews,1000000),
      sessions:clamp(b.sessions,100000),
      xp:clamp(b.xp,10000000),
      games:clamp(b.games,1000000),
      correct:clamp(b.correct,1000000),
      mastered_topics:clamp(b.masteredTopics,100000),
      streak:clamp(b.streak,10000)
    };
    await supabase('student_analytics?on_conflict=student_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(row)});
    res.status(204).end();
  }catch(err){sendError(res,err)}
};