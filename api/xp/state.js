const crypto=require('crypto');
const {supabase,sendError}=require('../support/_lib');
const validId=id=>/^[a-zA-Z0-9-]{20,80}$/.test(String(id||''));
const validToken=t=>/^[a-f0-9]{64}$/.test(String(t||''));
module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const b=req.body||{},studentId=String(b.studentId||''),token=String(b.studentToken||'');
    if(!validId(studentId)||!validToken(token))return res.status(400).json({error:'Invalid student identity'});
    const rows=await supabase(`student_xp_state?select=xp,token_hash,rewards&student_id=eq.${encodeURIComponent(studentId)}&limit=1`);
    if(Array.isArray(rows)&&rows.length){
      const row=rows[0],hash=crypto.createHash('sha256').update(token).digest('hex');
      if(row.token_hash&&row.token_hash!==hash)return res.status(409).json({error:'Student identity mismatch'});
      res.setHeader('Cache-Control','private, no-store');
      return res.status(200).json({xp:Number(row.xp)||0,rewards:row.rewards&&typeof row.rewards==='object'?row.rewards:{}})
    }
    const legacy=await supabase(`student_analytics?select=xp&student_id=eq.${encodeURIComponent(studentId)}&limit=1`);
    res.setHeader('Cache-Control','private, no-store');
    res.status(200).json({xp:Array.isArray(legacy)&&legacy[0]?Number(legacy[0].xp)||0:0,rewards:{}});
  }catch(err){sendError(res,err)}
};