import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const topicsDir=path.join(root,'data','topics');
const indexFile=path.join(root,'data','topics-index.js');
const marker='// === GENERATED INDEX END / STATIC NAVIGATION PATCH BELOW ===';

const files=(await readdir(topicsDir)).filter(name=>name.endsWith('.json')).sort((a,b)=>a.localeCompare(b,'en'));
if(!files.length)throw new Error('No topic JSON files found in data/topics');

const seenIds=new Set();
const seenNames=new Set();
const topics=[];
for(const file of files){
  const raw=JSON.parse(await readFile(path.join(topicsDir,file),'utf8'));
  const required=['id','name','period','periodLabel','status'];
  for(const key of required)if(typeof raw[key]!=='string'||!raw[key].trim())throw new Error(`${file}: missing ${key}`);
  if(seenIds.has(raw.id))throw new Error(`${file}: duplicate topic id ${raw.id}`);
  if(seenNames.has(raw.name))throw new Error(`${file}: duplicate topic name ${raw.name}`);
  seenIds.add(raw.id);seenNames.add(raw.name);
  topics.push({id:raw.id,name:raw.name,period:raw.period,periodLabel:raw.periodLabel,file:`./data/topics/${file}`,ready:raw.status==='ready'});
}

let staticTail='';
try{
  const current=await readFile(indexFile,'utf8');
  const markerIndex=current.indexOf(marker);
  if(markerIndex>=0)staticTail=current.slice(markerIndex+marker.length).trimStart();
}catch{}

const esc=value=>String(value).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
const lines=topics.map(t=>`  '${esc(t.id)}':Object.freeze({id:'${esc(t.id)}',name:'${esc(t.name)}',period:'${esc(t.period)}',periodLabel:'${esc(t.periodLabel)}',file:'${esc(t.file)}',ready:${t.ready}})`).join(',\n');
const generated=`window.JUZDEREK_TOPIC_INDEX=Object.freeze({\n${lines}\n});\nwindow.JUZDEREK_TOPIC_ALIASES=Object.freeze(Object.fromEntries(Object.values(window.JUZDEREK_TOPIC_INDEX).map(t=>[t.name,t.id])));\n${marker}\n${staticTail}`.trimEnd()+'\n';
await writeFile(indexFile,generated,'utf8');
console.log(`topics-index.js generated from ${topics.length} topic files.`);
