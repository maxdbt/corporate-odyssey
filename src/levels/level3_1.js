import { TEX } from '../config/constants.js';
import { FLOOR, row } from './helpers.js';

const COLORS = ['yellow', 'orange', 'green'];
const HEIGHTS = [340, 310, 280, 320, 290, 350, 300];

const postitRun = (from, to, step = 115, seed = 0) => {
  const out = [];
  for (let x = from, i = seed; x <= to; x += step, i++) out.push([x, HEIGHTS[i % HEIGHTS.length], COLORS[i % 3]]);
  return out;
};

const run1 = postitRun(470, 1860);
const run2 = postitRun(2200, 3930, 115, 3);
// Coins hovering above some post-its.
const postitCoins = [...run1, ...run2].filter((_, i) => i % 2 === 0).map(([x, y]) => ['euro', x + 22, y - 28]);

// 3-1 Il Limbo dei Post-it: vanishing post-its, falling Teams logos, boss "Il Cliente dall'Inferno".
export default {
  id: '3-1',
  theme: 'meeting',
  groundTex: TEX.T_MEETING,
  width: 4800,
  timeLimit: 300,
  start: [80, FLOOR],
  ground: [[0, 12], [60, 66], [125, 149]],
  postits: [...run1, ...run2],
  platforms: [[4150, 290, 96], [4560, 290, 96]],
  enemies: [
    ['teamsicon', 900, FLOOR], ['teamsicon', 2400, FLOOR], ['teamsicon', 3500, FLOOR],
    ['bug', 300, FLOOR],
    ['confcall', 1200, 150, { range: 220 }],
    ['confcall', 2800, 150, { range: 220 }],
    ['confcall', 3500, 150, { range: 220 }]
  ],
  hazards: [
    ['teamsmeteor', { from: 400, to: 3950, interval: 2600 }],
    ['mailrain', { from: 2600, to: 3200, interval: 1400 }]
  ],
  items: [
    ...row('euro', 150, 340, 5),
    ...postitCoins,
    ['coffee', 1960, 330],
    ['laptop', 2080, 330],
    ['vacation', 2120, 300],
    ['ticket', 1990, 300],
    ['coffee', 4060, 340],
    ['smartphone', 4100, 340]
  ],
  terminals: [[2010, FLOOR, 3]],
  decor: [[TEX.WHITEBOARD, 250, 330], [TEX.PLANT, 380, FLOOR], [TEX.PLANT, 2140, FLOOR], [TEX.WHITEBOARD, 4400, 250]],
  boss: {
    type: 'boss_client',
    triggerX: 4120,
    x: 4560,
    y: 200,
    arena: { left: 4000, right: 4800, floorY: FLOOR },
    exit: { x: 4740, y: FLOOR }
  }
};
