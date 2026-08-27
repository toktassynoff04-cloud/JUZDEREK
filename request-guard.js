(()=>{
  if(window.JUZ_REQUEST_GUARD)return;
  const inFlight=new Map();
  async function run(key,url,options={},timeoutMs=8000){
    const k=String(key||url);
    if(inFlight.has(k))return inFlight.get(k);
    const p=(async()=>{
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),Math.max(1000,Number(timeoutMs)||8000));
      try{
        return await fetch(url,{...options,signal:options.signal||controller.signal});
      }finally{
        clearTimeout(timer);
        inFlight.delete(k);
      }
    })();
    inFlight.set(k,p);
    return p;
  }
  const active=()=>inFlight.size;
  window.JUZ_REQUEST_GUARD={run,active};
})();