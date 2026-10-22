// Trip (Mondo 4) characters: the airport sniffer dog and the station pickpocket.
import Phaser from 'phaser';
import { TEX } from '../../config/constants.js';
import { GameState } from '../../state/GameState.js';
import { audio } from '../../systems/Audio8bit.js';
import { PRICES } from '../../data/trip.js';
import Enemy from './Enemy.js';
import { floatText } from './fx.js';

const sign = (v) => (v < 0 ? -1 : 1);

// Two-frame walk without an animation entry: toggles the texture while moving.
function stepFrames(enemy, now, a, b, ms = 140) {
  if (Math.abs(enemy.body.velocity.x) < 5) enemy.setTexture(a);
  else enemy.setTexture(Math.floor(now / ms) % 2 ? b : a);
}

// Cane antidroga: patrols, then runs at you. If it reaches you: "PERQUISIZIONE!" (blocked + stress).
// It finds nothing, sits down happy and never bothers you again. Cannot be hurt.
export class Sniffer extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.DOG1, {
      kind: 'sniffer', hp: 99, stompable: false, invulnerable: true, damage: { hp: 0, stress: 0 }, bodySize: [24, 18]
    });
    this.homeX = x;
    this.patrol = props.patrol || 150;
    this.dir = -1;
    this.state = 'patrol';
    this.barkAt = 0;
  }

  think(now) {
    const p = this.target;
    if (this.state === 'done') {
      this.body.setVelocityX(0);
      this.setTexture(TEX.DOG1).setAngle(Math.sin(now / 90) * 3);
      return;
    }
    let speed = 50;
    if (p && Math.abs(p.x - this.x) < 240 && Math.abs(p.body.bottom - this.body.bottom) < 40 && !p.hasStatus('invuln')) {
      if (this.state !== 'chase') {
        this.state = 'chase';
        floatText(this.scene, this.x, this.y - 22, 'WOOF! WOOF!', '#ffd800', 9, 800);
        audio.sfx('alarm');
      }
      this.dir = sign(p.x - this.x);
      speed = 175;
    } else {
      this.state = 'patrol';
      if (this.x < this.homeX - this.patrol) this.dir = 1;
      if (this.x > this.homeX + this.patrol) this.dir = -1;
      if (now > this.barkAt) {
        this.barkAt = now + Phaser.Math.Between(2500, 4500);
        floatText(this.scene, this.x, this.y - 22, 'SNIFF SNIFF', '#ffffff', 7, 700);
      }
    }
    if (this.body.blocked.left) this.dir = 1;
    if (this.body.blocked.right) this.dir = -1;
    this.body.setVelocityX(this.dir * speed * this.speedMult());
    this.setFlipX(this.dir < 0);
    stepFrames(this, now, TEX.DOG1, TEX.DOG2, this.state === 'chase' ? 90 : 160);
  }

  onPlayerContact(player) {
    if (this.state === 'done' || player.hasStatus('invuln') || player.hasStatus('promotion')) return;
    this.state = 'done';
    this.scene.tripLevel?.search(player);
  }

  // A police dog cannot be stomped, shot or rammed.
  hit() { this.flash(); }
}

// Borseggiatore: lurks in the crowd, then runs at you. If he touches you he steals budget and
// runs away; stomp (or shoot) him to get the wallet back.
export class Pickpocket extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.THIEF1, {
      kind: 'pickpocket', hp: 1, stompable: true, damage: { hp: 0, stress: 0 }, bodySize: [16, 30]
    });
    this.state = 'lurk';
    this.stolen = 0;
    this.dir = -1;
    this.lookAt = 0;
  }

  think(now) {
    const p = this.target;
    let speed = 0;
    if (this.state === 'flee') {
      speed = 280;
      const view = this.scene.cameras.main.worldView;
      if (this.x < view.x - 200 || this.x > view.right + 200) { this.destroy(); return; }
    } else if (p && Math.abs(p.x - this.x) < 320 && Math.abs(p.body.bottom - this.body.bottom) < 40) {
      if (this.state !== 'run') floatText(this.scene, this.x, this.y - 36, 'PERMESSO...', '#cccccc', 8, 700);
      this.state = 'run';
      this.dir = sign(p.x - this.x);
      speed = 200;
    } else {
      this.state = 'lurk';
      if (now > this.lookAt) { this.lookAt = now + 900; this.dir = -this.dir; }
    }
    if (this.onGround() && !this.groundAhead(this.dir)) speed = 0;
    this.body.setVelocityX(this.dir * speed * this.speedMult());
    this.setFlipX(this.dir < 0);
    stepFrames(this, now, TEX.THIEF1, TEX.THIEF2, 100);
  }

  onPlayerContact(player) {
    if (this.state === 'flee' || this.dead || player.hasStatus('invuln')) return;
    this.stolen = -GameState.addBudget(-PRICES.thief);
    player.applyStatus('invuln', 1200);
    audio.sfx('coin');
    this.scene.ui?.message?.(this.stolen > 0 ? `PORTAFOGLIO RUBATO! -${this.stolen} €` : 'PORTAFOGLIO VUOTO!', '#ff8080', 1500);
    floatText(this.scene, this.x, this.y - 36, 'GRAZIE!', '#ff8080', 9, 900);
    this.state = 'flee';
    this.dir = -sign(player.x - this.x) || 1;
  }

  die(type) {
    if (this.dead) return;
    if (this.stolen > 0) {
      GameState.addBudget(this.stolen);
      this.scene.ui?.message?.(`PORTAFOGLIO RECUPERATO! +${this.stolen} €`, '#7CFC00', 1500);
    } else {
      floatText(this.scene, this.x, this.y - 36, 'BECCATO!', '#7CFC00', 9, 900);
    }
    super.die(type);
  }
}
