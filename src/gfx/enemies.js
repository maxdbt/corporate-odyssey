// Enemy and boss sprites.
import { makeTex, gridTex } from './painter.js';
import { TEX } from '../config/constants.js';

const SK = 0xf1c27d;

const G = {
  talker: {
    pal: { H: 0x8a9597, S: SK, E: 0x111111, M: 0x6b3e1f, O: 0x3a0a0a, G: 0x27ae60, C: 0xb7950b, B: 0x2b2b2b },
    top: [
      '....HHHH....',
      '...HHHHHH...',
      '...SSSSSS...',
      '...SSESSE...',
      '...SSMMMM...'
    ],
    mouthOpen: '...SSSOOS...',
    mouthShut: '...SSSSSS...',
    body: [
      '..GGGGGGGG..',
      '.GGGGGGGGGG.',
      '.GGGGGGGGGG.',
      '.SGGGGGGGGS.'
    ],
    legs1: ['..CCCCCCCC..', '..CCCCCCCC..', '.CCC....CCC.', '.CCC....CCC.', 'CCC......CCC', 'BBB......BBB'],
    legs2: ['..CCCCCCCC..', '...CCCCCC...', '....CCCC....', '....CCCC....', '....CCCC....', '...BBBBBB...']
  },
  party: {
    pal: { R: 0xe74c3c, Y: 0xffd800, S: SK, E: 0x111111, O: 0x5a0a0a, U: 0xff6fb5, F: 0xffffff, N: 0x34495e, B: 0x111111 },
    f1: [
      '.....RR.....',
      '....YYYY....',
      '...RRRRRR...',
      '...SSSSSS...',
      '...SSESSE...',
      '...SSSOOS...',
      '..UUFUUFUU..',
      '.UUUUUUUUUU.',
      '.UFUUFUUFUU.',
      '.SUUUUUUUUS.',
      '..NNNNNNNN..', '..NNNNNNNN..', '..NNN..NNN..', '..NNN..NNN..', '..NNN..NNN..', '.BBBB..BBBB.'
    ],
    f2: [
      '.....RR.....',
      '....YYYY....',
      '...RRRRRR...',
      '...SSSSSS...',
      '...SSESSE...',
      'S..SSSOOS..S',
      'U.UUFUUFUU.U',
      '.UUUUUUUUUU.',
      '.UFUUFUUFUU.',
      '.UUUUUUUUUU.',
      '..NNNNNNNN..', '...NNNNNN...', '..NNN..NNN..', '.NNN....NNN.', '.NNN....NNN.', 'BBBB....BBBB'
    ]
  },
  guardian: {
    pal: { A: 0x95a5a6, V: 0x2c2c3a, R: 0xff2020, S: SK, K: 0x111118, W: 0xffffff, B: 0xc0392b, Y: 0xd4af37 },
    top: [
      '...AAAAAA...',
      '..AAAAAAAA..',
      '..AVVVVVVA..',
      '..AVVRVVRA..',
      '..ASSSSSSA..',
      '...SSSSSS...',
      '..KKKWWKKK..',
      '.AKKWBBWKKA.',
      '.AKKKWWKKKA.',
      '.KKKKWYKKKK.',
      '.SKKKKKKKKS.',
      '..KKKKKKKK..'
    ],
    legs1: ['..KKK..KKK..', '..KKK..KKK..', '..KKK..KKK..', '..KKK..KKK..', '.AAAA..AAAA.'],
    legs2: ['..KKK..KKK..', '.KKK....KKK.', '.KKK....KKK.', 'KKK......KKK', 'AAA......AAA']
  },
  cook: {
    pal: { W: 0xffffff, G: 0xd0d0d0, S: 0xe8a07a, E: 0x111111, D: 0x333333, N: 0x7f8c8d, B: 0x111111, R: 0xb03020 },
    top: [
      '...WWWWWW...',
      '..WWWWWWWW..',
      '..WGWWWGWW..',
      '...WWWWWW...',
      '...SEESEE...',
      '...SSESSE...'
    ],
    mouth1: '...SSSRRS...',
    mouth2: 'S..SSRRRS..S',
    body1: ['..WWWWWWWW..', '.WWWWDWWWWW.', '.WWWWWWWWWW.', '.SWWWDWWWWS.', '..WWWWWWWW..'],
    body2: ['W.WWWWWWWW.W', '.WWWWDWWWWW.', '.WWWWWWWWWW.', '.WWWWDWWWWW.', '..WWWWWWWW..'],
    legs: ['..NNNNNNNN..', '..NNN..NNN..', '..NNN..NNN..', '..NNN..NNN..', '.BBBB..BBBB.']
  },
  confcall: {
    pal: { K: 0x222222, C: 0x555566, L: 0x9999aa, M: 0x333333, O: 0xff3030, Y: 0x7fd4ff },
    f1: [
      '..KKKKKK..',
      '.K......K.',
      'K........K',
      'CC......CC',
      'CL......LC',
      'CC......CC',
      '.CM.......',
      '...MMO....'
    ],
    f2: [
      '..KKKKKK..',
      '.K.Y..Y.K.',
      'K..Y..Y..K',
      'CC......CC',
      'CL......LC',
      'CC......CC',
      '.CM.......',
      '...MMMO...'
    ]
  },
  clienthell: {
    pal: { O: 0x5a0000, R: 0xd02020, Y: 0xffe000, K: 0x111111, W: 0xffffff, D: 0x222233, T: 0xff8800 },
    rows: [
      '..O......O..',
      '..OO....OO..',
      '...RRRRRR...',
      '..RRRRRRRR..',
      '..RYYRRYYR..',
      '..RRRRRRRR..',
      '..RKKKKKKR..',
      '...RWKKWR...',
      '....RRRR....',
      '..DDDWWDDD..',
      '.DDDDTTDDDD.',
      '.DDDDTTDDDD.',
      '.RDDDTTDDDR.',
      '.DDDDDDDDDD.'
    ]
  },
  minute: {
    pal: { Y: 0xffc800, K: 0x111111, W: 0xffffff, E: 0x111111, R: 0xe02020 },
    top: [
      '.Y......Y.',
      'YYKKKKKKYY',
      '.KWWWWWWK.',
      'KWWWEWWEWK',
      'KWWWKWWWWK',
      'KWWWKKKWWK',
      'KWWWRRRRWK',
      '.KWWWWWWK.',
      '..KKKKKK..'
    ],
    legs1: ['..K....K..', '.KK....KK.'],
    legs2: ['.K......K.', 'KK......KK']
  },
  bug: {
    pal: { G: 0x39ff14, K: 0x111111, W: 0xffffff, M: 0xff00ff },
    f1: ['.K....K.', '..GGGG..', '.GGWGGW.', 'GGGMGGGG', '.GKGGKG.', 'K.K..K.K'],
    f2: ['K......K', '..GGGG..', '.GGWGGW.', 'GGGGGMGG', '.GKGGKG.', '.K.KK.K.']
  },
  waterella: {
    pal: { L: 0x1b4f9c, B: 0x3fa9f5, D: 0x2070c0, W: 0xffffff, K: 0x0a1030, C: 0xbfe8ff },
    body: [
      '.......LL.......',
      '......LBBL......',
      '.....LBBCBL.....',
      '....LBBBCBBL....',
      '...LBBBBBBBBL...',
      '..LBBWWBBWWBBL..',
      '..LBBWKBBWKBBL..',
      '.LBBBBBBBBBBBBL.',
      '.LBBBKKKKKKBBBL.',
      '.LBBKWKWKWKBBBL.',
      '.LBBBKKKKKKBBBL.',
      'LBBBBBBBBBBBBBBL',
      'LBBBDBBBBBBDBBBL',
      'LBBBBBBBBBBBBBBL',
      'LBBDBBBBBBBBDBBL',
      'LBBBBBBBBBBBBBBL',
      '.LBBBBBBBBBBBBL.'
    ],
    drip1: ['L.LBB.LBBL.BBL.L', '.L.L...LL...L.L.', '..........L.....'],
    drip2: ['.LBBL.BBL.LBBL..', '..L.L..L.L..L.L.', '....L.......L...']
  },
  shark: {
    pal: { G: 0x7f8c99, E: 0x111111, N: 0x1f2a44, W: 0xffffff, T: 0xc0392b, L: 0xb8c4cc },
    f1: [
      '..........G...........',
      '.........GG...........',
      '........GGG...........',
      'G....GGGGGGGGGGGG.....',
      'GG.GGGGGGGGGGGGGGGG...',
      '.GGGGGGGGGGGGGGGEGGG..',
      '.GGGGNNNNWWTWNNNGGGGG.',
      'GG.GNNNNNWWTWNNNLLLLG.',
      'G....NNNNNWTWNNNGWLWL.',
      '.......NN.....NN......',
      '......................'
    ],
    f2: [
      '..........G...........',
      '.........GG...........',
      '........GGG...........',
      '.....GGGGGGGGGGGG.....',
      '...GGGGGGGGGGGGGGGG...',
      'GGGGGGGGGGGGGGGGEGGG..',
      'GGGGGNNNNWWTWNNNGGGGG.',
      '.G.GNNNNNWWTWNNNLLLLG.',
      '.....NNNNNWTWNNNGWLWL.',
      '........NN...NN.......',
      '......................'
    ]
  },
  mine: {
    pal: { K: 0x330000, R: 0xe01818, W: 0xffffff },
    rows: ['K..KK..K', '.KRRRRK.', '.RRWWRR.', 'KRRWWRRK', 'KRRWWRRK', '.RRRRRR.', '.KRWWRK.', 'K..KK..K']
  },
  copier: {
    pal: { D: 0x4a4f57, L: 0xc7ccd1, K: 0x1a1a1a, G: 0x20e020, R: 0xff2020, E: 0x111111, W: 0xffffff },
    rows: [
      '.DDDDDDDDDDDDDD.',
      'DLLLLLLLLLLLLLLD',
      'DLLLLLLLLLKGRLLD',
      'DDDDDDDDDDDDDDDD',
      'DLLLLLLLLLLLLLLD',
      'DLEELLLLLLLEELLD',
      'DLLLEELLLEELLLLD',
      'DLLLLLLLLLLLLLLD',
      'DLLLKKKKKKKKLLLD',
      'WWWWKWKWKWKKLLLD',
      'DLLLLLLLLLLLLLLD',
      'DLLLLLLLLLLLLLLD',
      'DDDDDDDDDDDDDDDD',
      '.KK..........KK.'
    ]
  },
  cactus: {
    pal: { G: 0x2e9e3a, D: 0x1d6b27, W: 0xffffff, K: 0x222222, Y: 0xe2c275, S: 0xfff6c0 },
    rows: [
      '...GGGG...',
      '...GWWG...',
      '...GWWG...',
      '...GGGG...',
      'S..GKGG...',
      'G..GGGG..S',
      'GG.GKGG..G',
      '.GGGGGG.GG',
      '...GKGGGG.',
      '..SGGGGS..',
      '...GKGG...',
      '...GGDG...',
      '..SGKGG...',
      '...GGDG...',
      '...GGGG...',
      '..YYYYYY..',
      '.YYYYYYYY.'
    ]
  }
};

// Mirror a grid horizontally (all sprites must face RIGHT; code flips them with setFlipX).
const mirror = (rows) => rows.map((r) => [...r].reverse().join(''));

function stack(...parts) {
  return parts.flat();
}

function drawStalactite(p) {
  // 12x26: icicle narrowing downward, with a tiny red deadline mark.
  const widths = [12, 12, 10, 10, 10, 8, 8, 8, 8, 6, 6, 6, 6, 6, 4, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2];
  widths.forEach((w, y) => {
    const x = (12 - w) / 2;
    p.r(x, y, w, 1, 0x9fdcff);
    p.r(x, y, 1, 1, 0xffffff);
    if (w > 2) p.r(x + w - 1, y, 1, 1, 0x5aa8d8);
  });
  p.r(0, 0, 12, 2, 0xe8f6ff);
  p.r(5, 5, 2, 4, 0xe02020).r(5, 10, 2, 1, 0xe02020);
}

function drawTeamsMeteor(p) {
  // flame trail on top (falls downward)
  p.r(6, 0, 4, 6, 0xff8800).r(14, 0, 4, 4, 0xffd000).r(22, 0, 4, 6, 0xff8800);
  p.r(10, 2, 4, 6, 0xffd000).r(18, 1, 4, 7, 0xff5500);
  // purple rounded square
  p.r(4, 8, 24, 22, 0x5b5fc7).r(6, 6, 20, 26, 0x5b5fc7);
  p.r(6, 8, 20, 2, 0x7b83eb);
  p.box(4, 8, 24, 22, 0x3a3d8f);
  // white T
  p.r(9, 12, 14, 4, 0xffffff).r(14, 16, 4, 11, 0xffffff);
}

function drawMirage(p) {
  // oasis: blue pool + palm tree
  p.r(4, 18, 32, 6, 0x3fa9f5).r(2, 20, 36, 3, 0x3fa9f5).r(8, 19, 10, 1, 0xbfe8ff);
  p.r(24, 6, 3, 14, 0x8b5a2b);
  p.r(16, 4, 9, 3, 0x2ecc40).r(26, 4, 9, 3, 0x2ecc40).r(20, 2, 12, 2, 0x27ae60);
  p.r(14, 7, 4, 2, 0x2ecc40).r(33, 7, 4, 2, 0x2ecc40);
  p.r(22, 6, 2, 2, 0x6b3e1f).r(27, 6, 2, 2, 0x6b3e1f);
}

function drawPaperPile(p) {
  const sheets = [[2, 18, 36], [5, 14, 30], [3, 10, 32], [8, 6, 24], [12, 2, 16]];
  sheets.forEach(([x, y, w], i) => {
    p.r(x, y, w, 4, 0xffffff).r(x, y + 3, w, 1, 0xb0b0b0);
    for (let lx = x + 2; lx < x + w - 2; lx += 4) p.r(lx, y + 1, 2, 1, i % 2 ? 0x20a040 : 0x5080d0);
  });
  p.r(0, 22, 40, 2, 0xb0b0b0);
}

function drawCabinet(p) {
  p.r(0, 0, 24, 56, 0x8c8c7a).r(1, 1, 22, 54, 0xd8d2b8);
  for (let i = 0; i < 4; i++) {
    const y = 2 + i * 13;
    p.r(2, y, 20, 12, 0xc4bd9f).box(2, y, 20, 12, 0x8c8c7a);
    p.r(8, y + 4, 8, 2, 0x5a5a50);
    p.r(9, y + 8, 6, 2, 0xffffff);
  }
  // folders peeking on top
  p.r(3, 0, 4, 2, 0x2060c0).r(9, 0, 4, 2, 0xc03030).r(15, 0, 4, 2, 0x20a040);
}

function drawCart(p) {
  // 44x28. Upper part is the frame the player must slide under; wheels at bottom.
  p.r(2, 2, 40, 3, 0x9aa3ad).r(2, 2, 3, 22, 0x9aa3ad).r(39, 2, 3, 22, 0x9aa3ad);
  p.r(6, 5, 14, 12, 0xffd000).r(6, 5, 14, 2, 0xffe866).box(6, 5, 14, 12, 0x9a7a00); // bucket
  p.r(24, 0, 2, 18, 0x8b5a2b).r(21, 16, 8, 4, 0xe8e0d0); // mop
  p.r(30, 8, 8, 10, 0x2a8ad4).r(32, 6, 4, 2, 0xffffff); // spray bottle
  p.r(2, 18, 40, 4, 0x6f7780).r(2, 18, 40, 1, 0xd0d6dc);
  p.disc(8, 24, 3.5, 0x222222).disc(36, 24, 3.5, 0x222222);
  p.r(7, 23, 2, 2, 0x888888).r(35, 23, 2, 2, 0x888888);
}

function drawSiren(p) {
  p.disc(8, 8, 6, 0xe01818).r(3, 4, 3, 3, 0xff8080);
  p.r(2, 12, 12, 4, 0x333333).r(2, 12, 12, 1, 0x777777);
}

function drawBossClient(p, hurt) {
  const R = hurt ? 0xffffff : 0xd02020;
  const D = hurt ? 0xffc0c0 : 0x222233;
  const K = hurt ? 0xff6060 : 0x111111;
  const F1 = hurt ? 0xffffff : 0xff6600;
  const F2 = hurt ? 0xffffaa : 0xffd000;
  // Flames under/around the chair
  const flames = [[2, 52, 8, 20], [10, 44, 8, 28], [18, 50, 8, 22], [38, 48, 8, 24], [46, 42, 8, 30], [54, 50, 8, 22], [26, 56, 12, 16]];
  flames.forEach(([x, y, w, h]) => p.r(x, y, w, h, F1).r(x + 2, y + 6, w - 4, h - 6, F2));
  // Chair: wheels base, seat, backrest
  p.r(28, 58, 8, 6, 0x333333).r(14, 64, 36, 3, 0x333333);
  p.disc(16, 68, 3, 0x111111).disc(32, 68, 3, 0x111111).disc(48, 68, 3, 0x111111);
  p.r(12, 50, 40, 8, 0x1c1c1c).r(12, 50, 40, 2, 0x444444);
  p.r(8, 14, 48, 38, 0x1c1c1c).r(10, 16, 44, 34, 0x2c2c2c);
  // Client body
  p.r(16, 34, 32, 18, D).r(30, 34, 4, 16, 0xffffff).r(31, 36, 2, 12, hurt ? 0xffaaaa : 0xc00000);
  p.r(12, 36, 6, 14, D).r(46, 36, 6, 14, D).r(12, 48, 6, 4, R).r(46, 48, 6, 4, R);
  // Head
  p.r(20, 10, 24, 24, R).r(18, 14, 28, 16, R);
  p.r(18, 4, 4, 8, hurt ? 0xffd0d0 : 0x5a0000).r(42, 4, 4, 8, hurt ? 0xffd0d0 : 0x5a0000);
  p.r(16, 2, 4, 4, hurt ? 0xffd0d0 : 0x5a0000).r(44, 2, 4, 4, hurt ? 0xffd0d0 : 0x5a0000);
  p.r(22, 16, 8, 4, 0xffe000).r(34, 16, 8, 4, 0xffe000).r(26, 17, 2, 2, K).r(36, 17, 2, 2, K);
  p.r(22, 14, 8, 2, K).r(34, 14, 8, 2, K);
  p.r(24, 24, 16, 6, K).r(26, 24, 2, 2, 0xffffff).r(30, 24, 2, 2, 0xffffff).r(34, 24, 2, 2, 0xffffff).r(38, 24, 2, 2, 0xffffff);
}

function drawBossCeo(p, hurt) {
  const L = hurt ? 0xffffff : 0x6b3a1f;  // leather
  const L2 = hurt ? 0xffe0e0 : 0x8b5a2b;
  const SU = hurt ? 0xffc0c0 : 0x15151c; // suit
  const S = hurt ? 0xffffff : 0xe0b088;
  const GOLD = 0xd4af37;
  // Throne back with gold trim and buttons
  p.r(8, 0, 80, 70, GOLD).r(12, 4, 72, 64, L);
  for (let y = 10; y < 60; y += 12) for (let x = 20; x < 80; x += 14) p.r(x, y, 4, 4, L2);
  // Armrests
  p.r(0, 44, 18, 26, GOLD).r(2, 46, 14, 22, L2);
  p.r(78, 44, 18, 26, GOLD).r(80, 46, 14, 22, L2);
  // Seat & base with wheels
  p.r(10, 66, 76, 10, L2).r(10, 66, 76, 2, GOLD);
  p.r(44, 76, 8, 6, 0x333333).r(16, 80, 64, 3, 0x333333);
  p.disc(18, 84, 4, 0x111111).disc(48, 84, 4, 0x111111).disc(78, 84, 4, 0x111111);
  // CEO body
  p.r(28, 36, 40, 32, SU).r(44, 36, 8, 26, 0xffffff).r(46, 38, 4, 22, GOLD);
  p.r(20, 40, 10, 22, SU).r(66, 40, 10, 22, SU).r(20, 60, 10, 6, S).r(66, 60, 10, 6, S);
  // Head
  p.r(34, 8, 28, 28, S).r(32, 12, 32, 20, S);
  p.r(32, 6, 32, 6, hurt ? 0xffffff : 0xc8c8c8).r(30, 10, 4, 10, hurt ? 0xffffff : 0xc8c8c8).r(62, 10, 4, 10, hurt ? 0xffffff : 0xc8c8c8);
  p.r(38, 18, 8, 3, 0x111111).r(50, 18, 8, 3, 0x111111); // sunglasses
  p.r(46, 18, 4, 1, 0x111111);
  p.r(40, 28, 16, 2, hurt ? 0xff6060 : 0x7a2020); // stern mouth
  p.r(56, 28, 10, 2, 0x8b5a2b).r(64, 27, 2, 2, 0xff5500); // cigar
  // Crown-like gold emblem on throne top
  p.r(40, 0, 16, 4, GOLD).r(44, 0, 2, 2, 0xffffff).r(50, 0, 2, 2, 0xffffff);
}

export function generateEnemies(scene) {
  const t = G.talker;
  gridTex(scene, TEX.TALKER1, stack(t.top, t.mouthOpen, t.body, t.legs1), t.pal);
  gridTex(scene, TEX.TALKER2, stack(t.top, t.mouthShut, t.body, t.legs2), t.pal);

  gridTex(scene, TEX.PARTY1, G.party.f1, G.party.pal);
  gridTex(scene, TEX.PARTY2, G.party.f2, G.party.pal);

  const gu = G.guardian;
  gridTex(scene, TEX.GUARDIAN1, stack(gu.top, gu.legs1), gu.pal);
  gridTex(scene, TEX.GUARDIAN2, stack(gu.top, gu.legs2), gu.pal);

  const c = G.cook;
  gridTex(scene, TEX.COOK1, stack(c.top, c.mouth1, c.body1, c.legs), c.pal);
  gridTex(scene, TEX.COOK2, stack(c.top, c.mouth2, c.body2, c.legs), c.pal);

  gridTex(scene, TEX.CONFCALL1, mirror(G.confcall.f1), G.confcall.pal);
  gridTex(scene, TEX.CONFCALL2, mirror(G.confcall.f2), G.confcall.pal);
  gridTex(scene, TEX.CLIENTHELL, G.clienthell.rows, G.clienthell.pal);

  const m = G.minute;
  gridTex(scene, TEX.MINUTE1, stack(m.top, m.legs1), m.pal);
  gridTex(scene, TEX.MINUTE2, stack(m.top, m.legs2), m.pal);

  gridTex(scene, TEX.BUG1, G.bug.f1, G.bug.pal);
  gridTex(scene, TEX.BUG2, G.bug.f2, G.bug.pal);

  const w = G.waterella;
  gridTex(scene, TEX.WATERELLA1, stack(w.body, w.drip1), w.pal);
  gridTex(scene, TEX.WATERELLA2, stack(w.body, w.drip2), w.pal);

  gridTex(scene, TEX.SHARK1, G.shark.f1, G.shark.pal);
  gridTex(scene, TEX.SHARK2, G.shark.f2, G.shark.pal);
  gridTex(scene, TEX.MINE, G.mine.rows, G.mine.pal);
  gridTex(scene, TEX.COPIER, mirror(G.copier.rows), G.copier.pal);
  gridTex(scene, TEX.CACTUS, G.cactus.rows, G.cactus.pal);

  makeTex(scene, TEX.CABINET, 24, 56, drawCabinet);
  makeTex(scene, TEX.CART, 44, 28, drawCart);
  makeTex(scene, TEX.STALACTITE, 12, 26, drawStalactite);
  makeTex(scene, TEX.TEAMS_METEOR, 32, 32, drawTeamsMeteor);
  makeTex(scene, TEX.MIRAGE, 40, 24, drawMirage);
  makeTex(scene, TEX.PAPERPILE, 40, 24, drawPaperPile);
  makeTex(scene, TEX.SIREN, 16, 16, drawSiren);
  makeTex(scene, TEX.BOSS_CLIENT, 64, 72, (p) => drawBossClient(p, false));
  makeTex(scene, TEX.BOSS_CLIENT_HURT, 64, 72, (p) => drawBossClient(p, true));
  makeTex(scene, TEX.BOSS_CEO, 96, 88, (p) => drawBossCeo(p, false));
  makeTex(scene, TEX.BOSS_CEO_HURT, 96, 88, (p) => drawBossCeo(p, true));
}

// Exposed for tests: grid definitions with expected texture sizes.
export const ENEMY_GRIDS = G;
