// Trip (Mondo 4) characters: the airport sniffer dog, the station pickpocket, the petition volunteers,
// the glacier penguins and snowmen, the sea jellyfish.
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

// Volontario della raccolta firme "Salva il Lonfo nano": waits at the stand, then chases you when you
// pass by. If he catches you: blocked while you sign (stress, seconds lost). Run away or stomp him.
export class Petitioner extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.ACTIVIST1, {
      kind: 'petitioner', hp: 1, stompable: true, damage: { hp: 0, stress: 0 }, bodySize: [16, 30]
    });
    this.homeX = props.home ?? x;
    this.state = 'wait';
    this.dir = -1;
    this.chaseUntil = 0;
    this.shoutAt = 0;
  }

  think(now) {
    const p = this.target;
    let speed = 0;
    const near = p && Math.abs(p.body.bottom - this.body.bottom) < 60;
    if (this.state === 'wait') {
      if (near && Math.abs(p.x - this.x) < 140 && !p.hasStatus('invuln')) {
        this.state = 'chase';
        this.chaseUntil = now + 5000;
        floatText(this.scene, this.x, this.y - 36, 'UNA FIRMA PER IL LONFO NANO?!', '#7CFC00', 8, 900);
        audio.sfx('quiz');
      } else if (now > this.shoutAt) {
        this.shoutAt = now + Phaser.Math.Between(2500, 4000);
        floatText(this.scene, this.x, this.y - 36, Phaser.Utils.Array.GetRandom(['SALVA IL LONFO!', 'SOLO UNA FIRMA!', 'IL LONFO NON VAPOLA!']), '#b8ff9a', 7, 800);
      }
      if (p) this.dir = sign(p.x - this.x);
    } else if (this.state === 'chase') {
      if (!p || now > this.chaseUntil || Math.abs(p.x - this.x) > 420) this.state = 'back';
      else { this.dir = sign(p.x - this.x); speed = 200; }
    } else {
      // back / done: walk home, 'done' never chases again.
      if (Math.abs(this.x - this.homeX) > 6) { this.dir = sign(this.homeX - this.x); speed = 110; }
      else if (this.state === 'back') this.state = 'wait';
    }
    if (this.onGround() && !this.groundAhead(this.dir)) speed = 0;
    this.body.setVelocityX(this.dir * speed * this.speedMult());
    this.setFlipX(this.dir < 0);
    stepFrames(this, now, TEX.ACTIVIST1, TEX.ACTIVIST2, 110);
  }

  onPlayerContact(player) {
    if (this.state !== 'chase' || this.dead || player.hasStatus('invuln')) return;
    this.state = 'done';
    player.applyStatus('stuck', 2500);
    player.applyStatus('invuln', 3500);
    player.body.setVelocityX(0);
    GameState.addStress(10);
    const s = this.scene;
    s.timeLeft = Math.max(1, s.timeLeft - 5);
    audio.sfx('hurt');
    s.ui?.message?.('FIRMA QUI! E QUI! E ANCHE QUI!\nSTRESS +10%  -5s', '#7CFC00', 2000);
    floatText(s, player.x, player.y - 60, 'GRAZIE! IL LONFO TI RINGRAZIA', '#b8ff9a', 8, 1400);
  }

  die(type) {
    if (this.dead) return;
    floatText(this.scene, this.x, this.y - 36, 'FIRMERO\' ONLINE!', '#b8ff9a', 9, 900);
    super.die(type);
  }
}

// Pinguino manager (ghiacciaio): waddles back and forth; when you get close he dives and slides
// on his belly straight at you. Stompable.
export class Penguin extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.PENGUIN1, {
      kind: 'penguin', hp: 1, stompable: true, damage: { hp: 8, stress: 6 }, bodySize: [16, 18]
    });
    this.homeX = x;
    this.range = props.range || 110;
    this.dir = -1;
    this.state = 'walk';
    this.until = 0;
    this.nextSlide = 0;
  }

  think(now) {
    const p = this.target;
    let speed = 45;
    if (this.state === 'walk') {
      if (Math.abs(this.x - this.homeX) > this.range) this.dir = sign(this.homeX - this.x);
      if (p && now > this.nextSlide && Math.abs(p.x - this.x) < 230 && Math.abs(p.body.bottom - this.body.bottom) < 50) {
        this.state = 'slide';
        this.dir = sign(p.x - this.x);
        this.until = now + 1500;
        floatText(this.scene, this.x, this.y - 30, Phaser.Utils.Array.GetRandom(['SINERGIE!', 'ASAP!', 'FACCIAMO UN PUNTO!', 'ALLINEIAMOCI!']), '#a0e0ff', 7, 700);
      }
    } else {
      speed = 240;
      if (now > this.until) {
        this.state = 'walk';
        this.nextSlide = now + 2500;
      }
    }
    if (this.onGround() && !this.groundAhead(this.dir)) {
      if (this.state === 'slide') { this.state = 'walk'; this.nextSlide = now + 2500; }
      this.dir = -this.dir;
    }
    this.body.setVelocityX(this.dir * speed * this.speedMult());
    this.setFlipX(this.dir < 0);
    if (this.state === 'slide') this.setTexture(TEX.PENGUIN_SLIDE);
    else stepFrames(this, now, TEX.PENGUIN1, TEX.PENGUIN2, 200);
  }
}

// Pupazzo di neve con la cravatta (ghiacciaio): static, painful; motoslitta and skis crash into it.
export class Snowman extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, TEX.SNOWMAN, {
      kind: 'snowman', hp: 99, stompable: false, invulnerable: true, damage: { hp: 10, stress: 5 },
      immovable: true, bodySize: [18, 34]
    });
  }

  think() { this.body.setVelocityX(0); }
}

// Medusa (mare): drifts up and down and stings on contact; the submarine and the seahorse don't mind.
export class Jellyfish extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.JELLY1, {
      kind: 'jellyfish', hp: 1, stompable: false, flying: true, damage: { hp: 8, stress: 8 }, bodySize: [16, 18]
    });
    this.baseY = y;
    this.range = props.range || 50;
    this.phase = Math.random() * Math.PI * 2;
  }

  think(now) {
    this.y = this.baseY + Math.sin(now / 900 + this.phase) * this.range;
    stepFrames(this, now, TEX.JELLY1, TEX.JELLY2, 350);
  }
}
