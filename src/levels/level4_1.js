import { TEX } from '../config/constants.js';
import { FLOOR, row, arc } from './helpers.js';

// 4-1 La Fuga di Cervelli (Deserto): constant headwind, binder cacti, mirage oases.
export default {
  id: '4-1',
  theme: 'desert',
  groundTex: TEX.T_SAND,
  blockTex: TEX.T_SAND,
  width: 5600,
  timeLimit: 300,
  start: [80, FLOOR],
  ground: [[0, 50], [53, 110], [113, 174]],
  blocks: [
    [520, 354, 192, 32], [584, 322, 64, 32],
    [1200, 354, 128, 32],
    [2100, 354, 224, 32], [2164, 322, 96, 32],
    [3000, 354, 128, 32],
    [3900, 354, 192, 32], [3964, 322, 64, 32],
    [4700, 354, 160, 32]
  ],
  platforms: [[1400, 300, 96, TEX.T_SAND], [2800, 290, 96, TEX.T_SAND], [4300, 300, 96, TEX.T_SAND]],
  zones: [{ type: 'wind', x: 0, y: 0, w: 5600, h: 450, force: -110 }],
  enemies: [
    ['cactus', 420, FLOOR],
    ['mirage', 900, FLOOR],
    ['cactus', 1100, FLOOR],
    ['bug', 1250, 354],
    ['minute', 1550, FLOOR, { range: 240 }],
    ['cactus', 1900, FLOOR],
    ['mirage', 2500, FLOOR],
    ['confcall', 2700, 160, { range: 220 }],
    ['cactus', 3250, FLOOR],
    ['talker', 3500, FLOOR],
    ['mirage', 3700, FLOOR],
    ['cactus', 4150, FLOOR],
    ['minute', 4500, FLOOR, { range: 240 }],
    ['mirage', 5000, FLOOR],
    ['cactus', 5250, FLOOR]
  ],
  hazards: [['mailrain', { from: 3000, to: 3450, interval: 1000 }]],
  items: [
    ...row('euro', 200, 340, 5),
    ...row('euro', 590, 290, 3),
    ['water', 1000, 330],
    ...row('euro', 1410, 270, 4),
    ...arc('euro', 1615, 330, 5, 22, 60),
    ['coffee', 1800, 330],
    ...row('euro', 2170, 290, 4),
    ['vacation', 2300, 300],
    ...row('ticket', 2810, 260, 3),
    ['promotion', 3050, 300],
    ...arc('euro', 3535, 330, 5, 22, 60),
    ...row('euro', 3970, 290, 3),
    ['coffee', 4200, 330],
    ...row('euro', 4310, 270, 4),
    ['raise', 4780, 300],
    ...row('euro', 4900, 340, 8),
    ...row('ticket', 5300, 340, 3)
  ],
  terminals: [[2600, FLOOR, 1]],
  goal: { type: 'door', x: 5500, y: FLOOR }
};
