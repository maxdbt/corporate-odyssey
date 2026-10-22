import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT, TEX, playerTex, playerAnim } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';

const style = (size, color = '#ffffff', extra = {}) => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 3, ...extra
});

const FLOOR_Y = 390;
const DOOR_W = 92;
const DOOR_H = 170;
const DOOR_X = [220, 400, 580];
const URGENCY_S = 10;

// What hides behind each door. hp/stress/timer are applied to the game when the trial ends.
const OUTCOMES = {
  toilet: { title: 'SOLLIEVO DIVINO!', color: '#9dffb0', hp: 30, stress: -40, timer: 0 },
  monster: { title: 'IL MOSTRO DEL BAGNO TI HA MANGIATO!', color: '#ff8080', hp: -30, stress: 20, timer: 0 },
  hole: { title: 'RISUCCHIATO DA UN BUCO NERO!', color: '#c0a0ff', hp: -15, stress: 15, timer: -20 },
  late: { title: 'TROPPO TARDI...', color: '#ffb000', hp: 0, stress: 30, timer: 0 }
};

// Toilet, monster and black-hole textures, generated once.
export function ensureToiletTextures(scene) {
  if (scene.textures.exists('wc_toilet')) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  // Shiny white toilet 40x48
  g.fillStyle(0xd8e4ec).fillRect(4, 0, 32, 16);
  g.fillStyle(0xffffff).fillRect(6, 2, 28, 12);
  g.fillStyle(0xd8e4ec).fillRect(2, 18, 36, 6);
  g.fillStyle(0xffffff).fillRect(0, 22, 40, 10).fillRect(6, 32, 28, 6).fillRect(12, 38, 16, 10);
  g.fillStyle(0xbfd0dc).fillRect(4, 26, 32, 3).fillRect(12, 44, 16, 4);
  g.fillStyle(0xc0c0c0).fillRect(28, 4, 5, 2);
  g.generateTexture('wc_toilet', 40, 48);
  g.clear();
  // Monster 64x72: green blob with a huge mouth
  g.fillStyle(0x1f6b2a).fillRect(4, 10, 56, 62).fillRect(10, 2, 44, 10);
  g.fillStyle(0x3fbf4a).fillRect(8, 12, 48, 56).fillRect(14, 6, 36, 8);
  g.fillStyle(0xffffff).fillRect(14, 16, 12, 12).fillRect(38, 16, 12, 12);
  g.fillStyle(0xff2020).fillRect(18, 20, 6, 6).fillRect(42, 20, 6, 6);
  g.fillStyle(0x400010).fillRect(12, 34, 40, 28);
  g.fillStyle(0xffffff);
  for (let x = 12; x < 52; x += 8) { g.fillTriangle(x, 34, x + 8, 34, x + 4, 42); g.fillTriangle(x, 62, x + 8, 62, x + 4, 54); }
  g.fillStyle(0xd04060).fillRect(22, 50, 20, 6);
  g.generateTexture('wc_monster', 64, 72);
  g.clear();
  // Black hole 80x80: concentric rings
  [[40, 0x2a0a4a], [32, 0x4a1a7a], [24, 0x7a3ab0], [16, 0x22052e], [12, 0x000000]].forEach(([r, c]) => g.fillStyle(c).fillCircle(40, 40, r));
  g.fillStyle(0xc080ff);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    g.fillRect(40 + Math.cos(a) * 28 - 2, 40 + Math.sin(a) * 28 - 1, 4, 2);
  }
  g.generateTexture('wc_hole', 80, 80);
  g.destroy();
}

// Special trial (2-1 Mensa): after the mysterious stew, pick the only working toilet out of three doors.
export default class ToiletScene extends Phaser.Scene {
  constructor() {
    super('ToiletScene');
  }

  init() {
    this.phase = 'intro';
    this.sel = 1;
    this.leaving = false;
    this.urgency = URGENCY_S;
    // Shuffle what is behind the doors every time.
    this.behind = Phaser.Utils.Array.Shuffle(['toilet', 'monster', 'hole']);
  }

  create() {
    setupStaticCamera(this);
    ensureToiletTextures(this);
    audio.sfx('alarm');
    this.drawRoom();

    const c = GameState.character || 'man';
    this.walkAnim = playerAnim(c, 'walk');
    this.idleTex = playerTex(c, 'idle');
    this.player = this.add.sprite(DOOR_X[1], FLOOR_Y + 30, this.idleTex).setOrigin(0.5, 1).setScale(2.2).setDepth(10).setTint(0xd0ffb0);

    // HUD: urgency bar
    this.add.rectangle(0, 0, GAME_WIDTH, 30, 0x101418, 1).setOrigin(0).setDepth(20);
    this.add.text(10, 15, 'MAL DI PANCIA!', style(12, '#b8f070')).setOrigin(0, 0.5).setDepth(21);
    this.add.text(GAME_WIDTH - 230, 15, 'RESISTI', style(10, '#ffb000')).setOrigin(0, 0.5).setDepth(21);
    this.bar = this.add.graphics().setDepth(21);

    this.banner = this.add.text(GAME_WIDTH / 2, 60, 'SOLO UN BAGNO FUNZIONA!\nSCEGLI LA PORTA GIUSTA',
      style(15, '#ffffff', { align: 'center', strokeThickness: 5, lineSpacing: 4 })).setOrigin(0.5).setDepth(30);
    this.hint = this.add.text(GAME_WIDTH / 2, 438, 'SINISTRA/DESTRA scegli  -  INVIO/SU apri  -  oppure TOCCA una porta',
      style(9, '#cccccc')).setOrigin(0.5).setDepth(30);
    this.time.delayedCall(1200, () => { this.phase = 'choose'; });

    const kb = this.input.keyboard;
    if (kb) {
      ['LEFT', 'A'].forEach((k) => kb.on(`keydown-${k}`, () => this.move(-1)));
      ['RIGHT', 'D'].forEach((k) => kb.on(`keydown-${k}`, () => this.move(1)));
      ['ENTER', 'SPACE', 'UP', 'W', 'Z'].forEach((k) => kb.on(`keydown-${k}`, () => (this.phase === 'result' ? this.finish() : this.open(this.sel))));
    }
    this.input.on('pointerdown', () => { if (this.phase === 'result') this.finish(); });
  }

  drawRoom() {
    const g = this.add.graphics();
    g.fillStyle(0x000000).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Tiled wall and floor
    for (let x = 0; x < GAME_WIDTH; x += 20) for (let y = 30; y < FLOOR_Y; y += 20) {
      g.fillStyle(((x + y) / 20) % 2 ? 0xbfe4e8 : 0xd8f0f2).fillRect(x, y, 19, 19);
    }
    g.fillStyle(0x6a8a90).fillRect(0, FLOOR_Y, GAME_WIDTH, GAME_HEIGHT - FLOOR_Y);
    for (let x = 0; x < GAME_WIDTH; x += 40) g.fillStyle(x % 80 ? 0x587880 : 0x7a9aa0).fillRect(x, FLOOR_Y, 40, 6);
    // Flickering ceiling light
    g.fillStyle(0xffffff, 0.8).fillRect(GAME_WIDTH / 2 - 60, 34, 120, 6);
    // Sink and mirror on the far right, "WC" sign on the left
    g.fillStyle(0x9aa6ae).fillRect(704, 150, 70, 90);
    g.fillStyle(0xcfefff).fillRect(708, 154, 62, 82);
    g.fillStyle(0xffffff).fillRect(696, 260, 86, 14).fillRect(730, 274, 18, 50);
    g.fillStyle(0x2a3a8a).fillRect(40, 120, 60, 40);
    this.add.text(70, 140, 'WC', style(18)).setOrigin(0.5);

    // Stalls: partitions + doors with numbers
    this.doors = DOOR_X.map((x, i) => {
      g.fillStyle(0x4a5a8a).fillRect(x - DOOR_W / 2 - 10, FLOOR_Y - DOOR_H - 14, 8, DOOR_H + 14);
      g.fillStyle(0x4a5a8a).fillRect(x + DOOR_W / 2 + 2, FLOOR_Y - DOOR_H - 14, 8, DOOR_H + 14);
      g.fillStyle(0x10141e).fillRect(x - DOOR_W / 2, FLOOR_Y - DOOR_H, DOOR_W, DOOR_H);
      const door = this.add.container(x - DOOR_W / 2, FLOOR_Y - DOOR_H).setDepth(5);
      const panel = this.add.rectangle(0, 0, DOOR_W, DOOR_H - 10, 0x6a7ab8).setOrigin(0).setStrokeStyle(3, 0x2a3a6a);
      const num = this.add.text(DOOR_W / 2, 40, String(i + 1), style(22, '#ffd800')).setOrigin(0.5);
      const knob = this.add.rectangle(DOOR_W - 14, DOOR_H / 2, 6, 10, 0xd0d0d0);
      const tag = this.add.rectangle(DOOR_W / 2, 74, 40, 12, 0x30c040);
      const tagText = this.add.text(DOOR_W / 2, 74, 'LIBERO', style(7, '#ffffff', { strokeThickness: 2 })).setOrigin(0.5);
      door.add([panel, num, knob, tag, tagText]);
      const hit = this.add.zone(x, FLOOR_Y - DOOR_H / 2, DOOR_W, DOOR_H).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => {
        if (this.phase !== 'choose') return;
        this.sel = i;
        this.open(i);
      });
      return { x, door, panel };
    });
    this.selGfx = this.add.graphics().setDepth(6);
  }

  move(d) {
    if (this.phase !== 'choose') return;
    this.sel = Phaser.Math.Clamp(this.sel + d, 0, 2);
    audio.sfx('select');
  }

  update(time, delta) {
    if (this.phase === 'choose' || this.phase === 'intro') {
      // Walk towards the selected door, legs crossed (shaking).
      const tx = DOOR_X[this.sel];
      const dx = tx - this.player.x;
      if (Math.abs(dx) > 3) {
        this.player.x += Math.sign(dx) * Math.min(Math.abs(dx), 300 * delta / 1000);
        this.player.setFlipX(dx < 0);
        if (this.anims.exists(this.walkAnim)) this.player.play(this.walkAnim, true);
      } else {
        this.player.stop();
        this.player.setTexture(this.idleTex);
        this.player.x = tx + Math.sin(time / 30);
      }
      this.selGfx.clear().lineStyle(3, 0xffd800, Math.floor(time / 200) % 2 ? 1 : 0.4)
        .strokeRect(tx - DOOR_W / 2 - 4, FLOOR_Y - DOOR_H - 4, DOOR_W + 8, DOOR_H + 4);
    }
    if (this.phase === 'choose') {
      this.urgency -= delta / 1000;
      if (this.urgency <= 0) { this.urgency = 0; this.showResult('late'); }
    }
    const w = 200 * Phaser.Math.Clamp(this.urgency / URGENCY_S, 0, 1);
    this.bar.clear().fillStyle(0x000000).fillRect(GAME_WIDTH - 172, 8, 164, 14)
      .fillStyle(w > 70 ? 0xb8f070 : 0xff4040).fillRect(GAME_WIDTH - 170, 10, w * 0.8, 10);
  }

  open(i) {
    if (this.phase !== 'choose') return;
    this.phase = 'reveal';
    this.selGfx.clear();
    this.banner.setVisible(false);
    this.hint.setVisible(false);
    const d = this.doors[i];
    const what = this.behind[i];
    audio.sfx('quiz');
    this.player.stop();
    this.player.setTexture(this.idleTex).setX(d.x);
    // Door swings open
    this.tweens.add({ targets: d.door, scaleX: 0.08, duration: 350, ease: 'Sine.In' });
    this.time.delayedCall(400, () => this[`reveal_${what}`](d.x));
  }

  reveal_toilet(x) {
    const wc = this.add.image(x, FLOOR_Y - 4, 'wc_toilet').setOrigin(0.5, 1).setScale(1.6).setDepth(4);
    const glow = this.add.circle(x, FLOOR_Y - 50, 50, 0xffffff, 0.25).setDepth(3);
    this.tweens.add({ targets: glow, scale: 1.4, alpha: 0.05, duration: 600, yoyo: true, repeat: -1 });
    this.add.particles(0, 0, TEX.FX_SPARK, {
      x: { min: x - 40, max: x + 40 }, y: { min: FLOOR_Y - 120, max: FLOOR_Y - 20 }, lifespan: 700, frequency: 60,
      scale: { start: 1.5, end: 0 }, tint: [0xffffff, 0xfff6a0, 0x9be7ff]
    }).setDepth(6);
    audio.sfx('powerup');
    this.floatText(x, FLOOR_Y - DOOR_H - 20, 'AAAAH...', '#ffffff');
    this.tweens.add({ targets: wc, scale: 1.75, duration: 300, yoyo: true, repeat: 1 });
    this.time.delayedCall(700, () => {
      this.player.clearTint();
      this.tweens.add({ targets: this.player, alpha: 0, y: FLOOR_Y + 10, duration: 400 });
    });
    this.time.delayedCall(1500, () => this.showResult('toilet'));
  }

  reveal_monster(x) {
    const m = this.add.image(x, FLOOR_Y, 'wc_monster').setOrigin(0.5, 1).setScale(0.3).setDepth(11);
    audio.sfx('hurt');
    this.tweens.add({ targets: m, scale: 2, duration: 300, ease: 'Back.Out' });
    this.floatText(x, FLOOR_Y - DOOR_H - 20, 'GRAAAWR!', '#ff4040');
    this.cameras.main.shake(400, 0.012);
    this.time.delayedCall(450, () => {
      this.tweens.add({ targets: this.player, y: FLOOR_Y - 60, scale: 0.4, alpha: 0, duration: 350, ease: 'Sine.In' });
      this.floatText(x, FLOOR_Y - 150, 'GNAM!', '#ffffff');
      this.tweens.add({ targets: m, scaleY: 1.7, duration: 120, yoyo: true, repeat: 3, delay: 300 });
    });
    this.time.delayedCall(1700, () => this.showResult('monster'));
  }

  reveal_hole(x) {
    const cy = FLOOR_Y - DOOR_H / 2;
    const hole = this.add.image(x, cy, 'wc_hole').setScale(0.2).setDepth(4);
    this.tweens.add({ targets: hole, scale: 1.3, duration: 400, ease: 'Back.Out' });
    this.tweens.add({ targets: hole, angle: 360, duration: 900, repeat: -1 });
    this.add.particles(0, 0, TEX.FX_PX, {
      emitZone: { type: 'edge', source: new Phaser.Geom.Circle(x, cy, 140), quantity: 24 },
      moveToX: x, moveToY: cy, lifespan: 700, frequency: 30, scale: { start: 2, end: 0.5 }, tint: [0xc080ff, 0xffffff]
    }).setDepth(6);
    audio.sfx('freeze');
    this.floatText(x, FLOOR_Y - DOOR_H - 20, 'VOOOOM!', '#c0a0ff');
    this.time.delayedCall(400, () => {
      this.tweens.add({ targets: this.player, x, y: cy + 20, scale: 0, angle: 720, duration: 900, ease: 'Sine.In' });
    });
    this.time.delayedCall(1700, () => this.showResult('hole'));
  }

  floatText(x, y, text, color) {
    const t = this.add.text(x, y, text, style(14, color)).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: t, y: y - 30, alpha: 0, delay: 500, duration: 700, onComplete: () => t.destroy() });
  }

  showResult(key) {
    if (this.phase === 'result') return;
    this.phase = 'result';
    this.selGfx.clear();
    this.banner.setVisible(false);
    this.hint.setVisible(false);
    const o = OUTCOMES[key];
    this.result = o;
    audio.sfx(key === 'toilet' ? 'victory' : 'gameover');
    const lines = [];
    if (o.hp) lines.push(`SALUTE MENTALE ${o.hp > 0 ? '+' : ''}${o.hp}%`);
    if (o.stress) lines.push(`STRESS ${o.stress > 0 ? '+' : ''}${o.stress}%`);
    if (o.timer) lines.push(`TEMPO ${o.timer} SECONDI`);
    if (key !== 'toilet') lines.push(`(il bagno giusto era il numero ${this.behind.indexOf('toilet') + 1})`);
    const cx = GAME_WIDTH / 2;
    this.add.rectangle(cx, 200, 480, 160, 0x000000, 0.8).setStrokeStyle(3, 0xffd800).setDepth(40);
    this.add.text(cx, 145, o.title, style(15, o.color)).setOrigin(0.5).setDepth(41);
    this.add.text(cx, 198, lines.join('\n'), style(12, '#ffffff', { align: 'center', lineSpacing: 5 })).setOrigin(0.5).setDepth(41);
    const hint = this.add.text(cx, 260, 'INVIO / TOCCA per tornare in mensa', style(10, '#9be7ff')).setOrigin(0.5).setDepth(41);
    this.tweens.add({ targets: hint, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    this.readyAt = this.time.now + 700;
  }

  finish() {
    if (this.phase !== 'result' || this.leaving || this.time.now < this.readyAt) return;
    this.leaving = true;
    const o = this.result;
    GameState.addHp(o.hp);
    GameState.addStress(o.stress);
    const gs = this.scene.get('GameScene');
    if (o.timer && gs) gs.timeLeft = Math.max(1, gs.timeLeft + o.timer);
    this.scene.resume('GameScene');
    gs?.ui?.message?.(o.hp > 0 ? 'CHE SOLLIEVO!' : 'TORNI IN MENSA...', o.color, 1800);
    this.scene.stop();
  }
}
