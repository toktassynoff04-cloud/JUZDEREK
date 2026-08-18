(() => {
  const heroMascot = './assets/image-Photoroom%20-%202026-08-18T223037.285.png?v=4';

  const heroImg = document.querySelector('.hero-mascot');
  if (heroImg) {
    heroImg.decoding = 'async';
    heroImg.loading = 'eager';
    heroImg.onerror = null;
    heroImg.src = heroMascot;
  }

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
