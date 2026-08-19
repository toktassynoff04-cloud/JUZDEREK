(() => {
  const registry=window.JUZDEREK_TOPICS||{};
  const sets={
    'ancient-persia':[
      ['p1','p2','p3','p4'],
      ['p3','p4','p5','p6'],
      ['p5','p6','p7','p8'],
      ['p1','p4','p7','p8'],
      ['p1','p3','p6','p8']
    ],
    'ancient-greece':[
      ['g1','g2','g3','g4'],
      ['g5','g6','g7','g8','g9'],
      ['g10','g11','g12'],
      ['g12','g13','g14','g15'],
      ['g16','g17','g18','g19','g20']
    ]
  };
  Object.entries(sets).forEach(([topicId,chronologySets])=>{
    if(registry[topicId])registry[topicId].chronologySets=chronologySets;
  });
})();
