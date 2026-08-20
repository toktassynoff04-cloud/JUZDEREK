(()=>{
  const deepFreeze=value=>{
    if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
    Object.freeze(value);Object.values(value).forEach(deepFreeze);return value;
  };

  const romanValue=s=>{
    const map={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
    let total=0,prev=0;
    for(const ch of String(s||'').toUpperCase().replace(/[^IVXLCDM]/g,'')){
      const val=map[ch]||0;
      total+=val>prev?val-2*prev:val;
      prev=val;
    }
    return total;
  };

  function dateRank(text){
    const s=String(text||'').replace(/–|—/g,'-');
    const arabic=s.match(/\b(\d{3,4})\b/);
    if(arabic)return Number(arabic[1]);
    const century=s.match(/\b([IVXLCDMІVХ]+)\s*ғасыр/i);
    if(century){
      const normalized=century[1].replace(/І/g,'I').replace(/Х/g,'X').replace(/Ⅴ/g,'V');
      const c=romanValue(normalized)||1;
      let offset=50;
      if(/бас|алғашқы|бірінші ширек/i.test(s))offset=15;
      else if(/І\s*жарты|I\s*жарты|бірінші жарты/i.test(s))offset=25;
      else if(/орт/i.test(s))offset=50;
      else if(/ІІ\s*жарты|II\s*жарты|екінші жарты/i.test(s))offset=75;
      else if(/аяғ/i.test(s))offset=90;
      const decade=s.match(/(\d{2})-жыл/i);
      if(decade)offset=Number(decade[1])+5;
      return (c-1)*100+offset;
    }
    return Number.MAX_SAFE_INTEGER;
  }

  const chronologyTarget=count=>{
    if(count>=24)return 10;
    if(count>=20)return 9;
    if(count>=16)return 8;
    if(count>=12)return 7;
    if(count>=8)return 6;
    return 5;
  };

  function orderedFacts(facts){
    return facts.map((fact,index)=>({fact,index,rank:dateRank(fact.date)}))
      .sort((a,b)=>a.rank-b.rank||a.index-b.index)
      .map(x=>x.fact);
  }

  function nearestDistractors(sorted,fact){
    const index=sorted.findIndex(x=>x.id===fact.id);
    const out=[];
    for(let distance=1;out.length<3&&distance<sorted.length;distance++){
      const right=index+distance,left=index-distance;
      if(right<sorted.length)out.push(sorted[right].id);
      if(out.length<3&&left>=0)out.push(sorted[left].id);
    }
    return out.slice(0,3);
  }

  function buildChronologySets(facts){
    const sorted=orderedFacts(facts);
    const n=sorted.length;
    if(n<4)return[];
    const target=Math.min(10,chronologyTarget(n));
    const maxStart=Math.max(0,n-4);
    const starts=[];
    for(let i=0;i<target;i++){
      const start=target===1?0:Math.round((maxStart*i)/(target-1));
      if(!starts.includes(start))starts.push(start);
    }
    for(let start=0;starts.length<target&&start<=maxStart;start++){
      if(!starts.includes(start))starts.push(start);
    }
    while(starts.length<target)starts.push(starts[starts.length%Math.max(1,starts.length)]||0);
    return starts.slice(0,target).map(start=>sorted.slice(start,start+4).map(f=>f.id));
  }

  function normalizeTopic(raw){
    const topic={...raw};
    const sourceFacts=Array.isArray(raw?.facts)?raw.facts:[];
    const sorted=orderedFacts(sourceFacts);
    const facts=sourceFacts.map(fact=>{
      const current=Array.isArray(fact?.distractorIds)?fact.distractorIds:[];
      const valid=current.length===3&&new Set(current).size===3&&current.every(id=>id!==fact.id&&sourceFacts.some(x=>x.id===id));
      return valid?{...fact}:{...fact,distractorIds:nearestDistractors(sorted,fact)};
    });
    topic.facts=facts;
    const currentSets=Array.isArray(raw?.chronologySets)?raw.chronologySets:[];
    const validSets=currentSets.length>=5&&currentSets.length<=10&&currentSets.every(set=>Array.isArray(set)&&set.length===4&&new Set(set).size===4&&set.every(id=>facts.some(f=>f.id===id)));
    topic.chronologySets=validSets?currentSets:buildChronologySets(facts);
    return topic;
  }

  async function loadTopic(id){
    const meta=window.JUZDEREK_TOPIC_INDEX?.[id];
    if(!meta||meta.ready!==true)throw new Error(`Topic is not ready: ${id||'(empty)'}`);
    const response=await fetch(meta.file,{cache:'default'});
    if(!response.ok)throw new Error(`Topic file failed to load: ${meta.file} (${response.status})`);
    const raw=await response.json();
    const topic=normalizeTopic(raw);
    const result=window.JUZDEREK_CONTENT_VALIDATOR?.validateTopic(topic)||{ok:false,errors:['Validator unavailable']};
    if(!result.ok){console.error('[JUZDEREK Content v2]',id,result.errors);throw new Error(`Topic validation failed: ${id}`)}
    if(topic.id!==id)throw new Error(`Topic id mismatch: requested ${id}, file contains ${topic.id}`);
    if(topic.status!=='ready')throw new Error(`Topic is not published: ${id}`);
    const frozen=deepFreeze(topic);
    window.JUZDEREK_TOPICS=Object.freeze({[id]:frozen});
    window.JUZDEREK_ACTIVE_TOPIC=frozen;
    return frozen;
  }
  window.JUZDEREK_TOPIC_LOADER=Object.freeze({loadTopic});
})();