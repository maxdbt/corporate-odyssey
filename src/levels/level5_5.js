import { TEX } from '../config/constants.js';
import { FLOOR, row } from './helpers.js';

// 5-5 Il Tetto: the rooftop at sunset. The Mega-Direttore waits on the helipad with the golden parachute (phase 3).
export default {
  id: '5-5',
  theme: 'roof',
  groundTex: TEX.T_BLOCK,
  exec: true,
  width: 1600,
  timeLimit: 200,
  final: true,
  start: [80, FLOOR],
  ground: [[0, 49]],
  platforms: [[300, 300, 96], [520, 250, 96]],
  enemies: [['yesman', 640, FLOOR]],
  items: [
    ...row('euro', 180, 340, 4),
    ...row('euro', 310, 270, 3),
    ...row('euro', 530, 220, 3),
    ['coffee', 680, 330],
    ['vacation', 740, 320]
  ],
  decor: [
    ['roof_rail', 40, FLOOR], ['antenna', 200, FLOOR], ['roof_ac', 420, FLOOR], ['roof_rail', 620, FLOOR],
    ['roof_ac', 760, FLOOR], ['roof_rail', 1000, FLOOR], ['antenna', 1180, FLOOR], ['helipad', 1460, FLOOR]
  ],
  boss: {
    type: 'boss_ceo',
    triggerX: 900,
    checkpoint: 820,
    shout: 'ULTIMO SCONTRO SUL TETTO!',
    x: 1300,
    y: FLOOR,
    props: { phase: 3, hp: 24, heli: { x: 1500, y: FLOOR - 4 } },
    arena: { left: 800, right: 1600, floorY: FLOOR, ceilingY: 40 }
  }
};
