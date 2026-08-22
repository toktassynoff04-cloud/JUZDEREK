import { spawnSync } from 'node:child_process';

const run=(script)=>{
  const result=spawnSync(process.execPath,[script],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);
};

run('scripts/build-topics-index.mjs');
run('scripts/validate-content.mjs');
console.log('Content build completed successfully.');
