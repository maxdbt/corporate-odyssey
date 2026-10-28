import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT, TEX, CHARACTERS, playerTex, playerAnim } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { ensureExecTextures } from '../gfx/exec.js';
import { ensureTeamsIconTexture } from '../entities/enemies/OfficeEnemies.js';
import { ensureBeachPlayer } from '../gfx/players.js';
import { logFinalChoice } from '../systems/Survey.js';

const style = (size, color = '#ffffff', extra = {}) => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 4, ...extra
});

const CHOICE_TEXT = 'Hai scalato tutta la gerarchia aziendale superando prove difficilissime, ' +
  'ora tutti riconoscono il tuo valore.\n\nOra però devi fare una scelta.\n\n' +
  'Il CdA vuole nominarti come nuovo CEO oppure puoi licenziarti e iniziare una nuova vita ai Caraibi.\n\nDevi scegliere.';
const CLIENT_TEX = { desert: 'client_pharaoh', glacier: 'client_penguin', sea: 'client_mermaid' };
const CHEERS = ['BRAVO!', 'GRANDE!', 'SEI UN MITO!', 'EVVIVA!', 'HIP HIP URRA\'!', 'CHAPEAU!', 'TOP!'];
// Scenes are composed for 800 wide: CX centres them on wider screens.
const CX = (GAME_WIDTH - 800) / 2;
const CARD_X = [220 + CX, 580 + CX];
const CARD_Y = 240;
const PIC_W = 300;
const PIC_H = 170;

// The ending (after the Mega-Direttore flies away on 5-5):
// 1. coral celebration -> 2. the CdA's offer -> 3. living choice (armchair / tropical island)
// -> 4. the future life (CEO: "Il ciclo continua." / Caraibi: the Teams bottle) -> 5. stats and back to the menu.
export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create() {
    setupStaticCamera(this);
    ensureExecTextures(this);
    ensureTeamsIconTexture(this);
    this.objs = [];
    this.advance = null;
    this.gen = 0;
    this.input.on('pointerdown', () => this.next());
    this.input.keyboard?.on('keydown', (ev) => {
      if (['Enter', ' ', 'z', 'Z'].includes(ev.key)) this.next();
      else if (this.onKey) this.onKey(ev.key);
    });
    audio.stopMusic();
    audio.sfx('victory');
    this.celebration();
  }

  // ---------------------------------------------------------------- helpers

  add2(o) { this.objs.push(o); return o; }

  // Timers tied to the current step. clear() bumps gen: removed timers can still fire in the same frame
  // (clear() runs inside the camera fade callback), and they must not touch the destroyed objects.
  after(ms, fn) {
    const gen = this.gen;
    return this.time.delayedCall(ms, () => { if (gen === this.gen) fn(); });
  }

  every(cfg) {
    const gen = this.gen;
    const ev = this.time.addEvent({ ...cfg, callback: () => { if (gen === this.gen) cfg.callback(); else ev.remove(); } });
    return ev;
  }

  clear() {
    this.gen++;
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.objs.forEach((o) => o.destroy());
    this.objs = [];
    this.advance = null;
    this.onKey = null;
  }

  // Enter / click: runs the current step's action once it is allowed (readyAt avoids skipping by accident).
  next() {
    if (!this.advance || this.time.now < this.readyAt) return;
    const fn = this.advance;
    this.advance = null;
    fn();
  }

  waitInput(fn, delay = 600) {
    this.readyAt = this.time.now + delay;
    this.advance = fn;
  }

  hint(text, y = 432) {
    const t = this.add2(this.add.text(GAME_WIDTH / 2, y, text, style(11, '#9be7ff'))).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: t, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    return t;
  }

  fadeTo(fn, ms = 350) {
    const cam = this.cameras.main;
    cam.fadeOut(ms, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => { fn(); cam.fadeIn(ms, 0, 0, 0); });
  }

  confetti(n = 70) {
    const colors = [0xffd800, 0xff4060, 0x40c0ff, 0x7dff7d, 0xffffff];
    for (let i = 0; i < n; i++) {
      const c = this.add2(this.add.rectangle(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(-450, 0), 4, 6,
        Phaser.Utils.Array.GetRandom(colors))).setDepth(40);
      this.tweens.add({
        targets: c, y: GAME_HEIGHT + 10, x: c.x + Phaser.Math.Between(-40, 40), angle: 360,
        duration: Phaser.Math.Between(2500, 5000), repeat: -1, delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  playerSprite(x, y, scale, character = GameState.character) {
    const s = this.add2(this.add.sprite(x, y, playerTex(character, 'idle'))).setOrigin(0.5, 1).setScale(scale);
    return s;
  }

  walk(s, character = GameState.character) {
    const k = playerAnim(character, 'walk');
    if (this.anims.exists(k)) s.play(k);
  }

  stopWalk(s, character = GameState.character) {
    s.stop();
    s.setTexture(playerTex(character, 'idle'));
  }

  goldOffice() {
    const g = this.add2(this.add.graphics());
    g.fillStyle(0x3a2a00, 1).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    for (let x = 0; x < GAME_WIDTH; x += 40) g.fillStyle(x % 80 ? 0x5a4200 : 0x6e5200, 1).fillRect(x, 0, 40, 330);
    g.fillStyle(0x8a0a14, 1).fillRect(0, 330, GAME_WIDTH, GAME_HEIGHT - 330);
    g.fillStyle(0xe8c547, 1).fillRect(0, 326, GAME_WIDTH, 4);
    return g;
  }

  // Palm drawn around its base (0, 0) so a rotation tween makes it sway.
  palm(x, y, s = 1, depth = 5) {
    const g = this.add2(this.add.graphics({ x, y })).setDepth(depth);
    for (let i = 0; i < 8; i++) g.fillStyle(i % 2 ? 0x8a5a2a : 0x6a4020).fillRect(-4 * s + i * 1.5 * s, -(i + 1) * 12 * s, 8 * s, 12 * s);
    const tx = 12 * s;
    const ty = -96 * s;
    g.fillStyle(0x2a9a3a);
    [[-1, -0.2], [1, -0.2], [-1, 0.4], [1, 0.4], [-0.3, -1]].forEach(([dx, dy]) => {
      g.fillTriangle(tx, ty, tx + dx * 46 * s, ty + dy * 30 * s + 10 * s, tx + dx * 30 * s, ty + dy * 30 * s - 6 * s);
    });
    g.fillStyle(0x6a4020).fillCircle(tx - 4 * s, ty + 6 * s, 4 * s).fillCircle(tx + 4 * s, ty + 7 * s, 4 * s);
    this.tweens.add({ targets: g, angle: { from: -3, to: 3 }, duration: 1400 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return g;
  }

  // Sea strip with moving wave crests.
  waves(x, y, w, h, depth = 2) {
    const g = this.add2(this.add.graphics()).setDepth(depth);
    g.fillStyle(0x1aa0d8).fillRect(x, y, w, h);
    g.fillStyle(0x0a7ab8).fillRect(x, y + h * 0.5, w, h * 0.5);
    for (let r = 0; r < 3; r++) {
      const crest = this.add2(this.add.graphics()).setDepth(depth + 1);
      crest.fillStyle(0xffffff, 0.8);
      for (let cx = x + (r % 2) * 18; cx < x + w - 14; cx += 36) crest.fillRect(cx, y + 6 + r * (h / 3), 14, 2);
      this.tweens.add({ targets: crest, x: 10, duration: 900 + r * 200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
    return g;
  }

  bottle(x, y) {
    const c = this.add2(this.add.container(x, y)).setDepth(8);
    const g = this.add.graphics();
    g.fillStyle(0x3aa070, 0.85).fillRoundedRect(-14, -6, 22, 12, 4).fillRect(8, -3, 8, 6);
    g.fillStyle(0x8a5a2a).fillRect(16, -3, 3, 6);
    g.fillStyle(0xfff4dc).fillRect(-10, -3, 14, 6);
    c.add(g);
    c.add(this.add.image(-3, 0, 'teams_icon').setScale(0.4));
    return c;
  }

  // ---------------------------------------------------------------- 1. celebration

  celebration() {
    this.goldOffice();
    this.after(1600, () => audio.music('promotion'));
    this.confetti();
    const crowd = [TEX.TALKER1, 'yesman1', 'secretary1', TEX.PARTY1, CLIENT_TEX[GameState.tripLeg] || TEX.COOK1,
      'strategist1', TEX.GUARDIAN1, 'elf_bouncer']
      .filter((k) => this.textures.exists(k));
    const xs = [70, 150, 230, 310, 490, 570, 650, 730].map((x) => x + CX);
    crowd.forEach((k, i) => {
      const s = this.add2(this.add.image(xs[i], 330, k)).setOrigin(0.5, 1).setScale(2).setFlipX(xs[i] > GAME_WIDTH / 2);
      this.tweens.add({ targets: s, y: 312, duration: 260, yoyo: true, repeat: -1, delay: Math.random() * 400, ease: 'Quad.Out' });
    });
    const hero = this.playerSprite(GAME_WIDTH / 2, 330, 3.5);
    this.walk(hero);
    this.tweens.add({ targets: hero, y: 300, duration: 350, yoyo: true, repeat: -1, ease: 'Quad.Out' });

    // The Mega-Direttore drifting away in the sky with the golden parachute.
    const boss = this.add2(this.add.container(-60, 60)).setDepth(3).setScale(0.6);
    boss.add(this.add.image(0, -80, 'gold_canopy').setOrigin(0.5, 1));
    boss.add(this.add.image(0, 0, 'ceo_standing').setOrigin(0.5, 1).setScale(0.8));
    this.tweens.add({ targets: boss, x: GAME_WIDTH + 80, y: 150, duration: 9000 });
    this.tweens.add({ targets: boss, angle: { from: -8, to: 8 }, duration: 600, yoyo: true, repeat: -1 });

    this.add2(this.add.text(GAME_WIDTH / 2, 196, 'CE L\'HAI FATTA!', style(40, '#ffd800', { strokeThickness: 7 }))).setOrigin(0.5).setDepth(20);
    this.every({ delay: 450, loop: true, callback: () => {
      const x = Phaser.Math.Between(60, GAME_WIDTH - 60);
      const t = this.add2(this.add.text(x, 250, Phaser.Utils.Array.GetRandom(CHEERS), style(12, '#ffffff'))).setOrigin(0.5).setDepth(21);
      this.tweens.add({ targets: t, y: 220, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
    } });
    audio.sfx('cheer');
    this.after(2500, () => audio.sfx('cheer'));
    this.hint('PREMI INVIO O TOCCA PER CONTINUARE');
    this.waitInput(() => this.offer(), 1500);
    this.after(7000, () => this.next());
  }

  // ---------------------------------------------------------------- 2. the CdA's offer

  offer() {
    this.time.removeAllEvents();
    const dim = this.add2(this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)).setOrigin(0).setDepth(30);
    dim.setAlpha(0);
    this.tweens.add({ targets: dim, alpha: 1, duration: 400 });
    const panel = this.add2(this.add.rectangle(GAME_WIDTH / 2, 205, 660, 300, 0xfff4dc)).setStrokeStyle(4, 0xd4af37).setDepth(31);
    const txt = this.add2(this.add.text(GAME_WIDTH / 2, 205, CHOICE_TEXT, style(15, '#2a1a0a', {
      strokeThickness: 0, align: 'center', wordWrap: { width: 600 }, lineSpacing: 4
    }))).setOrigin(0.5).setDepth(32);
    [panel, txt].forEach((o) => { o.setAlpha(0); this.tweens.add({ targets: o, alpha: 1, duration: 500, delay: 200 }); });
    this.objs.filter((o) => o.type === 'Text' && o.depth === 50).forEach((o) => o.destroy());
    this.hint('PREMI INVIO O TOCCA PER SCEGLIERE');
    this.waitInput(() => this.fadeTo(() => this.choice()), 1500);
  }

  // ---------------------------------------------------------------- 3. the living choice

  choice() {
    this.clear();
    audio.stopMusic();
    const g = this.add2(this.add.graphics());
    g.fillStyle(0x10204a).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    for (let y = 0; y < GAME_HEIGHT; y += 24) g.fillStyle(0x142a5a).fillRect(0, y, GAME_WIDTH, 2);
    this.add2(this.add.text(GAME_WIDTH / 2, 34, 'DEVI SCEGLIERE', style(22, '#ffd800', { strokeThickness: 5 }))).setOrigin(0.5);
    const wait = this.add2(this.add.text(GAME_WIDTH / 2, 66, 'Il CdA attende', style(12, '#ffffff'))).setOrigin(0.5);
    let dots = 0;
    this.every({ delay: 450, loop: true, callback: () => { dots = (dots + 1) % 4; wait.setText(`Il CdA attende${'.'.repeat(dots)}`); } });
    this.sel = 0;
    this.chosen = false;
    this.cards = [
      this.card(0, '1. NUOVO CEO', (x, y) => this.armchairPic(x, y)),
      this.card(1, '2. SCAPPO AI CARAIBI', (x, y) => this.islandPic(x, y))
    ];
    this.add2(this.add.text(GAME_WIDTH / 2, 424, 'SINISTRA/DESTRA scegli, INVIO conferma  -  oppure CLICCA', style(9, '#cccccc', { strokeThickness: 3 }))).setOrigin(0.5);
    this.add2(this.add.text(GAME_WIDTH / 2, 441, 'La tua scelta viene registrata in forma anonima per un\'indagine sociologica.', style(8, '#8fa8d8', { strokeThickness: 2 }))).setOrigin(0.5);
    this.paintCards();
    this.onKey = (k) => {
      if (['ArrowLeft', 'a', 'A', 'ArrowRight', 'd', 'D'].includes(k)) {
        this.sel = 1 - this.sel;
        audio.sfx('select');
        this.paintCards();
      } else if (k === '1' || k === '2') this.choose(Number(k) - 1);
    };
    this.waitInput(() => this.choose(this.sel), 700);
  }

  card(i, label, draw) {
    const x = CARD_X[i];
    const frame = this.add2(this.add.rectangle(x, CARD_Y, PIC_W + 30, 290, 0xfff4dc)).setStrokeStyle(4, 0x6a4a2a)
      .setInteractive({ useHandCursor: true });
    frame.on('pointerover', () => { if (!this.chosen) { this.sel = i; this.paintCards(); } });
    frame.on('pointerdown', (ptr, lx, ly, ev) => { ev?.stopPropagation(); this.choose(i); });
    const px = x - PIC_W / 2;
    const py = CARD_Y - 130;
    // Picture area, masked so falling mails and waves stay inside.
    const maskG = this.make.graphics({}, false).fillStyle(0xffffff).fillRect(px, py, PIC_W, PIC_H);
    const mask = maskG.createGeometryMask();
    this.picMask = mask;
    const before = this.objs.length;
    draw(px, py);
    this.objs.slice(before).forEach((o) => o.setMask?.(mask));
    const border = this.add2(this.add.graphics());
    border.lineStyle(3, 0x3a2a1a).strokeRect(px, py, PIC_W, PIC_H);
    this.add2(this.add.text(x, py + PIC_H + 40, label, style(18, '#ffd800'))).setOrigin(0.5);
    return { frame };
  }

  // The armchair: the empty leather throne, phones ringing, e-mails piling up.
  armchairPic(x, y) {
    const mask = this.picMask;
    const g = this.add2(this.add.graphics());
    g.fillStyle(0x5a3418).fillRect(x, y, PIC_W, PIC_H);
    for (let i = 0; i < PIC_W; i += 30) g.fillStyle(0x4a2a12).fillRect(x + i, y, 2, PIC_H - 30);
    g.fillStyle(0x8a0a14).fillRect(x, y + PIC_H - 30, PIC_W, 30);
    this.add2(this.add.image(x + PIC_W / 2, y + PIC_H - 8, 'throne_empty')).setOrigin(0.5, 1).setScale(1.3);
    [[x + 40, y + 120], [x + PIC_W - 40, y + 110]].forEach(([px, py], i) => {
      const ph = this.add2(this.add.graphics({ x: px, y: py }));
      ph.fillStyle(0x222222).fillRect(-14, -6, 28, 14).fillRect(-16, -12, 32, 6);
      ph.fillStyle(0xd02020).fillRect(-4, -2, 8, 6);
      this.tweens.add({ targets: ph, x: px + 2, duration: 40, yoyo: true, repeat: -1, delay: i * 300 });
      this.every({ delay: 900, startAt: i * 450, loop: true, callback: () => {
        const t = this.add2(this.add.text(px, py - 18, 'DRIIN!', style(10, '#ff6060', { strokeThickness: 3 }))).setOrigin(0.5);
        this.tweens.add({ targets: t, y: py - 34, alpha: 0, duration: 700, onComplete: () => t.destroy() });
      } });
    });
    // Mails pile up on the right of the throne, then the pile starts again.
    let n = 0;
    this.every({ delay: 260, loop: true, callback: () => {
      if (n >= 14) return;
      const tx = x + 70 + (n % 2) * 8;
      const m = this.add2(this.add.image(tx + Phaser.Math.Between(-6, 6), y - 10, TEX.MAIL)).setScale(1.6).setMask(mask);
      const ty = y + PIC_H - 34 - n * 7;
      this.tweens.add({ targets: m, y: ty, angle: Phaser.Math.Between(-15, 15), duration: 380, ease: 'Quad.In' });
      n++;
    } });
  }

  // The island: sun, sea with waves, sand, swaying palm, a hammock.
  islandPic(x, y) {
    const g = this.add2(this.add.graphics());
    g.fillGradientStyle(0x3ab0f0, 0x3ab0f0, 0xbfe8ff, 0xbfe8ff, 1).fillRect(x, y, PIC_W, PIC_H);
    g.fillStyle(0xfff3a0).fillCircle(x + PIC_W - 50, y + 36, 18);
    this.waves(x, y + 96, PIC_W, PIC_H - 96, 1);
    const sand = this.add2(this.add.graphics());
    sand.fillStyle(0xf0d890).fillEllipse(x + 120, y + PIC_H + 6, 240, 70);
    this.palm(x + 80, y + PIC_H - 12, 0.9);
    this.palm(x + 170, y + PIC_H - 8, 0.75);
    const h = this.add2(this.add.graphics());
    h.lineStyle(3, 0xd04040).beginPath();
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const px = x + 84 + t * 88;
      const py = y + PIC_H - 46 + Math.sin(t * Math.PI) * 14;
      if (i === 0) h.moveTo(px, py); else h.lineTo(px, py);
    }
    h.strokePath();
  }

  paintCards() {
    this.cards.forEach((c, i) => c.frame.setStrokeStyle(4, i === this.sel ? 0xffd800 : 0x6a4a2a)
      .setFillStyle(i === this.sel ? 0xffffff : 0xfff4dc));
  }

  choose(i) {
    if (this.chosen || this.time.now < this.readyAt) return;
    this.chosen = true;
    this.advance = null;
    this.sel = i;
    this.paintCards();
    logFinalChoice(i === 0 ? 'ceo' : 'caraibi');
    audio.sfx('powerup');
    this.tweens.add({ targets: this.cards[i].frame, scale: 1.04, duration: 120, yoyo: true, repeat: 2 });
    this.after(800, () => this.fadeTo(() => (i === 0 ? this.ceoEnding() : this.islandEnding()), 450));
  }

  // ---------------------------------------------------------------- 4a. CEO: "Il ciclo continua."

  ceoEnding() {
    this.clear();
    audio.music('boss');
    this.goldOffice();
    const throne = this.add2(this.add.image(560 + CX, 330, 'throne_empty')).setOrigin(0.5, 1).setScale(1.2);
    // The board applauds on the left.
    [TEX.GUARDIAN1, 'strategist1', 'yesman1'].forEach((k, i) => {
      const s = this.add2(this.add.image(60 + CX + i * 50, 330, k)).setOrigin(0.5, 1).setScale(2);
      this.tweens.add({ targets: s, y: 324, duration: 180, yoyo: true, repeat: -1, delay: i * 90 });
    });
    const hero = this.playerSprite(220 + CX, 330, 3);
    this.walk(hero);
    const title = this.add2(this.add.text(GAME_WIDTH / 2, 60, 'IL CDA TI NOMINA NUOVO CEO', style(20, '#ffd800', { strokeThickness: 5 }))).setOrigin(0.5);
    this.tweens.add({ targets: hero, x: 520 + CX, duration: 2200, onComplete: () => {
      this.stopWalk(hero);
      // Sits on the throne... and turns into the Mega-Direttore.
      this.tweens.add({ targets: hero, alpha: 0, duration: 300 });
      this.after(400, () => {
        this.cameras.main.flash(500, 255, 255, 255);
        audio.sfx('explosion');
        throne.setTexture(TEX.BOSS_CEO).setScale(1.4);
        title.setText('SEI DIVENTATO... IL NUOVO MEGA-DIRETTORE');
        this.add2(this.add.text(560 + CX, 180, 'AH AH AH!', style(14, '#ff6060'))).setOrigin(0.5);
        this.tweens.add({ targets: throne, x: 540 + CX, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      });
      this.after(3600, () => this.fadeTo(() => this.newHire(), 500));
    } });
  }

  // 24 December, one year later: a new hire walks into the open space.
  newHire() {
    this.clear();
    audio.music('menu');
    const g = this.add2(this.add.graphics());
    g.fillGradientStyle(0x2b2f4a, 0x2b2f4a, 0x4b4f6e, 0x4b4f6e, 1).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0xc9bfa6).fillRect(0, 120, GAME_WIDTH, 230);
    for (let x = 40; x < GAME_WIDTH; x += 200) {
      g.fillStyle(0x6a8ab8).fillRect(x, 150, 120, 80);
      g.fillStyle(0xffffff, 0.7);
      for (let i = 0; i < 8; i++) g.fillRect(x + 8 + i * 14, 160 + (i % 3) * 20, 3, 3);
    }
    g.fillStyle(0x6a6a72).fillRect(0, 350, GAME_WIDTH, GAME_HEIGHT - 350);
    [180, 420].forEach((x) => this.add2(this.add.image(x + CX, 350, TEX.DESK)).setOrigin(0.5, 1).setScale(1.5));
    this.add2(this.add.image(660 + CX, 350, TEX.XMAS_TREE)).setOrigin(0.5, 1).setScale(1.6);
    this.add2(this.add.text(GAME_WIDTH / 2, 50, '24 DICEMBRE, UN ANNO DOPO', style(18, '#ffffff', { strokeThickness: 5 }))).setOrigin(0.5);
    const other = CHARACTERS.find((c) => c !== GameState.character) || GameState.character;
    const hire = this.playerSprite(-30, 350, 3, other);
    this.walk(hire, other);
    this.tweens.add({ targets: hire, x: 300 + CX, duration: 2600, onComplete: () => {
      this.stopWalk(hire, other);
      const t = this.add2(this.add.text(300 + CX, 230, 'PRIMO GIORNO DI LAVORO!', style(11, '#ffe680'))).setOrigin(0.5);
      this.tweens.add({ targets: t, y: 222, duration: 400, yoyo: true, repeat: -1 });
      this.after(1600, () => {
        const end = this.add2(this.add.text(GAME_WIDTH / 2, 110, 'IL CICLO CONTINUA.', style(30, '#ffd800', { strokeThickness: 6 }))).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: end, alpha: 1, duration: 800 });
        audio.sfx('quiz');
        this.after(2400, () => this.stats('FINALE: IL NUOVO CEO'));
      });
    } });
  }

  // ---------------------------------------------------------------- 4b. Caraibi: the Teams bottle

  islandEnding() {
    this.clear();
    audio.music('island');
    const g = this.add2(this.add.graphics());
    g.fillStyle(0x5a3418).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    const paper = this.add2(this.add.container(GAME_WIDTH / 2, 230));
    paper.add(this.add.rectangle(0, 0, 300, 340, 0xffffff).setStrokeStyle(2, 0xaaaaaa));
    paper.add(this.add.text(0, -140, 'LETTERA DI DIMISSIONI', style(16, '#2a1a0a', { strokeThickness: 0 })).setOrigin(0.5));
    paper.add(this.add.text(-120, -100, 'Gentile CdA,\n\ngrazie di tutto,\nma da domani\nmi trovate ai Caraibi.\n\nCordiali saluti', style(13, '#2a2a2a', { strokeThickness: 0, lineSpacing: 6 })));
    const sign = this.add.graphics();
    paper.add(sign);
    paper.setAngle(-2).setScale(0.2);
    this.tweens.add({ targets: paper, scale: 1, duration: 500, ease: 'Back.Out' });
    // Signature squiggle drawn little by little.
    let k = 0;
    this.every({ delay: 40, repeat: 30, startAt: 0, callback: () => {
      if (k < 1) { k++; return; }
      sign.lineStyle(2, 0x1a3a9a);
      const x0 = -10 + k * 4;
      sign.lineBetween(x0, 110 + Math.sin(k) * 8, x0 + 4, 110 + Math.sin(k + 1) * 8);
      k++;
    } });
    this.after(2200, () => {
      audio.sfx('jump');
      this.tweens.add({ targets: paper, y: -300, angle: 40, duration: 700, ease: 'Quad.In',
        onComplete: () => this.flight() });
    });
  }

  flight() {
    this.clear();
    const g = this.add2(this.add.graphics());
    g.fillGradientStyle(0x3ab0f0, 0x3ab0f0, 0xbfe8ff, 0xbfe8ff, 1).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    for (let i = 0; i < 6; i++) {
      const c = this.add2(this.add.ellipse(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(60, 400), 120, 36, 0xffffff, 0.9));
      this.tweens.add({ targets: c, x: c.x - 900, duration: 3500 });
    }
    const plane = this.add2(this.add.graphics({ x: -120, y: 260 }));
    plane.fillStyle(0xffffff).fillRoundedRect(-60, -10, 120, 22, 10);
    plane.fillStyle(0xd02020).fillTriangle(-60, -10, -76, -34, -46, -10);
    plane.fillStyle(0xdddddd).fillTriangle(-10, 4, 20, 4, -24, 36);
    plane.fillStyle(0x4a8ad8);
    for (let i = 0; i < 6; i++) plane.fillRect(-36 + i * 14, -4, 7, 6);
    this.tweens.add({ targets: plane, x: GAME_WIDTH + 140, y: 160, duration: 3200, ease: 'Sine.InOut' });
    this.add2(this.add.text(GAME_WIDTH / 2, 60, 'DESTINAZIONE: CARAIBI', style(20, '#ffffff', { strokeThickness: 5 }))).setOrigin(0.5);
    this.after(3300, () => this.fadeTo(() => this.beach(), 400));
  }

  beach() {
    this.clear();
    const g = this.add2(this.add.graphics());
    g.fillGradientStyle(0x3ab0f0, 0x3ab0f0, 0xbfe8ff, 0xbfe8ff, 1).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0xfff3a0).fillCircle(GAME_WIDTH - 140, 80, 36);
    this.waves(0, 240, GAME_WIDTH, 110, 1);
    const sand = this.add2(this.add.graphics()).setDepth(3);
    sand.fillStyle(0xf0d890).fillRect(0, 330, GAME_WIDTH, GAME_HEIGHT - 330).fillEllipse(260 + CX, 334, 620 + CX * 2, 60);
    this.palm(150 + CX, 380, 1.6, 4);
    this.palm(410 + CX, 384, 1.5, 4);
    // Hammock between the palms with the player lying in it, swinging.
    const ham = this.add2(this.add.container(285 + CX, 258)).setDepth(6);
    const hg = this.add.graphics();
    hg.lineStyle(4, 0xd04040).beginPath();
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const px = -110 + t * 220;
      const py = Math.sin(t * Math.PI) * 26;
      if (i === 0) hg.moveTo(px, py); else hg.lineTo(px, py);
    }
    hg.strokePath();
    const lying = this.add.image(0, 22, ensureBeachPlayer(this, GameState.character)).setScale(2.2).setAngle(-80).setOrigin(0.5, 1);
    ham.add([lying, hg]);
    this.tweens.add({ targets: ham, angle: { from: -3, to: 3 }, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    // Coconut drink on the sand.
    const coco = this.add2(this.add.graphics({ x: 470 + CX, y: 392 })).setDepth(7);
    coco.fillStyle(0x6a4020).fillCircle(0, 0, 12).fillStyle(0xfff4dc).fillEllipse(0, -8, 18, 6);
    coco.lineStyle(2, 0xff60a0).lineBetween(2, -8, 12, -26);
    coco.fillStyle(0x3ab05a).fillTriangle(-4, -10, -14, -22, 0, -14);
    const zz = this.add2(this.add.text(300 + CX, 200, 'Finalmente un po\' di pace...', style(13, '#ffffff'))).setOrigin(0.5).setDepth(9);

    // A bottle drifts ashore... with a Teams message.
    this.after(3200, () => {
      zz.destroy();
      const b = this.bottle(GAME_WIDTH + 30, 300);
      this.tweens.add({ targets: b, angle: { from: -10, to: 10 }, duration: 500, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: b, x: 560 + CX, y: 345, duration: 2600, ease: 'Sine.Out', onComplete: () => this.message(b) });
    });
  }

  message(b) {
    audio.sfx('quiz');
    const msg = this.add2(this.add.container(GAME_WIDTH / 2, 130)).setDepth(20).setScale(0.2);
    msg.add(this.add.rectangle(0, 0, 360, 90, 0xfff4dc).setStrokeStyle(3, 0x6264a7));
    msg.add(this.add.image(-150, 0, 'teams_icon').setScale(1.6));
    msg.add(this.add.text(20, 0, 'Solo una call\ndi 5 minuti?', style(18, '#2a2a5a', { strokeThickness: 0, align: 'center' })).setOrigin(0.5));
    this.tweens.add({ targets: msg, scale: 1, duration: 400, ease: 'Back.Out' });
    this.after(2600, () => {
      this.tweens.add({ targets: msg, scale: 0, duration: 250 });
      // Thrown back into the sea.
      this.tweens.killTweensOf(b);
      audio.sfx('jump');
      this.tweens.add({ targets: b, x: GAME_WIDTH - 40, duration: 1100, ease: 'Linear' });
      this.tweens.add({ targets: b, y: 150, duration: 550, ease: 'Quad.Out', yoyo: true });
      this.tweens.add({ targets: b, angle: 720, duration: 1100 });
      this.after(1150, () => {
        audio.sfx('splash');
        b.setVisible(false);
        for (let i = 0; i < 8; i++) {
          const d = this.add2(this.add.circle(GAME_WIDTH - 40, 300, 3, 0xffffff)).setDepth(9);
          this.tweens.add({ targets: d, x: GAME_WIDTH - 40 + Phaser.Math.Between(-30, 30), y: 300 - Phaser.Math.Between(10, 40), alpha: 0, duration: 500 });
        }
        this.add2(this.add.text(GAME_WIDTH / 2, 130, '...ANCHE NO.', style(26, '#ffd800', { strokeThickness: 6 }))).setOrigin(0.5).setDepth(20);
        this.after(2200, () => this.stats('FINALE: VITA AI CARAIBI'));
      });
    });
  }

  // ---------------------------------------------------------------- 5. stats

  stats(title) {
    const panel = this.add2(this.add.rectangle(GAME_WIDTH / 2, 400, GAME_WIDTH - 60, 86, 0x000000, 0.75)).setDepth(60).setStrokeStyle(2, 0xd4af37);
    panel.setAlpha(0);
    this.tweens.add({ targets: panel, alpha: 1, duration: 400 });
    this.add2(this.add.text(GAME_WIDTH / 2, 376, title, style(13, '#ffd800'))).setOrigin(0.5).setDepth(61);
    this.add2(this.add.text(GAME_WIDTH / 2, 402,
      `SALUTE MENTALE ${Math.round(GameState.hp)}%   STRESS ${Math.round(GameState.stress)}%   ` +
      `BONUS ${GameState.euro} EUR   BUONI PASTO ${GameState.tickets}   FERIE ${GameState.vacationDays}`,
      style(10, '#ffe680'))).setOrigin(0.5).setDepth(61);
    const back = this.add2(this.add.text(GAME_WIDTH / 2, 426, 'PREMI INVIO O TOCCA PER TORNARE AL MENU', style(11, '#9be7ff'))).setOrigin(0.5).setDepth(61);
    this.tweens.add({ targets: back, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    this.waitInput(() => { audio.stopMusic(); this.scene.start('MenuScene'); }, 1200);
  }
}
