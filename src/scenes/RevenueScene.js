import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, playerTex } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { makeTex } from '../gfx/painter.js';
import { tstyle, resultPanel, effectLines } from '../ui/TripUI.js';

const MAX_TIME = 35;      // seconds of flight
const CHASE_LAST = 10;    // in the last seconds some C bubbles home in on the ship ("costi nascosti")
const TOP = 70;           // play field below the HUD
const BOTTOM = GAME_HEIGHT - 16;
const SPEED = 270;        // ship speed px/s
const EURO_PER_R = 5;
const SHOT_SPEED = 560;
const SHOT_COOLDOWN = 220; // ms between shots while fire is held
const GAUGE = 15;         // EBITDA shown on the gauge from -GAUGE to +GAUGE M€
const FIRE_X = GAME_WIDTH - 60; // touch FUOCO button
const FIRE_Y = GAME_HEIGHT - 60;
const onFire = (ptr) => Phaser.Math.Distance.Between(ptr.worldX, ptr.worldY, FIRE_X, FIRE_Y) < 50;
const COSTS = ['CONSULENZE!', 'AFFITTO!', 'LICENZE!', 'TRASFERTE!', 'CATERING!', 'BONUS MANAGER!', 'RIORGANIZZAZIONE!'];
const REVENUES = ['VENDITE!', 'NUOVO CLIENTE!', 'RINNOVO!', 'UPSELLING!'];

// Outcome by final EBITDA (M€). euro = bonus on top of the euro collected from the R bubbles.
function outcome(e) {
  if (e >= 12) return { title: 'TRIMESTRALE RECORD!', color: '#3cf0a0', text: ['Il CdA brinda ai tuoi numeri.'], euro: 50, hp: 20 };
  if (e > 0) return { title: 'UTILE IN CRESCITA', color: '#9dffb0', text: ['Margini positivi: ottimo lavoro.'], euro: 20 };
  if (e === 0) return { title: 'IN PAREGGIO', color: '#ffd800', text: ['Né utili né perdite. Il CFO sbadiglia.'] };
  return { title: 'PROFIT WARNING!', color: '#ff6060', text: ['I costi hanno mangiato i ricavi.'], stress: 20 };
}

function ensureRevenueTextures(scene) {
  if (scene.textures.exists('rev_ship')) return;
  // Bubbles 36x36: translucent sphere with a ring, a shine and the letter.
  const bubble = (letter, col, dark, angry) => (p) => {
    p.disc(18, 18, 16, col, 0.28).ring(18, 18, 17, 2, col).r(9, 8, 4, 2, 0xffffff, 0.8).r(8, 10, 2, 3, 0xffffff, 0.6);
    p.text(letter, 14, 12, dark, 3).text(letter, 13, 11, 0xffffff, 3);
    if (angry) p.r(10, 7, 4, 1, dark).r(13, 8, 2, 1, dark).r(22, 7, 4, 1, dark).r(21, 8, 2, 1, dark);
  };
  makeTex(scene, 'rev_r', 36, 36, bubble('R', 0x3ce05a, 0x0a6a2a));
  makeTex(scene, 'rev_c', 36, 36, bubble('C', 0xff4a4a, 0x8a0a0a));
  makeTex(scene, 'rev_cx', 36, 36, bubble('C', 0xb01a5a, 0x3a0010, true));
  // Spaceship 52x28 (nose to the right): white and gold hull, red fins, glass dome cut-out for the pilot.
  makeTex(scene, 'rev_ship', 52, 28, (p) => {
    p.r(8, 12, 36, 12, 0xe8e8f0).r(44, 14, 4, 8, 0xe8e8f0).r(48, 16, 3, 4, 0xd4af37);
    p.r(8, 22, 36, 2, 0xb0b0c0).r(12, 16, 28, 2, 0xd4af37);
    p.r(4, 6, 10, 8, 0xd02020).r(2, 4, 6, 4, 0xd02020).r(4, 22, 12, 6, 0xd02020);
    p.r(0, 14, 8, 8, 0x5a5a6a).r(2, 15, 4, 6, 0x2a2a3a);
    p.r(36, 18, 3, 3, 0x3a8aff).r(30, 18, 3, 3, 0x3a8aff);
  });
  // Exhaust flame 16x10.
  makeTex(scene, 'rev_flame', 16, 10, (p) => {
    p.r(6, 1, 10, 8, 0xff8020).r(2, 3, 14, 4, 0xffd23f).r(10, 4, 6, 2, 0xffffff);
  });
  // Laser shot 14x4.
  makeTex(scene, 'rev_shot', 14, 4, (p) => {
    p.r(0, 1, 14, 2, 0xffd800).r(4, 0, 10, 4, 0xfff3a0, 0.6).r(8, 1, 6, 2, 0xffffff);
  });
}

// "Caccia ai Ricavi" (5-1 Finance backdoor): a spaceship in a field of bubbles. R = ricavi (euro, EBITDA up),
// C = costi (EBITDA down); in the last seconds some costs chase you. The final EBITDA decides the bonus.
export default class RevenueScene extends Phaser.Scene {
  constructor() {
    super('RevenueScene');
  }

  init() {
    this.phase = 'intro';
    this.elapsed = 0;
    this.ebitda = 0;
    this.revenue = 0;
    this.nR = 0;
    this.nC = 0;
    this.nextSpawn = 0;
    this.bubbles = [];
    this.shots = [];
    this.nextShot = 0;
    this.nCut = 0;
    this.leaving = false;
    this.hitUntil = 0;
  }

  create() {
    setupStaticCamera(this);
    ensureRevenueTextures(this);
    audio.music('space');
    this.drawSpace();

    // Ship with the pilot's head under the glass dome.
    const head = this.add.image(10, -17, playerTex(GameState.character || 'man', 'idle')).setOrigin(0.5, 0).setCrop(0, 0, 24, 13).setScale(0.8);
    const dome = this.add.graphics();
    dome.fillStyle(0x9be7ff, 0.35).fillCircle(10, -9, 10).lineStyle(2, 0xd4af37).strokeCircle(10, -9, 10);
    this.flame = this.add.image(-30, 4, 'rev_flame');
    this.tweens.add({ targets: this.flame, scaleX: 1.5, duration: 90, yoyo: true, repeat: -1 });
    this.ship = this.add.container(150, (TOP + BOTTOM) / 2, [this.flame, this.add.image(0, 4, 'rev_ship').setScale(1.1), head, dome]).setDepth(10);

    this.drawHud();
    this.banner = this.add.text(GAME_WIDTH / 2, 210,
      'CACCIA AI RICAVI!\nPRENDI LE BOLLE R (RICAVI), EVITA LE C (COSTI)\nSPAZIO / C PER SPARARE AI COSTI (NON AI RICAVI!)\nL\'EBITDA DECIDE IL TUO BONUS',
      tstyle(15, '#ffffff', { align: 'center', strokeThickness: 5, lineSpacing: 6 })).setOrigin(0.5).setDepth(40);
    this.time.delayedCall(2800, () => {
      this.banner.setText('DECOLLO!').setFontSize(28);
      this.phase = 'play';
      this.time.delayedCall(700, () => this.banner.setVisible(false));
    });

    const kb = this.input.keyboard;
    // Touch: a FUOCO button in the bottom-right corner (the other finger steers).
    this.touch = this.sys.game.device.input.touch;
    if (this.touch) {
      this.input.addPointer(1);
      this.add.circle(FIRE_X, FIRE_Y, 34, 0xd02020, 0.45).setStrokeStyle(3, 0xffd800).setDepth(35);
      this.add.text(FIRE_X, FIRE_Y, 'FUOCO', tstyle(11, '#ffffff')).setOrigin(0.5).setDepth(36);
    }
    this.keys = kb ? kb.addKeys({ up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT', w: 'W', s: 'S', a: 'A', d: 'D', space: 'SPACE', c: 'C', q: 'Q' }, true, false) : null;
  }

  // ---------------------------------------------------------------- scenery & HUD

  drawSpace() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x0a0a2a, 0x0a0a2a, 0x2a0a4a, 0x2a0a4a, 1).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // A far-away golden skyscraper planet.
    g.fillStyle(0x3a2a6a).fillCircle(640, 330, 90).fillStyle(0x4a3a8a).fillCircle(620, 310, 70);
    g.lineStyle(3, 0xd4af37, 0.6).strokeEllipse(640, 330, 260, 40);
    // Parallax stars: two layers moving left.
    this.stars = [];
    for (let i = 0; i < 70; i++) {
      const far = i % 2 === 0;
      const s = this.add.rectangle(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(TOP, GAME_HEIGHT), far ? 1 : 2, far ? 1 : 2,
        0xffffff, far ? 0.5 : 0.9);
      s.v = far ? 40 : 110;
      this.stars.push(s);
    }
  }

  drawHud() {
    this.add.rectangle(0, 0, GAME_WIDTH, TOP - 6, 0x000000, 0.6).setOrigin(0).setDepth(20);
    this.add.text(12, 14, 'CACCIA AI RICAVI', tstyle(12, '#ffd800')).setDepth(21);
    this.timeText = this.add.text(12, 36, '', tstyle(11, '#9be7ff')).setDepth(21);
    this.revText = this.add.text(250, 14, '', tstyle(11, '#9dffb0')).setDepth(21);
    this.countText = this.add.text(250, 36, '', tstyle(10, '#ffffff')).setDepth(21);
    // EBITDA gauge: half dial from red (left) to green (right), needle from the centre.
    this.gx = 690;
    this.gy = 58;
    const g = this.add.graphics().setDepth(21);
    const cols = [0xd02020, 0xff6a20, 0xffd800, 0x9de040, 0x3ce05a];
    cols.forEach((c, i) => {
      g.lineStyle(10, c).beginPath();
      g.arc(this.gx, this.gy, 40, Math.PI + (i / 5) * Math.PI, Math.PI + ((i + 1) / 5) * Math.PI);
      g.strokePath();
    });
    g.fillStyle(0xffffff).fillCircle(this.gx, this.gy, 4);
    this.add.text(this.gx - 108, 14, 'EBITDA', tstyle(12, '#ffffff')).setDepth(21);
    this.ebitdaText = this.add.text(this.gx - 108, 34, '', tstyle(13, '#ffffff')).setDepth(21);
    this.needle = this.add.graphics().setDepth(22);
    this.needleA = Math.PI * 1.5;
    this.refreshHud();
  }

  refreshHud() {
    this.timeText.setText(`TEMPO ${Math.max(0, Math.ceil(MAX_TIME - this.elapsed))}s`);
    this.revText.setText(`RICAVI +${this.revenue} €`);
    this.countText.setText(`R ${this.nR}   C ${this.nC}`);
    const e = this.ebitda;
    this.ebitdaText.setText(`${e > 0 ? '+' : ''}${e} M€`).setColor(e > 0 ? '#3cf0a0' : e < 0 ? '#ff6060' : '#ffd800');
  }

  drawNeedle(dt) {
    const target = Math.PI + ((Phaser.Math.Clamp(this.ebitda, -GAUGE, GAUGE) + GAUGE) / (2 * GAUGE)) * Math.PI;
    this.needleA += (target - this.needleA) * Math.min(1, dt * 6);
    const n = this.needle;
    n.clear().lineStyle(3, 0xffffff).lineBetween(this.gx, this.gy, this.gx + Math.cos(this.needleA) * 34, this.gy + Math.sin(this.needleA) * 34);
  }

  // ---------------------------------------------------------------- play

  spawnBubble() {
    const p = Phaser.Math.Clamp(this.elapsed / MAX_TIME, 0, 1);
    const isR = Math.random() < Phaser.Math.Linear(0.62, 0.45, p);
    const chaser = !isR && MAX_TIME - this.elapsed <= CHASE_LAST && Math.random() < 0.45;
    const y = Phaser.Math.Between(TOP + 20, BOTTOM - 20);
    const b = this.add.image(GAME_WIDTH + 24, y, isR ? 'rev_r' : chaser ? 'rev_cx' : 'rev_c').setDepth(8);
    b.kind = isR ? 'R' : 'C';
    b.chaser = chaser;
    b.baseY = y;
    b.vx = chaser ? -130 : -(150 + p * 110) * Phaser.Math.FloatBetween(0.85, 1.15);
    b.phase = Math.random() * Math.PI * 2;
    b.amp = Phaser.Math.Between(10, 30);
    if (chaser) this.tweens.add({ targets: b, scale: 1.15, duration: 250, yoyo: true, repeat: -1 });
    this.bubbles.push(b);
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.stars.forEach((s) => { s.x -= s.v * dt * (this.phase === 'result' ? 0.2 : 1); if (s.x < 0) s.x += GAME_WIDTH; });
    this.drawNeedle(dt);
    if (this.phase !== 'play') return;
    this.elapsed += dt;

    // Ship: arrows / WASD, or follow the finger / mouse while pressed.
    const k = this.keys;
    let dx = 0;
    let dy = 0;
    if (k) {
      if (k.left.isDown || k.a.isDown) dx -= 1;
      if (k.right.isDown || k.d.isDown) dx += 1;
      if (k.up.isDown || k.w.isDown) dy -= 1;
      if (k.down.isDown || k.s.isDown) dy += 1;
    }
    const pointers = [this.input.mousePointer, this.input.pointer1, this.input.pointer2].filter((q) => q && q.isDown);
    const fireTouch = this.touch && pointers.some(onFire);
    const ptr = pointers.find((q) => !this.touch || !onFire(q));
    if (ptr) {
      const tx = ptr.worldX - this.ship.x;
      const ty = ptr.worldY - this.ship.y;
      const d = Math.hypot(tx, ty);
      if (d > 6) { dx = tx / d; dy = ty / d; }
    }
    const len = Math.hypot(dx, dy) || 1;
    this.ship.x = Phaser.Math.Clamp(this.ship.x + (dx / len) * SPEED * dt, 40, GAME_WIDTH * 0.6);
    this.ship.y = Phaser.Math.Clamp(this.ship.y + (dy / len) * SPEED * dt, TOP + 16, BOTTOM - 10);
    this.ship.angle = Phaser.Math.Linear(this.ship.angle, dy * 10, 0.2);
    this.ship.setAlpha(time < this.hitUntil && Math.floor(time / 70) % 2 ? 0.5 : 1);

    const fire = fireTouch || (k && (k.space.isDown || k.c.isDown || k.q.isDown));
    if (fire && time > this.nextShot) this.shoot(time);

    if (time > this.nextSpawn) {
      const p = Phaser.Math.Clamp(this.elapsed / MAX_TIME, 0, 1);
      this.spawnBubble();
      if (Math.random() < p * 0.5) this.spawnBubble();
      this.nextSpawn = time + Phaser.Math.Linear(560, 330, p);
    }

    this.shots = this.shots.filter((sh) => {
      sh.x += SHOT_SPEED * dt;
      const hit = this.bubbles.find((b) => b.active && Math.abs(b.x - sh.x) < 20 && Math.abs(b.y - sh.y) < 18);
      if (hit) { this.shotHit(hit); sh.destroy(); return false; }
      if (sh.x > GAME_WIDTH + 20) { sh.destroy(); return false; }
      return true;
    });
    this.bubbles = this.bubbles.filter((b) => b.active);
    this.bubbles = this.bubbles.filter((b) => {
      b.phase += dt * 3;
      b.x += b.vx * dt;
      if (b.chaser && b.x > this.ship.x) {
        // Hidden costs home in on the ship (only while they are still ahead of it).
        b.baseY += Phaser.Math.Clamp(this.ship.y - b.baseY, -95 * dt, 95 * dt);
        b.y = b.baseY;
      } else b.y = b.baseY + Math.sin(b.phase) * b.amp;
      if (Phaser.Math.Distance.Between(b.x, b.y, this.ship.x + 4, this.ship.y + 2) < 28) {
        this.collect(b, time);
        return false;
      }
      if (b.x < -30) { b.destroy(); return false; }
      return true;
    });

    this.refreshHud();
    if (this.elapsed >= MAX_TIME) this.endFlight();
  }

  shoot(time) {
    this.nextShot = time + SHOT_COOLDOWN;
    this.shots.push(this.add.image(this.ship.x + 34, this.ship.y + 6, 'rev_shot').setDepth(9));
    audio.sfx('shoot');
  }

  // A shot pops a C bubble ("hidden costs" take two hits) but also burns an R bubble: that revenue is lost.
  shotHit(b) {
    if (b.chaser && !b.hit) {
      b.hit = true;
      b.setTint(0xff9090);
      return;
    }
    const isR = b.kind === 'R';
    if (!isR) this.nCut++;
    const pop = this.add.circle(b.x, b.y, 16, isR ? 0x3ce05a : 0xffd800, 0.6).setDepth(9);
    this.tweens.add({ targets: pop, scale: 2, alpha: 0, duration: 250, onComplete: () => pop.destroy() });
    const t = this.add.text(b.x, b.y - 22, isR ? 'RICAVO BRUCIATO!' : 'TAGLIO COSTI!', tstyle(10, isR ? '#ff8080' : '#ffd800'))
      .setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: t, y: t.y - 26, alpha: 0, duration: 800, onComplete: () => t.destroy() });
    audio.sfx(isR ? 'miss' : 'stomp');
    b.destroy();
  }

  collect(b, time) {
    const isR = b.kind === 'R';
    const pop = this.add.circle(b.x, b.y, 16, isR ? 0x3ce05a : 0xff4a4a, 0.6).setDepth(9);
    this.tweens.add({ targets: pop, scale: 2, alpha: 0, duration: 250, onComplete: () => pop.destroy() });
    let label;
    if (isR) {
      this.ebitda += 1;
      this.revenue += EURO_PER_R;
      this.nR++;
      label = `${Phaser.Utils.Array.GetRandom(REVENUES)} +${EURO_PER_R}€`;
      audio.sfx('coin');
    } else {
      const hit = b.chaser ? 2 : 1;
      this.ebitda -= hit;
      this.nC++;
      label = b.chaser ? 'COSTI NASCOSTI! -2' : Phaser.Utils.Array.GetRandom(COSTS);
      this.hitUntil = time + 300;
      this.cameras.main.shake(100, 0.004);
      audio.sfx('miss');
    }
    const t = this.add.text(b.x, b.y - 22, label, tstyle(10, isR ? '#9dffb0' : '#ff8080')).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: t, y: t.y - 26, alpha: 0, duration: 800, onComplete: () => t.destroy() });
    b.destroy();
  }

  endFlight() {
    if (this.phase !== 'play') return;
    this.phase = 'result';
    this.bubbles.forEach((b) => b.destroy());
    this.bubbles = [];
    this.shots.forEach((sh) => sh.destroy());
    this.shots = [];
    this.ship.setAlpha(1);
    this.refreshHud();
    const o = outcome(this.ebitda);
    this.result = o;
    audio.sfx(this.ebitda > 0 ? 'victory' : 'checkpoint');
    const e = this.ebitda;
    const lines = [...o.text, '',
      `RICAVI: ${this.nR} bolle (+${this.revenue} €)   COSTI: ${this.nC} bolle`,
      `COSTI TAGLIATI A COLPI DI LASER: ${this.nCut}`,
      `EBITDA FINALE: ${e > 0 ? '+' : ''}${e} M€`, ...effectLines(o)];
    if (o.euro) lines.push(`BONUS +${o.euro} €`);
    resultPanel(this, { title: o.title, color: o.color, lines, y: 250, onClose: () => this.finish(), hint: 'INVIO / TOCCA per tornare in ufficio' });
  }

  finish() {
    if (this.leaving) return;
    this.leaving = true;
    const o = this.result;
    const euro = this.revenue + (o.euro || 0);
    if (euro) GameState.addBonus('euro', euro);
    if (o.hp) GameState.addHp(o.hp);
    if (o.stress) GameState.addStress(o.stress);
    audio.music('level');
    const gs = this.scene.get('GameScene');
    this.scene.resume('GameScene');
    gs?.ui?.message?.(this.ebitda > 0 ? `BILANCIO IN ATTIVO! +${euro} €` : 'BILANCIO IN ROSSO...', this.ebitda > 0 ? '#9dffb0' : '#ff9090', 2200);
    this.scene.stop();
  }
}
