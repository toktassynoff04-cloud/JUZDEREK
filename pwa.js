(() => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let deferredPrompt = null;

  const mountInstallCard = () => {
    if (isStandalone || document.getElementById('juzPwaInstall')) return;
    const card = document.createElement('aside');
    card.id = 'juzPwaInstall';
    card.className = 'pwa-install-card';
    card.innerHTML = `
      <div class="pwa-install-row">
        <div class="pwa-install-icon"><img src="./assets/mascot-progress.webp" alt=""></div>
        <div class="pwa-install-copy">
          <strong>JUZDEREK-ті телефонға орнат</strong>
          <span>Қолданба сияқты жеке терезеде ашылады.</span>
        </div>
      </div>
      <div class="pwa-install-actions">
        <button class="pwa-install-btn ghost" type="button" data-pwa-later>Кейін</button>
        <button class="pwa-install-btn primary" type="button" data-pwa-install>Орнату</button>
      </div>
      <div class="pwa-ios-help" data-pwa-ios-help>
        iPhone: Safari мәзірінен <b>Бөлісу</b> → <b>«На экран Домой»</b> → <b>Добавить</b> таңда.
      </div>`;
    document.body.appendChild(card);

    const installBtn = card.querySelector('[data-pwa-install]');
    const laterBtn = card.querySelector('[data-pwa-later]');
    const iosHelp = card.querySelector('[data-pwa-ios-help]');

    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        card.classList.remove('show');
        return;
      }
      if (isIOS) {
        iosHelp.classList.add('show');
        installBtn.textContent = 'Түсінікті';
        installBtn.onclick = () => card.classList.remove('show');
      }
    });

    laterBtn.addEventListener('click', () => {
      sessionStorage.setItem('juzderek_pwa_install_dismissed', '1');
      card.classList.remove('show');
    });

    setTimeout(() => {
      if (!sessionStorage.getItem('juzderek_pwa_install_dismissed') && (deferredPrompt || isIOS)) {
        card.classList.add('show');
      }
    }, 1200);
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
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
        .then(registration => {
          registration.update();
          registration.addEventListener('updatefound', () => {
            const worker = registration.installing;
            if (!worker) return;
            worker.addEventListener('statechange', () => {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateToast();
              }
            });
          });
        })
        .catch(error => console.warn('[JUZDEREK PWA] Service worker registration failed:', error));

      if (isIOS) mountInstallCard();
    });
  } else if (isIOS) {
    window.addEventListener('load', mountInstallCard);
  }

  function showUpdateToast() {
    if (document.getElementById('juzPwaUpdate')) return;
    const toast = document.createElement('div');
    toast.id = 'juzPwaUpdate';
    toast.className = 'pwa-update-toast';
    toast.innerHTML = '<span>JUZDEREK-тің жаңа нұсқасы дайын.</span><button type="button">Жаңарту</button>';
    toast.querySelector('button').addEventListener('click', () => location.reload());
    document.body.appendChild(toast);
  }
})();
