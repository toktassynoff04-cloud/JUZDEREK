const {supabase,sendError,requireAdmin}=require('../support/_lib');
module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  try{
    requireAdmin(req);
    const pageSize=1000;
    const raw=[];
    for(let offset=0;;offset+=pageSize){
      const page=await supabase(`student_analytics?select=student_id,username,first_seen,last_seen,last_page,page_views,sessions,xp,games,correct,mastered_topics,streak&order=last_seen.desc&limit=${pageSize}&offset=${offset}`);
      const chunk=Array.isArray(page)?page:[];
      raw.push(...chunk);
      if(chunk.length<pageSize)break;
    }
    const items=raw.map(x=>({...x,username:(!String(x.username||'').trim()||String(x.username).trim()==='Оқушы')?'Аты көрсетілмеген':x.username}));
    const now=Date.now(),week=7*86400000,dayKey=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Almaty',year:'numeric',month:'2-digit',day:'2-digit'}).format(d),todayKey=dayKey(new Date());
    const sum=k=>items.reduce((a,x)=>a+(Number(x[k])||0),0);
    const summary={totalStudents:items.length,activeToday:items.filter(x=>{const d=new Date(x.last_seen);return !Number.isNaN(d.getTime())&&dayKey(d)===todayKey}).length,activeWeek:items.filter(x=>now-Date.parse(x.last_seen)<=week).length,totalPageViews:sum('page_views'),totalSessions:sum('sessions'),totalXp:sum('xp'),masteredTopics:sum('mastered_topics')};
    res.setHeader('Cache-Control','no-store');res.status(200).json({summary,items});
  }catch(err){sendError(res,err)}
};