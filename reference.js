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
  if (hero && title) {
    function syncReferenceHero(){
      const ancient = title.textContent.trim() === 'Ежелгі заман';
      hero.classList.toggle('reference-ancient', ancient);
    }
    syncReferenceHero();
    new MutationObserver(syncReferenceHero).observe(title, {childList:true, characterData:true, subtree:true});
  }

  // Period page used to contain an older embedded game UI. Route all game actions
  // to the dedicated games page so the student always sees the current design.
  const modeMap = {cards:'cards', date:'quiz', person:'person', chrono:'chrono'};
  document.addEventListener('click', e => {
    const gameBtn = e.target.closest('#games .game-tab');
    if (gameBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      location.href = `games.html?mode=${modeMap[gameBtn.dataset.game] || 'cards'}&v=20260819-0050`;
      return;
    }

    const gameNav = e.target.closest('.site-nav-link');
    if (gameNav && gameNav.textContent.trim().includes('Ойындар')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      location.href = 'games.html?mode=cards&v=20260819-0050';
      return;
    }
  }, true);
})();
