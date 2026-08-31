const {supabase,sendError,clean}=require('../support/_lib');
const validId=id=>/^[a-zA-Z0-9-]{20,80}$/.test(String(id||''));
const clamp=(v,max)=>{const n=Number(v);return Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0};
module.exports=async(req,res)=>{
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 try{
  const b=req.body||{},studentId=String(b.studentId||''),testId=clean(b.testId,80),testTitle=clean(b.testTitle,140),username=clean(b.username,40);
  if(!validId(studentId)||!testId)return res.status(400).json({error:'Invalid test analytics payload'});
  const score=clamp(b.score,10000),maxScore=Math.max(1,clamp(b.maxScore,10000)),questions=(Array.isArray(b.questions)?b.questions:[]).slice(0,200),now=new Date().toISOString();
  const [attemptRows,questionRows]=await Promise.all([
   supabase(`test_attempt_analytics?student_id=eq.${encodeURIComponent(studentId)}&test_id=eq.${encodeURIComponent(testId)}&select=attempts,score_sum,max_score_sum,best_score,best_max_score&limit=1`),
   supabase(`test_question_analytics?test_id=eq.${encodeURIComponent(testId)}&select=question_id,attempts,full_correct,score_sum,max_score_sum&limit=500`)
  ]);
  const prev=Array.isArray(attemptRows)&&attemptRows[0]?attemptRows[0]:{},better=score*Number(prev.best_max_score||1)>Number(prev.best_score||0)*maxScore;
  const attempt={student_id:studentId,test_id:testId,test_title:testTitle,username,attempts:clamp(Number(prev.attempts||0)+1,100000),score_sum:clamp(Number(prev.score_sum||0)+score,10000000),max_score_sum:clamp(Number(prev.max_score_sum||0)+maxScore,10000000),best_score:better||!prev.attempts?score:Number(prev.best_score||0),best_max_score:better||!prev.attempts?maxScore:Number(prev.best_max_score||0),last_score:score,last_max_score:maxScore,completed_at:now};
  const old=new Map((Array.isArray(questionRows)?questionRows:[]).map(x=>[x.question_id,x]));
  const qUpserts=questions.map(x=>{const qid=clean(x.id,80);if(!qid)return null;const p=old.get(qid)||{},qs=clamp(x.score,2),qm=Math.max(1,clamp(x.max,2));return{test_id:testId,test_title:testTitle,question_id:qid,question_number:clamp(x.number,1000),attempts:clamp(Number(p.attempts||0)+1,1000000),full_correct:clamp(Number(p.full_correct||0)+(qs===qm?1:0),1000000),score_sum:clamp(Number(p.score_sum||0)+qs,10000000),max_score_sum:clamp(Number(p.max_score_sum||0)+qm,10000000),updated_at:now}}).filter(Boolean);
  await Promise.all([
   supabase('test_attempt_analytics?on_conflict=student_id,test_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify([attempt])}),
   qUpserts.length?supabase('test_question_analytics?on_conflict=test_id,question_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(qUpserts)}):Promise.resolve()
  ]);
  res.status(204).end();
 }catch(err){sendError(res,err)}
};