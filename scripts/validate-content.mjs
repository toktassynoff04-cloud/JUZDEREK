import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.cwd(),'data/topics');
const files=fs.readdirSync(root).filter(x=>x.endsWith('.json')).sort();
function validate(topic){
  const errors=[],add=m=>errors.push(m),facts=Array.isArray(topic.facts)?topic.facts:[],people=Array.isArray(topic.people)?topic.people:[],sets=Array.isArray(topic.chronologySets)?topic.chronologySets:[];
  if(topic.schemaVersion!==2)add('schemaVersion must equal 2');if(!topic.id)add('id is required');if(!topic.name)add('name is required');if(!['ancient','medieval','modern','contemporary'].includes(topic.period))add('period is invalid');
  const ids=new Set();facts.forEach((f,i)=>{if(!f.id)add(`facts[${i}].id missing`);else if(ids.has(f.id))add(`duplicate fact id ${f.id}`);else ids.add(f.id);if(!f.date)add(`${f.id||i}: date missing`);if(!f.event)add(`${f.id||i}: event missing`)});
  facts.forEach((f,i)=>{const ds=Array.isArray(f.distractorIds)?f.distractorIds:[];if(ds.length!==3)add(`${f.id||i}: exactly 3 distractorIds required`);if(new Set(ds).size!==ds.length)add(`${f.id||i}: duplicate distractors`);ds.forEach(id=>{if(id===f.id)add(`${f.id}: self distractor`);if(!ids.has(id))add(`${f.id}: distractor not found ${id}`)})});
  if(people.length<4)add('minimum 4 people required');const pids=new Set();people.forEach((p,i)=>{if(!p.id)add(`people[${i}].id missing`);else if(pids.has(p.id))add(`duplicate person id ${p.id}`);else pids.add(p.id);if(!p.name)add(`${p.id||i}: name missing`);if(!Array.isArray(p.clues)||!p.clues.length)add(`${p.id||i}: clues missing`)});
  if(sets.length<5||sets.length>10)add('chronologySets must contain 5–10 tasks');sets.forEach((set,i)=>{if(!Array.isArray(set)||set.length!==4){add(`chronologySets[${i}] must contain exactly 4 ids`);return}if(new Set(set).size!==4)add(`chronologySets[${i}] has duplicates`);set.forEach(id=>{if(!ids.has(id))add(`chronologySets[${i}] fact not found ${id}`)})});return errors;
}
let failed=false;for(const file of files){const topic=JSON.parse(fs.readFileSync(path.join(root,file),'utf8')),errors=validate(topic);if(errors.length){failed=true;console.error(`✗ ${file}`);errors.forEach(e=>console.error(`  - ${e}`))}else console.log(`✓ ${file}: ${topic.facts.length} facts, ${topic.people.length} people, ${topic.chronologySets.length} chronology tasks`)}if(failed)process.exit(1);
