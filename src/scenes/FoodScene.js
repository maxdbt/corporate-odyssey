import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, RENDER_SCALE, TEX, playerTex } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { FOOD_MENUS, FOOD_OUTCOMES, FOOD_PRICE } from '../data/trip.js';
import { tstyle, tripHud, resultPanel, effectLines } from '../ui/TripUI.js';
import { ensureToiletTextures } from './ToiletScene.js';

const CARD_X = [150, 400, 650];
const CARD_Y = 214;
const CARD_W = 220;
const CARD_H = 236;
const TRIP_MS = 5000;
const TOXIC_MS = 5000;
// Icons that spin around you in the hallucination.
const VISIONS = [TEX.TEAMS_METEOR, TEX.EXCEL, TEX.P_TEAMS, TEX.MAIL, TEX.TALKER1, TEX.CONFCALL1, TEX.CLIENTHELL,
  TEX.MINUTE1, TEX.BUG1, TEX.GUARDIAN1, TEX.LAPTOP, TEX.SMARTPHONE, TEX.PAPER, TEX.TALKER2];

// Ground-leg food stand (overlay over GameScene): a forced stop, three local dishes. One is good,
// one is hallucinogenic (5 s of spinning Teams / Excel / avatars), one is toxic (5 s locked in the toilet).
export default class FoodScene extends Phaser.Scene {
  constructor() {
    super('FoodScene');
  }

  init() {
    this.phase = 'choose';
    this.sel = 1;
    this.behind = Phaser.Utils.Array.Shuffle(['good', 'trip', 'toxic']);
  }

  create() {
    setupStaticCamera(this);
    const gs = this.scene.get('GameScene');
    this.menu = FOOD_MENUS[gs?.level?.theme] || FOOD_MENUS.desert;
    this.drawStand();
    this.refreshHud = tripHud(this, 'SOSTA OBBLIGATA');
    this.add.text(GAME_WIDTH / 2, 46, `CHIOSCO "${this.menu.stand}"`, tstyle(16, '#ffd800', { strokeThickness: 5 })).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 72, this.menu.cook, tstyle(9, '#ffffff', { align: 'center', wordWrap: { width: 700 } })).setOrigin(0.5);

    this.cards = this.menu.dishes.map((d, i) => this.card(d, i));
    this.hint = this.add.text(GAME_WIDTH / 2, 438, `Ogni piatto ${FOOD_PRICE} €  -  SINISTRA/DESTRA scegli, INVIO mangia  -  oppure CLICCA un piatto`,
      tstyle(9, '#cccccc')).setOrigin(0.5).setDepth(5);
    this.paint();

    this.readyAt = this.time.now + 400;
    this.input.keyboard?.on('keydown', (ev) => {
      if (this.phase !== 'choose') return;
      const k = ev.key;
      if (['ArrowLeft', 'a', 'A'].includes(k)) this.move(-1);
      else if (['ArrowRight', 'd', 'D'].includes(k)) this.move(1);
      else if (['Enter', ' ', 'z', 'Z'].includes(k)) this.eat(this.sel);
      else if (k >= '1' && k <= '3') this.eat(Number(k) - 1);
    });
    audio.sfx('quiz');
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  drawStand() {
    const g = this.add.graphics();
    g.fillStyle(0xd8b078).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    for (let x = 0; x < GAME_WIDTH; x += 48) g.fillStyle(0xc8a068).fillRect(x, 30, 3, 330);
    // Back shelf with jars and spices
    g.fillStyle(0x6a4a2a).fillRect(0, 100, GAME_WIDTH, 6);
    const jars = [0xd04020, 0xffb000, 0x3ca03c, 0x8a3ab0, 0xe8e0c0];
    for (let x = 14; x < GAME_WIDTH; x += 34) g.fillStyle(jars[(x / 34) % 5 | 0]).fillRect(x, 84, 16, 16).fillStyle(0x6a4a2a).fillRect(x + 2, 80, 12, 4);
    // Counter
    g.fillStyle(0x8a5a2a).fillRect(0, 352, GAME_WIDTH, 98).fillStyle(0xa06a3a).fillRect(0, 352, GAME_WIDTH, 8);
    for (let x = 0; x < GAME_WIDTH; x += 64) g.fillStyle(0x7a4a1a).fillRect(x, 362, 2, 88);
    this.add.image(60, 432, TEX.COOK1).setOrigin(0.5, 1).setScale(2.5);
    const c = GameState.character || 'man';
    this.player = this.add.image(740, 432, playerTex(c, 'idle')).setOrigin(0.5, 1).setScale(2.5).setFlipX(true);
  }

  card(d, i) {
    const x = CARD_X[i];
    const top = CARD_Y - CARD_H / 2;
    const frame = this.add.rectangle(x, CARD_Y, CARD_W, CARD_H, 0xfff4dc).setStrokeStyle(4, 0x6a4a2a)
      .setInteractive({ useHandCursor: true });
    frame.on('pointerover', () => { if (this.phase === 'choose') { this.sel = i; this.paint(); } });
    frame.on('pointerdown', () => this.eat(i));
    this.add.rectangle(x, top + 56, 120, 80, 0xe8d8b8);
    const img = this.add.image(x, top + 58, d.tex).setScale(2.5);
    this.tweens.add({ targets: img, y: top + 54, duration: 700 + i * 90, yoyo: true, repeat: -1 });
    this.add.text(x, top + 112, `${i + 1}. ${d.name}`, tstyle(11, '#ffd800', { align: 'center', wordWrap: { width: CARD_W - 20 } })).setOrigin(0.5, 0);
    this.add.text(x, top + 154, d.text, tstyle(9, '#3a2a1a', { strokeThickness: 0, align: 'center', wordWrap: { width: CARD_W - 24 } })).setOrigin(0.5, 0);
    this.add.text(x, top + CARD_H - 16, `${FOOD_PRICE} €`, tstyle(11, '#7CFC00')).setOrigin(0.5);
    return { frame };
  }

  paint() {
    this.cards.forEach((c, i) => c.frame.setStrokeStyle(4, i === this.sel ? 0xffd800 : 0x6a4a2a)
      .setFillStyle(i === this.sel ? 0xffffff : 0xfff4dc));
  }

  move(d) {
    this.sel = (this.sel + d + 3) % 3;
    audio.sfx('select');
    this.paint();
  }

  eat(i) {
    if (this.phase !== 'choose' || this.time.now < this.readyAt) return;
    this.phase = 'eating';
    this.sel = i;
    this.paint();
    this.dish = this.menu.dishes[i];
    this.paid = GameState.spend(FOOD_PRICE);
    this.refreshHud();
    audio.sfx('coin');
    this.hint.setText(this.paid ? 'GNAM GNAM...' : 'BUDGET FINITO: OFFRE LA CASA! GNAM GNAM...');
    this.tweens.add({ targets: this.cards[i].frame, scale: 1.06, duration: 120, yoyo: true, repeat: 3 });
    const kind = this.behind[i];
    this.time.delayedCall(1100, () => {
      if (kind === 'trip') this.hallucination();
      else if (kind === 'toxic') this.toilet();
      else this.outcome('good');
    });
  }

  // Full-screen psychedelic whirl: icons spin around the player for TRIP_MS.
  hallucination() {
    this.phase = 'trip';
    audio.sfx('freeze');
    const layer = this.add.container(0, 0).setDepth(40);
    this.tripBg = this.add.graphics();
    layer.add(this.tripBg);
    const c = GameState.character || 'man';
    this.tripPlayer = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, playerTex(c, 'hurt')).setScale(3);
    layer.add(this.tripPlayer);
    this.visions = VISIONS.map((tex, i) => {
      const img = this.add.image(0, 0, tex).setScale(Phaser.Math.FloatBetween(1.6, 2.6));
      img.orbit = { r: 90 + (i % 4) * 45, a: (i / VISIONS.length) * Math.PI * 2, v: (i % 2 ? 1 : -1) * Phaser.Math.FloatBetween(1.6, 3.2) };
      layer.add(img);
      return img;
    });
    this.tripText = this.add.text(GAME_WIDTH / 2, 80, `MA COSA C'ERA ${this.dish.what}?!`,
      tstyle(20, '#ffffff', { strokeThickness: 6 })).setOrigin(0.5);
    this.tripCount = this.add.text(GAME_WIDTH / 2, 385, '', tstyle(14, '#ffd800', { strokeThickness: 5 })).setOrigin(0.5);
    layer.add([this.tripText, this.tripCount]);
    this.tripLayer = layer;
    this.tripEnd = this.time.now + TRIP_MS;
    // Sway around the centre of the screen, zoomed in so the rotated corners stay covered.
    const cam = this.cameras.main;
    cam.setOrigin(0.5).setZoom(RENDER_SCALE * 1.15).setScroll(GAME_WIDTH / 2 - cam.width / 2, GAME_HEIGHT / 2 - cam.height / 2);
    this.time.delayedCall(TRIP_MS, () => {
      setupStaticCamera(this);
      layer.destroy();
      this.outcome('trip');
    });
  }

  // Locked in the stand's toilet for TOXIC_MS: the door shakes, the countdown runs.
  toilet() {
    this.phase = 'toxic';
    ensureToiletTextures(this);
    audio.sfx('hurt');
    const layer = this.add.container(0, 0).setDepth(40);
    const g = this.add.graphics();
    g.fillStyle(0x98b8a0).fillRect(0, 30, GAME_WIDTH, GAME_HEIGHT - 30);
    for (let x = 0; x < GAME_WIDTH; x += 20) for (let y = 30; y < 380; y += 20) {
      g.fillStyle(((x + y) / 20) % 2 ? 0xb8d8c0 : 0xd0e8d4).fillRect(x, y, 19, 19);
    }
    g.fillStyle(0x6a7a6a).fillRect(0, 380, GAME_WIDTH, 70);
    g.fillStyle(0x4a5a4a).fillRect(GAME_WIDTH / 2 - 80, 150, 160, 232);
    layer.add(g);
    const door = this.add.container(GAME_WIDTH / 2, 160);
    door.add(this.add.rectangle(0, 0, 140, 220, 0x8a6a4a).setOrigin(0.5, 0).setStrokeStyle(4, 0x4a3a2a));
    door.add(this.add.rectangle(0, 40, 70, 18, 0xd02020));
    door.add(this.add.text(0, 40, 'OCCUPATO', tstyle(9, '#ffffff', { strokeThickness: 2 })).setOrigin(0.5));
    door.add(this.add.rectangle(50, 110, 8, 14, 0xd0d0d0));
    layer.add(door);
    layer.add(this.add.image(120, 380, 'wc_toilet').setOrigin(0.5, 1).setScale(1.5));
    layer.add(this.add.text(GAME_WIDTH / 2, 60, 'INTOSSICAZIONE ALIMENTARE!\nBLOCCATO NEL BAGNO DEL CHIOSCO',
      tstyle(16, '#b8f070', { align: 'center', strokeThickness: 5, lineSpacing: 4 })).setOrigin(0.5));
    const moan = this.add.text(GAME_WIDTH / 2 + 110, 200, 'OOOH...\nIL MIO STOMACO...', tstyle(10, '#000000', {
      strokeThickness: 0, backgroundColor: '#ffffff', padding: { x: 6, y: 4 }, align: 'center' })).setOrigin(0, 0.5);
    layer.add(moan);
    const count = this.add.text(GAME_WIDTH / 2, 420, '', tstyle(14, '#ffd800', { strokeThickness: 5 })).setOrigin(0.5);
    layer.add(count);
    this.tweens.add({ targets: door, x: GAME_WIDTH / 2 + 4, duration: 60, yoyo: true, repeat: -1, repeatDelay: 500 });
    const end = this.time.now + TOXIC_MS;
    const tick = this.time.addEvent({
      delay: 100, loop: true,
      callback: () => {
        const left = Math.ceil((end - this.time.now) / 1000);
        count.setText(`ESCI TRA ${Math.max(0, left)}...`);
      }
    });
    this.time.addEvent({ delay: 1000, repeat: 3, callback: () => audio.sfx('hurt') });
    this.time.delayedCall(TOXIC_MS, () => {
      tick.remove();
      layer.destroy();
      this.outcome('toxic');
    });
  }

  update(time) {
    if (this.phase !== 'trip' || !this.tripLayer) return;
    // Rainbow stripes, spinning icons, swaying camera.
    const g = this.tripBg.clear();
    for (let i = 0; i < 10; i++) {
      const col = Phaser.Display.Color.HSVToRGB(((time / 900) + i / 10) % 1, 0.8, 1).color;
      g.fillStyle(col).fillRect(0, i * 45, GAME_WIDTH, 45);
    }
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2 + 20;
    this.visions.forEach((v, i) => {
      v.orbit.a += v.orbit.v * 0.016;
      const r = v.orbit.r + Math.sin(time / 300 + i) * 20;
      v.setPosition(cx + Math.cos(v.orbit.a) * r * 1.5, cy + Math.sin(v.orbit.a) * r).setAngle(time / 4 * (i % 2 ? 1 : -1));
    });
    this.tripPlayer.setAngle(Math.sin(time / 200) * 25).setScale(3 + Math.sin(time / 260) * 0.4);
    this.tripText.setScale(1 + Math.sin(time / 150) * 0.12).setAngle(Math.sin(time / 230) * 6);
    this.tripCount.setText(`TORNI IN TE TRA ${Math.max(0, Math.ceil((this.tripEnd - time) / 1000))}...`);
    this.cameras.main.setRotation(Math.sin(time / 350) * 0.08);
  }

  outcome(kind) {
    this.phase = 'result';
    const o = FOOD_OUTCOMES[kind];
    GameState.addHp(o.hp);
    GameState.addStress(o.stress);
    this.refreshHud();
    this.result = o;
    audio.sfx(kind === 'good' ? 'powerup' : 'gameover');
    const lines = [...effectLines(o)];
    if (o.time) lines.push(`TEMPO ${o.time}s`);
    const titles = {
      good: [`${this.dish.name}: SQUISITO!`, '#7CFC00'],
      trip: ['CIBO LOCALE... MOLTO "TRADIZIONALE"', '#ff9fd0'],
      toxic: ['DA QUESTO CHIOSCO NON SI TORNA PIU\'', '#ff8080']
    };
    resultPanel(this, { title: titles[kind][0], color: titles[kind][1], lines, y: 240, onClose: () => this.finish() });
  }

  finish() {
    const gs = this.scene.get('GameScene');
    setupStaticCamera(this);
    if (gs && this.result?.time) gs.timeLeft = Math.max(1, gs.timeLeft + this.result.time);
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}
