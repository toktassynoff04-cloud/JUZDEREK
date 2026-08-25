const {supabase,sendError,requireAdmin}=require('../support/_lib');
module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  try{
    requireAdmin(req);
    const rows=await supabase('student_analytics?select=student_id,username,first_seen,last_seen,last_page,page_views,sessions,xp,games,correct,mastered_topics,streak&order=last_seen.desc&limit=1000');
    const raw=Array.isArray(rows)?rows:[];
    const items=raw.map(x=>({...x,username:(!String(x.username||'').trim()||String(x.username).trim()==='Оқушы')?'Аты көрсетілмеген':x.username}));
    const now=Date.now(),day=86400000,week=7*day;
    const sum=k=>items.reduce((a,x)=>a+(Number(x[k])||0),0);
    const summary={totalStudents:items.length,activeToday:items.filter(x=>now-Date.parse(x.last_seen)<=day).length,activeWeek:items.filter(x=>now-Date.parse(x.last_seen)<=week).length,totalPageViews:sum('page_views'),totalSessions:sum('sessions'),totalXp:sum('xp'),masteredTopics:sum('mastered_topics')};
    res.setHeader('Cache-Control','no-store');res.status(200).json({summary,items});
  }catch(err){sendError(res,err)}
};