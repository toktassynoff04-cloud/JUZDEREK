(() => {
  const primaryMascot = './assets/image-Photoroom%20-%202026-08-18T221923.934.png?v=3';

  document.querySelectorAll('.mascot').forEach(img => {
    img.decoding = 'async';
    img.loading = 'eager';
    img.onerror = null;
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
