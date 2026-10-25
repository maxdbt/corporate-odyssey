// Single entry point used by GameScene/level data to spawn enemies and hazard controllers.
import { Talker, ConfCall, ClientHell, Minute, Bug, Party, TeamsIcon } from './enemies/OfficeEnemies.js';
import { Guardian, Shark, Mine, Copier, Cabinet, Cook, Stalactite, Cactus, Mirage } from './enemies/WorldEnemies.js';
import { Chef, TeamsCall, Moocher, Chief } from './enemies/CanteenEnemies.js';
import { Sniffer, Pickpocket, Petitioner, Penguin, Snowman, Jellyfish } from './enemies/TripEnemies.js';
import BossClient from './bosses/BossClient.js';
import BossCEO from './bosses/BossCEO.js';
import { YesMan, Strategist, Secretary } from './enemies/ExecEnemies.js';
import { MailRain, TeamsMeteor, TripDrops, StockCrash } from './hazards/Hazards.js';

const ENEMIES = {
  talker: Talker,
  confcall: ConfCall,
  clienthell: ClientHell,
  minute: Minute,
  bug: Bug,
  teamsicon: TeamsIcon,
  party: Party,
  guardian: Guardian,
  shark: Shark,
  mine: Mine,
  copier: Copier,
  cabinet: Cabinet,
  cook: Cook,
  chef: Chef,
  teamscall: TeamsCall,
  moocher: Moocher,
  chief: Chief,
  sniffer: Sniffer,
  pickpocket: Pickpocket,
  petitioner: Petitioner,
  penguin: Penguin,
  snowman: Snowman,
  jellyfish: Jellyfish,
  stalactite: Stalactite,
  cactus: Cactus,
  mirage: Mirage,
  yesman: YesMan,
  strategist: Strategist,
  secretary: Secretary,
  boss_client: BossClient,
  boss_ceo: BossCEO
};

const HAZARDS = {
  mailrain: MailRain,
  teamsmeteor: TeamsMeteor,
  tripdrops: TripDrops,
  stockcrash: StockCrash
};

export const ENEMY_TYPES = Object.keys(ENEMIES);
export const HAZARD_TYPES = Object.keys(HAZARDS);

export function createEnemy(scene, type, x, y, props = {}) {
  const Cls = ENEMIES[type];
  if (!Cls) {
    console.warn(`[EnemyFactory] Unknown enemy type "${type}"`);
    return null;
  }
  return new Cls(scene, x, y, props);
}

export function createHazard(scene, type, props = {}) {
  const Cls = HAZARDS[type];
  if (!Cls) {
    console.warn(`[EnemyFactory] Unknown hazard type "${type}"`);
    return null;
  }
  return new Cls(scene, props);
}
