import { TEX } from '../config/constants.js';
import { FLOOR, row, arc } from './helpers.js';

// 4-7 Il Deserto (trip ground leg): headwind, a stretch on foot, then rent a camel, a motorbike or a taxi
// at the kiosk, forced stop at the food stand and ride to the client's office.
export default {
  id: '4-7',
  theme: 'desert',
  groundTex: TEX.T_SAND,
  blockTex: TEX.T_SAND,
  width: 6400,
  timeLimit: 240,
  start: [80, FLOOR],
  ground: [[0, 62], [65, 95], [98, 125], [129, 155], [158, 180], [183, 199]],
  blocks: [
    [520, 354, 192, 32], [584, 322, 64, 32],
    [1200, 354, 128, 32],
    [2600, 354, 160, 32],
    [3500, 354, 192, 32], [3564, 322, 64, 32],
    [4600, 354, 128, 32],
    [5400, 354, 192, 32], [5464, 322, 64, 32]
  ],
  platforms: [[1400, 300, 96, TEX.T_SAND], [3300, 290, 96, TEX.T_SAND], [5200, 300, 96, TEX.T_SAND]],
  zones: [
    { type: 'wind', x: 0, y: 0, w: 6400, h: 450, force: -110 },
    { type: 'heat', x: 760, y: 0, w: 380, h: 450, label: 'SOLE A PICCO' },
    { type: 'heat', x: 2900, y: 0, w: 420, h: 450, label: 'SOLE A PICCO' },
    { type: 'heat', x: 4700, y: 0, w: 460, h: 450, label: 'SOLE A PICCO' }
  ],
  enemies: [
    ['cactus', 420, FLOOR],
    ['mirage', 900, FLOOR],
    ['cactus', 1100, FLOOR],
    ['minute', 1550, FLOOR, { range: 240 }],
    // after the rental kiosk
    ['cactus', 2300, FLOOR], ['cactus', 2450, FLOOR],
    ['mirage', 2850, FLOOR],
    ['confcall', 3150, 160, { range: 220 }],
    ['cactus', 3350, FLOOR], ['cactus', 3800, FLOOR],
    ['minute', 4300, FLOOR, { range: 260 }],
    ['cactus', 4450, FLOOR],
    ['confcall', 4800, 160, { range: 220 }],
    ['mirage', 5100, FLOOR],
    ['cactus', 5300, FLOOR], ['cactus', 5700, FLOOR],
    ['minute', 5950, FLOOR, { range: 220 }]
  ],
  items: [
    ...row('euro', 200, 340, 5),
    ...row('euro', 590, 290, 3),
    ['water', 1000, 330],
    ...row('euro', 1410, 270, 4),
    ['vacation', 1640, 330],
    ...arc('euro', 2010, 330, 4, 22, 70),
    ['budget', 2650, 320],
    ...row('euro', 3310, 260, 4),
    ...arc('euro', 3050, 330, 4, 22, 70),
    ['miles', 3590, 290],
    ...arc('euro', 4130, 320, 5, 24, 80),
    ['coffee', 4640, 320],
    ...arc('euro', 4980, 330, 4, 22, 70),
    ['budget', 5490, 290],
    ...arc('euro', 5750, 330, 4, 22, 70),
    ...row('euro', 6000, 340, 6)
  ],
  rental: [1830, FLOOR],
  food: [3950, FLOOR],
  terminals: [[2700, 354, 1]],
  quizSetting: 'desert',
  goal: { type: 'office', x: 6260, y: FLOOR }
};
