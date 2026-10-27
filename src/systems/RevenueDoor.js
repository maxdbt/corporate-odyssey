import { DEPTH } from '../config/constants.js';
import { ensureExecTextures } from '../gfx/exec.js';
import { audio } from './Audio8bit.js';

const label = (size, color) => ({
  fontFamily: 'monospace', fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000', strokeThickness: 3, align: 'center'
});

// 5-1 Finance backdoor: a service door on a high platform. UP next to it opens "Caccia ai Ricavi" (RevenueScene).
// Works once per attempt at the level, like the 1-1 PartyDoor.
export default class RevenueDoor {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.used = false;
    this.prevUp = true;
    this.nextTalk = 0;
    ensureExecTextures(scene);
    scene.add.image(x, y, 'service_door').setOrigin(0.5, 1).setDepth(DEPTH.DECOR);
    this.sign = scene.add.text(x, y - 96, 'SOLO PERSONALE\nAUTORIZZATO', label(8, '#ffd800')).setOrigin(0.5).setDepth(DEPTH.DECOR);
    this.glow = scene.add.circle(x, y - 58, 9, 0x8a6aff, 0.5).setDepth(DEPTH.DECOR + 1);
    scene.tweens.add({ targets: this.glow, alpha: 0.1, duration: 600, yoyo: true, repeat: -1 });
    this.prompt = scene.add.text(x, y - 118, 'SU per entrare', label(9, '#ffffff')).setOrigin(0.5).setDepth(DEPTH.FX).setVisible(false);
  }

  say(text) {
    const s = this.scene;
    const t = s.add.text(this.x, s.player.y - 70, text, label(9, '#9be7ff')).setOrigin(0.5).setDepth(DEPTH.FX);
    s.tweens.add({ targets: t, y: t.y - 16, alpha: 0, delay: 700, duration: 500, onComplete: () => t.destroy() });
  }

  close() {
    this.glow.destroy();
    this.sign.setText('CHIUSO PER\nTRIMESTRALE').setColor('#9a9a9a');
  }

  update(input) {
    const s = this.scene;
    const p = s.player;
    const near = Math.abs(p.x - this.x) < 34 && Math.abs(p.body.bottom - this.y) < 10 && (p.body.blocked.down || p.body.touching.down);
    const upPressed = input.up && !this.prevUp;
    this.prevUp = input.up;
    this.prompt.setVisible(near && !this.used);
    if (!near || !upPressed) return;
    if (this.used) {
      if (s.time.now > this.nextTalk) { this.nextTalk = s.time.now + 1500; this.say('CHIUSO PER TRIMESTRALE'); }
      return;
    }
    this.used = true;
    this.prompt.setVisible(false);
    this.say('CACCIA AI RICAVI!');
    audio.sfx('powerup');
    s.time.delayedCall(600, () => {
      s.openOverlay('RevenueScene');
      this.close();
    });
  }
}
