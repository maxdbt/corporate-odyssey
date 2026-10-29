import { DEPTH } from '../config/constants.js';
import { ensurePartyTextures } from '../gfx/party.js';
import { audio } from './Audio8bit.js';

const label = (size, color) => ({
  fontFamily: 'monospace', fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000', strokeThickness: 3, align: 'center'
});

// 1-1 "SALA FESTE" door with an elf bouncer: walking past it stops the player for a short chat with the bouncer,
// then the dance contest (PartyScene) starts on its own. Works once per attempt at the level: afterwards the door
// is closed.
const DIALOGUE = [
  ['elf', 'ALT! DOVE VAI?'],
  ['player', 'EHM... ALLA FESTA?'],
  ['elf', 'SEI IN LISTA? ...OK, ENTRA. E BALLA!']
];
const LINE_MS = 1100;

export default class PartyDoor {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.used = false;
    ensurePartyTextures(scene);
    scene.add.image(x, y, 'party_door').setOrigin(0.5, 1).setDepth(DEPTH.DECOR);
    this.sign = scene.add.text(x, y - 116, 'SALA FESTE', label(12, '#ff5ab4')).setOrigin(0.5).setDepth(DEPTH.DECOR);
    this.blink = scene.tweens.add({ targets: this.sign, alpha: 0.35, duration: 380, yoyo: true, repeat: -1 });
    this.elf = scene.add.image(x + 50, y, 'elf_bouncer').setOrigin(0.5, 1).setScale(1.2).setDepth(DEPTH.DECOR + 1);
    this.notes = scene.add.particles(0, 0, 'music_note', {
      x: { min: x - 24, max: x + 24 }, y: y - 4, speedY: { min: -50, max: -25 }, speedX: { min: -20, max: 20 },
      lifespan: 1600, frequency: 420, scale: { start: 0.9, end: 0.5 }, alpha: { start: 1, end: 0 },
      tint: [0xff5ab4, 0x3cf0a0, 0x5ab4ff, 0xffd23f]
    }).setDepth(DEPTH.DECOR + 1);
  }

  // Speech bubble over the elf or the player for one line of the chat.
  bubble(who, text) {
    const s = this.scene;
    const p = s.player;
    const x = who === 'elf' ? this.elf.x : p.x;
    const top = who === 'elf' ? this.elf.y - this.elf.displayHeight : p.y - p.displayHeight;
    const t = s.add.text(x, top - 14, text, label(9, who === 'elf' ? '#3cf0a0' : '#ffffff'))
      .setOrigin(0.5, 1).setDepth(DEPTH.FX + 1).setBackgroundColor('#000000c0').setPadding(5, 3);
    s.time.delayedCall(LINE_MS - 80, () => t.destroy());
  }

  close() {
    this.blink.stop();
    this.sign.setText('FESTA FINITA').setColor('#9a9a9a').setAlpha(1);
    this.notes.stop();
    this.scene.add.image(this.x, this.sign.y + 70, 'party_closed').setAngle(-8).setDepth(DEPTH.DECOR + 1);
  }

  update() {
    const s = this.scene;
    const p = s.player;
    // Also when jumping past it (not from the platforms above).
    if (this.used || Math.abs(p.x - this.x) > 30 || p.y < this.y - 130) return;
    this.used = true;
    const total = DIALOGUE.length * LINE_MS;
    s.inputLockUntil = s.time.now + total + 100;
    p.body.setVelocityX(0);
    p.facing = 1;
    audio.sfx('select');
    DIALOGUE.forEach(([who, text], i) => s.time.delayedCall(i * LINE_MS, () => this.bubble(who, text)));
    s.time.delayedCall(total, () => {
      audio.sfx('powerup');
      s.openOverlay('PartyScene');
      this.close();
    });
  }
}
