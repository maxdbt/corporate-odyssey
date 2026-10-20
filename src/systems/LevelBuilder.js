import Phaser from 'phaser';
import { TEX, DEPTH, TILE, GAME_HEIGHT } from '../config/constants.js';
import Collectible from '../entities/Collectible.js';

/*
  Level data format (all coordinates in px; world height 450, surfaces are "top" y values):
  {
    id, theme, groundTex, width, timeLimit, start: [x, y],
    ground:    [[x0Tile, x1Tile, heightTiles = 2, tex?]]      solid floor columns (gaps = pits)
    blocks:    [[x, y, w, h, tex?]]                            solid rectangles (tex null = invisible)
    desks:     [[x, y, glass?]]                                one-way desks, x = left, y = top surface
    platforms: [[x, y, w, tex?]]                               one-way 16px tall platforms
    postits:   [[x, y, color]]                                 vanishing post-its (1.5 s), color yellow|orange|green
    ladders:   [[x, top, bottom]]                              x = center
    zones:     [{ type, x, y, w, h, force? }]                  heat|cold|wind|ice|water|puddle|wet
    enemies:   [[type, x, y, props?]]                          ground enemies: y = surface
    hazards:   [[type, props]]
    items:     [[kind, x, y]]                                  x,y = center
    terminals: [[x, y, quizId]]                                y = surface
    decor:     [[tex, x, y]]                                   y = bottom
    tables:    [[x, y]]                                        canteen tables (one-way), x = center, y = floor
    counters:  [[x, y]]                                        canteen counters (one-way top), x = center, y = floor
    goal:      { type: 'door'|'cassa', x, y }                  y = surface (cassa = canteen checkout)
    boss:      { type, triggerX, x, y, arena }                 exit door appears after defeat (unless final)
    autoscroll: speed px/s (optional), final: bool
  }
*/

const ICE_TEX = [TEX.T_ICE, TEX.ICE_PLATFORM];
const POSTIT_TEX = { yellow: TEX.POSTIT_YELLOW, orange: TEX.POSTIT_ORANGE, green: TEX.POSTIT_GREEN };

export default class LevelBuilder {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;
    this.zoneDefs = [...(level.zones || [])];
  }

  build() {
    const L = this.level;
    (L.ground || []).forEach(([x0, x1, h = 2, tex]) => {
      const x = x0 * TILE;
      const w = (x1 - x0 + 1) * TILE;
      const y = GAME_HEIGHT - h * TILE;
      this.solid(x, y, w, GAME_HEIGHT - y + 2, tex || L.groundTex);
    });
    (L.blocks || []).forEach(([x, y, w, h, tex]) => this.solid(x, y, w, h, tex === undefined ? (L.blockTex || TEX.T_BLOCK) : tex));
    (L.desks || []).forEach(([x, y, glass]) => this.desk(x, y, glass));
    (L.platforms || []).forEach(([x, y, w, tex]) => this.platform(x, y, w, tex || TEX.T_BLOCK));
    (L.postits || []).forEach(([x, y, color]) => this.postit(x, y, color));
    (L.tables || []).forEach(([x, y]) => this.table(x, y));
    (L.counters || []).forEach(([x, y]) => this.counter(x, y));
    (L.ladders || []).forEach(([x, top, bottom]) => this.ladder(x, top, bottom));
    (L.decor || []).forEach(([tex, x, y]) => this.scene.add.image(x, y, tex).setOrigin(0.5, 1).setDepth(DEPTH.DECOR));
    (L.items || []).forEach(([kind, x, y]) => new Collectible(this.scene, x, y, kind));
    (L.terminals || []).forEach(([x, y, quizId]) => this.terminal(x, y, quizId));
    if (L.goal) this.goal(L.goal);
    return { zoneDefs: this.zoneDefs };
  }

  // Solid rectangle: tiled visual + one static body.
  solid(x, y, w, h, tex) {
    const s = this.scene;
    if (tex) {
      s.add.tileSprite(x, y, w, h, tex).setOrigin(0).setDepth(DEPTH.PLATFORMS);
    }
    const z = s.add.zone(x + w / 2, y + h / 2, w, h);
    s.platforms.add(z);
    if (ICE_TEX.includes(tex)) this.zoneDefs.push({ type: 'ice', x, y: y - 6, w, h: 14 });
    return z;
  }

  oneWayBody(x, y, w, h = 8, group = this.scene.oneWay) {
    const z = this.scene.add.zone(x + w / 2, y + h / 2, w, h);
    group.add(z);
    return z;
  }

  desk(x, y, glass) {
    const tex = glass ? TEX.DESK_GLASS : TEX.DESK;
    this.scene.add.image(x, y, tex).setOrigin(0, 0).setDepth(DEPTH.PLATFORMS);
    this.oneWayBody(x, y, 64);
  }

  platform(x, y, w, tex) {
    this.scene.add.tileSprite(x, y, w, 16, tex).setOrigin(0).setDepth(DEPTH.PLATFORMS);
    this.oneWayBody(x, y, w);
    if (ICE_TEX.includes(tex)) this.zoneDefs.push({ type: 'ice', x, y: y - 6, w, h: 14 });
  }

  postit(x, y, color = 'yellow') {
    const s = this.scene;
    const sprite = s.add.image(x, y, POSTIT_TEX[color] || TEX.POSTIT_YELLOW).setOrigin(0, 0).setDepth(DEPTH.PLATFORMS);
    sprite.setAngle(Phaser.Math.Between(-4, 4));
    const z = this.oneWayBody(x, y, 44, 8, s.postits);
    z.postit = { sprite, triggered: false, homeX: x };
  }

  // Canteen table: walk under it, jump on top of it.
  table(x, y) {
    this.scene.add.image(x, y, TEX.CANTEEN_TABLE).setOrigin(0.5, 1).setDepth(DEPTH.PLATFORMS);
    this.oneWayBody(x - 40, y - 34, 80);
  }

  // Self-service counter: the cook stands on its top (behind the sneeze guard).
  counter(x, y) {
    this.scene.add.image(x, y, TEX.COUNTER).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 1);
    this.oneWayBody(x - 48, y - 42, 96);
  }

  ladder(x, top, bottom) {
    const h = bottom - top;
    this.scene.add.tileSprite(x, top, 20, h, TEX.LADDER).setOrigin(0.5, 0).setDepth(DEPTH.DECOR + 1);
    this.zoneDefs.push({ type: 'ladder', x: x - 10, y: top - 4, w: 20, h: h + 4 });
  }

  terminal(x, y, quizId) {
    const s = this.scene;
    const t = s.physics.add.staticImage(x, y, TEX.TERMINAL).setOrigin(0.5, 1).refreshBody().setDepth(DEPTH.ITEMS);
    t.quizId = quizId;
    t.used = false;
    s.terminals.add(t);
    t.label = s.add.text(x, y - 40, '?', {
      fontFamily: 'monospace', fontSize: '16px', fontStyle: 'bold', color: '#ffd800', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(DEPTH.ITEMS);
    s.tweens.add({ targets: t.label, y: y - 46, duration: 500, yoyo: true, repeat: -1 });
  }

  goal({ type, x, y }) {
    const s = this.scene;
    if (type === 'cassa') {
      s.goal = s.physics.add.staticImage(x, y, TEX.CASSA).setOrigin(0.5, 1).refreshBody().setDepth(DEPTH.DECOR + 2);
      s.goal.label = s.add.text(x, y - 66, 'CASSA', {
        fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold', color: '#ff6060', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(DEPTH.DECOR + 2);
    } else {
      s.goal = s.physics.add.staticImage(x, y, TEX.DOOR_EXIT).setOrigin(0.5, 1).refreshBody().setDepth(DEPTH.DECOR + 2);
      s.add.text(x, y - 60, 'USCITA', {
        fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold', color: '#7CFC00', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(DEPTH.DECOR + 2);
    }
    return s.goal;
  }
}
