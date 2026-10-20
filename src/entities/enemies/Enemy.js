import Phaser from 'phaser';
import { DEPTH, EVENTS, FONT } from '../../config/constants.js';
import { GameState } from '../../state/GameState.js';
import { audio } from '../../systems/Audio8bit.js';
import { popFx } from './fx.js';

// Base class for every enemy. Subclasses implement think(now, delta).
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, opts = {}) {
    super(scene, x, y, texture);
    this._attached = [];
    this._timers = [];
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.enemies.add(this);

    // Body configuration must happen AFTER enemies.add (group defaults reset bodies).
    this.kind = opts.kind || 'enemy';
    this.hp = opts.hp ?? 1;
    this.maxHp = this.hp;
    this.stompable = opts.stompable ?? true;
    this.isBoss = false;
    this.isColleague = !!opts.isColleague;
    this.invulnerable = !!opts.invulnerable; // only 'ram' can destroy it
    this.damage = opts.damage || { hp: 10, stress: 5 };
    this.flying = !!opts.flying;
    this.dead = false;
    this.stunUntil = 0;
    this.slowUntil = 0;
    this.slowFactor = 1;
    this.flashUntil = 0;
    this.customTint = null;

    this.setOrigin(0.5, this.flying ? 0.5 : 1);
    this.setDepth(DEPTH.ENEMIES);
    if (this.flying) this.body.setAllowGravity(false);
    if (opts.immovable) this.body.setImmovable(true);
    if (opts.bodySize) this.setBodyBottom(opts.bodySize[0], opts.bodySize[1]);
  }

  // Body of w x h aligned to the bottom-center of the frame.
  setBodyBottom(w, h) {
    this.body.setSize(w, h, false);
    this.body.setOffset((this.width - w) / 2, this.height - h);
  }

  get now() { return this.scene ? this.scene.time.now : 0; }

  get target() {
    const p = this.scene && this.scene.player;
    if (!p || !p.active || !p.body || GameState.hp <= 0) return null;
    return p;
  }

  speedMult() {
    let m = GameState.levelMods.enemySpeedMult || 1;
    if (this.now < this.slowUntil) m *= this.slowFactor;
    return m;
  }

  isStunned() { return this.now < this.stunUntil; }

  attach(obj) { this._attached.push(obj); return obj; }

  later(ms, cb) {
    const ev = this.scene.time.delayedCall(ms, () => { if (this.active && !this.dead) cb(); });
    this._timers.push(ev);
    return ev;
  }

  // True if there is solid ground just ahead in direction dir (static bodies only).
  groundAhead(dir) {
    const b = this.body;
    const x = dir > 0 ? b.right + 1 : b.left - 3;
    return this.scene.physics.overlapRect(x, b.bottom + 1, 2, 6, false, true).length > 0;
  }

  onGround() { return this.body && (this.body.blocked.down || this.body.touching.down); }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active || !this.body || this.dead) return;
    const now = this.now;
    this.refreshVisuals(now);
    if (this.isStunned()) {
      this.body.setVelocityX(0);
      if (!this.body.allowGravity) this.body.setVelocityY(0);
      return;
    }
    this.think(now, delta);
    if (this.active && this.y > this.scene.physics.world.bounds.bottom + 300) this.destroy();
  }

  think() {}

  refreshVisuals(now) {
    if (now < this.flashUntil) this.setTintFill(0xffffff);
    else if (this.customTint !== null) this.setTint(this.customTint);
    else if (now < this.slowUntil) this.setTint(0x66aaff);
    else if (now < this.stunUntil) this.setTint(0xffff88);
    else this.clearTint();

    if (now < this.stunUntil) {
      if (!this._stars) {
        this._stars = this.attach(this.scene.add.text(this.x, this.y, '* *', {
          fontFamily: FONT, fontSize: '10px', fontStyle: 'bold', color: '#ffff00', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5, 1).setDepth(DEPTH.FX));
      }
      const top = this.flying ? this.y - this.displayHeight / 2 : this.y - this.displayHeight;
      this._stars.setPosition(this.x + Math.sin(now / 80) * 3, top - 2);
    } else if (this._stars) {
      this._stars.destroy();
      this._stars = null;
    }
  }

  flash(ms = 90) { this.flashUntil = this.now + ms; }

  onPlayerContact(player) {
    if (this.dead || this.isStunned()) return;
    player.takeDamage(this.damage.hp, this.damage.stress, this.x);
  }

  hit(amount = 1, type = 'email') {
    if (this.dead || !this.active) return;
    if (type === 'teams') this.stun(1500);
    if (type === 'clock') this.slow(4000, 0.4);
    this.flash();
    if (this.invulnerable && type !== 'ram') return;
    this.hp -= amount;
    if (this.hp <= 0) this.die(type);
    else audio.sfx(this.isBoss ? 'bossHit' : 'stomp');
  }

  stun(ms) { this.stunUntil = Math.max(this.stunUntil, this.now + ms); }

  slow(ms, factor) {
    this.slowUntil = this.now + ms;
    this.slowFactor = factor;
  }

  die(type) {
    if (this.dead) return;
    this.dead = true;
    this.scene.events.emit(EVENTS.ENEMY_KILLED, this);
    if (type === 'stomp' && !this.flying) {
      audio.sfx('stomp');
      this.body.enable = false;
      this.clearTint();
      this.scene.tweens.add({
        targets: this, scaleY: 0.25, alpha: 0, duration: 250, onComplete: () => this.destroy()
      });
    } else {
      audio.sfx('explosion');
      popFx(this.scene, this.x, this.flying ? this.y : this.y - this.displayHeight / 2);
      this.destroy();
    }
  }

  destroy(fromScene) {
    if (this._attached) {
      for (const o of this._attached) {
        if (!o || !o.scene) continue;
        if (this.scene && this.scene.tweens) this.scene.tweens.killTweensOf(o);
        o.destroy();
      }
      this._attached = [];
    }
    if (this._timers) {
      for (const t of this._timers) t.remove(false);
      this._timers = [];
    }
    if (this.scene && this.scene.tweens) this.scene.tweens.killTweensOf(this);
    super.destroy(fromScene);
  }
}
