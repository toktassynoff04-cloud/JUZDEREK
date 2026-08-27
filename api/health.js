const {supabase}=require('./support/_lib');
module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const started=Date.now();
  const out={ok:true,api:true,supabase:false,leaderboard:false,leaderboardTable:false,serverTime:new Date().toISOString(),commit:String(process.env.VERCEL_GIT_COMMIT_SHA||'').slice(0,12),latencyMs:0};
  try{
    await supabase('student_analytics?select=student_id&limit=1');
    out.supabase=true;out.leaderboard=true;out.leaderboardTable=true;
  }catch(err){out.ok=false;out.error=String(err?.message||'Database unavailable').slice(0,120)}
  out.latencyMs=Date.now()-started;
  res.setHeader('Cache-Control','no-store');
  res.status(out.ok?200:503).json(out);
};