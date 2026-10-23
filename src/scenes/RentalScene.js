import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { setupStaticCamera } from '../utils/view.js';
import { PRICES, RENTALS } from '../data/trip.js';
import { choiceDialog } from '../ui/TripUI.js';

// Rental kiosk of a ground leg (overlay over GameScene): choose a mount (RENTALS[level.theme]) or go on foot.
export default class RentalScene extends Phaser.Scene {
  constructor() {
    super('RentalScene');
  }

  create() {
    setupStaticCamera(this);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45).setOrigin(0);
    const rental = RENTALS[this.scene.get('GameScene')?.level?.theme] || RENTALS.desert;
    this.rental = rental;
    const dates = GameState.hasItem('dates');
    const options = rental.options.map((o) => ({
      label: `${o.label}  -  ${PRICES[o.type]} €`,
      note: o.type === 'camel' ? (dates ? 'hai i DATTERI: turbo e... vola!' : 'senza datteri ogni tanto si impunta') : o.note,
      disabled: GameState.canAfford(PRICES[o.type]) ? null : 'budget insufficiente'
    }));
    options.push({ label: rental.foot || 'PROSEGUO A PIEDI (gratis)', note: rental.onFoot });
    choiceDialog(this, {
      title: rental.title,
      text: `${rental.text}\nBudget disponibile: ${GameState.budget()} €`,
      options,
      onPick: (i) => this.finish(i < rental.options.length ? rental.options[i].type : null)
    });
  }

  finish(type) {
    const gs = this.scene.get('GameScene');
    this.scene.resume('GameScene');
    gs?.tripLevel?.rent(type);
    this.scene.stop();
  }
}
