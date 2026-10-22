import { TEX } from '../config/constants.js';
import { FLOOR, row, arc } from './helpers.js';

const DROPS = { strike: 3, delay: 3, miles: 2, upgrade: 1, budget: 1 };

// 4-4 La Stazione (trip, by train): strikes and delays rain from the departure boards and
// pickpockets run at you to steal your wallet (stomp them to get it back). Catch the train.
export default {
  id: '4-4',
  theme: 'station',
  groundTex: TEX.T_STATION,
  width: 4400,
  timeLimit: 180,
  start: [80, FLOOR],
  ground: [[0, 137]],
  benches: [[480, FLOOR], [1300, FLOOR], [1480, FLOOR], [2600, FLOOR], [3450, FLOOR], [3630, FLOOR]],
  platforms: [[760, 300, 64, 'luggage'], [920, 250, 64, 'luggage'], [2000, 290, 64, 'luggage'], [2160, 240, 64, 'luggage'], [2950, 290, 64, 'luggage']],
  decor: [
    [TEX.BOARD, 300, 200], [TEX.BOARD, 1100, 200], [TEX.BOARD, 1900, 200], [TEX.BOARD, 2800, 200], [TEX.BOARD, 3700, 200],
    [TEX.PLANT, 2380, FLOOR]
  ],
  enemies: [
    ['talker', 600, FLOOR],
    ['pickpocket', 1000, FLOOR],
    ['pickpocket', 1750, FLOOR],
    ['bug', 2300, FLOOR],
    ['pickpocket', 2550, FLOOR],
    ['talker', 3000, FLOOR],
    ['pickpocket', 3350, FLOOR],
    ['pickpocket', 3950, FLOOR]
  ],
  hazards: [['tripdrops', { from: 250, to: 4150, interval: 1600, mix: DROPS }]],
  items: [
    ...row('euro', 200, 340, 5),
    ...row('euro', 770, 270, 3),
    ['budget', 952, 220],
    ...arc('euro', 1330, 330, 5, 22, 50),
    ['coffee', 1650, 340],
    ...row('euro', 2010, 260, 3),
    ['vacation', 2192, 210],
    ['miles', 2982, 260],
    ...arc('euro', 3480, 330, 5, 22, 50),
    ...row('euro', 3900, 340, 6)
  ],
  goal: { type: 'train', x: 4250, y: FLOOR }
};
