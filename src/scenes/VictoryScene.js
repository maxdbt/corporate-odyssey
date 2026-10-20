import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT, playerTex, playerAnim } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';

const style = (size, color = '#ffffff', extra = {}) => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 4, ...extra
});

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create() {
    audio.stopMusic();
    audio.sfx('victory');
    this.time.delayedCall(1600, () => audio.music('promotion'));
    setupStaticCamera(this);

    // Golden executive floor backdrop
    const g = this.add.graphics();
    g.fillStyle(0x3a2a00, 1).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    for (let x = 0; x < GAME_WIDTH; x += 40) g.fillStyle(x % 80 ? 0x5a4200 : 0x6e5200, 1).fillRect(x, 0, 40, 330);
    g.fillStyle(0x8a0a14, 1).fillRect(0, 330, GAME_WIDTH, GAME_HEIGHT - 330);

    // Confetti
    const colors = [0xffd800, 0xff4060, 0x40c0ff, 0x7dff7d, 0xffffff];
    for (let i = 0; i < 70; i++) {
      const c = this.add.rectangle(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(-450, 0), 4, 6,
        Phaser.Utils.Array.GetRandom(colors));
      this.tweens.add({
        targets: c, y: GAME_HEIGHT + 10, x: c.x + Phaser.Math.Between(-40, 40), angle: 360,
        duration: Phaser.Math.Between(2500, 5000), repeat: -1, delay: Phaser.Math.Between(0, 2000)
      });
    }

    this.add.text(GAME_WIDTH / 2, 50, 'CE L\'HAI FATTA!', style(40, '#ffd800', { strokeThickness: 7 })).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 104,
      'Hai sconfitto il Mega-Direttore.\nSei diventato il nuovo CEO...\no forse è ora di andare in ferie?',
      style(14, '#ffffff', { align: 'center', lineSpacing: 4 })).setOrigin(0.5);

    const spr = this.add.sprite(GAME_WIDTH / 2, 320, playerTex(GameState.character, 'idle')).setOrigin(0.5, 1).setScale(4);
    const walk = playerAnim(GameState.character, 'walk');
    if (this.anims.exists(walk)) spr.play(walk);
    this.tweens.add({ targets: spr, y: 300, duration: 350, yoyo: true, repeat: -1, ease: 'Quad.Out' });

    this.add.text(GAME_WIDTH / 2, 362,
      `SALUTE MENTALE ${Math.round(GameState.hp)}%   STRESS ${Math.round(GameState.stress)}%\n` +
      `BONUS ${GameState.euro} EUR   BUONI PASTO ${GameState.tickets}   GIORNI DI FERIE ${GameState.vacationDays}`,
      style(12, '#ffe680', { align: 'center', lineSpacing: 4 })).setOrigin(0.5);

    const back = this.add.text(GAME_WIDTH / 2, 420, 'PREMI INVIO O TOCCA PER TORNARE AL MENU', style(12, '#9be7ff')).setOrigin(0.5);
    this.tweens.add({ targets: back, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });

    const readyAt = this.time.now + 1200;
    const go = () => {
      if (this.time.now < readyAt) return;
      audio.stopMusic();
      this.scene.start('MenuScene');
    };
    this.input.on('pointerdown', go);
    this.input.keyboard?.on('keydown-ENTER', go);
    this.input.keyboard?.on('keydown-SPACE', go);
  }
}
