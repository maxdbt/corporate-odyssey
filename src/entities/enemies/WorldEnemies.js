// World-specific enemies and stationary hazards (GDD section 4).
import Phaser from 'phaser';
import { TEX, ANIM } from '../../config/constants.js';
import { GameState } from '../../state/GameState.js';
import { audio } from '../../systems/Audio8bit.js';
import Enemy from './Enemy.js';
import EnemyProjectile, { arcVelocity } from './EnemyProjectile.js';
import { floatText, popFx, sparks } from './fx.js';

const sign = (v) => (v < 0 ? -1 : 1);

function onScreen(scene, x, y, margin = 0) {
  const v = scene.cameras.main.worldView;
  return x > v.x - margin && x < v.right + margin && y > v.y - margin && y < v.bottom + margin;
}

// I Guardiani del Budget: armored tuxedo employees patrolling (Mondo 5).
export class Guardian extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.GUARDIAN1, {
      kind: 'guardian', hp: 3, stompable: true, damage: { hp: 15, stress: 10 }, bodySize: [18, 32]
    });
    this.play(ANIM.GUARDIAN_WALK);
    const half = (props.patrol || 160) / 2;
    this.minX = x - half;
    this.maxX = x + half;
    this.dir = props.dir || -1;
  }

  think() {
    const p = this.target;
    let speed = 70;
    if (p && Math.abs(p.x - this.x) < 200 && Math.abs(p.y - this.y) < 50) {
      this.dir = sign(p.x - this.x);
      speed = 115;
    } else {
      if (this.x < this.minX) this.dir = 1;
      if (this.x > this.maxX) this.dir = -1;
    }
    if (this.onGround() && !this.groundAhead(this.dir)) this.dir = -this.dir;
    if (this.body.blocked.left) this.dir = 1;
    if (this.body.blocked.right) this.dir = -1;
    this.body.setVelocityX(this.dir * speed * this.speedMult());
    this.setFlipX(this.dir < 0);
  }

  hit(amount, type) {
    if (type === 'stomp') amount = 1;
    super.hit(amount, type);
    if (!this.dead && this.active) floatText(this.scene, this.x, this.y - 36, 'CORAZZATO', '#ffd700', 8, 600);
  }
}

// Squali-Consulenti: patrol in a circle (underwater).
export class Shark extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.SHARK1, {
      kind: 'shark', hp: 2, stompable: false, flying: true, damage: { hp: 12, stress: 10 }
    });
    this.play(ANIM.SHARK_SWIM);
    this.cx = x;
    this.cy = y;
    this.radius = props.radius || 60;
    this.angleT = props.phase || 0;
    this.spin = props.clockwise === false ? -1 : 1;
    this.body.setSize(38, 14);
  }

  think(now, delta) {
    this.angleT += this.spin * 1.2 * this.speedMult() * (delta / 1000);
    const nx = this.cx + Math.cos(this.angleT) * this.radius * 1.6;
    const ny = this.cy + Math.sin(this.angleT) * this.radius;
    this.setFlipX(nx < this.x);
    this.x = nx;
    this.y = ny;
  }
}

// Mine-notifica: red notification mines floating mid-water.
export class Mine extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.MINE, {
      kind: 'mine', hp: 1, stompable: false, flying: true, damage: { hp: 15, stress: 10 }
    });
    this.baseY = y;
    this.phase = Math.random() * Math.PI * 2;
    this.body.setCircle(7, 1, 1);
  }

  think(now) {
    this.y = this.baseY + Math.sin(now / 500 + this.phase) * 6;
    this.setScale(1 + Math.max(0, Math.sin(now / 150)) * 0.08);
  }

  onPlayerContact(player) {
    if (this.dead) return;
    player.takeDamage(this.damage.hp, this.damage.stress, this.x);
    this.die('explode');
  }
}

// Fotocopiatrice impazzita: shoots paper sheets horizontally.
export class Copier extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.COPIER, {
      kind: 'copier', hp: 3, stompable: false, damage: { hp: 5, stress: 5 }, immovable: true
    });
    this.dir = props.dir || -1;
    this.nextShot = this.now + 1000;
    this.setBodyBottom(30, 26);
  }

  think(now) {
    this.body.setVelocityX(0);
    const p = this.target;
    if (p) this.dir = sign(p.x - this.x);
    this.setFlipX(this.dir > 0);
    if (now > this.nextShot && onScreen(this.scene, this.x, this.y, 20)) {
      this.nextShot = now + 2000 / this.speedMult();
      this.scene.tweens.add({ targets: this, scaleX: 1.12, duration: 70, yoyo: true });
      new EnemyProjectile(this.scene, this.x + this.dir * 16, this.y - 12 - Math.random() * 8, TEX.PAPER, {
        vx: 230 * this.dir * this.speedMult(), damage: { hp: 6, stress: 6 }, lifespan: 4000
      });
    }
  }
}

// Armadio d'archivio: harmless, drops binders when the player is close.
export class Cabinet extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.CABINET, {
      kind: 'cabinet', hp: 99, stompable: false, invulnerable: true, damage: { hp: 0, stress: 0 }, immovable: true
    });
    this.nextDrop = 0;
  }

  think(now) {
    this.body.setVelocityX(0);
    const p = this.target;
    if (!p || now < this.nextDrop) return;
    const dx = p.x - this.x;
    if (Math.abs(dx) < 70 && p.y > this.y - this.height - 20) {
      this.nextDrop = now + 2500;
      this.scene.tweens.add({ targets: this, angle: 3, duration: 60, yoyo: true, repeat: 2 });
      const fx = this.x + sign(dx) * 14;
      new EnemyProjectile(this.scene, fx, this.y - this.height - 6, TEX.FOLDER, {
        vx: sign(dx) * 30, vy: -40, gravity: true, spin: 200, lifespan: 3000,
        damage: { hp: 10, stress: 10 }, flipWithDir: false
      });
    }
  }

  onPlayerContact() {}
}

// Cuoco arrabbiato: throws plastic trays in arcs.
export class Cook extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.COOK1, {
      kind: 'cook', hp: 1, stompable: true, damage: { hp: 8, stress: 5 }, bodySize: [18, 32]
    });
    this.play(ANIM.COOK_THROW);
    this.dir = props.dir || -1;
    this.nextThrow = this.now + 800 + Math.random() * 800;
  }

  think(now) {
    this.body.setVelocityX(0);
    const p = this.target;
    if (!p) return;
    const dx = p.x - this.x;
    this.dir = sign(dx);
    this.setFlipX(this.dir < 0);
    if (Math.abs(dx) < 520 && now > this.nextThrow) {
      this.nextThrow = now + 1800 / this.speedMult();
      const sx = this.x + this.dir * 10, sy = this.y - 28;
      // Lead the target a bit (player is usually running right).
      const lead = (p.body ? p.body.velocity.x : 0) * 0.9;
      const v = arcVelocity(sx, sy, p.x + lead, p.y - 16, 0.9);
      new EnemyProjectile(this.scene, sx, sy, TEX.TRAY, {
        vx: v.vx, vy: v.vy, gravity: true, spin: 540, lifespan: 3000, ignoreWalls: true,
        damage: { hp: 8, stress: 8 }, flipWithDir: false
      });
    }
  }
}

// Carrello delle pulizie: crosses right-to-left; slide under it.
export class Cart extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.CART, {
      kind: 'cart', hp: 99, stompable: false, invulnerable: true, damage: { hp: 15, stress: 10 }
    });
    // Raised cart (big laundry bag on top): bottom at surface-16 so a sliding player passes under.
    this.setScale(1.5);
    this.y = y - 16;
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.speed = props.speed || 220;
    this.surfaceY = y;
    this.shadow = this.attach(scene.add.ellipse(x, y - 2, 50, 6, 0x000000, 0.35).setDepth(this.depth - 1));
  }

  think() {
    this.body.setVelocityX(-this.speed * this.speedMult());
    this.body.setVelocityY(0);
    this.shadow.setPosition(this.x, this.surfaceY - 2);
    const v = this.scene.cameras.main.worldView;
    if (this.x < v.x - 120) this.destroy();
  }
}

// Stalattiti-scadenze: fall when the player walks under.
export class Stalactite extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.STALACTITE, {
      kind: 'stalactite', hp: 1, stompable: false, damage: { hp: 12, stress: 15 }
    });
    this.setOrigin(0.5, 0);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.state = 'hang';
  }

  think(now) {
    const p = this.target;
    if (this.state === 'hang') {
      if (p && Math.abs(p.x - this.x) < 40 && p.y > this.y) {
        this.state = 'shake';
        this.until = now + 350;
        floatText(this.scene, this.x, this.y + 40, 'SCADENZA!', '#a0e0ff', 8, 600);
      }
    } else if (this.state === 'shake') {
      this.x += Math.sin(now / 15) * 0.8;
      if (now > this.until) {
        this.state = 'fall';
        this.body.setImmovable(false);
        this.body.setAllowGravity(true);
      }
    } else if (this.state === 'fall') {
      if (this.onGround()) this.shatter();
    }
  }

  shatter() {
    sparks(this.scene, this.x, this.y + this.height, 0xa0e0ff, 8);
    audio.sfx('freeze');
    this.dead = true;
    this.destroy();
  }

  onPlayerContact(player) {
    if (this.dead) return;
    player.takeDamage(this.damage.hp, this.damage.stress, this.x);
    if (this.state === 'fall') this.shatter();
  }
}

// Cactus a forma di faldone (deserto): static, painful.
export class Cactus extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.CACTUS, {
      kind: 'cactus', hp: 99, stompable: false, invulnerable: true, damage: { hp: 10, stress: 5 },
      immovable: true, bodySize: [16, 32]
    });
  }

  think() { this.body.setVelocityX(0); }
}

// Oasi miraggio: turns into a pile of worksheets when you get close.
export class Mirage extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.MIRAGE, {
      kind: 'mirage', hp: 99, stompable: false, invulnerable: true, damage: { hp: 5, stress: 8 },
      immovable: true, bodySize: [36, 16]
    });
    this.revealed = false;
    this.setAlpha(0.85);
  }

  think(now) {
    this.body.setVelocityX(0);
    if (!this.revealed) {
      this.setAlpha(0.7 + Math.sin(now / 200) * 0.15);
      const p = this.target;
      if (p && Phaser.Math.Distance.Between(p.x, p.y, this.x, this.y) < 80) this.reveal();
    }
  }

  reveal() {
    this.revealed = true;
    this.setTexture(TEX.PAPERPILE);
    this.setAlpha(1);
    this.setBodyBottom(36, 20);
    GameState.addStress(10);
    popFx(this.scene, this.x, this.y - 12, 0.7);
    floatText(this.scene, this.x, this.y - 30, 'ERA UN MIRAGGIO! FOGLI DI LAVORO!', '#ffe080', 9, 1400);
    audio.sfx('hurt');
  }

  onPlayerContact(player) {
    if (!this.revealed) { this.reveal(); return; }
    super.onPlayerContact(player);
  }
}
