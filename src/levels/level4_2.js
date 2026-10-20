import { TEX } from '../config/constants.js';
import { FLOOR, row, arc } from './helpers.js';

const stalactites = [];
for (let x = 420; x < 5300; x += 260) stalactites.push(['stalactite', x, 40]);

// 4-2 La Riorganizzazione Aziendale (Ghiacciaio): zero-friction ice, deadline stalactites.
export default {
  id: '4-2',
  theme: 'glacier',
  groundTex: TEX.T_ICE,
  blockTex: TEX.T_ICE,
  width: 5600,
  timeLimit: 300,
  start: [80, FLOOR],
  ground: [[0, 45], [48, 100], [103, 174]],
  blocks: [[0, 0, 5600, 40, TEX.T_ICE], [900, 322, 96, 64], [2400, 322, 128, 64], [4100, 322, 96, 64]],
  platforms: [
    [600, 300, 64, TEX.ICE_PLATFORM], [1200, 290, 64, TEX.ICE_PLATFORM], [1380, 250, 64, TEX.ICE_PLATFORM],
    [1900, 300, 64, TEX.ICE_PLATFORM], [2050, 240, 64, TEX.ICE_PLATFORM],
    [3000, 300, 64, TEX.ICE_PLATFORM], [3150, 250, 64, TEX.ICE_PLATFORM],
    [3700, 290, 64, TEX.ICE_PLATFORM], [4600, 300, 64, TEX.ICE_PLATFORM], [4760, 250, 64, TEX.ICE_PLATFORM]
  ],
  enemies: [
    ['teamsicon', 1600, FLOOR], ['teamsicon', 3600, FLOOR],
    ...stalactites,
    ['bug', 700, FLOOR],
    ['talker', 1100, FLOOR],
    ['minute', 1750, FLOOR, { range: 260 }],
    ['bug', 2450, 322],
    ['confcall', 2800, 170, { range: 220 }],
    ['talker', 3500, FLOOR],
    ['bug', 3720, 290],
    ['minute', 4300, FLOOR, { range: 260 }],
    ['confcall', 4900, 170, { range: 220 }],
    ['bug', 5200, FLOOR]
  ],
  items: [
    ...row('euro', 200, 340, 5),
    ...row('euro', 610, 270, 3),
    ['coffee', 940, 290],
    ...row('euro', 1210, 260, 3),
    ...row('ticket', 1390, 220, 2),
    ...arc('euro', 1460, 330, 5, 22, 60),
    ['car', 2070, 210],
    ...row('euro', 2410, 290, 5),
    ['vacation', 2700, 330],
    ...row('euro', 3010, 270, 3),
    ...arc('euro', 3220, 330, 5, 22, 60),
    ['promotion', 3720, 260],
    ['coffee', 4130, 290],
    ...row('euro', 4610, 270, 3),
    ...row('ticket', 4770, 220, 2),
    ...row('euro', 5000, 340, 10)
  ],
  terminals: [[2600, FLOOR, 2]],
  goal: { type: 'door', x: 5500, y: FLOOR }
};
