import Phaser from 'phaser';
import { TEX, DEPTH } from '../config/constants.js';

// Weapon definitions: speed, gravity, damage, lifetime.
export const WEAPON_DEFS = {
  email:  { tex: TEX.P_EMAIL,  vx: 520, vy: 0,    gravity: false, damage: 1, life: 1200 },
  teams:  { tex: TEX.P_TEAMS,  vx: 300, vy: -120, gravity: true,  damage: 1, life: 2600, bounces: 4 },
  coffee: { tex: TEX.P_COFFEE, vx: 270, vy: -340, gravity: true,  damage: 2, life: 2000 },
  clock:  { tex: TEX.P_CLOCK,  vx: 380, vy: 0,    gravity: false, damage: 1, life: 1400 },
  www:    { tex: TEX.P_WWW,    vx: 400, vy: 0,    gravity: false, damage: 2, life: 1400, explodes: true }
};

export default class PlayerProjectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type, dir) {
    const def = WEAPON_DEFS[type] || WEAPON_DEFS.email;
    super(scene, x, y, def.tex);
    this.type = type;
    this.def = def;
    this.damage = def.damage;
    this.bouncesLeft = def.bounces || 0;
    this.dead = false;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.playerBullets.add(this);
    // Configure body only after group add (group resets defaults).
    this.body.setAllowGravity(def.gravity);
    this.body.setVelocity(def.vx * dir, def.vy);
    if (type === 'teams') this.body.setBounce(0, 0.75);
    this.setFlipX(dir < 0);
    this.setDepth(DEPTH.PROJECTILES);

    if (type === 'coffee' || type === 'clock') {
      scene.tweens.add({ targets: this, angle: 360 * dir, duration: 500, repeat: -1 });
    }
    this.lifeTimer = scene.time.delayedCall(def.life, () => this.impact());
  }

  // Called when hitting a wall/floor.
  onWall() {
    if (this.dead) return;
    if (this.type === 'teams' && this.body.blocked.down && this.bouncesLeft > 0) {
      this.bouncesLeft--;
      this.body.setVelocityY(-260);
      return;
    }
    this.impact();
  }

  impact() {
    if (this.dead || !this.active) return;
    this.dead = true;
    if (this.lifeTimer) this.lifeTimer.remove(false);
    if (this.def.explodes && this.scene.weapons) this.scene.weapons.explode(this.x, this.y);
    else this.scene.weapons?.puff(this.x, this.y);
    this.destroy();
  }
}
