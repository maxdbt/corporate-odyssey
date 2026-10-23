import { DEPTH } from '../config/constants.js';
import { ensurePartyTextures } from '../gfx/party.js';
import { audio } from './Audio8bit.js';

const label = (size, color) => ({
  fontFamily: 'monospace', fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000', strokeThickness: 3, align: 'center'
});

// 1-1 "SALA FESTE" door with an elf bouncer: press UP next to it to enter the dance contest (PartyScene).
// Works once per attempt at the level: afterwards the door is closed.
export default class PartyDoor {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.used = false;
    this.prevUp = true;
    this.nextTalk = 0;
    ensurePartyTextures(scene);
    scene.add.image(x, y, 'party_door').setOrigin(0.5, 1).setDepth(DEPTH.DECOR);
    this.sign = scene.add.text(x, y - 116, 'SALA FESTE', label(12, '#ff5ab4')).setOrigin(0.5).setDepth(DEPTH.DECOR);
    this.blink = scene.tweens.add({ targets: this.sign, alpha: 0.35, duration: 380, yoyo: true, repeat: -1 });
    scene.add.image(x + 50, y, 'elf_bouncer').setOrigin(0.5, 1).setScale(1.2).setDepth(DEPTH.DECOR + 1);
    this.notes = scene.add.particles(0, 0, 'music_note', {
      x: { min: x - 24, max: x + 24 }, y: y - 4, speedY: { min: -50, max: -25 }, speedX: { min: -20, max: 20 },
      lifespan: 1600, frequency: 420, scale: { start: 0.9, end: 0.5 }, alpha: { start: 1, end: 0 },
      tint: [0xff5ab4, 0x3cf0a0, 0x5ab4ff, 0xffd23f]
    }).setDepth(DEPTH.DECOR + 1);
    this.prompt = scene.add.text(x, y - 136, 'SU per entrare', label(9, '#ffffff')).setOrigin(0.5).setDepth(DEPTH.FX).setVisible(false);
  }

  say(text) {
    const s = this.scene;
    const t = s.add.text(this.x + 50, s.player.y - 70, text, label(9, '#3cf0a0')).setOrigin(0.5).setDepth(DEPTH.FX);
    s.tweens.add({ targets: t, y: t.y - 16, alpha: 0, delay: 700, duration: 500, onComplete: () => t.destroy() });
  }

  close() {
    this.blink.stop();
    this.sign.setText('FESTA FINITA').setColor('#9a9a9a').setAlpha(1);
    this.notes.stop();
    this.scene.add.image(this.x, this.sign.y + 70, 'party_closed').setAngle(-8).setDepth(DEPTH.DECOR + 1);
  }

  update(input) {
    const s = this.scene;
    const p = s.player;
    const near = Math.abs(p.x - this.x) < 40 && (p.body.blocked.down || p.body.touching.down);
    const upPressed = input.up && !this.prevUp;
    this.prevUp = input.up;
    this.prompt.setVisible(near && !this.used);
    if (!near || !upPressed) return;
    if (this.used) {
      if (s.time.now > this.nextTalk) { this.nextTalk = s.time.now + 1500; this.say('SEI GIA\' ENTRATO!'); }
      return;
    }
    this.used = true;
    this.prompt.setVisible(false);
    this.say('LISTA? OK, ENTRA!');
    audio.sfx('powerup');
    s.time.delayedCall(600, () => {
      s.openOverlay('PartyScene');
      this.close();
    });
  }
}

