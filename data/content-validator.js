(()=>{
  function fail(errors,msg){errors.push(msg)}
  function validateTopic(topic){
    const errors=[];
    if(!topic||typeof topic!=='object')return{ok:false,errors:['Topic JSON is not an object']};
    if(topic.schemaVersion!==2)fail(errors,'schemaVersion must equal 2');
    if(!topic.id)fail(errors,'topic.id is required');
    if(!topic.name)fail(errors,'topic.name is required');
    if(!['ancient','medieval','modern','contemporary'].includes(topic.period))fail(errors,'topic.period is invalid');
    if(!['draft','ready'].includes(topic.status))fail(errors,'topic.status is invalid');
    const facts=Array.isArray(topic.facts)?topic.facts:[],people=Array.isArray(topic.people)?topic.people:[],sets=Array.isArray(topic.chronologySets)?topic.chronologySets:[];
    if(facts.length<4)fail(errors,'facts must contain at least 4 items');
    const factIds=new Set();
    facts.forEach((f,i)=>{
      if(!f?.id)fail(errors,`facts[${i}].id is required`);
      else if(factIds.has(f.id))fail(errors,`duplicate fact id: ${f.id}`); else factIds.add(f.id);
      if(typeof f?.date!=='string'||!f.date.length)fail(errors,`facts[${i}].date is required`);
      if(typeof f?.event!=='string'||!f.event.length)fail(errors,`facts[${i}].event is required`);
    });
    facts.forEach((f,i)=>{
      const ds=Array.isArray(f?.distractorIds)?f.distractorIds:[];
      if(ds.length!==3)fail(errors,`${f?.id||`facts[${i}]`} must have exactly 3 distractorIds`);
      if(new Set(ds).size!==ds.length)fail(errors,`${f?.id||`facts[${i}]`} has duplicate distractorIds`);
      ds.forEach(id=>{if(id===f.id)fail(errors,`${f.id} cannot distract itself`);if(!factIds.has(id))fail(errors,`${f.id} distractor not found: ${id}`)});
    });
    if(people.length>0&&people.length<4)fail(errors,'people must contain at least 4 items when person mode is used');
    const personIds=new Set();
    people.forEach((p,i)=>{
      if(!p?.id)fail(errors,`people[${i}].id is required`);
      else if(personIds.has(p.id))fail(errors,`duplicate person id: ${p.id}`); else personIds.add(p.id);
      if(typeof p?.name!=='string'||!p.name.length)fail(errors,`people[${i}].name is required`);
      if(!Array.isArray(p?.clues)||!p.clues.length||p.clues.some(x=>typeof x!=='string'||!x.length))fail(errors,`people[${i}].clues is required`);
    });
    if(sets.length<5||sets.length>10)fail(errors,'chronologySets must contain 5–10 tasks');
    sets.forEach((set,i)=>{
      if(!Array.isArray(set)||set.length!==4){fail(errors,`chronologySets[${i}] must contain exactly 4 fact ids`);return}
      if(new Set(set).size!==4)fail(errors,`chronologySets[${i}] contains duplicate ids`);
      set.forEach(id=>{if(!factIds.has(id))fail(errors,`chronologySets[${i}] fact not found: ${id}`)});
    });
    return{ok:errors.length===0,errors};
  }
  window.JUZDEREK_CONTENT_VALIDATOR=Object.freeze({validateTopic});
})();