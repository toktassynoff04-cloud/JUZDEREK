(()=>{
  if(window.JUZ_REQUEST_GUARD)return;
  const inFlight=new Map();
  const METRIC_KEY='juzderek_request_metrics_v1';
  const METRIC_WINDOW=10*60*1000;
  const MAX_EVENTS=160;
  function readEvents(){try{const v=JSON.parse(localStorage.getItem(METRIC_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
  function endpoint(url){try{return new URL(url,location.origin).pathname.slice(0,120)}catch{return String(url||'').split('?')[0].slice(0,120)}}
  function record(url,ok,status,ms){
    try{
      const now=Date.now(),cut=now-METRIC_WINDOW;
      const events=readEvents().filter(x=>Number(x?.at)>=cut).slice(-(MAX_EVENTS-1));
      events.push({at:now,endpoint:endpoint(url),ok:!!ok,status:Number(status)||0,ms:Math.max(0,Math.round(Number(ms)||0))});
      localStorage.setItem(METRIC_KEY,JSON.stringify(events));
    }catch{}
  }
  function stats(windowMs=METRIC_WINDOW){
    const now=Date.now(),cut=now-Math.max(60000,Number(windowMs)||METRIC_WINDOW),events=readEvents().filter(x=>Number(x?.at)>=cut);
    const by=new Map();
    for(const e of events){const key=String(e.endpoint||'unknown');const x=by.get(key)||{endpoint:key,count:0,failed:0,totalMs:0,maxMs:0};x.count++;if(!e.ok)x.failed++;x.totalMs+=Number(e.ms)||0;x.maxMs=Math.max(x.maxMs,Number(e.ms)||0);by.set(key,x)}
    return{windowMs:now-cut,total:events.length,failed:events.filter(x=>!x.ok).length,items:[...by.values()].map(x=>({...x,avgMs:x.count?Math.round(x.totalMs/x.count):0})).sort((a,b)=>b.count-a.count||b.avgMs-a.avgMs)};
  }
  async function run(key,url,options={},timeoutMs=8000){
    const k=String(key||url);
    if(inFlight.has(k))return inFlight.get(k);
    const p=(async()=>{
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),Math.max(1000,Number(timeoutMs)||8000));
      const started=performance.now();
      try{
        const response=await fetch(url,{...options,signal:options.signal||controller.signal});
        record(url,response.ok,response.status,performance.now()-started);
        return response;
      }catch(error){
        record(url,false,0,performance.now()-started);
        throw error;
      }finally{
        clearTimeout(timer);
        inFlight.delete(k);
      }
    })();
    inFlight.set(k,p);
    return p;
  }
  const active=()=>inFlight.size;
  window.JUZ_REQUEST_GUARD={run,active,stats};
})();