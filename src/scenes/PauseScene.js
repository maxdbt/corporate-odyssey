import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT, LEVEL_META } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';

const style = (size, color = '#000000', extra = {}) => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, ...extra
});

const L = 24;
const T = 18;
const W = GAME_WIDTH - 48;
const H = GAME_HEIGHT - 36;
const ROW_H = 18;
const HEAD_W = 28;
const COLS = [
  { key: 'A', w: 180 }, { key: 'B', w: 110 }, { key: 'C', w: 110 }, { key: 'D', w: 110 }, { key: 'E', w: 110 }, { key: 'F', w: 104 }
];

// Pause screen disguised as a fake 8-bit spreadsheet ("il capo sta passando!").
export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  init(data) {
    this.timeLeft = data?.timeLeft ?? 0;
    this.levelIndex = data?.levelIndex ?? 0;
    this.leaving = false;
  }

  create() {
    setupStaticCamera(this);
    audio.sfx('select');
    this.readyAt = this.time.now + 250;
    const meta = LEVEL_META[this.levelIndex] || LEVEL_META[0];
    const g = this.add.graphics();

    // Window + title bar
    g.fillStyle(0x000000, 0.6).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0x000000, 1).fillRect(L + 4, T + 4, W, H);
    g.fillStyle(0xc0c0c0, 1).fillRect(L, T, W, H);
    g.fillStyle(0x107c41, 1).fillRect(L, T, W, 20);
    this.add.text(L + 24, T + 10, 'Microsoft Excel - BUDGET_Q4_DEFINITIVO_v7_OK.xls', style(10, '#ffffff')).setOrigin(0, 0.5);
    g.fillStyle(0xffffff, 1).fillRect(L + 6, T + 4, 12, 12);
    g.fillStyle(0x107c41, 1).fillRect(L + 8, T + 6, 3, 8).fillRect(L + 13, T + 6, 3, 8);
    [['_', 54], ['O', 36], ['X', 18]].forEach(([s, dx]) => {
      g.fillStyle(dx === 18 ? 0xe81123 : 0xdddddd, 1).fillRect(L + W - dx - 2, T + 3, 14, 14);
      this.add.text(L + W - dx + 5, T + 10, s, style(9, dx === 18 ? '#ffffff' : '#000000')).setOrigin(0.5);
    });

    // Menu bar + toolbar
    this.add.text(L + 8, T + 25, 'File  Modifica  Visualizza  Inserisci  Formato  Strumenti  Dati  Finestra  ?',
      style(9, '#000000'));
    g.fillStyle(0xa0a0a0, 1).fillRect(L, T + 39, W, 1);
    const tools = [0xffffff, 0xffe066, 0x4a90e2, 0xffffff, 0xc0392b, 0x2a6a2a, 0x000000, 0x9b59b6];
    tools.forEach((c, i) => {
      g.fillStyle(0x808080, 1).fillRect(L + 8 + i * 20, T + 43, 16, 16);
      g.fillStyle(c, 1).fillRect(L + 10 + i * 20, T + 45, 12, 12);
    });
    this.add.text(L + 180, T + 51, 'Arial   10   G  C  S   =  =  =   EUR  %  000', style(9, '#303030')).setOrigin(0, 0.5);

    // Formula bar
    const fy = T + 64;
    g.fillStyle(0xffffff, 1).fillRect(L + 6, fy, 60, 16).fillRect(L + 92, fy, W - 98, 16);
    g.lineStyle(1, 0x808080).strokeRect(L + 6, fy, 60, 16).strokeRect(L + 92, fy, W - 98, 16);
    this.cellRef = this.add.text(L + 10, fy + 8, 'B4', style(9)).setOrigin(0, 0.5);
    this.add.text(L + 72, fy + 8, 'fx', style(9, '#606060')).setOrigin(0, 0.5);
    this.add.text(L + 96, fy + 8, '=SE(CAPO_VICINO;"LAVORO";"PAUSA CAFFE\'")', style(9)).setOrigin(0, 0.5);

    // Grid
    const gx = L + 6;
    const gy = fy + 22;
    const rows = 15;
    const gridW = HEAD_W + COLS.reduce((s, c) => s + c.w, 0);
    g.fillStyle(0xffffff, 1).fillRect(gx, gy, gridW, ROW_H * (rows + 1));
    g.fillStyle(0xd8d8d8, 1).fillRect(gx, gy, gridW, ROW_H).fillRect(gx, gy, HEAD_W, ROW_H * (rows + 1));
    g.lineStyle(1, 0xb0b0b0);
    for (let r = 0; r <= rows + 1; r++) g.lineBetween(gx, gy + r * ROW_H, gx + gridW, gy + r * ROW_H);
    let cx = gx + HEAD_W;
    this.colX = [];
    g.lineBetween(gx, gy, gx, gy + ROW_H * (rows + 1));
    g.lineBetween(cx, gy, cx, gy + ROW_H * (rows + 1));
    COLS.forEach((c) => {
      this.colX.push(cx);
      this.add.text(cx + c.w / 2, gy + ROW_H / 2, c.key, style(9, '#303030')).setOrigin(0.5);
      cx += c.w;
      g.lineBetween(cx, gy, cx, gy + ROW_H * (rows + 1));
    });
    for (let r = 1; r <= rows; r++) {
      this.add.text(gx + HEAD_W / 2, gy + r * ROW_H + ROW_H / 2, String(r), style(9, '#303030')).setOrigin(0.5);
    }
    this.gx = gx;
    this.gy = gy;

    // Cells: the player's real stats disguised as a budget report.
    const t = Math.max(0, Math.ceil(this.timeLeft));
    const time = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    const cell = (col, row, text, color = '#000000', align = 'left', size = 9) => {
      const i = 'ABCDEF'.indexOf(col);
      const x = align === 'right' ? this.colX[i] + COLS[i].w - 4 : this.colX[i] + 4;
      return this.add.text(x, gy + row * ROW_H + ROW_H / 2, text, style(size, color)).setOrigin(align === 'right' ? 1 : 0, 0.5);
    };
    g.fillStyle(0xc6efce, 1).fillRect(this.colX[0] + 1, gy + ROW_H + 1, gridW - HEAD_W - 2, ROW_H - 1);
    cell('A', 1, 'REPORT TRIMESTRALE (PAUSA)', '#006100');
    cell('D', 1, `Livello ${meta.id}`, '#006100');
    cell('E', 1, meta.name.slice(0, 14), '#006100');
    ['Voce', 'Valore', 'Target', 'Delta', 'Stato'].forEach((h, i) => cell('ABCDE'[i], 3, h, '#1f4e79'));
    g.fillStyle(0xddebf7, 1).fillRect(this.colX[0] + 1, gy + 3 * ROW_H + 1, gridW - HEAD_W - 2, ROW_H - 1);
    const hp = Math.round(GameState.hp);
    const stress = Math.round(GameState.stress);
    const lines = [
      ['Salute mentale', `${hp}%`, '100%', `${hp - 100}%`, hp > 50 ? 'OK' : 'CRITICO'],
      ['Stress', `${stress}%`, '0%', `+${stress}%`, stress >= 100 ? 'PANICO' : stress > 70 ? 'ALTO' : 'OK'],
      ['Bonus (EUR)', `${GameState.euro}`, '100', `${GameState.euro - 100}`, GameState.euro >= 100 ? 'OK' : 'IN CORSO'],
      ['Buoni pasto', `${GameState.tickets}`, '100', `${GameState.tickets - 100}`, 'IN CORSO'],
      ['Giorni di ferie', `${GameState.vacationDays}`, '1', `${GameState.vacationDays - 1}`, GameState.vacationDays ? 'OK' : 'ZERO'],
      ['Tempo residuo', time, '-', '-', t < 30 ? 'URGENTE' : 'OK']
    ];
    lines.forEach((l, r) => {
      cell('A', 4 + r, l[0]);
      cell('B', 4 + r, l[1], '#000000', 'right');
      cell('C', 4 + r, l[2], '#606060', 'right');
      cell('D', 4 + r, l[3], l[3].startsWith('-') ? '#c00000' : '#000000', 'right');
      const bad = ['CRITICO', 'PANICO', 'ALTO', 'ZERO', 'URGENTE'].includes(l[4]);
      cell('E', 4 + r, l[4], bad ? '#c00000' : '#006100');
    });
    cell('A', 10, 'TOTALE PRODUTTIVITA\'');
    cell('B', 10, '#DIV/0!', '#c00000', 'right');

    // Commands as "cells"
    g.fillStyle(0xfff2cc, 1).fillRect(this.colX[0] + 1, gy + 12 * ROW_H + 1, gridW - HEAD_W - 2, ROW_H * 3 - 1);
    cell('A', 12, 'P / ESC / INVIO = RIPRENDI', '#7f6000');
    cell('C', 12, 'I = BRIEF DEL LIVELLO', '#7f6000');
    cell('A', 13, 'R = RICOMINCIA LIVELLO', '#7f6000');
    cell('C', 13, 'U = TORNA AL MENU', '#7f6000');
    cell('A', 14, '(se passa il capo, sembri al lavoro)', '#a0a0a0');

    // Interactive "buttons" for touch
    const btn = (col, row, cb) => {
      const i = 'ABCDEF'.indexOf(col);
      this.add.zone(this.colX[i], gy + row * ROW_H, COLS[i].w * 2, ROW_H).setOrigin(0).setInteractive({ useHandCursor: true })
        .on('pointerdown', cb);
    };
    btn('A', 12, () => this.resume());
    btn('C', 12, () => this.openBrief());
    btn('A', 13, () => this.restart());
    btn('C', 13, () => this.toMenu());

    // Selected cell with blinking border + "PAUSA" sheet tab
    this.sel = this.add.rectangle(this.colX[1], gy + 4 * ROW_H, COLS[1].w, ROW_H).setOrigin(0).setStrokeStyle(2, 0x000000);
    this.tweens.add({ targets: this.sel, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
    this.selRow = 4;
    const tabY = gy + ROW_H * (rows + 1) + 4;
    [['Foglio1', false], ['PAUSA', true], ['Ferie_2027', false]].forEach(([name, on], i) => {
      const x = gx + 30 + i * 80;
      g.fillStyle(on ? 0xffffff : 0xd8d8d8, 1).fillRect(x, tabY, 74, 14);
      g.lineStyle(1, 0x808080).strokeRect(x, tabY, 74, 14);
      this.add.text(x + 37, tabY + 7, name, style(8, on ? '#107c41' : '#404040')).setOrigin(0.5);
    });
    this.add.text(L + W - 8, tabY + 7, 'PRONTO', style(8, '#404040')).setOrigin(1, 0.5);

    const kb = this.input.keyboard;
    if (kb) {
      ['P', 'ESC', 'ENTER'].forEach((k) => kb.on(`keydown-${k}`, () => this.resume()));
      kb.on('keydown-I', () => this.openBrief());
      kb.on('keydown-R', () => this.restart());
      kb.on('keydown-U', () => this.toMenu());
      kb.on('keydown-UP', () => this.moveSel(-1));
      kb.on('keydown-DOWN', () => this.moveSel(1));
    }
  }

  moveSel(d) {
    this.selRow = Phaser.Math.Clamp(this.selRow + d, 4, 10);
    this.sel.y = this.gy + this.selRow * ROW_H;
    this.cellRef.setText(`B${this.selRow}`);
  }

  ready() { return this.time.now >= this.readyAt && !this.leaving; }

  resume() {
    if (!this.ready()) return;
    this.leaving = true;
    audio.sfx('select');
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  openBrief() {
    if (!this.ready()) return;
    this.leaving = true;
    this.scene.launch('BriefScene', { levelIndex: this.levelIndex });
    this.scene.bringToTop('BriefScene');
    this.scene.stop();
  }

  restart() {
    if (!this.ready()) return;
    this.leaving = true;
    GameState.revive();
    GameState.checkpoint = null;
    this.scene.start('GameScene', { levelIndex: this.levelIndex });
  }

  toMenu() {
    if (!this.ready()) return;
    this.leaving = true;
    audio.stopMusic();
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }
}
