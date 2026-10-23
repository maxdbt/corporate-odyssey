// Mondo 4 "La Trasferta" textures: suitcase item icons, budget pickups, airport/station props, mounts.
import { makeTex } from './painter.js';
import { TEX } from '../config/constants.js';

// Suitcase item icon key; underwear, suit and swimsuit depend on the character.
const PER_CHARACTER = ['underwear', 'suit', 'swimsuit'];
export const itemTex = (id, character = 'man') =>
  (PER_CHARACTER.includes(id) ? `trip_${id}_${character}` : `trip_${id}`);

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
  swimsuit_man: (p) => {
    // Swim trunks with a drawstring
    p.r(2, 4, 12, 4, 0x2a6ad8).r(2, 8, 5, 5, 0x2a6ad8).r(9, 8, 5, 5, 0x2a6ad8).r(7, 8, 2, 2, 0x2a6ad8);
    p.r(2, 4, 12, 1, 0x1a4aa8).r(7, 5, 1, 3, 0xffffff).r(8, 5, 1, 3, 0xffffff);
    p.r(3, 11, 3, 1, 0xffd800).r(10, 11, 3, 1, 0xffd800);
  },
  jacket: (p) => {
    // Red down jacket with quilted bands and a zip
    p.r(3, 2, 10, 13, 0xd02020).r(0, 4, 3, 10, 0xd02020).r(13, 4, 3, 10, 0xd02020).r(4, 0, 8, 3, 0xa01010);
    [5, 8, 11].forEach((y) => p.r(0, y, 16, 1, 0xa01010));
    p.r(7, 2, 2, 13, 0xd8d8d8).r(0, 13, 3, 1, 0xf1c27d).r(13, 13, 3, 1, 0xf1c27d);
  },
  swimsuit_woman: (p) => {
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
  // Client's consultant: slick hair, glasses, grey suit, tablet under the arm, two frames.
  [TEX.CONSULTANT1, TEX.CONSULTANT2].forEach((key, f) => makeTex(scene, key, 24, 32, (p) => {
    p.r(7, 0, 10, 4, 0x2a1a0a).r(6, 1, 2, 4, 0x2a1a0a).r(7, 3, 10, 9, 0xf1c27d).r(16, 1, 2, 2, 0x2a1a0a);
    p.r(7, 6, 4, 3, 0x111111).r(13, 6, 4, 3, 0x111111).r(11, 7, 2, 1, 0x111111).r(8, 7, 2, 1, 0x9be7ff).r(14, 7, 2, 1, 0x9be7ff);
    p.r(10, 10, 4, 1, 0xa05a3a);
    p.r(5, 12, 14, 11, 0x5a6270).r(10, 12, 4, 6, 0xffffff).r(11, 13, 2, 6, 0x2a6ad8).r(5, 12, 14, 1, 0x7a8290);
    p.r(3, 13, 3, 8, 0x5a6270).r(18, 13, 3, 8, 0x5a6270).r(19, 15, 5, 7, 0x1a1a1a).r(20, 16, 3, 5, 0x5ab4ff);
    if (f) p.r(6, 23, 5, 7, 0x3a404a).r(13, 23, 5, 5, 0x3a404a).r(5, 30, 6, 2, 0x111111).r(14, 28, 6, 2, 0x111111);
    else p.r(7, 23, 4, 7, 0x3a404a).r(13, 23, 4, 7, 0x3a404a).r(6, 30, 6, 2, 0x111111).r(13, 30, 6, 2, 0x111111);
  }));
  // Manager penguin 24x24 (facing right): red tie, two waddle frames and the belly slide.
  const penguin = (p, f) => {
    const B = 0x1a1a2a;
    p.r(5, 9, 12, 13, B).r(8, 12, 8, 10, 0xffffff).r(7, 3, 10, 7, B).r(12, 5, 2, 2, 0xffffff).r(13, 5, 1, 1, 0x111111);
    p.r(17, 6, 4, 2, 0xffa000).r(11, 11, 2, 1, 0xd02020).r(10, 12, 3, 6, 0xd02020);
    p.r(3, 12, 3, 8, B).r(17, 12, 2, 7, B);
    if (f) p.r(6, 22, 5, 2, 0xffa000).r(13, 21, 5, 2, 0xffa000);
    else p.r(7, 22, 5, 2, 0xffa000).r(12, 22, 5, 2, 0xffa000);
  };
  makeTex(scene, TEX.PENGUIN1, 24, 24, (p) => penguin(p, 0));
  makeTex(scene, TEX.PENGUIN2, 24, 24, (p) => penguin(p, 1));
  makeTex(scene, TEX.PENGUIN_SLIDE, 24, 24, (p) => {
    const B = 0x1a1a2a;
    p.r(1, 15, 17, 7, B).r(3, 19, 14, 4, 0xffffff).r(15, 12, 7, 7, B).r(22, 15, 2, 2, 0xffa000).r(18, 14, 1, 1, 0xffffff);
    p.r(8, 22, 6, 2, 0xd02020).r(0, 16, 2, 3, 0xffa000);
    [[0, 23], [4, 23]].forEach(([x, y]) => p.r(x, y, 2, 1, 0xffffff, 0.8));
  });
  // Snowman 24x36 with a tie and a hat.
  makeTex(scene, TEX.SNOWMAN, 24, 36, (p) => {
    p.disc(12, 28, 8, 0xffffff).disc(12, 17, 6, 0xffffff).disc(12, 8, 5, 0xffffff);
    p.r(5, 30, 14, 2, 0xd0e4f4).r(7, 20, 10, 1, 0xd0e4f4);
    p.r(10, 6, 1, 1, 0x111111).r(14, 6, 1, 1, 0x111111).r(12, 8, 4, 1, 0xff8a20).r(10, 11, 4, 1, 0x333333);
    p.r(7, 0, 10, 4, 0x222222).r(5, 3, 14, 1, 0x222222).r(7, 2, 10, 1, 0xd02020);
    p.r(11, 13, 2, 1, 0x2a6ad8).r(10, 14, 4, 7, 0x2a6ad8).r(11, 21, 2, 1, 0x2a6ad8);
    p.r(1, 15, 5, 1, 0x6a4020).r(18, 15, 5, 1, 0x6a4020).r(0, 13, 1, 2, 0x6a4020).r(23, 13, 1, 2, 0x6a4020);
  });
  // Petition volunteer: green "LONFO" t-shirt, curly hair, clipboard held out, two frames.
  [TEX.ACTIVIST1, TEX.ACTIVIST2].forEach((key, f) => makeTex(scene, key, 24, 32, (p) => {
    p.r(6, 0, 12, 5, 0xc0602a).r(5, 2, 2, 5, 0xc0602a).r(17, 2, 2, 5, 0xc0602a);   // curly hair
    p.r(7, 4, 10, 8, 0xf1c27d).r(9, 7, 2, 1, 0x111111).r(13, 7, 2, 1, 0x111111).r(10, 10, 4, 1, 0xd05050);
    p.r(5, 12, 14, 10, 0x3ca03c).r(5, 12, 14, 1, 0x60c860).r(8, 15, 8, 4, 0xffffff).r(9, 16, 6, 2, 0x3ca03c);
    p.r(3, 13, 3, 7, 0x3ca03c).r(18, 13, 4, 4, 0x3ca03c);
    p.r(19, 11, 5, 7, 0xa0703a).r(20, 12, 3, 5, 0xffffff).r(20, 13, 3, 1, 0x333333).r(20, 15, 2, 1, 0x333333);
    if (f) p.r(6, 22, 5, 8, 0x5a6a9a).r(13, 22, 5, 6, 0x5a6a9a).r(5, 30, 6, 2, 0x6a4a2a).r(14, 28, 6, 2, 0x6a4a2a);
    else p.r(7, 22, 4, 8, 0x5a6a9a).r(13, 22, 4, 8, 0x5a6a9a).r(6, 30, 6, 2, 0x6a4a2a).r(13, 30, 6, 2, 0x6a4a2a);
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
  // Petition stand: table with a green cloth, a sign-up sheet and the poster of the Lonfo nano.
  makeTex(scene, TEX.PETITION, 80, 56, (p) => {
    p.r(10, 0, 2, 34, 0x6a4a2a).r(68, 0, 2, 34, 0x6a4a2a).r(8, 0, 64, 20, 0xfff8e0).box(8, 0, 64, 20, 0x3ca03c);
    // the Lonfo nano: small furry green creature with big eyes
    p.disc(40, 11, 7, 0x6ad06a).r(33, 4, 3, 3, 0x6ad06a).r(44, 4, 3, 3, 0x6ad06a);
    p.disc(37, 10, 2.5, 0xffffff).disc(43, 10, 2.5, 0xffffff).r(37, 10, 1, 1, 0x111111).r(43, 10, 1, 1, 0x111111);
    p.r(39, 15, 3, 1, 0x2a6a2a).r(14, 6, 14, 2, 0x3ca03c).r(14, 10, 10, 2, 0x3ca03c).r(52, 6, 14, 2, 0x3ca03c).r(56, 10, 10, 2, 0x3ca03c);
    p.r(0, 34, 80, 22, 0x3ca03c).r(0, 34, 80, 3, 0x60c860).r(0, 52, 80, 4, 0x2a7a2a);
    p.r(14, 30, 18, 6, 0xffffff).r(16, 31, 12, 1, 0x888888).r(16, 33, 10, 1, 0x888888).r(36, 29, 2, 7, 0x2a2a8a);
    p.r(52, 28, 14, 8, 0xffd800).r(56, 26, 6, 2, 0x8a6a00).disc(26, 44, 5, 0xffffff).disc(26, 44, 3, 0x6ad06a);
  });
  makeTex(scene, TEX.KIOSK, 64, 56, (p) => {
    p.r(4, 22, 56, 34, 0xc8a060).r(4, 22, 56, 3, 0x8a6a30).r(8, 30, 20, 16, 0x6a4a20);
    for (let x = 0; x < 64; x += 8) p.r(x, 8, 8, 14, (x / 8) % 2 ? 0xffffff : 0xe8323c);
    p.r(0, 6, 64, 3, 0x8a1a1a).r(2, 22, 2, 34, 0x6a4a20).r(60, 22, 2, 34, 0x6a4a20);
    p.r(32, 30, 24, 12, 0xfff4e0).text('RENT', 35, 33, 0xd02020);
  });
  // Food stand: palm-leaf roof, counter, steaming pot.
  makeTex(scene, TEX.FOOD_STAND, 80, 64, (p) => {
    p.r(6, 18, 4, 46, 0x6a4a20).r(70, 18, 4, 46, 0x6a4a20).r(4, 36, 72, 28, 0xb07a3a).r(4, 36, 72, 4, 0x8a5a20);
    for (let x = 0; x < 80; x += 10) p.r(x, 8 + (x % 20 ? 2 : 0), 12, 12, (x / 10) % 2 ? 0x3ca03c : 0x2a8a2a);
    p.r(0, 6, 80, 4, 0x5a3a1a).r(14, 22, 52, 12, 0xfff4dc).text('CIBO', 30, 25, 0xd02020);
    p.r(48, 44, 18, 10, 0x4a4a4a).r(46, 42, 22, 3, 0x6a6a6a).r(52, 38, 2, 4, 0xffffff, 0.7).r(58, 36, 2, 6, 0xffffff, 0.7);
    p.r(12, 46, 10, 6, 0xffd800).r(26, 46, 10, 6, 0xd04020).r(10, 52, 30, 2, 0x6a4a20);
  });
  // Mountain hut: log walls, snowy roof, smoking chimney, lit windows.
  makeTex(scene, TEX.HUT, 96, 72, (p) => {
    p.r(66, 4, 8, 14, 0x6a6a6a).r(65, 2, 10, 3, 0xffffff);
    for (let i = 0; i <= 24; i++) {
      const half = Math.min(48, 2 + i * 2);
      p.r(48 - half, 6 + i, half * 2, 1, i > 21 ? 0x5a3a1a : 0xffffff);
    }
    p.r(6, 31, 84, 41, 0x8a5a2a);
    for (let y = 35; y < 72; y += 5) p.r(6, y, 84, 1, 0x5a3a1a);
    p.r(40, 48, 16, 24, 0x4a2a10).r(53, 60, 2, 2, 0xffd800);
    [[14, 44], [68, 44]].forEach(([x, y]) => p.r(x, y, 14, 12, 0xffd860).box(x, y, 14, 12, 0x4a2a10).r(x + 6, y, 2, 12, 0x4a2a10));
    p.r(26, 33, 44, 10, 0xfff4dc).text('BAITA', 34, 35, 0xd02020);
    p.r(0, 68, 96, 4, 0xffffff);
  });
  // Dishes of the glacier hut (40x30).
  makeTex(scene, 'food_cioccolata', 40, 30, (p) => {
    p.r(2, 24, 36, 5, 0xffffff).r(0, 27, 40, 2, 0xd8d8d8);
    p.r(11, 10, 18, 15, 0xd02020).r(11, 10, 18, 2, 0xff6060).r(29, 13, 5, 2, 0xd02020).r(32, 13, 2, 8, 0xd02020).r(29, 19, 5, 2, 0xd02020);
    p.r(12, 7, 16, 4, 0xffffff).r(15, 5, 10, 3, 0xffffff).r(18, 3, 4, 2, 0xffffff).r(13, 9, 14, 1, 0x5a2a10);
    p.r(14, 0, 1, 3, 0xffffff, 0.6).r(25, 1, 1, 3, 0xffffff, 0.6);
  });
  makeTex(scene, 'food_grappa', 40, 30, (p) => {
    p.r(2, 24, 36, 5, 0xffffff).r(0, 27, 40, 2, 0xd8d8d8);
    p.r(6, 8, 10, 17, 0xd8f0ff, 0.8).r(9, 2, 4, 6, 0xd8f0ff, 0.8).r(9, 0, 4, 2, 0x8a5a2a).r(7, 14, 8, 6, 0xfff4dc).r(8, 16, 6, 1, 0x3ca03c);
    p.r(10, 9, 2, 14, 0x9ad04a, 0.7);
    p.r(24, 15, 10, 10, 0xd8f0ff, 0.8).r(25, 18, 8, 6, 0xfff8c0).r(24, 15, 10, 1, 0xffffff);
  });
  makeTex(scene, 'food_fonduta', 40, 30, (p) => {
    p.r(2, 24, 36, 5, 0xffffff).r(0, 27, 40, 2, 0xd8d8d8);
    p.r(6, 13, 28, 11, 0x8a2a1a).r(4, 12, 32, 3, 0xa03a2a).r(7, 11, 26, 3, 0xffd860).r(10, 10, 6, 2, 0xffe890);
    p.r(24, 2, 2, 10, 0x9a9a9a).r(21, 1, 8, 4, 0xe0b060).r(22, 5, 2, 4, 0xffd860);
    p.r(1, 22, 4, 3, 0x6a6a6a).r(35, 22, 4, 3, 0x6a6a6a);
  });
  // Dishes of the desert food stand (40x30).
  makeTex(scene, 'food_panino', 40, 30, (p) => {
    p.r(2, 22, 36, 6, 0xffffff).r(0, 26, 40, 3, 0xd8d8d8);
    p.r(5, 8, 30, 6, 0xe0b060).r(7, 6, 26, 2, 0xe0b060).r(4, 14, 32, 4, 0x8a4a1a).r(5, 15, 6, 2, 0xa06a2a).r(20, 15, 8, 2, 0xa06a2a);
    p.r(5, 18, 30, 4, 0xd8a050).r(10, 9, 2, 1, 0xfff0c0).r(20, 8, 2, 1, 0xfff0c0).r(28, 9, 2, 1, 0xfff0c0);
  });
  makeTex(scene, 'food_cannelloni', 40, 30, (p) => {
    p.r(2, 22, 36, 6, 0xffffff).r(0, 26, 40, 3, 0xd8d8d8);
    [6, 15, 24].forEach((x) => p.r(x, 12, 9, 10, 0xf0d8a0).r(x, 12, 9, 2, 0xfff0c8).r(x + 3, 15, 3, 4, 0xc08040));
    p.r(4, 10, 32, 4, 0xd03018).r(8, 9, 4, 2, 0xff5a3a).r(22, 9, 6, 2, 0xff5a3a).r(14, 8, 2, 2, 0x3ca03c).r(30, 9, 2, 2, 0x3ca03c);
  });
  makeTex(scene, 'food_dunette', 40, 30, (p) => {
    p.r(2, 22, 36, 6, 0xffffff).r(0, 26, 40, 3, 0xd8d8d8);
    [[4, 22, 12], [14, 22, 14], [26, 22, 11]].forEach(([x, y, w]) => {
      for (let i = 0; i < w / 2; i++) p.r(x + i, y - i, w - 2 * i, 1, i % 3 ? 0xe8b860 : 0xd8a040);
      p.r(x + w / 2 - 1, y - w / 2, 2, 1, 0xffffff);
    });
    p.r(9, 18, 1, 1, 0xffffff).r(21, 16, 1, 1, 0xffffff).r(31, 18, 1, 1, 0xffffff);
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
  makeTex(scene, TEX.CAMEL_WING, 28, 14, (p) => {
    p.r(10, 10, 18, 4, 0xffffff).r(4, 6, 20, 4, 0xffffff).r(0, 2, 16, 4, 0xffffff).r(0, 0, 8, 2, 0xffffff);
    p.r(4, 4, 10, 1, 0xc8d8e8).r(8, 8, 12, 1, 0xc8d8e8).r(14, 12, 12, 1, 0xc8d8e8);
  });
  makeTex(scene, TEX.MOTO, 44, 26, (p) => {
    p.disc(8, 19, 6.5, 0x111111).disc(8, 19, 3, 0x9a9a9a).disc(36, 19, 6.5, 0x111111).disc(36, 19, 3, 0x9a9a9a);
    p.r(10, 10, 24, 6, 0xd02020).r(14, 6, 14, 5, 0xd02020).r(14, 6, 14, 1, 0xff8080).r(30, 2, 3, 10, 0x333333);
    p.r(29, 1, 6, 2, 0x333333).r(34, 8, 4, 3, 0xffffa0).r(4, 13, 8, 3, 0x6a6a6a).r(14, 14, 16, 3, 0x9a9a9a);
  });
  // Husky sled 64x28 (facing right): the sled on the left (rider at x 16), two huskies pulling in front.
  makeTex(scene, TEX.HUSKY_SLED, 64, 28, (p) => {
    p.r(0, 26, 30, 2, 0x5a3a1a).r(28, 24, 3, 2, 0x5a3a1a).r(0, 8, 4, 18, 0x8a5a2a).r(0, 8, 4, 2, 0xb07a3a);
    p.r(2, 16, 24, 8, 0xa0602a).r(2, 16, 24, 2, 0xc08040).r(6, 24, 2, 2, 0x5a3a1a).r(20, 24, 2, 2, 0x5a3a1a);
    p.r(26, 17, 8, 1, 0x333333);
    [32, 48].forEach((x) => {
      const g = 0x6a7280;
      p.r(x - 2, 12, 3, 2, g).r(x, 13, 12, 6, g).r(x + 1, 17, 10, 2, 0xffffff);
      p.r(x + 10, 9, 6, 6, g).r(x + 12, 12, 4, 3, 0xffffff).r(x + 11, 7, 2, 3, 0x4a5260).r(x + 14, 7, 2, 3, 0x4a5260);
      p.r(x + 13, 10, 1, 1, 0x111111).r(x + 15, 12, 1, 1, 0x111111).r(x + 3, 13, 2, 6, 0xd02020);
      p.r(x + 1, 19, 2, 7, g).r(x + 9, 19, 2, 7, g).r(x + 1, 25, 2, 1, 0xffffff).r(x + 9, 25, 2, 1, 0xffffff);
    });
    p.r(44, 15, 4, 1, 0x333333);
  });
  // Snowmobile 48x24 (facing right): yellow body, track at the back, ski in front.
  makeTex(scene, TEX.SNOWMOBILE, 48, 24, (p) => {
    p.r(4, 18, 28, 6, 0x222222);
    [8, 15, 22, 29].forEach((x) => p.disc(x, 21, 2, 0x5a5a5a));
    p.r(30, 22, 16, 2, 0x9a9a9a).r(44, 19, 3, 3, 0x9a9a9a).r(36, 14, 3, 8, 0x333333);
    p.r(4, 10, 34, 8, 0xffb000).r(4, 10, 34, 2, 0xffd860).r(30, 6, 12, 6, 0xffb000).r(38, 2, 4, 5, 0x9ad0ff, 0.8);
    p.r(8, 7, 16, 4, 0x222222).r(42, 11, 4, 3, 0xffffa0).r(2, 12, 3, 3, 0xff3030).r(10, 14, 18, 2, 0x111111);
  });
  // Skis 44x6 under the feet (tips in front, to the right), with a pair of poles.
  makeTex(scene, TEX.SKIS, 44, 6, (p) => {
    p.r(2, 4, 38, 2, 0xd02020).r(40, 2, 2, 2, 0xd02020).r(42, 1, 2, 1, 0xd02020);
    p.r(6, 3, 36, 1, 0xff6060).r(18, 2, 8, 2, 0x333333);
  });
  // Yellow submarine 56x30 (facing right): the rider looks out of the hatch tower.
  makeTex(scene, TEX.SUBMARINE, 56, 30, (p) => {
    const Y = 0xffc820;
    p.r(6, 13, 44, 16, Y).r(3, 16, 50, 10, Y).r(1, 19, 54, 4, Y).r(6, 13, 44, 2, 0xffe070).r(6, 27, 44, 2, 0xd09a10);
    p.r(20, 4, 16, 10, Y).r(20, 4, 16, 2, 0xffe070).r(31, 0, 2, 5, 0x6a6a6a).r(31, 0, 5, 2, 0x6a6a6a);
    [14, 42].forEach((x) => p.disc(x, 20, 3.5, 0x6a6a6a).disc(x, 20, 2.5, 0x9be7ff));
    p.r(0, 15, 3, 12, 0x8a8a8a).r(0, 18, 2, 6, 0x5a5a5a).r(54, 19, 2, 3, 0xffffa0);
  });
  // Fins 40x6 under the feet (pointing forward) and the mask with the snorkel (14x10, worn on the head).
  // Fins 40x14 (worn facing right): two yellow blades trailing behind the feet mid-kick (one up, one down),
  // fanning out to a forked tip, with black foot pockets and light ribs. The far fin is darker.
  makeTex(scene, TEX.FINS, 40, 14, (p) => {
    const fin = (px, cy, len, slope, col, edge, rib) => {
      for (let i = 0; i < len; i++) {
        const h = Math.round(2 + (i / len) * 5);
        const x = px - 1 - i;
        const y = Math.round(cy + slope * i - h / 2);
        if (i >= len - 2) p.r(x, y, 1, 2, col).r(x, y + h - 2, 1, 2, col);
        else p.r(x, y, 1, h, col).r(x, y + h - 1, 1, 1, edge);
        if (i > 2 && i < len - 3) p.r(x, Math.round(cy + slope * i), 1, 1, rib);
      }
    };
    fin(27, 5, 24, -0.12, 0xd0a000, 0x9a7400, 0xe8c840);
    p.r(26, 3, 8, 4, 0x222222).r(26, 3, 8, 1, 0x444444);
    fin(25, 9, 25, 0.1, 0xffd000, 0xc89800, 0xfff4a0);
    p.r(24, 7, 9, 5, 0x222222).r(24, 7, 9, 1, 0x444444);
  });
  makeTex(scene, TEX.MASK, 14, 10, (p) => {
    p.r(1, 0, 2, 7, 0xffd800).r(1, 6, 4, 2, 0xffd800).r(0, 3, 5, 2, 0x222222);
    p.r(4, 2, 10, 6, 0x222222).r(5, 3, 8, 4, 0x9be7ff).r(6, 3, 2, 1, 0xffffff);
  });
  // Seahorse 36x44 (facing right) with a saddle, curled tail.
  makeTex(scene, TEX.SEAHORSE, 36, 44, (p) => {
    const O = 0xffa030, D = 0xd07a10;
    p.r(18, 0, 10, 9, O).r(27, 3, 9, 3, O).r(16, 0, 3, 5, 0xff7a20).r(23, 2, 2, 2, 0x111111);
    p.r(14, 8, 12, 10, O).r(10, 16, 15, 13, O).r(20, 12, 5, 16, 0xffd080);
    [18, 22, 26].forEach((y) => p.r(10, y, 3, 1, D));
    p.r(5, 18, 5, 9, 0xffe070).r(8, 14, 14, 3, 0x8a3a2a).r(9, 13, 4, 1, 0x8a3a2a);
    p.r(12, 29, 9, 6, O).r(15, 35, 9, 4, O).r(22, 32, 4, 6, O).r(19, 31, 4, 2, O).r(20, 33, 2, 2, D);
  });
  // Underwater sushi bar 96x72: stone hut with a coral roof, portholes and seaweed.
  makeTex(scene, TEX.REEF_BAR, 96, 72, (p) => {
    for (let i = 0; i <= 18; i++) {
      const half = Math.min(48, 14 + Math.round(Math.sqrt(i) * 8));
      p.r(48 - half, 6 + i, half * 2, 1, i > 15 ? 0xd05060 : 0xff7a8a);
    }
    p.r(40, 2, 3, 5, 0xff7a8a).r(54, 0, 3, 7, 0xff7a8a);
    p.r(6, 25, 84, 47, 0x6a7a8a);
    for (let y = 30; y < 72; y += 7) for (let x = 6 + (y % 2) * 6; x < 88; x += 14) p.r(x, y, 10, 1, 0x4a5a6a);
    p.r(40, 48, 16, 24, 0x1a2a3a).r(53, 60, 2, 2, 0xffd800);
    [[20, 52], [76, 52]].forEach(([x, y]) => p.disc(x, y, 7, 0x8a8a8a).disc(x, y, 5, 0x9be7ff));
    p.r(28, 30, 40, 11, 0xfff4dc).text('SUSHI', 38, 33, 0xd02020);
    p.r(0, 38, 3, 34, 0x2a8a3a).r(2, 46, 3, 3, 0x2a8a3a).r(92, 42, 3, 30, 0x2a8a3a).r(90, 50, 3, 3, 0x2a8a3a);
    p.r(0, 68, 96, 4, 0xe0c890);
  });
  // Dishes of the sushi bar (40x30).
  makeTex(scene, 'food_sushi', 40, 30, (p) => {
    p.r(2, 22, 36, 6, 0x8a5a2a).r(2, 22, 36, 1, 0xb07a3a).r(4, 28, 4, 2, 0x5a3a1a).r(32, 28, 4, 2, 0x5a3a1a);
    [5, 16, 27].forEach((x) => p.r(x, 16, 9, 6, 0xfff8f0).r(x - 1, 12, 11, 5, 0xff8a60).r(x, 13, 9, 1, 0xffc0a0).r(x + 3, 17, 3, 5, 0x1a2a1a));
    p.r(4, 6, 32, 1, 0xb07a3a).r(6, 8, 30, 1, 0xb07a3a);
  });
  makeTex(scene, 'food_alghe', 40, 30, (p) => {
    p.r(2, 24, 36, 5, 0xffffff).r(0, 27, 40, 2, 0xd8d8d8);
    p.r(6, 15, 28, 10, 0xd0e0f0).r(8, 24, 24, 2, 0xb0c0d0).r(6, 15, 28, 1, 0xffffff);
    p.r(8, 10, 24, 6, 0x2aa040).r(10, 6, 3, 5, 0x3ac050).r(18, 4, 3, 7, 0x3ac050).r(26, 6, 3, 5, 0x3ac050).r(14, 8, 2, 3, 0x1a8a30);
    [[12, 11], [20, 12], [27, 11], [16, 13]].forEach(([x, y]) => p.r(x, y, 1, 1, 0xffffff));
  });
  makeTex(scene, 'food_paranza', 40, 30, (p) => {
    p.r(2, 24, 36, 5, 0xffffff).r(0, 27, 40, 2, 0xd8d8d8);
    for (let i = 0; i < 12; i++) p.r(12 + Math.floor(i / 2), 12 + i, 16 - i, 1, 0xfff4dc);
    [[10, 4], [16, 2], [22, 5]].forEach(([x, y]) => p.r(x, y, 6, 10, 0xd8a040).r(x + 1, y, 4, 1, 0xf0c060).r(x + 2, y + 2, 1, 1, 0x111111).r(x + 1, y + 10, 4, 2, 0xb07a20));
    p.r(28, 18, 7, 6, 0xffe040).r(29, 19, 3, 2, 0xfff4a0);
  });
  // Jellyfish 20x24, two frames (tentacles waving).
  [TEX.JELLY1, TEX.JELLY2].forEach((key, f) => makeTex(scene, key, 20, 24, (p) => {
    const P = 0xff80c0;
    p.r(5, 0, 10, 3, P).r(3, 2, 14, 6, P).r(2, 6, 16, 4, P).r(5, 2, 4, 2, 0xffc0e0).r(2, 9, 16, 1, 0xd05090);
    p.r(7, 5, 1, 2, 0x111111).r(12, 5, 1, 2, 0x111111);
    [4, 8, 11, 15].forEach((x, i) => {
      const dx = (f + i) % 2;
      p.r(x + dx, 10, 1, 5, P, 0.85).r(x + 1 - dx, 15, 1, 5 + (i % 2) * 3, P, 0.85);
    });
  }));
  makeTex(scene, TEX.TAXI, 56, 28, (p) => {
    p.r(2, 10, 52, 12, 0xffd800).r(12, 2, 30, 10, 0xffd800).r(14, 4, 12, 7, 0x9ad0ff).r(28, 4, 12, 7, 0x9ad0ff);
    p.r(22, 0, 10, 3, 0x111111).text('TAXI', 19, -1, 0xffd800);
    for (let x = 2; x < 54; x += 6) p.r(x, 15, 3, 3, 0x111111);
    p.r(50, 12, 4, 3, 0xffffa0).r(2, 12, 3, 3, 0xff3030);
    p.disc(13, 22, 5.5, 0x111111).disc(13, 22, 2.5, 0x9a9a9a).disc(43, 22, 5.5, 0x111111).disc(43, 22, 2.5, 0x9a9a9a);
  });
}

// Seated passenger seen from the front (40x52, drawn at scale 2 in the plane cabin).
function seated(p, o) {
  const S = 0xf1c27d;
  const SD = 0xd8a060;
  const H = o.hair;
  const dark = 0x3a2a1a;
  const sleeve = o.jacket ?? o.shirt;
  // Legs: thighs towards the viewer, shins down to the shoes
  p.r(10, 38, 20, 6, o.legs).r(10, 43, 20, 1, 0x000000, 0.25);
  p.r(11, 44, 7, 6, o.legs).r(22, 44, 7, 6, o.legs).r(10, 49, 9, 3, o.shoes).r(21, 49, 9, 3, o.shoes);
  // Torso
  p.r(10, 21, 20, 1, o.shirt).r(9, 22, 22, 17, o.shirt);
  if (o.jacket) p.r(9, 22, 8, 17, o.jacket).r(23, 22, 8, 17, o.jacket).r(16, 24, 1, 5, o.jacket).r(23, 24, 1, 5, o.jacket);
  if (o.collar) p.r(16, 22, 3, 2, o.collar).r(21, 22, 3, 2, o.collar);
  if (o.vneck) p.r(18, 22, 4, 2, S).r(19, 24, 2, 2, S);
  if (o.tie) p.r(19, 23, 2, 2, o.tie).r(18, 25, 4, 7, o.tie).r(19, 32, 2, 1, o.tie);
  if (o.badge) p.r(25, 26, 3, 4, 0x3498db).r(25, 26, 3, 1, 0xffffff);
  if (o.stripe) p.r(9, 30, 22, 2, o.stripe);
  // Arms resting on the lap
  p.r(5, 23, 4, 13, sleeve).r(31, 23, 4, 13, sleeve).r(5, 23, 4, 1, 0xffffff, 0.2).r(31, 23, 4, 1, 0xffffff, 0.2);
  p.r(8, 35, 6, 4, sleeve).r(26, 35, 6, 4, sleeve).r(12, 36, 4, 3, S).r(24, 36, 4, 3, S);
  if (o.book) p.r(11, 30, 18, 9, o.book).r(19, 30, 2, 9, 0xfff4dc).r(13, 32, 4, 1, 0xffd800).r(23, 32, 4, 1, 0xffd800);
  // Neck and head
  p.r(17, 19, 6, 3, SD).r(13, 5, 14, 15, S).r(12, 8, 1, 9, S).r(27, 8, 1, 9, S).r(11, 10, 2, 4, SD).r(27, 10, 2, 4, SD);
  p.r(14, 19, 12, 1, S);
  // Hair
  if (o.hairStyle === 'short') p.r(13, 2, 14, 5, H).r(12, 4, 2, 6, H).r(26, 4, 2, 6, H).r(15, 1, 10, 1, H).r(14, 6, 5, 1, H);
  if (o.hairStyle === 'long') p.r(12, 2, 16, 5, H).r(10, 5, 4, 19, H).r(26, 5, 4, 19, H).r(14, 6, 6, 2, H).r(15, 1, 10, 1, H);
  if (o.hairStyle === 'bald') p.r(12, 8, 2, 6, H).r(26, 8, 2, 6, H).r(17, 5, 4, 1, 0xffffff, 0.45);
  if (o.hairStyle === 'bun') p.r(13, 2, 14, 5, H).r(17, 0, 6, 3, H).r(12, 5, 2, 6, H).r(26, 5, 2, 6, H);
  if (o.hairStyle === 'curly') {
    p.r(11, 1, 18, 6, H).r(10, 4, 3, 8, H).r(27, 4, 3, 8, H);
    [12, 16, 20, 24].forEach((x) => p.r(x, 0, 3, 1, H));
  }
  // Face
  p.r(15, 9, 4, 1, o.hairStyle === 'bald' ? dark : H).r(21, 9, 4, 1, o.hairStyle === 'bald' ? dark : H);
  if (o.eyes === 'closed') p.r(15, 12, 4, 1, dark).r(21, 12, 4, 1, dark);
  else p.r(16, 11, 2, 2, 0x111111).r(22, 11, 2, 2, 0x111111).r(16, 11, 1, 1, 0xffffff).r(22, 11, 1, 1, 0xffffff);
  p.r(19, 13, 2, 2, SD).r(14, 14, 2, 1, 0xf0a0a0, 0.7).r(24, 14, 2, 1, 0xf0a0a0, 0.7);
  if (o.beard) p.r(13, 14, 14, 6, H).r(12, 12, 2, 5, H).r(26, 12, 2, 5, H);
  if (o.mustache) p.r(16, 14, 8, 2, H);
  const lip = o.lips || 0x8a3a2a;
  if (o.mouth === 'open') p.r(17, 16, 6, 3, 0x6a1a1a).r(18, 16, 4, 1, 0xffffff).r(18, 18, 4, 1, 0xd05050);
  else if (o.mouth === 'flat') p.r(18, 17, 4, 1, lip);
  else p.r(17, 17, 6, 1, lip).r(16, 16, 1, 1, lip).r(23, 16, 1, 1, lip);
  if (o.glasses) p.box(15, 10, 4, 4, 0x222222).box(21, 10, 4, 4, 0x222222).r(19, 11, 2, 1, 0x222222);
  if (o.headphones) p.r(12, 1, 16, 2, 0x333333).r(11, 2, 2, 7, 0x333333).r(27, 2, 2, 7, 0x333333).r(9, 8, 4, 7, o.headphones).r(27, 8, 4, 7, o.headphones);
  if (o.mask) p.r(12, 9, 16, 5, o.mask).r(15, 11, 3, 1, 0xffffff).r(22, 11, 3, 1, 0xffffff);
}

const PAX = {
  pax_man: { hair: 0x2b1a0e, hairStyle: 'short', shirt: 0xf4f8fc, collar: 0xffffff, tie: 0xc0392b, legs: 0x1f2a44, shoes: 0x111111, badge: true },
  pax_woman: { hair: 0x7a2e12, hairStyle: 'long', shirt: 0x16a085, vneck: true, legs: 0x2c3e50, shoes: 0xd0304a, lips: 0xd0304a, badge: true },
  pax_chatty1: { hair: 0x8a7a6a, hairStyle: 'bald', shirt: 0x3ca03c, collar: 0x2a8a2a, legs: 0xb8a070, shoes: 0x5a3a1a, mustache: true, mouth: 'smile' },
  pax_chatty2: { hair: 0x8a7a6a, hairStyle: 'bald', shirt: 0x3ca03c, collar: 0x2a8a2a, legs: 0xb8a070, shoes: 0x5a3a1a, mustache: true, mouth: 'open' },
  pax_reader: { hair: 0xe8c860, hairStyle: 'bun', shirt: 0x8a3ab0, vneck: true, legs: 0x3a3a4a, shoes: 0x222222, glasses: true, book: 0x2a6ad8, mouth: 'flat', lips: 0xb04060 },
  pax_music: { hair: 0x3a2a1a, hairStyle: 'curly', shirt: 0xe07a20, stripe: 0xffffff, legs: 0x4a5a8a, shoes: 0xffffff, beard: true, headphones: 0xd02020, eyes: 'closed' },
  pax_sleeper: { hair: 0x5a5a5a, hairStyle: 'short', shirt: 0x6a7a8a, jacket: 0x3a4250, collar: 0xffffff, tie: 0x2a6ad8, legs: 0x3a4250, shoes: 0x111111, mask: 0x2a2a6a, mouth: 'open' }
};

// Flight attendant (32x60, front view) and her trolley (40x34).
function hostess(p) {
  const S = 0xf1c27d;
  p.r(10, 1, 12, 5, 0x2b1a0e).r(13, 0, 6, 2, 0x2b1a0e).r(9, 4, 2, 6, 0x2b1a0e).r(21, 4, 2, 6, 0x2b1a0e);
  p.r(10, 4, 12, 12, S).r(12, 8, 2, 2, 0x111111).r(18, 8, 2, 2, 0x111111).r(14, 13, 4, 1, 0xd0304a).r(11, 11, 2, 1, 0xf0a0a0).r(19, 11, 2, 1, 0xf0a0a0);
  p.r(9, 2, 14, 2, 0x1a2a5a).r(14, 16, 4, 2, S);
  p.r(7, 18, 18, 18, 0x1a2a5a).r(13, 18, 6, 3, 0xd02020).r(15, 21, 2, 4, 0xd02020).r(20, 22, 3, 2, 0xffd800);
  p.r(4, 19, 3, 15, 0x1a2a5a).r(25, 19, 3, 15, 0x1a2a5a).r(4, 34, 3, 3, S).r(25, 34, 3, 3, S);
  p.r(8, 36, 16, 10, 0x1a2a5a).r(10, 46, 4, 11, S).r(18, 46, 4, 11, S).r(9, 57, 6, 3, 0x111111).r(17, 57, 6, 3, 0x111111);
}
function trolley(p) {
  p.r(0, 0, 40, 30, 0xc8ccd4).box(0, 0, 40, 30, 0x6a6e76).r(0, 0, 40, 4, 0xe8eaee).r(2, 10, 36, 1, 0x8a8e96).r(2, 20, 36, 1, 0x8a8e96);
  p.r(4, 5, 6, 4, 0xd02020).r(14, 5, 6, 4, 0x3ca03c).r(24, 5, 8, 4, 0xffd800).r(16, 13, 8, 5, 0x2a6ad8);
  p.disc(6, 31, 3, 0x222222).disc(34, 31, 3, 0x222222);
}

export function generateTrip(scene) {
  Object.entries(PAX).forEach(([key, look]) => makeTex(scene, key, 40, 52, (p) => seated(p, look)));
  makeTex(scene, 'hostess', 32, 60, hostess);
  makeTex(scene, 'trolley', 40, 34, trolley);
  Object.entries(ICONS).forEach(([id, draw]) => makeTex(scene, `trip_${id}`, 16, 16, draw));
  pickups(scene);
  characters(scene);
  props(scene);
  mounts(scene);
}
