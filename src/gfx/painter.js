// Low-level helpers to draw 8-bit pixel art into textures with Phaser Graphics.

// Tiny 3x5 pixel font for labels drawn inside sprites.
const FONT3x5 = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['###', '#..', '#..', '#..', '###'],
  E: ['###', '#..', '##.', '#..', '###'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  L: ['#..', '#..', '#..', '#..', '###'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  Q: ['###', '#.#', '#.#', '###', '..#'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  W: ['#.#', '#.#', '#.#', '###', '#.#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  G: ['###', '#..', '#.#', '#.#', '###'],
  N: ['#.#', '###', '###', '#.#', '#.#'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['###', '#..', '###', '..#', '###'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '€': ['.##', '#..', '###', '#..', '.##'],
  '?': ['##.', '..#', '.#.', '...', '.#.'],
  '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  '<': ['..#', '.#.', '#..', '.#.', '..#'],
  '>': ['#..', '.#.', '..#', '.#.', '#..'],
  '/': ['..#', '..#', '.#.', '#..', '#..'],
  '@': ['###', '#.#', '#.#', '#..', '###'],
  ' ': ['...', '...', '...', '...', '...']
};

// Deterministic RNG so textures look the same every run.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Painter {
  constructor(g, w, h) {
    this.g = g;
    this.w = w;
    this.h = h;
  }

  // Filled rectangle in real pixels.
  r(x, y, w, h, color, alpha = 1) {
    this.g.fillStyle(color, alpha);
    this.g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
    return this;
  }

  // Art pixel (s x s real pixels, default 2).
  p(x, y, color, s = 2, alpha = 1) {
    return this.r(x * s, y * s, s, s, color, alpha);
  }

  // Rectangle outline 1px.
  box(x, y, w, h, color) {
    this.r(x, y, w, 1, color).r(x, y + h - 1, w, 1, color);
    this.r(x, y, 1, h, color).r(x + w - 1, y, 1, h, color);
    return this;
  }

  // Pixelated filled disc (no anti-aliasing).
  disc(cx, cy, rad, color, alpha = 1) {
    for (let y = Math.floor(cy - rad); y <= Math.ceil(cy + rad); y++) {
      for (let x = Math.floor(cx - rad); x <= Math.ceil(cx + rad); x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        if (dx * dx + dy * dy <= rad * rad) this.r(x, y, 1, 1, color, alpha);
      }
    }
    return this;
  }

  // Pixelated ring.
  ring(cx, cy, rad, thick, color, alpha = 1) {
    for (let y = Math.floor(cy - rad); y <= Math.ceil(cy + rad); y++) {
      for (let x = Math.floor(cx - rad); x <= Math.ceil(cx + rad); x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= rad && d > rad - thick) this.r(x, y, 1, 1, color, alpha);
      }
    }
    return this;
  }

  // Draw a string grid; each char maps to a color in pal ('.' or ' ' = transparent).
  grid(rows, pal, ox = 0, oy = 0, s = 2) {
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const c = row[x];
        if (c === '.' || c === ' ') continue;
        const col = pal[c];
        if (col === undefined) continue;
        this.r(ox + x * s, oy + y * s, s, s, col);
      }
    });
    return this;
  }

  // Text with the 3x5 font; s = pixel size.
  text(str, x, y, color, s = 1) {
    let cx = x;
    for (const ch of str.toUpperCase()) {
      const glyph = FONT3x5[ch] || FONT3x5[' '];
      glyph.forEach((row, gy) => {
        for (let gx = 0; gx < 3; gx++) if (row[gx] === '#') this.r(cx + gx * s, y + gy * s, s, s, color);
      });
      cx += 4 * s;
    }
    return this;
  }
}

// Create (or replace) a texture by running draw(painter).
export function makeTex(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(new Painter(g, w, h));
  g.generateTexture(key, w, h);
  g.destroy();
}

// Draw a grid texture whose size is derived from the grid (s = art pixel size).
export function gridTex(scene, key, rows, pal, s = 2) {
  makeTex(scene, key, rows[0].length * s, rows.length * s, (p) => p.grid(rows, pal, 0, 0, s));
}
