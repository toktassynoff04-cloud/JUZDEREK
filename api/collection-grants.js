const {supabase,sendError}=require('./support/_lib');
const validId=id=>/^[a-zA-Z0-9-]{20,80}$/.test(String(id||''));
module.exports=async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  try{
    const studentId=String(req.body?.studentId||'');
    if(!validId(studentId))return res.status(400).json({error:'invalid_student_id'});
    const data=await supabase('rpc/claim_collection_bonus',{method:'POST',body:JSON.stringify({p_student_id:studentId})});
    const chests=Math.max(0,Math.min(100,Math.floor(Number(data)||0)));
    return res.status(200).json({chests});
  }catch(err){sendError(res,err)}
};