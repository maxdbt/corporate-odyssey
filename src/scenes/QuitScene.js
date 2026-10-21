import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';

const style = (size, color = '#000000') => ({ fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color });

const W = 380;
const H = 150;

// ESC during a level: 8-bit "are you sure?" dialog. Yes = back to the main menu, No = resume.
export default class QuitScene extends Phaser.Scene {
  constructor() {
    super('QuitScene');
  }

  init() {
    this.leaving = false;
  }

  create() {
    setupStaticCamera(this);
    audio.sfx('select');
    this.readyAt = this.time.now + 250;
    const cx = GAME_WIDTH / 2;
    const left = cx - W / 2;
    const top = GAME_HEIGHT / 2 - H / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0).setInteractive();
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.5).fillRect(left + 6, top + 6, W, H);
    g.fillStyle(0xd4d0c8, 1).fillRect(left, top, W, H);
    g.lineStyle(2, 0xffffff).lineBetween(left, top, left + W, top).lineBetween(left, top, left, top + H);
    g.lineStyle(2, 0x404040).lineBetween(left + W, top, left + W, top + H).lineBetween(left, top + H, left + W, top + H);
    g.fillStyle(0x000080, 1).fillRect(left + 3, top + 3, W - 6, 20);
    this.add.text(left + 10, top + 13, 'Corporate Odyssey', style(10, '#ffffff')).setOrigin(0, 0.5);

    // Warning icon
    g.fillStyle(0xffd800, 1).fillTriangle(left + 40, top + 40, left + 20, top + 78, left + 60, top + 78);
    g.lineStyle(2, 0x000000).strokeTriangle(left + 40, top + 40, left + 20, top + 78, left + 60, top + 78);
    this.add.text(left + 40, top + 64, '!', style(18)).setOrigin(0.5);

    this.add.text(left + 76, top + 40, 'VUOI DAVVERO USCIRE?', style(13));
    this.add.text(left + 76, top + 60, 'Torni al menu principale.\nI progressi del livello andranno persi.', { ...style(9, '#303030'), lineSpacing: 3 });

    this.button(cx - 70, top + H - 26, 'SI (S)', () => this.quit());
    this.button(cx + 70, top + H - 26, 'NO (N)', () => this.cancel());

    const kb = this.input.keyboard;
    if (kb) {
      ['S', 'Y', 'ENTER'].forEach((k) => kb.on(`keydown-${k}`, () => this.quit()));
      ['N', 'ESC'].forEach((k) => kb.on(`keydown-${k}`, () => this.cancel()));
    }
  }

  button(x, y, label, cb) {
    const r = this.add.rectangle(x, y, 100, 24, 0xd4d0c8).setStrokeStyle(2, 0x000000)
      .setInteractive({ useHandCursor: true }).on('pointerdown', cb);
    r.on('pointerover', () => r.setFillStyle(0xe8e4dc)).on('pointerout', () => r.setFillStyle(0xd4d0c8));
    this.add.text(x, y, label, style(11)).setOrigin(0.5);
  }

  ready() { return this.time.now >= this.readyAt && !this.leaving; }

  quit() {
    if (!this.ready()) return;
    this.leaving = true;
    audio.stopMusic();
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }

  cancel() {
    if (!this.ready()) return;
    this.leaving = true;
    audio.sfx('select');
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}
