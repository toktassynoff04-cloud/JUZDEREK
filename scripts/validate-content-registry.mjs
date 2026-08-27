import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const INDEX=path.join(ROOT,'data/topics-index.js');
const TOPICS=path.join(ROOT,'data/topics');
const src=fs.readFileSync(INDEX,'utf8');
const jsonFiles=fs.readdirSync(TOPICS).filter(x=>x.endsWith('.json')).sort();
const entries=new Map();
const entryRe=/['"]([^'"]+)['"]\s*:\s*Object\.freeze\(\{([^}]+)\}\)/g;
for(const m of src.matchAll(entryRe)){
  const key=m[1],body=m[2];
  const pick=name=>body.match(new RegExp(`${name}\\s*:\\s*['\"]([^'\"]+)['\"]`))?.[1]||'';
  const ready=/ready\s*:\s*true/.test(body);
  entries.set(key,{key,id:pick('id'),name:pick('name'),period:pick('period'),file:pick('file'),ready});
}

const errors=[];
const add=x=>errors.push(x);
if(!entries.size)add('topics-index.js: no topic entries found');
for(const [key,e] of entries){
  if(e.id!==key)add(`${key}: id does not match registry key (${e.id||'missing'})`);
  if(!['ancient','medieval','modern','contemporary'].includes(e.period))add(`${key}: invalid period ${e.period||'missing'}`);
  if(!e.name)add(`${key}: name missing`);
  if(!e.file)add(`${key}: file missing`);
  if(e.ready){
    const rel=e.file.replace(/^\.\//,'');
    const full=path.join(ROOT,rel);
    if(!fs.existsSync(full)){add(`${key}: ready:true but file not found: ${e.file}`);continue}
    try{
      const topic=JSON.parse(fs.readFileSync(full,'utf8'));
      if(topic.id!==key)add(`${key}: JSON id mismatch (${topic.id||'missing'})`);
      if(topic.name!==e.name)add(`${key}: JSON name does not match index`);
      if(topic.period!==e.period)add(`${key}: JSON period does not match index`);
      if(topic.schemaVersion!==2)add(`${key}: schemaVersion must equal 2`);
      if(!Array.isArray(topic.facts)||topic.facts.length<4)add(`${key}: minimum 4 facts required`);
      if(!Array.isArray(topic.chronologySets)||topic.chronologySets.length<1)add(`${key}: chronologySets missing`);
    }catch(err){add(`${key}: invalid JSON (${err.message})`)}
  }
}
for(const file of jsonFiles){
  let topic;
  try{topic=JSON.parse(fs.readFileSync(path.join(TOPICS,file),'utf8'))}catch(err){add(`${file}: invalid JSON (${err.message})`);continue}
  if(!topic?.id){add(`${file}: id missing`);continue}
  const e=entries.get(topic.id);
  if(!e)add(`${file}: JSON topic ${topic.id} is not registered in topics-index.js`);
  else if(path.basename(e.file||'')!==file)add(`${file}: index points to ${e.file||'missing file'}`);
}

if(errors.length){
  console.error('\nCONTENT REGISTRY VALIDATION FAILED\n');
  errors.forEach(e=>console.error(`- ${e}`));
  process.exit(1);
}
console.log(`Content registry passed: ${entries.size} indexed topics, ${jsonFiles.length} JSON files.`);
