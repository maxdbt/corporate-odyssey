// Mondo 4 "La Trasferta" textures: suitcase item icons, budget pickups, airport/station props, mounts.
import { makeTex } from './painter.js';
import { TEX } from '../config/constants.js';

// Suitcase item icon key; underwear and suit depend on the character.
export const itemTex = (id, character = 'man') =>
  (id === 'underwear' || id === 'suit' ? `trip_${id}_${character}` : `trip_${id}`);

// 16x16 icons, 1 texture pixel = 1 px.
const ICONS = {
  laptop: (p) => {
    p.r(2, 3, 12, 8, 0x2a2a3a).r(3, 4, 10, 6, 0x5ab4ff).r(4, 5, 4, 1, 0xffffff);
    p.r(0, 11, 16, 3, 0x9aa6ae).r(0, 11, 16, 1, 0xd0d8de).r(6, 12, 4, 1, 0x5a646a);
  },
  charger: (p) => {
    p.r(3, 2, 7, 8, 0xf0f0f0).box(3, 2, 7, 8, 0x8a8a8a).r(4, 0, 1, 2, 0xc0c0c0).r(8, 0, 1, 2, 0xc0c0c0);
    p.r(6, 10, 1, 3, 0x333333).r(7, 12, 6, 1, 0x333333).r(12, 12, 1, 3, 0x333333);
    p.r(5, 5, 3, 1, 0x3ce05a);
  },
  phone: (p) => {
    p.r(4, 1, 8, 14, 0x1a1a1a).r(5, 2, 6, 10, 0x5ab4ff).r(7, 13, 2, 1, 0x888888);
    p.r(6, 4, 4, 1, 0xffffff).r(6, 6, 3, 1, 0xffffff);
  },
  earbuds: (p) => {
    p.r(2, 4, 5, 6, 0xffffff).r(9, 4, 5, 6, 0xffffff).r(3, 5, 3, 4, 0x2a2a2a).r(10, 5, 3, 4, 0x2a2a2a);
    p.r(4, 10, 1, 4, 0xe0e0e0).r(11, 10, 1, 4, 0xe0e0e0).r(4, 13, 8, 1, 0xe0e0e0);
  },
  antacid: (p) => {
    p.r(2, 3, 12, 10, 0x4fa0e0).box(2, 3, 12, 10, 0x1f5a90);
    [[4, 5], [8, 5], [4, 9], [8, 9]].forEach(([x, y]) => p.r(x, y, 3, 2, 0xffffff));
    p.r(12, 4, 1, 8, 0xffffff);
  },
  toothpaste: (p) => {
    p.r(1, 6, 11, 5, 0xffffff).box(1, 6, 11, 5, 0x8a8a8a).r(3, 7, 6, 3, 0xd02020).r(12, 7, 2, 3, 0x2060d0);
    p.r(14, 8, 2, 1, 0xd0f0ff);
  },
  toothbrush: (p) => {
    p.r(1, 9, 11, 2, 0x3ce05a).r(10, 6, 5, 3, 0xffffff).r(10, 5, 1, 1, 0x9be7ff).r(12, 5, 1, 1, 0x9be7ff).r(14, 5, 1, 1, 0x9be7ff);
    p.r(10, 8, 5, 1, 0x2a9a40);
  },
  underwear_man: (p) => {
    p.r(2, 3, 12, 4, 0x2a6ad8).r(2, 7, 5, 6, 0x2a6ad8).r(9, 7, 5, 6, 0x2a6ad8).r(2, 3, 12, 1, 0xffffff);
    [[4, 5], [10, 5], [4, 10], [11, 10]].forEach(([x, y]) => p.r(x, y, 1, 1, 0xffd800));
  },
  underwear_woman: (p) => {
    p.r(2, 4, 12, 3, 0xff7fb0).r(4, 7, 8, 3, 0xff7fb0).r(6, 10, 4, 2, 0xff7fb0).r(2, 4, 12, 1, 0xffffff);
    p.r(7, 5, 2, 1, 0xd02060);
  },
  banana: (p) => {
    p.r(3, 9, 3, 2, 0xffd800).r(5, 10, 6, 2, 0xffd800).r(10, 8, 3, 3, 0xffd800).r(12, 5, 2, 4, 0xffd800);
    p.r(5, 12, 6, 1, 0xc8a000).r(13, 3, 1, 2, 0x6b4a2b).r(2, 9, 1, 1, 0x6b4a2b);
  },
  umbrella: (p) => {
    p.r(2, 5, 12, 2, 0xe8323c).r(4, 3, 8, 2, 0xe8323c).r(6, 2, 4, 1, 0xe8323c).r(5, 5, 2, 2, 0xffffff).r(9, 5, 2, 2, 0xffffff);
    p.r(8, 7, 1, 7, 0x6b4a2b).r(6, 13, 2, 1, 0x6b4a2b).r(6, 12, 1, 1, 0x6b4a2b);
  },
  toiletpaper: (p) => {
    p.r(3, 3, 9, 10, 0xffffff).box(3, 3, 9, 10, 0xc0c0c0).r(6, 6, 3, 4, 0x9a9a9a);
    p.r(11, 9, 4, 4, 0xffffff).box(11, 9, 4, 4, 0xd8d8d8);
  },
  notebook: (p) => {
    p.r(3, 1, 10, 14, 0x2a3a8a).r(4, 2, 8, 12, 0xfff8e0);
    for (let y = 4; y < 14; y += 2) p.r(5, y, 6, 1, 0x9ab0d8);
    for (let y = 2; y < 15; y += 3) p.r(2, y, 2, 1, 0x9a9a9a);
  },
  sleepmask: (p) => {
    p.r(1, 6, 14, 5, 0x6a3ab0).r(2, 5, 5, 1, 0x6a3ab0).r(9, 5, 5, 1, 0x6a3ab0).r(0, 7, 1, 2, 0x222222).r(15, 7, 1, 2, 0x222222);
    p.r(3, 8, 3, 1, 0xffffff).r(10, 8, 3, 1, 0xffffff);
  },
  idcard: (p) => {
    p.r(1, 3, 14, 10, 0xe8eef2).box(1, 3, 14, 10, 0x6a7a8a).r(2, 4, 12, 2, 0x2a6ad8);
    p.r(3, 7, 4, 5, 0xf1c27d).r(3, 7, 4, 1, 0x5a3a20).r(8, 8, 5, 1, 0x333333).r(8, 10, 4, 1, 0x333333);
  },
  adapter: (p) => {
    p.r(3, 4, 10, 9, 0x2a2a2a).r(4, 5, 8, 7, 0x444444).r(5, 1, 2, 3, 0xd0b040).r(9, 1, 2, 3, 0xd0b040).r(7, 0, 2, 4, 0xd0b040);
    p.r(6, 7, 1, 2, 0x111111).r(9, 7, 1, 2, 0x111111);
  },
  cards: (p) => {
    p.r(4, 2, 11, 7, 0xd8d8d8).r(2, 5, 11, 7, 0xffffff).box(2, 5, 11, 7, 0x8a8a8a);
    p.r(4, 7, 5, 1, 0x2a3a8a).r(4, 9, 7, 1, 0x888888);
  },
  suit_man: (p) => {
    p.r(2, 2, 12, 13, 0x2a2a3a).r(6, 2, 4, 9, 0xffffff).r(7, 3, 2, 8, 0xd02020).r(5, 2, 1, 6, 0x111111).r(10, 2, 1, 6, 0x111111);
    p.r(4, 12, 2, 1, 0xd0d0d0);
  },
  suit_woman: (p) => {
    p.r(2, 2, 12, 13, 0x8a2a5a).r(6, 2, 4, 7, 0xffffff).r(5, 2, 1, 7, 0x5a1a3a).r(10, 2, 1, 7, 0x5a1a3a);
    p.r(7, 10, 1, 1, 0xffd800).r(7, 12, 1, 1, 0xffd800);
  },
  dates: (p) => {
    [[3, 6], [7, 4], [10, 7], [5, 9]].forEach(([x, y]) => p.r(x, y, 4, 3, 0x7a3a12).r(x, y, 4, 1, 0xa0581f));
    p.r(2, 12, 12, 2, 0xc8a060);
  },
  swimsuit: (p) => {
    p.r(3, 3, 3, 4, 0x20c0c0).r(10, 3, 3, 4, 0x20c0c0).r(3, 9, 10, 4, 0x20c0c0).r(6, 13, 4, 2, 0x20c0c0);
    p.r(6, 4, 4, 1, 0x108080).r(5, 10, 1, 1, 0xffd800).r(10, 11, 1, 1, 0xffd800);
  }
};

function pickups(scene) {
  makeTex(scene, TEX.BUDGET, 16, 12, (p) => {
    p.r(0, 1, 16, 11, 0xf4ecd0).box(0, 1, 16, 11, 0x8a7a4a).r(1, 2, 7, 4, 0xe0d4a8).r(8, 2, 7, 4, 0xe0d4a8);
    p.r(5, 6, 6, 5, 0x3ce05a).r(7, 7, 2, 3, 0xffffff);
  });
  makeTex(scene, TEX.MILES, 14, 14, (p) => {
    p.r(6, 0, 2, 14, 0x3a8aff).r(0, 5, 14, 3, 0x3a8aff).r(3, 2, 8, 9, 0x3a8aff).r(5, 4, 4, 5, 0xbfe0ff);
    p.r(1, 11, 3, 2, 0x3a8aff).r(10, 11, 3, 2, 0x3a8aff);
  });
  makeTex(scene, TEX.UPGRADE, 16, 12, (p) => {
    p.r(0, 0, 16, 12, 0xffd800).box(0, 0, 16, 12, 0xa07800).r(11, 0, 1, 12, 0xa07800);
    p.r(2, 3, 7, 1, 0x6a4a00).r(2, 6, 5, 1, 0x6a4a00).r(13, 3, 1, 6, 0x6a4a00);
  });
  makeTex(scene, TEX.DROP_STRIKE, 20, 16, (p) => {
    p.r(0, 0, 20, 11, 0xd02020).box(0, 0, 20, 11, 0x700000).text('STOP', 2, 3, 0xffffff);
    p.r(9, 11, 2, 5, 0x6a6a6a);
  });
  makeTex(scene, TEX.DROP_DELAY, 16, 16, (p) => {
    p.disc(8, 8, 7.5, 0x700000).disc(8, 8, 6, 0xffffff).r(7.5, 3, 1, 6, 0xd02020).r(8, 8, 4, 1, 0xd02020);
  });
  makeTex(scene, TEX.DF_PERFUME, 14, 14, (p) => {
    p.r(3, 5, 8, 9, 0xff9fd0).box(3, 5, 8, 9, 0xb05080).r(5, 2, 4, 3, 0xd0b040).r(6, 0, 2, 2, 0x333333).r(5, 8, 3, 3, 0xffffff);
  });
  makeTex(scene, TEX.DF_CHOCO, 14, 14, (p) => {
    p.r(1, 2, 12, 10, 0x6b3a1a).r(1, 2, 12, 3, 0xffd800);
    for (let x = 2; x < 12; x += 3) p.r(x, 6, 2, 2, 0x8b4a2a).r(x, 9, 2, 2, 0x8b4a2a);
  });
  makeTex(scene, TEX.DF_WATCH, 14, 14, (p) => {
    p.r(5, 0, 4, 14, 0x6a4a2a).disc(7, 7, 5, 0xd0b040).disc(7, 7, 3.5, 0xffffff).r(7, 5, 1, 3, 0x111111).r(7, 7, 2, 1, 0x111111);
  });
  makeTex(scene, TEX.UMBRELLA_OPEN, 24, 12, (p) => {
    p.r(2, 6, 20, 3, 0xe8323c).r(5, 3, 14, 3, 0xe8323c).r(9, 1, 6, 2, 0xe8323c).r(7, 6, 3, 3, 0xffffff).r(14, 6, 3, 3, 0xffffff);
    p.r(11, 9, 2, 3, 0x6b4a2b);
  });
}

function characters(scene) {
  // Sniffer dog, two frames (legs).
  [TEX.DOG1, TEX.DOG2].forEach((key, f) => makeTex(scene, key, 28, 20, (p) => {
    p.r(4, 6, 16, 8, 0x8a5a2a).r(4, 6, 16, 2, 0xa06a3a).r(18, 2, 8, 8, 0x8a5a2a).r(24, 6, 4, 3, 0x6a4020);
    p.r(19, 1, 3, 4, 0x5a3a1a).r(22, 4, 1, 1, 0x111111).r(27, 6, 1, 1, 0x111111);
    p.r(0, 4, 5, 2, 0x8a5a2a);                       // tail
    p.r(6, 9, 10, 4, 0x2a4a8a).r(9, 10, 4, 2, 0xffd800); // police vest
    const legs = f ? [[5, 14], [10, 14], [14, 14], [18, 14]] : [[6, 14], [9, 14], [15, 14], [17, 14]];
    legs.forEach(([x, y]) => p.r(x, y, 2, 6, 0x6a4020));
  }));
  // Pickpocket: hood and sunglasses, two frames.
  [TEX.THIEF1, TEX.THIEF2].forEach((key, f) => makeTex(scene, key, 24, 32, (p) => {
    p.r(6, 0, 12, 12, 0x2a2a2a).r(8, 4, 8, 7, 0xd8a870).r(8, 5, 8, 2, 0x111111);
    p.r(5, 12, 14, 10, 0x3a3a3a).r(3, 13, 3, 7, 0x3a3a3a).r(18, 13, 3, 7, 0x3a3a3a).r(10, 14, 4, 4, 0xffd800);
    if (f) p.r(6, 22, 5, 8, 0x1f2a44).r(13, 22, 5, 6, 0x1f2a44).r(5, 30, 6, 2, 0xffffff).r(14, 28, 6, 2, 0xffffff);
    else p.r(7, 22, 4, 8, 0x1f2a44).r(13, 22, 4, 8, 0x1f2a44).r(6, 30, 6, 2, 0xffffff).r(13, 30, 6, 2, 0xffffff);
  }));
}

function props(scene) {
  makeTex(scene, TEX.T_AIRPORT, 32, 32, (p) => {
    p.r(0, 0, 32, 32, 0xc8ccd4).r(0, 0, 32, 3, 0xeef0f4).r(0, 16, 32, 1, 0xa8acb4).r(16, 3, 1, 29, 0xa8acb4);
    p.r(3, 6, 8, 2, 0xffffff, 0.6).r(19, 20, 8, 2, 0xffffff, 0.6);
  });
  makeTex(scene, TEX.T_STATION, 32, 32, (p) => {
    p.r(0, 0, 32, 32, 0x8a8a8a).r(0, 0, 32, 4, 0xffd800);
    for (let x = 1; x < 32; x += 4) p.r(x, 1, 2, 2, 0xb09000);
    p.r(0, 18, 32, 1, 0x6a6a6a).r(10, 4, 1, 14, 0x6a6a6a).r(24, 19, 1, 13, 0x6a6a6a);
  });
  makeTex(scene, TEX.BENCH, 64, 22, (p) => {
    p.r(0, 0, 64, 6, 0x3a6ad8).r(0, 0, 64, 2, 0x6a9aff).r(0, 5, 64, 1, 0x1a3a8a);
    for (let x = 6; x < 64; x += 14) p.r(x, 0, 1, 6, 0x1a3a8a);
    p.r(4, 6, 3, 16, 0x5a5a5a).r(57, 6, 3, 16, 0x5a5a5a).r(4, 19, 56, 2, 0x5a5a5a);
  });
  makeTex(scene, TEX.SHELF, 96, 48, (p) => {
    p.r(0, 0, 96, 48, 0x5a3a20).r(2, 2, 92, 44, 0xfff4e0);
    [16, 31].forEach((y) => p.r(2, y, 92, 3, 0x8a6a40));
    const cols = [0xff9fd0, 0xffd800, 0x9be7ff, 0xd02020, 0x3ce05a, 0x6a3ab0];
    for (let x = 6, i = 0; x < 90; x += 9, i++) {
      p.r(x, 6, 6, 10, cols[i % 6]).r(x + 1, 21, 6, 10, cols[(i + 2) % 6]).r(x, 36, 7, 10, cols[(i + 4) % 6]);
    }
    p.r(0, 0, 96, 3, 0xd0b040);
  });
  makeTex(scene, TEX.BOARD, 64, 40, (p) => {
    p.r(0, 0, 64, 40, 0x111111).box(0, 0, 64, 40, 0x5a5a5a).r(2, 2, 60, 7, 0x2a2a2a).text('PARTENZE', 4, 3, 0xffd800);
    for (let y = 12; y < 38; y += 6) {
      p.r(4, y, 18, 3, 0xffd800).r(26, y, 14, 3, 0xffffff).r(44, y, 16, 3, y % 12 ? 0x3ce05a : 0xff3030);
    }
  });
  makeTex(scene, TEX.KIOSK, 64, 56, (p) => {
    p.r(4, 22, 56, 34, 0xc8a060).r(4, 22, 56, 3, 0x8a6a30).r(8, 30, 20, 16, 0x6a4a20);
    for (let x = 0; x < 64; x += 8) p.r(x, 8, 8, 14, (x / 8) % 2 ? 0xffffff : 0xe8323c);
    p.r(0, 6, 64, 3, 0x8a1a1a).r(2, 22, 2, 34, 0x6a4a20).r(60, 22, 2, 34, 0x6a4a20);
    p.r(32, 30, 24, 12, 0xfff4e0).text('RENT', 35, 33, 0xd02020);
  });
  makeTex(scene, TEX.GATE_DESK, 40, 40, (p) => {
    p.r(0, 14, 40, 26, 0x4a5a6a).r(0, 14, 40, 3, 0x8a9aaa).r(4, 0, 32, 12, 0x1a1a1a).r(6, 2, 28, 8, 0x2a6ad8);
    p.text('ID', 15, 4, 0xffffff).r(18, 12, 4, 2, 0x5a5a5a);
  });
  makeTex(scene, TEX.GATE_DOOR, 40, 56, (p) => {
    p.r(0, 0, 40, 56, 0x2a3a5a).r(4, 12, 32, 44, 0x9ad0ff).r(19, 12, 2, 44, 0x2a3a5a);
    p.r(0, 0, 40, 11, 0x111111).text('GATE', 4, 3, 0xffd800).r(26, 3, 10, 5, 0x3ce05a);
  });
  makeTex(scene, TEX.TRAIN_DOOR, 64, 60, (p) => {
    p.r(0, 2, 64, 54, 0xd02020).r(0, 2, 64, 4, 0xff6060).r(0, 40, 64, 4, 0xffffff);
    p.r(20, 10, 24, 44, 0x6a6a6a).r(22, 12, 9, 22, 0x9ad0ff).r(33, 12, 9, 22, 0x9ad0ff);
    p.r(4, 12, 12, 14, 0x9ad0ff).r(48, 12, 12, 14, 0x9ad0ff);
    p.disc(12, 57, 3, 0x111111).disc(52, 57, 3, 0x111111);
  });
  makeTex(scene, TEX.OFFICE, 96, 96, (p) => {
    p.r(4, 8, 88, 88, 0xe8e0d0).r(4, 8, 88, 4, 0xa09080).r(0, 4, 96, 6, 0x6a5a4a);
    for (let y = 18; y < 70; y += 16) for (let x = 12; x < 84; x += 18) p.r(x, y, 12, 10, 0x5ab4ff).r(x, y, 12, 2, 0xffffff);
    p.r(36, 66, 24, 30, 0x2a3a5a).r(38, 68, 9, 28, 0x9ad0ff).r(49, 68, 9, 28, 0x9ad0ff);
    p.r(24, 56, 48, 8, 0x2a2a3a).text('CLIENTE', 34, 58, 0xffd800);
  });
  makeTex(scene, 'luggage', 64, 16, (p) => {
    const cols = [0xd02020, 0x2a6ad8, 0x3ca05a, 0x6a3ab0];
    for (let i = 0; i < 4; i++) p.r(i * 16, 0, 15, 16, cols[i]).r(i * 16 + 5, 0, 5, 2, 0x222222).r(i * 16, 7, 15, 1, 0x000000, 0.3);
  });
}

function mounts(scene) {
  // Camel 48x40: the rider sits on the hump (see Player MOUNTS lift).
  makeTex(scene, TEX.CAMEL, 48, 40, (p) => {
    const c = 0xc8964a, d = 0xa0763a;
    p.r(8, 12, 28, 14, c).r(14, 6, 14, 8, c).r(34, 6, 6, 16, c).r(36, 2, 10, 7, c).r(44, 5, 3, 3, d);
    p.r(41, 3, 1, 1, 0x111111).r(37, 0, 2, 3, d);
    p.r(12, 14, 20, 6, 0xd02020).r(12, 14, 20, 1, 0xffd800);        // saddle blanket
    [[10, 26], [16, 26], [28, 26], [33, 26]].forEach(([x, y]) => p.r(x, y, 3, 14, d));
    p.r(4, 12, 4, 2, d).r(2, 14, 2, 6, d);
  });
  makeTex(scene, TEX.MOTO, 44, 26, (p) => {
    p.disc(8, 19, 6.5, 0x111111).disc(8, 19, 3, 0x9a9a9a).disc(36, 19, 6.5, 0x111111).disc(36, 19, 3, 0x9a9a9a);
    p.r(10, 10, 24, 6, 0xd02020).r(14, 6, 14, 5, 0xd02020).r(14, 6, 14, 1, 0xff8080).r(30, 2, 3, 10, 0x333333);
    p.r(29, 1, 6, 2, 0x333333).r(34, 8, 4, 3, 0xffffa0).r(4, 13, 8, 3, 0x6a6a6a).r(14, 14, 16, 3, 0x9a9a9a);
  });
  makeTex(scene, TEX.TAXI, 56, 28, (p) => {
    p.r(2, 10, 52, 12, 0xffd800).r(12, 2, 30, 10, 0xffd800).r(14, 4, 12, 7, 0x9ad0ff).r(28, 4, 12, 7, 0x9ad0ff);
    p.r(22, 0, 10, 3, 0x111111).text('TAXI', 19, -1, 0xffd800);
    for (let x = 2; x < 54; x += 6) p.r(x, 15, 3, 3, 0x111111);
    p.r(50, 12, 4, 3, 0xffffa0).r(2, 12, 3, 3, 0xff3030);
    p.disc(13, 22, 5.5, 0x111111).disc(13, 22, 2.5, 0x9a9a9a).disc(43, 22, 5.5, 0x111111).disc(43, 22, 2.5, 0x9a9a9a);
  });
}

export function generateTrip(scene) {
  Object.entries(ICONS).forEach(([id, draw]) => makeTex(scene, `trip_${id}`, 16, 16, draw));
  pickups(scene);
  characters(scene);
  props(scene);
  mounts(scene);
}
