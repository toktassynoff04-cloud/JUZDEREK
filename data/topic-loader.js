(()=>{
  const deepFreeze=value=>{
    if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
    Object.freeze(value);Object.values(value).forEach(deepFreeze);return value;
  };
  async function loadTopic(id){
    const meta=window.JUZDEREK_TOPIC_INDEX?.[id];
    if(!meta||meta.ready!==true)throw new Error(`Topic is not ready: ${id||'(empty)'}`);
    const response=await fetch(meta.file,{cache:'default'});
    if(!response.ok)throw new Error(`Topic file failed to load: ${meta.file} (${response.status})`);
    const topic=await response.json();
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