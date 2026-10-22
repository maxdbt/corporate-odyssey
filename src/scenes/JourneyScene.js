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
    hostess: true,
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
    fx: () => { s.cameras.main.shake(1200, 0.012); s.seatbelt(true); },
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
          label: 'Fingo che il Wi-Fi non sia mai tornato',
          run: () => (coin(0.6)
            ? { title: 'DUE ORE DI PACE', color: GOOD, effects: { stress: -15 }, lines: ['Panorama, silenzio, nessuna call.', 'Il capo: "Ma che galleria lunga..."'] }
            : { title: 'TI HA VISTO ONLINE SU TEAMS', color: BAD, effects: { stress: 20 }, lines: ['Pallino verde = Wi-Fi funzionante.', 'Il capo: "Ah, quindi la galleria..."'] })
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
    if (plane) { this.drawPlaneCabin(); return; }
    const W = GAME_WIDTH;
    // Landscape behind the windows, scrolling left.
    const land = this.add.graphics();
    land.fillStyle(0x9fd8ff).fillRect(0, 0, W * 2, 300);
    land.fillStyle(0x5aa040);
    for (let x = 0; x < W * 2; x += 200) land.fillEllipse(x + 100, 190, 260, 90);
    land.fillStyle(0x3a7a2a).fillRect(0, 170, W * 2, 130);
    land.fillStyle(0x5a4a3a);
    for (let x = 0; x < W * 2; x += 90) land.fillRect(x, 110, 4, 70);
    this.tweens.add({ targets: land, x: -W, duration: 3000, repeat: -1 });

    // Carriage wall with window holes
    const g = this.add.graphics();
    const winY = 90, winH = 80, winW = 150, step = 200;
    g.fillStyle(0x8a6a4a).fillRect(0, 30, W, winY - 30).fillRect(0, winY + winH, W, GAME_HEIGHT - winY - winH);
    let x = 0;
    for (let wx = 50; wx < W; wx += step) {
      g.fillRect(x, winY, wx - x, winH);
      g.lineStyle(4, 0x4a3a2a).strokeRoundedRect(wx, winY, winW, winH, 4);
      x = wx + winW;
    }
    g.fillRect(x, winY, W - x, winH);
    g.fillStyle(0x6a4a2a).fillRect(0, 180, W, 8);

    // Seats: player and neighbour seated, front row in the foreground.
    const seat = 0x8a2a2a;
    const seatX = [240, 360, 480, 600];
    seatX.forEach((sx) => g.fillStyle(seat).fillRoundedRect(sx - 44, 220, 88, 150, 10));
    const c = GameState.character || 'man';
    this.player = this.add.image(360, 352, playerTex(c, 'idle')).setOrigin(0.5, 1).setScale(3);
    this.neighbour = this.add.image(480, 352, TEX.TALKER1).setOrigin(0.5, 1).setScale(3).setFlipX(true);
    const front = this.add.graphics();
    seatX.forEach((sx) => front.fillStyle(seat).fillRoundedRect(sx - 50, 330, 100, 120, 10).fillStyle(0x000000, 0.2).fillRect(sx - 50, 330, 100, 6));
    this.tweens.add({ targets: [this.player, this.neighbour], y: 350, duration: 300, yoyo: true, repeat: -1 });
    this.bubbleAt = { x: 520, y: 200 };
  }

  // Plane cabin seen from the front: window wall, our pair of seats (you + the chatty neighbour),
  // the aisle with the trolley, another pair of passengers.
  drawPlaneCabin() {
    const W = GAME_WIDTH;
    const g = this.add.graphics();
    const AISLE_L = 352, AISLE_R = 512, VX = 432;
    // Walls, ceiling, back wall with the lavatory at the end of the aisle
    g.fillStyle(0xe8e4dc).fillRect(0, 30, W, GAME_HEIGHT - 30);
    g.fillStyle(0xd0ccc4).fillRect(0, 30, W, 26);
    g.fillStyle(0xdcd8d0).fillRect(VX - 40, 56, 80, 70);
    g.fillStyle(0xb8b4ac).fillRect(VX - 22, 66, 44, 60).fillStyle(0x2a6ad8).fillRect(VX - 10, 72, 20, 10);
    this.add.text(VX, 77, 'WC', tstyle(7, '#ffffff', { strokeThickness: 0 })).setOrigin(0.5);
    // Aisle carpet in perspective
    g.fillStyle(0x34406a).fillPoints([{ x: VX - 26, y: 126 }, { x: VX + 26, y: 126 }, { x: AISLE_R + 18, y: GAME_HEIGHT }, { x: AISLE_L - 18, y: GAME_HEIGHT }], true);
    g.fillStyle(0x4a5a8a);
    for (let i = 0; i < 9; i++) {
      const t = i / 9;
      const y = 126 + (GAME_HEIGHT - 126) * t * t;
      const half = 26 + (AISLE_R - AISLE_L) / 2 * t * t + 18 * t * t;
      g.fillRect(VX - half, y, half * 2, 2 + t * 4);
    }
    // Floor under the seats
    g.fillStyle(0x9a968e).fillRect(0, 226, AISLE_L - 10, GAME_HEIGHT - 226).fillRect(AISLE_R + 10, 226, W - AISLE_R - 10, GAME_HEIGHT - 226);
    // Overhead bins
    const bins = (x, w) => {
      g.fillStyle(0xf4f2ee).fillRoundedRect(x, 36, w, 48, 8);
      g.fillStyle(0xc8c4bc).fillRect(x + 4, 76, w - 8, 3);
      for (let bx = x + 20; bx < x + w - 20; bx += 90) g.fillStyle(0x8a8680).fillRect(bx, 66, 26, 4);
    };
    bins(0, AISLE_L - 6);
    bins(AISLE_R + 6, W - AISLE_R - 6);
    // Seat-belt sign and reading lights on the ceiling of the aisle
    this.beltSign = this.add.rectangle(VX, 44, 34, 12, 0x333333).setStrokeStyle(1, 0x888888);
    this.beltIcon = this.add.text(VX, 44, 'CINTURE', tstyle(6, '#666666', { strokeThickness: 0 })).setOrigin(0.5);
    // Window wall on the left, with two portholes and clouds passing by
    g.fillStyle(0xd8d4cc).fillPoints([{ x: 0, y: 84 }, { x: 96, y: 96 }, { x: 96, y: 300 }, { x: 0, y: 330 }], true);
    this.portholes = [[28, 150, 34, 56], [72, 160, 26, 46]];
    this.sky = this.add.graphics();
    this.portholes.forEach(([x, y, w, h]) => g.lineStyle(4, 0xb8b4ac).strokeRoundedRect(x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, 10));
    this.skyX = 0;

    // Our row: four seats (2 + aisle + 2) with the passengers sitting in them
    const SEATS = [168, 288, 576, 696];
    const seatBack = this.add.graphics();
    SEATS.forEach((sx) => {
      seatBack.fillStyle(0x2a4a8a).fillRoundedRect(sx - 46, 112, 92, 104, 12);
      seatBack.fillStyle(0x3a5aa0).fillRoundedRect(sx - 40, 118, 80, 20, 8);
      seatBack.fillStyle(0xffffff).fillRect(sx - 30, 96, 60, 16).fillStyle(0xe0e0e0).fillRect(sx - 30, 108, 60, 4);
      seatBack.fillStyle(0x2a4a8a).fillRoundedRect(sx - 34, 92, 68, 8, 4);
    });
    const c = GameState.character || 'man';
    this.player = this.add.image(SEATS[0], 210, c === 'woman' ? 'pax_woman' : 'pax_man').setOrigin(0.5, 1).setScale(2);
    this.neighbour = this.add.image(SEATS[1], 210, 'pax_chatty1').setOrigin(0.5, 1).setScale(2);
    const others = [this.add.image(SEATS[2], 210, 'pax_reader').setOrigin(0.5, 1).setScale(2),
      this.add.image(SEATS[3], 210, 'pax_music').setOrigin(0.5, 1).setScale(2)];
    // Cushions and armrests in front of the passengers' legs
    const fg = this.add.graphics();
    SEATS.forEach((sx) => {
      fg.fillStyle(0x1f3a70).fillRect(sx - 50, 210, 100, 14);
      fg.fillStyle(0x6a6e76).fillRect(sx - 52, 176, 8, 36).fillRect(sx + 44, 176, 8, 36);
      fg.fillStyle(0x8a8e96).fillRect(sx - 54, 172, 12, 6).fillRect(sx + 42, 172, 12, 6);
      fg.fillStyle(0x4a4e56).fillRect(sx - 40, 224, 6, 14).fillRect(sx + 34, 224, 6, 14);
    });
    // Foreground: backs of the row in front, with tray tables and seat pockets
    SEATS.forEach((sx) => {
      fg.fillStyle(0x24407a).fillRoundedRect(sx - 54, 318, 108, 150, 14);
      fg.fillStyle(0x1a3060).fillRect(sx - 40, 340, 80, 40).fillStyle(0x8a8e96).fillRect(sx - 6, 336, 12, 4);
      fg.fillStyle(0x1a3060).fillRect(sx - 40, 392, 80, 30).fillStyle(0xd02020).fillRect(sx - 30, 386, 14, 10);
    });
    // The music fan nods to the beat, the reader turns pages
    this.tweens.add({ targets: others[1], angle: 2, duration: 260, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: [this.player, this.neighbour, others[0]], y: 209, duration: 1300, yoyo: true, repeat: -1 });
    this.bubbleAt = { x: 330, y: 92 };

    // Flight attendant with the trolley, pushed down the aisle when food is served
    this.hostess = this.add.container(VX, 150).setScale(0.6).setVisible(false);
    this.hostess.add([this.add.image(0, 0, 'hostess').setOrigin(0.5, 1).setScale(2), this.add.image(0, 8, 'trolley').setOrigin(0.5, 1).setScale(2)]);
  }

  showHostess(on) {
    if (!this.hostess) return;
    if (on) {
      this.hostess.setVisible(true).setPosition(432, 150).setScale(0.6);
      this.tweens.add({ targets: this.hostess, y: 238, scale: 0.85, duration: 900, ease: 'Sine.easeOut' });
    } else if (this.hostess.visible) {
      this.tweens.add({ targets: this.hostess, y: 150, scale: 0.6, alpha: 0, duration: 600, onComplete: () => this.hostess.setVisible(false).setAlpha(1) });
    }
  }

  seatbelt(on) {
    if (!this.beltSign) return;
    this.beltBlink?.remove();
    this.beltSign.setFillStyle(on ? 0xffd800 : 0x333333);
    this.beltIcon.setColor(on ? '#000000' : '#666666');
    if (on) this.beltBlink = this.time.addEvent({ delay: 250, loop: true, callback: () => this.beltSign.setVisible(!this.beltSign.visible) });
    else this.beltSign.setVisible(true);
  }

  update(time, delta) {
    // Clouds drifting past the portholes; the chatty neighbour moves his mouth while he talks.
    if (this.sky) {
      this.skyX = (this.skyX + delta * 0.03) % 90;
      const g = this.sky.clear();
      this.portholes.forEach(([x, y, w, h], k) => {
        g.fillStyle(0x6fb8ff).fillRoundedRect(x - w / 2, y - h / 2, w, h, 9);
        // Clouds clipped to the porthole rectangle
        g.fillStyle(0xffffff, 0.95);
        for (let i = 0; i < 2; i++) {
          const cy = y - h / 4 + i * h / 3;
          const cx = x - w / 2 - 20 + ((this.skyX + i * 45 + k * 20) % 90) * ((w + 40) / 90);
          const l = Math.max(cx, x - w / 2 + 3);
          const r = Math.min(cx + 18, x + w / 2 - 3);
          if (r > l) g.fillRect(l, cy, r - l, 6);
        }
      });
    }
    if (this.neighbour && this.talking) this.neighbour.setTexture(Math.floor(time / 140) % 2 ? 'pax_chatty2' : 'pax_chatty1');
  }

  bubble(text) {
    this.bubbleObj?.destroy();
    this.talking = !!text && this.mode === 'plane';
    if (this.neighbour && this.mode === 'plane' && !text) this.neighbour.setTexture('pax_chatty1');
    if (!text) return;
    const at = this.bubbleAt;
    const t = this.add.text(at.x, at.y, text, tstyle(10, '#000000', {
      stroke: '#ffffff', strokeThickness: 0, backgroundColor: '#ffffff', padding: { x: 6, y: 4 }, wordWrap: { width: 220 }
    })).setOrigin(0.5, 1).setDepth(30);
    this.bubbleObj = t;
    this.tweens.add({ targets: t, y: at.y - 6, duration: 300, yoyo: true, repeat: -1 });
  }

  runEvent() {
    this.banner.setVisible(false);
    if (this.step >= this.queue.length) { this.finish(); return; }
    const ev = this.queue[this.step++]();
    this.bubble(ev.bubble);
    if (ev.bubble) audio.sfx('quiz');
    ev.fx?.();
    if (ev.hostess) this.showHostess(true);
    if (ev.auto) { this.time.delayedCall(ev.fx ? 900 : 300, () => this.showOutcome(ev.auto)); return; }
    this.time.delayedCall(500, () => choiceDialog(this, {
      title: ev.title, text: ev.text, options: ev.options, y: this.mode === 'plane' ? 335 : 170,
      onPick: (i) => this.showOutcome(ev.options[i].run())
    }));
  }

  showOutcome(o) {
    applyEffects(o.effects || {});
    this.refreshHud();
    this.bubble(null);
    this.showHostess(false);
    this.seatbelt(false);
    audio.sfx(o.color === GOOD ? 'coin' : 'hurt');
    resultPanel(this, {
      title: o.title, color: o.color, lines: [...(o.lines || []), ...effectLines(o.effects || {})], y: this.mode === 'plane' ? 360 : 170,
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
