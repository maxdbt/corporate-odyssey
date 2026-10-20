// Collectibles, power-ups, interactive objects and HUD icons.
import { makeTex } from './painter.js';
import { TEX } from '../config/constants.js';

const GOLD = 0xffc800;
const GOLD_D = 0xb07800;
const GOLD_L = 0xfff080;

function coin(p, size, narrow) {
  const c = size / 2;
  if (narrow) {
    p.r(c - 2, 0, 4, size, GOLD_D).r(c - 1, 1, 2, size - 2, GOLD).r(c - 1, 1, 1, size - 2, GOLD_L);
    return;
  }
  p.disc(c, c, c, GOLD_D).disc(c, c, c - 1, GOLD).r(2, 3, 1, 3, GOLD_L);
  p.text('€', c - 1.5, c - 2.5, GOLD_D, 1);
}

function umbrella(p, ox, oy, s) {
  // beach umbrella over sand: red/white canopy
  const cols = [0xe03030, 0xffffff];
  for (let i = 0; i < 4; i++) p.r(ox + i * 3 * s, oy + 2 * s, 3 * s, 2 * s, cols[i % 2]);
  p.r(ox + 2 * s, oy, 8 * s, 2 * s, 0xe03030).r(ox + 4 * s, oy, 4 * s, 2 * s, 0xffffff);
  p.r(ox + 6 * s, oy + 4 * s, s, 7 * s, 0x8b5a2b);
}

function drawTerminal(p) {
  // CRT monitor with "?" + keyboard
  p.r(1, 0, 22, 18, 0xd8d0b8).box(1, 0, 22, 18, 0x8a8470);
  p.r(4, 2, 16, 12, 0x0a2a0a).r(4, 2, 16, 1, 0x1a4a1a);
  p.text('?', 8, 4, 0x39ff14, 2);
  p.r(18, 15, 2, 2, 0x20e020);
  p.r(9, 18, 6, 2, 0x8a8470);
  p.r(0, 20, 24, 6, 0xc8c0a8).box(0, 20, 24, 6, 0x8a8470);
  for (let x = 2; x < 22; x += 3) p.r(x, 22, 2, 1, 0x555555).r(x, 24, 2, 1, 0x555555);
}

function drawDoor(p) {
  p.r(0, 0, 32, 48, 0x4a3020).r(3, 8, 26, 40, 0x8b5a2b).r(5, 10, 22, 36, 0xa06a35);
  p.box(7, 12, 18, 14, 0x6b4020).box(7, 30, 18, 14, 0x6b4020);
  p.r(23, 28, 3, 3, GOLD);
  p.r(4, 0, 24, 7, 0x0a5a1a).r(5, 1, 22, 5, 0x18a030);
  p.text('EXIT', 8, 1, 0xffffff, 1);
}

export function generateItems(scene) {
  makeTex(scene, TEX.EURO1, 12, 12, (p) => coin(p, 12, false));
  makeTex(scene, TEX.EURO2, 12, 12, (p) => coin(p, 12, true));

  makeTex(scene, TEX.TICKET, 14, 10, (p) => {
    p.r(0, 0, 14, 10, 0x8fd16a).box(0, 0, 14, 10, 0x3a7a20);
    p.r(1, 1, 3, 8, 0xffe060).text('€', 6, 2, 0x1a4a10, 1);
    for (let y = 1; y < 10; y += 2) p.r(4, y, 1, 1, 0x3a7a20);
  });

  makeTex(scene, TEX.COFFEE, 12, 12, (p) => {
    p.r(3, 0, 1, 3, 0xe0e0e0).r(6, 1, 1, 2, 0xe0e0e0);
    p.r(1, 4, 8, 7, 0xffffff).r(2, 4, 6, 2, 0x6b3a1f).box(1, 4, 8, 7, 0xb0b0b0);
    p.r(9, 5, 2, 1, 0xb0b0b0).r(10, 5, 1, 4, 0xb0b0b0).r(9, 8, 2, 1, 0xb0b0b0);
    p.r(0, 11, 11, 1, 0xd0d0d0);
  });

  makeTex(scene, TEX.VACATION, 16, 16, (p) => {
    p.r(0, 12, 16, 4, 0xf0d080).r(0, 12, 16, 1, 0xffe8a0);
    p.disc(13, 3, 2.5, 0xffe000);
    umbrella(p, 1, 0, 1);
    p.r(1, 13, 2, 1, 0x3fa9f5).r(11, 14, 3, 1, 0x3fa9f5);
  });

  makeTex(scene, TEX.WATER, 8, 16, (p) => {
    p.r(2, 0, 4, 2, 0x1e6fd0).r(3, 2, 2, 2, 0xbfe8ff);
    p.r(1, 4, 6, 12, 0x9fdcff).r(1, 4, 6, 1, 0xd8f2ff).r(1, 8, 6, 3, 0x1e6fd0).r(2, 5, 1, 9, 0xffffff);
  });

  makeTex(scene, TEX.LAPTOP, 18, 12, (p) => {
    p.r(2, 0, 14, 9, 0x555a60).r(3, 1, 12, 7, 0x2a8ad4).r(4, 2, 6, 1, 0xffffff).r(4, 4, 8, 1, 0xbfe8ff);
    p.r(0, 9, 18, 3, 0xa0a6ad).r(0, 9, 18, 1, 0xd0d6dc).r(7, 10, 4, 1, 0x555a60);
  });

  makeTex(scene, TEX.SMARTPHONE, 10, 16, (p) => {
    p.r(0, 0, 10, 16, 0x111111).r(1, 2, 8, 11, 0x2a8ad4).r(2, 3, 2, 2, 0x39ff14).r(5, 3, 2, 2, 0xff5050);
    p.r(2, 6, 2, 2, 0xffd000).r(5, 6, 2, 2, 0x5b5fc7).r(4, 14, 2, 1, 0x777777);
  });

  makeTex(scene, TEX.PROMOTION, 16, 16, (p) => {
    // gold star with a tie in the middle
    const star = ['.......##.......', '......####......', '......####......', '.....######.....', '################',
      '.##############.', '...##########...', '....########....', '....########....', '...##########...',
      '...####..####...', '..###......###..', '..##........##..', '.##..........##.', '................', '................'];
    p.grid(star, { '#': GOLD }, 0, 0, 1);
    p.r(7, 3, 2, 1, GOLD_L).r(7, 5, 2, 1, 0xc00000).r(6, 6, 4, 4, 0xc00000).r(7, 10, 2, 1, 0xc00000);
  });

  makeTex(scene, TEX.RAISE, 16, 16, (p) => {
    p.r(0, 0, 16, 16, 0x0a3a14).box(0, 0, 16, 16, 0x39ff14);
    for (let i = 0; i < 6; i++) p.r(7 - i, 2 + i, 2 + i * 2, 1, 0x39ff14);
    p.r(5, 8, 6, 6, 0x39ff14).text('€', 6.5, 8.5, 0x0a3a14, 1);
  });

  makeTex(scene, TEX.CAR, 26, 14, (p) => {
    p.r(6, 1, 12, 5, 0xc01818).r(8, 2, 4, 3, 0xbfe8ff).r(13, 2, 4, 3, 0xbfe8ff);
    p.r(1, 5, 24, 5, 0xe02020).r(1, 5, 24, 1, 0xff6060).r(22, 6, 3, 2, 0xffffa0).r(1, 6, 2, 2, 0xff8080);
    p.disc(6, 10.5, 3, 0x111111).disc(20, 10.5, 3, 0x111111).r(5, 9, 2, 2, 0x999999).r(19, 9, 2, 2, 0x999999);
  });

  makeTex(scene, TEX.TERMINAL, 24, 26, drawTerminal);
  makeTex(scene, TEX.DOOR_EXIT, 32, 48, drawDoor);

  makeTex(scene, TEX.BEACH_FLAG, 16, 32, (p) => {
    p.r(7, 6, 2, 26, 0xc0c0c0).r(7, 6, 1, 26, 0xffffff);
    umbrella(p, 1, 0, 1);
    p.r(0, 30, 16, 2, 0xf0d080);
  });

  // --- HUD icons 12x12
  makeTex(scene, TEX.UI_BRAIN, 12, 12, (p) => {
    p.disc(6, 6, 5.5, 0xff8fb5).disc(6, 6, 4, 0xffb0cc);
    p.r(6, 1, 1, 10, 0xc04070).r(2, 4, 3, 1, 0xc04070).r(7, 7, 3, 1, 0xc04070).r(3, 8, 2, 1, 0xc04070);
  });
  makeTex(scene, TEX.UI_STRESS, 12, 12, (p) => {
    // lightning bolt
    p.grid(['....###.', '...###..', '..###...', '.######.', '...###..', '..###...', '.##.....', '#.......'],
      { '#': 0xffd000 }, 2, 1, 1);
    p.r(0, 11, 12, 1, 0xff3030);
  });
  makeTex(scene, TEX.UI_EURO, 12, 12, (p) => coin(p, 12, false));
  makeTex(scene, TEX.UI_TICKET, 12, 12, (p) => {
    p.r(0, 2, 12, 8, 0x8fd16a).box(0, 2, 12, 8, 0x3a7a20).r(1, 3, 2, 6, 0xffe060).text('€', 5, 3.5, 0x1a4a10, 1);
  });
  makeTex(scene, TEX.UI_VACATION, 12, 12, (p) => {
    p.r(0, 9, 12, 3, 0xf0d080);
    umbrella(p, 0, 0, 1);
  });
  makeTex(scene, TEX.UI_CLOCK, 12, 12, (p) => {
    p.disc(6, 6, 6, 0x222222).disc(6, 6, 5, 0xffffff).r(5.5, 2, 1, 4, 0x111111).r(6, 5.5, 3, 1, 0x111111);
  });
}
