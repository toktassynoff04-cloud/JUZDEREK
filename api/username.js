const NAME_RE=/^[\p{L}\p{N}_\- ]+$/u;
function cleanName(value=''){return String(value).normalize('NFKC').trim().replace(/\s+/g,' ')}
function keyName(name){return cleanName(name).toLocaleLowerCase('kk-KZ')}
async function redis(command){
  const url=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;
  const token=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
  if(!url||!token)throw new Error('REDIS_NOT_CONFIGURED');
  const r=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(command)});
  if(!r.ok)throw new Error('REDIS_REQUEST_FAILED');
  const data=await r.json();
  if(data.error)throw new Error(data.error);
  return data.result;
}
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'METHOD_NOT_ALLOWED'});
  try{
    const name=cleanName(req.body?.name);
    const clientId=cleanName(req.body?.clientId);
    if(name.length<2||name.length>20||!NAME_RE.test(name))return res.status(400).json({ok:false,error:'INVALID_NAME',message:'Аты 2–20 таңба аралығында болуы керек.'});
    if(!clientId||clientId.length>80)return res.status(400).json({ok:false,error:'INVALID_CLIENT'});
    const normalized=keyName(name);
    const usernameKey=`juzderek:username:${normalized}`;
    const existing=await redis(['GET',usernameKey]);
    if(existing&&existing!==clientId)return res.status(409).json({ok:false,error:'USERNAME_TAKEN',message:'Бұл пайдаланушы аты бос емес. Басқа ат енгізіңіз.'});
    if(!existing){
      const reserved=await redis(['SET',usernameKey,clientId,'NX']);
      if(reserved!=='OK')return res.status(409).json({ok:false,error:'USERNAME_TAKEN',message:'Бұл пайдаланушы аты бос емес. Басқа ат енгізіңіз.'});
    }
    await redis(['HSET',`juzderek:user:${clientId}`,'name',name,'usernameKey',normalized,'createdAt',String(Date.now())]);
    return res.status(200).json({ok:true,name});
  }catch(err){
    const config=err?.message==='REDIS_NOT_CONFIGURED';
    return res.status(config?503:500).json({ok:false,error:config?'STORAGE_NOT_CONFIGURED':'SERVER_ERROR',message:config?'Пайдаланушы аттарын тексеру жүйесі әлі қосылмаған.':'Қате шықты. Қайтадан байқап көріңіз.'});
  }
}
