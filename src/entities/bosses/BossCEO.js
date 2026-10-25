// Boss finale (Mondo 5): Il Mega-Direttore, in three phases.
// 1 (L'Attico): on the moving leather throne (Q4 folders, Mega-Riunione, Excel rain).
// 2 (L'Attico, below 60% hp): stands up and fights on foot (charge, leap with shockwaves, Excel rain);
//   with props.flee, below 30% hp he runs off to the roof (BOSS_DEFEATED with boss.fled = true).
// 3 (Il Tetto, props.phase = 3): on the helipad with the golden parachute (gold bags, rotor wind, charge, leap);
//   defeated, he jumps off with the golden parachute.
import Phaser from 'phaser';
import { TEX, EVENTS, DEPTH } from '../../config/constants.js';
import { ensureExecTextures } from '../../gfx/exec.js';
import { audio } from '../../systems/Audio8bit.js';
import Enemy from '../enemies/Enemy.js';
import EnemyProjectile, { arcVelocity } from '../enemies/EnemyProjectile.js';
import { bigText, floatText, popFx } from '../enemies/fx.js';

const NAME = 'IL MEGA-DIRETTORE';
const PATTERNS = {
  1: ['q4', 'meeting', 'excel'],
  2: ['charge', 'leap', 'excel'],
  3: ['gold', 'charge', 'rotor', 'leap']
};
const STAND_AT = 0.6; // phase 2 below this hp ratio
const FLEE_AT = 0.3;  // with props.flee: runs to the roof below this hp ratio
const LEAP_H = 150;

// Q4 binder pile: blocks the path until destroyed by projectiles. Lives in scene.obstacles.
export class Q4Obstacle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, floorY, height) {
    super(scene, x, floorY, TEX.Q4FOLDER);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.obstacles.add(this);
    this.setOrigin(0.5, 1).setDepth(DEPTH.PLATFORMS + 1);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.hp = 3;
    this.kind = 'q4obstacle';
    // Tall pile: one body covering several stacked binders.
    const n = Math.max(1, Math.round(height / 40));
    this.body.setSize(30, n * 40, false);
    this.body.setOffset(1, 40 - n * 40);
    this.stack = [];
    for (let i = 1; i < n; i++) {
      const img = scene.add.image(x, floorY - i * 40, TEX.Q4FOLDER).setOrigin(0.5, 1).setDepth(DEPTH.PLATFORMS + 1);
      img.setScale(1, 0);
      scene.tweens.add({ targets: img, scaleY: 1, delay: i * 50, duration: 150 });
      this.stack.push(img);
    }
  }

  hit(amount = 1) {
    if (!this.active) return;
    this.hp -= amount >= 3 ? 2 : 1;
    this.setTintFill(0xffffff);
    for (const s of this.stack) s.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (!this.active) return;
      this.clearTint();
      for (const s of this.stack) s.clearTint();
    });
    audio.sfx('bossHit');
    if (this.hp <= 0) this.crumble();
  }

  crumble() {
    if (!this.active) return;
    popFx(this.scene, this.x, this.y - 20);
    for (const s of this.stack) popFx(this.scene, s.x, s.y - 20, 0.8);
    audio.sfx('explosion');
    this.destroy();
  }

  destroy(fromScene) {
    if (this.stack) for (const s of this.stack) if (s.scene) s.destroy();
    this.stack = [];
    super.destroy(fromScene);
  }
}

export default class BossCEO extends Enemy {
  constructor(scene, x, y, props = {}) {
    ensureExecTextures(scene);
    super(scene, x, y, TEX.BOSS_CEO, {
      kind: 'boss_ceo', hp: props.hp ?? 50, stompable: true, damage: { hp: 20, stress: 10 }
    });
    this.isBoss = true;
    this.phase = 1;
    this.flee = !!props.flee;
    this.lift = 0;
    const a = props.arena || {};
    this.arena = {
      left: a.left ?? x - 400, right: a.right ?? x + 400,
      floorY: a.floorY ?? 418, ceilingY: a.ceilingY ?? 0
    };
    this.y = this.arena.floorY;
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setBodyBottom(70, 80);
    this.dir = -1;
    this.state = 'intro';
    this.until = this.now + 1800;
    this.patternIndex = 0;
    this.hitCooldown = 0;
    this.obstacles = [];
    this.siren = this.attach(scene.add.image(x, y - 96, TEX.SIREN).setDepth(DEPTH.FX).setVisible(false));
    if (props.phase === 3) this.setupRoof(props.heli);
    bigText(scene, NAME, '#ffd700', 1600, 0.25);
    audio.sfx('alarm');
    this.emitHealth();
  }

  emitHealth() {
    this.scene.events.emit(EVENTS.BOSS_HEALTH, { name: NAME, ratio: Math.max(0, this.hp / this.maxHp) });
  }

  get enraged() { return this.hp <= this.maxHp / 2; }

  get standing() { return this.phase >= 2; }

  // Default sprites face left; the standing CEO faces right.
  face(x) { this.setFlipX(this.standing ? x < this.x : x > this.x); }

  think(now, delta) {
    const dt = delta / 1000;
    this.body.setVelocity(0, 0);
    const p = this.target;
    if (this.leap) this.updateLeap(now);
    if (this.charge) this.updateCharge(now, dt);
    if (now < (this.windUntil || 0) && p) p.env.windX = -170;
    this.y = this.arena.floorY - this.lift;
    this.siren.setPosition(this.x, this.y - 100);
    if (this.pack) this.pack.setPosition(this.x + (this.flipX ? 12 : -12), this.y - 44).setFlipX(this.flipX);

    switch (this.state) {
      case 'intro':
        if (now > this.until) this.toMove(now);
        break;
      case 'move': {
        const speed = (this.enraged ? 110 : 70) * (this.standing ? 1.3 : 1) * this.speedMult();
        this.x += this.dir * speed * dt;
        if (this.x < this.arena.left + 80) { this.x = this.arena.left + 80; this.dir = 1; }
        if (this.x > this.arena.right - 80) { this.x = this.arena.right - 80; this.dir = -1; }
        if (p) this.face(p.x);
        if (now > this.until) this.startPattern(now);
        break;
      }
      case 'busy':
        if (now > this.until && !this.leap && !this.charge) this.toMove(now);
        break;
      case 'standup':
        if (now > this.until) this.toMove(now);
        break;
      case 'flee':
        this.x += 280 * dt;
        this.setFlipX(false);
        if (this.x > this.arena.right + 80) this.finishFlee();
        break;
    }
  }

  toMove(now) {
    this.state = 'move';
    this.customTint = null;
    this.until = now + (this.enraged ? 1800 : 2600) * (this.standing ? 0.7 : 1);
  }

  startPattern(now) {
    const list = PATTERNS[this.phase];
    const pattern = list[this.patternIndex % list.length];
    this.patternIndex++;
    this.state = 'busy';
    if (pattern === 'q4') this.patternQ4(now);
    else if (pattern === 'meeting') this.patternMeeting(now);
    else if (pattern === 'charge') this.patternCharge(now);
    else if (pattern === 'leap') this.patternLeap(now);
    else if (pattern === 'gold') this.patternGold(now);
    else if (pattern === 'rotor') this.patternRotor(now);
    else this.patternExcel(now);
  }

  // ---------------------------------------------------------------- phase changes

  standUp(now) {
    this.phase = 2;
    this.patternIndex = 0;
    this.state = 'standup';
    this.until = now + 1400;
    this.leap = null;
    this.charge = null;
    this.customTint = null;
    this.siren.setVisible(false);
    // The Q4 folder walls fall down: on foot he fights in the open.
    for (const o of this.obstacles) if (o.active) o.crumble();
    this.obstacles = [];
    this.throne = this.attach(this.scene.add.image(this.x, this.arena.floorY, 'throne_empty').setOrigin(0.5, 1).setDepth(DEPTH.ENEMIES - 1));
    this.toStanding();
    bigText(this.scene, 'SI ALZA DAL TRONO!', '#ff8040', 1400, 0.3);
    audio.sfx('alarm');
    this.scene.cameras.main.shake(300, 0.008);
    // Steps away from the throne.
    const to = this.x + (this.x > (this.arena.left + this.arena.right) / 2 ? -110 : 110);
    this.scene.tweens.addCounter({ from: this.x, to, duration: 600,
      onUpdate: (tw) => { if (this.active && !this.dead) this.x = tw.getValue(); } });
  }

  toStanding() {
    this.setTexture('ceo_standing');
    this.setBodyBottom(28, 76);
  }

  setupRoof(heli) {
    this.phase = 3;
    this.toStanding();
    this.pack = this.attach(this.scene.add.image(this.x, this.y - 44, 'gold_pack').setDepth(DEPTH.ENEMIES - 1));
    if (heli) {
      this.heli = this.attach(this.scene.add.image(heli.x, heli.y, 'helicopter').setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 1));
      this.rotor = this.attach(this.scene.add.image(heli.x - 8, heli.y - 62, 'rotor').setDepth(DEPTH.DECOR + 2));
      this.scene.tweens.add({ targets: this.rotor, scaleX: 0.15, duration: 90, yoyo: true, repeat: -1 });
    }
  }

  startFlee() {
    this.state = 'flee';
    this.leap = null;
    this.charge = null;
    this.lift = 0;
    this.customTint = null;
    this.body.enable = false;
    for (const o of this.obstacles) if (o.active) o.crumble();
    this.obstacles = [];
    this.scene.events.emit(EVENTS.BOSS_HEALTH, { name: NAME, ratio: null });
    bigText(this.scene, 'SCAPPA SUL TETTO!', '#ffd700', 1600, 0.3);
    floatText(this.scene, this.x, this.y - 96, 'NON MI AVRETE MAI!', '#ffd700', 11, 1200);
    audio.sfx('alarm');
  }

  finishFlee() {
    if (this.dead) return;
    this.dead = true;
    this.fled = true;
    this.scene.events.emit(EVENTS.BOSS_DEFEATED, this);
    this.destroy();
  }

  // --- Taglio dei costi: wind-up, then a dash across the arena (jump over him or on his head) -------------
  patternCharge(now) {
    const p = this.target;
    const dir = p ? (p.x < this.x ? -1 : 1) : -this.dir;
    this.until = now + 600;
    this.customTint = 0xff9090;
    this.face(this.x + dir);
    this.charge = { dir, at: now + 650 };
    floatText(this.scene, this.x, this.y - 96, 'TAGLIO DEI COSTI!', '#ff8080', 12, 1000);
    audio.sfx('alarm');
  }

  updateCharge(now, dt) {
    const c = this.charge;
    if (now < c.at) { this.x += Math.sin(now / 30) * 0.8; return; }
    this.x += c.dir * (this.enraged ? 460 : 400) * this.speedMult() * dt;
    const minX = this.arena.left + 50;
    const maxX = this.arena.right - 50;
    if (this.x <= minX || this.x >= maxX) {
      this.x = Phaser.Math.Clamp(this.x, minX, maxX);
      this.charge = null;
      this.customTint = null;
      this.dir = -c.dir;
      this.until = now + 500;
      this.scene.cameras.main.shake(200, 0.008);
      audio.sfx('explosion');
    }
  }

  // --- Ristrutturazione: leaps onto the player, shockwaves on landing --------------------------------------
  patternLeap(now) {
    const p = this.target;
    const a = this.arena;
    const tx = Phaser.Math.Clamp(p ? p.x : this.x, a.left + 70, a.right - 70);
    this.until = now + 1300;
    this.customTint = 0xffd080;
    this.leap = { sx: this.x, tx, start: now + 350, dur: 850 };
    if (p) this.face(p.x);
    floatText(this.scene, this.x, this.y - 96, 'RISTRUTTURAZIONE!', '#ffd080', 12, 1000);
  }

  updateLeap(now) {
    const l = this.leap;
    const t = (now - l.start) / l.dur;
    if (t < 0) return;
    if (t < 1) {
      this.x = Phaser.Math.Linear(l.sx, l.tx, t);
      this.lift = Math.sin(t * Math.PI) * LEAP_H;
      return;
    }
    this.x = l.tx;
    this.lift = 0;
    this.leap = null;
    this.customTint = null;
    this.until = now + 700;
    this.scene.cameras.main.shake(250, 0.01);
    audio.sfx('explosion');
    [-1, 1].forEach((d) => {
      const w = new EnemyProjectile(this.scene, this.x + d * 30, this.arena.floorY, TEX.REDWAVE, {
        vx: d * 300, ignoreWalls: true, lifespan: 2400, scale: { x: 1.2, y: 0.45 },
        damage: { hp: 10, stress: 8 }, destroyOnPlayer: false, flipWithDir: false
      });
      w.setOrigin(0.5, 1).setAlpha(0.85).setTint(0xffb040);
      if (d < 0) w.setFlipX(true);
    });
  }

  // --- La buonuscita: bags of gold lobbed around the player (phase 3) --------------------------------------
  patternGold(now) {
    const p = this.target;
    this.until = now + 1800;
    this.customTint = 0xfff080;
    floatText(this.scene, this.x, this.y - 96, 'LA MIA BUONUSCITA!', '#ffd700', 12, 1000);
    const n = this.enraged ? 4 : 3;
    for (let i = 0; i < n; i++) {
      this.later(250 + i * 280, () => {
        const tx = Phaser.Math.Clamp((p ? p.x : this.x) + (i - (n - 1) / 2) * 70, this.arena.left + 30, this.arena.right - 30);
        const sx = this.x;
        const sy = this.y - 70;
        const v = arcVelocity(sx, sy, tx, this.arena.floorY - 10, 0.9);
        new EnemyProjectile(this.scene, sx, sy, 'gold_bag', {
          vx: v.vx, vy: v.vy, gravity: true, spin: 200, bounces: 1, bounceVy: 220, lifespan: 3500,
          damage: { hp: 8, stress: 8 }, flipWithDir: false, fxOnDestroy: true
        });
        audio.sfx('coin');
      });
    }
  }

  // --- Vento delle pale: the helicopter rotor pushes you away while share certificates fly by (phase 3) ----
  patternRotor(now) {
    this.until = now + 3000;
    this.windUntil = now + 2800;
    bigText(this.scene, 'VENTO DELLE PALE!', '#9ad4f0', 1200, 0.3);
    audio.sfx('freeze');
    const view = this.scene.cameras.main.worldView;
    for (let i = 0; i < 4; i++) {
      this.later(400 + i * 600, () => {
        const y = this.arena.floorY - (i % 2 ? 22 : 64);
        new EnemyProjectile(this.scene, view.right + 20, y, 'stock_cert', {
          vx: -330, ignoreWalls: true, lifespan: 4000, spin: 300, damage: { hp: 6, stress: 6 }, flipWithDir: false
        });
      });
    }
    for (let i = 0; i < 14; i++) {
      const s = this.attach(this.scene.add.rectangle(view.right + Math.random() * 200, view.y + 60 + Math.random() * 320, 26, 2, 0xffffff, 0.6)
        .setDepth(DEPTH.FX));
      this.scene.tweens.add({ targets: s, x: view.x - 60, duration: 600 + Math.random() * 400, delay: Math.random() * 2200,
        onComplete: () => s.destroy() });
    }
  }

  // --- Faldoni Q4 -------------------------------------------------------
  patternQ4(now) {
    this.until = now + 2600;
    this.customTint = 0xffd080;
    floatText(this.scene, this.x, this.y - 96, 'FALDONI Q4!', '#ffd700', 12, 1200);
    const n = this.enraged ? 3 : 2;
    for (let i = 0; i < n; i++) this.later(500 + i * 400, () => this.throwQ4());
  }

  pickLandingX() {
    const p = this.target;
    const a = this.arena;
    for (let tries = 0; tries < 10; tries++) {
      const x = Phaser.Math.Between(a.left + 60, a.right - 60);
      const farFromPlayer = !p || Math.abs(x - p.x) > 70;
      const farFromBoss = Math.abs(x - this.x) > 90;
      const farFromOthers = this.obstacles.every((o) => !o.active || Math.abs(o.x - x) > 60);
      if (farFromPlayer && farFromBoss && farFromOthers) return x;
    }
    return Phaser.Math.Between(a.left + 60, a.right - 60);
  }

  throwQ4() {
    const scene = this.scene;
    const fy = this.arena.floorY;
    const tx = this.pickLandingX();
    const marker = this.attach(scene.add.text(tx, fy - 2, 'X', {
      fontFamily: 'monospace', fontSize: '16px', fontStyle: 'bold', color: '#ff3030', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 1).setDepth(DEPTH.FX));
    scene.tweens.add({ targets: marker, alpha: 0.2, duration: 120, yoyo: true, repeat: -1 });
    const sx = this.x, sy = this.y - 80;
    const v = arcVelocity(sx, sy, tx, fy - 20, 1.1);
    audio.sfx('shoot');
    new EnemyProjectile(scene, sx, sy, TEX.Q4FOLDER, {
      vx: v.vx, vy: v.vy, gravity: true, spin: 300, ignoreWalls: true, lifespan: 4000,
      damage: { hp: 12, stress: 8 }, flipWithDir: false, floorY: fy,
      onFloor: (b) => {
        const x = b.x;
        b.destroy();
        if (marker.scene) { scene.tweens.killTweensOf(marker); marker.destroy(); }
        if (!this.active || this.dead) return;
        this.spawnObstacle(x);
      }
    });
  }

  spawnObstacle(x) {
    const a = this.arena;
    const height = Math.min(200, a.floorY - a.ceilingY - 60);
    this.obstacles = this.obstacles.filter((o) => o.active);
    // Never more than 2 piles: the oldest crumbles.
    while (this.obstacles.length >= 2) this.obstacles.shift().crumble();
    this.scene.cameras.main.shake(150, 0.006);
    audio.sfx('explosion');
    const ob = new Q4Obstacle(this.scene, x, a.floorY, height);
    this.obstacles.push(ob);
    // Push the player out if he got caught inside the pile.
    const p = this.target;
    if (p && Math.abs(p.x - x) < 24) p.x = x + (p.x < x ? -30 : 30);
  }

  // --- Mega-Riunione Sincrona -----------------------------------------------
  patternMeeting(now) {
    this.until = now + 4000;
    this.siren.setVisible(true);
    this.sirenTween = this.scene.tweens.add({ targets: this.siren, alpha: 0.3, duration: 150, yoyo: true, repeat: 7 });
    bigText(this.scene, 'ALLARME!\nMEGA-RIUNIONE SINCRONA!', '#ff2020', 1200, 0.3);
    audio.sfx('alarm');
    this.later(600, () => audio.sfx('alarm'));
    this.later(1300, () => {
      this.siren.setVisible(false);
      this.launchRedWave();
    });
  }

  launchRedWave() {
    const view = this.scene.cameras.main.worldView;
    const p = this.target;
    // Comes from the screen corner farther from the player, across the whole floor.
    const fromLeft = p ? p.x > view.centerX : true;
    const dir = fromLeft ? 1 : -1;
    const x = fromLeft ? view.x - 130 : view.right + 130;
    const speed = this.enraged ? 400 : 380;
    // 240 px wide x ~66 px tall: a single jump is too short to clear it, a double jump is enough.
    const wave = new EnemyProjectile(this.scene, x, this.arena.floorY, TEX.REDWAVE, {
      vx: dir * speed, ignoreWalls: true, lifespan: 6000, scale: { x: 6, y: 1.1 },
      damage: { hp: 20, stress: 15 }, destroyOnPlayer: false, flipWithDir: false
    });
    wave.setOrigin(0.5, 1).setAlpha(0.9);
    if (dir < 0) wave.setFlipX(true);
    this.scene.cameras.main.shake(1200, 0.004);
    audio.sfx('explosion');
  }

  // --- Pioggia di Excel ------------------------------------------------------
  patternExcel(now) {
    const scene = this.scene;
    const a = this.arena;
    const colW = 64;
    const cols = Math.floor((a.right - a.left) / colW);
    const startX = a.left + ((a.right - a.left) - cols * colW) / 2;
    // Safe column: not under the boss, preferably within reach of the player.
    const p = this.target;
    const candidates = [];
    for (let i = 0; i < cols; i++) {
      const cx = startX + i * colW + colW / 2;
      if (Math.abs(cx - this.x) < 90) continue;
      const dist = p ? Math.abs(cx - p.x) : 0;
      if (dist > 120 && dist < 360) candidates.push(i);
    }
    let safe = candidates.length ? Phaser.Utils.Array.GetRandom(candidates) : -1;
    if (safe < 0) {
      for (let i = 0; i < cols; i++) {
        const cx = startX + i * colW + colW / 2;
        if (Math.abs(cx - this.x) >= 90) { safe = i; break; }
      }
      if (safe < 0) safe = 0;
    }

    this.until = now + 4200;
    floatText(scene, this.x, this.y - 96, 'PIOGGIA DI EXCEL!', '#40ff60', 12, 1200);
    audio.sfx('alarm');
    const warnTime = this.enraged ? 1000 : 1300;
    const top = a.ceilingY;
    for (let i = 0; i < cols; i++) {
      const cx = startX + i * colW;
      const isSafe = i === safe;
      const r = this.attach(scene.add.rectangle(cx + 2, top, colW - 4, a.floorY - top, isSafe ? 0x40ff40 : 0xff2020, isSafe ? 0.25 : 0.18)
        .setOrigin(0, 0).setDepth(DEPTH.ZONES));
      scene.tweens.add({ targets: r, alpha: isSafe ? 0.4 : 0.05, duration: 150, yoyo: true, repeat: -1 });
      this.later(warnTime, () => { scene.tweens.killTweensOf(r); r.destroy(); });
      if (isSafe) continue;
      this.later(warnTime, () => this.dropExcel(cx + colW / 2, i));
    }
  }

  dropExcel(x, i) {
    const a = this.arena;
    new EnemyProjectile(this.scene, x, a.ceilingY - 64 - (i % 2) * 24, TEX.EXCEL, {
      vy: 520, ignoreWalls: true, lifespan: 5000, scale: 2, flipWithDir: false,
      damage: { hp: 25, stress: 15 }, floorY: a.floorY,
      onFloor: (b) => {
        b.harmless = true;
        b.body.setVelocity(0, 0);
        b.body.enable = false;
        b.y = a.floorY - b.displayHeight / 2;
        this.scene.cameras.main.shake(60, 0.004);
        this.scene.tweens.add({ targets: b, alpha: 0, delay: 500, duration: 300, onComplete: () => b.destroy() });
      }
    });
    if (i % 3 === 0) audio.sfx('explosion');
  }

  // --- Damage -----------------------------------------------------------
  stun() { this.flash(); }
  slow(ms) { super.slow(ms, 0.7); }

  hit(amount, type) {
    if (this.dead || this.state === 'standup' || this.state === 'flee') return;
    const now = this.now;
    if (type === 'stomp') {
      if (now < this.hitCooldown) return;
      this.hitCooldown = now + 500;
      amount = 3;
    }
    super.hit(amount, type);
    if (this.dead) return;
    const ratio = this.hp / this.maxHp;
    if (this.phase === 1) {
      this.setTexture(TEX.BOSS_CEO_HURT);
      this.later(200, () => { if (this.phase === 1) this.setTexture(TEX.BOSS_CEO); });
      if (ratio <= STAND_AT) this.standUp(now);
    } else if (this.phase === 2 && this.flee && ratio <= FLEE_AT) {
      this.startFlee(now);
      return;
    }
    this.emitHealth();
  }

  onPlayerContact(player) {
    if (this.state === 'flee' || this.state === 'standup') return;
    super.onPlayerContact(player);
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.body.enable = false;
    const scene = this.scene;
    scene.events.emit(EVENTS.BOSS_HEALTH, { name: NAME, ratio: null });
    for (const o of this.obstacles) if (o.active) o.crumble();
    this.obstacles = [];
    bigText(scene, 'HAI SCONFITTO\nIL MEGA-DIRETTORE!', '#ffd700', 2200, 0.3);
    if (this.standing) { this.parachuteAway(); return; }
    for (let i = 0; i < 10; i++) {
      scene.time.delayedCall(i * 150, () => {
        popFx(scene, this.x + Math.random() * 90 - 45, this.y - Math.random() * 80, 1.3);
        audio.sfx('explosion');
      });
    }
    scene.tweens.add({
      targets: this, alpha: 0, scaleY: 0.3, duration: 1600,
      onComplete: () => {
        scene.events.emit(EVENTS.ENEMY_KILLED, this);
        scene.events.emit(EVENTS.BOSS_DEFEATED, this);
        this.destroy();
      }
    });
  }

  // Defeated on the roof: jumps off with the golden parachute and floats away.
  parachuteAway() {
    const scene = this.scene;
    this.customTint = null;
    this.clearTint();
    this.windUntil = 0;
    this.pack?.setVisible(false);
    this.setFlipX(false);
    const canopy = this.attach(scene.add.image(this.x, this.y - 80, 'gold_canopy').setOrigin(0.5, 1).setDepth(DEPTH.ENEMIES).setScale(0.2));
    floatText(scene, this.x, this.y - 96, 'TANTO HO LA BUONUSCITA!', '#ffd700', 11, 1600);
    audio.sfx('powerup');
    scene.tweens.add({ targets: canopy, scale: 1, duration: 400, ease: 'Back.Out' });
    scene.tweens.add({ targets: [this, canopy], y: '-=40', duration: 400, ease: 'Quad.Out' });
    scene.tweens.add({ targets: [this, canopy], x: '+=320', y: '-=300', delay: 450, duration: 2600, ease: 'Sine.In' });
    scene.tweens.add({ targets: [this, canopy], angle: { from: -8, to: 8 }, duration: 500, yoyo: true, repeat: -1 });
    scene.time.delayedCall(2800, () => {
      if (!this.scene) return;
      scene.events.emit(EVENTS.ENEMY_KILLED, this);
      scene.events.emit(EVENTS.BOSS_DEFEATED, this);
      this.destroy();
    });
  }

  destroy(fromScene) {
    if (this.obstacles) for (const o of this.obstacles) if (o.active && !fromScene) o.destroy();
    super.destroy(fromScene);
  }
}
