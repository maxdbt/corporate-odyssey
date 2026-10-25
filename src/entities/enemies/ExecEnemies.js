// Mondo 5 enemies (executive floors): Yes-Man, Consulente Strategico, Segretaria with the badge gate.
import Phaser from 'phaser';
import { DEPTH } from '../../config/constants.js';
import { GameState } from '../../state/GameState.js';
import { audio } from '../../systems/Audio8bit.js';
import { ensureExecTextures } from '../../gfx/exec.js';
import Enemy from './Enemy.js';
import EnemyProjectile, { arcVelocity } from './EnemyProjectile.js';
import { floatText, sparks } from './fx.js';

const sign = (v) => (v < 0 ? -1 : 1);
const YES_CAP = 6;        // Yes-Men alive at the same time in a level
const YES_GENERATIONS = 2; // a clone of a clone does not clone again

// Yes-Man: follows you nodding and agreeing; every few seconds he "multiplies" (a clone hops out).
export class YesMan extends Enemy {
  constructor(scene, x, y, props = {}) {
    ensureExecTextures(scene);
    super(scene, x, y, 'yesman1', {
      kind: 'yesman', hp: 1, stompable: true, damage: { hp: 5, stress: 8 }, bodySize: [14, 30]
    });
    this.gen = props.gen || 0;
    this.dir = -1;
    this.nextClone = this.now + 3000 + Math.random() * 1500;
    scene.yesmen = (scene.yesmen || 0) + 1;
    this.once('destroy', () => { scene.yesmen = Math.max(0, (scene.yesmen || 1) - 1); });
  }

  think(now) {
    const p = this.target;
    let speed = 0;
    if (p && Math.abs(p.x - this.x) < 320 && Math.abs(p.body.bottom - this.body.bottom) < 120) {
      this.dir = sign(p.x - this.x);
      speed = Math.abs(p.x - this.x) < 8 ? 0 : 75;
      if (this.gen < YES_GENERATIONS && now > this.nextClone && (this.scene.yesmen || 0) < YES_CAP && this.onGround()) this.clone(now);
    }
    if (this.onGround() && !this.groundAhead(this.dir)) speed = 0;
    this.body.setVelocityX(this.dir * speed * this.speedMult());
    this.setFlipX(this.dir < 0);
    this.setTexture(Math.floor(now / 220) % 2 ? 'yesman2' : 'yesman1');
  }

  clone(now) {
    this.nextClone = now + 5000;
    floatText(this.scene, this.x, this.y - 34, Phaser.Utils.Array.GetRandom(['SI\', CAPO!', 'GIUSTISSIMO!', 'OTTIMA IDEA!', 'CONCORDO!']), '#d0d0ff', 8, 800);
    sparks(this.scene, this.x, this.y - 16, 0xd0d0ff, 5);
    const c = this.scene.spawnEnemy('yesman', this.x - this.dir * 16, this.y - 2, { gen: this.gen + 1 });
    if (c?.body) c.body.setVelocity(-this.dir * 90, -240);
  }
}

// Consulente Strategico: paces, faces you and throws PowerPoint slides in an arc.
export class Strategist extends Enemy {
  constructor(scene, x, y, props = {}) {
    ensureExecTextures(scene);
    super(scene, x, y, 'strategist1', {
      kind: 'strategist', hp: 2, stompable: true, damage: { hp: 8, stress: 6 }, bodySize: [16, 32]
    });
    this.homeX = x;
    this.range = props.range ?? 50;
    this.dir = -1;
    this.nextThrow = this.now + 1200 + Math.random() * 800;
    this.poseUntil = 0;
  }

  think(now) {
    const p = this.target;
    if (Math.abs(this.x - this.homeX) > this.range) this.dir = sign(this.homeX - this.x);
    let speed = 30;
    if (p && Math.abs(p.x - this.x) < 380 && Math.abs(p.y - this.y) < 170) {
      if (now > this.nextThrow) this.throwSlide(p, now);
      this.setFlipX(p.x < this.x);
      speed = 0;
    } else this.setFlipX(this.dir < 0);
    if (this.onGround() && !this.groundAhead(this.dir)) this.dir = -this.dir;
    this.body.setVelocityX(this.dir * speed * this.speedMult());
    this.setTexture(now < this.poseUntil ? 'strategist2' : 'strategist1');
  }

  throwSlide(p, now) {
    this.nextThrow = now + 2200 + Math.random() * 700;
    this.poseUntil = now + 300;
    const sx = this.x + (p.x < this.x ? -8 : 8);
    const sy = this.y - 28;
    const v = arcVelocity(sx, sy, p.x + (p.body?.velocity.x || 0) * 0.3, p.y - 14, 0.85);
    new EnemyProjectile(this.scene, sx, sy, 'ppt_slide', {
      vx: v.vx, vy: v.vy, gravity: true, spin: 360, lifespan: 3000, damage: { hp: 6, stress: 8 }, flipWithDir: false
    });
    audio.sfx('shoot');
    if (Math.random() < 0.6) {
      floatText(this.scene, this.x, this.y - 36, Phaser.Utils.Array.GetRandom(['SLIDE 47 DI 120!', 'PARADIGMA!', 'BEST PRACTICE!', 'QUICK WIN!', 'FRAMEWORK!']), '#ffb060', 8, 800);
    }
  }
}

// Segretaria: guards a glass gate. Without the VIP badge ("HA UN APPUNTAMENTO?") she pushes you back;
// pick up the badge (props.badge = [x, y]) and she opens the gate. She cannot be hurt.
export class Secretary extends Enemy {
  constructor(scene, x, y, props = {}) {
    ensureExecTextures(scene);
    super(scene, x, y, 'secretary1', {
      kind: 'secretary', hp: 1, stompable: false, invulnerable: true, immovable: true,
      damage: { hp: 0, stress: 5 }, bodySize: [18, 32]
    });
    this.body.setAllowGravity(false); // immovable bodies are not separated from the floor
    this.setFlipX(true);
    this.nextTalk = 0;
    this.pushUntil = 0;
    this.poseUntil = 0;
    this.opened = false;
    scene.hasBadge = false;

    // Gate: a glass pane whose body reaches far above the screen (no jumping over it).
    const gx = x + (props.gateDx ?? 30);
    const gate = this.attach(scene.add.image(gx, y, 'exec_gate').setOrigin(0.5, 1).setDepth(DEPTH.PLATFORMS + 1));
    scene.physics.add.existing(gate);
    scene.obstacles.add(gate);
    gate.body.setAllowGravity(false);
    gate.body.setImmovable(true);
    const h = y + 300;
    gate.body.setSize(16, h, false);
    gate.body.setOffset(0, gate.height - h);
    gate.hit = () => {
      if (this.now < (gate.saidAt || 0)) return;
      gate.saidAt = this.now + 1200;
      floatText(scene, gx, y - 120, 'VETRO BLINDATO', '#9ad4f0', 8, 700);
    };
    this.gate = gate;
    this.sign = this.attach(scene.add.text(gx, y - 128, 'SOLO SU\nAPPUNTAMENTO', {
      fontFamily: 'monospace', fontSize: '9px', fontStyle: 'bold', color: '#ff8080', stroke: '#000', strokeThickness: 3, align: 'center'
    }).setOrigin(0.5, 1).setDepth(DEPTH.FX));

    if (props.badge) this.makeBadge(...props.badge);
  }

  makeBadge(bx, by) {
    const scene = this.scene;
    const b = this.attach(scene.physics.add.image(bx, by, 'vip_badge').setScale(1.5).setDepth(DEPTH.ITEMS));
    b.body.setAllowGravity(false);
    const glow = this.attach(scene.add.circle(bx, by, 14, 0xffd800, 0.25).setDepth(DEPTH.ITEMS - 1));
    const label = this.attach(scene.add.text(bx, by - 24, 'BADGE VIP', {
      fontFamily: 'monospace', fontSize: '8px', fontStyle: 'bold', color: '#ffd800', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(DEPTH.FX));
    scene.tweens.add({ targets: [b, glow, label], y: '-=6', duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.physics.add.overlap(scene.player, b, () => {
      if (!b.active || scene.hasBadge) return;
      scene.hasBadge = true;
      [b, glow, label].forEach((o) => { scene.tweens.killTweensOf(o); o.destroy(); });
      audio.sfx('powerup');
      scene.ui?.message?.('BADGE VIP!\nORA LA SEGRETARIA TI FA PASSARE', '#ffd800', 1800);
    });
  }

  think(now) {
    this.body.setVelocityX(0);
    const p = this.target;
    const dist = p ? Math.abs(p.x - this.x) : Infinity;
    if (!this.opened && this.scene.hasBadge && dist < 130) this.open();
    else if (!this.opened && dist < 150 && now > this.nextTalk) {
      this.nextTalk = now + 2600;
      this.poseUntil = now + 900;
      floatText(this.scene, this.x, this.y - 38, 'HA UN APPUNTAMENTO?', '#ffb0d0', 9, 1200);
    }
    this.setTexture(now < this.poseUntil ? 'secretary2' : 'secretary1');
  }

  open() {
    this.opened = true;
    this.poseUntil = 0;
    floatText(this.scene, this.x, this.y - 38, 'PREGO, LA ASPETTANO.', '#9dffb0', 9, 1400);
    audio.sfx('checkpoint');
    this.gate.body.enable = false;
    this.scene.tweens.add({ targets: this.gate, alpha: 0.15, duration: 400 });
    this.sign.setText('PREGO').setColor('#9dffb0');
  }

  onPlayerContact(player) {
    if (this.opened || this.now < this.pushUntil) return;
    this.pushUntil = this.now + 1200;
    this.poseUntil = this.now + 900;
    player.body.setVelocity(player.x < this.x ? -300 : 300, -200);
    GameState.addStress(this.damage.stress);
    audio.sfx('hurt');
    this.scene.ui?.message?.('SERVE IL BADGE VIP!', '#ff8080', 1200);
  }

  // Nothing gets past her: e-mails, stomps and even the promotion just bounce off.
  hit() {
    this.flash();
    if (this.now < this.pushUntil) return;
    floatText(this.scene, this.x, this.y - 38, 'NON SI PASSA!', '#ffb0d0', 8, 700);
  }

  destroy(fromScene) {
    if (this.gate?.body && !fromScene) this.gate.body.enable = false;
    super.destroy(fromScene);
  }
}

