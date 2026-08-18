(() => {
  const mascotSrc = './assets/mascot-main.webp';
  document.querySelectorAll('.mascot').forEach(img => {
    img.src = mascotSrc;
    img.decoding = 'async';
  });

  const hero = document.getElementById('periodHero');
  const title = document.getElementById('heroTitle');
  if (!hero || !title) return;

  function syncReferenceHero(){
    const ancient = title.textContent.trim() === 'Ежелгі заман';
    hero.classList.toggle('reference-ancient', ancient);
  }

  syncReferenceHero();
  new MutationObserver(syncReferenceHero).observe(title, {childList:true, characterData:true, subtree:true});
})();
