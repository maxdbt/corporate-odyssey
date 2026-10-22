import Phaser from 'phaser';
import {
  DEPTH, EVENTS, FONT, GRAVITY, WEAPONS, WEAPON_LABEL, TEX, playerTex, playerAnim, RENDER_SCALE
} from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';

const WALK_SPEED = 160;
const RUN_SPEED = 260;
const JUMP_V = -430;
const DOUBLE_JUMP_V = -380;
const SWIM_V = -220;
const CLIMB_SPEED = 120;
const MAX_FALL = 650;
const COYOTE_MS = 80;
const JUMP_BUFFER_MS = 100;
const SLIDE_MS = 450;
const FIRE_COOLDOWN = 250;
const DRUNK_DELAY = 250;

// Body sizes per pose category (w, h). Bottom-aligned on the feet.
const BODY = {
  stand: [16, 30],
  crouch: [16, 20],
  slide: [28, 14],
  sleep: [24, 12]
};
const POSE_BODY = {
  idle: 'stand', walk1: 'stand', walk2: 'stand', jump: 'stand', climb1: 'stand', climb2: 'stand',
  hurt: 'stand', tired1: 'stand', tired2: 'stand', swim1: 'stand', swim2: 'stand',
  crouch: 'crouch', slide: 'slide', sleep: 'sleep'
};

// Trip rentals (4-7 Deserto). lift = how high the rider sits; wind = 0 immune .. 1 full headwind.
// immune: enemy kinds ignored on contact; crash: kinds that throw you off; ram: destroys what it hits.
export const MOUNTS = {
  camel: { tex: TEX.CAMEL, label: 'DROMEDARIO', body: [36, 40], lift: 16, speed: 180, run: 220, jump: -500, wind: 0, immune: ['cactus', 'mirage'] },
  moto: { tex: TEX.MOTO, label: 'MOTO', body: [36, 34], lift: 8, speed: 300, run: 360, jump: -420, wind: 0.3, crash: ['cactus'] },
  taxi: { tex: TEX.TAXI, label: 'TAXI', body: [44, 34], lift: 6, speed: 250, run: 290, jump: -400, wind: 0, ram: true }
};

const PRESSED_KEYS = ['jumpPressed', 'attackPressed', 'switchWeaponPressed', 'slidePressed'];
const NEUTRAL_INPUT = {
  left: false, right: false, up: false, down: false, jump: false, run: false,
  jumpPressed: false, attackPressed: false, switchWeaponPressed: false, slidePressed: false
};

const defaultEnv = () => ({
  speedMult: 1, windX: 0, ice: false, underwater: false, onLadder: false, ladderX: 0, heat: false, parasol: false
});

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, character) {
    super(scene, x, y, playerTex(character, 'idle'));
    this.character = character;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setDepth(DEPTH.PLAYER);

    this.facing = 1;
    this.isSliding = false;
    this.isCrouching = false;
    this.isClimbing = false;
    this.env = defaultEnv();

    this.clock = 0;               // own clock: does not advance while the scene is paused
    this.statuses = new Map();    // name -> end time (this.clock based)
    this.lastGroundedAt = -9999;
    this.jumpBufferedAt = -9999;
    this.doubleJumpUsed = false;
    this.jumpCutAvailable = false;
    this.slideUntil = 0;
    this.nextFireAt = 0;
    this.hurtUntil = 0;
    this.nextSneezeAt = 0;
    this.nextZzzAt = 0;
    this.inputQueue = [];
    this.lastDelayedInput = { ...NEUTRAL_INPUT };
    this.currentPose = null;
    this.bodyCategory = null;
    this.wasUnderwater = false;
    this.wasPanicking = false;

    this.shieldGfx = scene.add.graphics().setDepth(DEPTH.PLAYER + 1);
    this.mount = null;            // { type, cfg, sprite, nextBalk, balkUntil }
    this.parasol = null;
    this._setPose('idle');
  }

  // ---------------------------------------------------------------- mounts (trip)

  mountUp(type) {
    const cfg = MOUNTS[type];
    if (!cfg) return;
    this.dismount(true);
    this.isSliding = false;
    this.isCrouching = false;
    this._endClimb();
    const sprite = this.scene.add.image(this.x, this.y, cfg.tex).setOrigin(0.5, 1).setDepth(DEPTH.PLAYER + 1);
    this.mount = { type, cfg, sprite, nextBalk: this.clock + Phaser.Math.Between(5000, 8000), balkUntil: 0 };
    this.bodyCategory = null;
    this._setPose('idle');
    if (this.body) this.y -= cfg.lift;
    this._floatText(cfg.label + '!', '#ffd800');
  }

  // silent = no tumble animation (replaced by another mount or level end).
  dismount(silent = false) {
    const m = this.mount;
    if (!m) return;
    this.mount = null;
    if (silent) m.sprite.destroy();
    else {
      this.scene.tweens.add({
        targets: m.sprite, x: m.sprite.x - this.facing * 60, y: m.sprite.y - 30, angle: -this.facing * 200, alpha: 0,
        duration: 700, onComplete: () => m.sprite.destroy()
      });
    }
    this.bodyCategory = null;
    this._applyBody(POSE_BODY[this.currentPose] || 'stand');
  }

  // How the mount reacts to touching an enemy: 'immune' | 'crash' | 'ram' | null.
  mountContact(enemy) {
    const m = this.mount;
    if (!m || enemy.isBoss) return null;
    if (m.cfg.ram) return 'ram';
    if (m.cfg.immune?.includes(enemy.kind)) return 'immune';
    if (m.cfg.crash?.includes(enemy.kind)) return 'crash';
    return null;
  }

  hasShield() {
    return this.statuses.has('shield') || this.statuses.has('upgrade');
  }

  get onGround() {
    const b = this.body;
    return !!b && (b.blocked.down || b.touching.down);
  }

  resetEnv() {
    this.env = defaultEnv();
  }

  // ---------------------------------------------------------------- statuses

  applyStatus(name, ms) {
    const end = ms === Infinity ? Infinity : this.clock + ms;
    const had = this.statuses.has(name);
    const prevEnd = had ? this.statuses.get(name) : -Infinity;
    this.statuses.set(name, Math.max(prevEnd, end));
    if (had) return;
    switch (name) {
      case 'frozen':
        audio.sfx('freeze');
        this._floatText('CONGELATO!', '#9be7ff');
        break;
      case 'cold':
        this.nextSneezeAt = this.clock + Phaser.Math.Between(700, 1400);
        break;
      case 'asleep':
        this.isSliding = false;
        this._endClimb();
        this.nextZzzAt = 0;
        break;
      case 'stuck':
        this._floatText('BLA BLA...', '#ffffff');
        break;
      case 'promotion':
        audio.sfx('powerup');
        audio.music('promotion');
        this._floatText('PROMOZIONE!', '#ffd800');
        break;
      case 'drunk':
      case 'nausea':
        if (this.statuses.has(name === 'drunk' ? 'nausea' : 'drunk')) break; // already dizzy
        this.inputQueue = [];
        this._floatText(name === 'drunk' ? 'HIC!' : 'BLEAH!', name === 'drunk' ? '#ffe680' : '#b8f070');
        break;
      case 'shield':
        this._floatText('AUTO AZIENDALE!', '#7fd4ff');
        break;
      case 'upgrade':
        this._floatText('UPGRADE BUSINESS!', '#ffd800');
        break;
      default:
        break;
    }
  }

  hasStatus(name) {
    return this.statuses.has(name);
  }

  // Drunk (spumante) and nausea (spoiled canteen food) share the same wobbly, delayed controls.
  isDizzy() {
    return this.statuses.has('drunk') || this.statuses.has('nausea');
  }

  clearStatus(name) {
    if (!this.statuses.has(name)) return;
    this.statuses.delete(name);
    this._onStatusEnd(name, false);
  }

  statusList() {
    const out = [];
    for (const [name, end] of this.statuses) {
      if (name === 'invuln') continue;
      out.push({ name, remaining: end === Infinity ? Infinity : Math.max(0, end - this.clock) });
    }
    return out;
  }

  _tickStatuses() {
    for (const [name, end] of [...this.statuses]) {
      if (end !== Infinity && this.clock >= end) {
        this.statuses.delete(name);
        this._onStatusEnd(name, true);
      }
    }
  }

  _onStatusEnd(name, expired) {
    switch (name) {
      case 'frozen':
        if (expired) this.applyStatus('cold', 5000);
        break;
      case 'promotion':
        audio.music(this.scene.bossActive ? 'boss' : 'level');
        break;
      case 'drunk':
      case 'nausea':
        if (this.isDizzy()) break;
        this.inputQueue = [];
        this._resetCamera();
        break;
      case 'stuck':
        this.setAngle(0);
        break;
      case 'invuln':
        this.setAlpha(1);
        break;
      default:
        break;
    }
  }

  // ---------------------------------------------------------------- damage

  takeDamage(hp, stress, sourceX) {
    if (this.hasStatus('promotion') || this.hasStatus('invuln')) return false;
    if (this.hasShield()) {
      this.clearStatus(this.hasStatus('shield') ? 'shield' : 'upgrade');
      this.applyStatus('invuln', 1000);
      audio.sfx('bossHit');
      this._floatText('SCUDO PERSO!', '#7fd4ff');
      return false;
    }
    GameState.addHp(-(hp || 0));
    GameState.addStress(stress || 0);
    this.applyStatus('invuln', 1000);
    this.hurtUntil = this.clock + 300;
    this.isSliding = false;
    this._endClimb();
    const dir = sourceX === undefined || sourceX === this.x ? -this.facing : Math.sign(this.x - sourceX);
    if (this.body) this.body.setVelocity(dir * 200, -200);
    audio.sfx('hurt');
    if (stress > 0) this._floatText(`STRESS +${Math.round(stress)}%`, '#ff6060');
    return true;
  }

  bounce(v = -350) {
    if (!this.body) return;
    this.body.setVelocityY(v);
    this.doubleJumpUsed = false;
    this.jumpCutAvailable = true;
  }

  respawn(x, y) {
    if (this.mount) y -= this.mount.cfg.lift;
    this.setPosition(x, y);
    if (this.body) {
      this.body.reset(x, y);
      this.body.setVelocity(0, 0);
      this.body.setAllowGravity(true);
      this.body.setGravityY(0);
    }
    this.statuses.clear();
    this.isSliding = false;
    this.isCrouching = false;
    this.isClimbing = false;
    this.inputQueue = [];
    this.setAlpha(1);
    this.setAngle(0);
    this.clearTint();
    this.setActive(true).setVisible(true);
    this._resetCamera();
    this._setPose('idle');
  }

  // ---------------------------------------------------------------- update

  update(time, delta, rawInput) {
    if (!this.body || !this.active) return;
    const dt = Math.min(delta, 50);
    this.clock += dt;
    this._tickStatuses();

    let input = { ...NEUTRAL_INPUT, ...(rawInput || {}) };
    input = this._applyDrunkDelay(input);

    const panic = GameState.isPanicking();
    if (panic) {
      input = { ...input, left: input.right, right: input.left, up: input.down, down: input.up };
      if (!this.wasPanicking) {
        this._floatText('PANICO!', '#ff3030');
        this.scene.ui?.message?.('PANICO!\nCOMANDI INVERTITI', '#ff3030', 1800);
      }
    } else if (this.wasPanicking) {
      this._floatText('CALMA RITROVATA', '#9dffb0');
    }
    this.wasPanicking = panic;

    const disabled = this.hasStatus('frozen') || this.hasStatus('asleep') || this.hasStatus('stuck');
    if (disabled) input = { ...NEUTRAL_INPUT };
    const m = this.mount;
    if (m) {
      // Camel without dates: balks every few seconds.
      if (m.type === 'camel' && !GameState.hasItem('dates') && this.clock >= m.nextBalk) {
        m.balkUntil = this.clock + 1600;
        m.nextBalk = this.clock + Phaser.Math.Between(6000, 9000);
        this._floatText('IL DROMEDARIO SI IMPUNTA!', '#ffb000');
        audio.sfx('hurt');
      }
      if (this.clock < m.balkUntil) input = { ...input, left: false, right: false, jumpPressed: false, jump: false };
      input = { ...input, down: false, slidePressed: false };
    }

    const body = this.body;
    const env = this.env;
    const grounded = this.onGround;
    if (grounded) {
      this.lastGroundedAt = this.clock;
      this.doubleJumpUsed = false;
    }
    if (input.jumpPressed) this.jumpBufferedAt = this.clock;

    // Underwater gravity
    if (env.underwater !== this.wasUnderwater) {
      body.setGravityY(env.underwater ? -GRAVITY * 0.75 : 0);
      if (env.underwater) audio.sfx('splash');
      this.wasUnderwater = env.underwater;
    }

    // Weapon switching & attack work in every movement mode (except asleep/frozen/stuck).
    this._handleWeapons(input);
    if (this.hasStatus('stuck') || this.hasStatus('frozen')) body.setVelocityX(0);

    if (!m && this._updateClimb(input)) {
      this._updateVisuals(input);
      return;
    }

    // Horizontal intent
    let dir = 0;
    if (input.left) dir -= 1;
    if (input.right) dir += 1;
    if (dir !== 0 && !this.isSliding) this.facing = dir;

    // Crouch / slide
    const movingFast = Math.abs(body.velocity.x) > 80;
    if (!this.isSliding && grounded && !env.underwater &&
        ((input.down && input.run && movingFast) || input.slidePressed)) {
      this.isSliding = true;
      this.slideUntil = this.clock + SLIDE_MS;
      body.setVelocityX(this.facing * Math.max(Math.abs(body.velocity.x), 340));
    }
    if (this.isSliding && (this.clock >= this.slideUntil || !grounded)) {
      this.isSliding = false;
    }
    this.isCrouching = !this.isSliding && grounded && input.down && !env.underwater;

    // Speed & friction
    let speed = input.run ? RUN_SPEED : WALK_SPEED;
    if (m) speed = (input.run ? m.cfg.run : m.cfg.speed) * (m.type === 'camel' && GameState.hasItem('dates') ? 1.15 : 1);
    else speed *= env.speedMult;
    if (this.hasStatus('promotion')) speed *= 1.5;
    if (this.hasStatus('cold')) speed *= 1.4;
    if (env.underwater) speed *= 0.7;
    const windK = m ? m.cfg.wind : 1;
    if (env.windX !== 0 && dir !== 0 && Math.sign(dir) !== Math.sign(env.windX)) speed *= 1 - 0.5 * windK;

    let target = dir * speed;
    if (dir === 0 && env.windX !== 0) target = env.windX * 0.6 * windK;
    if (this.isCrouching) target = 0;

    let k;
    if (env.ice) k = 0.015;
    else if (this.hasStatus('cold')) k = 0.04;
    else k = grounded ? 0.35 : 0.2;
    if (this.isDizzy() && grounded && !disabled) {
      target += Math.sin(this.clock / 280) * 90;
    }

    if (!this.isSliding) {
      const alpha = 1 - Math.pow(1 - k, dt / 16.67);
      body.setVelocityX(body.velocity.x + (target - body.velocity.x) * alpha);
    } else {
      body.setVelocityX(body.velocity.x * Math.pow(0.995, dt / 16.67));
    }

    // Sneezes while cold
    if (this.hasStatus('cold') && this.clock >= this.nextSneezeAt) {
      this.nextSneezeAt = this.clock + Phaser.Math.Between(900, 1800);
      audio.sfx('sneeze');
      this._floatText('ETCIU\'!', '#bfefff');
      body.setVelocityX(body.velocity.x + Phaser.Math.Between(-260, 260));
      if (!grounded) body.setVelocityY(body.velocity.y + Phaser.Math.Between(-150, 90));
    }

    // Jumping / swimming
    if (env.underwater) {
      if (input.jumpPressed) {
        body.setVelocityY(SWIM_V);
        audio.sfx('jump');
      }
      if (body.velocity.y > 90) body.setVelocityY(90);
    } else {
      const buffered = this.clock - this.jumpBufferedAt <= JUMP_BUFFER_MS;
      const canCoyote = this.clock - this.lastGroundedAt <= COYOTE_MS;
      if (buffered && canCoyote && !this.isCrouching) {
        this._jump(m ? m.cfg.jump : JUMP_V);
        audio.sfx('jump');
      } else if (input.jumpPressed && !canCoyote && !this.doubleJumpUsed && !m) {
        this.doubleJumpUsed = true;
        this._jump(DOUBLE_JUMP_V);
        audio.sfx('doublejump');
        this._puff();
      }
      // Variable jump height
      if (!input.jump && this.jumpCutAvailable && body.velocity.y < -120) {
        body.setVelocityY(body.velocity.y * 0.45);
        this.jumpCutAvailable = false;
      }
      if (body.velocity.y >= 0) this.jumpCutAvailable = false;
      if (body.velocity.y > MAX_FALL) body.setVelocityY(MAX_FALL);
    }

    this._updateVisuals(input);
  }

  _jump(v) {
    this.body.setVelocityY(v);
    this.jumpBufferedAt = -9999;
    this.lastGroundedAt = -9999;
    this.jumpCutAvailable = true;
    this.isSliding = false;
  }

  _applyDrunkDelay(input) {
    if (!this.isDizzy()) return input;
    this.inputQueue.push({ t: this.clock, s: input });
    const cutoff = this.clock - DRUNK_DELAY;
    let out = null;
    while (this.inputQueue.length && this.inputQueue[0].t <= cutoff) {
      const e = this.inputQueue.shift();
      if (!out) out = { ...e.s };
      else {
        const pressed = {};
        PRESSED_KEYS.forEach((p) => { pressed[p] = out[p] || e.s[p]; });
        out = { ...e.s, ...pressed };
      }
    }
    if (!out) {
      out = { ...this.lastDelayedInput };
      PRESSED_KEYS.forEach((p) => { out[p] = false; });
    }
    this.lastDelayedInput = out;
    return out;
  }

  _handleWeapons(input) {
    if (input.switchWeaponPressed && GameState.device) {
      const i = WEAPONS.indexOf(GameState.weapon);
      GameState.weapon = WEAPONS[(i + 1) % WEAPONS.length];
      audio.sfx('select');
      this._floatText(WEAPON_LABEL[GameState.weapon], '#7fffd4');
    }
    if (input.attackPressed && GameState.device && this.clock >= this.nextFireAt) {
      this.nextFireAt = this.clock + FIRE_COOLDOWN;
      const low = this.isCrouching || this.isSliding;
      this.scene.events.emit(EVENTS.PLAYER_FIRE, {
        x: this.x + this.facing * 12,
        y: this.y - (low ? 8 : 18),
        dir: this.facing
      });
      audio.sfx('shoot');
    }
  }

  // Returns true if the player is climbing this frame (movement fully handled).
  _updateClimb(input) {
    const body = this.body;
    const env = this.env;
    if (!env.onLadder) {
      this._endClimb();
      return false;
    }
    if (!this.isClimbing && (input.up || (input.down && !this.onGround))) {
      this.isClimbing = true;
      this.isSliding = false;
      body.setAllowGravity(false);
    }
    if (!this.isClimbing) return false;

    if (input.jumpPressed) {
      this._endClimb();
      let dir = 0;
      if (input.left) dir -= 1;
      if (input.right) dir += 1;
      this._jump(JUMP_V * 0.85);
      body.setVelocityX(dir * WALK_SPEED);
      audio.sfx('jump');
      return true;
    }
    this.setX(env.ladderX);
    body.setVelocityX(0);
    let vy = 0;
    if (input.up) vy -= CLIMB_SPEED;
    if (input.down) vy += CLIMB_SPEED;
    body.setVelocityY(vy);
    if (input.down && this.onGround) this._endClimb();
    this.doubleJumpUsed = false;
    return true;
  }

  _endClimb() {
    if (!this.isClimbing) return;
    this.isClimbing = false;
    if (this.body) this.body.setAllowGravity(true);
  }

  // ---------------------------------------------------------------- visuals

  _updateVisuals(input) {
    const body = this.body;
    const c = this.character;
    const grounded = this.onGround;
    const moving = Math.abs(body.velocity.x) > 15;

    if (this.mount) this._setPose(grounded ? 'idle' : 'jump');
    else if (this.hasStatus('asleep')) this._setPose('sleep');
    else if (this.clock < this.hurtUntil) this._setPose('hurt');
    else if (this.isSliding) this._setPose('slide');
    else if (this.isCrouching) this._setPose('crouch');
    else if (this.isClimbing) {
      this._playAnim(playerAnim(c, 'climb'), 'climb1');
      if (body.velocity.y === 0) this.anims.pause();
      else this.anims.resume();
    } else if (this.env.underwater && !grounded) this._playAnim(playerAnim(c, 'swim'), 'swim1');
    else if (!grounded) this._setPose('jump');
    else if (moving) {
      const tired = this.env.heat;
      this._playAnim(playerAnim(c, tired ? 'tired' : 'walk'), tired ? 'tired1' : 'walk1');
      this.anims.timeScale = tired ? 0.6 : (input.run ? 1.8 : 1);
    } else this._setPose('idle');

    this.setFlipX(this.facing < 0);

    // Tints
    if (this.hasStatus('promotion')) {
      const col = Phaser.Display.Color.HSVToRGB((this.clock / 400) % 1, 0.55, 1);
      this.setTint(col.color);
    } else if (this.hasStatus('frozen')) this.setTint(0x88ddff);
    else if (this.hasStatus('cold')) this.setTint(0xcfefff);
    else if (this.env.heat) this.setTint(0xffc8a0);
    else if (GameState.isPanicking()) this.setTint((Math.floor(this.clock / 150) % 2) ? 0xff8080 : 0xffffff);
    else this.clearTint();

    // Invulnerability blink
    if (this.hasStatus('invuln')) this.setAlpha(Math.floor(this.clock / 80) % 2 ? 0.3 : 1);
    else this.setAlpha(1);

    // Stuck shake
    if (this.hasStatus('stuck')) this.setAngle(Math.sin(this.clock / 25) * 6);

    // Asleep Zzz
    if (this.hasStatus('asleep') && this.clock >= this.nextZzzAt) {
      this.nextZzzAt = this.clock + 450;
      const z = this.scene.add.text(this.x + 8, this.y - 16, 'Z', {
        fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 3
      }).setDepth(DEPTH.FX);
      this.scene.tweens.add({
        targets: z, x: z.x + 18, y: z.y - 30, scale: 1.8, alpha: 0, duration: 1300, onComplete: () => z.destroy()
      });
    }

    // Drunk camera sway
    if (this.isDizzy()) {
      const cam = this.scene.cameras.main;
      cam.setRotation(Math.sin(this.clock / 420) * 0.045);
      cam.setZoom(RENDER_SCALE * (1.02 + Math.sin(this.clock / 610) * 0.025));
    }

    // Mount follows the rider (bobbing while moving).
    if (this.mount) {
      const ms = this.mount.sprite;
      const bob = grounded && moving ? Math.round(Math.sin(this.clock / 70)) : 0;
      ms.setPosition(this.x, body.bottom + bob).setFlipX(this.facing < 0);
      ms.setTint(this.clock < this.mount.balkUntil ? 0xffb080 : 0xffffff);
    }

    // Umbrella as a parasol in the desert sun.
    if (this.env.parasol) {
      if (!this.parasol) this.parasol = this.scene.add.image(this.x, this.y, TEX.UMBRELLA_OPEN).setOrigin(0.5, 1).setDepth(DEPTH.PLAYER + 2);
      this.parasol.setPosition(this.x, this.y - this.displayHeight + 2).setVisible(true);
    } else if (this.parasol) this.parasol.setVisible(false);

    // Company-car / upgrade shield ring
    this.shieldGfx.clear();
    if (this.hasShield()) {
      const r = 22 + Math.sin(this.clock / 120) * 2;
      this.shieldGfx.lineStyle(2, 0x7fd4ff, 0.9);
      this.shieldGfx.strokeCircle(this.x, this.y - 15, r);
      this.shieldGfx.lineStyle(1, 0xffffff, 0.5);
      this.shieldGfx.strokeCircle(this.x, this.y - 15, r - 3);
    }
  }

  _setPose(pose) {
    if (this.currentPose === pose && !this.anims.isPlaying) return;
    if (this.anims.isPlaying) this.anims.stop();
    this.anims.timeScale = 1;
    this.currentPose = pose;
    this.setTexture(playerTex(this.character, pose));
    this._applyBody(POSE_BODY[pose] || 'stand');
  }

  _playAnim(key, firstPose) {
    if (this.scene.anims.exists(key)) {
      this.anims.play(key, true);
      this.currentPose = firstPose;
    } else {
      this._setPose(firstPose);
    }
    this._applyBody(POSE_BODY[firstPose] || 'stand');
  }

  _applyBody(category) {
    if (this.mount && this.body) {
      // Mounted: the body covers the vehicle, the rider is drawn `lift` px above the ground.
      if (this.bodyCategory === 'mount') return;
      this.bodyCategory = 'mount';
      const [w, h] = this.mount.cfg.body;
      this.body.setSize(w, h, false);
      this.body.setOffset((this.frame.width - w) / 2, this.frame.height + this.mount.cfg.lift - h);
      return;
    }
    if (this.bodyCategory === category || !this.body) return;
    this.bodyCategory = category;
    const [w, h] = BODY[category];
    this.body.setSize(w, h, false);
    this.body.setOffset((this.frame.width - w) / 2, this.frame.height - h);
  }

  _resetCamera() {
    const cam = this.scene && this.scene.cameras && this.scene.cameras.main;
    if (!cam) return;
    cam.setRotation(0);
    cam.setZoom(RENDER_SCALE);
  }

  _floatText(str, color) {
    const t = this.scene.add.text(this.x, this.y - 40, str, {
      fontFamily: FONT, fontSize: '11px', fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(DEPTH.FX);
    this.scene.tweens.add({ targets: t, y: t.y - 24, alpha: 0, duration: 1000, onComplete: () => t.destroy() });
  }

  _puff() {
    for (let i = 0; i < 5; i++) {
      const p = this.scene.add.rectangle(this.x + Phaser.Math.Between(-8, 8), this.y, 4, 4, 0xffffff)
        .setDepth(DEPTH.FX);
      this.scene.tweens.add({
        targets: p, y: p.y + Phaser.Math.Between(4, 12), x: p.x + Phaser.Math.Between(-10, 10),
        alpha: 0, duration: 300, onComplete: () => p.destroy()
      });
    }
  }

  preDestroy() {
    if (this.shieldGfx) this.shieldGfx.destroy();
    if (this.mount) this.mount.sprite.destroy();
    if (this.parasol) this.parasol.destroy();
    try { this._resetCamera(); } catch (e) { /* camera already gone on shutdown */ }
    super.preDestroy();
  }
}
