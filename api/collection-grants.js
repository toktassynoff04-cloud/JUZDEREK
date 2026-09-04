module.exports=async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  return res.status(501).json({error:'not_configured'});
};