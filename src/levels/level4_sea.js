import { TEX } from '../config/constants.js';
import { FLOOR, row, arc } from './helpers.js';

const seaweed = [];
for (let x = 60; x < 5500; x += 140 + (x % 3) * 30) seaweed.push([TEX.SEAWEED, x, FLOOR]);

const ring = (cx, cy, r = 40, n = 8) =>
  Array.from({ length: n }, (_, i) => ['euro', Math.round(cx + Math.cos((i / n) * Math.PI * 2) * r), Math.round(cy + Math.sin((i / n) * Math.PI * 2) * r)]);

// 4-9 Il Mare del Digital (trip ground leg, still the old design): underwater (swim with jump), consultant sharks, notification mines.
export default {
  id: '4-9',
  theme: 'sea',
  groundTex: TEX.T_SEABED,
  blockTex: TEX.T_SEABED,
  width: 5600,
  timeLimit: 300,
  start: [80, FLOOR],
  ground: [[0, 174]],
  blocks: [
    [0, -32, 5600, 32, null],
    [800, 260, 64, 126], [1600, 200, 64, 186], [2000, 0, 64, 160],
    [2500, 240, 96, 146], [3300, 180, 64, 206], [3800, 0, 64, 150], [4200, 220, 64, 166]
  ],
  zones: [{ type: 'water', x: 0, y: 0, w: 5600, h: 450 }],
  enemies: [
    ['mine', 1000, 300], ['mine', 1400, 180], ['mine', 1900, 250], ['mine', 2700, 150],
    ['mine', 3100, 300], ['mine', 4000, 200], ['mine', 4400, 320], ['mine', 4900, 160],
    ['shark', 1200, 230, { radius: 60 }],
    ['shark', 2250, 220, { radius: 70 }],
    ['shark', 2950, 260, { radius: 60 }],
    ['shark', 3600, 240, { radius: 80 }],
    ['shark', 4650, 210, { radius: 70 }],
    ['shark', 5100, 280, { radius: 60 }]
  ],
  items: [
    ...row('euro', 200, 340, 5),
    ['smartphone', 600, 300],
    ...arc('euro', 790, 240, 5, 22, 40),
    ...ring(1200, 230, 40),
    ...row('ticket', 1610, 170, 2),
    ['coffee', 1800, 330],
    ['budget', 2300, 340],
    ...arc('euro', 2490, 220, 6, 22, 40),
    ['vacation', 2800, 330],
    ...row('euro', 3310, 150, 2),
    ...ring(3600, 240, 45),
    ['coffee', 3950, 340],
    ...arc('euro', 4190, 200, 5, 22, 40),
    ['promotion', 4500, 200],
    ...row('euro', 5000, 340, 8),
    ...row('ticket', 5300, 300, 3)
  ],
  decor: seaweed,
  goal: { type: 'door', x: 5500, y: FLOOR }
};
