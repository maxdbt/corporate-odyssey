import Phaser from 'phaser';
import { EVENTS, TEX, ANIM, DEPTH } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import PlayerProjectile from '../entities/PlayerProjectile.js';
import { audio } from './Audio8bit.js';

const MAX_BULLETS = 5;
const EXPLOSION_RADIUS = 50;

// Player ranged attacks (office-themed projectiles). Listens to EVENTS.PLAYER_FIRE.
export default class WeaponSystem {
  constructor(scene) {
    this.scene = scene;
    scene.playerBullets = scene.physics.add.group({ allowGravity: false });
    this.group = scene.playerBullets;
    this.onFire = this.fire.bind(this);
    scene.events.on(EVENTS.PLAYER_FIRE, this.onFire);

    // Bullets vs solid level geometry.
    scene.physics.add.collider(this.group, scene.platforms, (b) => b.onWall());
    scene.physics.add.collider(this.group, scene.obstacles, (b, o) => {
      if (!b.dead) o.hit?.(b.damage, b.type);
      b.impact();
    });
    // Bullets vs enemies.
    scene.physics.add.overlap(this.group, scene.enemies, (b, e) => this.hitEnemy(b, e));
  }

  fire({ x, y, dir }) {
    if (!GameState.device) return;
    if (this.group.countActive(true) >= MAX_BULLETS) return;
    new PlayerProjectile(this.scene, x + dir * 10, y, GameState.weapon, dir || 1);
  }

  hitEnemy(bullet, enemy) {
    if (bullet.dead || !enemy.active || enemy.dead) return;
    const type = bullet.type;
    if (type === 'www') {
      bullet.impact(); // area damage handled by explode()
      return;
    }
    enemy.hit?.(bullet.damage, type);
    if (enemy.active) {
      if (type === 'teams') enemy.stun?.(1500);
      if (type === 'clock') enemy.slow?.(4000, 0.4);
    }
    bullet.impact();
  }

  explode(x, y) {
    const scene = this.scene;
    audio.sfx('explosion');
    const fx = scene.add.sprite(x, y, TEX.FX_EXPLOSION1).setDepth(DEPTH.FX).setScale(1.6);
    if (scene.anims.exists(ANIM.EXPLOSION)) {
      fx.play(ANIM.EXPLOSION);
      fx.once('animationcomplete', () => fx.destroy());
    } else {
      scene.tweens.add({ targets: fx, alpha: 0, scale: 2.4, duration: 300, onComplete: () => fx.destroy() });
    }
    scene.cameras.main.shake(120, 0.004);

    const targets = [...scene.enemies.getChildren(), ...scene.obstacles.getChildren()];
    targets.forEach((t) => {
      if (!t.active || t.dead) return;
      if (Phaser.Math.Distance.Between(x, y, t.x, t.body ? t.body.center.y : t.y) <= EXPLOSION_RADIUS + (t.body ? t.body.halfWidth : 0)) {
        t.hit?.(2, 'www');
      }
    });
  }

  puff(x, y) {
    const p = this.scene.add.sprite(x, y, TEX.FX_SPARK).setDepth(DEPTH.FX).setScale(2);
    this.scene.tweens.add({ targets: p, alpha: 0, scale: 4, duration: 180, onComplete: () => p.destroy() });
  }

  // Remove bullets that left the camera view.
  update() {
    const view = this.scene.cameras.main.worldView;
    this.group.getChildren().slice().forEach((b) => {
      if (b.x < view.x - 64 || b.x > view.right + 64 || b.y > view.bottom + 64) b.destroy();
    });
  }

  destroy() {
    this.scene.events.off(EVENTS.PLAYER_FIRE, this.onFire);
  }
}
