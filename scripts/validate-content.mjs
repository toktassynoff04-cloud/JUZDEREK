import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(process.cwd(),'data/topics');
const files=fs.readdirSync(root).filter(x=>x.endsWith('.json')).sort();
const romanValue=s=>{const map={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};let total=0,prev=0;for(const ch of String(s||'').toUpperCase().replace(/[^IVXLCDM]/g,'')){const val=map[ch]||0;total+=val>prev?val-2*prev:val;prev=val}return total};
const dateRank=text=>{const s=String(text||'').replace(/–|—/g,'-');const arabic=s.match(/\b(\d{3,4})\b/);if(arabic)return Number(arabic[1]);const century=s.match(/\b([IVXLCDMІVХ]+)\s*ғасыр/i);if(!century)return Number.MAX_SAFE_INTEGER;const c=romanValue(century[1].replace(/І/g,'I').replace(/Х/g,'X'))||1;let offset=50;if(/бас|алғашқы|бірінші ширек/i.test(s))offset=15;else if(/І\s*жарты|I\s*жарты|бірінші жарты/i.test(s))offset=25;else if(/орт/i.test(s))offset=50;else if(/ІІ\s*жарты|II\s*жарты|екінші жарты/i.test(s))offset=75;else if(/аяғ/i.test(s))offset=90;return(c-1)*100+offset};
const orderedFacts=facts=>facts.map((fact,index)=>({fact,index,rank:dateRank(fact.date)})).sort((a,b)=>a.rank-b.rank||a.index-b.index).map(x=>x.fact);
const chronologyTarget=count=>count>=24?10:count>=20?9:count>=16?8:count>=12?7:count>=8?6:5;
const nearestDistractors=(sorted,fact)=>{const index=sorted.findIndex(x=>x.id===fact.id),out=[];for(let d=1;out.length<3&&d<sorted.length;d++){if(index+d<sorted.length)out.push(sorted[index+d].id);if(out.length<3&&index-d>=0)out.push(sorted[index-d].id)}return out.slice(0,3)};
const buildChronologySets=facts=>{const sorted=orderedFacts(facts),n=sorted.length;if(n<4)return[];const target=Math.min(10,chronologyTarget(n)),maxStart=Math.max(0,n-4),starts=[];for(let i=0;i<target;i++){const start=target===1?0:Math.round((maxStart*i)/(target-1));if(!starts.includes(start))starts.push(start)}for(let start=0;starts.length<target&&start<=maxStart;start++)if(!starts.includes(start))starts.push(start);return starts.slice(0,target).map(start=>sorted.slice(start,start+4).map(f=>f.id))};
const normalize=raw=>{const facts=Array.isArray(raw.facts)?raw.facts:[],sorted=orderedFacts(facts);const nextFacts=facts.map(f=>{const ds=Array.isArray(f.distractorIds)?f.distractorIds:[];const valid=ds.length===3&&new Set(ds).size===3&&ds.every(id=>id!==f.id&&facts.some(x=>x.id===id));return valid?f:{...f,distractorIds:nearestDistractors(sorted,f)}});const sets=Array.isArray(raw.chronologySets)?raw.chronologySets:[];const validSets=sets.length>=5&&sets.length<=10&&sets.every(set=>Array.isArray(set)&&set.length===4&&new Set(set).size===4&&set.every(id=>nextFacts.some(f=>f.id===id)));return{...raw,facts:nextFacts,chronologySets:validSets?sets:buildChronologySets(nextFacts)}};

function validate(topic){
  const errors=[],add=m=>errors.push(m),facts=Array.isArray(topic.facts)?topic.facts:[],people=Array.isArray(topic.people)?topic.people:[],sets=Array.isArray(topic.chronologySets)?topic.chronologySets:[];
  if(topic.schemaVersion!==2)add('schemaVersion must equal 2');if(!topic.id)add('id is required');if(!topic.name)add('name is required');if(!['ancient','medieval','modern','contemporary'].includes(topic.period))add('period is invalid');
  const ids=new Set();facts.forEach((f,i)=>{if(!f.id)add(`facts[${i}].id missing`);else if(ids.has(f.id))add(`duplicate fact id ${f.id}`);else ids.add(f.id);if(!f.date)add(`${f.id||i}: date missing`);if(!f.event)add(`${f.id||i}: event missing`)});
  facts.forEach((f,i)=>{const ds=Array.isArray(f.distractorIds)?f.distractorIds:[];if(ds.length!==3)add(`${f.id||i}: exactly 3 distractorIds required`);if(new Set(ds).size!==ds.length)add(`${f.id||i}: duplicate distractors`);ds.forEach(id=>{if(id===f.id)add(`${f.id}: self distractor`);if(!ids.has(id))add(`${f.id}: distractor not found ${id}`)})});
  if(people.length<4)add('minimum 4 people required');const pids=new Set();people.forEach((p,i)=>{if(!p.id)add(`people[${i}].id missing`);else if(pids.has(p.id))add(`duplicate person id ${p.id}`);else pids.add(p.id);if(!p.name)add(`${p.id||i}: name missing`);if(!Array.isArray(p.clues)||!p.clues.length)add(`${p.id||i}: clues missing`)});
  if(sets.length<5||sets.length>10)add('chronologySets must contain 5–10 tasks');sets.forEach((set,i)=>{if(!Array.isArray(set)||set.length!==4){add(`chronologySets[${i}] must contain exactly 4 ids`);return}if(new Set(set).size!==4)add(`chronologySets[${i}] has duplicates`);set.forEach(id=>{if(!ids.has(id))add(`chronologySets[${i}] fact not found ${id}`)})});return errors;
}

let failed=false;
for(const file of files){
  const raw=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  const topic=normalize(raw),errors=validate(topic);
  if(errors.length){failed=true;console.error(`✗ ${file}`);errors.forEach(e=>console.error(`  - ${e}`))}
  else console.log(`✓ ${file}: ${topic.facts.length} facts, ${topic.people.length} people, ${topic.chronologySets.length} chronology tasks`);
}
if(failed)process.exit(1);
