import { TEX } from '../config/constants.js';
import { FLOOR, row, arc } from './helpers.js';

const GLASS = 366; // glass desk (20px) top when standing on the floor

// 5-1 La Cima della Piramide: luxury executive floor, Budget Guardians, final boss "Il Mega-Direttore".
export default {
  id: '5-1',
  theme: 'exec',
  groundTex: TEX.T_CARPET,
  width: 6400,
  timeLimit: 360,
  final: true,
  start: [80, FLOOR],
  ground: [[0, 80], [83, 140], [143, 199]],
  desks: [
    [400, GLASS, true], [520, 300, true],
    [1000, GLASS, true], [1120, 300, true], [1240, 240, true],
    [1800, GLASS, true], [1920, 300, true],
    [2450, GLASS, true], [2540, 300, true],
    [3000, GLASS, true], [3120, 300, true], [3240, 240, true],
    [3900, GLASS, true], [4020, 300, true],
    [4400, GLASS, true], [4460, 300, true],
    [5000, GLASS, true], [5120, 300, true]
  ],
  platforms: [[1400, 232, 200], [5850, 290, 96], [6150, 290, 96]],
  ladders: [[1580, 232, FLOOR]],
  enemies: [
    ['teamsicon', 1000, FLOOR], ['teamsicon', 2700, FLOOR], ['teamsicon', 4200, FLOOR],
    ['guardian', 700, FLOOR, { patrol: 160 }],
    ['minute', 1350, FLOOR, { range: 260 }],
    ['clienthell', 1832, FLOOR, { dir: -1 }],
    ['guardian', 2200, FLOOR, { patrol: 180 }],
    ['bug', 2560, 300],
    ['talker', 2900, FLOOR],
    ['guardian', 3700, FLOOR, { patrol: 160 }],
    ['confcall', 4100, 160, { range: 220 }],
    ['clienthell', 4432, FLOOR, { dir: -1 }],
    ['guardian', 4800, FLOOR, { patrol: 200 }],
    ['minute', 5250, FLOOR, { range: 260 }]
  ],
  hazards: [['mailrain', { from: 4000, to: 4400, interval: 900 }]],
  items: [
    ...row('euro', 200, 340, 5),
    ...row('euro', 530, 270, 3),
    ['coffee', 900, 330],
    ...row('euro', 1130, 270, 3),
    ...row('ticket', 1250, 210, 2),
    ...row('euro', 1420, 200, 7),
    ['car', 1500, 200],
    ...row('euro', 1930, 270, 3),
    ...arc('euro', 2575, 330, 5, 22, 60),
    ['promotion', 2700, 330],
    ...row('euro', 3130, 270, 3),
    ['raise', 3260, 200],
    ...row('euro', 3300, 340, 8),
    ...row('ticket', 4030, 270, 2),
    ...arc('euro', 4495, 330, 5, 22, 60),
    ['coffee', 4700, 330],
    ...row('euro', 5130, 270, 3),
    ['laptop', 5380, 330],
    ['vacation', 5460, 320],
    ['coffee', 5520, 330]
  ],
  terminals: [[2300, FLOOR, 3]],
  decor: [
    [TEX.LUX_PLANT, 150, FLOOR], [TEX.GOLD_FRAME, 300, 300], [TEX.LUX_PLANT, 900, FLOOR],
    [TEX.GOLD_FRAME, 1700, 300], [TEX.LUX_PLANT, 2350, FLOOR], [TEX.GOLD_FRAME, 2800, 300],
    [TEX.LUX_PLANT, 3400, FLOOR], [TEX.GOLD_FRAME, 4200, 300], [TEX.LUX_PLANT, 4900, FLOOR],
    [TEX.LUX_PLANT, 5560, FLOOR], [TEX.GOLD_FRAME, 6000, 260]
  ],
  boss: {
    type: 'boss_ceo',
    triggerX: 5720,
    x: 6200,
    y: FLOOR,
    arena: { left: 5600, right: 6400, floorY: FLOOR, ceilingY: 40 }
  }
};
