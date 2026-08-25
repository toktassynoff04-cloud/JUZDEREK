const crypto=require('crypto');
const {supabase,sendError}=require('../support/_lib');

const TOPICS=new Set([
  'ancient-persia','ancient-greece','byzantine-empire','kievan-rus','arab-caliphate','origin-of-islam','islamic-golden-age','crusades-causes-course-results','post-crusades-world','genghis-khan','golden-horde','timur-empire','moscow-state','yuan-empire','hulagu-state','chagatai-state','genghis-conquests-eurasia-impact','france-england-peasant-revolts','feudal-wars-jeanne-darc','europe-centralized-states','feudal-state-development-stages','france-absolutism','england-absolutism','russia-absolutism','china-political-system','japan-absolutism','ottoman-empire','eastern-medieval-culture','western-europe-renaissance','humanism-ideas','scientific-knowledge-development','industrial-revolution-social-structure','new-era-overview','enlightenment-period'
]);
const MODES=new Set(['cards','quiz','person','chrono']);
const PERSONLESS=new Set(['new-era-overview']);
const validId=id=>/^[a-zA-Z0-9-]{20,80}$/.test(String(id||''));
const validToken=t=>/^[a-f0-9]{64}$/.test(String(t||''));
const recent=new Map(),WINDOW_MS=700,MAX_CACHE=5000;
function tooSoon(key){const now=Date.now(),last=recent.get(key)||0;recent.set(key,now);if(recent.size>MAX_CACHE){const cutoff=now-60000;for(const[k,t]of recent){if(t<cutoff)recent.delete(k);if(recent.size<=MAX_CACHE)break}}return now-last<WINDOW_MS}

async function incrementMasteredTopic(studentId){
  const rows=await supabase(`student_analytics?select=mastered_topics&student_id=eq.${encodeURIComponent(studentId)}&limit=1`);
  const current=Math.max(0,Number(Array.isArray(rows)?rows[0]?.mastered_topics:0)||0);
  await supabase(`student_analytics?student_id=eq.${encodeURIComponent(studentId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({mastered_topics:current+1,last_seen:new Date().toISOString()})});
}

module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const b=req.body||{},studentId=String(b.studentId||''),token=String(b.studentToken||''),topicId=String(b.topicId||''),mode=String(b.mode||'');
    if(!validId(studentId)||!validToken(token))return res.status(400).json({error:'Invalid student identity'});
    if(!TOPICS.has(topicId)||!MODES.has(mode))return res.status(400).json({error:'Invalid topic or mode'});
    if(PERSONLESS.has(topicId)&&mode==='person')return res.status(400).json({error:'Mode is not available for this topic'});
    const key=`${studentId}:${topicId}:${mode}`;if(tooSoon(key))return res.status(429).json({error:'Too many requests'});
    const tokenHash=crypto.createHash('sha256').update(token).digest('hex');
    const requiredMask=PERSONLESS.has(topicId)?11:15;
    const data=await supabase('rpc/juzderek_award_xp',{method:'POST',body:JSON.stringify({p_student_id:studentId,p_token_hash:tokenHash,p_topic_id:topicId,p_mode:mode,p_required_mask:requiredMask})});
    const row=Array.isArray(data)?data[0]:data;
    if(!row)return res.status(500).json({error:'XP update failed'});
    if(row.topic_bonus_awarded){
      try{await incrementMasteredTopic(studentId)}catch(err){console.error('[xp] mastered topic sync failed',{studentId,message:err?.message||'unknown'})}
    }
    res.setHeader('Cache-Control','no-store');
    res.status(200).json({xp:Number(row.xp)||0,gained:Number(row.gained)||0,modeAwarded:!!row.mode_awarded,topicBonusAwarded:!!row.topic_bonus_awarded});
  }catch(err){
    if(String(err?.message||'').includes('student_token_mismatch'))return res.status(409).json({error:'Student identity mismatch'});
    sendError(res,err);
  }
};