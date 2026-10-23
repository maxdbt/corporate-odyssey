// Trip (Mondo 4) additions to a GameScene level: falling departure-board events, duty free, document
// check, petition stands, rental kiosk with the taxi / fuel meter, food stand, budget pickups,
// glacier crevasses and the cold without the down jacket, the sea without the swimsuit.
import Phaser from 'phaser';
import { TEX, DEPTH, FONT } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from './Audio8bit.js';
import Collectible from '../entities/Collectible.js';
import { floatText } from '../entities/enemies/fx.js';
import { PRICES, RENTALS, FOOD_MENUS } from '../data/trip.js';
import { MOUNTS } from '../entities/Player.js';

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
    (level.petition || []).forEach((x) => this.petitionStand(x));
    if (level.food) this.foodStand(...level.food);
    (level.crevasses || []).forEach(([x, w]) => this.crevasse(x, w));
    // Glacier: with the down jacket you are fine, without it the cold gets you now and then.
    if (level.chill && GameState.hasItem('jacket')) {
      scene.time.delayedCall(1200, () => scene.ui?.message?.('IL PIUMINO TI TIENE AL CALDO!', '#7CFC00', 1500));
    }
    // Sea: without the swimsuit you swim in jacket and tie, slower.
    if (level.swim) {
      const heavy = !GameState.hasItem('swimsuit');
      scene.player.heavySuit = heavy;
      const msg = heavy ? 'SENZA COSTUME: NUOTI IN GIACCA E CRAVATTA!\nPIU\' LENTO' : 'COL COSTUME NUOTI MEGLIO!';
      scene.time.delayedCall(1200, () => scene.ui?.message?.(msg, heavy ? '#ff8080' : '#7CFC00', 1600));
    }
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

  // Petition stand "Salva il Lonfo nano": two volunteers chase you when you pass by.
  petitionStand(x) {
    const s = this.scene;
    const floor = this.level.start[1];
    s.add.image(x, floor, TEX.PETITION).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 1);
    const label = s.add.text(x, floor - 58, 'SALVA IL LONFO NANO!\nRACCOLTA FIRME', style(8, '#7CFC00')).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 2);
    s.tweens.add({ targets: label, scale: 1.08, duration: 400, yoyo: true, repeat: -1 });
    [-30, 34].forEach((dx) => s.spawnEnemy('petitioner', x + dx, floor, { home: x + dx }));
  }

  // Food stand: forced stop (full-height trigger, even for a flying camel), opens FoodScene.
  foodStand(x, y) {
    const s = this.scene;
    const menu = FOOD_MENUS[this.level.theme] || {};
    const img = s.add.image(x, y, menu.standTex || TEX.FOOD_STAND).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 1);
    const top = y - img.height - 6;
    const label = s.add.text(x, top, menu.sign || 'CHIOSCO DEL CIBO\nSOSTA OBBLIGATA', style(9, '#ffb000')).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 2);
    s.tweens.add({ targets: label, y: top - 5, duration: 500, yoyo: true, repeat: -1 });
    const z = s.add.zone(x, 225, 24, 450);
    s.physics.add.existing(z, true);
    this.foodDone = false;
    s.physics.add.overlap(s.player, z, () => {
      if (this.foodDone || s.ended) return;
      this.foodDone = true;
      s.player.body.setVelocity(0, 0);
      s.ui?.message?.('SOSTA OBBLIGATA!', '#ffb000', 900);
      s.time.delayedCall(250, () => s.openOverlay('FoodScene'));
    });
  }

  // Crevasse: a dark gap in the ice with a warning above it.
  crevasse(x, w) {
    const s = this.scene;
    const floor = this.level.start[1];
    s.add.rectangle(x, floor, w, 450 - floor, 0x0a2a5a).setOrigin(0).setDepth(DEPTH.PLATFORMS - 1);
    s.add.rectangle(x, floor, w, 8, 0x4a8ad0).setOrigin(0).setDepth(DEPTH.PLATFORMS - 1);
    const t = s.add.text(x + w / 2, floor - 70, 'CREPACCIO!', style(9, '#9be7ff')).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 2);
    s.tweens.add({ targets: t, y: floor - 76, duration: 450, yoyo: true, repeat: -1 });
  }

  // Rental kiosk of the ground leg (RENTALS[theme]): opens the RentalScene choice.
  kiosk(x, y) {
    const s = this.scene;
    s.add.image(x, y, TEX.KIOSK).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 1);
    const label = s.add.text(x, y - 64, 'NOLEGGIO MEZZI', style(10, '#ffd800')).setOrigin(0.5, 1).setDepth(DEPTH.DECOR + 2);
    s.tweens.add({ targets: label, y: y - 69, duration: 500, yoyo: true, repeat: -1 });
    // Parked mounts: the rented one leaves the kiosk.
    this.parked = {};
    this.rental = RENTALS[this.level.theme] || RENTALS.desert;
    this.rental.options.forEach(({ type, dx }) => {
      this.parked[type] = s.add.image(x + dx, y, MOUNTS[type].tex).setOrigin(0.5, 1).setDepth(DEPTH.DECOR).setAlpha(0.9);
    });
    // Underwater you may swim over it: the whole column counts.
    const z = this.level.swim ? s.add.zone(x, 225, 40, 450) : s.add.zone(x, y - 40, 40, 80);
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

  // Called by RentalScene. type = a RENTALS option type, null = on foot.
  rent(type) {
    const s = this.scene;
    if (!type) {
      s.ui?.message?.(this.rental?.footMsg || 'PROSEGUI A PIEDI...', '#ffb000', 1400);
      return;
    }
    if (!GameState.spend(PRICES[type])) return;
    this.rented = true;
    s.player.mountUp(type);
    this.parked?.[type]?.setVisible(false);
    audio.sfx('powerup');
    const opt = this.rental?.options.find((o) => o.type === type);
    let extra = opt?.msg ? `\n${opt.msg}` : '';
    if (type === 'camel') extra = GameState.hasItem('dates') ? '\nDATTERI: TURBO! SALTA IN ARIA PER VOLARE' : '\nSENZA DATTERI SI IMPUNTA!';
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
    // Taxi meter / snowmobile fuel while the mount moves.
    const cfg = p.mount?.cfg;
    if (cfg?.meter && Math.abs(p.body.velocity.x) > 20) {
      this.meter += delta / 1000;
      while (this.meter >= 1) {
        this.meter -= 1;
        if (!GameState.spend(cfg.meter)) {
          p.dismount();
          s.ui?.message?.(cfg.meterOut, '#ff8080', 1800);
          break;
        }
      }
    }
    // Glacier without the down jacket: a cold spell every 11-15 s (sneezes, slippery steps, stress).
    if (this.level.chill && !GameState.hasItem('jacket') && !s.ended) {
      if (!this.nextChill) this.nextChill = time + 8000;
      else if (time >= this.nextChill) {
        this.nextChill = time + Phaser.Math.Between(11000, 15000);
        p.applyStatus('cold', 3000);
        GameState.addStress(5);
        audio.sfx('freeze');
        s.ui?.message?.('BRRR! SENZA PIUMINO SI GELA!\nSTRESS +5%', '#aee8ff', 1400);
      }
    }
  }

  destroy() {
    this.drops?.clear(true, true);
  }
}
