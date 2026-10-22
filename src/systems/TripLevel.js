// Trip (Mondo 4) additions to a GameScene level: falling departure-board events, duty free, document
// check, desert rental kiosk with the taxi meter, budget pickups.
import Phaser from 'phaser';
import { TEX, DEPTH, FONT } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from './Audio8bit.js';
import Collectible from '../entities/Collectible.js';
import { floatText } from '../entities/enemies/fx.js';
import { PRICES, TAXI_METER } from '../data/trip.js';

// Weighted random key of { key: weight }.
export function pickWeighted(weights) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  let roll = Math.random() * entries.reduce((s, [, w]) => s + w, 0);
  for (const [k, w] of entries) {
    roll -= w;
    if (roll <= 0) return k;
  }
  return entries[0][0];
}

const DROP_TEX = { strike: TEX.DROP_STRIKE, delay: TEX.DROP_DELAY, miles: TEX.MILES, upgrade: TEX.UPGRADE, budget: TEX.BUDGET };
const BAD_DROPS = ['strike', 'delay'];

// Duty free goods: price and what they give back.
const DUTY_FREE = {
  df_perfume: { price: 30, label: 'PROFUMO', apply: (s) => { GameState.addStress(-15); return 'STRESS -15%'; } },
  df_choco: { price: 15, label: 'CIOCCOLATO', apply: (s) => { GameState.addHp(10); return 'SALUTE +10%'; } },
  df_watch: { price: 80, label: 'OROLOGIO', apply: (s) => { s.timeLeft += 20; return 'TEMPO +20s'; } }
};

const style = (size, color) => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 3, align: 'center'
});

export default class TripLevel {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;
    this.dfWarnAt = 0;
    this.meter = 0;
    this.rented = false;

    // Falling events from the departure boards (spawned by the 'tripdrops' hazard).
    this.drops = scene.physics.add.group({ allowGravity: false });
    scene.physics.add.collider(this.drops, scene.platforms, (d) => this.land(d));
    scene.physics.add.collider(this.drops, scene.oneWay, (d) => this.land(d), (d, plat) => scene.oneWayProcess(d, plat));
    scene.physics.add.overlap(scene.player, this.drops, (p, d) => this.catchDrop(d));

    (level.dutyFree || []).forEach(([x, kind]) => this.dutyFreeShelf(x, kind));
    if (level.docCheck) this.docDesk(...level.docCheck);
    if (level.rental) this.kiosk(...level.rental);
  }

  // ---------------------------------------------------------------- drops

  spawnDrop(kind, x, y) {
    const d = this.scene.physics.add.image(x, y, DROP_TEX[kind]).setDepth(DEPTH.ITEMS + 1);
    this.drops.add(d);
    d.kind = kind;
    d.body.setVelocityY(BAD_DROPS.includes(kind) ? 170 : 120);
    d.setScale(1.3);
    if (!BAD_DROPS.includes(kind)) {
      d.glow = this.scene.add.circle(x, y, 12, 0xffffaa, 0.3).setDepth(DEPTH.ITEMS);
      d.on('destroy', () => d.glow?.destroy());
    }
    return d;
  }

  land(d) {
    if (d.landedAt) return;
    d.landedAt = this.scene.time.now;
    d.body.setVelocity(0, 0);
    this.scene.tweens.add({ targets: d, alpha: 0.2, delay: 2500, duration: 150, yoyo: true, repeat: 4, onComplete: () => d.destroy() });
  }

  catchDrop(d) {
    if (!d.active || this.scene.ended) return;
    const p = this.scene.player;
    const bad = BAD_DROPS.includes(d.kind);
    if (bad && (p.hasStatus('invuln') || p.hasStatus('promotion'))) return;
    if (bad && p.hasShield()) {
      p.takeDamage(0, 0, d.x); // consumes the shield
      d.destroy();
      return;
    }
    const station = this.level.theme === 'station';
    switch (d.kind) {
      case 'strike':
        GameState.addStress(15);
        p.applyStatus('invuln', 900);
        audio.sfx('hurt');
        this.scene.ui?.message?.(station ? 'SCIOPERO DEI TRENI!\nSTRESS +15%' : 'SCIOPERO DEI CONTROLLORI!\nSTRESS +15%', '#ff8080', 1300);
        break;
      case 'delay':
        GameState.addStress(8);
        this.scene.timeLeft = Math.max(1, this.scene.timeLeft - 10);
        p.applyStatus('invuln', 900);
        audio.sfx('hurt');
        this.scene.ui?.message?.('RITARDO! -10 SECONDI', '#ff8080', 1300);
        break;
      case 'miles':
        GameState.addBudget(15);
        audio.sfx('coin');
        floatText(this.scene, d.x, d.y - 10, 'MIGLIA +15 €', '#7fd4ff', 9);
        break;
      case 'budget':
        GameState.addBudget(25);
        audio.sfx('coin');
        floatText(this.scene, d.x, d.y - 10, 'BUDGET EXTRA +25 €', '#7CFC00', 9);
        break;
      case 'upgrade':
        p.applyStatus('upgrade', 10000);
        audio.sfx('powerup');
        this.scene.ui?.message?.(station ? 'UPGRADE PRIMA CLASSE!' : 'UPGRADE BUSINESS!', '#ffd800', 1300);
        break;
      default:
        break;
    }
    d.destroy();
  }

  // ---------------------------------------------------------------- pickups

  // Returns true if handled (item gets collected), 'keep' to leave it there, false if not a trip item.
  collect(item) {
    const s = this.scene;
    const df = DUTY_FREE[item.kind];
    if (df) {
      if (!GameState.spend(df.price)) {
        if (s.time.now > this.dfWarnAt) {
          this.dfWarnAt = s.time.now + 1500;
          floatText(s, item.x, item.y - 16, 'BUDGET INSUFFICIENTE', '#ff8080', 8);
        }
        return 'keep';
      }
      const gain = df.apply(s);
      item.priceTag?.destroy();
      audio.sfx('coin');
      s.ui?.message?.(`${df.label} -${df.price} €\n${gain}`, '#ff9fd0', 1300);
      return true;
    }
    switch (item.kind) {
      case 'budget':
        GameState.addBudget(40);
        audio.sfx('powerup');
        s.ui?.message?.('ANTICIPO SPESE! BUDGET +40 €', '#7CFC00', 1300);
        return true;
      case 'miles':
        GameState.addBudget(20);
        audio.sfx('coin');
        s.ui?.message?.('MIGLIA ACCUMULATE! +20 €', '#7fd4ff', 1300);
        return true;
      case 'upgrade':
        s.player.applyStatus('upgrade', 10000);
        audio.sfx('powerup');
        return true;
      default:
        return false;
    }
  }

  // ---------------------------------------------------------------- props

  dutyFreeShelf(x, kind) {
    const s = this.scene;
    const floor = this.level.start[1];
    s.add.image(x, floor, TEX.SHELF).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 1);
    s.add.text(x, floor - 56, 'DUTY FREE', style(8, '#ffd800')).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 2);
    const item = new Collectible(s, x, floor - 70, kind);
    item.setScale(1.4);
    item.priceTag = s.add.text(x, floor - 84, `${DUTY_FREE[kind].price} €`, style(8, '#ff9fd0')).setOrigin(0.5, 1).setDepth(DEPTH.ITEMS);
  }

  // Passport control: without the ID card you pay for a provisional document.
  docDesk(x, y) {
    const s = this.scene;
    s.add.image(x, y, TEX.GATE_DESK).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 1);
    s.add.text(x, y - 46, 'CONTROLLO\nDOCUMENTI', style(8, '#9be7ff')).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 2);
    const z = s.add.zone(x, y - 60, 24, 120);
    s.physics.add.existing(z, true);
    let done = false;
    s.physics.add.overlap(s.player, z, () => {
      if (done || s.ended) return;
      done = true;
      const p = s.player;
      if (GameState.hasItem('idcard')) {
        audio.sfx('checkpoint');
        s.ui?.message?.('DOCUMENTO OK!\nBUON VIAGGIO', '#7CFC00', 1400);
        return;
      }
      p.applyStatus('stuck', 2200);
      p.body.setVelocityX(0);
      audio.sfx('alarm');
      if (GameState.spend(PRICES.provisionalId)) {
        GameState.addStress(10);
        s.ui?.message?.(`DOCUMENTO DIMENTICATO!\nPROVVISORIO -${PRICES.provisionalId} €`, '#ff8080', 2000);
      } else {
        GameState.addStress(25);
        s.timeLeft = Math.max(1, s.timeLeft - 20);
        s.ui?.message?.('DOCUMENTO DIMENTICATO!\nNIENTE SOLDI: ORE DI CODA', '#ff8080', 2000);
      }
    });
  }

  // Desert rental kiosk: opens the RentalScene choice.
  kiosk(x, y) {
    const s = this.scene;
    s.add.image(x, y, TEX.KIOSK).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 1);
    const label = s.add.text(x, y - 64, 'NOLEGGIO MEZZI', style(10, '#ffd800')).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 2);
    s.tweens.add({ targets: label, y: y - 69, duration: 500, yoyo: true, repeat: -1 });
    // Parked mounts: the rented one leaves the kiosk.
    this.parked = {};
    [['camel', TEX.CAMEL, -90], ['moto', TEX.MOTO, 70], ['taxi', TEX.TAXI, 130]].forEach(([type, tex, dx]) => {
      this.parked[type] = s.add.image(x + dx, y, tex).setOrigin(0.5, 1).setDepth(DEPTH.DECOR).setAlpha(0.9);
    });
    const z = s.add.zone(x, y - 40, 40, 80);
    s.physics.add.existing(z, true);
    this.kioskZone = z;
    this.kioskArmed = true;
    s.physics.add.overlap(s.player, z, () => {
      if (!this.kioskArmed || this.rented || s.ended || s.player.mount) return;
      this.kioskArmed = false;
      s.player.body.setVelocityX(0);
      s.openOverlay('RentalScene');
    });
  }

  // Called by RentalScene. type = camel | moto | taxi | null (on foot).
  rent(type) {
    const s = this.scene;
    if (!type) {
      s.ui?.message?.('PROSEGUI A PIEDI...', '#ffb000', 1400);
      return;
    }
    if (!GameState.spend(PRICES[type])) return;
    this.rented = true;
    s.player.mountUp(type);
    this.parked?.[type]?.setVisible(false);
    audio.sfx('powerup');
    const extra = type === 'taxi' ? `\nTASSAMETRO: ${TAXI_METER} €/s` : type === 'camel' && !GameState.hasItem('dates') ? '\nSENZA DATTERI SI IMPUNTA!' : '';
    s.ui?.message?.(`NOLEGGIATO! -${PRICES[type]} €${extra}`, '#ffd800', 1800);
  }

  // Sniffer dog search: blocked, stress, then free.
  search(player) {
    const s = this.scene;
    player.applyStatus('stuck', 3000);
    player.applyStatus('invuln', 4500);
    player.body.setVelocityX(0);
    GameState.addStress(15);
    audio.sfx('alarm');
    s.ui?.message?.('PERQUISIZIONE!\nSTRESS +15%', '#ff8080', 1800);
    s.time.delayedCall(3000, () => {
      if (!s.ended) s.ui?.message?.('NIENTE DA SEGNALARE.\nPUO\' ANDARE', '#7CFC00', 1400);
    });
  }

  update(time, delta) {
    const s = this.scene;
    const p = s.player;
    // Re-arm the kiosk once the player walks away from it.
    if (this.kioskZone && !this.kioskArmed && Math.abs(p.x - this.kioskZone.x) > 80) this.kioskArmed = true;
    // Taxi meter while the taxi moves.
    if (p.mount?.type === 'taxi' && Math.abs(p.body.velocity.x) > 20) {
      this.meter += delta / 1000;
      while (this.meter >= 1) {
        this.meter -= 1;
        if (!GameState.spend(TAXI_METER)) {
          p.dismount();
          s.ui?.message?.('BUDGET FINITO!\nIL TASSISTA TI FA SCENDERE', '#ff8080', 1800);
          break;
        }
      }
    }
  }

  destroy() {
    this.drops?.clear(true, true);
  }
}
