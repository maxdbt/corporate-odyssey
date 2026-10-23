// Trip finale textures (NegotiationScene): the client of each ground leg, the themed consultants, the bosses,
// their projectiles, and the rooms (temple / ice temple / undersea palace) drawn straight into the scene.
import Phaser from 'phaser';
import { makeTex } from './painter.js';
import { TEX, GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

const SKIN = 0xf1c27d;
const TAN = 0xc8955a;
const GOLD = 0xd4af37;
const LAPIS = 0x2a5ad0;

// Consultant's head (slick hair, glasses), shared by the three outfits.
function consultantHead(p, mask = false) {
  p.r(7, 0, 10, 4, 0x2a1a0a).r(6, 1, 2, 4, 0x2a1a0a).r(7, 3, 10, 9, SKIN).r(16, 1, 2, 2, 0x2a1a0a);
  if (mask) {
    p.r(6, 5, 12, 5, 0x222222).r(7, 6, 10, 3, 0x9be7ff).r(8, 6, 2, 1, 0xffffff).r(17, 0, 2, 8, 0xffd800).r(16, 0, 3, 2, 0xff7a20);
  } else {
    p.r(7, 6, 4, 3, 0x111111).r(13, 6, 4, 3, 0x111111).r(11, 7, 2, 1, 0x111111).r(8, 7, 2, 1, 0x9be7ff).r(14, 7, 2, 1, 0x9be7ff);
  }
  p.r(10, 10, 4, 1, 0xa05a3a);
}

function consultants(scene) {
  // Desert: jacket and tie on top, white Egyptian kilt with a gold pendant below, bare legs and sandals.
  ['cons_egypt1', 'cons_egypt2'].forEach((key, f) => makeTex(scene, key, 24, 32, (p) => {
    consultantHead(p);
    p.r(5, 12, 14, 8, 0x5a6270).r(10, 12, 4, 6, 0xffffff).r(11, 13, 2, 6, 0x2a6ad8).r(5, 12, 14, 1, 0x7a8290);
    p.r(3, 13, 3, 7, 0x5a6270).r(18, 13, 3, 7, 0x5a6270).r(3, 20, 3, 2, SKIN).r(19, 15, 5, 7, 0x1a1a1a).r(20, 16, 3, 5, 0x5ab4ff);
    p.r(5, 20, 14, 4, 0xf4f0e0).r(4, 23, 16, 4, 0xf4f0e0).r(5, 20, 14, 1, GOLD);
    p.r(10, 21, 4, 5, GOLD).r(11, 22, 2, 1, LAPIS).r(11, 24, 2, 1, LAPIS).r(9, 26, 6, 1, GOLD);
    if (f) p.r(6, 27, 4, 3, SKIN).r(14, 27, 4, 2, SKIN).r(5, 30, 6, 2, 0x8a5a2a).r(14, 29, 6, 2, 0x8a5a2a);
    else p.r(7, 27, 3, 3, SKIN).r(14, 27, 3, 3, SKIN).r(6, 30, 5, 2, 0x8a5a2a).r(13, 30, 5, 2, 0x8a5a2a);
  }));
  // Glacier: heavy brown coat down to the knees, fur collar, red scarf, gloves and boots.
  ['cons_coat1', 'cons_coat2'].forEach((key, f) => makeTex(scene, key, 24, 32, (p) => {
    consultantHead(p);
    p.r(4, 12, 16, 15, 0x6a4a2a).r(4, 12, 16, 2, 0xe8e0d0).r(4, 19, 16, 1, 0x4a3018).r(11, 14, 2, 13, 0x5a3a1a);
    [15, 18, 22].forEach((y) => p.r(13, y, 1, 1, 0x2a1a0a));
    p.r(7, 11, 10, 2, 0xc0392b).r(14, 12, 3, 7, 0xc0392b).r(14, 18, 3, 1, 0xffd800);
    p.r(2, 13, 3, 10, 0x6a4a2a).r(19, 13, 3, 10, 0x6a4a2a).r(2, 23, 3, 2, 0x222222).r(19, 23, 3, 2, 0x222222);
    if (f) p.r(6, 27, 4, 3, 0x3a404a).r(14, 27, 4, 2, 0x3a404a).r(5, 29, 6, 3, 0x1a1a1a).r(14, 28, 6, 3, 0x1a1a1a);
    else p.r(7, 27, 4, 2, 0x3a404a).r(13, 27, 4, 2, 0x3a404a).r(6, 29, 6, 3, 0x1a1a1a).r(13, 29, 6, 3, 0x1a1a1a);
  }));
  // Sea: grey suit with diving mask, snorkel and fins.
  ['cons_diver1', 'cons_diver2'].forEach((key, f) => makeTex(scene, key, 24, 32, (p) => {
    consultantHead(p, true);
    p.r(5, 12, 14, 11, 0x5a6270).r(10, 12, 4, 6, 0xffffff).r(11, 13, 2, 6, 0x2a6ad8).r(5, 12, 14, 1, 0x7a8290);
    p.r(3, 13, 3, 8, 0x5a6270).r(18, 13, 3, 8, 0x5a6270).r(19, 15, 5, 7, 0x1a1a1a).r(20, 16, 3, 5, 0x5ab4ff);
    if (f) p.r(6, 23, 5, 6, 0x3a404a).r(13, 23, 5, 4, 0x3a404a).r(3, 29, 9, 3, 0x1a5ad0).r(14, 27, 9, 3, 0x1a5ad0);
    else p.r(7, 23, 4, 6, 0x3a404a).r(13, 23, 4, 6, 0x3a404a).r(4, 29, 8, 3, 0x1a5ad0).r(13, 29, 8, 3, 0x1a5ad0);
  }));
}

function clients(scene) {
  // Pharaoh 32x40: striped nemes, cobra, false beard, gold collar, crook and flail, white kilt.
  makeTex(scene, 'client_pharaoh', 32, 40, (p) => {
    for (let y = 4; y < 18; y++) p.r(6, y, 20, 1, y % 2 ? GOLD : LAPIS);
    for (let y = 0; y < 6; y++) p.r(9, y, 14, 1, y % 2 ? GOLD : LAPIS);
    p.r(11, 5, 10, 11, TAN).r(15, 1, 2, 3, GOLD).r(15, 0, 2, 1, 0x3ca03c);
    p.r(12, 8, 3, 1, 0x111111).r(17, 8, 3, 1, 0x111111).r(11, 8, 1, 1, 0x111111).r(20, 8, 1, 1, 0x111111);
    p.r(16, 10, 1, 3, 0xa8753a).r(14, 14, 4, 1, 0x8a4a2a).r(15, 16, 2, 4, 0x3a3a7a).r(15, 17, 2, 1, GOLD);
    [GOLD, LAPIS, 0xd02020, GOLD].forEach((c, i) => p.r(7, 18 + i, 18, 1, c));
    p.r(9, 22, 14, 8, TAN).r(8, 24, 16, 3, TAN);
    p.r(10, 17, 2, 12, GOLD).r(8, 16, 4, 2, GOLD).r(8, 18, 2, 1, GOLD);
    p.r(21, 18, 2, 11, GOLD).r(23, 18, 3, 1, LAPIS).r(23, 20, 3, 1, GOLD).r(23, 22, 3, 1, LAPIS);
    p.r(9, 30, 14, 7, 0xf4f0e0).r(9, 30, 14, 2, GOLD).r(14, 32, 4, 5, GOLD).r(15, 33, 2, 1, LAPIS);
    p.r(11, 37, 3, 3, TAN).r(18, 37, 3, 3, TAN);
  });
  // Emperor penguin 32x40 with glasses and a red tie.
  makeTex(scene, 'client_penguin', 32, 40, (p) => {
    const B = 0x1a1a2a;
    p.disc(16, 24, 11, B).disc(16, 9, 8, B).disc(16, 27, 8, 0xffffff).r(11, 17, 10, 12, 0xffffff);
    p.r(8, 9, 3, 5, 0xffc020).r(21, 9, 3, 5, 0xffc020);
    p.r(12, 6, 3, 3, 0xffffff).r(17, 6, 3, 3, 0xffffff).r(13, 7, 1, 1, 0x111111).r(18, 7, 1, 1, 0x111111);
    p.box(11, 5, 5, 5, 0xd4af37).box(16, 5, 5, 5, 0xd4af37);
    p.r(14, 11, 4, 2, 0xff8a20).r(15, 13, 2, 1, 0xd06a10);
    p.r(15, 17, 2, 2, 0xd02020).r(14, 19, 4, 8, 0xd02020).r(15, 27, 2, 1, 0xd02020);
    p.r(4, 18, 3, 11, B).r(25, 18, 3, 11, B);
    p.r(9, 35, 6, 3, 0xffa000).r(17, 35, 6, 3, 0xffa000);
  });
  // Little mermaid 32x40: long red hair, starfish clip, shell top, a contract in hand, green tail.
  makeTex(scene, 'client_mermaid', 32, 40, (p) => {
    const H = 0xd03a20;
    p.disc(16, 8, 8, H).r(7, 8, 5, 17, H).r(20, 8, 5, 17, H);
    p.r(12, 5, 8, 9, SKIN).r(13, 8, 2, 2, 0x2a8a5a).r(17, 8, 2, 2, 0x2a8a5a).r(15, 12, 2, 1, 0xd05050);
    p.r(9, 3, 3, 1, 0xffd800).r(10, 2, 1, 3, 0xffd800);
    p.r(12, 14, 8, 8, SKIN).r(12, 16, 3, 3, 0xb070e0).r(17, 16, 3, 3, 0xb070e0);
    p.r(10, 15, 2, 7, SKIN).r(20, 15, 2, 6, SKIN).r(21, 18, 5, 6, 0xffffff).r(22, 19, 3, 1, 0x333333).r(22, 21, 2, 1, 0x333333);
    const T = 0x2aa070;
    p.r(12, 22, 8, 6, T).r(13, 28, 8, 5, T).r(15, 33, 8, 3, T).r(20, 35, 5, 2, T);
    p.r(22, 31, 6, 3, 0x5ad0a0).r(24, 36, 6, 3, 0x5ad0a0).r(12, 22, 8, 1, 0xffd800);
    [[14, 24], [17, 26], [15, 29], [18, 31], [17, 34]].forEach(([x, y]) => p.r(x, y, 2, 1, 0x1a7a50));
  });
}

function bosses(scene) {
  // Mummy 32x44, the super consultant: bandages, glowing eyes, a red tie. Frame 1 = casting (arms up).
  ['boss_mummy1', 'boss_mummy2'].forEach((key, f) => makeTex(scene, key, 32, 44, (p) => {
    const W = 0xe8e0c8, D = 0xb8ae90, G = 0x7CFC00;
    p.r(10, 0, 12, 12, W).r(11, 4, 10, 4, 0x3a3020).r(12, 5, 3, 2, G).r(17, 5, 3, 2, G);
    [2, 9].forEach((y) => p.r(10, y, 12, 1, D));
    p.r(8, 12, 16, 16, W);
    for (let y = 13; y < 28; y += 3) p.r(8, y, 16, 1, D);
    p.r(15, 12, 2, 2, 0xd02020).r(14, 14, 4, 8, 0xd02020);
    if (f) {
      p.r(24, 2, 3, 12, W).r(5, 2, 3, 12, W).r(24, 0, 3, 3, G).r(5, 0, 3, 3, G);
    } else {
      p.r(24, 14, 8, 3, W).r(24, 19, 8, 3, W).r(26, 15, 1, 1, D).r(28, 20, 1, 1, D);
    }
    p.r(6, 20, 2, 9, W).r(5, 28, 2, 3, D);
    p.r(10, 28, 5, 16, W).r(17, 28, 5, 16, W);
    for (let y = 30; y < 44; y += 3) p.r(10, y, 12, 1, D);
  }));
  // Polar bear 36x44 in a dark suit, white shirt and red tie. Frame 1 = throwing (right arm up with a fish).
  ['boss_bear1', 'boss_bear2'].forEach((key, f) => makeTex(scene, key, 36, 44, (p) => {
    const Wh = 0xf4f4f0, Sh = 0xd8dcd8, S = 0x2a2a3a;
    p.disc(11, 4, 3, Wh).disc(25, 4, 3, Wh).r(10, 3, 2, 2, Sh).r(24, 3, 2, 2, Sh);
    p.disc(18, 10, 8, Wh).r(14, 11, 8, 5, Sh).r(17, 11, 2, 2, 0x111111).r(17, 14, 2, 1, 0x555555);
    p.r(13, 7, 2, 2, 0x111111).r(21, 7, 2, 2, 0x111111);
    p.r(8, 18, 20, 16, S).r(15, 18, 6, 8, 0xffffff).r(17, 19, 2, 9, 0xd02020).r(14, 18, 1, 9, 0x1a1a2a).r(21, 18, 1, 9, 0x1a1a2a);
    p.r(4, 19, 4, 12, S).r(4, 31, 4, 3, Wh);
    if (f) p.r(28, 8, 4, 12, S).r(28, 5, 4, 3, Wh).r(27, 1, 8, 4, 0x7a8a6a);
    else p.r(28, 19, 4, 12, S).r(28, 31, 4, 3, Wh);
    p.r(10, 34, 7, 8, S).r(19, 34, 7, 8, S).r(9, 41, 8, 3, Wh).r(19, 41, 8, 3, Wh);
  }));
  // Giant octopus 48x44 with a tie; the tentacles wave between the two frames.
  ['boss_octopus1', 'boss_octopus2'].forEach((key, f) => makeTex(scene, key, 48, 44, (p) => {
    const P = 0x9a3ab0, PD = 0x6a2080;
    for (let i = 0; i < 6; i++) {
      const x0 = 3 + i * 7;
      for (let y = 22; y < 44; y++) {
        const dx = Math.round(Math.sin((y + f * 4 + i * 3) / 3) * 2);
        p.r(x0 + dx, y, 5, 1, P);
        if (y % 4 === 0) p.r(x0 + dx + 1, y, 2, 1, 0xe8a0f0);
      }
    }
    p.disc(24, 14, 13, P).disc(19, 8, 4, 0xc070d0);
    p.disc(18, 17, 4, 0xffffff).disc(30, 17, 4, 0xffffff).r(19, 17, 2, 3, 0x111111).r(29, 17, 2, 3, 0x111111);
    p.r(13, 11, 8, 2, PD).r(27, 11, 8, 2, PD);
    p.r(21, 24, 6, 2, 0xffffff).r(23, 25, 2, 2, 0xd02020).r(22, 27, 4, 8, 0xd02020);
  }));
}

function projectiles(scene) {
  // Ancient curse: a glowing purple orb.
  makeTex(scene, 'curse_orb', 18, 18, (p) => {
    p.disc(9, 9, 9, 0xc070ff, 0.35).disc(9, 9, 6, 0xd8a0ff).disc(9, 9, 3.5, 0xffffff);
  });
  // Pesce padulo (bad-luck fish), facing left: grey-green, sad mouth, black spots.
  makeTex(scene, 'fish_padulo', 22, 10, (p) => {
    p.r(4, 2, 14, 6, 0x7a8a6a).r(3, 3, 2, 4, 0x7a8a6a).r(5, 6, 12, 2, 0xb0b890).r(8, 1, 7, 1, 0x5a6a4a);
    p.r(18, 3, 2, 4, 0x5a6a4a).r(20, 1, 2, 8, 0x5a6a4a);
    p.r(6, 3, 2, 2, 0xffffff).r(6, 4, 1, 1, 0x111111).r(2, 6, 2, 1, 0x3a3a2a);
    p.r(10, 3, 2, 2, 0x2a2a2a).r(14, 5, 1, 1, 0x2a2a2a).r(13, 3, 1, 1, 0x2a2a2a);
  });
  makeTex(scene, 'crab', 18, 12, (p) => {
    p.r(4, 4, 10, 5, 0xd03a20).r(5, 3, 8, 1, 0xff6a40).r(0, 1, 4, 4, 0xd03a20).r(14, 1, 4, 4, 0xd03a20).r(1, 1, 1, 2, 0xffffff);
    p.r(6, 1, 1, 3, 0x111111).r(11, 1, 1, 3, 0x111111);
    [[3, 9, 3], [6, 9, 2], [11, 9, 2], [14, 9, 3]].forEach(([x, y, h]) => p.r(x, y, 1, h, 0xa02a10));
  });
  makeTex(scene, 'shell', 14, 12, (p) => {
    p.disc(7, 7, 5, 0xf0c8a0).ring(7, 7, 3, 1, 0xc08a60).r(10, 1, 3, 3, 0xf0c8a0).r(2, 8, 4, 3, 0xff9ab0);
  });
}

export function generateClients(scene) {
  consultants(scene);
  clients(scene);
  bosses(scene);
  projectiles(scene);
}

// ---------------------------------------------------------------- rooms

const FLOOR_Y = 410;

function temple(scene, g) {
  const W = GAME_WIDTH;
  g.fillStyle(0xd8b878).fillRect(0, 0, W, GAME_HEIGHT);
  g.fillStyle(0xb8904a).fillRect(0, 30, W, 18);
  for (let x = 0; x < W; x += 24) g.fillStyle(x % 48 ? LAPIS : 0xd02020).fillRect(x + 4, 36, 14, 6);
  // Hieroglyph bands
  const glyphs = [
    (x, y) => g.fillRect(x + 3, y, 4, 4).fillRect(x + 4, y + 4, 2, 8).fillRect(x, y + 6, 10, 2),         // ankh
    (x, y) => g.fillRect(x, y + 4, 10, 4).fillRect(x + 3, y + 3, 4, 6).fillRect(x + 6, y + 8, 2, 4),       // eye
    (x, y) => g.fillRect(x + 2, y, 4, 4).fillRect(x, y + 4, 8, 4).fillRect(x + 6, y + 7, 4, 2).fillRect(x + 2, y + 8, 2, 4), // bird
    (x, y) => g.fillRect(x, y + 2, 10, 2).fillRect(x + 1, y + 6, 8, 2).fillRect(x + 2, y + 10, 6, 2)       // water
  ];
  g.fillStyle(0x6a4a2a);
  for (let row = 0; row < 4; row++) {
    for (let x = 70, k = row; x < W - 70; x += 22, k++) {
      if (x > 250 && x < 550 && row < 3) continue;
      glyphs[k % 4](x, 70 + row * 34);
    }
  }
  // Columns with papyrus capitals
  [28, 226, 574, 772].forEach((cx) => {
    g.fillStyle(0xc8a060).fillRect(cx - 18, 60, 36, FLOOR_Y - 60);
    g.fillStyle(0xb08a4a).fillRect(cx - 18, 60, 6, FLOOR_Y - 60);
    for (let y = 120; y < FLOOR_Y; y += 70) g.fillStyle(LAPIS).fillRect(cx - 18, y, 36, 4).fillStyle(0xd02020).fillRect(cx - 18, y + 4, 36, 3);
    g.fillStyle(0x3ca03c).fillRect(cx - 26, 50, 52, 12).fillStyle(GOLD).fillRect(cx - 26, 48, 52, 3).fillRect(cx - 26, 62, 52, 3);
  });
  // Torches
  [130, 670].forEach((tx) => {
    g.fillStyle(0x6a4a2a).fillRect(tx - 3, 210, 6, 26).fillStyle(GOLD).fillRect(tx - 8, 204, 16, 6);
    const flame = scene.add.rectangle(tx, 196, 10, 14, 0xff9a20);
    scene.add.rectangle(tx, 200, 5, 7, 0xffe060);
    scene.tweens.add({ targets: flame, scaleY: 1.35, scaleX: 0.8, duration: 160, yoyo: true, repeat: -1 });
  });
  // Throne behind the client
  g.fillStyle(GOLD).fillRect(GAME_WIDTH / 2 - 44, 60, 88, 84).fillStyle(LAPIS).fillRect(GAME_WIDTH / 2 - 34, 70, 68, 70);
  g.fillStyle(GOLD).fillRect(GAME_WIDTH / 2 - 4, 54, 8, 8);
  // Stone floor
  g.fillStyle(0xa08050).fillRect(0, FLOOR_Y, W, GAME_HEIGHT - FLOOR_Y);
  for (let x = 0; x < W; x += 64) g.fillStyle(0x8a6a40).fillRect(x, FLOOR_Y, 2, GAME_HEIGHT - FLOOR_Y);
  g.fillStyle(0x8a6a40).fillRect(0, FLOOR_Y + 20, W, 2);
  return { desk: [0xb8904a, GOLD], label: '#ffd800' };
}

function iceTemple(scene, g) {
  const W = GAME_WIDTH;
  g.fillStyle(0xcfe8f8).fillRect(0, 0, W, GAME_HEIGHT);
  for (let y = 30, row = 0; y < FLOOR_Y; y += 24, row++) {
    g.fillStyle(0xa8d0ec).fillRect(0, y, W, 2);
    for (let x = row % 2 ? 20 : 0; x < W; x += 40) g.fillRect(x, y, 2, 24);
  }
  // Windows with the aurora
  [[40, 70], [620, 70]].forEach(([x, y]) => {
    g.fillStyle(0x0a1a3a).fillRect(x, y, 140, 90);
    g.fillStyle(0x3cf0a0, 0.7).fillRect(x, y + 30, 140, 10).fillStyle(0x60a0ff, 0.6).fillRect(x, y + 42, 140, 6);
    g.fillStyle(0xffffff).fillRect(x + 20, y + 14, 2, 2).fillRect(x + 90, y + 8, 2, 2).fillRect(x + 120, y + 60, 2, 2);
    g.lineStyle(6, 0xe8f6ff).strokeRect(x, y, 140, 90);
  });
  // Ice columns
  [226, 574].forEach((cx) => {
    g.fillStyle(0xe8f6ff).fillRect(cx - 18, 50, 36, FLOOR_Y - 50);
    g.fillStyle(0xffffff).fillRect(cx - 12, 50, 5, FLOOR_Y - 50);
    g.fillStyle(0xa8d0ec).fillRect(cx + 10, 50, 4, FLOOR_Y - 50);
    g.fillStyle(0xbfe4fa).fillRect(cx - 26, 44, 52, 10).fillRect(cx - 26, FLOOR_Y - 10, 52, 10);
  });
  // Icicles along the ceiling
  g.fillStyle(0xe8f6ff);
  for (let x = 6; x < W; x += 26) {
    const h = 8 + ((x * 7) % 18);
    for (let i = 0; i < h; i += 2) g.fillRect(x + i / 4, 30 + i, Math.max(2, 10 - i / 2), 2);
  }
  // Ice throne
  g.fillStyle(0xbfe4fa).fillRect(GAME_WIDTH / 2 - 44, 60, 88, 84).fillStyle(0xe8f6ff).fillRect(GAME_WIDTH / 2 - 34, 70, 68, 70);
  g.fillStyle(0xffffff).fillRect(GAME_WIDTH / 2 - 30, 74, 6, 60);
  scene.add.particles(0, 0, TEX.FX_SNOW, {
    x: { min: 0, max: W }, y: 30, speedY: { min: 20, max: 50 }, speedX: { min: -10, max: 10 }, lifespan: 9000, frequency: 160, alpha: { start: 0.9, end: 0.3 }
  });
  g.fillStyle(0xa8d8f0).fillRect(0, FLOOR_Y, W, GAME_HEIGHT - FLOOR_Y);
  g.fillStyle(0xe8f6ff).fillRect(0, FLOOR_Y, W, 3);
  for (let x = 30; x < W; x += 110) g.fillStyle(0xffffff, 0.7).fillRect(x, FLOOR_Y + 14, 40, 2);
  return { desk: [0xbfe4fa, 0xe8f6ff], label: '#2a6ad8' };
}

function seaPalace(scene, g) {
  const W = GAME_WIDTH;
  for (let i = 0; i < 12; i++) {
    const col = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x0a3a7a), Phaser.Display.Color.ValueToColor(0x1a7ac8), 11, i);
    g.fillStyle(Phaser.Display.Color.GetColor(col.r, col.g, col.b)).fillRect(0, i * 38, W, 38);
  }
  // Light rays from the surface
  [120, 330, 560, 700].forEach((x, i) => g.fillStyle(0xffffff, 0.06).fillPoints([
    { x, y: 30 }, { x: x + 40, y: 30 }, { x: x + 120 + i * 10, y: FLOOR_Y }, { x: x + 40 + i * 10, y: FLOOR_Y }], true));
  // Coral pillars
  [36, 764].forEach((cx) => {
    g.fillStyle(0xff7a8a).fillRect(cx - 16, 60, 32, FLOOR_Y - 60);
    for (let y = 80; y < FLOOR_Y; y += 40) g.fillStyle(0xd05060).fillCircle(cx - 16, y, 7).fillCircle(cx + 16, y + 20, 7);
    g.fillStyle(0xffb0b8).fillRect(cx - 8, 60, 4, FLOOR_Y - 60);
  });
  // Shell throne (a fan of discs) behind the mermaid
  for (let i = -3; i <= 3; i++) g.fillStyle(i % 2 ? 0xf0b8d0 : 0xe890b8).fillCircle(GAME_WIDTH / 2 + i * 13, 96 - Math.abs(i) * -4, 18);
  g.fillStyle(0xf8e0ec).fillCircle(GAME_WIDTH / 2, 120, 22);
  // Sand floor, seaweed, bubbles
  g.fillStyle(0xd8c890).fillRect(0, FLOOR_Y, W, GAME_HEIGHT - FLOOR_Y);
  for (let x = 10; x < W; x += 37) g.fillStyle(0xc0b078).fillRect(x, FLOOR_Y + 8 + (x % 3) * 8, 6, 2);
  [90, 170, 300, 520, 650, 720].forEach((x) => scene.add.image(x, FLOOR_Y, TEX.SEAWEED).setOrigin(0.5, 1).setScale(2));
  scene.add.particles(0, 0, TEX.FX_BUBBLE, {
    x: { min: 0, max: W }, y: FLOOR_Y, speedY: { min: -60, max: -25 }, speedX: { min: -8, max: 8 }, lifespan: 7000, frequency: 220, alpha: { start: 0.8, end: 0.2 }
  });
  return { desk: [0xe8a0c0, 0xf8d0e0], label: '#ffffff', clam: true };
}

const ROOMS = { temple, ice: iceTemple, sea: seaPalace };

// Draws the room of `theme` and the client behind the desk. Returns the client image and the desk label colour.
export function drawRoom(scene, theme) {
  const g = scene.add.graphics();
  const look = ROOMS[theme.room](scene, g);
  const cx = GAME_WIDTH / 2;
  const client = scene.add.image(cx, 150, theme.client).setOrigin(0.5, 1).setScale(3);
  const d = scene.add.graphics();
  d.fillStyle(look.desk[0]).fillRect(cx - 130, 140, 260, 40).fillStyle(look.desk[1]).fillRect(cx - 130, 140, 260, 6);
  if (look.clam) {
    for (let x = cx - 120; x < cx + 130; x += 20) d.fillStyle(0xc87aa0).fillRect(x, 148, 2, 32);
    d.fillStyle(0xffffff).fillCircle(cx + 100, 136, 6);
  }
  return { client, labelColor: look.label };
}
