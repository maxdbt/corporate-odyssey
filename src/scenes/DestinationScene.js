import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { tstyle } from '../ui/TripUI.js';

const CARD_X = [GAME_WIDTH / 2 - 250, GAME_WIDTH / 2, GAME_WIDTH / 2 + 250];
const CARD_Y = 232;
const CARD_W = 220;
const CARD_H = 250;
const PIC_W = 190;
const PIC_H = 120;

const SITES = [
  { leg: 'desert', name: 'SEDE SUD', text: 'Progetto "Smart Sand"', draw: 'desertHints' },
  { leg: 'glacier', name: 'SEDE NORD', text: 'Progetto "Digital Mountain"', draw: 'glacierHints' },
  { leg: 'sea', name: 'SEDE MARITTIMA', text: 'Progetto "Blue Sea"', draw: 'seaHints' }
];

// Trip stage 0 "Il Cliente Lontano": pick one of the client's 3 sites. The pictures show the same glass office
// building with small hints only (cactus / snowflake / bubbles): the extreme location is revealed later.
// The choice becomes GameState.trip.leg (set by PackingScene) and decides the ground leg after the journey.
export default class DestinationScene extends Phaser.Scene {
  constructor() {
    super('DestinationScene');
  }

  init(data) {
    this.levelIndex = data?.levelIndex ?? 0;
    this.sel = 1;
    this.done = false;
  }

  create() {
    setupStaticCamera(this);
    audio.music('menu');
    const g = this.add.graphics();
    g.fillStyle(0x10204a).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    for (let y = 0; y < GAME_HEIGHT; y += 24) g.fillStyle(0x142a5a).fillRect(0, y, GAME_WIDTH, 2);
    this.add.text(GAME_WIDTH / 2, 30, 'LA TRASFERTA  -  IL CLIENTE LONTANO', tstyle(18, '#ffd800', { strokeThickness: 5 })).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 62, 'Devi andare dal cliente: scegli una delle sue 3 sedi.', tstyle(11, '#ffffff')).setOrigin(0.5);
    this.cards = SITES.map((s, i) => this.card(s, i));
    this.add.text(GAME_WIDTH / 2, 432, 'SINISTRA/DESTRA scegli, INVIO conferma  -  oppure CLICCA una sede', tstyle(9, '#cccccc')).setOrigin(0.5);
    this.paint();
    this.readyAt = this.time.now + 400;
    this.input.keyboard?.on('keydown', (ev) => {
      const k = ev.key;
      if (['ArrowLeft', 'a', 'A'].includes(k)) this.move(-1);
      else if (['ArrowRight', 'd', 'D'].includes(k)) this.move(1);
      else if (['Enter', ' ', 'z', 'Z'].includes(k)) this.choose(this.sel);
      else if (k >= '1' && k <= '3') this.choose(Number(k) - 1);
    });
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  card(site, i) {
    const x = CARD_X[i];
    const top = CARD_Y - CARD_H / 2;
    const frame = this.add.rectangle(x, CARD_Y, CARD_W, CARD_H, 0xfff4dc).setStrokeStyle(4, 0x6a4a2a)
      .setInteractive({ useHandCursor: true });
    frame.on('pointerover', () => { if (!this.done) { this.sel = i; this.paint(); } });
    frame.on('pointerdown', () => this.choose(i));
    const g = this.add.graphics();
    this.office(g, x - PIC_W / 2, top + 14);
    this[site.draw](g, x - PIC_W / 2, top + 14);
    g.lineStyle(3, 0x3a2a1a).strokeRect(x - PIC_W / 2, top + 14, PIC_W, PIC_H);
    this.add.text(x, top + PIC_H + 30, `${i + 1}. ${site.name}`, tstyle(13, '#ffd800')).setOrigin(0.5);
    this.add.text(x, top + PIC_H + 56, site.text, tstyle(11, '#3a2a1a', { strokeThickness: 0, align: 'center' })).setOrigin(0.5, 0);
    return { frame };
  }

  // ---------------------------------------------------------------- pictures (x, y = top-left of a PIC_W x PIC_H frame)

  // The same modern glass office for every site: sky, pavement, tower with windows, entrance.
  office(g, x, y) {
    g.fillStyle(0x9ad4f0).fillRect(x, y, PIC_W, PIC_H);
    g.fillStyle(0xc8c8c0).fillRect(x, y + 100, PIC_W, PIC_H - 100);
    g.fillStyle(0x4a5a6a).fillRect(x + 55, y + 14, 80, 88);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) {
      g.fillStyle((r + c) % 3 ? 0x6ab0d8 : 0x8ac8ec).fillRect(x + 60 + c * 15, y + 19 + r * 12, 12, 9);
    }
    g.fillStyle(0x2a3a4a).fillRect(x + 85, y + 88, 20, 14);
    g.fillStyle(0xd8e8f0).fillRect(x + 87, y + 90, 7, 12).fillRect(x + 96, y + 90, 7, 12);
  }

  // Hints, kept small: a cactus by the door, a sandy pavement and a triangle reflected in the glass.
  desertHints(g, x, y) {
    g.fillStyle(0xe0c890).fillRect(x, y + 100, PIC_W, PIC_H - 100);
    g.fillStyle(0xb08a50, 0.6).fillTriangle(x + 64, y + 46, x + 72, y + 34, x + 80, y + 46);
    g.fillStyle(0x3a8a3a).fillRect(x + 122, y + 92, 4, 10).fillRect(x + 119, y + 95, 3, 2).fillRect(x + 119, y + 92, 2, 3);
    g.fillStyle(0x3a8a3a).fillRect(x + 126, y + 94, 3, 2).fillRect(x + 128, y + 91, 2, 3);
  }

  // A snowflake by the tower, snow on the roof and a tiny penguin near the entrance.
  glacierHints(g, x, y) {
    g.fillStyle(0xffffff).fillRect(x + 55, y + 12, 80, 3);
    g.fillStyle(0xffffff).fillRect(x + 150, y + 30, 5, 1).fillRect(x + 152, y + 28, 1, 5).fillRect(x + 151, y + 29, 1, 1).fillRect(x + 153, y + 31, 1, 1);
    g.fillStyle(0x222222).fillRect(x + 118, y + 94, 4, 7);
    g.fillStyle(0xffffff).fillRect(x + 119, y + 96, 2, 4);
    g.fillStyle(0xffa020).fillRect(x + 122, y + 96, 1, 1).fillRect(x + 118, y + 101, 4, 1);
  }

  // A few bubbles rising past the tower, a fish behind a window and a bit of seaweed.
  seaHints(g, x, y) {
    g.fillStyle(0xff9a30).fillRect(x + 92, y + 44, 6, 3).fillRect(x + 98, y + 43, 2, 5);
    g.lineStyle(1, 0xffffff, 0.9).strokeCircle(x + 145, y + 60, 3).strokeCircle(x + 148, y + 48, 2).strokeCircle(x + 144, y + 38, 1.5);
    g.fillStyle(0x3ab05a).fillRect(x + 30, y + 92, 2, 10).fillRect(x + 33, y + 95, 2, 7);
  }

  // ---------------------------------------------------------------- choice

  paint() {
    this.cards.forEach((c, i) => c.frame.setStrokeStyle(4, i === this.sel ? 0xffd800 : 0x6a4a2a)
      .setFillStyle(i === this.sel ? 0xffffff : 0xfff4dc));
  }

  move(d) {
    if (this.done) return;
    this.sel = (this.sel + d + 3) % 3;
    audio.sfx('select');
    this.paint();
  }

  choose(i) {
    if (this.done || this.time.now < this.readyAt) return;
    this.done = true;
    this.sel = i;
    this.paint();
    audio.sfx('powerup');
    this.tweens.add({ targets: this.cards[i].frame, scale: 1.05, duration: 120, yoyo: true, repeat: 2 });
    this.time.delayedCall(700, () => {
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('PackingScene', { levelIndex: this.levelIndex, leg: SITES[i].leg }));
    });
  }
}
