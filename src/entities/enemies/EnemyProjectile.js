import Phaser from 'phaser';
import { DEPTH } from '../../config/constants.js';
import { GameState } from '../../state/GameState.js';
import { popFx } from './fx.js';

/**
 * Generic enemy projectile, added to scene.enemyBullets.
 * opts: { vx, vy, gravity, damage:{hp,stress}, lifespan, spin (deg/s), bounces, bounceVy,
 *         ignoreWalls, homing:{ speed, turn (rad/s) }, onPlayer(player, bullet), floorY, onFloor(bullet),
 *         destroyOnPlayer, scale, fxOnDestroy }
 *
 * GameScene collider note: onHitWall() returns true when the bullet should be separated from the
 * platform and false otherwise (bounces are handled manually, so ignoring the value is also safe).
 */
export default class EnemyProjectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, opts = {}) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.enemyBullets.add(this);

    this.opts = opts;
    this.damage = opts.damage || { hp: 8, stress: 5 };
    this.bounces = opts.bounces || 0;
    this.bounceVy = opts.bounceVy || 260;
    this.ignoreWalls = !!opts.ignoreWalls;
    this.lifespan = opts.lifespan ?? 6000;
    this.born = scene.time.now;
    this.harmless = false;
    this._lastBounce = 0;

    if (opts.scale) this.setScale(opts.scale.x ?? opts.scale, opts.scale.y ?? opts.scale);
    this.setDepth(DEPTH.PROJECTILES);
    this.body.setAllowGravity(!!opts.gravity);
    this.body.setVelocity(opts.vx || 0, opts.vy || 0);
    if (opts.vx && opts.vx < 0 && opts.flipWithDir !== false) this.setFlipX(true);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active || !this.body) return;
    const now = this.scene.time.now;
    const dt = delta / 1000;
    if (this.opts.spin) this.angle += this.opts.spin * dt;

    const h = this.opts.homing;
    const p = this.scene.player;
    if (h && p && p.active && GameState.hp > 0) {
      const v = this.body.velocity;
      const cur = Math.atan2(v.y, v.x);
      const want = Phaser.Math.Angle.Between(this.x, this.y, p.x, p.y - 16);
      const next = Phaser.Math.Angle.RotateTo(cur, want, h.turn * dt);
      this.body.setVelocity(Math.cos(next) * h.speed, Math.sin(next) * h.speed);
      this.rotation = next;
    }

    if (this.opts.floorY !== undefined && !this._landed && this.body.bottom >= this.opts.floorY) {
      this._landed = true;
      if (this.opts.onFloor) this.opts.onFloor(this);
      else this.explode();
      return;
    }

    const wb = this.scene.physics.world.bounds;
    if (now - this.born > this.lifespan || this.y > wb.bottom + 100 || this.x < wb.x - 200 || this.x > wb.right + 200) {
      this.destroy();
    }
  }

  onHitPlayer(player) {
    if (!this.active || this.harmless) return;
    if (this.opts.onPlayer) this.opts.onPlayer(player, this);
    else player.takeDamage(this.damage.hp, this.damage.stress, this.x);
    if (this.active && this.opts.destroyOnPlayer !== false) this.explode();
  }

  onHitWall() {
    if (!this.active || this.ignoreWalls) return false;
    if (this.bounces > 0) {
      const now = this.scene.time.now;
      if (now - this._lastBounce > 120 && this.body.velocity.y >= 0) {
        this._lastBounce = now;
        this.bounces--;
        this.body.setVelocityY(-this.bounceVy);
        this.bounceVy *= 0.8;
      }
      return false;
    }
    this.explode();
    return false;
  }

  explode() {
    if (!this.active) return;
    if (this.opts.fxOnDestroy) popFx(this.scene, this.x, this.y, 0.6);
    this.destroy();
  }

  destroy(fromScene) {
    if (this.scene && this.scene.tweens) this.scene.tweens.killTweensOf(this);
    super.destroy(fromScene);
  }
}

// Throw velocity for a ballistic arc reaching (tx, ty) from (x, y) in t seconds.
export function arcVelocity(x, y, tx, ty, t, gravity = 900) {
  return { vx: (tx - x) / t, vy: (ty - y - 0.5 * gravity * t * t) / t };
}
