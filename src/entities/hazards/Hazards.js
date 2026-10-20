// Hazard controllers: non-physics spawners updated by GameScene ({ update(time, delta), destroy() }).
import { TEX, DEPTH, FONT } from '../../config/constants.js';
import { GameState } from '../../state/GameState.js';
import { audio } from '../../systems/Audio8bit.js';
import EnemyProjectile from '../enemies/EnemyProjectile.js';
import { floatText } from '../enemies/fx.js';

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
