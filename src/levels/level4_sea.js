import { TEX } from '../config/constants.js';
import { FLOOR, row, arc } from './helpers.js';

const seaweed = [];
for (let x = 60; x < 5900; x += 140 + (x % 3) * 30) seaweed.push([TEX.SEAWEED, x, FLOOR]);

const ring = (cx, cy, r = 40, n = 8) =>
  Array.from({ length: n }, (_, i) => ['euro', Math.round(cx + Math.cos((i / n) * Math.PI * 2) * r), Math.round(cy + Math.sin((i / n) * Math.PI * 2) * r)]);

const CURRENT = { type: 'wind', y: 0, h: 450, force: -110, current: true, label: 'CORRENTE!' };

// 4-9 Il Mare (trip ground leg): all underwater. Rent a submarine, fins and mask or a seahorse at the kiosk,
// fight the currents, dodge jellyfish, consultant sharks and notification mines, forced stop at the sushi bar,
// then on to the client's office on the seabed. Without the swimsuit you swim slower.
export default {
  id: '4-9',
  theme: 'sea',
  groundTex: TEX.T_SEABED,
  blockTex: TEX.T_SEABED,
  width: 6000,
  timeLimit: 240,
  start: [80, FLOOR],
  ground: [[0, 188]],
  blocks: [
    [0, -32, 6000, 32, null],
    [700, 322, 96, 64], [1900, 290, 64, 96], [2200, 0, 64, 170],
    [3000, 322, 128, 64], [3350, 260, 64, 126], [4300, 0, 64, 160], [4700, 300, 96, 86], [5300, 322, 64, 64]
  ],
  zones: [
    { type: 'water', x: 0, y: 0, w: 6000, h: 450 },
    { ...CURRENT, x: 900, w: 300 },
    { ...CURRENT, x: 2350, w: 500 },
    { ...CURRENT, x: 4000, w: 500 },
    { ...CURRENT, x: 5000, w: 450 }
  ],
  swim: true,
  enemies: [
    ['jellyfish', 500, 250],
    ['mine', 800, 200],
    ['jellyfish', 1100, 200, { range: 70 }],
    ['shark', 1250, 230, { radius: 60 }],
    ['mine', 1650, 160],
    ['jellyfish', 1750, 280],
    // after the rental kiosk
    ['mine', 2050, 340],
    ['jellyfish', 2500, 180],
    ['shark', 2650, 220, { radius: 70 }],
    ['jellyfish', 2850, 300],
    ['mine', 3100, 200],
    ['jellyfish', 3300, 150, { range: 70 }],
    ['shark', 3500, 240, { radius: 70 }],
    ['mine', 3950, 330],
    ['jellyfish', 4100, 250],
    ['mine', 4450, 300],
    ['jellyfish', 4550, 200],
    ['shark', 4650, 210, { radius: 70 }],
    ['jellyfish', 4950, 300],
    ['shark', 5200, 260, { radius: 60 }],
    ['mine', 5450, 150],
    ['jellyfish', 5550, 220, { range: 70 }],
    ['mine', 5650, 330]
  ],
  items: [
    ...row('euro', 200, 340, 5),
    ...arc('euro', 740, 300, 4, 22, 40),
    ['coffee', 1050, 340],
    ...ring(1250, 230, 40),
    ['vacation', 1700, 340],
    ...row('euro', 1910, 260, 2),
    ['budget', 2100, 340],
    ...row('euro', 2450, 340, 4),
    ...arc('euro', 3060, 300, 4, 22, 40),
    ['miles', 3382, 230],
    ...ring(3500, 240, 45),
    ['coffee', 4100, 340],
    ['budget', 4560, 340],
    ...arc('euro', 4740, 280, 4, 22, 40),
    ...row('euro', 5050, 340, 5),
    ['coffee', 5330, 290],
    ...row('euro', 5600, 340, 5)
  ],
  decor: seaweed,
  rental: [1400, FLOOR],
  food: [3700, FLOOR],
  terminals: [[2620, FLOOR]],
  quizSetting: 'sea',
  goal: { type: 'office', x: 5850, y: FLOOR }
};
