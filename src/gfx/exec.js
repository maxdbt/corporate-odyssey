// Mondo 5 "La Cima della Piramide" textures (executive floors, rooftop, final boss phases), generated once on demand.
import { makeTex } from './painter.js';
import { ensurePartyTextures } from './party.js';

const SKIN = 0xf1c27d;
const GOLD = 0xd4af37;
const GOLD_D = 0x9c7a12;
const K = 0x111111;

export function ensureExecTextures(scene) {
  ensurePartyTextures(scene); // ceo_standing (boss phase 2+)
  if (scene.textures.exists('yesman1')) return;
  enemies(scene);
  props(scene);
  decor(scene);
  rooftop(scene);
}

// ---------------------------------------------------------------- enemies

function enemies(scene) {
  // Yes-Man 24x32: grey suit, slick hair, closed happy eyes, huge smile, thumb up. Frame 2 = nodding.
  const yes = (nod) => (p) => {
    const hy = 2 + nod * 2;
    p.r(5, 15, 14, 10, 0x6a6a78).r(10, 15, 4, 9, 0xffffff).r(11, 16, 2, 7, 0x2a4a9a);
    p.r(3, 16, 3, 8, 0x6a6a78).r(3, 23, 3, 2, SKIN);
    p.r(18, 13, 3, 8, 0x6a6a78).r(18, 10, 3, 3, SKIN).r(19, 8, 1, 2, SKIN);
    p.r(7, 25, 4, 5, 0x3a3a48).r(13, 25, 4, 5, 0x3a3a48).r(6, 30, 5, 2, K).r(13, 30, 5, 2, K);
    p.r(7, hy + 3, 10, 9, SKIN).r(6, hy + 5, 1, 3, SKIN).r(17, hy + 5, 1, 3, SKIN);
    p.r(7, hy, 10, 3, 0x222222).r(6, hy + 1, 2, 4, 0x222222).r(14, hy + 1, 3, 1, 0x444444);
    p.r(9, hy + 6, 2, 1, K).r(13, hy + 6, 2, 1, K).r(8, hy + 5, 1, 1, K).r(15, hy + 5, 1, 1, K);
    p.r(9, hy + 9, 6, 2, 0x7a2020).r(10, hy + 9, 4, 1, 0xffffff);
  };
  makeTex(scene, 'yesman1', 24, 32, yes(0));
  makeTex(scene, 'yesman2', 24, 32, yes(1));

  // Consulente Strategico 24x34: navy suit, square glasses, gelled quiff, clicker. Frame 2 = throwing arm.
  const strat = (throwing) => (p) => {
    p.r(5, 16, 14, 11, 0x1a2a5a).r(10, 16, 4, 10, 0xffffff).r(11, 17, 2, 8, 0xd06020);
    p.r(7, 27, 4, 5, 0x141e40).r(13, 27, 4, 5, 0x141e40).r(6, 32, 5, 2, 0x3a2010).r(13, 32, 5, 2, 0x3a2010);
    p.r(3, 17, 3, 8, 0x1a2a5a).r(3, 25, 3, 2, SKIN);
    if (throwing) p.r(18, 13, 5, 3, 0x1a2a5a).r(22, 11, 2, 3, SKIN);
    else p.r(18, 17, 3, 8, 0x1a2a5a).r(18, 25, 3, 2, SKIN).r(19, 24, 3, 2, 0x333333);
    p.r(7, 4, 10, 11, SKIN).r(6, 7, 1, 3, SKIN).r(17, 7, 1, 3, SKIN);
    p.r(7, 2, 10, 3, 0x7a4a1a).r(10, 0, 8, 3, 0x7a4a1a).r(6, 3, 2, 4, 0x7a4a1a);
    p.r(7, 7, 4, 3, K).r(13, 7, 4, 3, K).r(11, 8, 2, 1, K).r(8, 8, 2, 1, 0x9ad4f0).r(14, 8, 2, 1, 0x9ad4f0);
    p.r(10, 12, 4, 1, 0x7a3a2a);
  };
  makeTex(scene, 'strategist1', 24, 34, strat(false));
  makeTex(scene, 'strategist2', 24, 34, strat(true));
  // PowerPoint slide 22x16: orange title bar, bar chart.
  makeTex(scene, 'ppt_slide', 22, 16, (p) => {
    p.r(0, 0, 22, 16, 0x555555).r(1, 1, 20, 14, 0xffffff).r(1, 1, 20, 3, 0xd06020);
    p.r(4, 10, 3, 4, 0x2a6ad8).r(9, 7, 3, 7, 0x3cb050).r(14, 5, 3, 9, 0xd02020).r(3, 14, 16, 1, 0x333333);
  });

  // Segretaria 24x34: bun, red glasses, magenta cardigan, agenda. Frame 2 = hand raised ("ALT").
  const sec = (stop) => (p) => {
    p.r(5, 15, 14, 11, 0xb0306a).r(10, 15, 4, 4, 0xffffff);
    p.r(6, 26, 12, 4, 0x2a2a3a).r(8, 30, 3, 2, SKIN).r(13, 30, 3, 2, SKIN).r(7, 32, 4, 2, K).r(13, 32, 4, 2, K);
    p.r(3, 16, 3, 8, 0xb0306a);
    p.r(2, 20, 6, 7, 0x222222).r(3, 21, 4, 1, GOLD);
    if (stop) p.r(18, 10, 3, 7, 0xb0306a).r(18, 6, 4, 4, SKIN).r(18, 5, 1, 2, SKIN).r(20, 4, 1, 2, SKIN);
    else p.r(18, 16, 3, 8, 0xb0306a).r(18, 24, 3, 2, SKIN);
    p.r(7, 4, 10, 11, SKIN).r(6, 7, 1, 3, SKIN).r(17, 7, 1, 3, SKIN);
    p.r(7, 2, 10, 4, 0x6a3a1a).r(6, 3, 2, 8, 0x6a3a1a).r(16, 3, 2, 8, 0x6a3a1a).r(9, 0, 6, 3, 0x6a3a1a);
    p.r(7, 7, 4, 3, 0xd02020).r(13, 7, 4, 3, 0xd02020).r(8, 8, 2, 1, 0xffffff).r(14, 8, 2, 1, 0xffffff).r(11, 8, 2, 1, 0xd02020);
    p.r(10, 12, 4, 1, 0xc02050);
  };
  makeTex(scene, 'secretary1', 24, 34, sec(false));
  makeTex(scene, 'secretary2', 24, 34, sec(true));
}

// ---------------------------------------------------------------- level props

function props(scene) {
  // Glass security gate 16x112 with gold frame and a red / green lock light.
  const gate = (open) => (p) => {
    p.r(0, 0, 16, 112, GOLD_D).r(2, 2, 12, 108, 0x9ad4f0, 0.55).r(4, 6, 2, 60, 0xffffff, 0.5);
    p.r(0, 54, 16, 6, GOLD).disc(8, 57, 2, open ? 0x3cf050 : 0xff2020);
  };
  makeTex(scene, 'exec_gate', 16, 112, gate(false));
  // VIP badge 14x20 on a red lanyard.
  makeTex(scene, 'vip_badge', 14, 20, (p) => {
    p.r(3, 0, 2, 7, 0xd02020).r(9, 0, 2, 7, 0xd02020).r(5, 5, 4, 2, 0xd02020);
    p.r(1, 7, 12, 13, GOLD_D).r(2, 8, 10, 11, GOLD).r(3, 10, 4, 5, 0xffffff).r(4, 11, 2, 2, SKIN).r(8, 10, 3, 1, K).r(8, 12, 3, 1, K);
    p.r(3, 16, 8, 2, K);
  });
  // Share certificate 28x18 with a red arrow down (stock market crash).
  makeTex(scene, 'stock_cert', 28, 18, (p) => {
    p.r(0, 0, 28, 18, 0x2a7a3a).r(1, 1, 26, 16, 0xfff4dc).box(2, 2, 24, 14, 0x2a7a3a);
    p.text('AZIONI', 2, 4, 0x2a5a2a);
    p.r(12, 10, 4, 3, 0xd02020).r(10, 12, 8, 1, 0xd02020).r(11, 13, 6, 1, 0xd02020).r(12, 14, 4, 1, 0xd02020).r(13, 15, 2, 1, 0xd02020);
  });
  // Golden elevator 48x80: frame, steel doors, floor display with the up arrow, call button.
  makeTex(scene, 'exec_elevator', 48, 80, (p) => {
    p.r(0, 0, 48, 80, GOLD_D).r(2, 2, 44, 78, GOLD).r(4, 14, 40, 66, 0x5a5a66);
    p.r(5, 15, 18, 65, 0xb8bcc8).r(25, 15, 18, 65, 0xb8bcc8).r(23, 15, 2, 65, 0x3a3a44);
    p.r(7, 18, 2, 58, 0xe0e4ee).r(27, 18, 2, 58, 0xe0e4ee);
    p.r(12, 3, 24, 9, K).r(22, 5, 4, 1, 0xff8020).r(21, 6, 6, 1, 0xff8020).r(20, 7, 8, 1, 0xff8020).r(23, 8, 2, 3, 0xff8020);
    p.disc(45, 44, 2, 0xfff3a0);
  });
  // Empty leather throne 96x88 (the boss stands up in phase 2).
  makeTex(scene, 'throne_empty', 96, 88, (p) => {
    const L = 0x6b3a1f;
    const L2 = 0x8b5a2b;
    p.r(8, 0, 80, 70, GOLD).r(12, 4, 72, 64, L);
    for (let y = 10; y < 60; y += 12) for (let x = 20; x < 80; x += 14) p.r(x, y, 4, 4, L2);
    p.r(0, 44, 18, 26, GOLD).r(2, 46, 14, 22, L2).r(78, 44, 18, 26, GOLD).r(80, 46, 14, 22, L2);
    p.r(10, 66, 76, 10, L2).r(10, 66, 76, 2, GOLD);
    p.r(44, 76, 8, 6, 0x333333).r(16, 80, 64, 3, 0x333333);
    p.disc(18, 84, 4, K).disc(48, 84, 4, K).disc(78, 84, 4, K);
    p.r(40, 0, 16, 4, GOLD).r(44, 0, 2, 2, 0xffffff).r(50, 0, 2, 2, 0xffffff);
  });
  // Golden parachute backpack 14x22, the open golden canopy 84x48 (strings down to the bottom centre).
  makeTex(scene, 'gold_pack', 14, 22, (p) => {
    p.r(1, 2, 12, 18, GOLD_D).r(2, 3, 10, 16, GOLD).r(2, 8, 10, 2, GOLD_D).r(6, 0, 2, 3, GOLD_D).r(5, 12, 4, 3, 0xfff3a0);
  });
  makeTex(scene, 'gold_canopy', 84, 48, (p) => {
    for (let y = 0; y < 18; y++) {
      const w = Math.round(84 * Math.sqrt(1 - ((17 - y) / 18) ** 2));
      for (let x = 0; x < w; x += 12) p.r(42 - w / 2 + x, y, Math.min(12, w - x), 1, (x / 12) % 2 ? GOLD : 0xfff3a0);
    }
    p.r(0, 17, 84, 2, GOLD_D);
    for (let i = 0; i <= 6; i++) {
      const sx = 2 + i * 13.3;
      for (let s = 0; s < 28; s++) p.r(sx + (42 - sx) * (s / 28), 19 + s, 1, 1, 0xcccccc);
    }
  });
  // Bag of gold "BUONUSCITA" 16x18.
  makeTex(scene, 'gold_bag', 16, 18, (p) => {
    p.r(6, 0, 4, 3, 0xb08a40).r(4, 3, 8, 2, 0x8a6a20).disc(8, 11, 7, 0xd8b050).disc(8, 11, 5, 0xe8c870);
    p.text('€', 7, 9, 0x5a3a00);
  });
}

// ---------------------------------------------------------------- floor decor

function decor(scene) {
  // Legal shelf 48x72: dark wood, four rows of law books with gold bands.
  makeTex(scene, 'law_shelf', 48, 72, (p) => {
    p.r(0, 0, 48, 72, 0x3a200e).r(2, 2, 44, 68, 0x5a3418);
    const cols = [0x8a1a1a, 0x1a4a2a, 0x6a3a12, 0x1a2a5a, 0x7a5a1a];
    for (let row = 0; row < 4; row++) {
      const y = 4 + row * 17;
      p.r(2, y + 14, 44, 3, 0x3a200e);
      for (let x = 4, k = row; x < 44; x += 5, k++) {
        const h = 11 + ((k * 7) % 3);
        p.r(x, y + 14 - h, 4, h, cols[k % cols.length]).r(x, y + 16 - h, 4, 1, GOLD).r(x, y + 10, 4, 1, GOLD);
      }
    }
  });
  // Scales of justice on a marble pedestal 32x56.
  makeTex(scene, 'justice_scale', 32, 56, (p) => {
    p.r(8, 32, 16, 24, 0xe0e0e0).r(6, 30, 20, 3, 0xf4f4f4).r(6, 53, 20, 3, 0xc8c8c8).r(11, 34, 2, 18, 0xc8c8c8);
    p.r(15, 6, 2, 24, GOLD).r(10, 28, 12, 2, GOLD).r(3, 6, 26, 2, GOLD).disc(16, 5, 2, GOLD);
    p.r(4, 8, 1, 10, GOLD_D).r(27, 8, 1, 10, GOLD_D);
    p.r(0, 18, 9, 2, GOLD).r(1, 20, 7, 1, GOLD_D).r(23, 18, 9, 2, GOLD).r(24, 20, 7, 1, GOLD_D);
  });
  // HR posters 32x40 / 40x40.
  makeTex(scene, 'poster_sorridi', 32, 40, (p) => {
    p.r(0, 0, 32, 40, GOLD).r(2, 2, 28, 36, 0xffffff).disc(16, 16, 9, 0xffd800);
    p.r(12, 13, 2, 3, K).r(18, 13, 2, 3, K).r(11, 19, 10, 2, K).r(10, 18, 2, 1, K).r(20, 18, 2, 1, K);
    p.text('SORRIDI', 2, 30, 0xd02060);
  });
  makeTex(scene, 'poster_sinergia', 40, 40, (p) => {
    p.r(0, 0, 40, 40, GOLD).r(2, 2, 36, 36, 0xffffff);
    p.disc(15, 16, 8, 0x2a6ad8, 0.8).disc(25, 16, 8, 0xff8020, 0.8);
    p.text('SINERGIA', 4, 30, 0x2a3a6a);
  });
  // Waiting-room leather sofa 64x28, water cooler 20x44, reception desk 72x40.
  makeTex(scene, 'exec_sofa', 64, 28, (p) => {
    p.r(0, 4, 64, 18, 0x6a1a22).r(0, 0, 10, 24, 0x7a2a32).r(54, 0, 10, 24, 0x7a2a32).r(8, 2, 48, 8, 0x8a2a32);
    p.r(10, 12, 21, 8, 0x9a3a42).r(33, 12, 21, 8, 0x9a3a42).r(4, 22, 4, 6, GOLD_D).r(56, 22, 4, 6, GOLD_D);
  });
  makeTex(scene, 'water_cooler', 20, 44, (p) => {
    p.r(5, 0, 10, 4, 0x2a6ad8).disc(10, 10, 8, 0x8ad8ff, 0.8).r(2, 18, 16, 26, 0xe8e8e8).r(2, 18, 16, 2, 0xbbbbbb);
    p.r(6, 24, 3, 3, 0x2a6ad8).r(11, 24, 3, 3, 0xd02020).r(5, 40, 10, 2, 0xbbbbbb);
  });
  makeTex(scene, 'reception', 72, 40, (p) => {
    p.r(0, 0, 72, 6, 0xf4f4f4).r(2, 6, 68, 34, 0x5a3418).r(2, 6, 68, 2, GOLD);
    for (let x = 6; x < 68; x += 12) p.r(x, 12, 1, 26, 0x3a200e);
    p.r(14, 16, 44, 10, GOLD).text('RECEPTION', 18, 19, 0x3a200e);
  });
}

// ---------------------------------------------------------------- rooftop

function rooftop(scene) {
  // Helicopter 160x64 (side view), rotor blade 150x4 (squashed / stretched to spin).
  makeTex(scene, 'helicopter', 160, 64, (p) => {
    p.r(70, 2, 4, 10, 0x333333);
    p.r(40, 12, 72, 36, 0x1a2a5a).r(36, 18, 8, 26, 0x1a2a5a).r(44, 10, 60, 4, 0x2a3a6a);
    p.r(112, 22, 40, 8, 0x1a2a5a).r(148, 10, 8, 22, 0x1a2a5a).disc(152, 14, 6, 0x555555);
    p.r(46, 18, 26, 16, 0x9ad4f0).r(48, 20, 8, 4, 0xffffff, 0.7).r(78, 20, 22, 12, 0x9ad4f0);
    p.r(40, 36, 72, 3, GOLD);
    p.r(52, 48, 3, 8, 0x333333).r(96, 48, 3, 8, 0x333333).r(40, 56, 72, 3, 0x333333).r(36, 54, 4, 3, 0x333333).r(112, 54, 4, 3, 0x333333);
  });
  makeTex(scene, 'rotor', 150, 4, (p) => {
    p.r(0, 1, 150, 2, 0x222222).r(70, 0, 10, 4, 0x444444);
  });
  // Helipad marking 160x10 (seen from the side: a flattened circle with the H).
  makeTex(scene, 'helipad', 160, 10, (p) => {
    p.r(0, 4, 160, 6, 0x6a6a6a).r(10, 5, 140, 1, 0xffd800).r(10, 8, 140, 1, 0xffd800).r(70, 5, 4, 4, 0xffffff).r(86, 5, 4, 4, 0xffffff).r(74, 6, 12, 2, 0xffffff);
  });
  // Rooftop furniture: AC unit 48x36, antenna 16x96, railing 64x20.
  makeTex(scene, 'roof_ac', 48, 36, (p) => {
    p.r(0, 0, 48, 36, 0x8a8a92).r(2, 2, 44, 32, 0xa8a8b0).disc(16, 18, 11, 0x6a6a72).disc(16, 18, 9, 0x3a3a42);
    p.r(8, 17, 16, 2, 0x8a8a92).r(15, 10, 2, 16, 0x8a8a92);
    for (let y = 6; y < 32; y += 4) p.r(32, y, 10, 2, 0x6a6a72);
  });
  makeTex(scene, 'antenna', 16, 96, (p) => {
    p.r(7, 0, 2, 96, 0x8a8a92).r(2, 20, 12, 2, 0x8a8a92).r(4, 40, 8, 2, 0x8a8a92).r(0, 88, 16, 8, 0x5a5a62).disc(8, 2, 2, 0xff2020);
  });
  makeTex(scene, 'roof_rail', 64, 20, (p) => {
    p.r(0, 0, 64, 3, 0xb8bcc8);
    for (let x = 0; x < 64; x += 16) p.r(x, 0, 3, 20, 0xb8bcc8);
    p.r(0, 10, 64, 2, 0x8a8e98);
  });
}
