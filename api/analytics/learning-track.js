const {supabase,sendError,clean}=require('../support/_lib');
const clamp=(v,max)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0};
const validId=id=>/^[a-zA-Z0-9-]{20,80}$/.test(String(id||''));
const recent=new Map(),WINDOW_MS=2500,MAX_CACHE=5000;
function tooSoon(id){const now=Date.now(),last=recent.get(id)||0;recent.set(id,now);if(recent.size>MAX_CACHE){const cutoff=now-60000;for(const[k,t]of recent){if(t<cutoff)recent.delete(k);if(recent.size<=MAX_CACHE)break}}return now-last<WINDOW_MS}
async function saveTestResult(b,studentId){
  const testId=clean(b.testId,80),testTitle=clean(b.testTitle,140),username=clean(b.username,40);
  if(!testId)throw Object.assign(new Error('Invalid test analytics payload'),{status:400});
  const score=clamp(b.score,10000),maxScore=Math.max(1,clamp(b.maxScore,10000)),questions=(Array.isArray(b.questions)?b.questions:[]).slice(0,200),now=new Date().toISOString();
  const existing=await supabase(`test_attempt_analytics?student_id=eq.${encodeURIComponent(studentId)}&test_id=eq.${encodeURIComponent(testId)}&select=attempts,score_sum,max_score_sum,best_score,best_max_score&limit=1`);
  const prev=Array.isArray(existing)&&existing[0]?existing[0]:{},better=score*Number(prev.best_max_score||1)>Number(prev.best_score||0)*maxScore;
  const attempt={student_id:studentId,test_id:testId,test_title:testTitle,username,attempts:clamp(Number(prev.attempts||0)+1,100000),score_sum:clamp(Number(prev.score_sum||0)+score,10000000),max_score_sum:clamp(Number(prev.max_score_sum||0)+maxScore,10000000),best_score:better||!prev.attempts?score:Number(prev.best_score||0),best_max_score:better||!prev.attempts?maxScore:Number(prev.best_max_score||0),last_score:score,last_max_score:maxScore,completed_at:now};
  await supabase('test_attempt_analytics?on_conflict=student_id,test_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify([attempt])});
  const qRows=[];
  for(const x of questions){const qid=clean(x.id,80);if(!qid)continue;qRows.push({id:qid,number:clamp(x.number,1000),score:clamp(x.score,2),max:Math.max(1,clamp(x.max,2))})}
  if(qRows.length){
    const ids=qRows.map(x=>`"${x.id.replace(/"/g,'')}"`).join(',');
    let existingQuestions=[];try{existingQuestions=await supabase(`test_question_analytics?test_id=eq.${encodeURIComponent(testId)}&question_id=in.(${encodeURIComponent(ids)})&select=question_id,attempts,full_correct,score_sum,max_score_sum`)}catch{existingQuestions=[]}
    const byId=new Map((Array.isArray(existingQuestions)?existingQuestions:[]).map(x=>[x.question_id,x]));
    const rows=qRows.map(x=>{const p=byId.get(x.id)||{};return{test_id:testId,test_title:testTitle,question_id:x.id,question_number:x.number,attempts:clamp(Number(p.attempts||0)+1,1000000),full_correct:clamp(Number(p.full_correct||0)+(x.score===x.max?1:0),1000000),score_sum:clamp(Number(p.score_sum||0)+x.score,10000000),max_score_sum:clamp(Number(p.max_score_sum||0)+x.max,10000000),updated_at:now}});
    await supabase('test_question_analytics?on_conflict=test_id,question_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)});
  }
}
module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const b=req.body||{};if(!validId(b.studentId))return res.status(400).json({error:'Invalid student id'});const studentId=String(b.studentId);
    if(b.testId){await saveTestResult(b,studentId);return res.status(204).end()}
    if(tooSoon(studentId))return res.status(204).end();const now=new Date().toISOString();
    const modes=(Array.isArray(b.modes)?b.modes:[]).slice(0,120).map(x=>({student_id:studentId,topic_id:clean(x.topicId,80),topic_name:clean(x.topicName,140),mode:clean(x.mode,20),starts:clamp(x.starts,100000),completions:clamp(x.completions,100000),score_sum:clamp(x.scoreSum,10000000),total_sum:clamp(x.totalSum,10000000),replays:clamp(x.replays,100000),updated_at:now})).filter(x=>x.topic_id&&x.mode);
    const mistakes=(Array.isArray(b.mistakes)?b.mistakes:[]).slice(0,250).map(x=>({student_id:studentId,topic_id:clean(x.topicId,80),topic_name:clean(x.topicName,140),mode:clean(x.mode,20),item_key:clean(x.itemKey,120),kind:clean(x.kind,20),item_label:clean(x.label,180),answer_label:clean(x.answer,220),wrong_count:clamp(x.wrongCount,100000),updated_at:now})).filter(x=>x.topic_id&&x.mode&&x.item_key);
    if(modes.length)await supabase('learning_mode_analytics?on_conflict=student_id,topic_id,mode',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(modes)});
    if(mistakes.length)await supabase('learning_mistake_analytics?on_conflict=student_id,topic_id,mode,item_key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(mistakes)});
    res.status(204).end();
  }catch(err){sendError(res,err)}
};