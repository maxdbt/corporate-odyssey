import Phaser from 'phaser';
import { audio } from './Audio8bit.js';

// Merges keyboard and (optional) touch controls into one per-frame state.
export default class InputController {
  constructor(scene) {
    this.scene = scene;
    const K = Phaser.Input.Keyboard.KeyCodes;
    const kb = scene.input.keyboard;
    this.keys = kb ? kb.addKeys({
      left: K.LEFT, right: K.RIGHT, up: K.UP, down: K.DOWN,
      a: K.A, d: K.D, w: K.W, s: K.S,
      space: K.SPACE, z: K.Z, x: K.X, c: K.C, v: K.V
    }, true, false) : null;
    this.prev = { jump: false, attack: false, switchWeapon: false, slide: false };
    this._unlockOnce = () => audio.unlock();
    scene.input.once('pointerdown', this._unlockOnce);
    if (kb) kb.once('keydown', this._unlockOnce);
  }

  _touch() {
    const ui = this.scene.scene.get('UIScene');
    if (!ui || typeof ui.getTouchState !== 'function') return null;
    return ui.getTouchState();
  }

  update() {
    const k = this.keys;
    const down = (key) => !!(k && k[key] && k[key].isDown);
    const t = this._touch();

    const left = down('left') || down('a') || !!(t && t.left);
    const right = down('right') || down('d') || !!(t && t.right);
    const up = down('up') || down('w') || !!(t && t.up);
    const downHeld = down('down') || down('s') || !!(t && t.down);
    const jump = down('space') || down('z') || !!(t && t.jump);
    const run = down('x') || !!(t && t.run);
    const attack = down('c') || !!(t && t.attack);
    const switchWeapon = down('v');

    const state = {
      left, right, up, down: downHeld, jump, run,
      jumpPressed: (jump && !this.prev.jump) || !!(t && t.jumpPressed),
      attackPressed: (attack && !this.prev.attack) || !!(t && t.attackPressed),
      switchWeaponPressed: (switchWeapon && !this.prev.switchWeapon) || !!(t && t.switchWeaponPressed),
      slidePressed: !!(t && t.slidePressed)
    };

    this.prev.jump = jump;
    this.prev.attack = attack;
    this.prev.switchWeapon = switchWeapon;
    return state;
  }

  destroy() {
    // Keys belong to the scene's keyboard plugin, which cleans them up on shutdown.
    this.keys = null;
  }
}
