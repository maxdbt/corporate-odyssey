import { FONT, GAME_HEIGHT, GAME_WIDTH, RENDER_SCALE } from '../config/constants.js';
import { HUD_SCALE } from './HUD.js';

// Floating joystick: it appears where the thumb touches the left half of the screen (below the HUD strip)
// and follows it when dragged further than its radius. Up/down climb ladders and crouch.
const STICK = { r: 44, dead: 12, hintX: 96, hintY: GAME_HEIGHT - 86, top: 44 * HUD_SCALE + 6 };
// The hint ring disappears for the rest of the session once the joystick has been used (or after a few seconds:
// it sits where the player starts).
let stickUsed = false;
// Compact cluster in the bottom-right corner.
const BUTTONS = [
  { id: 'jump', label: 'SALTA', x: GAME_WIDTH - 50, y: GAME_HEIGHT - 52, r: 34, color: 0x3ce05a },
  { id: 'attack', label: 'ATTACCA', x: GAME_WIDTH - 128, y: GAME_HEIGHT - 36, r: 27, color: 0xff5050 },
  { id: 'slide', label: 'SCIVOLA', x: GAME_WIDTH - 100, y: GAME_HEIGHT - 112, r: 25, color: 0x40a0ff }
];

// Virtual joystick + action buttons. Multi-touch: polls every active pointer each frame.
export default class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.gfx = scene.add.graphics().setDepth(5);
    this.labels = BUTTONS.map((b) => scene.add.text(b.x, b.y, b.label, {
      fontFamily: FONT, fontSize: '9px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(6).setAlpha(0.85));
    this.held = { left: false, right: false, up: false, down: false, jump: false, attack: false, slide: false };
    this.prev = { jump: false, attack: false, slide: false };
    this.stick = null; // { id, bx, by, kx, ky } while a thumb drives the joystick
    this.switchLatched = false;
    this.visible = true;
    this.hintUntil = scene.time.now + 4000;
  }

  setVisible(v) {
    this.visible = v;
    this.gfx.setVisible(v);
    this.labels.forEach((l) => l.setVisible(v));
    if (!v) this.stick = null;
  }

  latchSwitchWeapon() {
    this.switchLatched = true;
  }

  // Takes / keeps / releases the joystick pointer and applies its direction to h.
  _pollStick(pointers, h) {
    let s = this.stick;
    if (s && !pointers.some((p) => p && p.isDown && p.id === s.id)) s = this.stick = null;
    if (!s) {
      const p = pointers.find((q) => q && q.isDown && q.downX / RENDER_SCALE < GAME_WIDTH / 2 &&
        q.downY / RENDER_SCALE > STICK.top);
      if (!p) return;
      stickUsed = true;
      const r = STICK.r;
      s = this.stick = {
        id: p.id,
        bx: Math.max(r + 6, p.downX / RENDER_SCALE),
        by: Math.min(GAME_HEIGHT - r - 4, Math.max(STICK.top + r, p.downY / RENDER_SCALE))
      };
    }
    const p = pointers.find((q) => q && q.id === s.id);
    let dx = p.x / RENDER_SCALE - s.bx;
    let dy = p.y / RENDER_SCALE - s.by;
    let dist = Math.hypot(dx, dy);
    if (dist > STICK.r) {
      // Dragged past the rim: the base follows the thumb.
      s.bx += dx - (dx / dist) * STICK.r;
      s.by += dy - (dy / dist) * STICK.r;
      dx = (dx / dist) * STICK.r;
      dy = (dy / dist) * STICK.r;
      dist = STICK.r;
    }
    s.kx = s.bx + dx;
    s.ky = s.by + dy;
    if (dist < STICK.dead) return;
    // Left/right within ~67deg of the horizontal; up/down need a steeper push so running never crouches.
    const nx = dx / dist;
    const ny = dy / dist;
    if (nx > 0.38) h.right = true;
    if (nx < -0.38) h.left = true;
    if (ny > 0.6) h.down = true;
    if (ny < -0.6) h.up = true;
  }

  _poll() {
    const h = { left: false, right: false, up: false, down: false, jump: false, attack: false, slide: false };
    if (!this.visible) return h;
    const pointers = this.scene.input.manager.pointers || [];
    this._pollStick(pointers, h);
    for (const p of pointers) {
      if (!p || !p.isDown || (this.stick && p.id === this.stick.id)) continue;
      const px = p.x / RENDER_SCALE, py = p.y / RENDER_SCALE;
      // The closest button within reach (generous margins: the buttons are small).
      let best = null;
      let bestD = Infinity;
      for (const b of BUTTONS) {
        const d = Math.hypot(px - b.x, py - b.y);
        if (d <= b.r * 1.35 && d < bestD) { best = b; bestD = d; }
      }
      if (best) h[best.id] = true;
    }
    return h;
  }

  // Called once per frame (by InputController via UIScene.getTouchState()).
  getState() {
    const h = this.held;
    const state = {
      left: h.left, right: h.right, up: h.up, down: h.down,
      jump: h.jump, run: h.slide, attack: h.attack,
      jumpPressed: h.jump && !this.prev.jump,
      attackPressed: h.attack && !this.prev.attack,
      slidePressed: h.slide && !this.prev.slide,
      switchWeaponPressed: this.switchLatched
    };
    this.prev = { jump: h.jump, attack: h.attack, slide: h.slide };
    this.switchLatched = false;
    return state;
  }

  update() {
    this.held = this._poll();
    if (!this.visible) return;
    const g = this.gfx;
    const h = this.held;
    g.clear();
    // Joystick: base + knob under the thumb, or a faint hint where to put it.
    const s = this.stick;
    if (s) {
      g.fillStyle(0x000000, 0.25).fillCircle(s.bx, s.by, STICK.r + 6);
      g.lineStyle(2, 0xffffff, 0.45).strokeCircle(s.bx, s.by, STICK.r + 6);
      g.fillStyle(0xffd800, 0.6).fillCircle(s.kx, s.ky, 20);
      g.lineStyle(2, 0xffffff, 0.8).strokeCircle(s.kx, s.ky, 20);
    } else if (!stickUsed && this.scene.time.now < this.hintUntil) {
      g.lineStyle(2, 0xffffff, 0.2).strokeCircle(STICK.hintX, STICK.hintY, STICK.r + 6);
      g.fillStyle(0xffffff, 0.15).fillCircle(STICK.hintX, STICK.hintY, 20);
    }
    // Buttons
    for (const b of BUTTONS) {
      const on = h[b.id];
      g.fillStyle(b.color, on ? 0.75 : 0.3).fillCircle(b.x, b.y, b.r);
      g.lineStyle(2, 0xffffff, on ? 0.9 : 0.4).strokeCircle(b.x, b.y, b.r);
    }
  }
}
