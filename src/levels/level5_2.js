import { TEX } from '../config/constants.js';
import { FLOOR, row, arc } from './helpers.js';

const GLASS = 366; // glass desk (20px) top when standing on the floor

// 5-2 Risorse Umane: Yes-Men who multiply, a talker, motivational posters, stock market crashes.
export default {
  id: '5-2',
  theme: 'exec',
  groundTex: TEX.T_CARPET,
  exec: true,
  width: 2560,
  timeLimit: 160,
  start: [80, FLOOR],
  ground: [[0, 24], [28, 50], [54, 79]],
  desks: [
    [300, GLASS, true], [410, 300, true],
    [1000, GLASS, true], [1100, 300, true], [1200, 240, true],
    [1900, GLASS, true], [2000, 300, true]
  ],
  platforms: [[790, 300, 96], [1330, 220, 160], [1650, 300, 96]],
  enemies: [
    ['yesman', 600, FLOOR],
    ['talker', 1300, FLOOR],
    ['yesman', 1500, FLOOR],
    ['strategist', 1400, 220, { range: 30 }],
    ['minute', 2150, FLOOR, { range: 200 }],
    ['yesman', 2300, FLOOR]
  ],
  hazards: [['stockcrash', { from: 400, to: 2350, first: 7000, interval: 16000 }]],
  items: [
    ...row('euro', 180, 340, 4),
    ...row('euro', 420, 270, 3),
    ...arc('euro', 790, 270, 5, 22, 40),
    ['coffee', 900, 330],
    ...row('euro', 1110, 270, 3),
    ...row('ticket', 1210, 210, 2),
    ...row('euro', 1340, 190, 6),
    ['promotion', 1460, 190],
    ...arc('euro', 1650, 270, 5, 22, 40),
    ...row('euro', 2010, 270, 3),
    ['vacation', 2250, 330],
    ...row('euro', 2300, 340, 4)
  ],
  terminals: [[1800, FLOOR, 2]],
  decor: [
    ['poster_sorridi', 200, 300], ['water_cooler', 260, FLOOR], [TEX.LUX_PLANT, 560, FLOOR],
    ['poster_sinergia', 700, 300], ['exec_sofa', 950, FLOOR], ['poster_sorridi', 1250, 300],
    ['water_cooler', 1560, FLOOR], ['poster_sinergia', 1850, 300], [TEX.LUX_PLANT, 2100, FLOOR],
    ['poster_sorridi', 2380, 300]
  ],
  goal: { type: 'elevator', x: 2490, y: FLOOR },
  elevator: true
};
