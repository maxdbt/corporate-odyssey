import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, RENDER_SCALE } from './config/constants.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import QuizScene from './scenes/QuizScene.js';
import BriefScene from './scenes/BriefScene.js';
import PauseScene from './scenes/PauseScene.js';
import BeachScene from './scenes/BeachScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';

// Render every Text at the canvas scale so it stays crisp under the camera zoom.
const addText = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (...args) {
  return addText.apply(this, args).setResolution(RENDER_SCALE);
};

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH * RENDER_SCALE,
  height: GAME_HEIGHT * RENDER_SCALE,
  backgroundColor: '#000000',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: GRAVITY }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: { activePointers: 4 },
  scene: [BootScene, MenuScene, GameScene, UIScene, QuizScene, BriefScene, PauseScene, BeachScene, GameOverScene, VictoryScene]
};

window.__game = new Phaser.Game(config);
