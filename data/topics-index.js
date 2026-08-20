window.JUZDEREK_TOPIC_INDEX=Object.freeze({
  'ancient-persia':Object.freeze({id:'ancient-persia',name:'Ежелгі Парсы мемлекеті',period:'ancient',periodLabel:'Ежелгі заман',file:'./data/topics/ancient-persia.json',ready:true}),
  'ancient-greece':Object.freeze({id:'ancient-greece',name:'Ежелгі Грекия өркениеті',period:'ancient',periodLabel:'Ежелгі заман',file:'./data/topics/ancient-greece.json',ready:true}),
  'byzantine-empire':Object.freeze({id:'byzantine-empire',name:'Византия империясы',period:'medieval',periodLabel:'Орта ғасыр',file:'./data/topics/byzantine-empire.json',ready:true}),
  'kievan-rus':Object.freeze({id:'kievan-rus',name:'Киев Русінің құрылуы',period:'medieval',periodLabel:'Орта ғасыр',file:'./data/topics/kievan-rus.json',ready:true}),
  'arab-caliphate':Object.freeze({id:'arab-caliphate',name:'Араб жаулаушылары. Араб халифатының құрылуы мен ыдырауы',period:'medieval',periodLabel:'Орта ғасыр',file:'./data/topics/arab-caliphate.json',ready:true}),
  'origin-of-islam':Object.freeze({id:'origin-of-islam',name:'Ислам дінінің пайда болуы',period:'medieval',periodLabel:'Орта ғасыр',file:'./data/topics/origin-of-islam.json',ready:true}),
  'islamic-golden-age':Object.freeze({id:'islamic-golden-age',name:'Араб халифаты және мұсылман әлемі мәдениетінің дамуы',period:'medieval',periodLabel:'Орта ғасыр',file:'./data/topics/islamic-golden-age.json',ready:true}),
  'crusades-causes-course-results':Object.freeze({id:'crusades-causes-course-results',name:'Крест жорықтарының себептері, барысы мен салдары',period:'medieval',periodLabel:'Орта ғасыр',file:'./data/topics/crusades-causes-course-results.json',ready:true}),
  'post-crusades-world':Object.freeze({id:'post-crusades-world',name:'Крест жорықтарынан кейінгі христиандық Еуропа мен мұсылман әлемі',period:'medieval',periodLabel:'Орта ғасыр',file:'./data/topics/post-crusades-world.json',ready:true})
});
window.JUZDEREK_TOPIC_ALIASES=Object.freeze(Object.fromEntries(Object.values(window.JUZDEREK_TOPIC_INDEX).map(t=>[t.name,t.id])));
(()=>{if(document.querySelector('script[data-juz-chapters]'))return;const s=document.createElement('script');s.src='./chapter-navigation.js?v=20260820-chapters-v1';s.dataset.juzChapters='1';document.head.appendChild(s)})();
