import { TEX } from '../config/constants.js';
import { FLOOR, DESK_TOP, row, arc } from './helpers.js';

// 1-1 Natale in Ufficio: open space base mechanics + spumante puddles + party colleagues.
export default {
  id: '1-1',
  theme: 'xmas',
  groundTex: TEX.T_XMAS,
  width: 5600,
  timeLimit: 300,
  start: [80, FLOOR],
  ground: [[0, 40], [44, 90], [93, 174]],
  desks: [
    [300, DESK_TOP], [420, 296],
    [1100, DESK_TOP], [1200, 296],
    [1600, DESK_TOP], [1700, 296], [1800, 232],
    [2230, DESK_TOP],
    [2800, DESK_TOP], [2860, 296],
    [3620, DESK_TOP], [3720, 296], [3820, 232], [3940, 232],
    [4700, DESK_TOP], [4800, 296], [4900, DESK_TOP]
  ],
  platforms: [[1900, 232, 200]],
  ladders: [[2080, 232, FLOOR]],
  partyDoor: [1985, FLOOR],
  zones: [
    { type: 'puddle', x: 560, y: FLOOR - 10, w: 96, h: 10 },
    { type: 'puddle', x: 2400, y: FLOOR - 10, w: 128, h: 10 },
    { type: 'puddle', x: 2660, y: FLOOR - 10, w: 64, h: 10 },
    { type: 'puddle', x: 3980, y: FLOOR - 10, w: 96, h: 10 },
    { type: 'puddle', x: 5100, y: FLOOR - 10, w: 64, h: 10 }
  ],
  enemies: [
    ['teamsicon', 1180, FLOOR], ['teamsicon', 2950, FLOOR], ['teamsicon', 4500, FLOOR],
    ['talker', 760, FLOOR],
    ['copier', 900, FLOOR, { dir: -1 }],
    ['cabinet', 1010, FLOOR],
    ['party', 1520, FLOOR],
    ['bug', 1720, 296],
    ['clienthell', 2262, FLOOR, { dir: -1 }],
    ['party', 2600, FLOOR],
    ['talker', 2750, FLOOR],
    ['cabinet', 3280, FLOOR],
    ['copier', 3420, FLOOR, { dir: -1 }],
    ['cabinet', 3520, FLOOR],
    ['confcall', 3760, 170, { range: 200 }],
    ['party', 4080, FLOOR],
    ['talker', 4250, FLOOR],
    ['talker', 4380, FLOOR],
    ['minute', 4560, FLOOR, { range: 260 }],
    ['clienthell', 4932, FLOOR, { dir: -1 }]
  ],
  hazards: [['mailrain', { from: 4250, to: 4650, interval: 1100 }]],
  items: [
    ...row('euro', 200, 340, 5),
    ...row('euro', 430, 270, 3),
    ['coffee', 640, 320],
    ...row('euro', 1110, 330, 3),
    ...row('ticket', 1215, 270, 2),
    ...arc('euro', 1290, 330, 6, 26, 60),
    ...row('euro', 1620, 330, 3),
    ...row('euro', 1720, 268, 3),
    ['laptop', 1830, 200],
    ...row('euro', 1920, 200, 7),
    ['coffee', 2300, 300],
    ...row('euro', 2420, 340, 5),
    ...row('ticket', 2870, 270, 2),
    ...arc('euro', 2900, 330, 4, 26, 50),
    ['vacation', 3100, 330],
    ...row('euro', 3300, 340, 6),
    ...row('euro', 3640, 330, 3),
    ['raise', 3850, 200],
    ...row('euro', 3950, 200, 3),
    ['coffee', 4300, 300],
    ...row('euro', 4400, 340, 8),
    ...row('ticket', 4810, 270, 2),
    ['promotion', 5000, 330],
    ...row('euro', 5150, 340, 10)
  ],
  terminals: [[1260, FLOOR, 1]],
  decor: [
    [TEX.XMAS_TREE, 200, FLOOR], [TEX.PLANT, 520, FLOOR], [TEX.WATER_COOLER, 1050, FLOOR],
    [TEX.XMAS_TREE, 1460, FLOOR], [TEX.PLANT, 2150, FLOOR], [TEX.XMAS_TREE, 3040, FLOOR],
    [TEX.WHITEBOARD, 3200, 330], [TEX.PLANT, 4150, FLOOR], [TEX.XMAS_TREE, 4600, FLOOR],
    [TEX.WATER_COOLER, 5300, FLOOR], [TEX.XMAS_TREE, 5420, FLOOR]
  ],
  goal: { type: 'door', x: 5500, y: FLOOR }
};
