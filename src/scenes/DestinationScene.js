import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { tstyle } from '../ui/TripUI.js';

const CARD_X = [150, 400, 650];
const CARD_Y = 232;
const CARD_W = 220;
const CARD_H = 250;
const PIC_W = 190;
const PIC_H = 120;

const SITES = [
  { leg: 'desert', name: 'IL DESERTO', text: 'Sede accanto alle piramidi.\n"E\' a due passi dalla stazione."', draw: 'pyramid' },
  { leg: 'glacier', name: 'IL GHIACCIAIO', text: 'Sede in alta montagna.\nUna location... fresca.', draw: 'mountain' },
  { leg: 'sea', name: 'IL MARE', text: 'Sede sul fondale marino.\nPortarsi il costume.', draw: 'sea' }
];

// Trip stage 0 "Il Cliente Lontano": pick one of the client's 3 sites (pyramid / mountain / sea).
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
    this[site.draw](g, x - PIC_W / 2, top + 14);
    g.lineStyle(3, 0x3a2a1a).strokeRect(x - PIC_W / 2, top + 14, PIC_W, PIC_H);
    this.add.text(x, top + PIC_H + 30, `${i + 1}. ${site.name}`, tstyle(13, '#ffd800')).setOrigin(0.5);
    this.add.text(x, top + PIC_H + 52, site.text, tstyle(9, '#3a2a1a', { strokeThickness: 0, align: 'center', lineSpacing: 4 })).setOrigin(0.5, 0);
    return { frame };
  }

  // ---------------------------------------------------------------- pictures (x, y = top-left of a PIC_W x PIC_H frame)

  pyramid(g, x, y) {
    g.fillStyle(0xffb347).fillRect(x, y, PIC_W, 70).fillStyle(0xffd27a).fillRect(x, y + 40, PIC_W, 30);
    g.fillStyle(0xfff3a0).fillCircle(x + 160, y + 24, 14);
    g.fillStyle(0xe8c070).fillRect(x, y + 70, PIC_W, PIC_H - 70);
    g.fillStyle(0xc8964a).fillTriangle(x + 30, y + 100, x + 90, y + 28, x + 150, y + 100);
    g.fillStyle(0xa87838).fillTriangle(x + 90, y + 28, x + 150, y + 100, x + 110, y + 100);
    g.fillStyle(0xc8964a).fillTriangle(x + 130, y + 100, x + 160, y + 66, x + 190, y + 100);
    for (let r = 0; r < 4; r++) g.fillStyle(0x9a6a2a).fillRect(x + 48 + r * 12, y + 46 + r * 14, 84 - r * 24, 2);
    g.fillStyle(0x3a8a3a).fillRect(x + 14, y + 80, 3, 22).fillTriangle(x + 4, y + 82, x + 15, y + 74, x + 27, y + 82);
  }

  mountain(g, x, y) {
    g.fillStyle(0x7ec8f0).fillRect(x, y, PIC_W, PIC_H).fillStyle(0xa8dcf8).fillRect(x, y + 50, PIC_W, 40);
    g.fillStyle(0x6a7a9a).fillTriangle(x, y + PIC_H, x + 70, y + 22, x + 140, y + PIC_H);
    g.fillStyle(0x56668a).fillTriangle(x + 90, y + PIC_H, x + 150, y + 40, x + PIC_W, y + PIC_H);
    g.fillStyle(0xffffff).fillTriangle(x + 52, y + 42, x + 70, y + 22, x + 88, y + 42);
    g.fillStyle(0xffffff).fillTriangle(x + 136, y + 54, x + 150, y + 40, x + 164, y + 54);
    g.fillStyle(0xe8f4ff).fillRect(x, y + 102, PIC_W, PIC_H - 102);
    for (let i = 0; i < 8; i++) g.fillStyle(0xffffff).fillRect(x + 12 + i * 23, y + 8 + (i * 37) % 40, 2, 2);
  }

  sea(g, x, y) {
    g.fillStyle(0x8ad8ff).fillRect(x, y, PIC_W, 34);
    g.fillStyle(0xfff3a0).fillCircle(x + 30, y + 16, 10);
    for (let i = 0; i < 4; i++) g.fillStyle([0x2a8ad8, 0x2070c0, 0x1a58a0, 0x10407a][i]).fillRect(x, y + 34 + i * 18, PIC_W, 18);
    for (let wx = 0; wx < PIC_W; wx += 20) g.fillStyle(0xffffff).fillRect(x + wx, y + 34, 10, 3);
    g.fillStyle(0xe8d8a0).fillRect(x, y + 106, PIC_W, PIC_H - 106);
    g.fillStyle(0xffa040).fillEllipse(x + 120, y + 64, 22, 12).fillTriangle(x + 130, y + 64, x + 140, y + 57, x + 140, y + 71);
    g.fillStyle(0xff6aa0).fillEllipse(x + 60, y + 86, 18, 10).fillTriangle(x + 52, y + 86, x + 44, y + 80, x + 44, y + 92);
    g.fillStyle(0x3ab05a).fillRect(x + 160, y + 80, 4, 26).fillRect(x + 170, y + 88, 4, 18).fillRect(x + 22, y + 92, 4, 14);
    g.fillStyle(0xffffff, 0.7).fillCircle(x + 100, y + 54, 3).fillCircle(x + 104, y + 46, 2);
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
