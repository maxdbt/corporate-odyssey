import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { TRIP_ITEMS, SUITCASE_SIZE, ESSENTIALS, itemLabel, itemById } from '../data/trip.js';
import { itemTex } from '../gfx/trip.js';
import { ensureTrip, goNext } from '../systems/Trip.js';
import { tstyle, resultPanel } from '../ui/TripUI.js';

const COLS = 5;
const CELL_W = 144;
const CELL_H = 56;
const GAP = 6;
const GRID_X = (GAME_WIDTH - (COLS * CELL_W + (COLS - 1) * GAP)) / 2;
const GRID_Y = 84;

// Trip stage 1: pick SUITCASE_SIZE items out of TRIP_ITEMS. The last grid cell is the "PARTI" button.
export default class PackingScene extends Phaser.Scene {
  constructor() {
    super('PackingScene');
  }

  init(data) {
    this.levelIndex = data?.levelIndex ?? 0;
    this.chosen = [];
    this.cursor = 0;
    this.done = false;
  }

  create() {
    setupStaticCamera(this);
    GameState.beginLevel(this.levelIndex);
    ensureTrip(this.levelIndex);
    audio.music('menu');
    this.character = GameState.character || 'man';
    this.drawRoom();

    this.add.text(GAME_WIDTH / 2, 22, 'LA TRASFERTA  -  FAI LA VALIGIA', tstyle(18, '#ffd800', { strokeThickness: 5 })).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 50, `Domani parti per incontrare un cliente. In valigia entrano solo ${SUITCASE_SIZE} oggetti: scegli bene!`,
      tstyle(10, '#ffffff')).setOrigin(0.5);

    this.cells = [...TRIP_ITEMS.map((it) => ({ item: it })), { go: true }].map((cell, i) => {
      const x = GRID_X + (i % COLS) * (CELL_W + GAP);
      const y = GRID_Y + Math.floor(i / COLS) * (CELL_H + GAP);
      const bg = this.add.rectangle(x, y, CELL_W, CELL_H, cell.go ? 0x1f6a2a : 0x10204a, 0.92).setOrigin(0).setStrokeStyle(2, 0x4060a0)
        .setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => { this.cursor = i; this.activate(); });
      bg.on('pointerover', () => { this.cursor = i; this.refresh(); });
      if (cell.go) {
        cell.label = this.add.text(x + CELL_W / 2, y + CELL_H / 2, '', tstyle(14, '#ffffff', { align: 'center' })).setOrigin(0.5);
      } else {
        this.add.image(x + 24, y + CELL_H / 2, itemTex(cell.item.id, this.character)).setScale(2.2);
        cell.label = this.add.text(x + 46, y + CELL_H / 2, itemLabel(cell.item, this.character),
          tstyle(9, '#ffffff', { wordWrap: { width: CELL_W - 52 } })).setOrigin(0, 0.5);
        cell.check = this.add.text(x + CELL_W - 6, y + 4, 'V', tstyle(12, '#7CFC00')).setOrigin(1, 0).setVisible(false);
      }
      return { ...cell, bg, x, y };
    });
    this.cursorBox = this.add.rectangle(0, 0, CELL_W + 6, CELL_H + 6).setOrigin(0).setStrokeStyle(3, 0xffd800);
    this.tweens.add({ targets: this.cursorBox, alpha: 0.35, duration: 350, yoyo: true, repeat: -1 });

    // Suitcase with the chosen items
    const sy = 376;
    this.suitcase = this.add.container(GAME_WIDTH / 2, sy);
    const sw = SUITCASE_SIZE * 44 + 30;
    this.suitcase.add([
      this.add.rectangle(0, 4, sw + 8, 64, 0x000000, 0.4),
      this.add.rectangle(0, 0, sw, 60, 0x8a4a1a).setStrokeStyle(3, 0x3a1a08),
      this.add.rectangle(0, -36, 60, 12, 0x3a1a08),
      this.add.rectangle(0, -36, 44, 6, 0x8a4a1a)
    ]);
    this.slots = Array.from({ length: SUITCASE_SIZE }, (_, i) => {
      const x = -sw / 2 + 37 + i * 44;
      this.suitcase.add(this.add.rectangle(x, 0, 38, 38, 0x5a2a0a).setStrokeStyle(1, 0x3a1a08));
      const img = this.add.image(x, 0, 'trip_laptop').setScale(2).setVisible(false);
      this.suitcase.add(img);
      return img;
    });
    this.countText = this.add.text(GAME_WIDTH / 2 + sw / 2 + 16, sy, '', tstyle(16, '#ffffff')).setOrigin(0, 0.5);
    this.add.text(GAME_WIDTH / 2, 438, 'FRECCE scegli  -  INVIO/SPAZIO metti o togli  -  oppure TOCCA un oggetto', tstyle(9, '#cccccc')).setOrigin(0.5);

    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown', (ev) => {
        if (this.done) return;
        const k = ev.key;
        if (k === 'ArrowLeft' || k === 'a' || k === 'A') this.move(-1, 0);
        else if (k === 'ArrowRight' || k === 'd' || k === 'D') this.move(1, 0);
        else if (k === 'ArrowUp' || k === 'w' || k === 'W') this.move(0, -1);
        else if (k === 'ArrowDown' || k === 's' || k === 'S') this.move(0, 1);
        else if (k === 'Enter' || k === ' ' || k === 'z' || k === 'Z') this.activate();
        else if (k === 'Escape') this.scene.start('MenuScene');
      });
    }
    this.refresh();
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  drawRoom() {
    const g = this.add.graphics();
    g.fillStyle(0x3a2a4a).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    for (let x = 0; x < GAME_WIDTH; x += 40) g.fillStyle(x % 80 ? 0x3e2e50 : 0x352545).fillRect(x, 0, 40, 320);
    g.fillStyle(0x6a4a2a).fillRect(0, 320, GAME_WIDTH, GAME_HEIGHT - 320);
    for (let y = 320; y < GAME_HEIGHT; y += 16) g.fillStyle(0x5a3a1a).fillRect(0, y, GAME_WIDTH, 1);
  }

  move(dx, dy) {
    const n = this.cells.length;
    let i = this.cursor + dx + dy * COLS;
    if (dy !== 0 && (i < 0 || i >= n)) i = dy > 0 ? n - 1 : this.cursor;
    this.cursor = Phaser.Math.Clamp(i, 0, n - 1);
    audio.sfx('select');
    this.refresh();
  }

  activate() {
    if (this.done) return;
    const cell = this.cells[this.cursor];
    if (cell.go) { this.confirm(); return; }
    const id = cell.item.id;
    const at = this.chosen.indexOf(id);
    if (at >= 0) {
      this.chosen.splice(at, 1);
      audio.sfx('select');
    } else if (this.chosen.length >= SUITCASE_SIZE) {
      audio.sfx('hurt');
      this.tweens.add({ targets: this.suitcase, x: GAME_WIDTH / 2 + 6, duration: 50, yoyo: true, repeat: 3 });
      this.flash('VALIGIA PIENA! TOGLI QUALCOSA', '#ff8080');
    } else {
      this.chosen.push(id);
      audio.sfx('coin');
    }
    this.refresh();
  }

  flash(text, color) {
    this.flashText?.destroy();
    this.flashText = this.add.text(GAME_WIDTH / 2, 66, text, tstyle(11, color)).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: this.flashText, alpha: 0, delay: 900, duration: 300 });
  }

  refresh() {
    this.cells.forEach((cell, i) => {
      if (cell.go) {
        const left = SUITCASE_SIZE - this.chosen.length;
        cell.label.setText(left > 0 ? `ANCORA ${left}\nOGGETT${left === 1 ? 'O' : 'I'}` : 'CHIUDI LA\nVALIGIA E PARTI!');
        cell.bg.setFillStyle(left > 0 ? 0x2a3a2a : 0x1f8a2a, 0.95);
        return;
      }
      const on = this.chosen.includes(cell.item.id);
      cell.bg.setStrokeStyle(2, on ? 0x7CFC00 : 0x4060a0).setFillStyle(on ? 0x1a4a2a : 0x10204a, 0.92);
      cell.check.setVisible(on);
    });
    const c = this.cells[this.cursor];
    this.cursorBox.setPosition(c.x - 3, c.y - 3);
    this.slots.forEach((img, i) => {
      const id = this.chosen[i];
      img.setVisible(!!id);
      if (id) img.setTexture(itemTex(id, this.character));
    });
    this.countText.setText(`${this.chosen.length}/${SUITCASE_SIZE}`).setColor(this.chosen.length === SUITCASE_SIZE ? '#7CFC00' : '#ffffff');
  }

  confirm() {
    if (this.chosen.length < SUITCASE_SIZE) {
      audio.sfx('hurt');
      this.flash(`C'E' ANCORA POSTO PER ${SUITCASE_SIZE - this.chosen.length} OGGETTI!`, '#ffb000');
      return;
    }
    this.done = true;
    GameState.trip.items = [...this.chosen];
    audio.sfx('powerup');
    const missing = ESSENTIALS.filter((id) => !this.chosen.includes(id)).map((id) => itemLabel(itemById(id), this.character));
    const lines = missing.length
      ? ['HAI DIMENTICATO:', ...missing, '', 'Speriamo di non pentirsene...']
      : ['C\'e\' tutto l\'essenziale.', 'Si parte!'];
    resultPanel(this, {
      title: missing.length ? 'CONTROLLO VALIGIA... OPS!' : 'VALIGIA PERFETTA!',
      color: missing.length ? '#ff8080' : '#7CFC00',
      lines,
      y: 220,
      onClose: () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => goNext(this, this.levelIndex));
      }
    });
  }
}
