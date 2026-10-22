import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEX, playerTex, playerAnim } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { beginStage, goNext, finishTrip, underwearPenalty } from '../systems/Trip.js';
import { tstyle, tripHud, choiceDialog, resultPanel, effectLines, applyEffects } from '../ui/TripUI.js';

const FEET_Y = 410;
const DODGE_S = 20;
const PATIENCE = 5;
const REQUESTS = ['SCONTO DEL 30%', 'LO VOGLIAMO PER IERI', 'UN\'ULTIMA MODIFICA', 'GRATIS, VERO?', 'CI RIPENSIAMO', 'ANCHE IN BLU', 'FATTURA A 180 GG'];

const has = (id) => GameState.hasItem(id);

// The four questions: each answer gives 0..2 points; some need an item from the suitcase.
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

const OUTCOMES = [
  { min: 8, title: 'CONTRATTO FIRMATO AL 100%!', color: '#7CFC00', effects: { hp: 30, stress: -30 }, euro: 50 },
  { min: 5, title: 'CONTRATTO FIRMATO... AL 60%', color: '#ffd800', effects: { stress: -10 }, euro: 20 },
  { min: -1, title: 'CONTRATTO RIFIUTATO', color: '#ff8080', effects: { stress: 30 }, euro: 0 }
];

// Trip stage 6: the meeting with the client. Dodge the requests, then answer four questions.
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
    this.player = this.add.sprite(GAME_WIDTH / 2, FEET_Y, this.idleTex).setOrigin(0.5, 1).setScale(2).setDepth(5);

    this.patienceGfx = this.add.graphics().setDepth(20);
    this.patienceLabel = this.add.text(GAME_WIDTH / 2, 44, '', tstyle(9, '#ffb000')).setOrigin(0.5).setDepth(20);
    this.timeText = this.add.text(GAME_WIDTH - 10, 44, '', tstyle(10)).setOrigin(1, 0.5).setDepth(20);
    this.drawPatience();

    this.banner = this.add.text(GAME_WIDTH / 2, 230,
      'SEI ARRIVATO DAL CLIENTE!\nPRIMA LE SUE RICHIESTE: SCHIVALE\nOGNI RICHIESTA PRESA FA PERDERE PAZIENZA',
      tstyle(14, '#ffffff', { align: 'center', strokeThickness: 5, lineSpacing: 6 })).setOrigin(0.5).setDepth(30);
    this.time.delayedCall(2600, () => {
      this.banner.setText('VIA!').setFontSize(26);
      this.phase = 'dodge';
      this.time.delayedCall(600, () => this.banner.setVisible(false));
    });

    const kb = this.input.keyboard;
    this.keys = kb ? kb.addKeys({ left: 'LEFT', right: 'RIGHT', a: 'A', d: 'D' }, true, false) : null;
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

  drawPatience() {
    const g = this.patienceGfx.clear();
    const w = 30;
    const x0 = GAME_WIDTH / 2 - (PATIENCE * (w + 4)) / 2;
    for (let i = 0; i < PATIENCE; i++) {
      g.fillStyle(0x000000).fillRect(x0 + i * (w + 4), 52, w, 8);
      g.fillStyle(i < this.patience ? 0xffb000 : 0x442200).fillRect(x0 + i * (w + 4) + 1, 53, w - 2, 6);
    }
    this.patienceLabel.setText('PAZIENZA DEL CLIENTE');
  }

  update(time, delta) {
    if (this.phase !== 'dodge') return;
    const dt = delta / 1000;
    this.elapsed += dt;
    this.timeText.setText(`${Math.max(0, Math.ceil(DODGE_S - this.elapsed))}s`);

    // Move
    const k = this.keys;
    let dir = 0;
    if (k && (k.left.isDown || k.a.isDown)) dir -= 1;
    if (k && (k.right.isDown || k.d.isDown)) dir += 1;
    const ptr = this.input.activePointer;
    if (ptr.isDown) dir = ptr.x < GAME_WIDTH / 2 ? -1 : 1;
    this.player.x = Phaser.Math.Clamp(this.player.x + dir * 300 * dt, 30, GAME_WIDTH - 30);
    if (dir) { this.player.setFlipX(dir < 0); if (this.anims.exists(this.walkAnim)) this.player.play(this.walkAnim, true); }
    else { this.player.stop(); this.player.setTexture(this.idleTex); }
    if (time < this.invulnUntil) this.player.setAlpha(Math.floor(time / 80) % 2 ? 0.3 : 1);
    else this.player.setAlpha(1);

    // Spawn requests: faster as time goes on
    if (time > this.nextSpawn) {
      this.nextSpawn = time + Math.max(380, 800 - this.elapsed * 22);
      const x = Phaser.Math.Between(60, GAME_WIDTH - 60);
      const t = this.add.text(x, 150, Phaser.Utils.Array.GetRandom(REQUESTS), tstyle(9, '#000000', {
        strokeThickness: 0, backgroundColor: '#ffffff', padding: { x: 4, y: 3 }
      })).setOrigin(0.5).setDepth(8);
      t.vy = Phaser.Math.Between(150, 220 + this.elapsed * 4);
      this.requests.push(t);
      this.tweens.add({ targets: this.client, scaleY: 2.8, duration: 80, yoyo: true });
    }
    const px = this.player.x;
    this.requests = this.requests.filter((r) => {
      r.y += r.vy * dt;
      if (time > this.invulnUntil && Math.abs(r.x - px) < r.width / 2 + 10 && r.y > FEET_Y - 60 && r.y < FEET_Y) {
        this.hit(time);
        r.destroy();
        return false;
      }
      if (r.y > GAME_HEIGHT + 20) { r.destroy(); return false; }
      return true;
    });
    if (this.elapsed >= DODGE_S || this.patience <= 0) this.endDodge();
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

  endDodge() {
    this.phase = 'questions';
    this.requests.forEach((r) => r.destroy());
    this.requests = [];
    this.player.stop();
    this.player.setTexture(this.idleTex).setAlpha(1);
    this.tweens.add({ targets: this.player, x: GAME_WIDTH / 2, duration: 500 });
    const pts = this.patience >= 4 ? 2 : this.patience >= 2 ? 1 : 0;
    this.points += pts;
    resultPanel(this, {
      title: this.patience > 0 ? 'RICHIESTE GESTITE!' : 'IL CLIENTE HA PERSO LA PAZIENZA',
      color: pts === 2 ? '#7CFC00' : pts === 1 ? '#ffd800' : '#ff8080',
      lines: [`Pazienza rimasta: ${this.patience}/${PATIENCE}`, 'Ora la trattativa vera e propria...'],
      y: 260,
      onClose: () => this.ask()
    });
  }

  ask() {
    if (this.q >= QUESTIONS.length) { this.finish(); return; }
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
          onClose: () => this.ask()
        });
      }
    });
  }

  finish() {
    const o = OUTCOMES.find((x) => this.points >= x.min);
    applyEffects(o.effects);
    if (o.euro) GameState.addBonus('euro', o.euro);
    const fromBudget = finishTrip();
    this.refreshHud();
    audio.sfx(o.min >= 5 ? 'victory' : 'gameover');
    const lines = [
      `Punteggio trattativa: ${this.points}/10`,
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
