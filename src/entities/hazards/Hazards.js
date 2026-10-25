// Hazard controllers: non-physics spawners updated by GameScene ({ update(time, delta), destroy() }).
import Phaser from 'phaser';
import { TEX, DEPTH, FONT, GAME_WIDTH, GAME_HEIGHT } from '../../config/constants.js';
import { pinToView } from '../../utils/view.js';
import { GameState } from '../../state/GameState.js';
import { audio } from '../../systems/Audio8bit.js';
import EnemyProjectile from '../enemies/EnemyProjectile.js';
import { floatText, bigText } from '../enemies/fx.js';
import { ensureExecTextures } from '../../gfx/exec.js';

class Hazard {
  constructor(scene, props = {}) {
    this.scene = scene;
    this.from = props.from ?? -Infinity;
    this.to = props.to ?? Infinity;
    this.interval = props.interval;
    this.next = scene.time.now + 600;
    this.objects = [];
  }

  get player() {
    const p = this.scene.player;
    return p && p.active && GameState.hp > 0 ? p : null;
  }

  active() {
    const p = this.player;
    return !!p && p.x >= this.from && p.x <= this.to;
  }

  update() {
    const now = this.scene.time.now;
    if (!this.active() || now < this.next) return;
    this.next = now + this.interval * (0.75 + Math.random() * 0.5);
    this.spawn(this.player, now);
  }

  spawn() {}

  track(obj) {
    this.objects.push(obj);
    obj.once('destroy', () => { this.objects = this.objects.filter((o) => o !== obj); });
    return obj;
  }

  destroy() {
    for (const o of this.objects) if (o && o.scene) o.destroy();
    this.objects = [];
  }
}

// Trip departure boards: strikes, delays, miles, upgrades and budget fall around the player
// (objects and effects live in systems/TripLevel.js). props.mix = weights per kind.
export class TripDrops extends Hazard {
  constructor(scene, props = {}) {
    super(scene, { interval: 1700, ...props });
    this.mix = props.mix || { strike: 1, delay: 1, miles: 1 };
  }

  spawn(p) {
    const trip = this.scene.tripLevel;
    if (!trip) return;
    const view = this.scene.cameras.main.worldView;
    const lead = p.body ? p.body.velocity.x * 0.6 : 0;
    const entries = Object.entries(this.mix);
    let roll = Math.random() * entries.reduce((s, [, w]) => s + w, 0);
    const kind = (entries.find(([, w]) => (roll -= w) <= 0) || entries[0])[0];
    trip.spawnDrop(kind, p.x + lead + (Math.random() * 360 - 140), view.y + 50);
  }
}

// Le Mail: envelopes raining vertically from the top of the screen.
export class MailRain extends Hazard {
  constructor(scene, props = {}) {
    super(scene, { interval: 900, ...props });
  }

  spawn(p) {
    const view = this.scene.cameras.main.worldView;
    const lead = p.body ? p.body.velocity.x * 0.5 : 0;
    const x = p.x + lead + (Math.random() * 450 - 200);
    new EnemyProjectile(this.scene, x, view.y - 10, TEX.MAIL, {
      vy: 200 + Math.random() * 60, lifespan: 5000, damage: { hp: 6, stress: 6 }, flipWithDir: false
    });
  }
}

// Giant Teams logos falling like meteors, with a warning marker first.
export class TeamsMeteor extends Hazard {
  constructor(scene, props = {}) {
    super(scene, { interval: 2500, ...props });
  }

  spawn(p) {
    const scene = this.scene;
    const view = scene.cameras.main.worldView;
    const lead = p.body ? p.body.velocity.x * 0.6 : 0;
    const x = p.x + lead + (Math.random() * 160 - 60);
    const warn = this.track(scene.add.text(x, view.y + 34, '▼\n!', {
      fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#ff3030',
      stroke: '#000', strokeThickness: 3, align: 'center'
    }).setOrigin(0.5, 0).setDepth(DEPTH.FX));
    scene.tweens.add({ targets: warn, alpha: 0.2, duration: 120, yoyo: true, repeat: 3 });
    audio.sfx('alarm');
    scene.time.delayedCall(800, () => {
      if (warn.scene) warn.destroy();
      this.track(new EnemyProjectile(scene, x, scene.cameras.main.worldView.y - 30, TEX.TEAMS_METEOR, {
        vy: 430, vx: -30, lifespan: 4000, spin: 120, scale: 1.4, fxOnDestroy: true, flipWithDir: false,
        damage: { hp: 5, stress: 5 },
        onPlayer: (player) => {
          if (player.hasStatus('promotion')) return;
          if (player.takeDamage(5, 5, x)) {
            player.applyStatus('asleep', 3000);
            floatText(scene, player.x, player.y - 30, 'RIUNIONE NOIOSA... ZZZ', '#a0a0ff', 9, 1400);
          }
        }
      }));
    });
  }
}

// Crollo in Borsa (Mondo 5): every `interval` ms an alarm, the floor turns black and white for `duration` ms
// and share certificates rain around the player. Grayscale = camera ColorMatrix (WebGL) or a grey veil (canvas).
export class StockCrash extends Hazard {
  constructor(scene, props = {}) {
    super(scene, { interval: 16000, ...props });
    ensureExecTextures(scene);
    this.duration = props.duration ?? 5000;
    this.next = scene.time.now + (props.first ?? 6000);
    this.until = 0;
    this.dropNext = 0;
    this.fx = null;
    this.veil = null;
  }

  update() {
    const now = this.scene.time.now;
    if (!this.until) { super.update(); return; }
    if (now >= this.until) { this.end(); return; }
    const p = this.player;
    if (p && now >= this.dropNext) {
      this.dropNext = now + 280;
      this.drop(p);
    }
  }

  spawn(p, now) {
    this.until = now + this.duration;
    this.dropNext = now + 500;
    bigText(this.scene, 'CROLLO IN BORSA!', '#ff3030', 1200, 0.3);
    audio.sfx('alarm');
    this.gray(true);
  }

  drop(p) {
    const view = this.scene.cameras.main.worldView;
    const lead = p.body ? p.body.velocity.x * 0.5 : 0;
    const x = p.x + lead + (Math.random() * 520 - 240);
    this.track(new EnemyProjectile(this.scene, x, view.y - 20, 'stock_cert', {
      vy: 170 + Math.random() * 70, vx: Math.random() * 60 - 30, spin: Math.random() * 240 - 120,
      lifespan: 5000, damage: { hp: 4, stress: 7 }, flipWithDir: false
    }));
  }

  end() {
    this.until = 0;
    this.next = this.scene.time.now + this.interval * (0.75 + Math.random() * 0.5);
    this.gray(false);
    this.scene.ui?.message?.('LA BORSA SI RIPRENDE', '#7CFC00', 1000);
  }

  gray(on) {
    const scene = this.scene;
    const cam = scene.cameras?.main;
    if (on) {
      if (this.fx || this.veil) return;
      if (cam && scene.renderer?.type === Phaser.WEBGL && cam.postFX) {
        this.fx = cam.postFX.addColorMatrix();
        this.fx.grayscale(1);
      } else {
        this.veil = pinToView(scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x808080, 0.45).setOrigin(0), 0, 0, 0)
          .setDepth(DEPTH.FX - 1);
      }
      return;
    }
    if (this.fx) { try { cam?.postFX?.remove(this.fx); } catch (e) { /* camera gone */ } this.fx = null; }
    if (this.veil) { if (this.veil.scene) this.veil.destroy(); this.veil = null; }
  }

  destroy() {
    super.destroy();
    this.gray(false);
  }
}
