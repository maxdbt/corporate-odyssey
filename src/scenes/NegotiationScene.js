import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEX, playerTex, playerAnim } from '../config/constants.js';
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
const REQUESTS = ['SCONTO DEL 30%', 'LO VOGLIAMO PER IERI', 'UN\'ULTIMA MODIFICA', 'GRATIS, VERO?', 'CI RIPENSIAMO', 'ANCHE IN BLU', 'FATTURA A 180 GG',
  'E SE FOSSE UN\'APP?', 'PIU\' GRANDE IL LOGO', 'CALL ALLE 20?'];
const CONSULT_LINES = ['SINERGIE!', 'FACCIAMO UN DEEP DIVE', 'NON E\' SCALABILE', 'SERVE UN WORKSHOP', 'TI MANDO UN DECK', 'ALLINEIAMOCI'];
const CONSULT_DOWN = ['CI AGGIORNIAMO!', 'MANDO UNA MAIL...', 'ANALISI ANNULLATA', 'RIVEDIAMO A Q3'];

const has = (id) => GameState.hasItem(id);
const phasePoints = (patience) => (patience >= 4 ? 2 : patience >= 2 ? 1 : 0);

// The four questions: each answer gives 0..2 points; some need an item from the suitcase.
// The first one opens the meeting, the other three come after the requests and the consultants.
const QUESTIONS = [
  () => ({
    title: 'La prima impressione',
    text: 'Il cliente ti squadra dalla testa ai piedi.',
    options: [
      { label: GameState.character === 'woman' ? 'Sistemo il blazer e sorrido' : 'Sistemo giacca e cravatta e sorrido',
        disabled: has('suit') ? null : 'non l\'hai in valigia', pts: 2, reply: '"Ecco una persona seria!"' },
      { label: 'Stringo la mano con energia', pts: 1, reply: '"Mmh. Che stretta..."' },
      { label: 'Mi scuso: il viaggio e\' stato lungo', pts: 0, reply: '"Si vede."' }
    ]
  }),
  () => ({
    title: 'A tu per tu',
    text: 'Il cliente si avvicina per parlarti a bassa voce.',
    options: [
      { label: 'Rispondo con un sorriso e alito fresco',
        disabled: has('toothbrush') && has('toothpaste') ? null : 'servono spazzolino e dentifricio', pts: 2, reply: '"Che piacere parlare con lei."' },
      { label: 'Parlo tenendo la mano davanti alla bocca', pts: 1, reply: '"Prego? Non capisco..."' },
      { label: 'Parlo e basta', pts: 0, reply: 'Il cliente indietreggia di due passi.' }
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
const MAX_POINTS = QUESTIONS.length * 2 + 4; // + requests (2) + consultants (2)

const OUTCOMES = [
  { min: 10, title: 'CONTRATTO FIRMATO AL 100%!', color: '#7CFC00', effects: { hp: 30, stress: -30 }, euro: 50 },
  { min: 6, title: 'CONTRATTO FIRMATO... AL 60%', color: '#ffd800', effects: { stress: -10 }, euro: 20 },
  { min: -1, title: 'CONTRATTO RIFIUTATO', color: '#ff8080', effects: { stress: 30 }, euro: 0 }
];

// Trip stage 6: the meeting with the client. First impression, dodge the requests, neutralize the
// consultants (stomp them or throw e-mails), then the last three questions.
export default class NegotiationScene extends Phaser.Scene {
  constructor() {
    super('NegotiationScene');
  }

  init(data) {
    this.levelIndex = data?.levelIndex ?? 0;
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
    this.refreshHud = tripHud(this, 'IL CLIENTE');
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

    this.banner = this.add.text(GAME_WIDTH / 2, 230, 'SEI ARRIVATO DAL CLIENTE!',
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
    const g = this.add.graphics();
    g.fillStyle(0xe8e0d0).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0xd8cfbc);
    for (let x = 0; x < GAME_WIDTH; x += 60) g.fillRect(x, 30, 2, 320);
    g.fillStyle(0x6a4a2a).fillRect(0, FEET_Y, GAME_WIDTH, GAME_HEIGHT - FEET_Y);
    g.fillStyle(0x5ab4ff).fillRect(40, 70, 140, 90).fillRect(620, 70, 140, 90);
    g.lineStyle(4, 0x4a3a2a).strokeRect(40, 70, 140, 90).strokeRect(620, 70, 140, 90);
    // Client behind his big desk
    this.client = this.add.image(GAME_WIDTH / 2, 150, TEX.GUARDIAN1).setOrigin(0.5, 1).setScale(3).setTint(0xffe0c0);
    g.fillStyle(0x4a2a12).fillRect(GAME_WIDTH / 2 - 130, 140, 260, 40);
    g.fillStyle(0x6a3a1a).fillRect(GAME_WIDTH / 2 - 130, 140, 260, 6);
    this.add.text(GAME_WIDTH / 2, 160, 'IL CLIENTE', tstyle(10, '#ffd800')).setOrigin(0.5);
  }

  // Touch buttons for the action phases (jump / throw); movement = hold left or right half of the screen.
  makeTouchButtons() {
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
    // SALTA in both phases, LANCIA only against the consultants
    this.touchUi?.forEach((o, i) => o.setVisible(on && (this.phase === 'consult' || (this.phase === 'dodge' && i < 2))));
    if (!this.hintText) this.hintText = this.add.text(GAME_WIDTH / 2, 438, '', tstyle(9, '#333333', { strokeThickness: 0 })).setOrigin(0.5).setDepth(20);
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
      this.tweens.add({ targets: this.client, scaleY: 2.8, duration: 80, yoyo: true });
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
    const c = this.add.sprite(x, FEET_Y, TEX.CONSULTANT1).setOrigin(0.5, 1).setScale(2).setDepth(6);
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
    // Throw an e-mail
    if (input.fire && time > this.nextFire) {
      this.nextFire = time + 550;
      const m = this.add.image(this.player.x + this.facing * 20, this.player.y - 36, TEX.P_EMAIL).setScale(2).setDepth(7);
      m.vx = this.facing * 480;
      this.mails.push(m);
      audio.sfx('shoot');
    }
    const p = this.player;
    this.consultants.forEach((c) => {
      if (c.down) return;
      // Walk to the player, hop now and then, talk business
      const dir = Math.sign(p.x - c.x) || 1;
      if (time > c.stunUntil) c.x += dir * c.speed * dt;
      c.setFlipX(dir < 0).setTexture(Math.floor(time / 140) % 2 ? TEX.CONSULTANT2 : TEX.CONSULTANT1);
      const incoming = c.dodger && this.mails.some((m) => Math.sign(m.vx) === Math.sign(c.x - m.x) && Math.abs(c.x - m.x) < 110);
      if (c.y >= FEET_Y && (time > c.hopAt || incoming)) { c.vy = -440; c.hopAt = time + Phaser.Math.Between(1500, 2800); }
      c.vy += GRAVITY * dt;
      c.y = Math.min(FEET_Y, c.y + c.vy * dt);
      if (c.y >= FEET_Y) c.vy = 0;
      if (time > c.talkAt) { c.talkAt = time + Phaser.Math.Between(1800, 3000); this.floatText(c.x, c.y - 70, Phaser.Utils.Array.GetRandom(CONSULT_LINES), '#ffffff'); }
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
      lines: [`Pazienza rimasta: ${this.patience}/${PATIENCE}`, 'Ora la trattativa vera e propria...'],
      y: 260,
      onClose: () => this.askNext(() => this.finish(), true)
    });
  }

  // ---------------------------------------------------------------- shared

  readInput() {
    const k = this.keys;
    const d = (n) => !!(k && k[n].isDown);
    let dir = 0;
    if (d('left') || d('a')) dir -= 1;
    if (d('right') || d('d')) dir += 1;
    const ptr = this.input.activePointer;
    const onButton = ptr.y > 340 && ptr.x > GAME_WIDTH - (this.phase === 'consult' ? 140 : 72);
    if (ptr.isDown && !onButton) dir = ptr.x < GAME_WIDTH / 2 ? -1 : 1;
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
    if (this.phase !== 'dodge' && this.phase !== 'consult') return;
    const dt = Math.min(delta, 50) / 1000;
    this.elapsed += dt;
    const input = this.readInput();
    this.movePlayer(time, dt, input);
    if (this.phase === 'dodge') this.updateDodge(time, dt);
    else this.updateConsultants(time, dt, input);
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
    const qd = QUESTIONS[this.q++]();
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
