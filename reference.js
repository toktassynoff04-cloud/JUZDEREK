(() => {
  const primaryMascot = './assets/mascot-main.webp?v=2';
  const fallbackMascot = './mascot.svg';

  document.querySelectorAll('.mascot').forEach(img => {
    img.decoding = 'async';
    img.loading = 'eager';
    img.onerror = () => {
      if (!img.src.endsWith('/mascot.svg')) img.src = fallbackMascot;
    };
    img.src = primaryMascot;
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
