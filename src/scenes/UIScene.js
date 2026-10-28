import Phaser from 'phaser';
import HUD, { HUD_SCALE } from '../ui/HUD.js';
import TouchControls from '../ui/TouchControls.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { GAME_WIDTH } from '../config/constants.js';

// Overlay scene: HUD + touch controls, rendered above the game camera.
// Public methods are safe to call before create() has run.
export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
    this.hud = null;
    this.touch = null;
    this._pending = UIScene.emptyPending();
  }

  static emptyPending() {
    return { hud: null, fog: 0, message: null, boss: undefined };
  }

  init() {
    this.hud = null;
    this.touch = null;
    // Keep anything queued between launch() and create() (e.g. the level intro banner).
    if (!this._pending) this._pending = UIScene.emptyPending();
  }

  create() {
    setupStaticCamera(this);
    this.hud = new HUD(this, () => this.touch && this.touch.latchSwitchWeapon());
    if (this.sys.game.device.input.touch) {
      this.touch = new TouchControls(this);
    }
    // Brief (I) and pause (P): keyboard plus small HUD buttons for mouse/touch.
    const overlay = (key) => {
      const gs = this.scene.get('GameScene');
      if (this.scene.isActive('GameScene')) gs.openOverlay?.(key);
    };
    this.input.keyboard?.on('keydown-I', () => overlay('BriefScene'));
    this.input.keyboard?.on('keydown-P', () => overlay('PauseScene'));
    this.input.keyboard?.on('keydown-ESC', () => overlay('QuitScene'));
    const s = HUD_SCALE;
    [['i', GAME_WIDTH - 39 * s, 'BriefScene'], ['II', GAME_WIDTH - 15 * s, 'PauseScene']].forEach(([label, x, key]) => {
      this.add.rectangle(x, 22 * s, 20, 30, 0x1a1a40, 0.85).setStrokeStyle(2, 0xffd800).setDepth(11).setScale(s)
        .setInteractive({ useHandCursor: true }).on('pointerdown', () => overlay(key));
      this.add.text(x, 22 * s, label, {
        fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold', color: '#ffd800', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(12).setScale(s);
    });
    this.input.keyboard?.on('keydown-M', () => {
      const muted = audio.toggleMute();
      this.message(muted ? 'AUDIO OFF' : 'AUDIO ON', '#ffffff', 900);
    });

    const p = this._pending;
    if (p.hud) this.hud.update(p.hud, 0);
    if (p.fog) this.hud.fog(p.fog);
    if (p.message) this.hud.message(...p.message);
    if (p.boss !== undefined) this.hud.bossBar(p.boss[0], p.boss[1]);
    this._pending = null;

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.hud = null;
      this.touch = null;
      this._pending = UIScene.emptyPending();
    });
  }

  update(time, delta) {
    if (this.touch) this.touch.update();
    this._lastDelta = delta;
  }

  updateHud(data) {
    if (this.hud) this.hud.update(data, this._lastDelta || 16);
    else if (this._pending) this._pending.hud = data;
  }

  fog(ms) {
    if (this.hud) this.hud.fog(ms);
    else if (this._pending) this._pending.fog = ms;
  }

  message(text, color = '#ffffff', ms = 2000) {
    if (this.hud) this.hud.message(text, color, ms);
    else if (this._pending) this._pending.message = [text, color, ms];
  }

  bossBar(name, ratio) {
    if (this.hud) this.hud.bossBar(name, ratio);
    else if (this._pending) this._pending.boss = [name, ratio];
  }

  teamsCall(ms) {
    if (this.hud) this.hud.teamsCall(ms);
  }

  getTouchState() {
    return this.touch ? this.touch.getState() : null;
  }
}
