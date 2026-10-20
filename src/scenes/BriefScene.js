import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT, LEVEL_META } from '../config/constants.js';
import { BRIEFS } from '../data/briefs.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';

const style = (size, color = '#000000', extra = {}) => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, ...extra
});

const W = 560;
const H = 250;

// Level briefing as an 8-bit "internal memo". GameScene is paused while this runs.
export default class BriefScene extends Phaser.Scene {
  constructor() {
    super('BriefScene');
  }

  init(data) {
    this.levelIndex = data?.levelIndex ?? 0;
    this.closing = false;
  }

  create() {
    setupStaticCamera(this);
    audio.sfx('select');
    this.readyAt = this.time.now + 300;
    const meta = LEVEL_META[this.levelIndex] || LEVEL_META[0];
    const brief = BRIEFS[meta.id] || { where: '', goal: '', tips: [] };
    const cx = GAME_WIDTH / 2;
    const left = cx - W / 2;
    const top = GAME_HEIGHT / 2 - H / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0).setInteractive()
      .on('pointerdown', () => this.close());

    // Paper sheet with drop shadow, folded corner and a red pin
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.5).fillRect(left + 6, top + 6, W, H);
    g.fillStyle(0xf4efdc, 1).fillRect(left, top, W, H);
    g.fillStyle(0xd8d0b4, 1).fillRect(left + W - 18, top + H - 18, 18, 18);
    g.fillStyle(0x2a2a78, 1).fillRect(left, top, W, 24);
    g.fillStyle(0xc0392b, 1).fillRect(cx - 4, top - 6, 8, 8);
    g.fillStyle(0x7a1f16, 1).fillRect(cx - 1, top + 2, 2, 4);
    // Ruled lines
    g.fillStyle(0xc9d6e8, 1);
    for (let y = top + 60; y < top + H - 30; y += 16) g.fillRect(left + 14, y, W - 28, 1);

    this.add.text(left + 10, top + 12, `COMUNICAZIONE INTERNA  -  LIVELLO ${meta.id}`,
      style(10, '#ffd800')).setOrigin(0, 0.5);
    this.add.text(left + W - 10, top + 12, 'RISERVATO', style(9, '#ff8080')).setOrigin(1, 0.5);

    this.add.text(cx, top + 34, meta.name.toUpperCase(), style(16, '#2a2a78')).setOrigin(0.5, 0);

    let y = top + 64;
    const block = (label, text, color) => {
      this.add.text(left + 18, y, label, style(10, color));
      const t = this.add.text(left + 110, y, text, style(10, '#202020', { wordWrap: { width: W - 130 }, lineSpacing: 4 }));
      y += Math.max(18, t.height + 6);
    };
    block('DOVE SEI:', brief.where, '#2a2a78');
    block('OBIETTIVO:', brief.goal, '#b03020');
    y += 2;
    this.add.text(left + 18, y, 'ATTENZIONE A:', style(10, '#2a6a2a'));
    y += 16;
    brief.tips.forEach((tip) => {
      const t = this.add.text(left + 30, y, `- ${tip}`, style(9, '#303030', { wordWrap: { width: W - 60 } }));
      y += t.height + 4;
    });

    // Signature + continue hint
    this.add.text(left + W - 24, top + H - 34, 'firmato: Ufficio Risorse Umane', style(8, '#606060')).setOrigin(1, 0);
    const hint = this.add.text(cx, top + H + 16, 'INVIO / SPAZIO / TOCCA per iniziare   -   I per rileggere il brief',
      style(9, '#ffffff', { stroke: '#000000', strokeThickness: 3 })).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.35, duration: 500, yoyo: true, repeat: -1 });

    const kb = this.input.keyboard;
    if (kb) {
      ['ENTER', 'SPACE', 'I', 'ESC', 'Z'].forEach((k) => kb.on(`keydown-${k}`, () => this.close()));
    }
  }

  close() {
    if (this.time.now < this.readyAt || this.closing) return;
    this.closing = true;
    audio.sfx('select');
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}
