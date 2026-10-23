// Boss finale (Mondo 5): Il Mega-Direttore, on a moving leather throne.
import Phaser from 'phaser';
import { TEX, EVENTS, DEPTH } from '../../config/constants.js';
import { audio } from '../../systems/Audio8bit.js';
import Enemy from '../enemies/Enemy.js';
import EnemyProjectile, { arcVelocity } from '../enemies/EnemyProjectile.js';
import { bigText, floatText, popFx } from '../enemies/fx.js';

const NAME = 'IL MEGA-DIRETTORE';
const PATTERNS = ['q4', 'meeting', 'excel'];

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
    super(scene, x, y, TEX.BOSS_CEO, {
      kind: 'boss_ceo', hp: 50, stompable: true, damage: { hp: 20, stress: 10 }
    });
    this.isBoss = true;
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
    bigText(scene, NAME, '#ffd700', 1600, 0.25);
    audio.sfx('alarm');
    this.emitHealth();
  }

  emitHealth() {
    this.scene.events.emit(EVENTS.BOSS_HEALTH, { name: NAME, ratio: Math.max(0, this.hp / this.maxHp) });
  }

  get enraged() { return this.hp <= this.maxHp / 2; }

  think(now, delta) {
    const dt = delta / 1000;
    this.body.setVelocity(0, 0);
    this.y = this.arena.floorY;
    this.siren.setPosition(this.x, this.y - 100);
    const p = this.target;

    switch (this.state) {
      case 'intro':
        if (now > this.until) this.toMove(now);
        break;
      case 'move': {
        const speed = (this.enraged ? 110 : 70) * this.speedMult();
        this.x += this.dir * speed * dt;
        if (this.x < this.arena.left + 80) { this.x = this.arena.left + 80; this.dir = 1; }
        if (this.x > this.arena.right - 80) { this.x = this.arena.right - 80; this.dir = -1; }
        if (p) this.setFlipX(p.x > this.x);
        if (now > this.until) this.startPattern(now);
        break;
      }
      case 'busy':
        if (now > this.until) this.toMove(now);
        break;
    }
  }

  toMove(now) {
    this.state = 'move';
    this.customTint = null;
    this.until = now + (this.enraged ? 1800 : 2600);
  }

  startPattern(now) {
    const pattern = PATTERNS[this.patternIndex % PATTERNS.length];
    this.patternIndex++;
    this.state = 'busy';
    if (pattern === 'q4') this.patternQ4(now);
    else if (pattern === 'meeting') this.patternMeeting(now);
    else this.patternExcel(now);
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
    if (this.dead) return;
    const now = this.now;
    if (type === 'stomp') {
      if (now < this.hitCooldown) return;
      this.hitCooldown = now + 500;
      amount = 3;
    }
    super.hit(amount, type);
    if (this.dead) return;
    this.setTexture(TEX.BOSS_CEO_HURT);
    this.later(200, () => this.setTexture(TEX.BOSS_CEO));
    this.emitHealth();
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.body.enable = false;
    const scene = this.scene;
    scene.events.emit(EVENTS.BOSS_HEALTH, { name: NAME, ratio: null });
    for (const o of this.obstacles) if (o.active) o.crumble();
    this.obstacles = [];
    bigText(scene, 'SEI IL NUOVO CEO!', '#ffd700', 2000, 0.3);
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

  destroy(fromScene) {
    if (this.obstacles) for (const o of this.obstacles) if (o.active && !fromScene) o.destroy();
    super.destroy(fromScene);
  }
}
