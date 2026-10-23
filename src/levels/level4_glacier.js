import { TEX } from '../config/constants.js';
import { FLOOR, row, arc } from './helpers.js';

const STORM = { type: 'wind', y: 0, h: 450, force: -100, storm: true, label: 'BUFERA!' };

// 4-8 Il Ghiacciaio (trip ground leg): ice everywhere, an ice cave with deadline stalactites, blizzards
// and crevasses; rent a husky sled, a snowmobile or skis at the kiosk, forced stop at the mountain hut,
// then on to the client's office. Without the down jacket the cold gets you now and then.
export default {
  id: '4-8',
  theme: 'glacier',
  groundTex: TEX.T_ICE,
  blockTex: TEX.T_ICE,
  width: 6400,
  timeLimit: 240,
  start: [80, FLOOR],
  ground: [[0, 40], [43, 95], [98, 135], [139, 170], [173, 199]],
  crevasses: [[1312, 64], [3072, 64], [4352, 96], [5472, 64]],
  blocks: [
    [560, 0, 680, 40], [4560, 0, 700, 40],          // ice caves
    [2600, 354, 160, 32],
    [3400, 354, 128, 32], [3432, 322, 64, 32],
    [5700, 354, 128, 32]
  ],
  platforms: [
    [1000, 300, 64, TEX.ICE_PLATFORM], [1500, 290, 64, TEX.ICE_PLATFORM], [2350, 300, 64, TEX.ICE_PLATFORM],
    [3200, 290, 64, TEX.ICE_PLATFORM], [4200, 300, 64, TEX.ICE_PLATFORM], [4900, 290, 64, TEX.ICE_PLATFORM],
    [6000, 300, 64, TEX.ICE_PLATFORM]
  ],
  zones: [
    { ...STORM, x: 1400, w: 420 },
    { ...STORM, x: 2900, w: 520 },
    { ...STORM, x: 5560, w: 560 }
  ],
  chill: true,
  enemies: [
    ['stalactite', 640, 40], ['stalactite', 820, 40], ['stalactite', 1000, 40], ['stalactite', 1180, 40],
    ['penguin', 450, FLOOR, { range: 90 }],
    ['snowman', 760, FLOOR],
    ['penguin', 1100, FLOOR],
    ['minute', 1600, FLOOR, { range: 180 }],
    ['snowman', 1750, FLOOR],
    // after the rental kiosk
    ['snowman', 2250, FLOOR],
    ['penguin', 2450, FLOOR],
    ['snowman', 2900, FLOOR],
    ['penguin', 3300, FLOOR],
    ['snowman', 3700, FLOOR],
    ['penguin', 4200, FLOOR],
    ['stalactite', 4640, 40], ['stalactite', 4820, 40], ['stalactite', 5000, 40], ['stalactite', 5180, 40],
    ['snowman', 4650, FLOOR],
    ['penguin', 4900, FLOOR],
    ['confcall', 5050, 160, { range: 220 }],
    ['snowman', 5350, FLOOR],
    ['penguin', 5800, FLOOR],
    ['snowman', 6050, FLOOR]
  ],
  items: [
    ...row('euro', 200, 340, 5),
    ...row('euro', 1010, 270, 3),
    ['coffee', 1200, 330],
    ...row('euro', 1500, 260, 3),
    ['vacation', 1860, 330],
    ...arc('euro', 2050, 330, 4, 22, 70),
    ['budget', 2400, 330],
    ...row('euro', 2360, 270, 3),
    ...arc('euro', 3060, 330, 4, 22, 70),
    ...row('euro', 3210, 260, 3),
    ['miles', 3460, 290],
    ...arc('euro', 4350, 330, 5, 22, 80),
    ['coffee', 4700, 330],
    ...row('euro', 4910, 260, 3),
    ['budget', 5200, 330],
    ...arc('euro', 5470, 330, 4, 22, 70),
    ...row('euro', 5720, 320, 4),
    ...row('euro', 6010, 270, 3),
    ...row('euro', 6100, 340, 5)
  ],
  rental: [1950, FLOOR],
  food: [3950, FLOOR],
  terminals: [[2680, 354]],
  quizSetting: 'glacier',
  goal: { type: 'office', x: 6260, y: FLOOR }
};
