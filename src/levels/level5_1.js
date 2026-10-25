import { TEX } from '../config/constants.js';
import { FLOOR, row, arc } from './helpers.js';

const GLASS = 366; // glass desk (20px) top when standing on the floor

// 5-1 Ufficio Legale: first executive floor. Strategy consultants with slides, a Yes-Man, stock market crashes.
export default {
  id: '5-1',
  theme: 'exec',
  groundTex: TEX.T_CARPET,
  exec: true,
  width: 2560,
  timeLimit: 160,
  start: [80, FLOOR],
  ground: [[0, 30], [34, 79]],
  desks: [
    [380, GLASS, true], [480, 300, true],
    [880, 300, true], [1000, 240, true],
    [1450, GLASS, true], [1560, 300, true],
    [2050, GLASS, true], [2150, 300, true]
  ],
  platforms: [[1150, 240, 160], [1820, 260, 128]],
  enemies: [
    ['strategist', 700, FLOOR, { range: 60 }],
    ['guardian', 1250, FLOOR, { patrol: 140 }],
    ['strategist', 1200, 240, { range: 30 }],
    ['yesman', 1700, FLOOR],
    ['strategist', 2300, FLOOR, { range: 40 }]
  ],
  hazards: [['stockcrash', { from: 500, to: 2350, first: 5000, interval: 15000 }]],
  items: [
    ...row('euro', 200, 340, 4),
    ['laptop', 420, 330],
    ...row('euro', 490, 270, 3),
    ...arc('euro', 985, 340, 5, 22, 50),
    ...row('euro', 1010, 210, 3),
    ...row('euro', 1160, 210, 5),
    ['coffee', 1290, 210],
    ...row('euro', 1570, 270, 3),
    ...row('ticket', 1840, 230, 3),
    ['raise', 2160, 270],
    ...row('euro', 2220, 340, 5)
  ],
  terminals: [[1380, FLOOR, 1]],
  decor: [
    ['law_shelf', 160, FLOOR], ['justice_scale', 300, FLOOR], [TEX.GOLD_FRAME, 620, 300],
    ['law_shelf', 820, FLOOR], [TEX.LUX_PLANT, 1360, FLOOR], ['law_shelf', 1640, FLOOR],
    ['justice_scale', 1960, FLOOR], [TEX.GOLD_FRAME, 2260, 290], ['law_shelf', 2380, FLOOR]
  ],
  goal: { type: 'elevator', x: 2490, y: FLOOR },
  elevator: true
};
