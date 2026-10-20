import { TEX } from '../config/constants.js';
import { FLOOR, DESK_TOP, row, arc } from './helpers.js';

// 1-2 Estate d'Inferno: heat zones (stress + slow), polar AC zones (freeze + slippery).
export default {
  id: '1-2',
  theme: 'summer',
  groundTex: TEX.T_SUMMER,
  width: 5600,
  timeLimit: 300,
  start: [80, FLOOR],
  ground: [[0, 60], [63, 120], [123, 174]],
  desks: [
    [260, DESK_TOP], [380, 296],
    [700, DESK_TOP], [820, 296], [940, DESK_TOP],
    [1200, DESK_TOP],
    [1560, DESK_TOP], [1680, 296],
    [2150, DESK_TOP], [2250, 296], [2350, 232],
    [2700, DESK_TOP], [2820, 296],
    [3500, DESK_TOP], [3620, 296],
    [4400, DESK_TOP], [4520, 296], [4640, DESK_TOP],
    [5000, DESK_TOP], [5100, 296]
  ],
  zones: [
    { type: 'heat', x: 600, y: 0, w: 700, h: 450 },
    { type: 'cold', x: 1450, y: 0, w: 400, h: FLOOR },
    { type: 'heat', x: 2550, y: 0, w: 450, h: 450 },
    { type: 'cold', x: 3450, y: 0, w: 350, h: FLOOR },
    { type: 'heat', x: 4300, y: 0, w: 600, h: 450 }
  ],
  enemies: [
    ['teamsicon', 1400, FLOOR], ['teamsicon', 3000, FLOOR], ['teamsicon', 4300, FLOOR],
    ['talker', 520, FLOOR],
    ['copier', 1100, FLOOR, { dir: -1 }],
    ['bug', 830, 296],
    ['cabinet', 1350, FLOOR],
    ['minute', 1800, FLOOR, { range: 260 }],
    ['confcall', 2200, 170, { range: 220 }],
    ['clienthell', 2732, FLOOR, { dir: -1 }],
    ['bug', 3630, 296],
    ['talker', 4100, FLOOR],
    ['copier', 4800, FLOOR, { dir: -1 }],
    ['minute', 5250, FLOOR, { range: 240 }]
  ],
  hazards: [['mailrain', { from: 3950, to: 4250, interval: 1000 }]],
  items: [
    ...row('euro', 180, 340, 4),
    ...row('euro', 390, 270, 3),
    ['water', 640, 340],
    ['smartphone', 850, 260],
    ...row('euro', 960, 330, 3),
    ['water', 1000, 340],
    ...row('ticket', 1210, 330, 2),
    ...row('euro', 1500, 340, 6),
    ...row('euro', 1690, 270, 3),
    ...arc('euro', 1930, 330, 5, 24, 60),
    ['coffee', 2100, 330],
    ...row('euro', 2160, 330, 3),
    ...row('euro', 2360, 200, 3),
    ['car', 2450, 330],
    ['water', 2600, 340],
    ...row('ticket', 2830, 270, 2),
    ['water', 2950, 340],
    ['vacation', 3050, 330],
    ...row('euro', 3300, 340, 6),
    ...row('euro', 3630, 270, 3),
    ...arc('euro', 3850, 330, 5, 24, 60),
    ['promotion', 4100, 320],
    ['water', 4350, 340],
    ...row('euro', 4410, 330, 3),
    ...row('ticket', 4530, 270, 2),
    ['water', 4700, 340],
    ['coffee', 4900, 320],
    ...row('euro', 5100, 270, 3),
    ...row('euro', 5250, 340, 8)
  ],
  terminals: [[2050, FLOOR, 2]],
  planeTicket: [3380, 320],
  decor: [
    [TEX.PLANT, 150, FLOOR], [TEX.WATER_COOLER, 560, FLOOR], [TEX.PLANT, 1420, FLOOR],
    [TEX.WHITEBOARD, 2000, 330], [TEX.WATER_COOLER, 3100, FLOOR], [TEX.PLANT, 3420, FLOOR],
    [TEX.PLANT, 4260, FLOOR], [TEX.WATER_COOLER, 5200, FLOOR]
  ],
  goal: { type: 'door', x: 5500, y: FLOOR }
};
