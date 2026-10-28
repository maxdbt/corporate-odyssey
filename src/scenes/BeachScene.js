import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT, TEX, playerTex, playerAnim } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';

const style = (size, color = '#ffffff', extra = {}) => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 3, ...extra
});

const SAND_Y = 300;
const FEET_Y = 404;
const MAX_TIME = 25;     // seconds: surviving this long ends the trial with the max reward
const LIVES = 3;
const HP_PER_SEC = 4;    // mental health gained per second survived (25s = +100%)

// Sun with rays 64x64, generated once.
function ensureBeachTextures(scene) {
  if (scene.textures.exists('beach_sun')) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0xffd23f);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.fillRect(32 + Math.cos(a) * 26 - 3, 32 + Math.sin(a) * 26 - 3, 6, 6);
  }
  g.fillStyle(0xffb000).fillCircle(32, 32, 18);
  g.fillStyle(0xffe680).fillCircle(32, 32, 15);
  g.fillStyle(0xfff6c0).fillRect(24, 22, 6, 4);
  g.generateTexture('beach_sun', 64, 64);
  g.destroy();
}

// Special trial (1-2 Estate): the player caught a plane ticket and is on the beach.
// Dodge the falling work e-mails: the longer you last, the more mental health you get back.
export default class BeachScene extends Phaser.Scene {
  constructor() {
    super('BeachScene');
  }

  init() {
    this.phase = 'intro';
    this.elapsed = 0;
    this.lives = LIVES;
    this.nextSpawn = 0;
    this.invulnUntil = 0;
    this.leaving = false;
    this.mails = [];
  }

  create() {
    setupStaticCamera(this);
    ensureBeachTextures(this);
    audio.sfx('powerup');
    this.drawBeach();

    // Player on the sand
    const c = GameState.character || 'man';
    this.walkAnim = playerAnim(c, 'walk');
    this.idleTex = playerTex(c, 'idle');
    this.player = this.add.sprite(GAME_WIDTH / 2, FEET_Y, this.idleTex).setOrigin(0.5, 1).setScale(2).setDepth(5);

    // HUD
    this.add.rectangle(0, 0, GAME_WIDTH, 30, 0x000000, 0.55).setOrigin(0).setDepth(20);
    this.add.text(10, 15, 'VACANZA!', style(12, '#ffd800')).setOrigin(0, 0.5).setDepth(21);
    this.timeText = this.add.text(GAME_WIDTH / 2, 15, '', style(12)).setOrigin(0.5).setDepth(21);
    this.hpText = this.add.text(GAME_WIDTH - 10, 15, '', style(12, '#9dffb0')).setOrigin(1, 0.5).setDepth(21);
    this.livesGfx = this.add.graphics().setDepth(21);
    this.add.text(120, 15, 'RELAX', style(10, '#7fd4ff')).setOrigin(0, 0.5).setDepth(21);
    this.refreshHud();

    // Intro banner
    this.banner = this.add.text(GAME_WIDTH / 2, 170,
      'HAI PRESO AL VOLO UN BIGLIETTO AEREO!\nSCHIVA LE MAIL DI LAVORO\nPIU\' RESISTI, PIU\' SALUTE MENTALE RECUPERI',
      style(15, '#ffffff', { align: 'center', strokeThickness: 5, lineSpacing: 6 })).setOrigin(0.5).setDepth(30);
    this.time.delayedCall(2600, () => {
      this.banner.setText('VIA!').setFontSize(28);
      this.phase = 'play';
      this.time.delayedCall(700, () => this.banner.setVisible(false));
    });

    // Input: arrows/A-D, touch = hold left or right half of the screen.
    const kb = this.input.keyboard;
    this.keys = kb ? kb.addKeys({ left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D' }, true, false) : null;
    if (kb) ['ENTER', 'SPACE', 'Z'].forEach((k) => kb.on(`keydown-${k}`, () => this.finish()));
    this.input.on('pointerdown', () => this.finish());
  }

  drawBeach() {
    const g = this.add.graphics();
    // Sky bands
    [0x3fa9f5, 0x5bb8f7, 0x78c6f9, 0x95d4fb, 0xb3e2fd].forEach((col, i) => g.fillStyle(col).fillRect(0, i * 46, GAME_WIDTH, 46));
    // Sun
    const sun = this.add.image(GAME_WIDTH - 120, 80, 'beach_sun').setScale(1.6);
    this.tweens.add({ targets: sun, angle: 360, duration: 12000, repeat: -1 });
    this.tweens.add({ targets: sun, scale: 1.75, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    // Clouds drifting
    for (let i = 0; i < 3; i++) {
      const cl = this.add.graphics();
      cl.fillStyle(0xffffff, 0.9).fillRect(0, 8, 60, 12).fillRect(12, 0, 30, 10).fillRect(36, 4, 18, 8);
      cl.setPosition(i * 280 + 40, 40 + i * 30);
      this.tweens.add({ targets: cl, x: cl.x + 120, duration: 9000 + i * 2000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
    // Sea with animated waves
    g.fillStyle(0x0b6fc2).fillRect(0, 230, GAME_WIDTH, 30);
    g.fillStyle(0x1088d8).fillRect(0, 260, GAME_WIDTH, 25);
    g.fillStyle(0x26a3e8).fillRect(0, 285, GAME_WIDTH, 15);
    this.waves = this.add.graphics();
    // Sand
    g.fillStyle(0xf2d38c).fillRect(0, SAND_Y, GAME_WIDTH, GAME_HEIGHT - SAND_Y);
    g.fillStyle(0xe6c070).fillRect(0, SAND_Y, GAME_WIDTH, 6);
    for (let i = 0; i < 140; i++) {
      g.fillStyle(Math.random() < 0.5 ? 0xd9b25e : 0xfbe3a8).fillRect(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(SAND_Y + 8, GAME_HEIGHT), 2, 2);
    }
    // Umbrella + towel + cocktail
    const ux = 110;
    g.fillStyle(0xe8323c).fillRect(ux - 70, FEET_Y - 4, 90, 10);
    g.fillStyle(0xffffff).fillRect(ux - 70, FEET_Y - 1, 90, 3);
    g.fillStyle(0x6b4a2b).fillRect(ux - 2, FEET_Y - 120, 4, 120);
    const stripes = [0xe8323c, 0xffffff, 0xe8323c, 0xffffff, 0xe8323c, 0xffffff];
    stripes.forEach((col, i) => {
      g.fillStyle(col);
      for (let r = 0; r < 18; r++) {
        const half = 8 + r * 3.4;
        const x0 = ux - half + (i * 2 * half) / stripes.length;
        g.fillRect(Math.round(x0), FEET_Y - 136 + r, Math.ceil((2 * half) / stripes.length), 1);
      }
    });
    g.fillStyle(0x6b4a2b).fillRect(ux - 2, FEET_Y - 142, 4, 6);
    g.fillStyle(0xffffff, 0.8).fillRect(ux + 40, FEET_Y - 14, 8, 10);
    g.fillStyle(0xff8c1a).fillRect(ux + 41, FEET_Y - 11, 6, 6);
    g.fillStyle(0x3ce05a).fillRect(ux + 46, FEET_Y - 20, 1, 8);
    // Deck chair on the right
    const dx = GAME_WIDTH - 160;
    g.fillStyle(0x6b4a2b).fillRect(dx, FEET_Y - 24, 4, 24).fillRect(dx + 60, FEET_Y - 12, 4, 12);
    g.fillStyle(0x2a6ad8).fillRect(dx, FEET_Y - 26, 66, 6);
    g.fillStyle(0x2a6ad8).fillRect(dx - 14, FEET_Y - 46, 16, 22);
  }

  drawWaves(t) {
    const w = this.waves;
    w.clear();
    w.fillStyle(0xffffff, 0.8);
    for (let row = 0; row < 3; row++) {
      const y = 240 + row * 20;
      const off = ((t / (18 + row * 6)) + row * 37) % 60;
      for (let x = -60 + off; x < GAME_WIDTH; x += 60) w.fillRect(Math.round(x), y, 18, 2);
    }
    // Foam on the shore
    w.fillStyle(0xffffff, 0.9);
    const foam = Math.sin(t / 500) * 4;
    for (let x = 0; x < GAME_WIDTH; x += 16) w.fillRect(x, SAND_Y - 2 + foam + ((x / 16) % 2) * 2, 10, 3);
  }

  reward() { return Math.min(100, Math.floor(this.elapsed) * HP_PER_SEC); }

  refreshHud() {
    const t = Math.floor(this.elapsed);
    this.timeText.setText(`RESISTI: ${t}s / ${MAX_TIME}s`);
    this.hpText.setText(`SALUTE +${this.reward()}%`);
    const g = this.livesGfx;
    g.clear();
    for (let i = 0; i < LIVES; i++) {
      g.fillStyle(0x000000).fillRect(166 + i * 18, 7, 14, 16);
      g.fillStyle(i < this.lives ? 0xffd23f : 0x444444).fillRect(168 + i * 18, 9, 10, 12);
    }
  }

  spawnMail() {
    const p = Phaser.Math.Clamp(this.elapsed / MAX_TIME, 0, 1);
    const urgent = Math.random() < 0.15 + p * 0.25;
    // A growing share of mails is aimed at the player, so standing still stops working.
    const aimed = Math.random() < 0.2 + p * 0.4;
    const x = aimed ? Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-40, 40), 20, GAME_WIDTH - 20) : Phaser.Math.Between(20, GAME_WIDTH - 20);
    const m = this.add.image(x, -12, TEX.MAIL).setScale(2.2).setDepth(6);
    if (urgent) m.setTint(0xff5050);
    m.vy = (140 + p * 200) * (urgent ? 1.35 : 1) + Math.random() * 40;
    m.vx = Phaser.Math.Between(-30, 30);
    m.wobble = Math.random() * Math.PI * 2;
    this.mails.push(m);
  }

  update(time, delta) {
    this.drawWaves(time);
    const dt = delta / 1000;
    if (this.phase !== 'play') return;

    this.elapsed += dt;

    // Movement
    const k = this.keys;
    let dir = 0;
    if (k && (k.left.isDown || k.a.isDown)) dir -= 1;
    if (k && (k.right.isDown || k.d.isDown)) dir += 1;
    const ptr = this.input.activePointer;
    if (ptr.isDown) dir = ptr.x / this.cameras.main.zoom < GAME_WIDTH / 2 ? -1 : 1;
    this.player.x = Phaser.Math.Clamp(this.player.x + dir * 240 * dt, 20, GAME_WIDTH - 20);
    if (dir) {
      this.player.setFlipX(dir < 0);
      if (this.anims.exists(this.walkAnim)) this.player.play(this.walkAnim, true);
    } else {
      this.player.stop();
      this.player.setTexture(this.idleTex);
    }
    this.player.setAlpha(time < this.invulnUntil && Math.floor(time / 80) % 2 ? 0.4 : 1);

    // Spawning gets faster over time
    if (time > this.nextSpawn) {
      const p = Phaser.Math.Clamp(this.elapsed / MAX_TIME, 0, 1);
      // Interval shrinks steadily (600ms -> 110ms) and extra mails join in as time goes on.
      this.spawnMail();
      if (Math.random() < p * 0.8) this.spawnMail();
      if (p > 0.6 && Math.random() < p - 0.5) this.spawnMail();
      this.nextSpawn = time + Phaser.Math.Linear(600, 110, p);
    }

    // Falling mails + collisions
    const pb = new Phaser.Geom.Rectangle(this.player.x - 10, FEET_Y - 44, 20, 42);
    this.mails = this.mails.filter((m) => {
      m.wobble += dt * 4;
      m.y += m.vy * dt;
      m.x += (m.vx + Math.sin(m.wobble) * 40) * dt;
      if (time > this.invulnUntil && Phaser.Geom.Rectangle.Contains(pb, m.x, m.y)) {
        this.hitByMail(m, time);
        return false;
      }
      if (m.y > FEET_Y) {
        this.splash(m.x);
        m.destroy();
        return false;
      }
      return true;
    });

    this.refreshHud();
    if (this.elapsed >= MAX_TIME) this.endTrial(true);
  }

  splash(x) {
    for (let i = 0; i < 4; i++) {
      const s = this.add.rectangle(x, FEET_Y - 2, 2, 2, 0xd9b25e).setDepth(4);
      this.tweens.add({ targets: s, x: x + Phaser.Math.Between(-12, 12), y: FEET_Y - Phaser.Math.Between(6, 14), alpha: 0, duration: 300, onComplete: () => s.destroy() });
    }
  }

  hitByMail(m, time) {
    m.destroy();
    this.lives -= 1;
    this.invulnUntil = time + 1000;
    audio.sfx('hurt');
    this.cameras.main.shake(150, 0.006);
    const t = this.add.text(this.player.x, FEET_Y - 60, Phaser.Utils.Array.GetRandom(['RE: URGENTE', 'FW: FW: FW:', 'SEI REPERIBILE?', 'CALL VELOCE?']),
      style(10, '#ff6060')).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 900, onComplete: () => t.destroy() });
    this.refreshHud();
    if (this.lives <= 0) this.endTrial(false);
  }

  endTrial(survived) {
    if (this.phase !== 'play') return;
    this.phase = 'result';
    this.player.stop();
    this.player.setTexture(this.idleTex).setAlpha(1);
    this.mails.forEach((m) => m.destroy());
    this.mails = [];
    const hp = this.reward();
    const stressDown = Math.min(50, Math.floor(this.elapsed));
    this.result = { hp, stressDown };
    audio.sfx(survived ? 'victory' : 'checkpoint');

    const cx = GAME_WIDTH / 2;
    this.add.rectangle(cx, 200, 460, 170, 0x000000, 0.75).setStrokeStyle(3, 0xffd800).setDepth(40);
    this.add.text(cx, 140, survived ? 'VACANZA PERFETTA!' : 'TI HANNO RICHIAMATO IN UFFICIO...',
      style(16, survived ? '#ffd800' : '#ff8080')).setOrigin(0.5).setDepth(41);
    this.add.text(cx, 192, `Hai resistito ${Math.floor(this.elapsed)} secondi\nSALUTE MENTALE +${hp}%\nSTRESS -${stressDown}%`,
      style(14, '#ffffff', { align: 'center', lineSpacing: 6 })).setOrigin(0.5).setDepth(41);
    const hint = this.add.text(cx, 262, 'INVIO / TOCCA per tornare in ufficio', style(10, '#9be7ff')).setOrigin(0.5).setDepth(41);
    this.tweens.add({ targets: hint, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
    this.readyAt = this.time.now + 600;
  }

  finish() {
    if (this.phase !== 'result' || this.leaving || this.time.now < this.readyAt) return;
    this.leaving = true;
    GameState.addHp(this.result.hp);
    GameState.addStress(-this.result.stressDown);
    const gs = this.scene.get('GameScene');
    this.scene.resume('GameScene');
    gs.ui?.message?.(`BENTORNATO! SALUTE +${this.result.hp}%`, '#9dffb0', 2000);
    this.scene.stop();
  }
}
