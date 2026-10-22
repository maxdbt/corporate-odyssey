import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, DEPTH, EVENTS, TEX, WEAPON_LABEL, RENDER_SCALE } from '../config/constants.js';
import { viewLeft, setViewLeft } from '../utils/view.js';
import { GameState } from '../state/GameState.js';
import { LEVELS } from '../levels/index.js';
import Player from '../entities/Player.js';
import InputController from '../systems/InputController.js';
import { audio } from '../systems/Audio8bit.js';
import { createEnemy, createHazard } from '../entities/EnemyFactory.js';
import LevelBuilder from '../systems/LevelBuilder.js';
import Zones from '../systems/Zones.js';
import WeaponSystem from '../systems/WeaponSystem.js';
import { drawBackground } from '../systems/Backgrounds.js';
import { nextQuizId } from '../data/quizzes.js';
import Canteen from '../systems/Canteen.js';
import TripLevel from '../systems/TripLevel.js';
import { beginStage, goNext, underwearPenalty, isGroundLeg } from '../systems/Trip.js';
import { TRANSPORT } from '../data/trip.js';

const PIT_DAMAGE = 20;
const BURNOUT_DELAY = 1400;
let debugLevelChecked = false;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data = {}) {
    let levelIndex = data.levelIndex ?? GameState.levelIndex ?? 0;
    // Debug helper: ?level=N jumps straight to level N (first entry only).
    if (!debugLevelChecked) {
      debugLevelChecked = true;
      const q = new URLSearchParams(window.location.search).get('level');
      if (q !== null && !Number.isNaN(parseInt(q, 10))) levelIndex = parseInt(q, 10);
    }
    this.levelIndex = Phaser.Math.Clamp(levelIndex, 0, LEVELS.length - 1);
    this.fromCheckpoint = !!data.fromCheckpoint && GameState.checkpoint?.levelIndex === this.levelIndex;
    if (!this.fromCheckpoint) GameState.beginLevel(this.levelIndex);
    else GameState.levelIndex = this.levelIndex;
    if (LEVELS[this.levelIndex].trip && !this.fromCheckpoint) beginStage(this.levelIndex);
  }

  create() {
    const level = LEVELS[this.levelIndex];
    this.level = level;
    this.ended = false;
    this.bossActive = false;
    this.bossSpawned = false;
    this.boss = null;
    this.timeLeft = level.timeLimit || 300;
    this.dropThroughUntil = 0;
    this.hazards = [];
    this.levelBounds = { width: level.width, height: GAME_HEIGHT };
    this.cameras.main.setRotation(0).setZoom(RENDER_SCALE);

    // World: no floor/ceiling collision so pits work.
    this.physics.world.setBounds(0, -200, level.width, GAME_HEIGHT + 400);
    this.physics.world.setBoundsCollision(true, true, false, false);

    drawBackground(this, level.theme, level.width);

    // Groups shared with other modules (see ARCHITECTURE.md).
    this.platforms = this.physics.add.staticGroup();
    this.oneWay = this.physics.add.staticGroup();
    this.postits = this.physics.add.staticGroup();
    this.terminals = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.enemyBullets = this.physics.add.group({ allowGravity: false });
    this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.items = this.physics.add.group({ allowGravity: false, immovable: true });
    this.goal = null;

    const { zoneDefs } = new LevelBuilder(this, level).build();
    this.zones = new Zones(this, zoneDefs);
    this.ladderZones = zoneDefs.filter((z) => z.type === 'ladder');

    // Player
    let [sx, sy] = level.start;
    if (this.fromCheckpoint) { sx = GameState.checkpoint.x; sy = GameState.checkpoint.y; }
    this.player = new Player(this, sx, sy, GameState.character);
    this.lastSafe = { x: sx, y: sy };
    if (this.fromCheckpoint) this.placeFlag(sx, sy);

    this.weapons = new WeaponSystem(this);
    this.setupColliders();
    this.canteen = level.canteen ? new Canteen(this, this.fromCheckpoint ? GameState.checkpoint.meal : null) : null;
    this.tripLevel = level.trip ? new TripLevel(this, level) : null;
    // By plane you land earlier: extra time on the ground leg.
    const planeBonus = level.trip && isGroundLeg(level.id) && GameState.trip?.transport === 'plane'
      ? TRANSPORT.plane.timeBonus : 0;
    this.timeLeft += planeBonus;

    // Enemies and hazards
    (level.enemies || []).forEach(([type, x, y, props]) => this.spawnEnemy(type, x, y, props));
    (level.hazards || []).forEach(([type, props]) => {
      try {
        const h = createHazard(this, type, props);
        if (h) this.hazards.push(h);
      } catch (e) { console.warn('[GameScene] hazard failed', type, e); }
    });

    if (level.planeTicket) this.createPlaneTicket(...level.planeTicket);
    if (level.mysteryDish) this.createMysteryDish(...level.mysteryDish);
    this.forcedRunUntil = 0;

    // Camera
    const cam = this.cameras.main;
    cam.setBounds(0, 0, level.width, GAME_HEIGHT);
    cam.setRoundPixels(true);
    if (level.autoscroll) {
      this.autoscroll = { speed: level.autoscroll, startAt: this.time.now + 1800 };
      setViewLeft(cam, Math.max(0, sx - 120));
    } else {
      this.autoscroll = null;
      cam.startFollow(this.player, true, 0.12, 0.12);
      cam.setDeadzone(120, 90);
    }

    // UI + input
    this.scene.launch('UIScene');
    this.scene.bringToTop('UIScene');
    this.ui = this.scene.get('UIScene');
    this.inputCtl = new InputController(this);

    this.onBossDefeated = (boss) => this.handleBossDefeated(boss);
    this.onBossHealth = (d) => this.ui?.bossBar?.(d?.name, d?.ratio ?? null);
    this.events.on(EVENTS.BOSS_DEFEATED, this.onBossDefeated);
    this.events.on(EVENTS.BOSS_HEALTH, this.onBossHealth);
    this.events.once('shutdown', this.cleanup, this);

    audio.music('level');
    this.time.delayedCall(300, () => {
      const msg = this.fromCheckpoint
        ? 'RIPRENDI DAL GIORNO DI FERIE!'
        : `${level.id}  ${level.name.toUpperCase()}`;
      this.ui?.message?.(msg, '#ffd800', 2200);
      if (level.trip && !this.fromCheckpoint && underwearPenalty()) {
        this.time.delayedCall(2400, () => this.ui?.message?.('SENZA MUTANDE DI RICAMBIO...\nSTRESS +10%', '#ff8080', 1800));
      }
      if (planeBonus && !this.fromCheckpoint) {
        this.time.delayedCall(4400, () => this.ui?.message?.(`IN AEREO SEI ARRIVATO PRIMA!\nTEMPO +${planeBonus}s`, '#7fd4ff', 1800));
      }
      if (GameState.levelMods.enemySpeedMult > 1) {
        this.time.delayedCall(2400, () => this.ui?.message?.('NEMICI PIU\' VELOCI DEL 15%!', '#ff8080', 1500));
      }
    });
    this.cameras.main.fadeIn(400, 0, 0, 0);
    if (!this.fromCheckpoint) this.time.delayedCall(450, () => this.openOverlay('BriefScene'));
  }

  // Flying plane ticket (1-2): catch it on the fly to start the beach trial (BeachScene).
  createPlaneTicket(x, y) {
    if (!this.textures.exists('plane_ticket')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x000000).fillRect(0, 0, 22, 12);
      g.fillStyle(0xffffff).fillRect(1, 1, 20, 10);
      g.fillStyle(0x2a6ad8).fillRect(1, 1, 20, 3);
      g.fillStyle(0x2a6ad8).fillRect(4, 6, 7, 1).fillRect(6, 5, 2, 3).fillRect(4, 7, 1, 1);
      g.fillStyle(0xaaaaaa).fillRect(14, 1, 1, 10);
      g.fillStyle(0x333333).fillRect(16, 6, 3, 1).fillRect(16, 8, 3, 1);
      g.generateTexture('plane_ticket', 22, 12);
      g.destroy();
    }
    const t = this.physics.add.image(x, y, 'plane_ticket').setScale(1.4).setDepth(DEPTH.FX);
    t.body.setAllowGravity(false);
    const label = this.add.text(x, y - 22, 'BIGLIETTO AEREO!', {
      fontFamily: 'monospace', fontSize: '9px', fontStyle: 'bold', color: '#7fd4ff', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(DEPTH.FX);
    const sparkle = this.add.particles(0, 0, TEX.FX_PX, {
      follow: t, speed: 20, lifespan: 500, frequency: 80, tint: [0xffffff, 0x7fd4ff], alpha: { start: 1, end: 0 }
    }).setDepth(DEPTH.FX);
    this.tweens.add({ targets: [t, label], x: '+=160', duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.tweens.add({ targets: [t, label], y: '-=40', duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.tweens.add({ targets: t, angle: 12, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.physics.add.overlap(this.player, t, () => {
      if (!t.active || this.ended) return;
      t.destroy(); label.destroy(); sparkle.destroy();
      audio.sfx('powerup');
      this.ui?.message?.('SI PARTE! DESTINAZIONE MARE!', '#7fd4ff', 1200);
      this.time.delayedCall(500, () => this.openOverlay('BeachScene'));
    });
  }

  // Floating mysterious stew (2-1): instant stomach ache, the player runs off and lands in ToiletScene.
  createMysteryDish(x, y) {
    if (!this.textures.exists('mystery_dish')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x000000).fillRect(0, 6, 20, 9);
      g.fillStyle(0xe8eef2).fillRect(1, 7, 18, 7);
      g.fillStyle(0x9aa6ae).fillRect(3, 13, 14, 2);
      g.fillStyle(0x6b5a1a).fillRect(3, 3, 14, 5);
      g.fillStyle(0x8fa030).fillRect(5, 2, 4, 3).fillRect(11, 3, 3, 2);
      g.fillStyle(0xd04060).fillRect(8, 4, 2, 2);
      g.fillStyle(0x7fdc50).fillRect(4, 0, 1, 2).fillRect(10, 0, 1, 1).fillRect(15, 0, 1, 2);
      g.generateTexture('mystery_dish', 20, 15);
      g.destroy();
    }
    const d = this.physics.add.image(x, y, 'mystery_dish').setScale(1.5).setDepth(DEPTH.FX);
    d.body.setAllowGravity(false);
    const glow = this.add.circle(x, y, 16, 0xb040ff, 0.3).setDepth(DEPTH.FX - 1);
    const label = this.add.text(x, y - 24, 'SPEZZATINO MISTERIOSO', {
      fontFamily: 'monospace', fontSize: '8px', fontStyle: 'bold', color: '#d8a0ff', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(DEPTH.FX);
    const stink = this.add.particles(0, 0, TEX.FX_PX, {
      follow: d, followOffset: { y: -8 }, speedY: { min: -30, max: -15 }, speedX: { min: -10, max: 10 },
      lifespan: 700, frequency: 90, tint: [0x9acd50, 0xd8a0ff], alpha: { start: 1, end: 0 }
    }).setDepth(DEPTH.FX);
    this.tweens.add({ targets: [d, glow, label], y: '-=18', duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.tweens.add({ targets: glow, scale: 1.4, alpha: 0.1, duration: 600, yoyo: true, repeat: -1 });
    this.physics.add.overlap(this.player, d, () => {
      if (!d.active || this.ended) return;
      d.destroy(); glow.destroy(); label.destroy(); stink.destroy();
      audio.sfx('hurt');
      this.ui?.message?.('MAL DI PANCIA!\nDEVO TROVARE UN BAGNO!', '#b8f070', 1400);
      this.player.setTint(0xb8f070);
      this.cameras.main.shake(300, 0.006);
      this.forcedRunUntil = this.time.now + 1300;
      this.time.delayedCall(1100, () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.player.clearTint();
          this.player.body.setVelocity(0, 0);
          this.events.once('resume', () => this.cameras.main.fadeIn(400, 0, 0, 0));
          this.openOverlay('ToiletScene');
        });
      });
    });
  }

  // Pauses the level under an overlay scene (brief 'I', pause 'P'); the overlay resumes it.
  openOverlay(key) {
    // The key that just closed another overlay (e.g. ESC on the pause sheet) must not open a new one.
    if (this.ended || !this.scene.isActive() || performance.now() - (this.resumedAt || 0) < 250) return;
    this.scene.pause();
    // Keys released while paused would stay "down" on resume.
    this.events.once('resume', () => {
      this.resumedAt = performance.now();
      this.input.keyboard?.resetKeys();
    });
    this.scene.launch(key, { levelIndex: this.levelIndex, timeLeft: this.timeLeft });
    this.scene.bringToTop(key);
  }

  // ---------------------------------------------------------------- setup

  oneWayProcess(sprite, plat) {
    const b = sprite.body;
    if (!b) return false;
    if (sprite === this.player && (this.player.isClimbing || this.time.now < this.dropThroughUntil)) return false;
    return b.velocity.y >= 0 && b.prev.y + b.height <= plat.body.top + 8;
  }

  setupColliders() {
    const p = this.player;
    const oneWay = (a, b) => this.oneWayProcess(a, b);

    this.physics.add.collider(p, this.platforms, () => this.recordSafe());
    this.physics.add.collider(p, this.oneWay, () => this.recordSafe(), oneWay);
    this.physics.add.collider(p, this.postits, (pl, z) => this.triggerPostit(z), oneWay);
    this.physics.add.collider(p, this.obstacles);

    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.oneWay, null, oneWay);
    this.physics.add.collider(this.enemies, this.obstacles);

    // Enemy bullets: onHitWall() handles itself and returns false (no separation).
    this.physics.add.collider(this.enemyBullets, this.platforms, null, (b, plat) => {
      if (b.onHitWall) return b.onHitWall(plat);
      b.destroy();
      return false;
    });

    this.physics.add.overlap(p, this.enemies, (pl, e) => this.playerVsEnemy(e));
    this.physics.add.overlap(p, this.enemyBullets, (pl, b) => {
      if (!b.active || this.ended) return;
      if (b.onHitPlayer) b.onHitPlayer(p);
      else { p.takeDamage(10, 5, b.x); b.destroy(); }
    });
    this.physics.add.overlap(p, this.items, (pl, item) => this.collect(item));
    this.physics.add.overlap(p, this.terminals, (pl, t) => this.openTerminal(t));
    if (this.goal) this.physics.add.overlap(p, this.goal, () => this.reachGoal());
  }

  // Remember the last firm ground (solid or permanent one-way) for pit respawns.
  recordSafe() {
    const b = this.player.body;
    if (this.autoscroll || (!b.blocked.down && !b.touching.down)) return;
    this.lastSafe = { x: this.player.x, y: b.bottom };
  }

  spawnEnemy(type, x, y, props = {}) {
    try {
      return createEnemy(this, type, x, y, props);
    } catch (e) {
      console.warn('[GameScene] enemy spawn failed', type, e);
      return null;
    }
  }

  // ---------------------------------------------------------------- interactions

  playerVsEnemy(enemy) {
    const p = this.player;
    if (this.ended || !enemy.active || enemy.dead || !p.body) return;
    const mc = p.mountContact(enemy);
    if (mc === 'immune') return;
    if (mc === 'ram') { enemy.hit?.(99, 'ram'); audio.sfx('stomp'); return; }
    if (mc === 'crash' && !p.hasStatus('invuln')) {
      p.dismount();
      p.takeDamage(10, 10, enemy.x);
      this.ui?.message?.('CADUTO DALLA MOTO!\nPROSEGUI A PIEDI', '#ff8080', 1600);
      return;
    }
    if (!enemy.isBoss && (p.hasStatus('promotion') || p.hasShield())) {
      enemy.hit?.(99, 'ram');
      audio.sfx('stomp');
      return;
    }
    const pb = p.body;
    const eb = enemy.body;
    const stomp = pb.velocity.y > 40 && pb.bottom - eb.top < 16 && pb.prev.y + pb.height <= eb.top + 10;
    if (stomp && enemy.stompable) {
      enemy.hit?.(1, 'stomp');
      p.bounce();
      audio.sfx('stomp');
      return;
    }
    if (stomp && enemy.isBoss) {
      // Bosses: bounce off and take a little damage.
      enemy.hit?.(1, 'stomp');
      p.bounce(-420);
      return;
    }
    if (enemy.onPlayerContact) enemy.onPlayerContact(p);
    else p.takeDamage(enemy.damage?.hp ?? 10, enemy.damage?.stress ?? 5, enemy.x);
  }

  collect(item) {
    if (!item.active || !item.body?.enable || this.ended) return;
    const p = this.player;
    const mult = p.hasStatus('raise') ? 2 : 1;
    const ui = this.ui;
    if (this.tripLevel) {
      const r = this.tripLevel.collect(item);
      if (r === 'keep') return;
      if (r) { item.collect(); return; }
    }
    switch (item.kind) {
      case 'euro':
      case 'ticket':
        audio.sfx('coin');
        if (GameState.addBonus(item.kind, mult)) {
          ui?.message?.('100 BONUS! SALUTE MENTALE +25%', '#7CFC00', 1500);
          audio.sfx('powerup');
        }
        break;
      case 'coffee':
        GameState.addStress(-15 * mult);
        audio.sfx('coin');
        this.floatText(item.x, item.y, 'STRESS -' + 15 * mult + '%', '#c08040');
        break;
      case 'water':
        GameState.addStress(-10);
        this.zones.coolDown(6000);
        p.clearStatus('cold');
        audio.sfx('splash');
        this.floatText(item.x, item.y, 'RINFRESCATO!', '#8fd4ff');
        break;
      case 'vacation':
        GameState.vacationDays++;
        GameState.checkpoint = { levelIndex: this.levelIndex, x: item.x, y: this.surfaceBelow(item.x, item.y) };
        if (this.canteen) GameState.checkpoint.meal = { ...this.canteen.slots };
        this.placeFlag(GameState.checkpoint.x, GameState.checkpoint.y);
        audio.sfx('checkpoint');
        ui?.message?.('GIORNO DI FERIE! CHECKPOINT', '#00e0ff', 1600);
        break;
      case 'laptop':
      case 'smartphone':
        GameState.device = item.kind;
        GameState.weapon = item.kind === 'laptop' ? 'email' : 'teams';
        audio.sfx('powerup');
        ui?.message?.(`${item.kind === 'laptop' ? 'LAPTOP' : 'SMARTPHONE'}! ARMA: ${WEAPON_LABEL[GameState.weapon]}\nC/Q = SPARA  V/E = CAMBIA ARMA`, '#7CFC00', 2200);
        break;
      case 'promotion':
        p.applyStatus('promotion', 8000);
        ui?.message?.('LA PROMOZIONE! INVINCIBILE!', '#ffd800', 1600);
        audio.sfx('powerup');
        break;
      case 'raise':
        p.applyStatus('raise', 15000);
        ui?.message?.('L\'AUMENTO! BONUS x2 PER 15s', '#7CFC00', 1600);
        audio.sfx('powerup');
        break;
      case 'tickets10':
        if (GameState.addBonus('ticket', 10 * mult)) audio.sfx('powerup');
        else audio.sfx('coin');
        ui?.message?.(`+${10 * mult} BUONI PASTO!`, '#7CFC00', 1600);
        break;
      case 'car':
        p.applyStatus('shield', Infinity);
        ui?.message?.('AUTO AZIENDALE! SCUDO ATTIVO', '#00e0ff', 1600);
        audio.sfx('powerup');
        break;
      default:
        break;
    }
    item.collect();
  }

  surfaceBelow(x, y) {
    // Checkpoint ground: nearest solid/one-way surface below (fallback: last safe y).
    let best = null;
    [...this.platforms.getChildren(), ...this.oneWay.getChildren()].forEach((z) => {
      const b = z.body;
      if (x >= b.left && x <= b.right && b.top >= y - 4 && (best === null || b.top < best)) best = b.top;
    });
    return best ?? this.lastSafe.y;
  }

  placeFlag(x, y) {
    if (this.flag) this.flag.destroy();
    this.flag = this.add.image(x, y, TEX.BEACH_FLAG).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 2);
  }

  floatText(x, y, text, color = '#ffffff') {
    const t = this.add.text(x, y, text, {
      fontFamily: 'monospace', fontSize: '10px', fontStyle: 'bold', color, stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(DEPTH.FX);
    this.tweens.add({ targets: t, y: y - 30, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  triggerPostit(zone) {
    const info = zone.postit;
    if (!info || info.triggered) return;
    if (!this.player.body.touching.down && !this.player.body.blocked.down) return;
    info.triggered = true;
    const shake = this.tweens.add({
      targets: info.sprite, x: info.homeX + 2, duration: 50, yoyo: true, repeat: -1
    });
    // Vanishes after exactly 1.5 s, comes back after a while.
    this.time.delayedCall(1500, () => {
      shake.stop();
      info.sprite.x = info.homeX;
      zone.body.enable = false;
      this.tweens.add({ targets: info.sprite, alpha: 0, y: info.sprite.y + 20, duration: 150 });
      this.time.delayedCall(3500, () => {
        info.sprite.y -= 20;
        this.tweens.add({ targets: info.sprite, alpha: 1, duration: 300 });
        zone.body.enable = true;
        info.triggered = false;
      });
    });
  }

  openTerminal(t) {
    if (t.used || this.ended) return;
    t.used = true;
    t.setTint(0x666666);
    t.label?.destroy();
    audio.sfx('quiz');
    this.scene.pause();
    this.scene.launch('QuizScene', { quizId: nextQuizId(this.level.quizSetting) });
    this.scene.bringToTop('QuizScene');
  }

  // Quiz outcomes (see ARCHITECTURE.md effect keys).
  applyEffects(e = {}) {
    if ('stress' in e) GameState.addStress(e.stress);
    if ('stressSet' in e) GameState.stress = Phaser.Math.Clamp(e.stressSet, 0, 100);
    if ('hp' in e) GameState.addHp(e.hp);
    if ('euro' in e) GameState.addBonus('euro', e.euro);
    if ('tickets' in e) GameState.addBonus('ticket', e.tickets);
    if ('vacationDays' in e) GameState.vacationDays = Math.max(0, GameState.vacationDays + e.vacationDays);
    if ('timer' in e) this.timeLeft = Math.max(1, this.timeLeft + e.timer);
    if ('nextLevelEnemySpeed' in e) GameState.pendingNext.enemySpeedMult = e.nextLevelEnemySpeed;
    if (e.colleaguesHostile) GameState.levelMods.colleaguesHostile = true;
    if (e.spawnBugs) {
      for (let i = 0; i < e.spawnBugs; i++) {
        const side = i % 2 ? -1 : 1;
        const x = Phaser.Math.Clamp(this.player.x + side * (90 + i * 40), 20, this.level.width - 20);
        this.spawnEnemy('bug', x, this.player.y - 60);
      }
    }
    if (e.weapon) {
      GameState.weapon = e.weapon;
      if (!GameState.device) GameState.device = 'laptop';
    }
    if (e.promotion) this.player.applyStatus('promotion', e.promotion * 1000);
  }

  // ---------------------------------------------------------------- boss

  checkBoss() {
    const b = this.level.boss;
    if (!b || this.bossSpawned || this.player.x < b.triggerX) return;
    this.bossSpawned = true;
    this.bossActive = true;
    const a = b.arena;
    // Free checkpoint at the arena entrance: dying in the boss fight restarts from here.
    if (b.checkpoint && !GameState.checkpoint?.boss) {
      GameState.checkpoint = { levelIndex: this.levelIndex, x: b.checkpoint, y: this.surfaceBelow(b.checkpoint, 0), boss: true };
      this.placeFlag(GameState.checkpoint.x, GameState.checkpoint.y);
      audio.sfx('checkpoint');
    }
    const cam = this.cameras.main;
    cam.stopFollow();
    cam.pan(a.left + (a.right - a.left) / 2, GAME_HEIGHT / 2, 600, 'Sine.easeInOut', false, (c, prog) => {
      if (prog === 1) cam.setBounds(a.left, 0, a.right - a.left, GAME_HEIGHT);
    });
    // Lock the arena entrance.
    this.arenaWall = this.add.zone(a.left - 8, GAME_HEIGHT / 2, 16, GAME_HEIGHT * 2);
    this.platforms.add(this.arenaWall);
    this.add.rectangle(a.left - 8, 0, 16, a.floorY, 0x000000, 0.6).setOrigin(0.5, 0).setDepth(DEPTH.PLATFORMS);
    audio.music('boss');
    this.ui?.message?.(b.type === 'boss_ceo' ? 'IL MEGA-DIRETTORE!' : 'IL CLIENTE DALL\'INFERNO!', '#ff4040', 2000);
    this.time.delayedCall(700, () => { this.boss = this.spawnEnemy(b.type, b.x, b.y, { arena: a }); });
  }

  handleBossDefeated() {
    if (this.ended) return;
    this.bossActive = false;
    this.ui?.bossBar?.(null, null);
    const b = this.level.boss;
    if (this.level.final) {
      this.ended = true;
      audio.stopMusic();
      audio.sfx('victory');
      this.ui?.message?.('IL CEO E\' STATO SCONFITTO!', '#ffd800', 2500);
      this.time.delayedCall(2600, () => this.scene.start('VictoryScene'));
      return;
    }
    audio.music('level');
    this.ui?.message?.('BOSS SCONFITTO! RAGGIUNGI L\'USCITA', '#7CFC00', 2000);
    const ex = b.exit || { x: b.arena.right - 60, y: b.arena.floorY };
    const door = new LevelBuilder(this, this.level).goal({ type: 'door', x: ex.x, y: ex.y });
    this.physics.add.overlap(this.player, door, () => this.levelComplete());
  }

  // ---------------------------------------------------------------- flow

  // The canteen checkout only lets you out with a complete meal on the tray.
  reachGoal() {
    if (this.ended || (this.canteen && !this.canteen.allowExit())) return;
    this.levelComplete();
  }

  levelComplete() {
    if (this.ended) return;
    this.ended = true;
    const p = this.player;
    p.body.setVelocity(0, p.body.velocity.y);
    audio.sfx('victory');
    const bonus = Math.floor(this.timeLeft / 10);
    GameState.addBonus('euro', bonus);
    this.ui?.message?.(`LIVELLO COMPLETATO!\nBONUS TEMPO +${bonus} EURO`, '#7CFC00', 2200);
    this.time.delayedCall(2400, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        goNext(this, this.levelIndex);
      });
    });
  }

  burnout(reason) {
    if (this.ended) return;
    this.ended = true;
    audio.stopMusic();
    audio.sfx('gameover');
    this.ui?.message?.(reason || 'BURNOUT!', '#ff4040', BURNOUT_DELAY);
    this.player.setTint(0x777777);
    this.player.body.setVelocity(0, -200);
    this.cameras.main.shake(300, 0.01);
    this.time.delayedCall(BURNOUT_DELAY, () => this.scene.start('GameOverScene', { levelIndex: this.levelIndex }));
  }

  fallInPit() {
    GameState.addHp(-PIT_DAMAGE);
    GameState.addStress(10);
    audio.sfx('hurt');
    if (GameState.hp <= 0) { this.burnout('BURNOUT! (CADUTA)'); return; }
    let x = this.lastSafe.x;
    let y = this.lastSafe.y;
    if (this.autoscroll) {
      x = viewLeft(this.cameras.main) + 160;
      y = 300;
    }
    this.player.respawn(x, y - 2);
    this.player.applyStatus('invuln', 1500);
    this.ui?.message?.(`CADUTO! -${PIT_DAMAGE}% SALUTE`, '#ff8080', 1000);
  }

  updateAutoscroll(time, delta) {
    const a = this.autoscroll;
    const cam = this.cameras.main;
    const maxScroll = this.level.width - GAME_WIDTH;
    if (time >= a.startAt && viewLeft(cam) < maxScroll) {
      setViewLeft(cam, Math.min(maxScroll, viewLeft(cam) + a.speed * delta / 1000));
    }
    const p = this.player;
    const left = viewLeft(cam) + 12;
    const right = viewLeft(cam) + GAME_WIDTH - 12;
    if (p.x < left) {
      if (p.body.blocked.right || p.body.touching.right) {
        GameState.addHp(-40);
        this.ui?.message?.('SCHIACCIATO!', '#ff4040', 900);
      }
      p.x = left;
      if (p.body.velocity.x < 0) p.body.setVelocityX(0);
    }
    if (p.x > right) { p.x = right; if (p.body.velocity.x > 0) p.body.setVelocityX(0); }
  }

  updateLadderDrop(input) {
    if (!input.down || this.player.isClimbing) return;
    const p = this.player;
    const feet = p.body.bottom;
    const atTop = this.ladderZones.some((z) => Math.abs(p.x - (z.x + z.w / 2)) < 14 && Math.abs(feet - (z.y + 4)) < 8);
    if (atTop) this.dropThroughUntil = this.time.now + 220;
  }

  update(time, delta) {
    if (!this.player || !this.player.body) return;
    const p = this.player;
    if (this.ended) {
      this.ui?.updateHud?.(this.hudData());
      return;
    }

    let input = this.inputCtl.update();
    // Stomach ache: runs to the right on its own.
    if (time < this.forcedRunUntil) input = { ...input, left: false, right: true, run: true, jump: false, jumpPressed: false, attackPressed: false };
    if (input.jumpPressed || input.attackPressed) audio.unlock?.();

    this.hazards.forEach((h) => h.update?.(time, delta));
    this.tripLevel?.update(time, delta);
    this.zones.update(time, delta, p);
    this.updateLadderDrop(input);
    if (this.autoscroll) this.updateAutoscroll(time, delta);

    p.update(time, delta, input);
    p.resetEnv();

    this.weapons.update();
    this.cleanupBullets();
    this.checkBoss();

    this.timeLeft -= delta / 1000;
    this.ui?.updateHud?.(this.hudData());

    if (GameState.hp <= 0) this.burnout('BURNOUT!');
    else if (this.timeLeft <= 0) { this.timeLeft = 0; this.burnout('TEMPO SCADUTO! BURNOUT!'); }
    else if (p.y > GAME_HEIGHT + 60) this.fallInPit();
    else if (this.autoscroll && this.goal && p.x > this.goal.x - 40 && p.body.bottom <= this.goal.y + 60) this.reachGoal();
  }

  cleanupBullets() {
    const view = this.cameras.main.worldView;
    this.enemyBullets.getChildren().slice().forEach((b) => {
      if (b.y > GAME_HEIGHT + 100 || b.x < view.x - 500 || b.x > view.right + 500) b.destroy();
    });
  }

  hudData() {
    return {
      hp: GameState.hp,
      stress: GameState.stress,
      euro: GameState.euro,
      tickets: GameState.tickets,
      vacationDays: GameState.vacationDays,
      device: GameState.device,
      weapon: GameState.weapon,
      timeLeft: Math.max(0, Math.ceil(this.timeLeft)),
      levelId: this.level.id,
      levelName: this.level.name,
      statuses: this.player?.statusList?.() ?? [],
      meal: this.canteen ? this.canteen.slots : null,
      budget: this.level.trip && GameState.trip ? { value: GameState.trip.budget, max: GameState.trip.maxBudget } : null
    };
  }

  cleanup() {
    this.events.off(EVENTS.BOSS_DEFEATED, this.onBossDefeated);
    this.events.off(EVENTS.BOSS_HEALTH, this.onBossHealth);
    this.weapons?.destroy();
    this.hazards.forEach((h) => { try { h.destroy?.(); } catch (e) { /* already gone */ } });
    this.hazards = [];
    try { this.canteen?.destroy(); } catch (e) { /* already gone */ }
    this.canteen = null;
    try { this.tripLevel?.destroy(); } catch (e) { /* already gone */ }
    this.tripLevel = null;
    this.inputCtl?.destroy?.();
    // The camera may already be destroyed during shutdown; create() resets it anyway.
    this.cameras?.main?.setRotation(0);
    this.scene.stop('UIScene');
    this.scene.stop('QuizScene');
    this.scene.stop('BriefScene');
    this.scene.stop('QuitScene');
    this.scene.stop('ToiletScene');
    this.scene.stop('RentalScene');
    this.scene.stop('FoodScene');
    this.scene.stop('BeachScene');
  }
}
