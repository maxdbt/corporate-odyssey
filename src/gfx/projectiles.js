// Enemy projectiles, player projectiles and FX textures.
import { makeTex } from './painter.js';
import { TEX } from '../config/constants.js';

function envelope(p, w, h, body, flap) {
  p.r(0, 0, w, h, body).box(0, 0, w, h, 0x555555);
  for (let i = 0; i < w / 2; i++) {
    const y = Math.min(h - 2, Math.round((i * h) / w));
    p.r(1 + i, 1 + y, 1, 1, flap).r(w - 2 - i, 1 + y, 1, 1, flap);
  }
}

export function generateProjectiles(scene) {
  // --- Enemy projectiles
  makeTex(scene, TEX.PAPER, 12, 8, (p) => {
    p.r(0, 0, 12, 8, 0xffffff).box(0, 0, 12, 8, 0xb0b0b0);
    p.r(2, 2, 8, 1, 0x5080d0).r(2, 4, 6, 1, 0x5080d0).r(2, 6, 7, 1, 0x5080d0);
  });
  makeTex(scene, TEX.FOLDER, 16, 20, (p) => {
    p.r(0, 0, 16, 20, 0x2060c0).r(0, 0, 16, 1, 0x5a90e0).box(0, 0, 16, 20, 0x103060);
    p.r(4, 4, 8, 6, 0xffffff).r(5, 6, 6, 1, 0x333333);
    p.disc(8, 15, 2, 0x103060);
  });
  makeTex(scene, TEX.PANETTONE, 14, 12, (p) => {
    p.r(1, 6, 12, 6, 0xf4d58d).r(0, 7, 14, 5, 0xffffff).r(0, 7, 14, 1, 0xe0e0e0); // paper wrapper
    p.r(2, 2, 10, 6, 0xc8862e).r(4, 0, 6, 3, 0xc8862e).r(4, 0, 6, 1, 0x8b4a1a);
    p.r(4, 4, 2, 2, 0x5a1a1a).r(8, 3, 2, 2, 0x5a1a1a).r(6, 6, 2, 1, 0xe03030);
    for (let x = 1; x < 14; x += 3) p.r(x, 8, 1, 4, 0xd03030);
  });
  makeTex(scene, TEX.FLAME, 18, 8, (p) => {
    p.r(4, 1, 14, 6, 0xff5500).r(0, 3, 6, 2, 0xff5500).r(8, 2, 10, 4, 0xffa000).r(12, 3, 6, 2, 0xffff60);
  });
  makeTex(scene, TEX.TRAY, 22, 6, (p) => {
    p.r(0, 0, 22, 6, 0xc05a00).r(1, 1, 20, 4, 0xf07a10).r(3, 2, 6, 2, 0xd06a08).r(12, 2, 7, 2, 0xd06a08);
  });
  makeTex(scene, TEX.FEEDBACK, 14, 14, (p) => {
    p.disc(7, 7, 7, 0xd01010).disc(7, 7, 5, 0xff7000).disc(7, 7, 3, 0xffe040);
    p.r(6, 4, 2, 4, 0xd01010).r(6, 9, 2, 1, 0xd01010);
  });
  makeTex(scene, TEX.SHOCKWAVE, 24, 18, (p) => {
    for (let y = 0; y < 18; y++) {
      const w = Math.round(4 + (y / 17) * 20);
      const x = (24 - w) / 2;
      p.r(x, y, w, 1, y > 12 ? 0xffffff : 0xff8c00, 0.9);
    }
    p.r(6, 8, 12, 2, 0xffe040);
  });
  makeTex(scene, TEX.MAIL, 14, 10, (p) => envelope(p, 14, 10, 0xf5f0e0, 0xc03030));
  makeTex(scene, TEX.Q4FOLDER, 32, 40, (p) => {
    p.r(0, 0, 32, 40, 0x8b1a1a).box(0, 0, 32, 40, 0x400808).r(2, 2, 28, 2, 0xc04040);
    p.r(6, 8, 20, 12, 0xffffff).text('Q4', 9, 10, 0x111111, 2);
    p.disc(16, 31, 4, 0x400808).disc(16, 31, 2, 0xc0c0c0);
    p.r(28, 0, 4, 40, 0xf0f0f0).r(29, 0, 1, 40, 0xc0c0c0); // sheets edge
  });
  makeTex(scene, TEX.EXCEL, 32, 32, (p) => {
    p.r(0, 0, 32, 32, 0xffffff).r(0, 0, 32, 6, 0x1d6f42);
    p.text('X', 2, 1, 0xffffff, 1);
    for (let x = 0; x < 32; x += 8) p.r(x, 6, 1, 26, 0x7fbf9a);
    for (let y = 6; y < 32; y += 5) p.r(0, y, 32, 1, 0x7fbf9a);
    p.r(9, 12, 6, 3, 0x1d6f42).r(17, 17, 6, 3, 0x1d6f42).r(1, 22, 6, 3, 0xe0b000);
    p.box(0, 0, 32, 32, 0x0f4a2a);
  });
  makeTex(scene, TEX.REDWAVE, 40, 60, (p) => {
    for (let y = 0; y < 60; y++) {
      const w = Math.round(10 + Math.sin((y / 60) * Math.PI * 0.5) * 30);
      p.r(40 - w, y, w, 1, y % 6 < 3 ? 0xe01010 : 0xff3a3a, 0.9);
    }
    p.r(36, 0, 4, 60, 0xffffff, 0.7);
  });
  makeTex(scene, TEX.BUBBLE, 26, 16, (p) => {
    p.r(1, 0, 24, 12, 0xffffff).r(0, 1, 26, 10, 0xffffff);
    p.box(0, 0, 26, 12, 0x111111);
    p.r(4, 12, 4, 2, 0xffffff).r(4, 14, 2, 2, 0xffffff).r(3, 12, 1, 4, 0x111111).r(8, 12, 1, 2, 0x111111);
    p.text('BLA', 2, 3, 0x111111, 1);
    p.text('!', 15, 3, 0xd02020, 1);
  });

  // --- Player projectiles
  makeTex(scene, TEX.P_EMAIL, 12, 8, (p) => envelope(p, 12, 8, 0xd8ecff, 0x1e6fd0));
  makeTex(scene, TEX.P_TEAMS, 12, 12, (p) => {
    p.disc(6, 6, 6, 0x5b5fc7).r(3, 3, 6, 2, 0xffffff).r(5, 5, 2, 5, 0xffffff);
  });
  makeTex(scene, TEX.P_COFFEE, 10, 10, (p) => {
    p.r(1, 3, 7, 7, 0xffffff).r(2, 3, 5, 2, 0x6b3a1f).r(8, 4, 2, 1, 0xffffff).r(9, 4, 1, 4, 0xffffff).r(8, 7, 2, 1, 0xffffff);
    p.r(2, 0, 1, 2, 0xd0d0d0).r(5, 0, 1, 2, 0xd0d0d0);
  });
  makeTex(scene, TEX.P_CLOCK, 12, 12, (p) => {
    p.disc(6, 6, 6, 0x222222).disc(6, 6, 5, 0xfff4c0).r(5, 2, 2, 5, 0x111111).r(6, 5, 3, 2, 0x111111);
  });
  makeTex(scene, TEX.P_WWW, 16, 12, (p) => {
    p.r(0, 0, 16, 12, 0x101820).box(0, 0, 16, 12, 0x39ff14);
    p.text('<', 1, 4, 0x39ff14, 1).text('/', 6, 4, 0xffffff, 1).text('>', 11, 4, 0x39ff14, 1);
    p.r(1, 1, 14, 2, 0x1e6fd0);
  });

  // --- FX
  makeTex(scene, TEX.FX_EXPLOSION1, 32, 32, (p) => {
    p.disc(16, 16, 7, 0xff8800).disc(16, 16, 4, 0xffff80);
  });
  makeTex(scene, TEX.FX_EXPLOSION2, 32, 32, (p) => {
    p.disc(16, 16, 13, 0xd02000).disc(16, 16, 10, 0xff8800).disc(16, 16, 6, 0xffe040);
    p.r(2, 14, 4, 4, 0xff8800).r(26, 10, 4, 4, 0xff8800).r(14, 1, 4, 4, 0xffe040);
  });
  makeTex(scene, TEX.FX_EXPLOSION3, 32, 32, (p) => {
    p.ring(16, 16, 15, 4, 0x777777, 0.9).ring(16, 16, 10, 3, 0x999999, 0.7);
    p.r(4, 4, 4, 4, 0x555555).r(24, 22, 4, 4, 0x555555).r(22, 4, 3, 3, 0xff8800);
  });
  makeTex(scene, TEX.FX_SPARK, 4, 4, (p) => p.r(1, 0, 2, 4, 0xffe040).r(0, 1, 4, 2, 0xffe040).r(1, 1, 2, 2, 0xffffff));
  makeTex(scene, TEX.FX_PX, 2, 2, (p) => p.r(0, 0, 2, 2, 0xffffff));
  makeTex(scene, TEX.FX_WIND, 10, 2, (p) => p.r(0, 0, 10, 2, 0x9fdcff, 0.8).r(6, 0, 4, 2, 0xffffff, 0.9));
  makeTex(scene, TEX.FX_HEAT, 2, 6, (p) => p.r(0, 0, 2, 2, 0xffa040).r(0, 2, 2, 2, 0xff7000).r(0, 4, 2, 2, 0xffd060));
  makeTex(scene, TEX.FX_BUBBLE, 6, 6, (p) => p.ring(3, 3, 3, 1, 0xbfe8ff).r(1, 1, 1, 1, 0xffffff));
  makeTex(scene, TEX.FX_SNOW, 3, 3, (p) => p.r(1, 0, 1, 3, 0xffffff).r(0, 1, 3, 1, 0xffffff));
}
