import { TEX, IS_TOUCH } from '../config/constants.js';
import { FLOOR, row } from './helpers.js';

const COLORS = ['yellow', 'orange', 'green'];
const HEIGHTS = [340, 310, 280, 320, 290, 350, 300];

const postitRun = (from, to, step = 115, seed = 0) => {
  const out = [];
  for (let x = from, i = seed; x <= to; x += step, i++) out.push([x, HEIGHTS[i % HEIGHTS.length], COLORS[i % 3]]);
  return out;
};

// Kept short: 7 + 8 post-its (it was 13 + 16 and too hard).
const run1 = postitRun(470, 1160);
const run2 = postitRun(1496, 2301, 115, 3);
// Coins hovering above some post-its.
const postitCoins = [...run1, ...run2].filter((_, i) => i % 2 === 0).map(([x, y]) => ['euro', x + 22, y - 28]);

// 3-1 Il Limbo dei Post-it: vanishing post-its, e-mail rain, boss "Il Cliente dall'Inferno".
export default {
  id: '3-1',
  theme: 'meeting',
  groundTex: TEX.T_MEETING,
  width: 3168,
  timeLimit: 300,
  start: [80, FLOOR],
  ground: [[0, 12], [38, 44], [74, 98]],
  postits: [...run1, ...run2],
  platforms: [[2518, 290, 96], [2928, 290, 96]],
  enemies: [
    ['teamsicon', 700, FLOOR], ['teamsicon', 1700, FLOOR],
    ['bug', 300, FLOOR],
    ['confcall', 820, 150, { range: 220 }],
    ['confcall', 2000, 150, { range: 220 }]
  ],
  hazards: [
    ['mailrain', { from: 1850, to: 2250, interval: 1400 }]
  ],
  items: [
    ...row('euro', 150, 340, 5),
    ...postitCoins,
    // Touch screens: the promotion wings on the first post-it of each run (hard jumps with a thumb).
    ...(IS_TOUCH ? [['wings', run1[0][0] + 22, run1[0][1] - 34], ['wings', run2[0][0] + 22, run2[0][1] - 34]] : []),
    ['coffee', 1256, 330],
    ['laptop', 1376, 330],
    ['vacation', 1416, 300],
    ['ticket', 1286, 300],
    ['coffee', 2428, 340],
    ['smartphone', 2468, 340]
  ],
  terminals: [[1306, FLOOR, 3]],
  decor: [[TEX.WHITEBOARD, 250, 330], [TEX.PLANT, 380, FLOOR], [TEX.PLANT, 1436, FLOOR], [TEX.WHITEBOARD, 2768, 250]],
  boss: {
    type: 'boss_client',
    triggerX: 2488,
    checkpoint: 2418,   // free respawn point after the post-its
    x: 2928,
    y: 200,
    arena: { left: 2368, right: 3168, floorY: FLOOR },
    exit: { x: 3108, y: FLOOR }
  }
};
