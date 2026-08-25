import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const SKIP=new Set(['.git','node_modules','.vercel']);
const exts=new Set(['.js','.mjs','.html']);
const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(SKIP.has(ent.name))continue;
    const p=path.join(dir,ent.name);
    if(ent.isDirectory())walk(p);else if(exts.has(path.extname(ent.name)))files.push(p);
  }
}
walk(ROOT);

const rules=[
  {name:'Storage.prototype.setItem override',re:/Storage\.prototype\.setItem\s*=/g,why:'Can create site-wide storage feedback loops.'},
  {name:'localStorage.setItem override',re:/localStorage\.setItem\s*=/g,why:'Do not monkey-patch browser storage globally.'},
  {name:'window.setTimeout override',re:/window\.setTimeout\s*=/g,why:'Do not replace the global timer implementation.'},
  {name:'global fetch override',re:/(?:window\.)?fetch\s*=\s*(?:async\s*)?(?:function|\()/g,why:'Use a local request wrapper instead of replacing fetch.'},
  {name:'body-wide MutationObserver',re:/\.observe\s*\(\s*(?:document\.)?body\s*,[\s\S]{0,180}?subtree\s*:\s*true/g,why:'Observe a narrow container; body+subtree can self-trigger indefinitely.'},
];

const findings=[];
for(const file of files){
  const src=fs.readFileSync(file,'utf8');
  for(const rule of rules){
    rule.re.lastIndex=0;
    let m;
    while((m=rule.re.exec(src))){
      const line=src.slice(0,m.index).split('\n').length;
      findings.push({file:path.relative(ROOT,file),line,rule:rule.name,why:rule.why});
    }
  }
}

if(findings.length){
  console.error('\nFREEZE GUARD FAILED\n');
  for(const f of findings)console.error(`- ${f.file}:${f.line} — ${f.rule}\n  ${f.why}`);
  console.error('\nFix the pattern or redesign it locally before merging.\n');
  process.exit(1);
}
console.log(`Freeze guard passed: scanned ${files.length} JS/HTML files.`);
