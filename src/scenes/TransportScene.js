import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEX } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { TRANSPORT, TRIP_FUND } from '../data/trip.js';
import { ensureTrip, setTransport, goNext } from '../systems/Trip.js';
import { tstyle } from '../ui/TripUI.js';

const CARDS = [
  {
    kind: 'train',
    lines: ['Biglietto economico: resta piu\'', 'budget da spendere in trasferta.', '', 'IMPREVISTI:', 'borseggiatori, Wi-Fi che cade,', 'vicino che urla al telefono.']
  },
  {
    kind: 'plane',
    lines: ['Biglietto caro: resta meno budget,', `ma arrivi prima (+${TRANSPORT.plane.timeBonus}s a terra).`, '', 'IMPREVISTI:', 'duty free, cane antidroga,', 'turbolenza, vicino chiacchierone.']
  }
];

// Trip stage 2: train (cheap ticket, more budget left) or plane (dear ticket, more time on the ground leg).
export default class TransportScene extends Phaser.Scene {
  constructor() {
    super('TransportScene');
  }

  init(data) {
    this.levelIndex = data?.levelIndex ?? 0;
    this.sel = 0;
    this.done = false;
  }

  create() {
    setupStaticCamera(this);
    GameState.beginLevel(this.levelIndex);
    ensureTrip(this.levelIndex);
    const g = this.add.graphics();
    [0x1a2a5a, 0x22346a, 0x2a3e7a, 0x324888].forEach((c, i) => g.fillStyle(c).fillRect(0, i * 112, GAME_WIDTH, 113));

    this.add.text(GAME_WIDTH / 2, 30, 'COME CI VAI?', tstyle(22, '#ffd800', { strokeThickness: 5 })).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 58, `L'amministrazione ti da' ${TRIP_FUND} € per tutta la trasferta: il biglietto si paga da qui.`, tstyle(10)).setOrigin(0.5);

    this.cards = CARDS.map((c, i) => {
      const x = GAME_WIDTH / 2 + (i === 0 ? -180 : 180);
      const y = 240;
      const frame = this.add.rectangle(x, y, 320, 300, 0x10204a, 0.92).setStrokeStyle(3, 0x4060a0).setInteractive({ useHandCursor: true });
      frame.on('pointerdown', () => { if (this.sel === i) this.choose(); else { this.sel = i; this.refresh(); audio.sfx('select'); } });
      frame.on('pointerover', () => { this.sel = i; this.refresh(); });
      this.add.text(x, y - 128, TRANSPORT[c.kind].label, tstyle(20, '#ffffff')).setOrigin(0.5);
      if (c.kind === 'train') this.add.image(x, y - 50, TEX.TRAIN_DOOR).setScale(1.6);
      else this.drawPlane(x, y - 52);
      this.add.text(x, y - 2, `BIGLIETTO: ${TRANSPORT[c.kind].cost} €`, tstyle(14, c.kind === 'train' ? '#7CFC00' : '#ff9f60')).setOrigin(0.5);
      this.add.text(x, y + 18, `BUDGET CHE TI RESTA: ${TRANSPORT[c.kind].budget} €`, tstyle(10, '#ffd800')).setOrigin(0.5);
      this.add.text(x, y + 36, c.lines.join('\n'), tstyle(9, '#dddddd', { align: 'center', lineSpacing: 3 })).setOrigin(0.5, 0);
      return { frame };
    });
    this.add.text(GAME_WIDTH / 2, 430, 'SINISTRA/DESTRA scegli  -  INVIO conferma  -  oppure TOCCA due volte', tstyle(9, '#cccccc')).setOrigin(0.5);

    this.input.keyboard?.on('keydown', (ev) => {
      if (this.done) return;
      const k = ev.key;
      if (['ArrowLeft', 'a', 'A'].includes(k)) { this.sel = 0; this.refresh(); audio.sfx('select'); }
      else if (['ArrowRight', 'd', 'D'].includes(k)) { this.sel = 1; this.refresh(); audio.sfx('select'); }
      else if (['Enter', ' ', 'z', 'Z'].includes(k)) this.choose();
      else if (k === 'Escape') this.scene.start('MenuScene');
    });
    this.refresh();
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  drawPlane(x, y) {
    const g = this.add.graphics();
    g.fillStyle(0xffffff).fillRect(x - 70, y - 8, 140, 16).fillTriangle(x + 70, y - 8, x + 90, y, x + 70, y + 8);
    g.fillTriangle(x - 10, y, x + 20, y, x - 30, y + 40).fillTriangle(x - 10, y, x + 20, y, x - 30, y - 40);
    g.fillTriangle(x - 70, y - 8, x - 50, y - 8, x - 78, y - 32);
    g.fillStyle(0x2a6ad8).fillRect(x - 60, y - 2, 120, 3);
    g.fillStyle(0x5ab4ff);
    for (let wx = x - 50; wx < x + 60; wx += 14) g.fillRect(wx, y - 6, 6, 4);
  }

  refresh() {
    this.cards.forEach((c, i) => {
      const on = i === this.sel;
      c.frame.setStrokeStyle(3, on ? 0xffd800 : 0x4060a0).setFillStyle(on ? 0x1a3a7a : 0x10204a, 0.92);
    });
  }

  choose() {
    if (this.done) return;
    this.done = true;
    setTransport(CARDS[this.sel].kind);
    audio.sfx('powerup');
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => goNext(this, this.levelIndex));
  }
}
