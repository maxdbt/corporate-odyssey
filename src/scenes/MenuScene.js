import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT, CHARACTERS, LEVEL_META, TRIP_STAGES_IN_MENU, playerTex, playerAnim } from '../config/constants.js';
import { startLevel } from '../systems/Trip.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';

const style = (size, color = '#ffffff', extra = {}) => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 4, ...extra
});

const CHAR_LABEL = { man: 'JACK', woman: 'WENDY' };
const CHAR_DESC = { man: 'Digital Specialist', woman: 'Digital Manager' };

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.selected = CHARACTERS.indexOf(GameState.character);
    if (this.selected < 0) this.selected = 0;
    this.levelIndex = 0;
    setupStaticCamera(this);

    this._drawBackground();

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 44, 'CORPORATE ODYSSEY', style(38, '#ffd800', { strokeThickness: 7 }))
      .setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 78, 'Sopravvivi all\'ufficio. Arriva in cima. Non andare in Burnout.', style(11, '#9be7ff'))
      .setOrigin(0.5);
    this.tweens.add({ targets: title, y: 48, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    this.add.text(GAME_WIDTH / 2, 104, 'SCEGLI IL TUO IMPIEGATO', style(14)).setOrigin(0.5);

    // Character cards
    this.cards = CHARACTERS.map((c, i) => {
      const x = GAME_WIDTH / 2 + (i === 0 ? -110 : 110);
      const y = 205;
      const frame = this.add.rectangle(x, y, 160, 170, 0x10204a, 0.9).setStrokeStyle(3, 0x4060a0)
        .setInteractive({ useHandCursor: true });
      const sprite = this.add.sprite(x, y + 40, playerTex(c, 'idle')).setOrigin(0.5, 1).setScale(3.5);
      const label = this.add.text(x, y + 44, CHAR_LABEL[c], style(16)).setOrigin(0.5, 0);
      const desc = this.add.text(x, y + 66, CHAR_DESC[c], style(9, '#9be7ff')).setOrigin(0.5, 0);
      frame.on('pointerdown', () => {
        audio.unlock();
        if (this.selected === i) this._start();
        else { this.selected = i; this._refresh(); audio.sfx('select'); }
      });
      return { c, frame, sprite, label, desc };
    });

    // World + scenario selector: each world groups its scenarios (levels) from LEVEL_META.
    this.worlds = [];
    LEVEL_META.forEach((m, i) => {
      // Trip stages: only the start of the trip unless the debug flag lists them all.
      if (m.trip && !TRIP_STAGES_IN_MENU && m.id !== '4-1') return;
      let w = this.worlds.find((x) => x.name === m.world);
      if (!w) this.worlds.push(w = { name: m.world, levels: [] });
      w.levels.push(i);
    });
    this.worldIndex = 0;
    const wy = 304;
    // Clicking the world name also moves to the next world; arrows get a padded hit area.
    this.worldText = this.add.text(GAME_WIDTH / 2, wy, '', style(13, '#ffffff')).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { audio.unlock(); this._changeWorld(1); });
    const mkArrow = (x, txt, d) => this.add.text(x, wy, txt, style(18, '#ffd800', { padding: { x: 16, y: 6 } })).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { audio.unlock(); this._changeWorld(d); });
    mkArrow(GAME_WIDTH / 2 - 250, '<', -1);
    mkArrow(GAME_WIDTH / 2 + 250, '>', 1);
    this.scenarioLabel = this.add.text(GAME_WIDTH / 2, wy + 20, 'SCENARIO', style(9, '#aaaaaa')).setOrigin(0.5);
    this.scenarioChips = [];

    // Start button
    this.startBtn = this.add.text(GAME_WIDTH / 2, 380, '[ INIZIA ]', style(20, '#3ce05a'))
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { audio.unlock(); this._start(); });
    this.tweens.add({ targets: this.startBtn, scale: 1.08, duration: 500, yoyo: true, repeat: -1 });

    // Controls help
    const touch = this.sys.game.device.input.touch;
    const pc = 'PC: FRECCE/WASD muovi, GIU accovacciati, SU/GIU scale\n' +
      'SPAZIO/Z salta (x2 doppio salto)  X corsa  GIU+X scivolata\nC/Q attacca  V/E cambia arma  M audio  P pausa  I brief  ESC esci';
    const mobile = 'MOBILE: D-PAD a sinistra, SALTA / SCIVOLA (tieni = corsa) / ATTACCA a destra\n' +
      'Tocca l\'icona dell\'arma per cambiarla  -  i = brief  -  II = pausa';
    this.add.text(GAME_WIDTH / 2, 412, touch ? `${mobile}\n${pc.split('\n')[0]}` : `${pc}\n${mobile.split('\n')[0]}`,
      style(8, '#cccccc', { align: 'center', strokeThickness: 3 })).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 442, 'SINISTRA/DESTRA personaggio - SU/GIU mondo - 1/2/3 o Q/E scenario - INVIO inizia',
      style(8, '#777777', { strokeThickness: 2 })).setOrigin(0.5);

    // Keyboard
    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown', (ev) => {
        audio.unlock();
        audio.music('menu');
        const k = ev.key.toUpperCase();
        if (k === 'ARROWLEFT' || k === 'A') { this.selected = 0; this._refresh(); audio.sfx('select'); }
        else if (k === 'ARROWRIGHT' || k === 'D') { this.selected = 1; this._refresh(); audio.sfx('select'); }
        else if (k === 'ARROWUP' || k === 'W') this._changeWorld(-1);
        else if (k === 'ARROWDOWN' || k === 'S') this._changeWorld(1);
        else if (k === 'Q') this._changeScenario(-1);
        else if (k === 'E') this._changeScenario(1);
        else if (k >= '1' && k <= '9') this._selectScenario(Number(k) - 1);
        else if (k === 'ENTER' || k === ' ' || k === 'Z') this._start();
        else if (k === 'M') this._toggleAudio();
      });
    }
    this.input.on('pointerdown', () => { audio.unlock(); audio.music('menu'); });
    audio.music('menu');

    // Audio toggle (M or click), top-right
    this.audioText = this.add.text(GAME_WIDTH - 10, 10, '', style(9, '#cccccc', { strokeThickness: 3 }))
      .setOrigin(1, 0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { audio.unlock(); this._toggleAudio(); });
    this._refreshAudio();

    this.starting = false;
    this._buildScenarioChips();
    this._refresh();
  }

  _drawBackground() {
    const g = this.add.graphics();
    // Night sky gradient in bands
    const bands = [0x0b0b2a, 0x111140, 0x1a1a55, 0x22226a, 0x2a2a78];
    bands.forEach((c, i) => g.fillStyle(c, 1).fillRect(0, i * 60, GAME_WIDTH, 60));
    g.fillStyle(0x2a2a78, 1).fillRect(0, 300, GAME_WIDTH, GAME_HEIGHT - 300);
    // Stars
    for (let i = 0; i < 60; i++) {
      g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 1));
      g.fillRect(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, 200), 2, 2);
    }
    // Office skyline with lit windows
    let x = 0;
    while (x < GAME_WIDTH) {
      const w = Phaser.Math.Between(50, 110);
      const h = Phaser.Math.Between(120, 260);
      g.fillStyle(0x070718, 1).fillRect(x, GAME_HEIGHT - h, w - 4, h);
      for (let wy = GAME_HEIGHT - h + 10; wy < GAME_HEIGHT - 10; wy += 14) {
        for (let wx = x + 6; wx < x + w - 12; wx += 12) {
          if (Math.random() < 0.45) {
            g.fillStyle(Math.random() < 0.8 ? 0xffe680 : 0x9be7ff, 0.5).fillRect(wx, wy, 6, 8);
          }
        }
      }
      x += w;
    }
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.35).setOrigin(0);
  }

  _toggleAudio() {
    audio.toggleMute();
    this._refreshAudio();
  }

  _refreshAudio() {
    this.audioText.setText(audio.muted ? 'M = AUDIO OFF' : 'M = AUDIO ON');
    this.audioText.setColor(audio.muted ? '#ff8080' : '#cccccc');
  }

  _changeWorld(d) {
    this.worldIndex = Phaser.Math.Wrap(this.worldIndex + d, 0, this.worlds.length);
    this.levelIndex = this.worlds[this.worldIndex].levels[0];
    audio.sfx('select');
    this._buildScenarioChips();
    this._refresh();
  }

  _changeScenario(d) {
    const levels = this.worlds[this.worldIndex].levels;
    this._selectScenario(Phaser.Math.Wrap(levels.indexOf(this.levelIndex) + d, 0, levels.length));
  }

  _selectScenario(i) {
    const levels = this.worlds[this.worldIndex].levels;
    if (i < 0 || i >= levels.length) return;
    this.levelIndex = levels[i];
    audio.sfx('select');
    this._refresh();
  }

  // One clickable chip per scenario of the selected world.
  _buildScenarioChips() {
    this.scenarioChips.forEach((c) => c.destroy());
    const levels = this.worlds[this.worldIndex].levels;
    const gap = 8;
    const chips = levels.map((li, i) => {
      const label = `${levels.length > 1 ? `${i + 1}. ` : ''}${LEVEL_META[li].name}`;
      return this.add.text(0, 0, label, style(levels.length > 4 ? 10 : 11, '#ffffff', {
        backgroundColor: '#10204a', padding: { x: 6, y: 3 }, strokeThickness: 3
      })).setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { audio.unlock(); this._selectScenario(i); });
    });
    // Wrap the chips on more rows when they do not fit (the trip has many stages).
    const rows = [[]];
    let rowW = 0;
    chips.forEach((c) => {
      if (rowW + c.width > 740 && rows[rows.length - 1].length) { rows.push([]); rowW = 0; }
      rows[rows.length - 1].push(c);
      rowW += c.width + gap;
    });
    const y0 = 344 - (rows.length - 1) * 10;
    rows.forEach((row, r) => {
      const total = row.reduce((sum, c) => sum + c.width, 0) + gap * (row.length - 1);
      let x = GAME_WIDTH / 2 - total / 2;
      row.forEach((c) => { c.x = x; c.y = y0 + r * 20; x += c.width + gap; });
    });
    this.scenarioLabel.y = y0 - 16;
    this.scenarioChips = chips;
    this.scenarioLabel.setText(levels.length > 1 ? `SCENARIO (${levels.length} disponibili)` : 'SCENARIO');
  }

  _refresh() {
    this.cards.forEach((card, i) => {
      const on = i === this.selected;
      card.frame.setStrokeStyle(3, on ? 0xffd800 : 0x4060a0);
      card.frame.setFillStyle(on ? 0x1a3a7a : 0x10204a, 0.9);
      card.label.setColor(on ? '#ffd800' : '#ffffff');
      const walk = playerAnim(card.c, 'walk');
      if (on && this.anims.exists(walk)) card.sprite.play(walk, true);
      else { card.sprite.stop(); card.sprite.setTexture(playerTex(card.c, 'idle')); }
      card.sprite.setAlpha(on ? 1 : 0.6);
    });
    this.worldText.setText(this.worlds[this.worldIndex].name);
    const levels = this.worlds[this.worldIndex].levels;
    this.scenarioChips.forEach((c, i) => {
      const on = levels[i] === this.levelIndex;
      c.setColor(on ? '#ffd800' : '#cccccc').setBackgroundColor(on ? '#3a5aa0' : '#10204a');
    });
  }

  _start() {
    if (this.starting) return;
    this.starting = true;
    audio.unlock();
    audio.sfx('powerup');
    audio.stopMusic();
    GameState.newGame(CHARACTERS[this.selected]);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      startLevel(this, this.levelIndex);
    });
  }
}
