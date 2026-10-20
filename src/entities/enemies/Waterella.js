// Waterella: surprise monster that floods the whole screen.
import Phaser from 'phaser';
import { TEX, ANIM, DEPTH } from '../../config/constants.js';
import { GameState } from '../../state/GameState.js';
import { audio } from '../../systems/Audio8bit.js';
import Enemy from './Enemy.js';
import { bigText, floatText } from './fx.js';

export default class Waterella extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.WATERELLA1, {
      kind: 'waterella', hp: 3, stompable: true, damage: { hp: 10, stress: 10 }, bodySize: [24, 36]
    });
    this.play(ANIM.WATERELLA_IDLE);
    this.floodTop = props.floodTop ?? 200;
    this.duration = props.duration ?? 8000;
    this.state = 'hidden';
    this.waterTop = null;
    this.hitCooldown = 0;
    this.setAlpha(0);
    this.body.enable = false;
    this.body.setAllowGravity(false);

    this.water = this.attach(scene.add.rectangle(0, 0, 10, 10, 0x2a6cff, 0.4).setOrigin(0, 0).setDepth(DEPTH.WATER).setVisible(false));
    this.waterEdge = this.attach(scene.add.rectangle(0, 0, 10, 3, 0xa8d8ff, 0.8).setOrigin(0, 0).setDepth(DEPTH.WATER).setVisible(false));
  }

  get worldBottom() { return this.scene.physics.world.bounds.bottom; }

  think(now, delta) {
    const p = this.target;
    if (this.state === 'hidden') {
      if (p && p.x > this.x - 200) this.emerge();
      return;
    }
    this.updateWater(now, delta);
    if (this.state === 'emerging') return;

    // Swim towards the player slowly during the flood, otherwise hover around home.
    const m = this.speedMult();
    if (p) {
      const flooded = this.waterTop !== null && this.waterTop < this.worldBottom - 20;
      const tx = p.x, ty = flooded ? Math.max(this.waterTop + 30, p.y - 10) : this.homeY;
      const ang = Phaser.Math.Angle.Between(this.x, this.y, tx, ty);
      const sp = (flooded ? 60 : 30) * m;
      this.body.setVelocity(Math.cos(ang) * sp, Math.sin(ang) * sp);
      this.setFlipX(tx < this.x);
    }

    if (this.state === 'cooldown' && now > this.until) this.startFlood();
  }

  emerge() {
    this.state = 'emerging';
    this.body.enable = true;
    this.homeY = this.y - 20;
    this.setAlpha(1);
    this.setScale(1, 0.1);
    audio.sfx('splash');
    bigText(this.scene, 'WATERELLA!\nALLAGA TUTTO!', '#60b0ff', 1400);
    this.scene.tweens.add({
      targets: this, scaleY: 1, y: this.y - 20, duration: 600, ease: 'Back.easeOut',
      onComplete: () => { if (this.active && !this.dead) this.startFlood(); }
    });
  }

  startFlood() {
    this.state = 'flood';
    this.floodStart = this.now;
    this.until = this.now + this.duration;
    audio.sfx('splash');
    floatText(this.scene, this.x, this.y - 44, 'SPLASH!', '#a8d8ff', 12);
  }

  // Water level animation: rise 2 s, hold, recede 2 s.
  updateWater(now, delta) {
    const bottom = this.worldBottom;
    let top = null;
    if (this.state === 'flood') {
      const t = now - this.floodStart;
      const rise = 2000, total = this.duration;
      if (t < rise) top = Phaser.Math.Linear(bottom, this.floodTop, t / rise);
      else if (t < total - 2000) top = this.floodTop;
      else if (t < total) top = Phaser.Math.Linear(this.floodTop, bottom, (t - (total - 2000)) / 2000);
      else {
        this.state = 'cooldown';
        this.until = now + 6000;
      }
    } else if (this.state === 'draining') {
      this.waterTop = Math.min(bottom, (this.waterTop ?? bottom) + delta * 0.4);
      top = this.waterTop >= bottom ? null : this.waterTop;
    }
    this.waterTop = top;

    const cam = this.scene.cameras.main.worldView;
    if (top === null || top >= bottom) {
      this.water.setVisible(false);
      this.waterEdge.setVisible(false);
      return;
    }
    const x = cam.x - 50, w = cam.width + 100;
    this.water.setVisible(true).setPosition(x, top).setSize(w, bottom - top);
    this.waterEdge.setVisible(true).setPosition(x, top + Math.sin(now / 200) * 1.5).setSize(w, 3);

    const p = this.target;
    if (p && p.y > top + 10) {
      p.env.underwater = true;
      GameState.addHp(-(delta / 1000) * 2);
      if (Math.random() < 0.03) floatText(this.scene, p.x, p.y - 30, 'o', '#ffffff', 8, 600);
    }
  }

  hit(amount, type) {
    if (this.state === 'hidden') return;
    const now = this.now;
    if (now < this.hitCooldown) return;
    this.hitCooldown = now + 400;
    super.hit(1, type);
  }

  die(type) {
    if (this.dead) return;
    // Defeating her drains the water: keep a separate drain animation alive after destroy.
    const scene = this.scene;
    const top = this.waterTop;
    if (top !== null && scene) {
      const bottom = this.worldBottom;
      const cam = scene.cameras.main.worldView;
      const r = scene.add.rectangle(cam.x - 50, top, cam.width + 100, bottom - top, 0x2a6cff, 0.4)
        .setOrigin(0, 0).setDepth(DEPTH.WATER);
      scene.tweens.add({ targets: r, y: bottom, alpha: 0, duration: 1200, onComplete: () => r.destroy() });
    }
    floatText(scene, this.x, this.y - 40, 'ACQUA DEFLUITA!', '#a8d8ff', 10, 1200);
    super.die(type === 'stomp' ? 'pop' : type);
  }
}
