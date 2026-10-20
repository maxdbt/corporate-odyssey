// Helpers to keep level data compact.
export const H = 450;
export const FLOOR = 386;       // surface of a 2-tile ground
export const DESK_TOP = 360;    // a desk standing on FLOOR
export const T = 32;

// Row of collectibles.
export const row = (kind, x, y, n, dx = 24) => Array.from({ length: n }, (_, i) => [kind, x + i * dx, y]);

// Arc of collectibles (for jumps).
export const arc = (kind, x, y, n, dx = 22, h = 40) =>
  Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    return [kind, x + i * dx, Math.round(y - Math.sin(t * Math.PI) * h)];
  });

// Stair of one-way desks.
export const deskStairs = (x, n, dx = 100, startY = DESK_TOP, dy = 64) =>
  Array.from({ length: n }, (_, i) => [x + i * dx, startY - i * dy]);
