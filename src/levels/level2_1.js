import { TEX } from '../config/constants.js';
import { row, arc } from './helpers.js';

const FLOOR1 = 418;     // 1-tile canteen floor
const HEADS = 374;      // top of the queue heads (28x44 people standing on the floor)

const cookBlocks = [900, 1700, 2600, 3400, 4300, 5100];

// 2-1 La Mensa: forced scrolling over an endless queue of heads, trays, cleaning carts, golden dish.
export default {
  id: '2-1',
  theme: 'canteen',
  groundTex: TEX.T_CANTEEN,
  width: 6400,
  timeLimit: 150,
  autoscroll: 105,
  start: [100, HEADS],
  ground: [[0, 199, 1]],
  queue: {
    from: 20,
    to: 6190,
    floorY: FLOOR1,
    gaps: [[700, 760], [1300, 1360], [2100, 2190], [2900, 2960], [3600, 3700], [4500, 4560], [5300, 5400]]
  },
  blocks: cookBlocks.map((x) => [x, 290, 64, 16]),
  zones: [{ type: 'crowd', x: 0, y: 392, w: 6400, h: 58 }],
  enemies: [
    ...cookBlocks.map((x) => ['cook', x + 32, 290, { dir: -1 }]),
    ['confcall', 2000, 200, { range: 200 }],
    ['confcall', 3800, 200, { range: 200 }],
    ['bug', 4800, HEADS]
  ],
  hazards: [['cartspawner', { from: 500, to: 5900, interval: 3200, surfaceY: HEADS, speed: 230 }]],
  items: [
    ...row('euro', 300, 340, 6),
    ...arc('euro', 690, 340, 4, 24, 50),
    ...row('ticket', 920, 260, 2),
    ...arc('euro', 1290, 340, 4, 24, 50),
    ['car', 1500, 330],
    ...row('euro', 1720, 260, 2),
    ...row('euro', 1800, 340, 6),
    ['coffee', 2050, 320],
    ...arc('euro', 2100, 330, 5, 22, 60),
    ...row('ticket', 2620, 260, 2),
    ...arc('euro', 2890, 340, 4, 24, 50),
    ['promotion', 3100, 320],
    ...row('euro', 3200, 340, 8),
    ...arc('euro', 3600, 330, 5, 24, 60),
    ['coffee', 4000, 320],
    ...row('euro', 4320, 260, 2),
    ...arc('euro', 4490, 340, 4, 24, 50),
    ['raise', 4700, 320],
    ...row('euro', 4800, 340, 8),
    ...row('ticket', 5120, 260, 2),
    ...arc('euro', 5300, 330, 5, 24, 60),
    ...row('euro', 5600, 340, 10)
  ],
  goal: { type: 'dish', x: 6260, y: FLOOR1 }
};
