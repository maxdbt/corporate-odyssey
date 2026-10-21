import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT, LEVEL_META, playerTex } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';

const style = (size, color = '#ffffff', extra = {}) => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 4, ...extra
});

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.levelIndex = data && Number.isInteger(data.levelIndex) ? data.levelIndex : GameState.levelIndex;
    this.done = false;
  }

  create() {
    audio.stopMusic();
    audio.sfx('gameover');
    setupStaticCamera(this);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a0000).setOrigin(0);

    const title = this.add.text(GAME_WIDTH / 2, 70, 'BURNOUT!', style(52, '#ff3030', { strokeThickness: 8 })).setOrigin(0.5);
    this.tweens.add({ targets: title, scale: 1.08, duration: 400, yoyo: true, repeat: -1 });
    const meta = LEVEL_META[this.levelIndex] || LEVEL_META[0];
    this.add.text(GAME_WIDTH / 2, 118, `La tua Salute Mentale è a zero.\nLivello ${meta.id} - ${meta.name}`,
      style(12, '#ffb0b0', { align: 'center' })).setOrigin(0.5);

    // Collapsed employee
    const spr = this.add.image(GAME_WIDTH / 2, 178, playerTex(GameState.character, 'sleep')).setScale(3);
    const zzz = this.add.text(GAME_WIDTH / 2 + 50, 150, 'Zzz', style(16)).setOrigin(0.5);
    this.tweens.add({ targets: zzz, y: 136, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
    spr.setTint(0xbbbbbb);

    this.options = [];
    const bossCheckpoint = GameState.hasCheckpoint() && GameState.checkpoint.boss;
    const canUseVacation = !bossCheckpoint && GameState.hasCheckpoint() && GameState.vacationDays > 0;
    if (bossCheckpoint) {
      this.options.push({
        label: 'RIPARTI DAL MOSTRO FINALE',
        color: '#7dffd4',
        action: () => {
          GameState.revive();
          this.scene.start('GameScene', { levelIndex: this.levelIndex, fromCheckpoint: true });
        }
      });
    }
    if (canUseVacation) {
      this.options.push({
        label: `USA 1 GIORNO DI FERIE (${GameState.vacationDays} disponibili)`,
        color: '#7dffd4',
        action: () => {
          GameState.vacationDays -= 1;
          GameState.revive();
          this.scene.start('GameScene', { levelIndex: this.levelIndex, fromCheckpoint: true });
        }
      });
    }
    this.options.push({
      label: 'RICOMINCIA IL LIVELLO',
      color: '#ffffff',
      action: () => {
        GameState.revive();
        GameState.checkpoint = null;
        this.scene.start('GameScene', { levelIndex: this.levelIndex });
      }
    });
    this.options.push({
      label: 'TORNA AL MENU',
      color: '#aaaaaa',
      action: () => this.scene.start('MenuScene')
    });

    this.selected = 0;
    this.texts = this.options.map((o, i) => {
      const t = this.add.text(GAME_WIDTH / 2, 250 + i * 40, o.label, style(15, o.color)).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { this.selected = i; this._refresh(); });
      t.on('pointerdown', () => this._choose(i));
      return t;
    });
    if (!canUseVacation && !bossCheckpoint) {
      this.add.text(GAME_WIDTH / 2, 380, 'Raccogli i Giorni di Ferie nei livelli: fungono da checkpoint!',
        style(10, '#7dffd4')).setOrigin(0.5);
    }
    this.add.text(GAME_WIDTH / 2, 420, 'SU/GIU + INVIO  -  R ricomincia subito  -  oppure tocca un\'opzione', style(9, '#888888')).setOrigin(0.5);

    this.readyAt = this.time.now + 600;
    this.input.keyboard?.on('keydown', (ev) => {
      const k = ev.key.toUpperCase();
      if (k === 'ARROWUP' || k === 'W') { this.selected = (this.selected + this.options.length - 1) % this.options.length; this._refresh(); }
      else if (k === 'ARROWDOWN' || k === 'S') { this.selected = (this.selected + 1) % this.options.length; this._refresh(); }
      else if (k === 'ENTER' || k === ' ' || k === 'Z') this._choose(this.selected);
      else if (k === 'R') this._choose(this.options.findIndex((o) => o.label === 'RICOMINCIA IL LIVELLO'));
    });
    this._refresh();
  }

  _refresh() {
    this.texts.forEach((t, i) => {
      t.setText(`${i === this.selected ? '> ' : '  '}${this.options[i].label}${i === this.selected ? ' <' : '  '}`);
      t.setScale(i === this.selected ? 1.05 : 1);
    });
    audio.sfx('select');
  }

  _choose(i) {
    if (this.time.now < this.readyAt || this.done) return;
    this.done = true;
    audio.sfx('select');
    this.options[i].action();
  }
}
