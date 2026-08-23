const crypto=require('crypto');
const ALLOWED_KINDS=new Set(['question','suggestion']);
const clean=(v,max=1500)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
const validStudentId=id=>/^[a-zA-Z0-9-]{20,80}$/.test(String(id||''));
const validStudentToken=token=>/^[a-f0-9]{64}$/.test(String(token||''));
const hashStudentToken=token=>crypto.createHash('sha256').update(String(token||'')).digest('hex');
function env(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw Object.assign(new Error('Support database is not configured'),{status:503});return{url:url.replace(/\/$/,''),key}}
async function supabase(path,options={}){const {url,key}=env();const r=await fetch(`${url}/rest/v1/${path}`,{...options,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...(options.headers||{})}});const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}if(!r.ok){const e=new Error(data?.message||data?.error||'Database request failed');e.status=r.status;e.detail=data;throw e}return data}
function sendError(res,err){const status=Number(err?.status)||500;res.status(status).json({error:status>=500?'Қолдау қызметі уақытша қолжетімсіз. Кейінірек қайталап көріңіз.':err.message||'Сұраныс орындалмады.'})}
async function notifyTelegram(ticket){
  const token=String(process.env.TELEGRAM_BOT_TOKEN||'').trim();
  const chatId=String(process.env.TELEGRAM_CHAT_ID||'').trim();
  if(!token||!chatId){console.warn('[support] Telegram notification skipped: env missing');return false}
  const kind=ticket.kind==='suggestion'?'Ұсыныс':'Сұрақ';
  const text=`🔔 JUZDEREK — жаңа ${kind.toLowerCase()}\n\nОқушы: ${ticket.username}\nБет: ${ticket.page||'-'}\n\n${ticket.message}`.slice(0,3900);
  try{
    const r=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text,disable_web_page_preview:true})});
    const raw=await r.text();
    let data=null;try{data=raw?JSON.parse(raw):null}catch{data=null}
    if(!r.ok||data?.ok===false){console.error('[support] Telegram send failed',{status:r.status,description:data?.description||'Unknown Telegram error'});return false}
    return true;
  }catch(err){console.error('[support] Telegram request failed',{message:err?.message||'Network error'});return false}
}
function requireAdmin(req){const expected=process.env.SUPPORT_ADMIN_TOKEN;if(!expected)throw Object.assign(new Error('Admin access is not configured'),{status:503});const auth=String(req.headers.authorization||'');if(auth!==`Bearer ${expected}`)throw Object.assign(new Error('Рұқсат жоқ'),{status:401})}
module.exports={ALLOWED_KINDS,clean,validStudentId,validStudentToken,hashStudentToken,supabase,sendError,notifyTelegram,requireAdmin};