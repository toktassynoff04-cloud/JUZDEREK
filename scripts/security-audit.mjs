import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const textExt=new Set(['.html','.js','.mjs','.css','.json','.md','.txt']);
const skipDirs=new Set(['.git','node_modules','.vercel']);
const findings=[];

function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(skipDirs.has(entry.name))continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()){walk(full);continue}
    const rel=path.relative(root,full).replaceAll('\\','/');
    if(/^\.env(?:\.|$)/.test(entry.name))findings.push(`${rel}: environment file must not be committed`);
    if(!textExt.has(path.extname(entry.name).toLowerCase()))continue;
    const text=fs.readFileSync(full,'utf8');
    const checks=[
      [/\bsk-[A-Za-z0-9_-]{20,}\b/g,'possible OpenAI-style secret'],
      [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,'possible GitHub token'],
      [/\bAIza[0-9A-Za-z_-]{20,}\b/g,'possible Google API key'],
      [/\beval\s*\(/g,'eval() is forbidden'],
      [/\bnew\s+Function\s*\(/g,'new Function() is forbidden'],
      [/document\.write\s*\(/g,'document.write() is forbidden'],
      [/javascript\s*:/gi,'javascript: URL is forbidden']
    ];
    for(const [regex,label] of checks){if(regex.test(text))findings.push(`${rel}: ${label}`)}
    if(text.includes("get('admin')==='1'")&&!text.includes('LOCAL_PREVIEW'))findings.push(`${rel}: public ?admin=1 preview bypass`);
  }
}

walk(root);

if(findings.length){
  console.error('Security audit failed:\n- '+findings.join('\n- '));
  process.exit(1);
}
console.log('Security audit passed. No obvious committed secrets or forbidden runtime patterns found.');
