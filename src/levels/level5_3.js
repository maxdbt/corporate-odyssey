import { TEX } from '../config/constants.js';
import { FLOOR, row, arc } from './helpers.js';

const GLASS = 366; // glass desk (20px) top when standing on the floor

// 5-3 La Segreteria: the Mega-Direttore's secretary guards a glass gate. The VIP badge waits high up,
// at the top of a climb of desks and shelves before the gate.
export default {
  id: '5-3',
  theme: 'exec',
  groundTex: TEX.T_CARPET,
  exec: true,
  width: 2720,
  timeLimit: 170,
  start: [80, FLOOR],
  ground: [[0, 22], [26, 84]],
  desks: [
    [350, GLASS, true], [460, 300, true],
    [1150, GLASS, true], [1260, 300, true], [1370, 240, true]
  ],
  platforms: [[860, 300, 96], [1480, 180, 128], [1330, 120, 112], [2250, 300, 96]],
  ladders: [[1600, 180, FLOOR]],
  enemies: [
    ['strategist', 620, FLOOR, { range: 50 }],
    ['yesman', 1000, FLOOR],
    ['guardian', 1500, FLOOR, { patrol: 120 }],
    ['secretary', 1950, FLOOR, { badge: [1385, 80], gateDx: 34 }],
    ['strategist', 2500, FLOOR, { range: 40 }]
  ],
  hazards: [['stockcrash', { from: 400, to: 1900, first: 8000, interval: 17000 }]],
  items: [
    ...row('euro', 180, 340, 4),
    ...row('euro', 470, 270, 3),
    ...arc('euro', 860, 270, 5, 22, 40),
    ['coffee', 1050, 330],
    ...row('euro', 1270, 270, 3),
    ...row('euro', 1490, 150, 5),
    ['raise', 1820, 330],
    ...arc('euro', 2250, 270, 5, 22, 40),
    ...row('euro', 2440, 340, 5)
  ],
  terminals: [[760, FLOOR, 3]],
  decor: [
    [TEX.GOLD_FRAME, 220, 300], ['exec_sofa', 560, FLOOR], [TEX.LUX_PLANT, 700, FLOOR],
    ['water_cooler', 1100, FLOOR], [TEX.GOLD_FRAME, 1700, 300], ['exec_sofa', 1780, FLOOR],
    ['reception', 1895, FLOOR], [TEX.LUX_PLANT, 2120, FLOOR], [TEX.GOLD_FRAME, 2500, 300]
  ],
  goal: { type: 'elevator', x: 2650, y: FLOOR },
  elevator: true
};
