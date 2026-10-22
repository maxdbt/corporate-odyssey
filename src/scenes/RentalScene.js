import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { setupStaticCamera } from '../utils/view.js';
import { PRICES, TAXI_METER } from '../data/trip.js';
import { choiceDialog } from '../ui/TripUI.js';

const OPTIONS = [
  { type: 'camel', label: 'DROMEDARIO', note: 'non teme vento e cactus, salta alto' },
  { type: 'moto', label: 'MOTO', note: 'velocissima, ma se urti un cactus cadi' },
  { type: 'taxi', label: 'TAXI', note: `protetto, ma tassametro ${TAXI_METER} €/s` }
];

// Desert rental kiosk (overlay over GameScene): choose a mount or go on foot.
export default class RentalScene extends Phaser.Scene {
  constructor() {
    super('RentalScene');
  }

  create() {
    setupStaticCamera(this);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45).setOrigin(0);
    const dates = GameState.hasItem('dates');
    const options = OPTIONS.map((o) => ({
      label: `${o.label}  -  ${PRICES[o.type]} €`,
      note: o.type === 'camel' ? (dates ? 'hai i DATTERI: turbo e... vola!' : 'senza datteri ogni tanto si impunta') : o.note,
      disabled: GameState.canAfford(PRICES[o.type]) ? null : 'budget insufficiente'
    }));
    options.push({ label: 'PROSEGUO A PIEDI (gratis)', note: 'controvento...' });
    choiceDialog(this, {
      title: 'Noleggio Mezzi del Deserto',
      text: `"Salve viaggiatore! L'ufficio del cliente e' ancora lontano. Cosa noleggia?"\nBudget disponibile: ${GameState.budget()} €`,
      options,
      onPick: (i) => this.finish(i < OPTIONS.length ? OPTIONS[i].type : null)
    });
  }

  finish(type) {
    const gs = this.scene.get('GameScene');
    this.scene.resume('GameScene');
    gs?.tripLevel?.rent(type);
    this.scene.stop();
  }
}
