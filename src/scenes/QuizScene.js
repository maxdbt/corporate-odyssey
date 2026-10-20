import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { QUIZZES, nextQuizId } from '../data/quizzes.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';

const style = (size, color = '#ffffff', extra = {}) => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 3, ...extra
});

const LETTERS = ['A', 'B', 'C'];
const PANEL_W = 620;
const PANEL_H = 330;

// Overlay quiz on a "computer screen". GameScene is paused while this runs.
export default class QuizScene extends Phaser.Scene {
  constructor() {
    super('QuizScene');
  }

  init(data) {
    const id = data && QUIZZES[data.quizId] ? data.quizId : nextQuizId();
    this.quiz = QUIZZES[id];
    this.selected = 0;
    this.phase = 'choose';
    this.readyAt = 0;
  }

  create() {
    setupStaticCamera(this);
    audio.sfx('quiz');
    this.readyAt = this.time.now + 350;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65).setOrigin(0).setInteractive();

    // Monitor frame
    const g = this.add.graphics();
    g.fillStyle(0xb8b8a8, 1).fillRect(cx - PANEL_W / 2 - 14, cy - PANEL_H / 2 - 14, PANEL_W + 28, PANEL_H + 28);
    g.fillStyle(0x6e6e62, 1).fillRect(cx - PANEL_W / 2 - 6, cy - PANEL_H / 2 - 6, PANEL_W + 12, PANEL_H + 12);
    g.fillStyle(0x0a2a6a, 1).fillRect(cx - PANEL_W / 2, cy - PANEL_H / 2, PANEL_W, PANEL_H);
    // Scanlines
    g.fillStyle(0x000000, 0.18);
    for (let y = cy - PANEL_H / 2; y < cy + PANEL_H / 2; y += 4) g.fillRect(cx - PANEL_W / 2, y, PANEL_W, 2);
    // Window title bar
    g.fillStyle(0xd0d0d0, 1).fillRect(cx - PANEL_W / 2, cy - PANEL_H / 2, PANEL_W, 20);
    g.fillStyle(0xff4040, 1).fillRect(cx + PANEL_W / 2 - 18, cy - PANEL_H / 2 + 4, 12, 12);
    this.add.text(cx - PANEL_W / 2 + 8, cy - PANEL_H / 2 + 10, 'URGENTE.exe  -  MICRO-PROVA', style(10, '#000000', { stroke: '#d0d0d0', strokeThickness: 0 }))
      .setOrigin(0, 0.5);

    const top = cy - PANEL_H / 2 + 28;
    this.add.text(cx, top + 6, this.quiz.title, style(16, '#ffd800')).setOrigin(0.5, 0);
    this.add.text(cx, top + 34, this.quiz.question, style(13, '#ffffff', { align: 'center', lineSpacing: 4 })).setOrigin(0.5, 0);

    this.choiceTexts = this.quiz.choices.map((c, i) => {
      const t = this.add.text(cx - PANEL_W / 2 + 40, top + 108 + i * 40, `${LETTERS[i]}) ${c.label}`, style(13))
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { if (this.phase === 'choose') { this.selected = i; this._refresh(); } });
      t.on('pointerdown', () => this._choose(i));
      return t;
    });
    this.cursor = this.add.text(cx - PANEL_W / 2 + 22, 0, '>', style(14, '#ffd800')).setOrigin(0, 0.5);
    this.hint = this.add.text(cx, cy + PANEL_H / 2 - 18, '1/2/3 o A/B/C  -  FRECCE + INVIO  -  TOCCA UNA RISPOSTA', style(9, '#9be7ff'))
      .setOrigin(0.5);

    this.outcomeText = this.add.text(cx, top + 150, '', style(14, '#ffffff', { align: 'center', lineSpacing: 6 }))
      .setOrigin(0.5).setVisible(false);

    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown', (ev) => this._onKey(ev));
    }
    this.input.on('pointerdown', () => {
      if (this.phase === 'outcome') this._continue();
    });

    this.tweens.add({ targets: this.cursor, alpha: 0.2, duration: 300, yoyo: true, repeat: -1 });
    this._refresh();
  }

  _onKey(ev) {
    const key = ev.key.toUpperCase();
    if (this.phase === 'choose') {
      if (key === 'ARROWUP' || key === 'W') { this.selected = (this.selected + 2) % 3; this._refresh(); audio.sfx('select'); return; }
      if (key === 'ARROWDOWN' || key === 'S') { this.selected = (this.selected + 1) % 3; this._refresh(); audio.sfx('select'); return; }
      if (key === 'ENTER' || key === ' ' || key === 'Z') { this._choose(this.selected); return; }
      const idx = ['1', '2', '3'].indexOf(key) >= 0 ? ['1', '2', '3'].indexOf(key) : LETTERS.indexOf(key);
      if (idx >= 0) this._choose(idx);
    } else if (this.phase === 'outcome') {
      if (key === 'ENTER' || key === ' ' || key === 'Z' || key === 'ESCAPE') this._continue();
    }
  }

  _refresh() {
    this.choiceTexts.forEach((t, i) => t.setColor(i === this.selected ? '#ffd800' : '#ffffff'));
    this.cursor.setY(this.choiceTexts[this.selected].y);
  }

  _choose(i) {
    if (this.phase !== 'choose' || this.time.now < this.readyAt) return;
    this.phase = 'outcome';
    this.readyAt = this.time.now + 450;
    const choice = this.quiz.choices[i];
    audio.sfx('select');

    const game = this.scene.get('GameScene');
    if (game && typeof game.applyEffects === 'function') {
      try { game.applyEffects(choice.effects); } catch (e) { console.error('applyEffects failed', e); }
    }

    this.choiceTexts.forEach((t) => t.setVisible(false));
    this.cursor.setVisible(false);
    this.outcomeText.setText(`Hai scelto: ${LETTERS[i]}) ${choice.label}\n\n${choice.outcome}`).setVisible(true);
    this.hint.setText('PREMI INVIO O TOCCA PER CONTINUARE');
  }

  _continue() {
    if (this.time.now < this.readyAt || this.phase !== 'outcome') return;
    this.phase = 'done';
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}
