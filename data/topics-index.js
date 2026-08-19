window.JUZDEREK_TOPIC_INDEX=Object.freeze({
  'ancient-persia':Object.freeze({id:'ancient-persia',name:'Ежелгі Парсы мемлекеті',period:'ancient',periodLabel:'Ежелгі заман',file:'./data/topics/ancient-persia.json',ready:true}),
  'ancient-greece':Object.freeze({id:'ancient-greece',name:'Ежелгі Грекия өркениеті',period:'ancient',periodLabel:'Ежелгі заман',file:'./data/topics/ancient-greece.json',ready:true})
});
window.JUZDEREK_TOPIC_ALIASES=Object.freeze(Object.fromEntries(Object.values(window.JUZDEREK_TOPIC_INDEX).map(t=>[t.name,t.id])));
(()=>{if(document.querySelector('script[data-juz-chapters]'))return;const s=document.createElement('script');s.src='./chapter-navigation.js?v=20260820-chapters-v1';s.dataset.juzChapters='1';document.head.appendChild(s)})();
