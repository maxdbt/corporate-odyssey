import { IS_TOUCH } from '../config/constants.js';

// Fullscreen + landscape lock for phones and tablets. Browsers only allow both from a user gesture, so the first tap
// anywhere asks for them; menu and pause offer a toggle. iPhone Safari has no fullscreen API: there the way is
// "Condividi -> Aggiungi a Home" (the installed app opens without browser bars).
const root = document.documentElement;
const request = root.requestFullscreen || root.webkitRequestFullscreen;
const exit = document.exitFullscreen || document.webkitExitFullscreen;

export const screenInfo = {
  canFullscreen: !!request,
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  standalone: window.matchMedia?.('(display-mode: standalone), (display-mode: fullscreen)').matches || navigator.standalone === true
};

export const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

function lockLandscape() {
  screen.orientation?.lock?.('landscape').catch(() => {});
}

export function enterFullscreen() {
  if (!request || isFullscreen()) return;
  try {
    const p = request.call(root, { navigationUI: 'hide' });
    if (p?.then) p.then(lockLandscape, () => {});
    else lockLandscape();
  } catch { /* not allowed outside a gesture: ignore */ }
}

export function toggleFullscreen() {
  if (isFullscreen()) exit?.call(document);
  else enterFullscreen();
}

// First tap on a touch device: go fullscreen (no-op when installed as an app or unsupported).
if (IS_TOUCH && request && !screenInfo.standalone) {
  document.addEventListener('pointerup', enterFullscreen, { once: true, capture: true });
}
