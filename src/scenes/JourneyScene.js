import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEX, playerTex } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { LEVELS } from '../levels/index.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { PRICES } from '../data/trip.js';
import { beginStage, goNext, underwearPenalty } from '../systems/Trip.js';
import { tstyle, tripHud, choiceDialog, resultPanel, effectLines, applyEffects } from '../ui/TripUI.js';

const GOOD = '#7CFC00';
const BAD = '#ff8080';
const coin = (p) => Math.random() < p;

// "Earbuds or buy headphones or elbow": shared by the chatty (plane) and loud (train) neighbour.
function noiseOptions(price) {
  const has = GameState.hasItem('earbuds');
  return [
    {
      label: 'Metto gli auricolari anti-rumore',
      note: has ? 'li hai in valigia!' : null,
      disabled: has ? null : 'non li hai in valigia',
      run: () => ({ title: 'SILENZIO DIVINO', color: GOOD, effects: { stress: -10 }, lines: ['Il mondo si spegne. Pace.'] })
    },
    {
      label: `Compro delle cuffie (${price} €)`,
      disabled: GameState.canAfford(price) ? null : 'budget insufficiente',
      run: () => ({ title: 'CUFFIE NUOVE', color: GOOD, effects: { budget: -price, stress: -10 }, lines: ['Costose, ma funzionano.'] })
    },
    {
      label: 'Gli do una gomitata "involontaria"',
      run: () => (coin(0.5)
        ? { title: '"OPS, MI SCUSI!"', color: GOOD, effects: { stress: -5 }, lines: ['Il vicino si zittisce, offeso.'] }
        : { title: 'TI HA SCOPERTO...', color: BAD, effects: { stress: 15 }, lines: ['Ora ti fissa male per tutto il viaggio.'] })
    }
  ];
}

function hungerEvent(price) {
  const banana = GameState.hasItem('banana');
  const antacid = GameState.hasItem('antacid');
  return {
    title: 'Fame!',
    text: 'Lo stomaco brontola. Passa il servizio di ristoro con panini dall\'aria... industriale.',
    options: [
      {
        label: 'Mangio la banana',
        disabled: banana ? null : 'non l\'hai in valigia',
        run: () => ({ title: 'BANANA!', color: GOOD, effects: { hp: 10, stress: -5 }, lines: ['Gratis e salutare.'] })
      },
      {
        label: `Compro un panino (${price} €)`,
        disabled: GameState.canAfford(price) ? null : 'budget insufficiente',
        run: () => (antacid
          ? { title: 'PANINO', color: GOOD, effects: { hp: 10, budget: -price }, lines: ['Le pasticche salvano lo stomaco.'] }
          : { title: 'PANINO... E BRUCIORE', color: BAD, effects: { hp: 10, budget: -price, stress: 10 }, lines: ['Senza pasticche: acidita\' di stomaco!'] })
      },
      {
        label: 'Resto a digiuno (risparmio)',
        run: () => ({ title: 'FAME NERA', color: BAD, effects: { stress: 10 }, lines: ['Lo stomaco brontola per tutto il viaggio.'] })
      }
    ]
  };
}

function sleepEvent() {
  return GameState.hasItem('sleepmask')
    ? { auto: { title: 'PISOLINO RIGENERANTE', color: GOOD, effects: { stress: -20 }, lines: ['Mascherina sugli occhi e... zzz.'] } }
    : { auto: { title: 'NIENTE PISOLINO', color: BAD, effects: { stress: 5 }, lines: ['Troppa luce per dormire.', '(Una mascherina avrebbe aiutato)'] } };
}

const PLANE = [
  (s) => ({
    bubble: 'ALLACCIARE LE CINTURE!',
    fx: () => s.cameras.main.shake(1200, 0.012),
    auto: { title: 'TURBOLENZA!', color: BAD, effects: { stress: 10 }, lines: ['L\'aereo balla, il caffe\' vola.'] }
  }),
  () => ({
    bubble: 'ANCHE LEI IN TRASFERTA? LE RACCONTO DI MIO CUGINO...',
    title: 'Il vicino chiacchierone',
    text: 'Il vicino di posto attacca bottone. Sono le 7 del mattino e ha gia\' raccontato tre aneddoti.',
    options: [
      ...noiseOptions(PRICES.headphones),
      {
        label: 'Mi fingo morto',
        run: () => (coin(0.5)
          ? { title: 'FUNZIONA!', color: GOOD, effects: { stress: -10 }, lines: ['Il vicino chiama la hostess e cambia posto.'] }
          : { title: 'MASSAGGIO CARDIACO!', color: BAD, effects: { stress: 15 }, lines: ['Un medico a bordo prova a rianimarti.', 'Figuraccia davanti a tutti.'] })
      }
    ]
  }),
  () => hungerEvent(PRICES.sandwichPlane),
  () => sleepEvent()
];

const TRAIN = [
  () => {
    const phone = GameState.hasItem('phone');
    const charger = GameState.hasItem('charger');
    return {
      bubble: 'MI SENTI? MI SENTI?!',
      title: 'Il Wi-Fi del treno',
      text: 'Sei in call con il capo... il treno entra in galleria e il Wi-Fi cade.',
      options: [
        {
          label: 'Faccio hotspot con il telefono',
          disabled: phone ? null : 'non hai il telefono',
          run: () => (charger
            ? { title: 'CALL SALVATA', color: GOOD, effects: { stress: -5 }, lines: ['Il capo non si e\' accorto di nulla.'] }
            : { title: 'TELEFONO SCARICO!', color: BAD, effects: { stress: 15 }, lines: ['Senza caricabatterie si spegne a meta\' call.'] })
        },
        {
          label: 'Aspetto che torni il segnale',
          run: () => ({ title: 'GALLERIA INFINITA', color: BAD, effects: { stress: 15 }, lines: ['Il capo: "Ci sei? Ci sei?"'] })
        },
        {
          label: '"Ti sento a scatti... ti richiamo!"',
          run: () => (coin(0.5)
            ? { title: 'CI HA CREDUTO', color: GOOD, effects: { stress: -5 }, lines: ['Call rimandata a domani.'] }
            : { title: 'TI RICHIAMA SUBITO', color: BAD, effects: { stress: 10 }, lines: ['Appena usciti dalla galleria.'] })
        }
      ]
    };
  },
  () => ({
    bubble: 'PRONTO?! SONO IN TRENO! SI',
    title: 'Il vicino rumoroso',
    text: 'Il vicino fa una call in vivavoce, a voce altissima. Tutta la carrozza conosce ormai i suoi affari.',
    options: [
      ...noiseOptions(PRICES.headphones),
      {
        label: 'Cambio posto',
        run: () => (coin(0.6)
          ? { title: 'POSTO TRANQUILLO', color: GOOD, effects: { stress: -5 }, lines: ['Trovi un posto libero e silenzioso.'] }
          : { title: 'ACCANTO AL BAGNO', color: BAD, effects: { stress: 10 }, lines: ['L\'unico posto libero e\' vicino al bagno...', '...e al suo profumo.'] })
      }
    ]
  }),
  () => hungerEvent(PRICES.sandwichTrain),
  () => sleepEvent()
];

// Trip stage 4: the journey by plane or train, a sequence of events with choices.
export default class JourneyScene extends Phaser.Scene {
  constructor() {
    super('JourneyScene');
  }

  init(data) {
    this.levelIndex = data?.levelIndex ?? 0;
    this.mode = LEVELS[this.levelIndex]?.journey || 'train';
    this.step = 0;
  }

  create() {
    setupStaticCamera(this);
    GameState.beginLevel(this.levelIndex);
    beginStage(this.levelIndex);
    audio.music('level');
    const plane = this.mode === 'plane';
    this.drawCabin(plane);
    this.refreshHud = tripHud(this, plane ? 'IL VOLO' : 'IL TRENO');
    this.queue = (plane ? PLANE : TRAIN).map((f) => () => f(this));
    if (underwearPenalty()) {
      this.queue.unshift(() => ({ auto: { title: 'SENZA MUTANDE DI RICAMBIO', color: BAD, effects: {}, lines: ['STRESS +10%', 'Sara\' una lunga trasferta.'] } }));
      this.refreshHud();
    }
    this.banner = this.add.text(GAME_WIDTH / 2, 60, plane ? 'IN VOLO VERSO IL CLIENTE' : 'IN VIAGGIO VERSO IL CLIENTE',
      tstyle(16, '#ffd800', { strokeThickness: 5 })).setOrigin(0.5).setDepth(40);
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.time.delayedCall(1400, () => this.runEvent());
  }

  drawCabin(plane) {
    const W = GAME_WIDTH;
    // Landscape behind the windows, scrolling left.
    const land = this.add.graphics();
    if (plane) {
      land.fillStyle(0x6fb8ff).fillRect(0, 0, W * 2, 300);
      land.fillStyle(0xffffff, 0.9);
      for (let x = 0; x < W * 2; x += 140) land.fillRect(x, 120 + (x % 3) * 14, 70, 14).fillRect(x + 14, 112 + (x % 3) * 14, 40, 10);
    } else {
      land.fillStyle(0x9fd8ff).fillRect(0, 0, W * 2, 300);
      land.fillStyle(0x5aa040);
      for (let x = 0; x < W * 2; x += 200) land.fillEllipse(x + 100, 190, 260, 90);
      land.fillStyle(0x3a7a2a).fillRect(0, 170, W * 2, 130);
      land.fillStyle(0x5a4a3a);
      for (let x = 0; x < W * 2; x += 90) land.fillRect(x, 110, 4, 70);
    }
    this.tweens.add({ targets: land, x: -W, duration: plane ? 9000 : 3000, repeat: -1 });

    // Cabin wall with window holes
    const g = this.add.graphics();
    const wall = plane ? 0xe8e4dc : 0x8a6a4a;
    const winY = 90, winH = plane ? 70 : 80, winW = plane ? 60 : 150, step = plane ? 130 : 200;
    g.fillStyle(wall).fillRect(0, 30, W, winY - 30).fillRect(0, winY + winH, W, GAME_HEIGHT - winY - winH);
    let x = 0;
    for (let wx = 50; wx < W; wx += step) {
      g.fillRect(x, winY, wx - x, winH);
      g.lineStyle(4, plane ? 0xb8b4ac : 0x4a3a2a).strokeRoundedRect(wx, winY, winW, winH, plane ? 18 : 4);
      x = wx + winW;
    }
    g.fillRect(x, winY, W - x, winH);
    g.fillStyle(plane ? 0xc8c4bc : 0x6a4a2a).fillRect(0, 180, W, 8);
    if (plane) g.fillStyle(0xd8d4cc).fillRect(0, 30, W, 30);  // overhead bins

    // Seats: player and neighbour seated, front row in the foreground.
    const seat = plane ? 0x2a4a8a : 0x8a2a2a;
    const seatX = [240, 360, 480, 600];
    seatX.forEach((sx) => g.fillStyle(seat).fillRoundedRect(sx - 44, 220, 88, 150, 10));
    const c = GameState.character || 'man';
    this.player = this.add.image(360, 352, playerTex(c, 'idle')).setOrigin(0.5, 1).setScale(3);
    this.neighbour = this.add.image(480, 352, TEX.TALKER1).setOrigin(0.5, 1).setScale(3).setFlipX(true);
    const front = this.add.graphics();
    seatX.forEach((sx) => front.fillStyle(seat).fillRoundedRect(sx - 50, 330, 100, 120, 10).fillStyle(0x000000, 0.2).fillRect(sx - 50, 330, 100, 6));
    this.tweens.add({ targets: [this.player, this.neighbour], y: 350, duration: plane ? 1200 : 300, yoyo: true, repeat: -1 });
  }

  bubble(text) {
    this.bubbleObj?.destroy();
    if (!text) return;
    const t = this.add.text(520, 200, text, tstyle(10, '#000000', {
      stroke: '#ffffff', strokeThickness: 0, backgroundColor: '#ffffff', padding: { x: 6, y: 4 }, wordWrap: { width: 220 }
    })).setOrigin(0.5, 1).setDepth(30);
    this.bubbleObj = t;
    this.tweens.add({ targets: t, y: 194, duration: 300, yoyo: true, repeat: -1 });
  }

  runEvent() {
    this.banner.setVisible(false);
    if (this.step >= this.queue.length) { this.finish(); return; }
    const ev = this.queue[this.step++]();
    this.bubble(ev.bubble);
    if (ev.bubble) audio.sfx('quiz');
    ev.fx?.();
    if (ev.auto) { this.time.delayedCall(ev.fx ? 900 : 300, () => this.showOutcome(ev.auto)); return; }
    this.time.delayedCall(500, () => choiceDialog(this, {
      title: ev.title, text: ev.text, options: ev.options, y: 170,
      onPick: (i) => this.showOutcome(ev.options[i].run())
    }));
  }

  showOutcome(o) {
    applyEffects(o.effects || {});
    this.refreshHud();
    this.bubble(null);
    audio.sfx(o.color === GOOD ? 'coin' : 'hurt');
    resultPanel(this, {
      title: o.title, color: o.color, lines: [...(o.lines || []), ...effectLines(o.effects || {})], y: 170,
      onClose: () => this.runEvent()
    });
  }

  finish() {
    const plane = this.mode === 'plane';
    this.banner.setText(plane ? 'ATTERRAGGIO!' : 'ARRIVO IN STAZIONE!').setVisible(true);
    audio.sfx('victory');
    if (plane) this.cameras.main.shake(500, 0.006);
    this.time.delayedCall(1800, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => goNext(this, this.levelIndex));
    });
  }
}
