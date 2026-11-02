(() => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const ua = navigator.userAgent || '';
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isMobile = isIOS || isAndroid || window.matchMedia('(max-width: 820px) and (pointer: coarse)').matches;
  let deferredPrompt = null;
  const VERSION_KEY = 'juzderek_seen_version_v1';

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

  // One version check per page load; no focus, visibility or interval polling.
  async function checkVersionOnEntry() {
    try {
      const response = await fetch('./version.json', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const current = String(data.version || '').trim();
      if (!current) return;
      const previous = localStorage.getItem(VERSION_KEY);
      if (!previous) {
        localStorage.setItem(VERSION_KEY, current);
        return;
      }
      if (previous === current) return;
      if (document.getElementById('juzUpdateNotice')) return;
      const notice = document.createElement('aside');
      notice.id = 'juzUpdateNotice';
      notice.setAttribute('role', 'status');
      notice.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483000;max-width:340px;padding:20px;border-radius:18px;background:#fff;color:#222;box-shadow:0 12px 45px #0002;font:15px/1.5 system-ui,sans-serif';
      notice.innerHTML = '<strong style="font-size:18px">✨ JUZDEREK жаңартылды!</strong><p style="margin:9px 0 15px">Жаңа контент пен өзгерістер қолжетімді. Өзгерістерді көру үшін бетті жаңарт.</p><div style="display:flex;gap:8px"><button type="button" data-update-now style="border:0;border-radius:10px;background:#f07436;color:white;padding:10px 14px;cursor:pointer;font-weight:700">Жаңарту</button><button type="button" data-update-later style="border:1px solid #ddd;border-radius:10px;background:white;padding:10px 14px;cursor:pointer">Кейінірек</button></div>';
      document.body.appendChild(notice);
      notice.querySelector('[data-update-now]').addEventListener('click', () => {
        localStorage.setItem(VERSION_KEY, current);
        location.reload();
      });
      notice.querySelector('[data-update-later]').addEventListener('click', () => notice.remove());
    } catch (error) {
      console.warn('[JUZDEREK] Version check unavailable:', error);
    }
  }

  window.addEventListener('load', () => {
    checkVersionOnEntry();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
        .catch(error => console.warn('[JUZDEREK PWA] Service worker registration failed:', error));
    }
    if (isMobile) mountInstallCard();
  });
})();
