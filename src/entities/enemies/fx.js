// Small visual helpers shared by enemies, hazards and bosses.
import { ANIM, TEX, DEPTH, FONT, GAME_WIDTH, GAME_HEIGHT } from '../../config/constants.js';
import { pinToView } from '../../utils/view.js';

export function popFx(scene, x, y, scale = 1) {
  if (!scene || !scene.add) return;
  if (scene.anims.exists(ANIM.EXPLOSION) && scene.textures.exists(TEX.FX_EXPLOSION1)) {
    const s = scene.add.sprite(x, y, TEX.FX_EXPLOSION1).setDepth(DEPTH.FX).setScale(scale);
    s.play(ANIM.EXPLOSION);
    s.once('animationcomplete', () => s.destroy());
    scene.time.delayedCall(1500, () => { if (s.active) s.destroy(); });
  } else {
    const c = scene.add.circle(x, y, 10 * scale, 0xffcc00).setDepth(DEPTH.FX);
    scene.tweens.add({ targets: c, scale: 2, alpha: 0, duration: 300, onComplete: () => c.destroy() });
  }
}

export function floatText(scene, x, y, text, color = '#ffffff', size = 10, ms = 900) {
  if (!scene || !scene.add) return null;
  const t = scene.add.text(x, y, text, {
    fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color,
    stroke: '#000000', strokeThickness: 3
  }).setOrigin(0.5, 1).setDepth(DEPTH.FX);
  scene.tweens.add({ targets: t, y: y - 24, alpha: 0, duration: ms, ease: 'Sine.easeIn', onComplete: () => t.destroy() });
  return t;
}

// Big text pinned to the camera (boss shouts, alarms).
export function bigText(scene, text, color = '#ff3030', ms = 1600, yRatio = 0.3) {
  if (!scene || !scene.add) return null;
  const t = scene.add.text(0, 0, text, {
    fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color,
    stroke: '#000000', strokeThickness: 5, align: 'center'
  }).setOrigin(0.5).setDepth(DEPTH.FX + 5);
  pinToView(t, GAME_WIDTH / 2, GAME_HEIGHT * yRatio, 0);
  t.setScale(0.2);
  scene.tweens.add({ targets: t, scale: 1, duration: 200, ease: 'Back.easeOut' });
  scene.tweens.add({ targets: t, alpha: 0, delay: ms, duration: 300, onComplete: () => t.destroy() });
  return t;
}

export function sparks(scene, x, y, color = 0xffaa00, count = 6) {
  if (!scene || !scene.add) return;
  const key = scene.textures.exists(TEX.FX_SPARK) ? TEX.FX_SPARK : null;
  for (let i = 0; i < count; i++) {
    const p = key ? scene.add.image(x, y, key) : scene.add.rectangle(x, y, 3, 3, 0xffffff);
    p.setTint?.(color);
    p.setDepth(DEPTH.FX);
    const a = Math.random() * Math.PI * 2;
    const d = 10 + Math.random() * 20;
    scene.tweens.add({
      targets: p, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0,
      duration: 300 + Math.random() * 200, onComplete: () => p.destroy()
    });
  }
}
