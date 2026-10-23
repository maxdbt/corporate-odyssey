// Christmas party textures (1-1 SALA FESTE door + PartyScene dance contest), generated once on demand.
import { makeTex } from './painter.js';

const SKIN = 0xf1c27d;

export function ensurePartyTextures(scene) {
  if (scene.textures.exists('party_door')) return;

  // Double door 64x104: red padded leaves, gold handles, portholes glowing with the party lights.
  makeTex(scene, 'party_door', 64, 104, (p) => {
    p.r(0, 0, 64, 104, 0x3a2a1a).r(4, 4, 56, 100, 0x1a1010);
    [6, 33].forEach((x) => {
      p.r(x, 6, 25, 98, 0x8a2a3a).r(x + 1, 7, 23, 2, 0xa83a4a);
      for (let y = 20; y < 100; y += 16) for (let bx = x + 4; bx < x + 24; bx += 8) p.r(bx, y, 2, 2, 0x5a1a2a);
      p.disc(x + 12.5, 26, 7, 0x2a1a3a).disc(x + 12.5, 26, 5, 0xff5ab4).r(x + 10, 23, 2, 2, 0xffffff);
    });
    p.r(27, 56, 3, 12, 0xd4af37).r(34, 56, 3, 12, 0xd4af37);
    // Garland with baubles
    p.r(0, 0, 64, 5, 0x2a7a3a);
    [[6, 0xd02020], [18, 0xffd800], [30, 0x2a6ad8], [42, 0xd02020], [54, 0xffd800]].forEach(([x, c]) => p.r(x, 4, 4, 4, c));
  });
  // "CHIUSO" plank nailed across the door after the party.
  makeTex(scene, 'party_closed', 60, 16, (p) => {
    p.r(0, 2, 60, 12, 0x8a6a3a).r(0, 2, 60, 2, 0xa8884a).r(3, 7, 2, 2, 0x333333).r(55, 7, 2, 2, 0x333333);
    p.text('CHIUSO', 18, 6, 0x2a1a0a);
  });
  // Elf bouncer 28x40: pointy hat, sunglasses, arms crossed, striped tights, curly shoes.
  makeTex(scene, 'elf_bouncer', 28, 40, (p) => {
    const G = 0x2a9a3a;
    for (let i = 0; i < 10; i++) {
      const w = 2 + i * 1.4;
      p.r(14 - w / 2 + (9 - i) * 0.5, i, w, 1, G);
    }
    p.r(19, 0, 3, 3, 0xffffff).r(7, 10, 14, 2, 0xffffff);
    p.r(8, 12, 12, 8, SKIN).r(6, 13, 2, 3, SKIN).r(20, 13, 2, 3, SKIN).r(5, 12, 1, 2, SKIN).r(22, 12, 1, 2, SKIN);
    p.r(8, 14, 12, 3, 0x111111).r(9, 14, 2, 1, 0x6a6a8a).r(15, 14, 2, 1, 0x6a6a8a).r(12, 18, 4, 1, 0x8a4a2a);
    p.r(6, 20, 16, 12, G).r(6, 20, 16, 2, 0xd02020).r(6, 28, 16, 2, 0x111111).r(12, 28, 4, 2, 0xffd800);
    p.r(5, 23, 18, 3, 0x1f7a2c).r(9, 23, 3, 3, SKIN).r(16, 23, 3, 3, SKIN).r(17, 21, 4, 1, 0xffd800);
    for (let y = 32; y < 37; y++) p.r(9, y, 4, 1, y % 2 ? 0xd02020 : 0xffffff).r(15, y, 4, 1, y % 2 ? 0xd02020 : 0xffffff);
    p.r(7, 37, 6, 3, G).r(15, 37, 6, 3, G).r(6, 35, 2, 2, G).r(20, 35, 2, 2, G);
  });
  // Music note 10x14.
  makeTex(scene, 'music_note', 10, 14, (p) => {
    p.disc(3, 11, 3, 0xffffff).r(5, 1, 2, 11, 0xffffff).r(6, 1, 4, 2, 0xffffff).r(8, 3, 2, 2, 0xffffff);
  });
  // Dance arrow 28x28 pointing up (rotated per lane, tinted), with a black outline; hollow target version.
  const arrowShape = (p, c, grow = 0) => {
    for (let i = 0; i < 12; i++) p.r(13 - i - grow, 2 + i - grow, 2 * i + 2 + grow * 2, 1 + grow * 2, c);
    p.r(9 - grow, 13 - grow, 10 + grow * 2, 13 + grow * 2, c);
  };
  makeTex(scene, 'dance_arrow', 28, 28, (p) => {
    arrowShape(p, 0x000000, 1);
    arrowShape(p, 0xffffff);
    p.r(11, 15, 3, 9, 0xe0e0e0);
  });
  makeTex(scene, 'dance_target', 28, 28, (p) => {
    arrowShape(p, 0xffffff, 1);
    arrowShape(p, 0x000000);
  });
  // Mirror ball 32x32: grey facets with a few bright glints.
  makeTex(scene, 'mirror_ball', 32, 32, (p) => {
    p.disc(16, 16, 15, 0x6a6a7a).disc(16, 16, 14, 0xb8b8c8);
    for (let y = 2; y < 30; y += 4) for (let x = 2; x < 30; x += 4) {
      const dx = x + 2 - 16; const dy = y + 2 - 16;
      if (dx * dx + dy * dy < 170) p.r(x, y, 3, 3, (x * 7 + y * 3) % 5 ? 0xd8d8e8 : 0xffffff);
    }
    p.r(9, 7, 3, 3, 0xffffff).r(20, 18, 2, 2, 0xffffff);
  });
  // Cotechino 40x16: dark red sausage tied at both ends.
  makeTex(scene, 'cotechino', 40, 16, (p) => {
    p.r(4, 3, 32, 11, 0x8a2a2a).r(2, 5, 36, 7, 0x8a2a2a).r(6, 4, 26, 2, 0xb04a4a);
    [10, 18, 26].forEach((x) => p.r(x, 3, 1, 11, 0x5a1a1a));
    p.r(0, 7, 3, 3, 0xe8d8a0).r(37, 7, 3, 3, 0xe8d8a0);
  });
}
