(()=>{
  if(window.JUZ_SERVER_XP)return;
  const readProgress=()=>{try{const p=JSON.parse(localStorage.getItem('juzderek_game_progress')||'{}');return p&&typeof p==='object'?p:{}}catch{return{}}};
  const currentXp=()=>Math.max(0,Number(readProgress().xp)||0);
  const sync=async()=>currentXp();
  const complete=async()=>({xp:currentXp(),gained:0,localOnly:true});
  const noop=async()=>{};
  window.JUZ_SERVER_XP={
    studentId:()=>localStorage.getItem('juzderek_support_student_id')||localStorage.getItem('juzderek_analytics_id')||'',
    studentToken:()=>localStorage.getItem('juzderek_support_student_token')||'',
    applyXp:()=>currentXp(),
    applyRewards:()=>false,
    complete,
    flush:noop,
    sync
  };
})();