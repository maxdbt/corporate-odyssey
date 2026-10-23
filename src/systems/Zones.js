import Phaser from 'phaser';
import { TEX, DEPTH, GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { pinToView } from '../utils/view.js';
import { GameState } from '../state/GameState.js';
import { audio } from './Audio8bit.js';

// Spumante bottle sprites (lying on the floor / held upright), generated once.
function ensureBottleTextures(scene) {
  if (scene.textures.exists('spumante_bottle_lying')) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  // Lying bottle 24x10, mouth on the right
  g.fillStyle(0x0f5a2a).fillRect(0, 2, 14, 8);      // body
  g.fillStyle(0x1f8a44).fillRect(1, 3, 12, 2);      // glass highlight
  g.fillStyle(0xf2e6c8).fillRect(4, 4, 6, 5);       // label
  g.fillStyle(0xc0392b).fillRect(5, 6, 4, 1);
  g.fillStyle(0x0f5a2a).fillRect(14, 4, 6, 4);      // neck
  g.fillStyle(0xd4af37).fillRect(18, 3, 6, 6);      // gold foil
  g.generateTexture('spumante_bottle_lying', 24, 10);
  g.clear();
  // Upright bottle 8x22, mouth on top
  g.fillStyle(0xd4af37).fillRect(2, 0, 4, 5);       // gold foil
  g.fillStyle(0x0f5a2a).fillRect(2, 5, 4, 5);       // neck
  g.fillStyle(0x0f5a2a).fillRect(0, 10, 8, 12);     // body
  g.fillStyle(0x1f8a44).fillRect(1, 11, 2, 10);
  g.fillStyle(0xf2e6c8).fillRect(1, 13, 6, 5);      // label
  g.generateTexture('spumante_bottle_up', 8, 22);
  g.destroy();
}

// Environmental areas: heat, cold, wind, ice, water, puddle (spumante), wet (canteen floor), ladder.
// Each frame they write into player.env (only ever raising flags, so enemies/hazards can also set them).
export default class Zones {
  constructor(scene, defs = []) {
    this.scene = scene;
    this.zones = [];
    this.heatImmuneUntil = 0;
    this.puddleCooldownUntil = 0;
    defs.forEach((d) => this.add(d));
  }

  add(d) {
    const z = { ...d, rect: new Phaser.Geom.Rectangle(d.x, d.y, d.w, d.h), inside: false };
    this.createVisual(z);
    this.zones.push(z);
    return z;
  }

  createVisual(z) {
    const s = this.scene;
    const { x, y, w, h } = z;
    switch (z.type) {
      case 'heat': {
        s.add.rectangle(x, y, w, h, 0xff6a00, 0.13).setOrigin(0).setDepth(DEPTH.ZONES);
        s.add.particles(0, 0, TEX.FX_HEAT, {
          x: { min: x, max: x + w }, y: { min: y + h * 0.5, max: y + h },
          speedY: { min: -60, max: -30 }, lifespan: 1400, frequency: 90,
          alpha: { start: 0.7, end: 0 }, scaleY: { start: 1, end: 2 }
        }).setDepth(DEPTH.ZONES);
        s.add.text(x + w / 2, y + 40, z.label || 'CALDO TORRIDO\n(niente aria)', {
          fontFamily: 'monospace', fontSize: '12px', color: '#ffb000', align: 'center', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(DEPTH.ZONES);
        break;
      }
      case 'cold': {
        s.add.rectangle(x, y, w, h, 0x66ccff, 0.15).setOrigin(0).setDepth(DEPTH.ZONES);
        for (let vx = x + 16; vx < x + w; vx += 96) s.add.image(vx, y + 6, TEX.AC_VENT).setOrigin(0.5, 0).setDepth(DEPTH.DECOR);
        s.add.particles(0, 0, TEX.FX_WIND, {
          x: { min: x, max: x + w }, y: { min: y + 10, max: y + h },
          speedX: { min: -220, max: -120 }, speedY: { min: 20, max: 60 }, lifespan: 900, frequency: 40,
          alpha: { start: 0.9, end: 0 }
        }).setDepth(DEPTH.ZONES);
        s.add.particles(0, 0, TEX.FX_SNOW, {
          x: { min: x, max: x + w }, y: y + 12, speedY: { min: 40, max: 90 }, speedX: { min: -30, max: 10 },
          lifespan: 3500, frequency: 120, alpha: { start: 1, end: 0.3 }
        }).setDepth(DEPTH.ZONES);
        s.add.text(x + w / 2, y + 40, 'ARIA CONDIZIONATA\nAL MASSIMO', {
          fontFamily: 'monospace', fontSize: '12px', color: '#aee8ff', align: 'center', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(DEPTH.ZONES);
        break;
      }
      case 'wind': {
        // Sand streaks across the camera view.
        const p = s.add.particles(0, 0, TEX.FX_WIND, {
          x: { min: 0, max: 900 }, y: { min: 0, max: 450 },
          speedX: { min: -520, max: -320 }, lifespan: 1600, frequency: 25,
          alpha: { start: 0.8, end: 0 }, tint: z.current ? 0xbfe8ff : z.storm ? 0xffffff : 0xffe2a0, scaleX: { min: 1, max: 3 }
        }).setDepth(DEPTH.FX);
        pinToView(p, 0, 0, 0);
        z.emitter = p;
        if (z.storm || z.current) {
          // Blizzard (glacier) / current (sea): only while you are inside it; thick snow or bubbles and a veil.
          const snow = s.add.particles(0, 0, z.current ? TEX.FX_BUBBLE : TEX.FX_SNOW, {
            x: { min: 0, max: 1000 }, y: { min: -20, max: 450 }, speedX: { min: -420, max: -260 },
            speedY: z.current ? { min: -40, max: 10 } : { min: 40, max: 120 },
            lifespan: 1800, frequency: 12, scale: { min: 1, max: 2.2 }, alpha: { start: 1, end: 0.4 }
          }).setDepth(DEPTH.FX);
          pinToView(snow, 0, 0, 0);
          const veil = z.current ? [0x0a3a7a, 0.25] : [0x5a7090, 0.4];
          z.veil = pinToView(s.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, veil[0], veil[1]).setOrigin(0).setDepth(DEPTH.FX - 1), 0, 0, 0).setVisible(false);
          z.emitters = [p, snow];
          z.emitters.forEach((e) => e.stop());
          s.add.text(x + 60, 300, z.label || 'BUFERA', {
            fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold', color: '#ffffff', align: 'center', stroke: '#2a4a8a', strokeThickness: 3
          }).setOrigin(0.5).setDepth(DEPTH.ZONES);
        }
        break;
      }
      case 'water': {
        s.add.rectangle(x, y, w, h, 0x0b4fa8, 0.22).setOrigin(0).setDepth(DEPTH.WATER);
        s.add.particles(0, 0, TEX.FX_BUBBLE, {
          x: { min: x, max: x + w }, y: y + h, speedY: { min: -70, max: -30 }, speedX: { min: -10, max: 10 },
          lifespan: 6000, frequency: 60, alpha: { start: 0.8, end: 0.2 }
        }).setDepth(DEPTH.FX);
        break;
      }
      case 'puddle': {
        for (let px = x; px < x + w; px += 32) s.add.image(px, y + h, TEX.PUDDLE).setOrigin(0, 1).setDepth(DEPTH.DECOR + 1);
        s.add.particles(0, 0, TEX.FX_PX, {
          x: { min: x, max: x + w }, y: y + h - 4, speedY: { min: -40, max: -15 },
          lifespan: 700, frequency: 180, tint: 0xfff2a0, alpha: { start: 1, end: 0 }
        }).setDepth(DEPTH.DECOR + 1);
        this.createSpumanteScene(x, y + h, w);
        break;
      }
      case 'wet': {
        // Freshly mopped canteen floor: a wet sheen, sparkles and a yellow sign at each end.
        s.add.rectangle(x, y + h - 4, w, 4, 0x9fdcff, 0.55).setOrigin(0).setDepth(DEPTH.DECOR + 1);
        s.add.particles(0, 0, TEX.FX_PX, {
          x: { min: x, max: x + w }, y: y + h - 3, speedY: { min: -12, max: -4 },
          lifespan: 600, frequency: 140, tint: 0xffffff, alpha: { start: 1, end: 0 }
        }).setDepth(DEPTH.DECOR + 1);
        [x + 6, x + w - 6].forEach((sx) => s.add.image(sx, y + h, TEX.WET_SIGN).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 2));
        s.add.text(x + w / 2, y + h - 18, 'PAVIMENTO BAGNATO', {
          fontFamily: 'monospace', fontSize: '8px', fontStyle: 'bold', color: '#ffe066', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(DEPTH.DECOR + 2).setAlpha(0.85);
        break;
      }
      default:
        break;
    }
  }

  // Make the spumante puddle readable: a tipped-over bottle leaking into it on the left and a
  // colleague spraying a bottle into it from the right. floorY = puddle surface.
  createSpumanteScene(x, floorY, w) {
    const s = this.scene;
    ensureBottleTextures(s);
    const fizz = { tint: [0xfff2a0, 0xffe066, 0xffffff], alpha: { start: 1, end: 0.2 }, scale: { start: 1.5, end: 0.5 } };

    // Tipped-over bottle, mouth pointing into the puddle, with spumante gushing out.
    s.add.image(x - 4, floorY, 'spumante_bottle_lying').setOrigin(1, 1).setDepth(DEPTH.DECOR + 2);
    s.add.particles(x - 4, floorY - 5, TEX.FX_PX, {
      ...fizz, speedX: { min: 30, max: 80 }, speedY: { min: -50, max: -10 }, gravityY: 300,
      lifespan: 500, frequency: 50
    }).setDepth(DEPTH.DECOR + 2);

    // Colleague spraying spumante in an arc into the puddle.
    const sx = x + w + 22;
    s.add.image(sx, floorY, TEX.PARTY1).setOrigin(0.5, 1).setFlipX(true).setDepth(DEPTH.DECOR + 2);
    s.add.image(sx - 10, floorY - 14, 'spumante_bottle_up').setOrigin(0.5, 1).setAngle(-50).setDepth(DEPTH.DECOR + 3);
    s.add.particles(sx - 22, floorY - 26, TEX.FX_PX, {
      ...fizz, speedX: { min: -(w * 0.9 + 40), max: -(w * 0.4 + 20) }, speedY: { min: -170, max: -110 },
      gravityY: 500, lifespan: 750, frequency: 22
    }).setDepth(DEPTH.DECOR + 3);
    const cheers = s.add.text(sx, floorY - 44, 'CIN CIN!', {
      fontFamily: 'monospace', fontSize: '9px', fontStyle: 'bold', color: '#ffe066', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(DEPTH.DECOR + 3).setAlpha(0);
    s.tweens.add({ targets: cheers, alpha: 1, y: floorY - 52, duration: 500, yoyo: true, hold: 700, repeatDelay: 1800, repeat: -1 });

    s.add.text(x + w / 2, floorY - 18, 'SPUMANTE', {
      fontFamily: 'monospace', fontSize: '8px', fontStyle: 'bold', color: '#fff2a0', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(DEPTH.DECOR + 2).setAlpha(0.85);
  }

  coolDown(ms) {
    this.heatImmuneUntil = this.scene.time.now + ms;
  }

  update(time, delta, player) {
    if (!player || !player.body) return;
    const env = player.env;
    const dt = delta / 1000;
    const px = player.x;
    const py = player.body.center.y;
    const feet = player.body.bottom;

    for (const z of this.zones) {
      let inside;
      if (z.type === 'wind') inside = z.rect.contains(px, py);
      else if (z.type === 'ice' || z.type === 'puddle' || z.type === 'wet') inside = z.rect.contains(px, feet - 1);
      else inside = z.rect.contains(px, py);
      const entered = inside && !z.inside;
      if ((z.storm || z.current) && inside !== z.inside) {
        z.emitters.forEach((e) => (inside ? e.start() : e.stop()));
        z.veil.setVisible(inside);
        if (inside) this.scene.ui?.message?.(z.label || 'BUFERA!', '#ffffff', 1000);
      }
      z.inside = inside;
      if (!inside) continue;

      switch (z.type) {
        case 'heat':
          // Trip: an umbrella in the suitcase works as a parasol.
          if (GameState.hasItem('umbrella')) {
            env.parasol = true;
            if (entered) this.scene.ui?.message?.('L\'OMBRELLO FA DA PARASOLE!', '#ffb000', 1200);
            break;
          }
          if (time > this.heatImmuneUntil) {
            env.heat = true;
            env.speedMult *= 0.6;
            GameState.addStress(3 * dt);
          }
          break;
        case 'cold':
          if (entered && !player.hasStatus('frozen') && !player.hasStatus('cold')) {
            player.applyStatus('frozen', 1000);
            audio.sfx('freeze');
            this.scene.ui?.message?.('CONGELATO!', '#aee8ff', 1000);
          } else if (player.hasStatus('cold')) {
            player.applyStatus('cold', 5000);
          }
          break;
        case 'wind':
          env.windX = z.force ?? -120;
          break;
        case 'ice':
        case 'wet':
          if (player.body.blocked.down || player.body.touching.down) env.ice = true;
          break;
        case 'water':
          env.underwater = true;
          break;
        case 'ladder':
          env.onLadder = true;
          env.ladderX = z.x + z.w / 2;
          break;
        case 'puddle':
          if ((player.body.blocked.down || player.body.touching.down) && time > this.puddleCooldownUntil && !player.hasStatus('drunk')) {
            player.applyStatus('drunk', 5000);
            this.puddleCooldownUntil = time + 6000;
            audio.sfx('splash');
            this.scene.ui?.message?.('HIC! SPUMANTE!', '#fff2a0', 1200);
          }
          break;
        default:
          break;
      }
    }
  }
}
