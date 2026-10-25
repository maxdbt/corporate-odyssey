// Common office enemies (GDD section 6) + the Christmas party colleague (level 1-1).
import Phaser from 'phaser';
import { TEX, ANIM, DEPTH, FONT } from '../../config/constants.js';
import { GameState } from '../../state/GameState.js';
import { audio } from '../../systems/Audio8bit.js';
import Enemy from './Enemy.js';
import EnemyProjectile, { arcVelocity } from './EnemyProjectile.js';
import { floatText } from './fx.js';

const sign = (v) => (v < 0 ? -1 : 1);

// Il Collega Logorroico: slowly follows the player, speech bubbles, blocks you on contact.
export class Talker extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.TALKER1, {
      kind: 'talker', hp: 1, stompable: true, isColleague: true,
      damage: { hp: 5, stress: 15 }, bodySize: [16, 30]
    });
    this.play(ANIM.TALKER_WALK);
    this.nextBubble = this.now + 1000 + Math.random() * 1500;
    this.dir = props.dir || -1;
  }

  think(now) {
    const p = this.target;
    const hostile = GameState.levelMods.colleaguesHostile;
    let vx = 0;
    // After blocking the player, back off and chat in place for a while so the player can escape.
    if (now < (this.calmUntil || 0)) {
      vx = now < this.calmUntil - 2600 ? -this.dir * 70 : 0;
    } else if (p) {
      const dx = p.x - this.x;
      const range = hostile ? 2000 : 380;
      if (Math.abs(dx) < range && Math.abs(dx) > 6) {
        this.dir = sign(dx);
        vx = this.dir * (hostile ? 95 : 42) * this.speedMult();
        if (this.onGround() && !this.groundAhead(this.dir) && !hostile) vx = 0;
      }
    }
    this.body.setVelocityX(vx);
    this.setFlipX(this.dir < 0);
    if (vx === 0) this.anims.pause(); else this.anims.resume();

    if (now > this.nextBubble) {
      this.nextBubble = now + 2200 + Math.random() * 1500;
      this.speak();
    }
  }

  speak() {
    const lines = ['BLA BLA', 'SAI CHE..', 'IL MIO WEEKEND', 'TI RACCONTO', 'BLA BLA BLA'];
    const bx = this.x + 10 * this.dir, by = this.y - 36;
    if (this.scene.textures.exists(TEX.BUBBLE)) {
      const b = this.scene.add.image(bx, by, TEX.BUBBLE).setDepth(DEPTH.FX).setOrigin(0.5, 1);
      this.scene.tweens.add({ targets: b, y: by - 18, alpha: 0, duration: 1400, onComplete: () => b.destroy() });
    }
    floatText(this.scene, bx, by - 14, Phaser.Utils.Array.GetRandom(lines), '#ffffff', 8, 1400);
  }

  onPlayerContact(player) {
    if (this.dead || this.isStunned() || player.hasStatus('stuck') || this.now < (this.calmUntil || 0)) return;
    if (player.takeDamage(this.damage.hp, this.damage.stress, this.x)) {
      player.applyStatus('stuck', 1500);
      // Invulnerable for the block + 1.5 s afterwards, so nobody can chain-block the player.
      player.applyStatus('invuln', 3000);
      this.calmUntil = this.now + 3500;
      floatText(this.scene, player.x, player.y - 34, 'BLOCCATO!', '#ffcc00', 10);
    }
  }
}

// Le Conf Call: flying headsets swooping in parabolas from above.
export class ConfCall extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.CONFCALL1, {
      kind: 'confcall', hp: 1, stompable: true, flying: true, damage: { hp: 8, stress: 8 }
    });
    this.play(ANIM.CONFCALL_FLY);
    this.homeY = y;
    this.range = props.range || 240;
    this.state = 'hover';
    this.nextSwoop = this.now + 800 + Math.random() * 800;
    this.body.setSize(18, 12);
  }

  think(now, delta) {
    const p = this.target;
    const dt = delta / 1000;
    const m = this.speedMult();
    if (this.state === 'hover') {
      this.y += (this.homeY + Math.sin(now / 300) * 6 - this.y) * Math.min(1, dt * 3);
      if (p) {
        const dx = p.x - this.x;
        this.x += Phaser.Math.Clamp(dx, -1, 1) * 30 * m * dt;
        this.setFlipX(dx < 0);
        if (Math.abs(dx) < this.range && now > this.nextSwoop && p.y > this.y + 30) {
          this.state = 'swoop';
          this.t = 0;
          this.sx = this.x; this.sy = this.y;
          this.ex = this.x + dx * 2;
          this.depthY = Math.max(40, p.y - 14 - this.y);
          this.dur = 1.3;
          audio.sfx('quiz');
        }
      }
    } else {
      this.t += (dt * m) / this.dur;
      const t = Math.min(1, this.t);
      this.x = Phaser.Math.Linear(this.sx, this.ex, t);
      this.y = this.sy + this.depthY * 4 * t * (1 - t);
      this.setFlipX(this.ex < this.sx);
      if (t >= 1) {
        this.state = 'hover';
        this.homeY = this.sy;
        this.nextSwoop = now + 1600 + Math.random() * 1000;
      }
    }
  }
}

// I Clienti dall'Inferno: pop out of desks and shoot horizontal flames.
export class ClientHell extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.CLIENTHELL, {
      kind: 'clienthell', hp: 1, stompable: true, damage: { hp: 10, stress: 10 }, immovable: true
    });
    this.body.setAllowGravity(false);
    this.setBodyBottom(18, 24);
    this.dir = props.dir || -1;
    this.up = false;
    this.nextToggle = this.now + 1000;
    this.setScale(1, 0.05);
    this.body.enable = false;
  }

  think(now) {
    const p = this.target;
    if (p) this.dir = sign(p.x - this.x);
    this.setFlipX(this.dir < 0);
    const near = p && Math.abs(p.x - this.x) < 380 && Math.abs(p.y - this.y) < 160;
    if (now < this.nextToggle) return;
    if (!this.up && near) {
      this.up = true;
      this.nextToggle = now + 2600;
      this.scene.tweens.add({ targets: this, scaleY: 1, duration: 200, ease: 'Back.easeOut' });
      this.body.enable = true;
      this.later(450, () => this.shoot());
      this.later(1500, () => this.shoot());
    } else if (this.up) {
      this.up = false;
      this.nextToggle = now + 1800;
      this.body.enable = false;
      this.scene.tweens.add({ targets: this, scaleY: 0.05, duration: 200 });
    }
  }

  shoot() {
    if (!this.up) return;
    const vx = 210 * this.dir * this.speedMult();
    new EnemyProjectile(this.scene, this.x + this.dir * 14, this.y - 14, TEX.FLAME, {
      vx, damage: { hp: 10, stress: 8 }, lifespan: 2600
    });
  }
}

// Il "Ti rubo solo un minuto": anthropomorphic clock charging in a straight line.
export class Minute extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.MINUTE1, {
      kind: 'minute', hp: 1, stompable: true, damage: { hp: 10, stress: 12 }, bodySize: [16, 20]
    });
    this.play(ANIM.MINUTE_RUN);
    this.anims.pause();
    this.range = props.range || 260;
    this.state = 'idle';
    this.dir = props.dir || -1;
    this.until = 0;
  }

  think(now) {
    const p = this.target;
    const m = this.speedMult();
    this.setFlipX(this.dir < 0);
    switch (this.state) {
      case 'idle':
        this.body.setVelocityX(0);
        if (p && Math.abs(p.x - this.x) < this.range && Math.abs(p.y - this.y) < 60) {
          this.dir = sign(p.x - this.x);
          this.state = 'warn';
          this.until = now + 300;
          floatText(this.scene, this.x, this.y - 24, '!', '#ff3030', 14, 500);
        }
        break;
      case 'warn':
        this.x += Math.sin(now / 20) * 0.6;
        if (now > this.until) {
          this.state = 'charge';
          this.until = now + 1400;
          this.anims.resume();
        }
        break;
      case 'charge':
        this.body.setVelocityX(380 * this.dir * m);
        if (now > this.until || this.body.blocked.left || this.body.blocked.right) {
          this.state = 'rest';
          this.until = now + 1000;
          this.anims.pause();
        }
        break;
      case 'rest':
        this.body.setVelocityX(0);
        if (now > this.until) { this.state = 'idle'; this.dir = -this.dir; }
        break;
    }
  }
}

// I Bug di sistema: small monsters moving totally at random.
export class Bug extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.BUG1, {
      kind: 'bug', hp: 1, stompable: true, damage: { hp: 6, stress: 6 }, bodySize: [14, 10]
    });
    this.play(ANIM.BUG_WIGGLE);
    this.dir = Math.random() < 0.5 ? -1 : 1;
    this.speed = 80;
    this.nextChange = 0;
  }

  think(now) {
    if (now > this.nextChange) {
      this.nextChange = now + 200 + Math.random() * 700;
      this.dir = Math.random() < 0.5 ? -1 : 1;
      this.speed = 30 + Math.random() * 140;
      if (this.onGround() && Math.random() < 0.35) this.body.setVelocityY(-180 - Math.random() * 160);
      if (Math.random() < 0.15) this.speed = 0;
    }
    if (this.onGround() && !this.groundAhead(this.dir)) this.dir = -this.dir;
    if (this.body.blocked.left) this.dir = 1;
    if (this.body.blocked.right) this.dir = -1;
    this.body.setVelocityX(this.dir * this.speed * this.speedMult());
    this.setFlipX(this.dir < 0);
    // Glitchy look
    this.setAlpha(Math.random() < 0.05 ? 0.4 : 1);
  }
}

// Collega festaiolo (Natale in ufficio): dances and throws bouncing panettone slices.
export class Party extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.PARTY1, {
      kind: 'party', hp: 1, stompable: true, isColleague: true,
      damage: { hp: 3, stress: 20 }, bodySize: [16, 30]
    });
    this.play(ANIM.PARTY_DANCE);
    this.dir = props.dir || -1;
    this.nextThrow = this.now + 1000 + Math.random() * 1000;
  }

  think(now) {
    this.body.setVelocityX(0);
    const p = this.target;
    if (!p) return;
    const dx = p.x - this.x;
    this.dir = sign(dx);
    this.setFlipX(this.dir < 0);
    const hostile = GameState.levelMods.colleaguesHostile;
    if (Math.abs(dx) < 450 && now > this.nextThrow) {
      this.nextThrow = now + (hostile ? 1100 : 2300);
      new EnemyProjectile(this.scene, this.x + this.dir * 8, this.y - 26, TEX.PANETTONE, {
        vx: (130 + Math.random() * 60) * this.dir * this.speedMult(), vy: -300, gravity: true,
        bounces: 3, bounceVy: 280, spin: 360 * this.dir, lifespan: 5000,
        damage: { hp: 5, stress: 8 }, flipWithDir: false
      });
      if (Math.random() < 0.3) floatText(this.scene, this.x, this.y - 34, 'AUGURI!', '#ff4040', 8);
    }
  }

  onPlayerContact(player) {
    if (this.dead || this.isStunned()) return;
    if (player.takeDamage(this.damage.hp, this.damage.stress, this.x)) {
      const ui = this.scene.scene.get('UIScene');
      if (ui && ui.fog) ui.fog(3000);
      floatText(this.scene, player.x, player.y - 34, '-LUCIDITA\'', '#ff80ff', 10);
    }
  }
}

// Teams icon 16x16 (purple tile, white "T", red notification badge), generated once.
export function ensureTeamsIconTexture(scene) {
  if (scene.textures.exists('teams_icon')) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(0x000000).fillRect(1, 3, 13, 13);
  g.fillStyle(0x5b5fc7).fillRect(2, 4, 11, 11);
  g.fillStyle(0x7b83eb).fillRect(2, 4, 11, 2);
  g.fillStyle(0xffffff).fillRect(4, 7, 7, 2).fillRect(6, 9, 3, 5);
  g.fillStyle(0x000000).fillRect(10, 0, 6, 6);
  g.fillStyle(0xe8323c).fillRect(11, 1, 4, 4);
  g.fillStyle(0xffffff).fillRect(13, 2, 1, 2);
  g.generateTexture('teams_icon', 16, 16);
  g.destroy();
}

// Icona di Teams: hops towards the player pinging notifications. Stomp it; a touch only adds stress.
export class TeamsIcon extends Enemy {
  constructor(scene, x, y, props = {}) {
    ensureTeamsIconTexture(scene);
    super(scene, x, y, 'teams_icon', {
      kind: 'teamsicon', hp: 1, stompable: true, damage: { hp: 0, stress: props.stress ?? 15 }, bodySize: [12, 13]
    });
    this.setScale(1.25);
    this.dir = props.dir ?? -1;
    this.nextHop = scene.time.now + 400 + Math.random() * 800;
    this.wasGround = true;
  }

  think(now) {
    const p = this.target;
    const ground = this.onGround();
    if (ground && !this.wasGround) {
      // Landing squash
      this.scene.tweens.add({ targets: this, scaleX: 1.5, scaleY: 1, duration: 80, yoyo: true });
    }
    this.wasGround = ground;
    if (ground) {
      this.body.setVelocityX(0);
      if (now > this.nextHop) {
        if (p && Math.abs(p.x - this.x) < 320) this.dir = sign(p.x - this.x);
        else if (!this.groundAhead(this.dir) || this.body.blocked.left || this.body.blocked.right) this.dir = -this.dir;
        this.body.setVelocity(this.dir * 90 * this.speedMult(), -260 - Math.random() * 60);
        this.nextHop = now + 700 + Math.random() * 600;
        if (p && Math.abs(p.x - this.x) < 240 && Math.random() < 0.4) {
          floatText(this.scene, this.x, this.y - 22, 'PING!', '#b4b8ff', 8, 600);
        }
      }
    }
    this.setFlipX(false);
  }

  onPlayerContact(player) {
    if (this.dead || this.isStunned()) return;
    if (player.takeDamage(0, this.damage.stress, this.x)) {
      audio.sfx('alarm');
      floatText(this.scene, player.x, player.y - 44, 'HAI 99+ NOTIFICHE!', '#b4b8ff', 9, 1000);
    }
  }
}
