import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { generatePlayers } from '../gfx/players.js';
import { generateEnemies } from '../gfx/enemies.js';
import { generateProjectiles } from '../gfx/projectiles.js';
import { generateItems } from '../gfx/items.js';
import { generateWorld } from '../gfx/world.js';
import { generateCanteen } from '../gfx/canteen.js';
import { generateTrip } from '../gfx/trip.js';
import { generateClients } from '../gfx/clients.js';
import { generateAnims } from '../gfx/anims.js';
import { setupStaticCamera } from '../utils/view.js';

// Generates every 8-bit texture and animation in code, then opens the menu.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    setupStaticCamera(this);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'CARICAMENTO...', {
      fontFamily: FONT, fontSize: '20px', fontStyle: 'bold', color: '#ffd800', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    // Let the loading text render one frame before the (synchronous) generation work.
    this.time.delayedCall(30, () => {
      generatePlayers(this);
      generateEnemies(this);
      generateProjectiles(this);
      generateItems(this);
      generateWorld(this);
      generateCanteen(this);
      generateTrip(this);
      generateClients(this);
      generateAnims(this);
      this.scene.start('MenuScene');
    });
  }
}
