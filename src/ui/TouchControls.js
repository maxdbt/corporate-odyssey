import { FONT, GAME_HEIGHT, GAME_WIDTH, RENDER_SCALE } from '../config/constants.js';

const DPAD = { x: 96, y: GAME_HEIGHT - 96, r: 78, dead: 16 };
const BUTTONS = [
  { id: 'jump', label: 'SALTA', x: GAME_WIDTH - 62, y: GAME_HEIGHT - 70, r: 40, color: 0x3ce05a },
  { id: 'attack', label: 'ATTACCA', x: GAME_WIDTH - 158, y: GAME_HEIGHT - 50, r: 34, color: 0xff5050 },
  { id: 'slide', label: 'SCIVOLA', x: GAME_WIDTH - 110, y: GAME_HEIGHT - 150, r: 32, color: 0x40a0ff }
];

// Virtual d-pad + action buttons. Multi-touch: polls every active pointer each frame.
export default class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.gfx = scene.add.graphics().setDepth(5);
    this.labels = BUTTONS.map((b) => scene.add.text(b.x, b.y, b.label, {
      fontFamily: FONT, fontSize: '10px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(6).setAlpha(0.85));
    this.held = { left: false, right: false, up: false, down: false, jump: false, attack: false, slide: false };
    this.prev = { jump: false, attack: false, slide: false };
    this.switchLatched = false;
    this.visible = true;
  }

  setVisible(v) {
    this.visible = v;
    this.gfx.setVisible(v);
    this.labels.forEach((l) => l.setVisible(v));
  }

  latchSwitchWeapon() {
    this.switchLatched = true;
  }

  _poll() {
    const h = { left: false, right: false, up: false, down: false, jump: false, attack: false, slide: false };
    if (!this.visible) return h;
    const pointers = this.scene.input.manager.pointers || [];
    for (const p of pointers) {
      if (!p || !p.isDown) continue;
      const px = p.x / RENDER_SCALE, py = p.y / RENDER_SCALE;
      const dx = px - DPAD.x;
      const dy = py - DPAD.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= DPAD.r * 1.25) {
        if (dist < DPAD.dead) continue;
        // 8-way: a direction is on if the angle is within ~67deg of its axis.
        const nx = dx / dist;
        const ny = dy / dist;
        if (nx > 0.38) h.right = true;
        if (nx < -0.38) h.left = true;
        if (ny > 0.38) h.down = true;
        if (ny < -0.38) h.up = true;
        continue;
      }
      for (const b of BUTTONS) {
        if (Math.hypot(px - b.x, py - b.y) <= b.r * 1.2) h[b.id] = true;
      }
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
    // D-pad base
    g.fillStyle(0x000000, 0.25).fillCircle(DPAD.x, DPAD.y, DPAD.r);
    g.lineStyle(2, 0xffffff, 0.35).strokeCircle(DPAD.x, DPAD.y, DPAD.r);
    const arm = 26;
    const len = 62;
    const dir = (on, x, y, w, hgt) => {
      g.fillStyle(on ? 0xffd800 : 0xffffff, on ? 0.7 : 0.3).fillRect(x, y, w, hgt);
    };
    dir(h.up, DPAD.x - arm / 2, DPAD.y - len, arm, len - arm / 2);
    dir(h.down, DPAD.x - arm / 2, DPAD.y + arm / 2, arm, len - arm / 2);
    dir(h.left, DPAD.x - len, DPAD.y - arm / 2, len - arm / 2, arm);
    dir(h.right, DPAD.x + arm / 2, DPAD.y - arm / 2, len - arm / 2, arm);
    g.fillStyle(0xffffff, 0.2).fillRect(DPAD.x - arm / 2, DPAD.y - arm / 2, arm, arm);
    // Arrows
    g.fillStyle(0x000000, 0.5);
    g.fillTriangle(DPAD.x, DPAD.y - len + 6, DPAD.x - 7, DPAD.y - len + 16, DPAD.x + 7, DPAD.y - len + 16);
    g.fillTriangle(DPAD.x, DPAD.y + len - 6, DPAD.x - 7, DPAD.y + len - 16, DPAD.x + 7, DPAD.y + len - 16);
    g.fillTriangle(DPAD.x - len + 6, DPAD.y, DPAD.x - len + 16, DPAD.y - 7, DPAD.x - len + 16, DPAD.y + 7);
    g.fillTriangle(DPAD.x + len - 6, DPAD.y, DPAD.x + len - 16, DPAD.y - 7, DPAD.x + len - 16, DPAD.y + 7);
    // Buttons
    for (const b of BUTTONS) {
      const on = h[b.id];
      g.fillStyle(b.color, on ? 0.75 : 0.35).fillCircle(b.x, b.y, b.r);
      g.lineStyle(3, 0xffffff, on ? 0.9 : 0.45).strokeCircle(b.x, b.y, b.r);
    }
  }
}
