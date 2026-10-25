// Player sprites: man and woman digital employees, all poses, built from head/torso/legs parts.
import { gridTex } from './painter.js';
import { playerTex } from '../config/constants.js';

const COMMON = {
  S: 0xf1c27d, // skin
  E: 0x111111, // eyes
  Q: 0xff2020, // hurt eyes
  '-': 0x5a3a20, // closed eyes
  W: 0xffffff,
  B: 0x111111, // shoes (man)
  D: 0x5ab4ff, // sweat drop
  L: 0x3498db, // badge
  M: 0xa0522d
};

const MAN = {
  pal: { ...COMMON, H: 0x2b1a0e, T: 0xc0392b, P: 0x1f2a44, U: 0xd6e4f0 },
  head: [
    '....HHHH....',
    '...HHHHHH...',
    '...HHSSSSS..',
    '...HSSESSE..',
    '...HSSSSSS..',
    '....SSSMS...'
  ],
  torso: [
    '..WWWTTWWW..',
    '.WWWWTTWWWW.',
    '.WWWWTTWLWW.',
    '.SWWWTTWWWS.'
  ],
  torsoUp: [
    'SWWWWTTWWWWS',
    '..WWWTTWWW..',
    '..WWWTTWLW..',
    '..WWWWTWWW..'
  ],
  legs: {
    stand: ['..PPPPPPPP..', '..PPPPPPPP..', '..PPP..PPP..', '..PPP..PPP..', '..PPP..PPP..', '.BBBB..BBBB.'],
    walk1: ['..PPPPPPPP..', '..PPPPPPPP..', '.PPP....PPP.', '.PPP....PPP.', 'PPP......PPP', 'BBB......BBB'],
    walk2: ['..PPPPPPPP..', '...PPPPPP...', '....PPPP....', '....PPPP....', '....PPPP....', '...BBBBBB...'],
    jump: ['..PPPPPPPP..', '..PPPPPPPP..', '.PPP...PPP..', 'BBP.....PPP.', '.BB.....BBB.', '............'],
    climb1: ['..PPPPPPPP..', '..PPP..PPP..', '..PPP..PPP..', '.BBBB..PPP..', '.......PPP..', '.......BBBB.'],
    climb2: ['..PPPPPPPP..', '..PPP..PPP..', '..PPP..PPP..', '..PPP..BBBB.', '..PPP.......', '.BBBB.......'],
    drag: ['..PPPPPPPP..', '..PPPPPPPP..', '..PPP..PPP..', '..PPP..PPP..', '..PPP...PPP.', 'BBBBB...BBBB']
  },
  crouchLegs: ['..PPPPPPPP..', '.PPPPPPPPPP.', '.BBBB..BBBB.'],
  slide: [
    '................',
    '..HHH...........',
    '.HSSSH..........',
    '.HSESS.WW.......',
    '..SSS.WWWWTT....',
    '....WWWWWPPPPP..',
    '.....SPPPPPPPPBB',
    '...........PPPBB'
  ],
  sleep: [
    '................',
    '................',
    '..HHH...........',
    '.HSSSWWWTTWWW...',
    '.HS-SWWWWWWPPPPB',
    '..SSSSWWWWWPPPPB',
    '................'
  ]
};

const WOMAN = {
  pal: { ...COMMON, H: 0x7a2e12, J: 0x16a085, K: 0x2c3e50, R: 0xd0304a, B: 0xd0304a },
  head: [
    '...HHHHHH...',
    '..HHHHHHHH..',
    '..HHHSSSSH..',
    '..HHSSESSE..',
    '..HHSSSSSS..',
    '..HHSSSRRS..'
  ],
  torso: [
    '..HJJWWJJH..',
    '.JJJJWWJJJJ.',
    '.JJJJWWJLJJ.',
    '.SJJJJJJJJS.'
  ],
  torsoUp: [
    'SHJJJWWJJJHS',
    '.JJJJWWJJJJ.',
    '..JJJWWJLJ..',
    '..JJJJJJJJ..'
  ],
  legs: {
    stand: ['..KKKKKKKK..', '..KKKKKKKK..', '...SS..SS...', '...SS..SS...', '...SS..SS...', '..RRR..RRR..'],
    walk1: ['..KKKKKKKK..', '..KKKKKKKK..', '..SS....SS..', '.SS......SS.', '.SS......SS.', 'RRR......RRR'],
    walk2: ['..KKKKKKKK..', '...KKKKKK...', '....SSSS....', '....SSSS....', '....SSSS....', '...RRRRRR...'],
    jump: ['..KKKKKKKK..', '..KKKKKKKK..', '.SS....SS...', 'RS......SS..', 'RR......RRR.', '............'],
    climb1: ['..KKKKKKKK..', '..KKKKKKKK..', '..SS....SS..', '.RRR....SS..', '........SS..', '........RRR.'],
    climb2: ['..KKKKKKKK..', '..KKKKKKKK..', '..SS....SS..', '..SS....RRR.', '..SS........', '.RRR........'],
    drag: ['..KKKKKKKK..', '..KKKKKKKK..', '...SS..SS...', '...SS..SS...', '...SS...SS..', 'RRRRR...RRRR']
  },
  crouchLegs: ['..KKKKKKKK..', '.KKKKKKKKKK.', '.RRRR..RRRR.'],
  slide: [
    '................',
    '..HHHH..........',
    '.HHSSSH.........',
    '.HSESSHJ........',
    '.HSSSJJJJWW.....',
    '....JJJJJKKKK...',
    '.....SKKKKKSSSRR',
    '..........SSSSRR'
  ],
  sleep: [
    '................',
    '................',
    'HHHHH...........',
    'HHSSSJJJWWJJJ...',
    'HHS-SJJJJJJKKSSR',
    '.HSSSSJJJJJKKSSR',
    '................'
  ]
};

const swapEyes = (rows, ch) => rows.map((r) => r.replace(/E/g, ch));
const withSweat = (rows) => rows.map((r, i) => (i === 2 || i === 3 ? r.slice(0, 10) + 'D' + r.slice(11) : r));

function poses(c) {
  const { head, torso, torsoUp, legs } = c;
  return {
    idle: [...head, ...torso, ...legs.stand],
    walk1: [...head, ...torso, ...legs.walk1],
    walk2: [...head, ...torso, ...legs.walk2],
    jump: [...head, ...torsoUp, ...legs.jump],
    crouch: [...head.slice(0, 5), torso[0], torso[1], torso[3], ...c.crouchLegs],
    slide: c.slide,
    climb1: [...head, ...torsoUp, ...legs.climb1],
    climb2: [...head, ...torsoUp, ...legs.climb2],
    sleep: c.sleep,
    hurt: [...swapEyes(head, 'Q'), ...torsoUp, ...legs.stand],
    tired1: [...withSweat(swapEyes(head, '-')), ...torso, ...legs.walk2],
    tired2: [...withSweat(head), ...torso, ...legs.drag],
    swim1: [...head, ...torsoUp, ...legs.walk1],
    swim2: [...head, ...torsoUp, ...legs.walk2]
  };
}

export const PLAYER_DEFS = { man: MAN, woman: WOMAN };

export function playerGrids(character) {
  return poses(PLAYER_DEFS[character]);
}

export function generatePlayers(scene) {
  for (const character of Object.keys(PLAYER_DEFS)) {
    const grids = playerGrids(character);
    for (const [pose, rows] of Object.entries(grids)) {
      gridTex(scene, playerTex(character, pose), rows, PLAYER_DEFS[character].pal, 2);
    }
  }
}

// Beach version for the Caribbean ending: bare skin and barefoot; swim trunks for the man, bikini for the woman.
const BEACH = {
  man: {
    pal: { Y: 0xff8c1a, Z: 0xffe040 },
    torso: (r) => r.replace(/[WTL]/g, 'S'),
    legs: (r, i) => (i === 0 ? r.replace(/P/g, 'Y') : i === 1 ? r.replace(/P/g, (_, j) => (j % 3 ? 'Y' : 'Z')) : r.replace(/[PB]/g, 'S'))
  },
  woman: {
    pal: { Y: 0xff4fa0 },
    torso: (r, i) => (i === 1 ? '.SSYYSSYYSS.' : r.replace(/[JWL]/g, 'S')),
    legs: (r, i) => (i === 0 ? r.replace(/K/g, 'Y') : r.replace(/[KR]/g, 'S'))
  }
};

// Texture `<character>_beach` (idle pose), generated on first use.
export function ensureBeachPlayer(scene, character) {
  const key = playerTex(character, 'beach');
  if (scene.textures.exists(key)) return key;
  const c = PLAYER_DEFS[character];
  const b = BEACH[character];
  const rows = [...c.head, ...c.torso.map(b.torso), ...c.legs.stand.map(b.legs)];
  gridTex(scene, key, rows, { ...c.pal, ...b.pal }, 2);
  return key;
}
