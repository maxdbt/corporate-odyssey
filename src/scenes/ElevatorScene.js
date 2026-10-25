import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT, playerTex } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { LEVELS } from '../levels/index.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { goNext, nextIndex } from '../systems/Trip.js';

const style = (size, color = '#ffffff', extra = {}) => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 4, ...extra
});

// Floor number of each Mondo 5 level (the display counts up between them).
const FLOORS = { '5-1': 40, '5-2': 45, '5-3': 49, '5-4': 50, '5-5': 51 };
// What you glimpse on the way up (one random line per ride).
const GAGS = [
  'Piano 46: Ufficio Bonus (accesso negato)',
  'Piano 47: Sala Relax (mai usata)',
  'Piano 48: Archivio Promesse Non Mantenute',
  'Piano 43: Ufficio Sinergie',
  'Piano 44: Palestra Executive'
];

// Mondo 5: elevator ride between two floors. Doors close, muzak, the floor counter climbs, DING, doors open.
export default class ElevatorScene extends Phaser.Scene {
  constructor() {
    super('ElevatorScene');
  }

  init(data) {
    this.levelIndex = data?.levelIndex ?? 0;
    this.done = false;
  }

  create() {
    setupStaticCamera(this);
    const from = FLOORS[LEVELS[this.levelIndex]?.id] ?? 40;
    const next = LEVELS[nextIndex(this.levelIndex)];
    const to = FLOORS[next?.id] ?? from + 1;
    const cx = GAME_WIDTH / 2;

    // Cabin: gold walls, mirror panels, carpet.
    const g = this.add.graphics();
    g.fillStyle(0x9c7a12).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0xc9a227).fillRect(60, 30, GAME_WIDTH - 120, 360);
    for (let x = 90; x < GAME_WIDTH - 90; x += 160) {
      g.fillStyle(0x6b4a12).fillRect(x, 120, 140, 230);
      g.fillStyle(0xb8c8d8).fillRect(x + 6, 126, 128, 218);
      g.fillStyle(0xffffff, 0.35).fillRect(x + 16, 136, 30, 80);
    }
    g.fillStyle(0x8a0a14).fillRect(0, 380, GAME_WIDTH, GAME_HEIGHT - 380);
    g.fillStyle(0xe8c547).fillRect(60, 376, GAME_WIDTH - 120, 6);
    // Floor display.
    g.fillStyle(0x111111).fillRect(cx - 70, 44, 140, 56);
    g.lineStyle(3, 0xe8c547).strokeRect(cx - 70, 44, 140, 56);
    this.arrow = this.add.text(cx - 46, 72, '▲', style(20, '#ff8020', { strokeThickness: 0 })).setOrigin(0.5);
    this.counter = this.add.text(cx + 14, 72, String(from), style(30, '#ff8020', { strokeThickness: 0 })).setOrigin(0.5);
    this.tweens.add({ targets: this.arrow, alpha: 0.3, duration: 300, yoyo: true, repeat: -1 });

    const spr = this.add.image(cx, 380, playerTex(GameState.character, 'idle')).setOrigin(0.5, 1).setScale(3);
    this.tweens.add({ targets: spr, y: 377, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    this.add.text(cx, 118, `PROSSIMO PIANO: ${(next?.name || '').toUpperCase()}`, style(14, '#ffffff')).setOrigin(0.5);
    const gag = this.add.text(cx, 412, Phaser.Utils.Array.GetRandom(GAGS), style(11, '#ffe680')).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: gag, alpha: 1, delay: 900, duration: 400 });
    this.add.text(cx, 436, 'INVIO o TOCCA per saltare', style(9, '#cccccc', { strokeThickness: 3 })).setOrigin(0.5);

    // Doors: they open at the start and close, then reopen on arrival.
    this.doorL = this.add.rectangle(0, 0, cx, GAME_HEIGHT, 0xb8bcc8).setOrigin(0).setStrokeStyle(3, 0x5a5a66);
    this.doorR = this.add.rectangle(GAME_WIDTH, 0, cx, GAME_HEIGHT, 0xb8bcc8).setOrigin(1, 0).setStrokeStyle(3, 0x5a5a66);
    this.doorL.x = -cx;
    this.doorR.x = GAME_WIDTH + cx;
    this.tweens.add({ targets: this.doorL, x: 0, duration: 500, delay: 200, ease: 'Quad.InOut' });
    this.tweens.add({ targets: this.doorR, x: GAME_WIDTH, duration: 500, delay: 200, ease: 'Quad.InOut',
      onComplete: () => this.ride(from, to) });

    const skip = () => this.arrive();
    this.input.on('pointerdown', skip);
    this.input.keyboard?.on('keydown-ENTER', skip);
    this.input.keyboard?.on('keydown-SPACE', skip);
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  // Doors closed: reopen on the cabin interior and climb.
  ride(from, to) {
    if (this.done) return;
    audio.music('elevator');
    const cx = GAME_WIDTH / 2;
    this.tweens.add({ targets: this.doorL, x: -cx, duration: 500, ease: 'Quad.InOut' });
    this.tweens.add({ targets: this.doorR, x: GAME_WIDTH + cx, duration: 500, ease: 'Quad.InOut' });
    this.cameras.main.shake(3200, 0.0015);
    const steps = Math.max(1, to - from);
    this.tweens.addCounter({
      from, to, duration: 3000, delay: 300,
      onUpdate: (tw) => this.counter.setText(String(Math.floor(tw.getValue()))),
      onComplete: () => this.time.delayedCall(Math.min(400, 100 * steps), () => this.arrive())
    });
  }

  arrive() {
    if (this.done) return;
    this.done = true;
    audio.stopMusic();
    audio.note('E6', 0.25, 'triangle', 0.6);
    this.time.delayedCall(260, () => audio.note('C6', 0.5, 'triangle', 0.6));
    this.arrow.setText('●');
    this.time.delayedCall(700, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => goNext(this, this.levelIndex));
    });
  }
}
