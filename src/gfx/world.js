// Tiles (32x32, seamless), platforms, structures and decor.
import { makeTex, rng } from './painter.js';
import { TEX } from '../config/constants.js';

// Speckled base that tiles seamlessly (speckles never touch the edges' continuity).
function speckle(p, seed, base, dots, count, size = 2) {
  p.r(0, 0, 32, 32, base);
  const rand = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rand() * 16) * 2;
    const y = Math.floor(rand() * 16) * 2;
    p.r(x, y, size, size, dots[i % dots.length]);
  }
}

function tiles(scene) {
  makeTex(scene, TEX.T_OFFICE, 32, 32, (p) => {
    speckle(p, 11, 0x5d6d7e, [0x4f5d6b, 0x6c7d8f], 60);
    p.r(0, 0, 32, 4, 0x8495a6).r(0, 4, 32, 2, 0x3e4a56);
  });
  makeTex(scene, TEX.T_XMAS, 32, 32, (p) => {
    // red bricks with snow on top
    p.r(0, 0, 32, 32, 0xa02020);
    for (let y = 8; y < 32; y += 8) p.r(0, y, 32, 1, 0x601010);
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? 8 : 0;
      for (let x = off; x < 32; x += 16) p.r(x, row * 8, 1, 8, 0x601010);
    }
    p.r(0, 0, 32, 5, 0xffffff).r(4, 5, 6, 2, 0xffffff).r(18, 5, 8, 2, 0xffffff).r(0, 5, 2, 1, 0xffffff);
    p.r(6, 1, 2, 1, 0xd8ecff).r(22, 2, 2, 1, 0xd8ecff);
  });
  makeTex(scene, TEX.T_SUMMER, 32, 32, (p) => {
    // terracotta tiles 16x16
    p.r(0, 0, 32, 32, 0xd2733a);
    p.r(0, 15, 32, 2, 0x8f4a20).r(15, 0, 2, 32, 0x8f4a20);
    p.r(1, 1, 13, 2, 0xe8945a).r(17, 17, 13, 2, 0xe8945a).r(17, 1, 13, 2, 0xe8945a).r(1, 17, 13, 2, 0xe8945a);
    p.r(0, 0, 32, 1, 0xf4b07a);
  });
  makeTex(scene, TEX.T_CANTEEN, 32, 32, (p) => {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) p.r(x * 8, y * 8, 8, 8, (x + y) % 2 ? 0x222222 : 0xeeeeee);
    p.r(0, 0, 32, 2, 0x999999);
  });
  makeTex(scene, TEX.T_MEETING, 32, 32, (p) => {
    // dark wood parquet
    const cols = [0x5a3a22, 0x6b4428, 0x4e321d, 0x634026];
    for (let i = 0; i < 4; i++) p.r(0, i * 8, 32, 8, cols[i]);
    for (let i = 0; i < 4; i++) p.r(i % 2 ? 20 : 8, i * 8, 1, 8, 0x2e1e10);
    for (let i = 0; i < 4; i++) p.r(0, i * 8 + 7, 32, 1, 0x2e1e10);
    p.r(0, 0, 32, 2, 0x8a6040);
  });
  makeTex(scene, TEX.T_SAND, 32, 32, (p) => {
    speckle(p, 23, 0xe2c275, [0xcfac5c, 0xf0d898], 50);
    p.r(0, 0, 32, 3, 0xf4dfa0);
    p.r(2, 12, 10, 1, 0xc49a48).r(18, 22, 12, 1, 0xc49a48).r(8, 28, 8, 1, 0xc49a48);
  });
  makeTex(scene, TEX.T_ICE, 32, 32, (p) => {
    p.r(0, 0, 32, 32, 0x9fdcff).r(0, 0, 32, 3, 0xe8f8ff);
    p.r(3, 8, 10, 1, 0xffffff).r(6, 9, 6, 1, 0xffffff).r(18, 18, 10, 1, 0xffffff).r(4, 26, 7, 1, 0xd8f2ff);
    p.r(0, 31, 32, 1, 0x5aa8d8).r(31, 0, 1, 32, 0x7ac0e8);
  });
  makeTex(scene, TEX.T_SEABED, 32, 32, (p) => {
    speckle(p, 37, 0xa08850, [0x80683a, 0xc0a870, 0x707070], 50);
    p.r(0, 0, 32, 3, 0xc8b078).r(6, 6, 4, 3, 0x909090).r(22, 14, 5, 3, 0x909090);
  });
  makeTex(scene, TEX.T_CARPET, 32, 32, (p) => {
    p.r(0, 0, 32, 32, 0xa01020);
    for (let y = 4; y < 32; y += 16) for (let x = 4; x < 32; x += 16) {
      p.r(x + 3, y, 2, 8, 0xd4af37).r(x, y + 3, 8, 2, 0xd4af37).r(x + 3, y + 3, 2, 2, 0xffe080);
    }
    p.r(0, 0, 32, 3, 0xd4af37).r(0, 3, 32, 1, 0x700810);
  });
  makeTex(scene, TEX.T_BLOCK, 32, 32, (p) => {
    p.r(0, 0, 32, 32, 0x7f8c8d);
    for (let y = 0; y < 32; y += 8) {
      p.r(0, y, 32, 1, 0x4d5656);
      const off = (y / 8) % 2 ? 8 : 0;
      for (let x = off; x < 32; x += 16) p.r(x, y, 1, 8, 0x4d5656);
      p.r(0, y + 1, 32, 1, 0xa6b1b2);
    }
  });
}

function platforms(scene) {
  makeTex(scene, TEX.DESK, 64, 26, (p) => {
    p.r(0, 0, 64, 6, 0xb07840).r(0, 0, 64, 2, 0xd8a060).r(0, 5, 64, 1, 0x6b4420);
    p.r(2, 6, 4, 20, 0x5a5a5a).r(58, 6, 4, 20, 0x5a5a5a);
    p.r(36, 6, 20, 14, 0x9a6a38).box(36, 6, 20, 14, 0x6b4420).r(43, 9, 6, 2, 0xd0d0d0).r(43, 15, 6, 2, 0xd0d0d0);
    p.r(8, 6, 26, 2, 0x6b4420);
  });
  makeTex(scene, TEX.DESK_GLASS, 64, 20, (p) => {
    p.r(0, 0, 64, 5, 0xbfefff, 0.85).r(0, 0, 64, 1, 0xffffff).r(6, 1, 14, 1, 0xffffff).r(0, 4, 64, 1, 0x7ac0e8);
    p.r(4, 5, 3, 15, 0xd0d6dc).r(57, 5, 3, 15, 0xd0d6dc).r(5, 5, 1, 15, 0xffffff).r(58, 5, 1, 15, 0xffffff);
  });
  const postit = (key, base, dark) => makeTex(scene, key, 44, 12, (p) => {
    p.r(0, 0, 44, 12, base).r(0, 11, 44, 1, dark).r(43, 0, 1, 12, dark);
    p.r(38, 0, 6, 6, dark).r(38, 0, 5, 5, 0xffffff, 0.35); // folded corner
    p.r(4, 3, 18, 1, 0x3050a0).r(4, 6, 26, 1, 0x3050a0).r(4, 9, 12, 1, 0x3050a0);
    p.r(0, 0, 44, 1, 0xffffff, 0.4);
  });
  postit(TEX.POSTIT_YELLOW, 0xfff176, 0xc8b030);
  postit(TEX.POSTIT_ORANGE, 0xffb74d, 0xc07820);
  postit(TEX.POSTIT_GREEN, 0xaed581, 0x6a9a3a);

  makeTex(scene, TEX.COUNTER, 96, 56, (p) => {
    p.r(0, 14, 96, 42, 0xa8b0b8).r(0, 14, 96, 4, 0xe0e6ec).r(0, 52, 96, 4, 0x6f7780);
    for (let x = 8; x < 96; x += 24) p.r(x, 22, 16, 26, 0x8f979f).box(x, 22, 16, 26, 0x6f7780);
    // sneeze guard + food trays
    p.r(4, 0, 88, 2, 0xbfefff, 0.8).r(4, 0, 2, 14, 0xd0d6dc).r(90, 0, 2, 14, 0xd0d6dc);
    p.r(10, 8, 20, 6, 0xffd060).r(38, 8, 20, 6, 0xd03020).r(66, 8, 20, 6, 0x40a040);
    p.r(12, 7, 4, 2, 0xfff0a0).r(42, 7, 4, 2, 0xff6040).r(70, 7, 4, 2, 0x80d060);
  });
  makeTex(scene, TEX.LADDER, 20, 32, (p) => {
    p.r(1, 0, 3, 32, 0x8b5a2b).r(16, 0, 3, 32, 0x8b5a2b).r(1, 0, 1, 32, 0xb07840).r(16, 0, 1, 32, 0xb07840);
    for (let y = 4; y < 32; y += 8) p.r(4, y, 12, 3, 0xa06a35).r(4, y, 12, 1, 0xc8904a);
  });
  makeTex(scene, TEX.ICE_PLATFORM, 64, 16, (p) => {
    p.r(0, 0, 64, 16, 0x9fdcff).r(0, 0, 64, 3, 0xffffff).r(0, 15, 64, 1, 0x5aa8d8);
    p.r(6, 6, 14, 1, 0xffffff).r(30, 9, 18, 1, 0xd8f2ff);
    for (let x = 4; x < 64; x += 12) p.r(x, 16 - 3, 3, 3, 0x7ac0e8);
  });
}

function decor(scene) {
  makeTex(scene, TEX.PLANT, 24, 40, (p) => {
    const L = 0x2e9e3a, D = 0x1d6b27;
    p.r(10, 6, 4, 22, D);
    [[2, 4, 10, 6], [12, 0, 10, 6], [0, 12, 10, 5], [14, 10, 10, 5], [4, 20, 8, 5], [13, 18, 8, 5]].forEach(([x, y, w, h], i) => {
      p.r(x, y, w, h, i % 2 ? L : 0x3fbf4a).r(x, y + h - 1, w, 1, D);
    });
    p.r(5, 28, 14, 12, 0xc0603a).r(4, 28, 16, 3, 0xd8784a).r(7, 37, 10, 3, 0x8f4020);
  });
  makeTex(scene, TEX.LUX_PLANT, 32, 64, (p) => {
    p.r(15, 14, 3, 34, 0x6b4a2a);
    const L = 0x1f8a3a;
    [[2, 8, 14, 4], [17, 6, 14, 4], [0, 16, 12, 4], [20, 14, 12, 4], [8, 0, 16, 6], [4, 24, 10, 3], [19, 24, 10, 3]].forEach(([x, y, w, h], i) => {
      p.r(x, y, w, h, i % 2 ? L : 0x2fb050).r(x, y, w, 1, 0x60d080);
    });
    p.r(6, 46, 20, 18, 0xd4af37).r(4, 46, 24, 4, 0xffe080).r(8, 52, 16, 2, 0xb08a20).r(10, 60, 12, 4, 0xb08a20);
  });
  makeTex(scene, TEX.XMAS_TREE, 40, 64, (p) => {
    const G = 0x1e7a30;
    for (let i = 0; i < 3; i++) {
      const top = 6 + i * 16;
      for (let y = 0; y < 20; y++) {
        const w = 6 + Math.round(y * (1.2 + i * 0.25));
        p.r(20 - w / 2, top + y, w, 1, y % 5 === 4 ? 0x166024 : G);
      }
    }
    p.r(16, 56, 8, 8, 0x6b3a1f);
    p.r(18, 0, 4, 6, 0xffe000).r(16, 2, 8, 2, 0xffe000);
    const balls = [[14, 18, 0xe02020], [24, 24, 0x3060e0], [10, 36, 0xffd000], [28, 40, 0xe02020], [18, 46, 0xff60c0], [6, 52, 0x3060e0], [32, 54, 0xffd000]];
    balls.forEach(([x, y, c]) => p.r(x, y, 3, 3, c));
    p.r(8, 30, 24, 1, 0xffd000).r(4, 48, 32, 1, 0xffd000);
  });
  makeTex(scene, TEX.WINDOW, 64, 48, (p) => {
    p.r(0, 0, 64, 48, 0x9aa3ad).r(3, 3, 58, 42, 0x6ec6ff);
    p.r(3, 30, 58, 15, 0x3a7ab0);
    [[6, 22, 8, 23], [16, 16, 10, 29], [28, 26, 8, 19], [38, 12, 9, 33], [50, 20, 9, 25]].forEach(([x, y, w, h]) => {
      p.r(x, y, w, h, 0x4a5a6a);
      for (let wy = y + 2; wy < y + h - 2; wy += 4) for (let wx = x + 2; wx < x + w - 2; wx += 3) p.r(wx, wy, 1, 2, 0xffe080);
    });
    p.r(31, 3, 2, 42, 0x9aa3ad).r(3, 23, 58, 2, 0x9aa3ad);
    p.r(6, 6, 10, 2, 0xffffff, 0.6);
  });
  makeTex(scene, TEX.WHITEBOARD, 64, 40, (p) => {
    p.r(0, 0, 64, 36, 0xb0b8c0).r(2, 2, 60, 32, 0xffffff);
    // bar chart going down + scribbles
    [[8, 12, 0x2a8ad4], [16, 16, 0x2a8ad4], [24, 22, 0xe0b000], [32, 26, 0xd02020]].forEach(([x, y, c]) => p.r(x, y, 6, 32 - y, c));
    p.r(6, 30, 34, 1, 0x333333).r(6, 8, 1, 23, 0x333333);
    p.r(44, 8, 14, 1, 0x333333).r(44, 12, 10, 1, 0x333333).r(44, 16, 12, 1, 0xd02020).r(44, 20, 8, 1, 0x333333);
    p.r(4, 36, 56, 2, 0x9aa3ad).r(10, 35, 6, 2, 0xd02020).r(20, 35, 6, 2, 0x2a8ad4);
  });
  makeTex(scene, TEX.WATER_COOLER, 20, 40, (p) => {
    p.r(4, 0, 12, 14, 0x6ec6ff).r(4, 0, 12, 2, 0x2a8ad4).r(6, 3, 2, 9, 0xbfe8ff);
    p.r(2, 14, 16, 26, 0xe8e8e8).box(2, 14, 16, 26, 0xa0a0a0);
    p.r(5, 20, 3, 3, 0x2060e0).r(12, 20, 3, 3, 0xe02020).r(5, 28, 10, 2, 0x555555);
  });
  makeTex(scene, TEX.PUDDLE, 32, 6, (p) => {
    p.r(2, 1, 28, 5, 0xf5e08a, 0.9).r(0, 2, 32, 3, 0xf5e08a, 0.9).r(4, 1, 10, 1, 0xffffff, 0.8);
    p.r(8, 3, 2, 2, 0xffffff).r(18, 2, 1, 1, 0xffffff).r(24, 3, 2, 2, 0xfff8d0);
  });
  makeTex(scene, TEX.AC_VENT, 32, 12, (p) => {
    p.r(0, 0, 32, 12, 0xd0d6dc).box(0, 0, 32, 12, 0x6f7780);
    for (let y = 2; y < 11; y += 3) p.r(2, y, 28, 1, 0x6f7780);
    p.r(26, 2, 3, 2, 0x5ab4ff);
  });
  makeTex(scene, TEX.SEAWEED, 16, 32, (p) => {
    for (let y = 0; y < 32; y++) {
      const x1 = 3 + Math.round(Math.sin(y / 4) * 2);
      const x2 = 10 + Math.round(Math.cos(y / 4) * 2);
      p.r(x1, y, 3, 1, 0x2e9e3a).r(x2, y + 0, 3, 1, 0x1d7a2a);
    }
  });
  makeTex(scene, TEX.GOLD_FRAME, 32, 40, (p) => {
    p.r(0, 0, 32, 40, 0xd4af37).r(2, 2, 28, 36, 0xb08a20).r(4, 4, 24, 32, 0x2c3e50);
    p.r(11, 10, 10, 10, 0xe0b088).r(10, 8, 12, 4, 0xc8c8c8).r(8, 22, 16, 14, 0x15151c).r(15, 22, 2, 10, 0xd4af37);
    p.r(13, 14, 2, 1, 0x111111).r(17, 14, 2, 1, 0x111111);
    p.r(0, 0, 32, 1, 0xffe080).r(0, 0, 1, 40, 0xffe080);
  });
}

export function generateWorld(scene) {
  tiles(scene);
  platforms(scene);
  decor(scene);
}
