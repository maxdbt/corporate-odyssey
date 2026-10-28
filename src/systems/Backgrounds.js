import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, DEPTH, TEX, ANIM, FONT } from '../config/constants.js';
import { pinToView, viewLeft } from '../utils/view.js';

// Themed parallax backgrounds drawn with Graphics primitives (no images). Parallax is horizontal only:
// vertically the layers move with the world (scrollFactorY 1) so they stay aligned when the touch camera scrolls up.
const THEMES = {
  xmas:    { top: 0x2b2f4a, bottom: 0x4b4f6e, wall: 0xc9bfa6, wallDark: 0xa89c80 },
  summer:  { top: 0xffc36b, bottom: 0xffe7b0, wall: 0xe8d7a8, wallDark: 0xcdb682 },
  canteen: { top: 0x9fd3c7, bottom: 0xd8efe8, wall: 0xe6e6e6, wallDark: 0xbfc7c4 },
  meeting: { top: 0x10142e, bottom: 0x23295a, wall: 0x2d356e, wallDark: 0x1f2552 },
  desert:  { top: 0xff9a3c, bottom: 0xffd98a, wall: 0xe0a85a, wallDark: 0xc4883d },
  glacier: { top: 0x7fb8e6, bottom: 0xe2f3ff, wall: 0xcfe9ff, wallDark: 0x9cc8ea },
  sea:     { top: 0x0d6cb5, bottom: 0x03203f, wall: 0x0a3d6b, wallDark: 0x072b4d },
  exec:    { top: 0x3a0d12, bottom: 0x6b1a22, wall: 0xc9a227, wallDark: 0x9c7a12 },
  airport: { top: 0x6fb8ff, bottom: 0xd8eeff, wall: 0xe8ecf2, wallDark: 0xb8c0cc },
  station: { top: 0x8a96a8, bottom: 0xc8ccd4, wall: 0x9a8a78, wallDark: 0x6a5a4a },
  roof:    { top: 0x3a1a5a, bottom: 0xff9a50, wall: 0x2a1a3a, wallDark: 0x1a1028 }
};

const rnd = (seed) => {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};

export function drawBackground(scene, theme, worldW) {
  const t = THEMES[theme] || THEMES.xmas;
  const sky = pinToView(scene.add.graphics(), 0, 0, 0, 1).setDepth(DEPTH.BG);
  sky.fillGradientStyle(t.top, t.top, t.bottom, t.bottom, 1);
  sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const farW = worldW * 0.25 + GAME_WIDTH;
  const midW = worldW * 0.5 + GAME_WIDTH;
  const far = pinToView(scene.add.graphics(), 0, 0, 0.25, 1).setDepth(DEPTH.BG + 1);
  const mid = pinToView(scene.add.graphics(), 0, 0, 0.5, 1).setDepth(DEPTH.BG + 2);
  const r = rnd(theme.length * 977);

  switch (theme) {
    case 'xmas':
    case 'summer': {
      // Office wall with windows, wainscoting.
      mid.fillStyle(t.wall, 1).fillRect(0, 60, midW, 330);
      mid.fillStyle(t.wallDark, 1).fillRect(0, 300, midW, 90);
      for (let x = 40; x < midW; x += 220) {
        mid.fillStyle(0x333333, 1).fillRect(x - 4, 96, 128, 104);
        mid.fillStyle(theme === 'xmas' ? 0x0d1636 : 0x8fd4ff, 1).fillRect(x, 100, 120, 96);
        if (theme === 'xmas') {
          mid.fillStyle(0xffffff, 1);
          for (let i = 0; i < 8; i++) mid.fillRect(x + r() * 116, 100 + r() * 92, 3, 3);
          // garland
          for (let gx = x - 20; gx < x + 160; gx += 12) {
            mid.fillStyle(0x1f8a3a, 1).fillRect(gx, 78 + Math.sin(gx / 15) * 5, 12, 6);
            mid.fillStyle([0xff3030, 0xffd800, 0x30a0ff][(gx / 12 | 0) % 3], 1).fillRect(gx + 4, 84 + Math.sin(gx / 15) * 5, 4, 4);
          }
        } else {
          mid.fillStyle(0xfff35c, 1).fillCircle(x + 90, 130, 16);
          mid.fillStyle(0xffffff, 0.8).fillRect(x + 10, 150, 40, 8);
        }
        mid.fillStyle(0x333333, 1).fillRect(x + 58, 96, 4, 104).fillRect(x - 4, 146, 128, 4);
      }
      // Far: ceiling lights
      far.fillStyle(0xffffff, 0.5);
      for (let x = 0; x < farW; x += 160) far.fillRect(x, 20, 80, 8);
      break;
    }
    case 'canteen': {
      // Tiled wall, big windows on the garden, menu boards and a wainscot.
      mid.fillStyle(t.wall, 1).fillRect(0, 40, midW, 360);
      for (let x = 0; x < midW; x += 24) for (let y = 40; y < 250; y += 24) {
        mid.fillStyle(((x + y) / 24) % 2 ? 0xdfe6e3 : 0xf2f5f4, 1).fillRect(x, y, 23, 23);
      }
      mid.fillStyle(0x7fb8a8, 1).fillRect(0, 250, midW, 150);
      mid.fillStyle(0x5f9888, 1).fillRect(0, 250, midW, 6);
      for (let x = 40; x < midW; x += 360) {
        mid.fillStyle(0x4a5a60, 1).fillRect(x - 4, 66, 168, 128);
        mid.fillStyle(0x9fe0ff, 1).fillRect(x, 70, 160, 120);
        mid.fillStyle(0x6fc060, 1).fillRect(x, 150, 160, 40);
        mid.fillStyle(0x3f9a40, 1).fillEllipse(x + 40, 150, 50, 34).fillEllipse(x + 120, 146, 60, 40);
        mid.fillStyle(0xffffff, 0.6).fillRect(x + 12, 80, 30, 6).fillRect(x + 100, 92, 40, 6);
        mid.fillStyle(0x4a5a60, 1).fillRect(x + 78, 70, 4, 120).fillRect(x, 128, 160, 4);
        // menu board
        const mx = x + 200;
        mid.fillStyle(0x6b4a2b, 1).fillRect(mx - 4, 76, 118, 92);
        mid.fillStyle(0x203028, 1).fillRect(mx, 80, 110, 84);
        mid.fillStyle(0xffd800, 1).fillRect(mx + 30, 86, 50, 6);
        mid.fillStyle(0xffffff, 0.85);
        [100, 114, 128, 142, 156].forEach((y, k) => mid.fillRect(mx + 10, y, 50 + ((k * 23) % 40), 3).fillRect(mx + 92, y, 10, 3));
      }
      far.fillStyle(0xffffff, 0.6);
      for (let x = 0; x < farW; x += 140) far.fillRect(x, 10, 70, 10);
      drawCanteenDiners(scene, worldW);
      break;
    }
    case 'meeting': {
      mid.fillStyle(t.wall, 1).fillRect(0, 30, midW, 370);
      for (let x = 50; x < midW; x += 260) {
        mid.fillStyle(0xf4f4f4, 1).fillRect(x, 80, 140, 80);
        mid.fillStyle(0x3355ff, 1).fillRect(x + 10, 140, 20, 12);
        mid.fillStyle(0xff3355, 1).fillRect(x + 36, 128, 20, 24);
        mid.fillStyle(0x33cc66, 1).fillRect(x + 62, 110, 20, 42);
        mid.fillStyle(0x222222, 1).fillRect(x + 90, 92, 40, 3).fillRect(x + 90, 102, 30, 3);
      }
      far.fillStyle(0xffd800, 0.25);
      for (let i = 0; i < 40; i++) far.fillRect(r() * farW, 200 + r() * 200, 14, 14);
      break;
    }
    case 'desert': {
      far.fillStyle(0xfff3a0, 1).fillCircle(GAME_WIDTH * 0.7, 90, 40);
      far.fillStyle(0xe8b060, 1);
      for (let x = 0; x < farW; x += 200) far.fillEllipse(x + 100, 330, 360, 160);
      mid.fillStyle(0xd99a48, 1);
      for (let x = 0; x < midW; x += 260) mid.fillEllipse(x + 130, 380, 420, 180);
      // pyramids of binders
      mid.fillStyle(0xb57a30, 1);
      for (let x = 120; x < midW; x += 700) mid.fillTriangle(x, 330, x + 80, 220, x + 160, 330);
      break;
    }
    case 'glacier': {
      far.fillStyle(0xffffff, 0.9);
      for (let x = 0; x < farW; x += 180) far.fillTriangle(x, 330, x + 90, 120 + r() * 60, x + 180, 330);
      mid.fillStyle(0xa9d4f5, 1);
      for (let x = 0; x < midW; x += 240) mid.fillTriangle(x, 380, x + 120, 200 + r() * 60, x + 240, 380);
      mid.fillStyle(0xffffff, 0.8);
      for (let x = 0; x < midW; x += 240) mid.fillTriangle(x + 90, 245, x + 120, 215, x + 150, 245);
      break;
    }
    case 'sea': {
      far.fillStyle(0x9fd8ff, 0.12);
      for (let x = 0; x < farW; x += 120) far.fillTriangle(x, 0, x + 50, 0, x + 140, 450);
      mid.fillStyle(0x0a4a7a, 1);
      for (let x = 0; x < midW; x += 180) mid.fillEllipse(x + 90, 430, 260, 140);
      mid.fillStyle(0x1b7a5a, 1);
      for (let x = 30; x < midW; x += 90) mid.fillRect(x, 330 + r() * 40, 6, 80);
      break;
    }
    case 'exec': {
      mid.fillStyle(t.wall, 1).fillRect(0, 30, midW, 370);
      for (let x = 0; x < midW; x += 120) {
        mid.fillStyle(t.wallDark, 1).fillRect(x + 8, 50, 104, 240);
        mid.fillStyle(0xe8c547, 1).fillRect(x + 14, 56, 92, 228);
        mid.fillStyle(t.wallDark, 1).fillRect(x + 20, 62, 80, 216);
      }
      for (let x = 60; x < midW; x += 480) {
        mid.fillStyle(0x6b4a12, 1).fillRect(x, 90, 110, 80);
        mid.fillStyle(0x2e5a8a, 1).fillRect(x + 8, 98, 94, 64);
        mid.fillStyle(0xffffff, 0.4).fillRect(x + 20, 110, 30, 20);
      }
      far.fillStyle(0xfff2b0, 0.7);
      for (let x = 0; x < farW; x += 200) { far.fillCircle(x + 100, 24, 10); far.fillRect(x + 98, 0, 4, 16); }
      break;
    }
    case 'roof': {
      // Sunset over the city: low sun, far skyline, nearer towers with lit windows.
      far.fillStyle(0xffe070, 1).fillCircle(GAME_WIDTH * 0.65, 300, 46);
      far.fillStyle(0xff7040, 0.5).fillRect(0, 290, farW, 6).fillRect(0, 310, farW, 4);
      far.fillStyle(0x5a2a5a, 1);
      for (let x = 0; x < farW; x += 50) { const h = 60 + r() * 110; far.fillRect(x, 400 - h, 44, h); }
      mid.fillStyle(t.wall, 1);
      for (let x = 0; x < midW; x += 110) {
        const h = 90 + r() * 120;
        mid.fillStyle(t.wall, 1).fillRect(x, 420 - h, 96, h);
        mid.fillStyle(0xffd070, 0.8);
        for (let wy = 430 - h; wy < 400; wy += 18) for (let wx = x + 10; wx < x + 90; wx += 16) if (r() < 0.45) mid.fillRect(wx, wy, 8, 8);
      }
      break;
    }
    case 'airport': {
      // Glass wall on the runway with planes taking off, steel frame, check-in signs.
      far.fillStyle(0x9a9aa0, 1).fillRect(0, 300, farW, 20);
      far.fillStyle(0xffffff, 1);
      for (let x = 60; x < farW; x += 420) {
        const y = 150 + r() * 80;
        far.fillRect(x, y, 60, 8).fillTriangle(x + 20, y, x + 34, y - 18, x + 40, y).fillTriangle(x, y, x + 8, y - 10, x + 12, y);
        far.fillStyle(0x2a6ad8, 1).fillRect(x + 6, y + 3, 50, 2);
        far.fillStyle(0xffffff, 1);
      }
      mid.fillStyle(0x5a6270, 1);
      for (let x = 0; x < midW; x += 160) mid.fillRect(x, 40, 6, 330);
      mid.fillRect(0, 40, midW, 8).fillRect(0, 210, midW, 4);
      mid.fillStyle(t.wallDark, 1).fillRect(0, 330, midW, 60);
      for (let x = 80; x < midW; x += 640) {
        mid.fillStyle(0x2a3a5a, 1).fillRect(x, 260, 200, 70);
        mid.fillStyle(0xffd800, 1).fillRect(x + 10, 268, 180, 14);
        mid.fillStyle(0x2a3a5a, 1).fillRect(x + 20, 271, 60, 8);
        mid.fillStyle(0xd8dce2, 1).fillRect(x + 12, 292, 50, 30).fillRect(x + 74, 292, 50, 30).fillRect(x + 136, 292, 50, 30);
      }
      break;
    }
    case 'station': {
      // Old station hall: brick wall, arched windows, a train waiting on the far track.
      mid.fillStyle(t.wall, 1).fillRect(0, 40, midW, 360);
      mid.fillStyle(t.wallDark, 1);
      for (let y = 48; y < 330; y += 12) for (let x = (y / 12) % 2 ? 0 : 16; x < midW; x += 32) mid.fillRect(x, y, 30, 1);
      for (let x = 60; x < midW; x += 300) {
        mid.fillStyle(0x3a3028, 1).fillRect(x - 4, 76, 128, 150).fillCircle(x + 60, 80, 64);
        mid.fillStyle(0xbfd8f0, 1).fillRect(x, 80, 120, 142).fillCircle(x + 60, 84, 60);
        mid.fillStyle(0x3a3028, 1).fillRect(x + 58, 20, 4, 202).fillRect(x, 150, 120, 4);
      }
      mid.fillStyle(0x4a4a4a, 1).fillRect(0, 300, midW, 90);
      for (let x = 0; x < midW; x += 900) {
        mid.fillStyle(0x1f7a3a, 1).fillRect(x + 100, 296, 520, 54);
        mid.fillStyle(0xffffff, 1).fillRect(x + 100, 330, 520, 4);
        mid.fillStyle(0xbfe0ff, 1);
        for (let wx = x + 120; wx < x + 600; wx += 50) mid.fillRect(wx, 304, 34, 18);
      }
      far.fillStyle(0xffffff, 0.5);
      for (let x = 0; x < farW; x += 180) far.fillRect(x, 14, 90, 8);
      break;
    }
    default:
      break;
  }
}

// Canteen: rows of tables with colleagues eating, on their own parallax layer (scroll factor 0.75).
// Purely decorative: they chew, turn around and chat with each other.
const DINER_ANIMS = [ANIM.EATER_A, ANIM.EATER_B, ANIM.EATER_C];
const DINER_LINES = ['BUONO!', 'CHE FAME', 'HAI VISTO LA MAIL?', 'IL CAPO...', 'PASSAMI IL SALE', 'BLA BLA', 'GNAM', 'DI NUOVO PASTA?', 'RIUNIONE ALLE 14?'];

function drawCanteenDiners(scene, worldW) {
  const SF = 0.75;
  const TOP = 312;           // table top (view coordinates): further back than the playable tables
  const S = 0.8;             // smaller = farther away
  const nearW = worldW * SF + GAME_WIDTH;
  // Far floor the diners sit on, darker than the playable checkerboard.
  const floor = pinToView(scene.add.graphics(), 0, 0, 0, 1).setDepth(DEPTH.BG + 3);
  floor.fillStyle(0x5f8078, 1).fillRect(0, TOP + 26, GAME_WIDTH, GAME_HEIGHT - TOP - 26);
  floor.fillStyle(0x4a6660, 1).fillRect(0, TOP + 26, GAME_WIDTH, 3);
  const tables = pinToView(scene.add.graphics(), 0, 0, SF, 1).setDepth(DEPTH.BG + 4);
  const diners = [];
  const r = rnd(4242);
  for (let x = 30; x < nearW; x += 230 + Math.floor(r() * 60)) {
    const w = 100;
    // diners behind the table, some facing each other
    const seats = 2 + Math.floor(r() * 2);
    for (let i = 0; i < seats; i++) {
      const dx = x + 18 + i * ((w - 36) / Math.max(1, seats - 1));
      const d = scene.add.sprite(0, 0, TEX.EATER_A1).setOrigin(0.5, 1).setDepth(DEPTH.BG + 3).setTint(0xc8d0cc).setScale(S);
      pinToView(d, dx, TOP + 8, SF, 1);
      d.px = dx;
      d.setFlipX(r() < 0.5);
      d.play({ key: DINER_ANIMS[Math.floor(r() * 3)], frameRate: 1.5 + r() * 2, startFrame: Math.floor(r() * 2) });
      diners.push(d);
    }
    tables.fillStyle(0xa08058, 1).fillRect(x, TOP, w, 5);
    tables.fillStyle(0xbfa070, 1).fillRect(x, TOP, w, 2);
    tables.fillStyle(0x6a7379, 1).fillRect(x + 6, TOP + 5, 3, 22).fillRect(x + w - 9, TOP + 5, 3, 22);
    // trays and glasses on the table
    for (let tx = x + 10; tx < x + w - 20; tx += 34) {
      tables.fillStyle(0xc05030, 1).fillRect(tx, TOP - 2, 16, 2);
      tables.fillStyle(0xe8e8e8, 1).fillRect(tx + 4, TOP - 4, 7, 2);
      tables.fillStyle(0xbfefff, 0.8).fillRect(tx + 19, TOP - 6, 2, 6);
    }
  }
  // Every so often a diner turns around and says something.
  scene.time.addEvent({
    delay: 1300,
    loop: true,
    callback: () => {
      const left = viewLeft(scene.cameras.main) * SF;
      const visible = diners.filter((d) => d.px - left > 60 && d.px - left < GAME_WIDTH - 60);
      if (!visible.length) return;
      const d = Phaser.Utils.Array.GetRandom(visible);
      d.toggleFlipX();
      const t = scene.add.text(0, 0, Phaser.Utils.Array.GetRandom(DINER_LINES), {
        fontFamily: FONT, fontSize: '7px', fontStyle: 'bold', color: '#ffffff', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5, 1).setDepth(DEPTH.BG + 5).setAlpha(0.9);
      pinToView(t, d.px, TOP - 16, SF, 1);
      scene.tweens.add({ targets: t, y: t.y - 10, alpha: 0, delay: 700, duration: 600, onComplete: () => t.destroy() });
    }
  });
}
