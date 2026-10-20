// Boss intermedio (Mondo 3): Il Cliente dall'Inferno, floating on a burning office chair.
import Phaser from 'phaser';
import { TEX, EVENTS, DEPTH } from '../../config/constants.js';
import { audio } from '../../systems/Audio8bit.js';
import Enemy from '../enemies/Enemy.js';
import EnemyProjectile from '../enemies/EnemyProjectile.js';
import { bigText, floatText, popFx } from '../enemies/fx.js';

const NAME = 'IL CLIENTE DALL\'INFERNO';

export default class BossClient extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.BOSS_CLIENT, {
      kind: 'boss_client', hp: 30, stompable: true, flying: true, damage: { hp: 15, stress: 10 }
    });
    this.isBoss = true;
    const a = props.arena || {};
    this.arena = { left: a.left ?? x - 400, right: a.right ?? x + 400, floorY: a.floorY ?? 418 };
    this.hoverY = this.arena.floorY - 170;
    this.body.setSize(48, 60);
    this.dir = -1;
    this.state = 'intro';
    this.until = this.now + 1500;
    this.attackIndex = 0;
    this.hitCooldown = 0;
    this.y = this.hoverY - 120;
    this.scene.tweens.add({ targets: this, y: this.hoverY, duration: 1200, ease: 'Sine.easeOut' });
    bigText(scene, NAME, '#ff6020', 1500, 0.25);
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
    this.fireTrail(now);

    switch (this.state) {
      case 'intro':
        if (now > this.until) this.nextMove(now);
        break;
      case 'move': {
        const speed = (this.enraged ? 130 : 90) * this.speedMult();
        this.x += this.dir * speed * dt;
        if (this.x < this.arena.left + 70) { this.x = this.arena.left + 70; this.dir = 1; }
        if (this.x > this.arena.right - 70) { this.x = this.arena.right - 70; this.dir = -1; }
        this.y = this.hoverY + Math.sin(now / 350) * 12;
        this.setFlipX(this.dir > 0);
        if (now > this.until) this.startAttack(now);
        break;
      }
      case 'telegraph':
        this.x += Math.sin(now / 25) * 1.2;
        if (now > this.until) this.executeAttack(now);
        break;
      case 'shout':
        // Slam towards the floor, then waves are spawned on landing.
        if (now > this.until) this.nextMove(now);
        break;
    }
  }

  nextMove(now) {
    this.state = 'move';
    this.customTint = null;
    this.until = now + (this.enraged ? 1600 : 2400);
  }

  startAttack(now) {
    this.pending = this.attackIndex % 2 === 0 ? 'feedback' : 'shout';
    this.attackIndex++;
    this.state = 'telegraph';
    this.until = now + 600;
    this.customTint = this.pending === 'feedback' ? 0xff8080 : 0xffff60;
    floatText(this.scene, this.x, this.y - 46, this.pending === 'feedback' ? 'FEEDBACK!' : '!!!', '#ffcc00', 12, 600);
  }

  executeAttack(now) {
    this.customTint = null;
    if (this.pending === 'feedback') {
      floatText(this.scene, this.x, this.y - 46, 'FEEDBACK FUORI SCOPE!', '#ff6020', 10, 1200);
      const n = this.enraged ? 4 : 3;
      for (let i = 0; i < n; i++) this.later(i * 280, () => this.shootFeedback());
      this.nextMove(now);
      this.until += n * 280;
    } else {
      this.state = 'shout';
      this.until = now + 1400;
      bigText(this.scene, 'LO VOGLIO PRONTO\nPER IERI!', '#ff3030', 1300, 0.28);
      audio.sfx('alarm');
      const groundY = this.arena.floorY - 40;
      this.scene.tweens.add({
        targets: this, y: groundY, duration: 350, ease: 'Quad.easeIn', yoyo: true, hold: 120,
        onYoyo: () => this.shockwaves()
      });
    }
  }

  shootFeedback() {
    const dir = this.flipX ? 1 : -1;
    new EnemyProjectile(this.scene, this.x + dir * 20, this.y, TEX.FEEDBACK, {
      vx: dir * 120, vy: -120, homing: { speed: this.enraged ? 175 : 150, turn: 2.0 },
      lifespan: 4500, damage: { hp: 12, stress: 10 }, ignoreWalls: true, fxOnDestroy: true, flipWithDir: false
    });
    audio.sfx('shoot');
  }

  shockwaves() {
    if (!this.active || this.dead) return;
    this.scene.cameras.main.shake(250, 0.01);
    audio.sfx('explosion');
    const fy = this.arena.floorY;
    const waves = this.enraged ? [0, 650] : [0];
    for (const delay of waves) {
      this.later(delay, () => {
        for (const dir of [-1, 1]) {
          new EnemyProjectile(this.scene, this.x + dir * 30, fy, TEX.SHOCKWAVE, {
            vx: dir * 260, ignoreWalls: true, lifespan: 4000, damage: { hp: 12, stress: 12 }, flipWithDir: false
          }).setOrigin(0.5, 1);
        }
      });
    }
  }

  fireTrail(now) {
    if (!this._nextFire || now > this._nextFire) {
      this._nextFire = now + 90;
      const key = this.scene.textures.exists(TEX.FX_SPARK) ? TEX.FX_SPARK : TEX.FX_PX;
      const f = this.scene.add.image(this.x + (Math.random() * 40 - 20), this.y + 28, key)
        .setTint(Math.random() < 0.5 ? 0xff4000 : 0xffcc00).setDepth(DEPTH.ENEMIES - 1);
      this.scene.tweens.add({ targets: f, y: f.y + 16, alpha: 0, scale: 2, duration: 450, onComplete: () => f.destroy() });
    }
  }

  stun() { this.flash(); }
  slow(ms) { super.slow(ms, 0.7); }

  hit(amount, type) {
    if (this.dead) return;
    const now = this.now;
    if (type === 'stomp') {
      if (now < this.hitCooldown) return;
      this.hitCooldown = now + 500;
      amount = 2;
    }
    super.hit(amount, type);
    if (this.dead) return;
    this.setTexture(TEX.BOSS_CLIENT_HURT);
    this.later(200, () => this.setTexture(TEX.BOSS_CLIENT));
    this.emitHealth();
  }

  die() {
    if (this.dead) return;
    this.dead = true;
    this.body.enable = false;
    this.scene.events.emit(EVENTS.BOSS_HEALTH, { name: NAME, ratio: null });
    bigText(this.scene, 'CLIENTE SODDISFATTO!', '#60ff60', 1800, 0.3);
    const scene = this.scene;
    for (let i = 0; i < 6; i++) {
      scene.time.delayedCall(i * 160, () => {
        popFx(scene, this.x + Math.random() * 60 - 30, this.y + Math.random() * 60 - 30, 1.2);
        audio.sfx('explosion');
      });
    }
    scene.tweens.add({
      targets: this, alpha: 0, angle: 30, y: this.y + 40, duration: 1000,
      onComplete: () => {
        scene.events.emit(EVENTS.ENEMY_KILLED, this);
        scene.events.emit(EVENTS.BOSS_DEFEATED, this);
        this.destroy();
      }
    });
  }
}
