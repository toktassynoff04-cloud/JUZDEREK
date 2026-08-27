(()=>{
  if(window.JUZ_RUNTIME_GUARD)return;
  const KEY='juzderek_runtime_health_v1',MAX_ERRORS=20;
  const read=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{}}catch{return{}}};
  const write=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
  function record(type,message,source=''){
    const s=read();s.errors=Array.isArray(s.errors)?s.errors:[];
    s.errors.push({at:new Date().toISOString(),page:location.pathname,type:String(type||'error').slice(0,30),message:String(message||'Unknown error').slice(0,240),source:String(source||'').slice(0,160)});
    if(s.errors.length>MAX_ERRORS)s.errors=s.errors.slice(-MAX_ERRORS);
    s.lastErrorAt=Date.now();write(s);
  }
  function optional(name,fn){try{return fn()}catch(err){record('optional-module',err?.message||err,name);console.warn(`[JUZ Safe Mode] ${name} disabled`,err);return null}}
  async function optionalAsync(name,fn){try{return await fn()}catch(err){record('optional-module',err?.message||err,name);console.warn(`[JUZ Safe Mode] ${name} disabled`,err);return null}}
  addEventListener('error',e=>record('window-error',e.message,e.filename));
  addEventListener('unhandledrejection',e=>record('promise-rejection',e.reason?.message||e.reason||'Unhandled rejection'));
  window.JUZ_RUNTIME_GUARD={record,optional,optionalAsync,state:read,clear:()=>{try{localStorage.removeItem(KEY)}catch{}}};
})();