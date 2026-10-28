import { registerSW } from 'virtual:pwa-register';

// Service worker + install. A new version is downloaded in the background and applied only when the player taps
// the banner (an automatic reload would cut a run short). Android/desktop Chrome hand over an install prompt that
// the menu shows as an INSTALLA button; iOS has none (the menu tip explains "Aggiungi a Home").
let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn(!!deferredPrompt));

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  notify();
});
window.addEventListener('appinstalled', () => { deferredPrompt = null; notify(); });

// Calls fn(canInstall) now and on every change; returns the unsubscribe.
export function onInstallChange(fn) {
  listeners.add(fn);
  fn(!!deferredPrompt);
  return () => listeners.delete(fn);
}

export function install() {
  if (!deferredPrompt) return;
  const p = deferredPrompt;
  deferredPrompt = null;
  notify();
  p.prompt();
}

function showUpdateBanner(updateSW) {
  if (document.getElementById('update-banner')) return;
  const bar = document.createElement('div');
  bar.id = 'update-banner';
  const go = document.createElement('button');
  go.textContent = 'NUOVA VERSIONE – AGGIORNA';
  go.addEventListener('click', () => { go.disabled = true; updateSW(true); });
  const close = document.createElement('button');
  close.className = 'close';
  close.textContent = '×';
  close.setAttribute('aria-label', 'Chiudi');
  close.addEventListener('click', () => bar.remove());
  bar.append(go, close);
  document.body.appendChild(bar);
}

// Called once the game is running: the service worker downloads the whole game for offline play, which should
// not compete with the first boot.
export function startPwa() {
  const updateSW = registerSW({ immediate: true, onNeedRefresh: () => showUpdateBanner(updateSW) });
}
