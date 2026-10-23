import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEX, playerTex, playerAnim } from '../config/constants.js';
import { CLIENTS, CURSES } from '../data/clients.js';
import { drawRoom } from '../gfx/clients.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { beginStage, goNext, finishTrip, underwearPenalty } from '../systems/Trip.js';
import { tstyle, tripHud, choiceDialog, resultPanel, effectLines, applyEffects } from '../ui/TripUI.js';

const FEET_Y = 410;
const DODGE_S = 18;
const PATIENCE = 5;
const GRAVITY = 1500;
const JUMP_V = -600;
const SPEED = 300;
const CONSULTANTS = 8;
const CONSULT_MAX_ON_SCREEN = 3;
const CONSULT_TIMEOUT_S = 30;
const BOSS_HP = 10;
const BOSS_TIMEOUT_S = 45;
const BOSS_SPEED = 60;
const ORB_V = 190;
const SHOT_G = 700;
const REQUESTS = ['SCONTO DEL 30%', 'LO VOGLIAMO PER IERI', 'UN\'ULTIMA MODIFICA', 'GRATIS, VERO?', 'CI RIPENSIAMO', 'ANCHE IN BLU', 'FATTURA A 180 GG',
  'E SE FOSSE UN\'APP?', 'PIU\' GRANDE IL LOGO', 'CALL ALLE 20?'];
const CONSULT_LINES = ['SINERGIE!', 'FACCIAMO UN DEEP DIVE', 'NON E\' SCALABILE', 'SERVE UN WORKSHOP', 'TI MANDO UN DECK', 'ALLINEIAMOCI'];
const CONSULT_DOWN = ['CI AGGIORNIAMO!', 'MANDO UNA MAIL...', 'ANALISI ANNULLATA', 'RIVEDIAMO A Q3'];

const has = (id) => GameState.hasItem(id);
const phasePoints = (patience) => (patience >= 4 ? 2 : patience >= 2 ? 1 : 0);

// The four questions: each answer gives 0..2 points; some need an item from the suitcase.
// The first one opens the meeting, the other three come after the requests, the consultants and the boss.
// t = client theme (CLIENTS).
const QUESTIONS = [
  (t) => ({
    title: 'La prima impressione',
    text: `${t.who} ti squadra dalla testa ai piedi.`,
    options: [
      { label: GameState.character === 'woman' ? 'Sistemo il blazer e sorrido' : 'Sistemo giacca e cravatta e sorrido',
        disabled: has('suit') ? null : 'non l\'hai in valigia', pts: 2, reply: '"Ecco una persona seria!"' },
      { label: 'Stringo la mano con energia', pts: 1, reply: '"Mmh. Che stretta..."' },
      { label: 'Mi scuso: il viaggio e\' stato lungo', pts: 0, reply: '"Si vede."' }
    ]
  }),
  (t) => ({
    title: 'A tu per tu',
    text: `${t.who} si avvicina per parlarti a bassa voce.`,
    options: [
      { label: 'Rispondo con un sorriso e alito fresco',
        disabled: has('toothbrush') && has('toothpaste') ? null : 'servono spazzolino e dentifricio', pts: 2, reply: '"Che piacere parlare con lei."' },
      { label: 'Parlo tenendo la mano davanti alla bocca', pts: 1, reply: '"Prego? Non capisco..."' },
      { label: 'Parlo e basta', pts: 0, reply: `${t.who} indietreggia di due passi.` }
    ]
  }),
  () => ({
    title: 'La proposta',
    text: '"Allora, mi faccia vedere questa proposta."',
    options: [
      { label: 'Presento le slide sul portatile',
        disabled: has('laptop') ? null : 'non hai il portatile',
        pts: has('adapter') ? 2 : 1,
        reply: has('adapter') ? '"Slide chiarissime!"' : 'Senza adattatore il portatile si spegne a meta\' presentazione...' },
      { label: 'Mostro le slide sul telefono', disabled: has('phone') ? null : 'non hai il telefono', pts: 1, reply: '"Non vedo niente, ma va bene."' },
      { label: 'Disegno uno schema su un tovagliolo', pts: 0, reply: '"Molto... creativo."' }
    ]
  }),
  () => ({
    title: 'I saluti',
    text: '"Bene. Ci risentiamo?"',
    options: [
      { label: 'Lascio il mio biglietto da visita', disabled: has('cards') ? null : 'non li hai in valigia', pts: 2, reply: '"Elegante. La chiamo io."' },
      { label: 'Fisso il prossimo incontro sul quaderno', disabled: has('notebook') ? null : 'non hai il quaderno', pts: 2, reply: '"Organizzato! Mi piace."' },
      { label: '"Mi lascia il suo numero?"', pts: 0, reply: '"Lo trova sul sito."' }
    ]
  })
];
const MAX_POINTS = QUESTIONS.length * 2 + 6; // + requests (2) + consultants (2) + boss (2)

const OUTCOMES = [
  { min: 11, title: 'CONTRATTO FIRMATO AL 100%!', color: '#7CFC00', effects: { hp: 30, stress: -30 }, euro: 50 },
  { min: 7, title: 'CONTRATTO FIRMATO... AL 60%', color: '#ffd800', effects: { stress: -10 }, euro: 20 },
  { min: -1, title: 'CONTRATTO RIFIUTATO', color: '#ff8080', effects: { stress: 30 }, euro: 0 }
];

// Trip stage 6: the meeting with the client. First impression, dodge the requests, neutralize the
// consultants (stomp them or throw e-mails), beat the super consultant (boss), then the last three questions.
// Client, room, consultants and boss follow the ground leg crossed (CLIENTS[GameState.trip.leg]).
export default class NegotiationScene extends Phaser.Scene {
  constructor() {
    super('NegotiationScene');
  }

  init(data) {
    this.levelIndex = data?.levelIndex ?? 0;
    const leg = data?.leg || GameState.trip?.leg || Phaser.Utils.Array.GetRandom(Object.keys(CLIENTS));
    this.theme = CLIENTS[leg] || CLIENTS.desert;
    this.shots = [];
    this.boss = null;
    this.phase = 'intro';
    this.elapsed = 0;
    this.patience = PATIENCE;
    this.points = 0;
    this.q = 0;
    this.nextSpawn = 0;
    this.invulnUntil = 0;
    this.requests = [];
    this.consultants = [];
    this.mails = [];
    this.spawned = 0;
    this.vy = 0;
    this.facing = 1;
    this.nextFire = 0;
    this.touch = { jump: false, fire: false };
  }

  create() {
    setupStaticCamera(this);
    GameState.beginLevel(this.levelIndex);
    beginStage(this.levelIndex);
    audio.music('boss');
    this.drawOffice();
    this.refreshHud = tripHud(this, this.theme.hud);
    if (underwearPenalty()) this.refreshHud();

    const c = GameState.character || 'man';
    this.walkAnim = playerAnim(c, 'walk');
    this.idleTex = playerTex(c, 'idle');
    this.jumpTex = playerTex(c, 'jump');
    this.player = this.add.sprite(GAME_WIDTH / 2, FEET_Y, this.idleTex).setOrigin(0.5, 1).setScale(2).setDepth(5);

    this.patienceGfx = this.add.graphics().setDepth(20);
    this.patienceLabel = this.add.text(20, 44, 'PAZIENZA DEL CLIENTE', tstyle(9, '#ffb000')).setOrigin(0, 0.5).setDepth(20);
    this.timeText = this.add.text(GAME_WIDTH - 10, 44, '', tstyle(10)).setOrigin(1, 0.5).setDepth(20);
    this.drawPatience();
    this.setActionHud(false);

    this.banner = this.add.text(GAME_WIDTH / 2, 230, this.theme.arrive,
      tstyle(18, '#ffffff', { align: 'center', strokeThickness: 5, lineSpacing: 6 })).setOrigin(0.5).setDepth(30);
    this.time.delayedCall(1600, () => { this.banner.setVisible(false); this.askNext(() => this.startDodge()); });

    const kb = this.input.keyboard;
    this.keys = kb ? kb.addKeys({
      left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D', up: 'UP', w: 'W', space: 'SPACE', z: 'Z', c: 'C', q: 'Q'
    }, true, false) : null;
    this.makeTouchButtons();
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  drawOffice() {
    const { client, labelColor } = drawRoom(this, this.theme);
    this.client = client;
    this.add.text(GAME_WIDTH / 2, 162, this.theme.label, tstyle(10, labelColor)).setOrigin(0.5);
  }

  // Touch buttons for the action phases (jump / throw); movement = hold left or right half of the screen.
  // Only on touch devices (same check as UIScene's TouchControls).
  makeTouchButtons() {
    this.touchUi = [];
    if (!this.sys.game.device.input.touch) return;
    const mk = (x, label, key) => {
      const b = this.add.circle(x, 372, 26, 0x000000, 0.4).setStrokeStyle(2, 0xffffff, 0.6).setDepth(25)
        .setInteractive().setVisible(false);
      const t = this.add.text(x, 372, label, tstyle(8)).setOrigin(0.5).setDepth(26).setVisible(false);
      b.on('pointerdown', () => { this.touch[key] = true; });
      return [b, t];
    };
    this.touchUi = [...mk(GAME_WIDTH - 40, 'SALTA', 'jump'), ...mk(GAME_WIDTH - 104, 'LANCIA', 'fire')];
  }

  setActionHud(on, hint = '') {
    this.patienceGfx.setVisible(on);
    this.patienceLabel.setVisible(on);
    this.timeText.setVisible(on);
    // SALTA in every phase, LANCIA only against the consultants and the boss
    this.touchUi?.forEach((o, i) => o.setVisible(on && (this.phase === 'consult' || this.phase === 'boss' || (this.phase === 'dodge' && i < 2))));
    if (!this.hintText) this.hintText = this.add.text(GAME_WIDTH / 2, 438, '', tstyle(9, this.theme.hint, { strokeThickness: 0 })).setOrigin(0.5).setDepth(20);
    this.hintText.setText(hint).setVisible(on);
  }

  drawPatience() {
    const g = this.patienceGfx.clear();
    const w = 30;
    const x0 = 20;
    for (let i = 0; i < PATIENCE; i++) {
      g.fillStyle(0x000000).fillRect(x0 + i * (w + 4), 52, w, 8);
      g.fillStyle(i < this.patience ? 0xffb000 : 0x442200).fillRect(x0 + i * (w + 4) + 1, 53, w - 2, 6);
    }
  }

  // Big banner, then start an action phase.
  announce(text, then) {
    this.banner.setText(text).setFontSize(15).setVisible(true);
    audio.sfx('quiz');
    this.time.delayedCall(2400, () => {
      this.banner.setText('VIA!').setFontSize(26);
      then();
      this.time.delayedCall(600, () => this.banner.setVisible(false));
    });
  }

  // ---------------------------------------------------------------- phase 1: requests

  startDodge() {
    this.patience = PATIENCE;
    this.elapsed = 0;
    this.drawPatience();
    this.announce('ORA LE SUE RICHIESTE: SCHIVALE!\nOGNI RICHIESTA PRESA FA PERDERE PAZIENZA', () => {
      this.phase = 'dodge';
      this.setActionHud(true, 'SINISTRA/DESTRA per spostarti  -  SPAZIO per saltare');
    });
  }

  updateDodge(time, dt) {
    this.timeText.setText(`${Math.max(0, Math.ceil(DODGE_S - this.elapsed))}s`);
    // Faster and faster, some aimed at you, sometimes two at once.
    if (time > this.nextSpawn) {
      this.nextSpawn = time + Math.max(240, 620 - this.elapsed * 24);
      const n = Math.random() < 0.25 + this.elapsed * 0.02 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const aimed = i === 0 && Math.random() < 0.4;
        const x = aimed ? Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-30, 30), 60, GAME_WIDTH - 60) : Phaser.Math.Between(60, GAME_WIDTH - 60);
        const t = this.add.text(x, 150, Phaser.Utils.Array.GetRandom(REQUESTS), tstyle(9, '#000000', {
          strokeThickness: 0, backgroundColor: aimed ? '#ffe0e0' : '#ffffff', padding: { x: 4, y: 3 }
        })).setOrigin(0.5).setDepth(8);
        t.vy = Phaser.Math.Between(150, 210) + this.elapsed * 6;
        t.vx = aimed ? 0 : Phaser.Math.Between(-40, 40);
        this.requests.push(t);
      }
      this.tweens.add({ targets: this.client, scaleY: 2.8, duration: 80, yoyo: true, onComplete: () => this.client.setScale(3) });
    }
    const px = this.player.x;
    const top = this.player.y - 62;
    this.requests = this.requests.filter((r) => {
      r.y += r.vy * dt;
      r.x += r.vx * dt;
      if (time > this.invulnUntil && Math.abs(r.x - px) < r.width / 2 + 12 && r.y > top && r.y < this.player.y) {
        this.hit(time);
        r.destroy();
        return false;
      }
      if (r.y > GAME_HEIGHT + 20) { r.destroy(); return false; }
      return true;
    });
    if (this.elapsed >= DODGE_S || this.patience <= 0) this.endDodge();
  }

  endDodge() {
    this.phase = 'pause';
    this.requests.forEach((r) => r.destroy());
    this.requests = [];
    this.setActionHud(false);
    const pts = phasePoints(this.patience);
    this.points += pts;
    resultPanel(this, {
      title: this.patience > 0 ? 'RICHIESTE GESTITE!' : 'IL CLIENTE HA PERSO LA PAZIENZA',
      color: pts === 2 ? '#7CFC00' : pts === 1 ? '#ffd800' : '#ff8080',
      lines: [`Pazienza rimasta: ${this.patience}/${PATIENCE}`, '"Bene... ma vediamo cosa ne pensano gli esperti."'],
      y: 260,
      onClose: () => this.startConsultants()
    });
  }

  // ---------------------------------------------------------------- phase 2: consultants

  startConsultants() {
    this.patience = PATIENCE;
    this.elapsed = 0;
    this.spawned = 0;
    this.nextSpawn = 0;
    this.drawPatience();
    this.announce('"ORA I MIEI CONSULENTI\nANALIZZERANNO IL PROGETTO"\nSALTACI SOPRA O LANCIA EMAIL (C)', () => {
      this.phase = 'consult';
      this.setActionHud(true, 'SPAZIO salta (schiacciali!)  -  C lancia una email  -  SINISTRA/DESTRA ti sposti');
    });
  }

  spawnConsultant() {
    const fromLeft = this.spawned % 2 === 0;
    const x = fromLeft ? -20 : GAME_WIDTH + 20;
    const c = this.add.sprite(x, FEET_Y, this.theme.consultant[0]).setOrigin(0.5, 1).setScale(2).setDepth(6);
    c.speed = Phaser.Math.Between(120, 170) + this.spawned * 10;
    c.vy = 0;
    c.y0 = FEET_Y;
    c.hopAt = this.time.now + Phaser.Math.Between(1200, 2400);
    c.talkAt = this.time.now + Phaser.Math.Between(300, 900);
    c.stunUntil = 0;
    // Some of them have seen it all: they hop over incoming e-mails.
    c.dodger = Math.random() < 0.45;
    this.consultants.push(c);
    this.spawned++;
  }

  neutralize(c, how) {
    if (c.down) return;
    c.down = true;
    audio.sfx(how === 'stomp' ? 'stomp' : 'explosion');
    this.floatText(c.x, c.y - 70, Phaser.Utils.Array.GetRandom(CONSULT_DOWN), '#7CFC00');
    this.tweens.add({
      targets: c, scaleY: how === 'stomp' ? 0.6 : 2, angle: how === 'stomp' ? 0 : 90, alpha: 0, duration: 500,
      onComplete: () => c.destroy()
    });
  }

  updateConsultants(time, dt, input) {
    const left = this.consultants.filter((c) => !c.down).length;
    this.timeText.setText(`CONSULENTI: ${CONSULTANTS - this.spawned + left}`);
    if (this.spawned < CONSULTANTS && left < CONSULT_MAX_ON_SCREEN && time > this.nextSpawn) {
      this.nextSpawn = time + 1300;
      this.spawnConsultant();
    }
    this.fireMail(time, input);
    const p = this.player;
    this.consultants.forEach((c) => {
      if (c.down) return;
      // Walk to the player, hop now and then, talk business
      const dir = Math.sign(p.x - c.x) || 1;
      if (time > c.stunUntil) c.x += dir * c.speed * dt;
      c.setFlipX(dir < 0).setTexture(this.theme.consultant[Math.floor(time / 140) % 2]);
      const incoming = c.dodger && this.mails.some((m) => Math.sign(m.vx) === Math.sign(c.x - m.x) && Math.abs(c.x - m.x) < 110);
      if (c.y >= FEET_Y && (time > c.hopAt || incoming)) { c.vy = -440; c.hopAt = time + Phaser.Math.Between(1500, 2800); }
      c.vy += GRAVITY * dt;
      c.y = Math.min(FEET_Y, c.y + c.vy * dt);
      if (c.y >= FEET_Y) c.vy = 0;
      if (time > c.talkAt) { c.talkAt = time + Phaser.Math.Between(1800, 3000); this.floatText(c.x, c.y - 70, Phaser.Utils.Array.GetRandom([...CONSULT_LINES, ...this.theme.consultLines]), '#ffffff'); }
      // Player contact: stomp from above, otherwise lose patience
      if (Math.abs(c.x - p.x) < 30 && p.y > c.y - 66 && p.y - 64 < c.y) {
        if (this.vy > 0 && p.y < c.y - 40) {
          this.neutralize(c, 'stomp');
          this.vy = -380;
        } else if (time > this.invulnUntil) {
          this.hit(time);
          c.stunUntil = time + 700;
          c.x -= dir * 50;
        }
      }
    });
    this.mails = this.mails.filter((m) => {
      m.x += m.vx * dt;
      const target = this.consultants.find((c) => !c.down && Math.abs(c.x - m.x) < 22 && m.y > c.y - 64 && m.y < c.y);
      if (target) { this.neutralize(target, 'mail'); m.destroy(); return false; }
      if (m.x < -20 || m.x > GAME_WIDTH + 20) { m.destroy(); return false; }
      return true;
    });
    this.consultants = this.consultants.filter((c) => c.active);
    const allDone = this.spawned >= CONSULTANTS && this.consultants.every((c) => c.down);
    if (allDone || this.patience <= 0 || this.elapsed > CONSULT_TIMEOUT_S) this.endConsultants();
  }

  endConsultants() {
    this.phase = 'pause';
    const stillThere = this.consultants.filter((c) => !c.down).length + CONSULTANTS - this.spawned;
    this.consultants.forEach((c) => c.destroy());
    this.mails.forEach((m) => m.destroy());
    this.consultants = [];
    this.mails = [];
    this.setActionHud(false);
    const pts = stillThere > 0 ? Math.min(1, phasePoints(this.patience)) : phasePoints(this.patience);
    this.points += pts;
    resultPanel(this, {
      title: stillThere > 0 ? 'I CONSULENTI CONSEGNANO 300 SLIDE DI REPORT' : 'CONSULENTI NEUTRALIZZATI!',
      color: pts === 2 ? '#7CFC00' : pts === 1 ? '#ffd800' : '#ff8080',
      lines: [`Pazienza rimasta: ${this.patience}/${PATIENCE}`, '"Interessante... ma sentiamo il mio super consulente."'],
      y: 260,
      onClose: () => this.startBoss()
    });
  }

  // ---------------------------------------------------------------- phase 3: the super consultant (boss)

  startBoss() {
    const cfg = this.theme.boss;
    this.patience = PATIENCE;
    this.elapsed = 0;
    this.bossHp = BOSS_HP;
    this.bossDir = -1;
    this.bossHurtUntil = 0;
    this.castUntil = 0;
    this.nextBossLine = 0;
    this.shotCount = 0;
    this.drawPatience();
    this.boss = this.add.sprite(GAME_WIDTH + 80, FEET_Y, cfg.tex[0]).setOrigin(0.5, 1).setScale(2.5).setDepth(6).setFlipX(true);
    this.tweens.add({ targets: this.boss, x: 640, duration: 1800 });
    this.bossBar = this.add.graphics().setDepth(20);
    this.bossLabel = this.add.text(GAME_WIDTH - 10, 60, cfg.name, tstyle(9, '#ff9fd0')).setOrigin(1, 0.5).setDepth(20);
    this.drawBossBar();
    this.announce(cfg.intro, () => {
      this.phase = 'boss';
      this.nextAttack = this.time.now + 900;
      this.setActionHud(true, 'SPAZIO salta (in testa!)  -  C lancia una email  -  SINISTRA/DESTRA ti sposti');
    });
  }

  drawBossBar() {
    this.bossBar.clear().fillStyle(0x000000).fillRect(GAME_WIDTH - 210, 68, 200, 10)
      .fillStyle(0xff3c8a).fillRect(GAME_WIDTH - 209, 69, Math.round(198 * this.bossHp / BOSS_HP), 8);
  }

  // Orbs fly at you and home in a little; fish, crabs and shells are lobbed (crabs then scuttle along the floor).
  attack(rage) {
    const b = this.boss;
    const p = this.player;
    const cfg = this.theme.boss;
    const hx = b.x + (b.flipX ? -30 : 30);
    const hy = b.y - b.displayHeight * 0.75;
    this.shotCount++;
    if (cfg.attack === 'orb') {
      const n = rage > 0.5 ? 3 : rage > 0.2 ? 2 : 1;
      const base = Phaser.Math.Angle.Between(hx, hy, p.x, p.y - 30);
      for (let i = 0; i < n; i++) {
        const a = base + (i - (n - 1) / 2) * 0.3;
        this.shoot('curse_orb', hx, hy, Math.cos(a) * ORB_V, Math.sin(a) * ORB_V, { homing: true, life: 4500 });
      }
      audio.sfx('freeze');
      return;
    }
    const n = rage > 0.5 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const T = 1 + i * 0.35;
      const tx = Phaser.Math.Clamp(p.x + Phaser.Math.Between(-40, 40), 30, GAME_WIDTH - 30);
      const tex = cfg.attack === 'fish' ? 'fish_padulo' : (this.shotCount + i) % 2 ? 'crab' : 'shell';
      this.shoot(tex, hx, hy, (tx - hx) / T, (FEET_Y - 30 - hy - 0.5 * SHOT_G * T * T) / T,
        { g: SHOT_G, spin: tex !== 'crab', walker: tex === 'crab', label: cfg.shotLabel });
    }
    audio.sfx('shoot');
  }

  shoot(tex, x, y, vx, vy, o) {
    const s = this.add.image(x, y, tex).setScale(2).setDepth(9);
    s.sh = { vx, vy, g: o.g || 0, homing: o.homing, walker: o.walker, spin: o.spin, dieAt: this.time.now + (o.life || 6000) };
    if (tex === 'fish_padulo') s.setFlipX(vx > 0);
    if (o.homing) this.tweens.add({ targets: s, scale: 2.5, duration: 200, yoyo: true, repeat: -1 });
    if (o.label) s.sh.tag = this.add.text(x, y - 18, o.label, tstyle(7, '#ffe0a0')).setOrigin(0.5).setDepth(9);
    this.shots.push(s);
  }

  // Hit by a projectile: patience down and a random corporate curse in big letters.
  curse(time) {
    this.hit(time);
    this.curseText?.destroy();
    const t = this.add.text(GAME_WIDTH / 2, 235, `${this.theme.boss.hit}\n${Phaser.Utils.Array.GetRandom(CURSES)}`,
      tstyle(15, '#ff9fd0', { align: 'center', strokeThickness: 5, lineSpacing: 4 })).setOrigin(0.5).setDepth(30);
    this.curseText = t;
    this.tweens.add({ targets: t, scale: { from: 0.6, to: 1 }, duration: 160 });
    this.tweens.add({ targets: t, y: 205, alpha: 0, delay: 1400, duration: 500, onComplete: () => t.destroy() });
  }

  damageBoss(time, n) {
    if (time < this.bossHurtUntil) return;
    const b = this.boss;
    this.bossHp = Math.max(0, this.bossHp - n);
    this.bossHurtUntil = time + 350;
    audio.sfx(n > 1 ? 'stomp' : 'explosion');
    this.drawBossBar();
    if (time > this.nextBossLine) {
      this.nextBossLine = time + 2500;
      this.floatText(b.x, b.y - b.displayHeight - 16, Phaser.Utils.Array.GetRandom(this.theme.boss.lines), '#ffffff');
    }
  }

  updateBoss(time, dt, input) {
    const b = this.boss;
    const p = this.player;
    const cfg = this.theme.boss;
    this.timeText.setText(`${Math.max(0, Math.ceil(BOSS_TIMEOUT_S - this.elapsed))}s`);
    // Patrol the right half, always facing you; stop while casting. Faster attacks as it weakens.
    const casting = time < this.castUntil;
    if (!casting) {
      b.x += this.bossDir * BOSS_SPEED * dt;
      if (b.x < 420) this.bossDir = 1;
      else if (b.x > 700) this.bossDir = -1;
    }
    b.setFlipX(p.x < b.x);
    b.setTexture(cfg.attack === 'crab' ? cfg.tex[Math.floor(time / 260) % 2] : cfg.tex[casting ? 1 : 0]);
    if (time < this.bossHurtUntil && Math.floor(time / 60) % 2) b.setTintFill(0xffffff);
    else b.clearTint();
    if (time > this.nextAttack) {
      const rage = 1 - this.bossHp / BOSS_HP;
      this.nextAttack = time + 1500 - rage * 600;
      this.castUntil = time + 450;
      this.attack(rage);
    }
    this.fireMail(time, input);
    // Projectiles
    this.shots = this.shots.filter((s) => {
      const o = s.sh;
      if (o.homing) {
        const a = Phaser.Math.Angle.Between(s.x, s.y, p.x, p.y - 30);
        o.vx += Math.cos(a) * 160 * dt;
        o.vy += Math.sin(a) * 160 * dt;
        const v = Math.hypot(o.vx, o.vy);
        if (v > ORB_V) { o.vx *= ORB_V / v; o.vy *= ORB_V / v; }
      }
      o.vy += o.g * dt;
      s.x += o.vx * dt;
      s.y += o.vy * dt;
      if (o.walker && s.y >= FEET_Y - 10) {
        if (!o.landed) { o.landed = true; o.g = 0; o.vy = 0; o.vx = (Math.sign(p.x - s.x) || 1) * 170; }
        s.y = FEET_Y - 10 - (Math.floor(time / 90) % 2) * 2;
      }
      if (o.spin) s.angle += 420 * dt * (Math.sign(o.vx) || 1);
      o.tag?.setPosition(s.x, s.y - 18);
      let gone = time > o.dieAt || s.x < -30 || s.x > GAME_WIDTH + 30 || (!o.walker && s.y >= FEET_Y - 6);
      if (!gone && time > this.invulnUntil && Math.abs(s.x - p.x) < 22 && Math.abs(s.y - (p.y - 30)) < 34) {
        this.curse(time);
        gone = true;
      }
      const m = !gone && this.mails.find((x) => !x.dead && Math.abs(x.x - s.x) < 18 && Math.abs(x.y - s.y) < 20);
      if (m) { m.dead = true; gone = true; this.floatText(s.x, s.y - 10, 'PARATA!', '#7CFC00'); }
      if (gone) { o.tag?.destroy(); s.destroy(); return false; }
      return true;
    });
    // E-mails hit the boss
    const bw = b.displayWidth * 0.35;
    const top = b.y - b.displayHeight;
    this.mails = this.mails.filter((m) => {
      if (m.dead) { m.destroy(); return false; }
      m.x += m.vx * dt;
      if (Math.abs(m.x - b.x) < bw && m.y > top && m.y < b.y) { this.damageBoss(time, 1); m.destroy(); return false; }
      if (m.x < -20 || m.x > GAME_WIDTH + 20) { m.destroy(); return false; }
      return true;
    });
    // Stomp on its head, or bump into it and get pushed back
    if (Math.abs(p.x - b.x) < bw + 10 && p.y > top && p.y - 60 < b.y) {
      if (this.vy > 0 && p.y < top + 28) {
        this.damageBoss(time, 2);
        this.vy = -520;
      } else if (time > this.invulnUntil) {
        this.hit(time);
        p.x = Phaser.Math.Clamp(p.x + (p.x < b.x ? -90 : 90), 30, GAME_WIDTH - 30);
      }
    }
    if (this.bossHp <= 0) this.endBoss(true);
    else if (this.patience <= 0 || this.elapsed > BOSS_TIMEOUT_S) this.endBoss(false);
  }

  endBoss(won) {
    const b = this.boss;
    const cfg = this.theme.boss;
    this.phase = 'pause';
    this.shots.forEach((s) => { s.sh.tag?.destroy(); s.destroy(); });
    this.mails.forEach((m) => m.destroy());
    this.shots = [];
    this.mails = [];
    this.bossBar.destroy();
    this.bossLabel.destroy();
    this.setActionHud(false);
    b.clearTint();
    if (won) this.tweens.add({ targets: b, angle: b.flipX ? -90 : 90, alpha: 0, duration: 900, onComplete: () => b.destroy() });
    else this.tweens.add({ targets: b, x: GAME_WIDTH + 120, duration: 1400, onComplete: () => b.destroy() });
    const pts = won ? phasePoints(this.patience) : this.bossHp <= BOSS_HP / 2 ? Math.min(1, phasePoints(this.patience)) : 0;
    this.points += pts;
    resultPanel(this, {
      title: won ? cfg.won : cfg.lost,
      color: pts === 2 ? '#7CFC00' : pts === 1 ? '#ffd800' : '#ff8080',
      lines: [`Pazienza rimasta: ${this.patience}/${PATIENCE}`, won ? `${cfg.name} E' FUORI GIOCO!` : `${cfg.name}: energia ${this.bossHp}/${BOSS_HP}`,
        'Ora la trattativa vera e propria...'],
      y: 260,
      onClose: () => this.askNext(() => this.finish(), true)
    });
  }

  // ---------------------------------------------------------------- shared

  fireMail(time, input) {
    if (!input.fire || time < this.nextFire) return;
    this.nextFire = time + 550;
    const m = this.add.image(this.player.x + this.facing * 20, this.player.y - 36, TEX.P_EMAIL).setScale(2).setDepth(7);
    m.vx = this.facing * 480;
    this.mails.push(m);
    audio.sfx('shoot');
  }

  readInput() {
    const k = this.keys;
    const d = (n) => !!(k && k[n].isDown);
    let dir = 0;
    if (d('left') || d('a')) dir -= 1;
    if (d('right') || d('d')) dir += 1;
    const ptr = this.input.activePointer;
    const onButton = ptr.y > 340 && ptr.x > GAME_WIDTH - (this.phase === 'dodge' ? 72 : 140);
    if (this.touchUi.length && ptr.isDown && !onButton) dir = ptr.x < GAME_WIDTH / 2 ? -1 : 1;
    const jump = (k && (Phaser.Input.Keyboard.JustDown(k.space) || Phaser.Input.Keyboard.JustDown(k.z) ||
      Phaser.Input.Keyboard.JustDown(k.up) || Phaser.Input.Keyboard.JustDown(k.w))) || this.touch.jump;
    const fire = (k && (k.c.isDown || k.q.isDown)) || this.touch.fire;
    this.touch.jump = false;
    this.touch.fire = false;
    return { dir, jump, fire };
  }

  movePlayer(time, dt, input) {
    const p = this.player;
    p.x = Phaser.Math.Clamp(p.x + input.dir * SPEED * dt, 30, GAME_WIDTH - 30);
    if (input.jump && p.y >= FEET_Y) { this.vy = JUMP_V; audio.sfx('jump'); }
    this.vy += GRAVITY * dt;
    p.y = Math.min(FEET_Y, p.y + this.vy * dt);
    if (p.y >= FEET_Y) this.vy = 0;
    if (input.dir) this.facing = input.dir;
    p.setFlipX(this.facing < 0);
    if (p.y < FEET_Y) { p.stop(); p.setTexture(this.jumpTex); }
    else if (input.dir) { if (this.anims.exists(this.walkAnim)) p.play(this.walkAnim, true); }
    else { p.stop(); p.setTexture(this.idleTex); }
    p.setAlpha(time < this.invulnUntil && Math.floor(time / 80) % 2 ? 0.3 : 1);
  }

  update(time, delta) {
    if (this.phase !== 'dodge' && this.phase !== 'consult' && this.phase !== 'boss') return;
    const dt = Math.min(delta, 50) / 1000;
    this.elapsed += dt;
    const input = this.readInput();
    this.movePlayer(time, dt, input);
    if (this.phase === 'dodge') this.updateDodge(time, dt);
    else if (this.phase === 'consult') this.updateConsultants(time, dt, input);
    else this.updateBoss(time, dt, input);
  }

  hit(time) {
    this.patience = Math.max(0, this.patience - 1);
    this.invulnUntil = time + 900;
    GameState.addStress(5);
    this.refreshHud();
    this.drawPatience();
    audio.sfx('hurt');
    this.cameras.main.shake(150, 0.006);
  }

  floatText(x, y, text, color) {
    const t = this.add.text(Phaser.Math.Clamp(x, 70, GAME_WIDTH - 70), y, text, tstyle(9, color)).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: t, y: y - 24, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
  }

  // Asks the next question; after the first one `then` runs. `all` = keep asking until the last.
  askNext(then, all = false) {
    if (this.q >= QUESTIONS.length) { then(); return; }
    this.phase = 'questions';
    this.player.stop();
    this.player.setTexture(this.idleTex).setAlpha(1);
    this.tweens.add({ targets: this.player, x: GAME_WIDTH / 2, y: FEET_Y, duration: 400 });
    this.vy = 0;
    const qd = QUESTIONS[this.q++](this.theme);
    choiceDialog(this, {
      title: `Trattativa ${this.q}/${QUESTIONS.length}: ${qd.title}`, text: qd.text, options: qd.options, y: 280,
      onPick: (i) => {
        const o = qd.options[i];
        this.points += o.pts;
        audio.sfx(o.pts === 2 ? 'coin' : o.pts === 1 ? 'select' : 'hurt');
        resultPanel(this, {
          title: o.reply, color: o.pts === 2 ? '#7CFC00' : o.pts === 1 ? '#ffd800' : '#ff8080',
          lines: [o.pts === 2 ? 'Ottima mossa!' : o.pts === 1 ? 'Poteva andare meglio.' : 'Male...'], y: 280,
          onClose: () => (all ? this.askNext(then, true) : then())
        });
      }
    });
  }

  finish() {
    this.phase = 'end';
    const o = OUTCOMES.find((x) => this.points >= x.min);
    applyEffects(o.effects);
    if (o.euro) GameState.addBonus('euro', o.euro);
    const fromBudget = finishTrip();
    this.refreshHud();
    audio.sfx(o.min >= 6 ? 'victory' : 'gameover');
    const lines = [
      `Punteggio trattativa: ${this.points}/${MAX_POINTS}`,
      ...effectLines(o.effects),
      o.euro ? `BONUS +${o.euro} EURO` : '',
      fromBudget ? `Budget avanzato: +${fromBudget} euro` : 'Budget avanzato: nessuno',
      '', 'TRASFERTA CONCLUSA!'
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '');
    resultPanel(this, {
      title: o.title, color: o.color, lines, y: 250,
      onClose: () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => goNext(this, this.levelIndex));
      }
    });
  }
}
