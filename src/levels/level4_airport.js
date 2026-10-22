import { TEX } from '../config/constants.js';
import { FLOOR, row, arc } from './helpers.js';

const DROPS = { strike: 3, delay: 3, miles: 2, upgrade: 1, budget: 1 };

// 4-3 L'Aeroporto (trip, by plane): strikes and delays rain from the departure boards, duty free
// temptations eat the budget, sniffer dogs search you. Reach the boarding gate.
export default {
  id: '4-3',
  theme: 'airport',
  groundTex: TEX.T_AIRPORT,
  width: 4400,
  timeLimit: 180,
  start: [80, FLOOR],
  ground: [[0, 137]],
  benches: [[520, FLOOR], [700, FLOOR], [2700, FLOOR], [2900, FLOOR], [3600, FLOOR], [3780, FLOOR]],
  platforms: [[850, 300, 64, 'luggage'], [1000, 250, 64, 'luggage'], [3150, 290, 64, 'luggage'], [3300, 240, 64, 'luggage']],
  dutyFree: [[1400, 'df_perfume'], [1580, 'df_choco'], [1760, 'df_watch'], [1940, 'df_perfume']],
  docCheck: [2300, FLOOR],
  petition: [800, 3420],
  decor: [
    [TEX.BOARD, 300, 200], [TEX.BOARD, 1150, 200], [TEX.BOARD, 2150, 200], [TEX.BOARD, 3050, 200], [TEX.BOARD, 3950, 200],
    [TEX.PLANT, 2240, FLOOR], [TEX.PLANT, 4120, FLOOR]
  ],
  enemies: [
    ['talker', 620, FLOOR],
    ['sniffer', 1150, FLOOR, { patrol: 160 }],
    ['bug', 2000, FLOOR],
    ['sniffer', 2650, FLOOR, { patrol: 140 }],
    ['talker', 3100, FLOOR],
    ['sniffer', 3500, FLOOR, { patrol: 180 }],
    ['minute', 3900, FLOOR, { range: 200 }]
  ],
  hazards: [['tripdrops', { from: 250, to: 4150, interval: 1700, mix: DROPS }]],
  items: [
    ...row('euro', 200, 340, 5),
    ...row('euro', 860, 270, 3),
    ['budget', 1032, 220],
    ...arc('euro', 1180, 330, 5, 22, 50),
    ['coffee', 2050, 340],
    ['vacation', 2450, 330],
    ...row('euro', 2680, 340, 4),
    ['miles', 3332, 210],
    ...row('euro', 3160, 260, 3),
    ...arc('euro', 3700, 330, 5, 22, 50),
    ...row('euro', 4000, 340, 6)
  ],
  goal: { type: 'gate', x: 4280, y: FLOOR }
};
