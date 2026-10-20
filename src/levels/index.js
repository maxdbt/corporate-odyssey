import { LEVEL_META } from '../config/constants.js';
import level1_1 from './level1_1.js';
import level1_2 from './level1_2.js';
import level2_1 from './level2_1.js';
import level3_1 from './level3_1.js';
import level4_1 from './level4_1.js';
import level4_2 from './level4_2.js';
import level4_3 from './level4_3.js';
import level5_1 from './level5_1.js';

// Same order as LEVEL_META; meta (name/world) merged in.
export const LEVELS = [level1_1, level1_2, level2_1, level3_1, level4_1, level4_2, level4_3, level5_1]
  .map((lvl, i) => ({ ...LEVEL_META[i], ...lvl }));

export default LEVELS;
