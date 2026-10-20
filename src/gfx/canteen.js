// Canteen (Mondo 2) textures: dishes, tables, checkout, wet-floor sign, seated colleagues eating.
import { makeTex } from './painter.js';
import { TEX } from '../config/constants.js';

// White plate seen from the side, bottom of a 16x12 dish texture.
function plate(p) {
  p.r(1, 9, 14, 2, 0xffffff).r(0, 8, 16, 2, 0xe8eef2).r(3, 11, 10, 1, 0x9aa6ae).r(0, 8, 16, 1, 0xffffff);
}

function dishes(scene) {
  makeTex(scene, TEX.DISH_PRIMO, 16, 12, (p) => {
    plate(p);
    // spaghetti mound with tomato sauce and basil
    p.r(3, 4, 10, 4, 0xfff0a0).r(5, 2, 6, 2, 0xfff0a0);
    for (let x = 4; x < 13; x += 2) p.r(x, 4 + (x % 3), 1, 3, 0xe8c860);
    p.r(5, 1, 6, 3, 0xd02010).r(7, 0, 2, 1, 0x20a030);
  });
  makeTex(scene, TEX.DISH_SECONDO, 16, 12, (p) => {
    plate(p);
    // steak with bone and grill marks
    p.r(2, 4, 11, 5, 0x8b4513).r(3, 3, 9, 1, 0xa0522d).r(2, 4, 11, 1, 0xb5652d);
    p.r(4, 5, 1, 3, 0x4a2008).r(7, 5, 1, 3, 0x4a2008).r(10, 5, 1, 3, 0x4a2008);
    p.r(12, 5, 3, 2, 0xf4ecd8).r(14, 4, 2, 4, 0xf4ecd8);
  });
  makeTex(scene, TEX.DISH_CONTORNO, 16, 12, (p) => {
    plate(p);
    // salad: leaves, tomato, carrot
    p.r(2, 5, 12, 3, 0x3fbf4a).r(3, 3, 4, 3, 0x2e9e3a).r(8, 2, 5, 4, 0x4fd85a).r(5, 4, 3, 2, 0x8fe870);
    p.r(10, 5, 3, 2, 0xe03020).r(10, 5, 1, 1, 0xff8070).r(4, 6, 3, 1, 0xff9020);
  });
  makeTex(scene, TEX.DISH_DOLCE, 16, 12, (p) => {
    plate(p);
    // slice of cake with cream and a cherry
    p.r(3, 4, 10, 5, 0xf4c890).r(3, 6, 10, 1, 0xd05080).r(3, 3, 10, 2, 0xfff4f8);
    p.r(4, 2, 2, 1, 0xffffff).r(9, 2, 2, 1, 0xffffff);
    p.r(7, 0, 3, 3, 0xd01030).r(7, 0, 1, 1, 0xff8090);
  });
}

function furniture(scene) {
  makeTex(scene, TEX.CANTEEN_TABLE, 80, 34, (p) => {
    // laminate top
    p.r(0, 0, 80, 6, 0xd8b070).r(0, 0, 80, 2, 0xf0d098).r(0, 5, 80, 1, 0x8a6a38);
    // metal legs and cross bar
    p.r(6, 6, 4, 28, 0x8a9399).r(70, 6, 4, 28, 0x8a9399).r(6, 6, 1, 28, 0xc8d0d6).r(70, 6, 1, 28, 0xc8d0d6);
    p.r(10, 22, 60, 2, 0x6f777c);
    // napkin holder + salt and pepper on top would collide visually: keep them tiny
    p.r(36, 0, 8, 1, 0xffffff);
  });
  makeTex(scene, TEX.CASSA, 48, 56, (p) => {
    // till desk
    p.r(0, 24, 48, 32, 0x3a6ad8).r(0, 24, 48, 3, 0x6a9af8).r(0, 52, 48, 4, 0x1a3a88);
    p.r(4, 30, 40, 18, 0x2a5ac8).box(4, 30, 40, 18, 0x1a3a88);
    // register with display
    p.r(14, 8, 22, 16, 0x333a40).r(16, 10, 18, 6, 0x103010).text('€', 18, 10.5, 0x40ff60, 1).r(24, 12, 8, 1, 0x40ff60);
    p.r(16, 18, 18, 4, 0x555c62);
    for (let x = 17; x < 33; x += 3) p.r(x, 19, 2, 2, 0xd0d6dc);
    // pole light (red = closed, drawn green by tint when the meal is complete)
    p.r(42, 0, 2, 24, 0xc0c0c0).disc(43, 2, 2.5, 0xffffff);
  });
  makeTex(scene, TEX.WET_SIGN, 14, 22, (p) => {
    p.r(2, 0, 10, 2, 0xffd000).r(1, 2, 12, 16, 0xffd000).r(0, 18, 14, 2, 0xffd000);
    p.r(1, 2, 12, 1, 0xfff080).r(0, 20, 3, 2, 0xb08a00).r(11, 20, 3, 2, 0xb08a00);
    p.text('!', 5.5, 5, 0x111111, 1);
    p.r(3, 13, 8, 1, 0x111111).r(4, 12, 2, 1, 0x111111).r(8, 14, 2, 1, 0x111111);
  });
}

// Seated colleague (head + torso; the table in front hides the rest). forkUp = mouth-full frame.
function eater(scene, key, hair, shirt, skin, forkUp) {
  makeTex(scene, key, 24, 26, (p) => {
    p.r(6, 1, 12, 4, hair).r(5, 3, 14, 3, hair);
    p.r(7, 5, 10, 9, skin).r(5, 7, 2, 3, skin).r(17, 7, 2, 3, skin);
    p.r(9, 8, 2, 2, 0x111111).r(13, 8, 2, 2, 0x111111);
    p.r(10, 11, 4, forkUp ? 2 : 1, forkUp ? 0x7a2020 : 0x9a4a3a);
    p.r(4, 14, 16, 12, shirt).r(4, 14, 16, 1, 0xffffff, 0.25);
    if (forkUp) {
      // arm raised, fork at the mouth
      p.r(17, 10, 3, 6, shirt).r(15, 10, 3, 2, skin).r(13, 9, 3, 1, 0xc0c0c0).r(12, 8, 1, 2, 0xc0c0c0);
    } else {
      p.r(18, 16, 3, 8, shirt).r(19, 23, 3, 2, skin).r(21, 20, 1, 4, 0xc0c0c0);
    }
  });
}

export function generateCanteen(scene) {
  dishes(scene);
  furniture(scene);
  eater(scene, TEX.EATER_A1, 0x2b1a0e, 0x2a6ad4, 0xf1c27d, false);
  eater(scene, TEX.EATER_A2, 0x2b1a0e, 0x2a6ad4, 0xf1c27d, true);
  eater(scene, TEX.EATER_B1, 0xe0c060, 0xc0392b, 0xf5d0a9, false);
  eater(scene, TEX.EATER_B2, 0xe0c060, 0xc0392b, 0xf5d0a9, true);
  eater(scene, TEX.EATER_C1, 0x6b3a1f, 0x27ae60, 0xc68642, false);
  eater(scene, TEX.EATER_C2, 0x6b3a1f, 0x27ae60, 0xc68642, true);
}
