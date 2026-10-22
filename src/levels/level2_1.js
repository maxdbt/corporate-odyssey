import { TEX } from '../config/constants.js';
import { row, arc, FLOOR } from './helpers.js';

const TABLE = FLOOR - 34;    // top of a canteen table
const COUNTER = FLOOR - 42;  // top of a self-service counter (where the cooks stand)

// Cook stations: x, ms between throws, what they throw (weights).
const CHEFS = [
  [900, 1500, { good: 6, hot: 3, ticket: 1 }],
  [2400, 1250, { good: 5, hot: 2, spoiled: 3, teams: 2, ticket: 1 }],
  [3750, 950, { good: 5, hot: 3, spoiled: 3, teams: 3, ticket: 1 }]
];

// 2-1 La Pausa Pranzo: catch a full meal (primo, secondo, contorno, dolce) thrown by the cooks,
// dodge spoiled and burning dishes, Teams calls, the lunch thief and the boss, then pay at the cassa.
export default {
  id: '2-1',
  theme: 'canteen',
  groundTex: TEX.T_CANTEEN,
  width: 5600,
  timeLimit: 200,
  canteen: {},
  start: [80, FLOOR],
  ground: [[0, 174, 2]],
  counters: CHEFS.map(([x]) => [x, FLOOR]),
  tables: [
    [330, FLOOR], [560, FLOOR], [690, FLOOR], [1110, FLOOR], [1260, FLOOR],
    [1560, FLOOR], [1760, FLOOR], [1960, FLOOR], [2160, FLOOR],
    [2620, FLOOR], [2860, FLOOR], [3200, FLOOR], [3420, FLOOR],
    [4000, FLOOR], [4150, FLOOR], [4400, FLOOR], [4620, FLOOR], [4840, FLOOR], [5060, FLOOR]
  ],
  zones: [{ type: 'wet', x: 3560, y: FLOOR - 14, w: 340, h: 14 }],
  enemies: [
    ...CHEFS.map(([x, rate, mix]) => ['chef', x, COUNTER, { rate, mix }]),
    ['chief', 1760, FLOOR, { patrol: 420 }],
    ['teamsicon', 2950, FLOOR],
    ['moocher', 3420, FLOOR, { patrol: 120 }],
    ['moocher', 4060, FLOOR, { patrol: 100 }],
    ['chief', 4620, FLOOR, { patrol: 520, dir: 1 }]
  ],
  items: [
    ...row('euro', 200, FLOOR - 20, 5),
    ...row('ticket', 300, TABLE - 20, 3),
    ...row('ticket', 540, TABLE - 20, 3),
    ...arc('euro', 1150, TABLE - 20, 5, 22, 40),
    ['coffee', 1400, FLOOR - 24],
    ...row('euro', 1530, TABLE - 20, 3),
    ...row('euro', 1730, TABLE - 20, 3),
    ...row('euro', 1930, TABLE - 20, 3),
    ...row('ticket', 2130, TABLE - 20, 3),
    ['vacation', 2750, FLOOR - 20],
    ...arc('euro', 2840, TABLE - 20, 5, 22, 40),
    ...row('ticket', 3180, TABLE - 20, 3),
    ['tickets10', 3300, TABLE - 60],
    ...row('euro', 3980, TABLE - 20, 3),
    ['coffee', 4280, FLOOR - 24],
    ...row('ticket', 4380, TABLE - 20, 3),
    ['raise', 4620, TABLE - 60],
    ...row('euro', 4820, TABLE - 20, 3),
    ...row('ticket', 5040, TABLE - 20, 3)
  ],
  mysteryDish: [1960, TABLE - 80],
  terminals: [[3050, FLOOR]],
  goal: { type: 'cassa', x: 5400, y: FLOOR }
};
