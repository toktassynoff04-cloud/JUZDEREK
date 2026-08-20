(()=>{
  const deepFreeze=value=>{
    if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
    Object.freeze(value);Object.values(value).forEach(deepFreeze);return value;
  };

  const chronologyTarget=count=>{
    if(count>=24)return 10;
    if(count>=20)return 9;
    if(count>=16)return 8;
    if(count>=12)return 7;
    if(count>=8)return 6;
    return 5;
  };

  function nearestDistractors(facts,index){
    const out=[];
    for(let distance=1;out.length<3&&distance<facts.length;distance++){
      const right=index+distance,left=index-distance;
      if(right<facts.length)out.push(facts[right].id);
      if(out.length<3&&left>=0)out.push(facts[left].id);
    }
    return out.slice(0,3);
  }

  function buildChronologySets(facts){
    const n=facts.length;
    if(n<4)return[];
    const target=Math.min(10,chronologyTarget(n));
    const maxStart=Math.max(0,n-4);
    const starts=[];
    if(target===1)starts.push(0);
    else{
      for(let i=0;i<target;i++){
        const start=Math.round((maxStart*i)/(target-1));
        if(!starts.includes(start))starts.push(start);
      }
    }
    for(let start=0;starts.length<target&&start<=maxStart;start++){
      if(!starts.includes(start))starts.push(start);
    }
    return starts.slice(0,target).map(start=>facts.slice(start,start+4).map(f=>f.id));
  }

  function normalizeTopic(raw){
    const topic={...raw};
    const facts=Array.isArray(raw?.facts)?raw.facts.map((fact,index,all)=>{
      const current=Array.isArray(fact?.distractorIds)?fact.distractorIds:[];
      const valid=current.length===3&&new Set(current).size===3&&current.every(id=>id!==fact.id&&all.some(x=>x.id===id));
      return valid?{...fact}:{...fact,distractorIds:nearestDistractors(all,index)};
    }):[];
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