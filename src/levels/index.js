import { LEVEL_META } from '../config/constants.js';
import level1_1 from './level1_1.js';
import level1_2 from './level1_2.js';
import level2_1 from './level2_1.js';
import level3_1 from './level3_1.js';
import level4_airport from './level4_airport.js';
import level4_station from './level4_station.js';
import level4_desert from './level4_desert.js';
import level4_glacier from './level4_glacier.js';
import level4_sea from './level4_sea.js';
import level5_1 from './level5_1.js';

// Static trip stages (meta.scene) have no level data: their scene draws everything.
const stage = (extra = {}) => ({ ...extra });

// Same order as LEVEL_META; meta (name/world/scene/trip) merged in.
export const LEVELS = [
  level1_1, level1_2, level2_1, level3_1,
  stage(), stage(), level4_airport, level4_station, stage({ journey: 'plane' }), stage({ journey: 'train' }),
  level4_desert, level4_glacier, level4_sea, stage(),
  level5_1
].map((lvl, i) => ({ ...LEVEL_META[i], ...lvl }));

export default LEVELS;
