(() => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const ua = navigator.userAgent || '';
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isMobile = isIOS || isAndroid || window.matchMedia('(max-width: 820px) and (pointer: coarse)').matches;
  let deferredPrompt = null;
  let refreshing = false;

  const mountInstallCard = () => {
    if (isStandalone || document.getElementById('juzPwaInstall')) return;

    const card = document.createElement('aside');
    card.id = 'juzPwaInstall';
    card.className = 'pwa-install-card';
    card.innerHTML = `
      <div class="pwa-install-row">
        <div class="pwa-install-icon"><img src="./assets/apple-touch-icon.png?v=20260903-01" alt=""></div>
        <div class="pwa-install-copy">
          <strong>JUZDEREK-ті телефонға орнат</strong>
          <span>Қолданба сияқты жеке терезеде ашылады.</span>
        </div>
      </div>
      <div class="pwa-install-actions">
        <button class="pwa-install-btn ghost" type="button" data-pwa-later>Кейін</button>
        <button class="pwa-install-btn primary" type="button" data-pwa-install>Орнату</button>
      </div>
      <div class="pwa-ios-help" data-pwa-help></div>`;
    document.body.appendChild(card);

    const installBtn = card.querySelector('[data-pwa-install]');
    const laterBtn = card.querySelector('[data-pwa-later]');
    const help = card.querySelector('[data-pwa-help]');

    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        card.classList.remove('show');
        return;
      }

      help.innerHTML = isIOS
        ? 'iPhone: <b>Safari</b>-де төмендегі <b>Бөлісу</b> батырмасын бас → <b>«На экран Домой»</b> → <b>Добавить</b>.'
        : 'Android: браузер мәзірін <b>⋮</b> аш → <b>Install app / Установить приложение</b> немесе <b>Add to Home screen</b> таңда.';
      help.classList.add('show');
      installBtn.textContent = 'Түсінікті';
      installBtn.addEventListener('click', () => card.classList.remove('show'), { once: true });
    });

    laterBtn.addEventListener('click', () => {
      sessionStorage.setItem('juzderek_pwa_install_dismissed', '1');
      card.classList.remove('show');
    });

    setTimeout(() => {
      if (!sessionStorage.getItem('juzderek_pwa_install_dismissed') && (isMobile || deferredPrompt)) {
        card.classList.add('show');
      }
    }, 900);
  };

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    mountInstallCard();
    const card = document.getElementById('juzPwaInstall');
    if (card && !sessionStorage.getItem('juzderek_pwa_install_dismissed')) card.classList.add('show');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    document.getElementById('juzPwaInstall')?.remove();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
        .then(registration => {
          registration.update();
          window.addEventListener('focus', () => registration.update());
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') registration.update();
          });
        })
        .catch(error => console.warn('[JUZDEREK PWA] Service worker registration failed:', error));

      if (isMobile) mountInstallCard();
    });
  } else if (isMobile) {
    window.addEventListener('load', mountInstallCard);
  }
})();
