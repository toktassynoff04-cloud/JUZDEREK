const {supabase,supabaseCount,sendError}=require('./support/_lib');
const LEVELS=[{min:0,level:1,title:'Ізденуші'},{min:500,level:2,title:'Ізденуші'},{min:1200,level:3,title:'Зерттеуші'},{min:2200,level:4,title:'Зерттеуші'},{min:3500,level:5,title:'Білгір'},{min:5000,level:6,title:'Білгір'},{min:7000,level:7,title:'Білгір'},{min:9500,level:8,title:'Сарапшы'},{min:12500,level:9,title:'Сарапшы'},{min:16000,level:10,title:'Сарапшы'},{min:20000,level:11,title:'Тарихшы'},{min:25000,level:12,title:'Тарихшы'},{min:31000,level:13,title:'Тарихшы'},{min:38000,level:14,title:'Аңыз'},{min:46000,level:15,title:'Аңыз'}];
const rankInfo=xp=>[...LEVELS].reverse().find(x=>(Number(xp)||0)>=x.min)||LEVELS[0];
const clean=v=>String(v||'').trim();
const validId=id=>/^[a-zA-Z0-9-]{20,80}$/.test(String(id||''));
const validName=v=>{const s=clean(v).toLocaleLowerCase('kk-KZ');return s&&s!=='оқушы'&&s!=='аты көрсетілмеген'};
const nameKey=v=>clean(v).toLocaleLowerCase('kk-KZ').replace(/\s+/g,' ');
const shape=(x,rank)=>{const r=rankInfo(x.xp);return{rank,studentId:x.student_id,username:clean(x.username).slice(0,40),xp:Number(x.xp)||0,masteredTopics:Number(x.mastered_topics)||0,streak:Number(x.streak)||0,level:r.level,title:r.title}};
module.exports=async(req,res)=>{
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  try{
    const studentId=clean(req.query?.studentId).slice(0,80);
    const rows=await supabase('student_analytics?select=student_id,username,xp,mastered_topics,streak,last_seen&order=xp.desc,last_seen.asc&limit=60');
    const seen=new Set();
    const ranked=(Array.isArray(rows)?rows:[]).filter(x=>{
      if(!validName(x.username))return false;
      const key=nameKey(x.username);
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
    const items=ranked.slice(0,20).map((x,i)=>shape(x,i+1));
    let me=null,xpToTop20=0;
    if(validId(studentId)){
      const inTop=items.find(x=>x.studentId===studentId);
      if(inTop)me=inTop;
      else{
        const mine=await supabase(`student_analytics?select=student_id,username,xp,mastered_topics,streak,last_seen&student_id=eq.${encodeURIComponent(studentId)}&limit=1`);
        const info=Array.isArray(mine)?mine[0]:null;
        if(info&&validName(info.username)){
          const higher=ranked.filter(x=>(Number(x.xp)||0)>(Number(info.xp)||0)).length;
          me=shape(info,higher+1);
          const cutoff=items.length>=20?items[19].xp:null;
          if(me.rank>20&&cutoff!==null)xpToTop20=Math.max(0,cutoff-me.xp+1);
        }
      }
    }
    res.setHeader('Cache-Control','private, no-store');
    res.status(200).json({items,me,xpToTop20,totalRanked:ranked.length});
  }catch(err){sendError(res,err)}
};