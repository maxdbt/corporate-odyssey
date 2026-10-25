import { TEX } from '../config/constants.js';
import { FLOOR, row } from './helpers.js';

const GLASS = 366; // glass desk (20px) top when standing on the floor

// 5-4 L'Attico: short approach, then the Mega-Direttore (phase 1 on the throne, phase 2 on foot).
// Below 30% hp he runs away to the roof: the level ends and 5-5 follows.
export default {
  id: '5-4',
  theme: 'exec',
  groundTex: TEX.T_CARPET,
  exec: true,
  width: 2400,
  timeLimit: 240,
  start: [80, FLOOR],
  ground: [[0, 74]],
  desks: [[400, GLASS, true], [500, 300, true], [1000, GLASS, true], [1100, 300, true]],
  platforms: [[1850, 290, 96], [2150, 290, 96]],
  enemies: [
    ['yesman', 700, FLOOR],
    ['strategist', 1250, FLOOR, { range: 40 }]
  ],
  items: [
    ...row('euro', 200, 340, 4),
    ...row('euro', 510, 270, 3),
    ['coffee', 850, 330],
    ...row('euro', 1110, 270, 3),
    ['laptop', 1380, 330],
    ['vacation', 1450, 320],
    ['coffee', 1510, 330]
  ],
  decor: [
    [TEX.LUX_PLANT, 150, FLOOR], [TEX.GOLD_FRAME, 300, 300], ['law_shelf', 760, FLOOR],
    [TEX.GOLD_FRAME, 1300, 300], [TEX.LUX_PLANT, 1560, FLOOR], [TEX.GOLD_FRAME, 2000, 260]
  ],
  boss: {
    type: 'boss_ceo',
    triggerX: 1720,
    checkpoint: 1620,
    x: 2200,
    y: FLOOR,
    props: { flee: true },
    arena: { left: 1600, right: 2400, floorY: FLOOR, ceilingY: 40 }
  }
};
