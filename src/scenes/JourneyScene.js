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

  // Cabin seen from the front (plane and train share the layout): window wall on the left, our pair of seats
  // (you + the neighbour), the aisle, another pair of passengers on the right.
  drawCabin(plane) {
    const W = GAME_WIDTH;
    const g = this.add.graphics();
    const AISLE_L = 352, AISLE_R = 512, VX = 432;
    const C = plane
      ? { wall: 0xe8e4dc, ceil: 0xd0ccc4, carpet: 0x34406a, stripe: 0x4a5a8a, floor: 0x9a968e, seat: 0x2a4a8a, seatHi: 0x3a5aa0, seatFg: 0x24407a, seatDk: 0x1a3060, cushion: 0x1f3a70 }
      : { wall: 0xd4dcd4, ceil: 0xbcc6bc, carpet: 0x5a5e66, stripe: 0x6e727a, floor: 0x8a8e86, seat: 0x8a2a2a, seatHi: 0xa83a3a, seatFg: 0x7a2424, seatDk: 0x5a1a1a, cushion: 0x6a2020 };
    // Walls, ceiling, back wall: lavatory (plane) or the sliding door to the next carriage (train)
    g.fillStyle(C.wall).fillRect(0, 30, W, GAME_HEIGHT - 30);
    g.fillStyle(C.ceil).fillRect(0, 30, W, 26);
    if (plane) {
      g.fillStyle(0xdcd8d0).fillRect(VX - 40, 56, 80, 70);
      g.fillStyle(0xb8b4ac).fillRect(VX - 22, 66, 44, 60).fillStyle(0x2a6ad8).fillRect(VX - 10, 72, 20, 10);
      this.add.text(VX, 77, 'WC', tstyle(7, '#ffffff', { strokeThickness: 0 })).setOrigin(0.5);
    } else {
      g.fillStyle(0xa8b0a8).fillRect(VX - 40, 56, 80, 70);
      g.fillStyle(0x8a928a).fillRect(VX - 24, 70, 48, 56).fillStyle(0x9fd0e8, 0.8).fillRect(VX - 18, 76, 36, 26);
      g.fillStyle(0x6a726a).fillRect(VX - 1, 70, 2, 56);
    }
    // Aisle floor in perspective
    g.fillStyle(C.carpet).fillPoints([{ x: VX - 26, y: 126 }, { x: VX + 26, y: 126 }, { x: AISLE_R + 18, y: GAME_HEIGHT }, { x: AISLE_L - 18, y: GAME_HEIGHT }], true);
    g.fillStyle(C.stripe);
    for (let i = 0; i < 9; i++) {
      const t = i / 9;
      const y = 126 + (GAME_HEIGHT - 126) * t * t;
      const half = 26 + (AISLE_R - AISLE_L) / 2 * t * t + 18 * t * t;
      g.fillRect(VX - half, y, half * 2, 2 + t * 4);
    }
    // Floor under the seats
    g.fillStyle(C.floor).fillRect(0, 226, AISLE_L - 10, GAME_HEIGHT - 226).fillRect(AISLE_R + 10, 226, W - AISLE_R - 10, GAME_HEIGHT - 226);
    // Overhead bins (plane) or luggage racks with suitcases (train)
    const bins = (x, w) => {
      if (plane) {
        g.fillStyle(0xf4f2ee).fillRoundedRect(x, 36, w, 48, 8);
        g.fillStyle(0xc8c4bc).fillRect(x + 4, 76, w - 8, 3);
        for (let bx = x + 20; bx < x + w - 20; bx += 90) g.fillStyle(0x8a8680).fillRect(bx, 66, 26, 4);
        return;
      }
      const bags = [0x3a3a4a, 0xc0392b, 0x2a6ad8, 0x6a4a2a, 0x16a085];
      for (let bx = x + 14, k = 0; bx < x + w - 50; bx += 70 + (k % 2) * 16, k++) {
        const bw = 40 + (k % 3) * 8, bh = 22 + (k % 2) * 8;
        g.fillStyle(bags[(k + x) % bags.length]).fillRoundedRect(bx, 72 - bh, bw, bh, 4);
        g.fillStyle(0x000000, 0.25).fillRect(bx + bw / 2 - 6, 72 - bh - 3, 12, 3);
      }
      g.fillStyle(0xb0b4b8).fillRect(x, 72, w, 4).fillRect(x, 82, w, 3);
      for (let bx = x + 6; bx < x + w; bx += 60) g.fillStyle(0x8a8e92).fillRect(bx, 72, 3, 13);
    };
    bins(0, AISLE_L - 6);
    bins(AISLE_R + 6, W - AISLE_R - 6);
    // Ceiling sign: seat belts (plane) or the speed display (train)
    if (plane) {
      this.beltSign = this.add.rectangle(VX, 44, 34, 12, 0x333333).setStrokeStyle(1, 0x888888);
      this.beltIcon = this.add.text(VX, 44, 'CINTURE', tstyle(6, '#666666', { strokeThickness: 0 })).setOrigin(0.5);
    } else {
      this.add.rectangle(VX, 44, 84, 14, 0x111111).setStrokeStyle(1, 0x888888);
      const speed = this.add.text(VX, 44, '298 km/h', tstyle(6, '#ff9a20', { strokeThickness: 0 })).setOrigin(0.5);
      this.time.addEvent({ delay: 900, loop: true, callback: () => speed.setText(`${Phaser.Math.Between(287, 300)} km/h`) });
    }
    // Window wall on the left: two portholes with clouds (plane) or two wide windows with the landscape (train)
    g.fillStyle(plane ? 0xd8d4cc : 0xc4ccc4).fillPoints([{ x: 0, y: 84 }, { x: 96, y: 96 }, { x: 96, y: 300 }, { x: 0, y: 330 }], true);
    this.portholes = plane ? [[28, 150, 34, 56], [72, 160, 26, 46]] : [[26, 160, 44, 96], [72, 166, 34, 76]];
    this.sky = this.add.graphics();
    this.portholes.forEach(([x, y, w, h]) => g.lineStyle(4, plane ? 0xb8b4ac : 0x8a928a).strokeRoundedRect(x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, plane ? 10 : 3));
    this.skyX = 0;

    // Our row: four seats (2 + aisle + 2) with the passengers sitting in them
    const SEATS = [168, 288, 576, 696];
    const seatBack = this.add.graphics();
    SEATS.forEach((sx) => {
      seatBack.fillStyle(C.seat).fillRoundedRect(sx - 46, 112, 92, 104, 12);
      seatBack.fillStyle(C.seatHi).fillRoundedRect(sx - 40, 118, 80, 20, 8);
      seatBack.fillStyle(0xffffff).fillRect(sx - 30, 96, 60, 16).fillStyle(0xe0e0e0).fillRect(sx - 30, 108, 60, 4);
      seatBack.fillStyle(C.seat).fillRoundedRect(sx - 34, 92, 68, 8, 4);
    });
    const c = GameState.character || 'man';
    this.player = this.add.image(SEATS[0], 210, c === 'woman' ? 'pax_woman' : 'pax_man').setOrigin(0.5, 1).setScale(2);
    this.neighbour = this.add.image(SEATS[1], 210, 'pax_chatty1').setOrigin(0.5, 1).setScale(2);
    const others = [this.add.image(SEATS[2], 210, 'pax_reader').setOrigin(0.5, 1).setScale(2),
      this.add.image(SEATS[3], 210, plane ? 'pax_music' : 'pax_sleeper').setOrigin(0.5, 1).setScale(2)];
    // Cushions and armrests in front of the passengers' legs
    const fg = this.add.graphics();
    SEATS.forEach((sx) => {
      fg.fillStyle(C.cushion).fillRect(sx - 50, 210, 100, 14);
      fg.fillStyle(0x6a6e76).fillRect(sx - 52, 176, 8, 36).fillRect(sx + 44, 176, 8, 36);
      fg.fillStyle(0x8a8e96).fillRect(sx - 54, 172, 12, 6).fillRect(sx + 42, 172, 12, 6);
      fg.fillStyle(0x4a4e56).fillRect(sx - 40, 224, 6, 14).fillRect(sx + 34, 224, 6, 14);
    });
    // Foreground: backs of the row in front, with tray tables and seat pockets
    SEATS.forEach((sx) => {
      fg.fillStyle(C.seatFg).fillRoundedRect(sx - 54, 318, 108, 150, 14);
      fg.fillStyle(C.seatDk).fillRect(sx - 40, 340, 80, 40).fillStyle(0x8a8e96).fillRect(sx - 6, 336, 12, 4);
      fg.fillStyle(C.seatDk).fillRect(sx - 40, 392, 80, 30).fillStyle(plane ? 0xd02020 : 0xf4f4f4).fillRect(sx - 30, 386, 14, 10);
    });
    // Plane: the music fan nods to the beat; train: the sleeper breathes slowly. Everyone sways a little.
    if (plane) this.tweens.add({ targets: others[1], angle: 2, duration: 260, yoyo: true, repeat: -1 });
    else this.tweens.add({ targets: others[1], scaleY: 2.04, duration: 1100, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: [this.player, this.neighbour, others[0]], y: 209, duration: plane ? 1300 : 420, yoyo: true, repeat: -1 });
    this.bubbleAt = { x: 330, y: 92 };

    // Flight attendant / bar trolley, pushed down the aisle when food is served
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
      const g = this.sky.clear();
      if (this.mode !== 'plane') { this.drawLandscape(g, delta); this.animateNeighbour(time); return; }
      this.skyX = (this.skyX + delta * 0.03) % 90;
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
    this.animateNeighbour(time);
  }

  animateNeighbour(time) {
    if (this.neighbour && this.talking) this.neighbour.setTexture(Math.floor(time / 140) % 2 ? 'pax_chatty2' : 'pax_chatty1');
  }

  // Train windows: sky, hills and fields, with poles rushing past.
  drawLandscape(g, delta) {
    this.skyX = (this.skyX + delta * 0.25) % 120;
    this.portholes.forEach(([x, y, w, h], k) => {
      const l = x - w / 2, t = y - h / 2;
      g.fillStyle(0x9fd8ff).fillRect(l, t, w, h);
      g.fillStyle(0x6aa850).fillRect(l, t + h * 0.45, w, h * 0.2);
      g.fillStyle(0x3a7a2a).fillRect(l, t + h * 0.62, w, h * 0.38);
      g.fillStyle(0xffffff, 0.9).fillRect(l + ((this.skyX * 0.2 + k * 13) % (w - 14)), t + 8, 14, 5);
      const px = l + ((this.skyX + k * 40) % 120) / 120 * (w + 20) - 10;
      if (px > l && px + 4 < l + w) g.fillStyle(0x4a3a2a).fillRect(px, t + 4, 4, h - 8);
    });
  }

  bubble(text) {
    this.bubbleObj?.destroy();
    this.talking = !!text;
    if (this.neighbour && !text) this.neighbour.setTexture('pax_chatty1');
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
      title: ev.title, text: ev.text, options: ev.options, y: 335,
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
      title: o.title, color: o.color, lines: [...(o.lines || []), ...effectLines(o.effects || {})], y: 360,
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
