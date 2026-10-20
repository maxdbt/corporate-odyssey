// Canteen (2-1) characters: cooks throwing food, Teams calls, the colleague who steals your lunch, the boss.
import Phaser from 'phaser';
import { TEX, ANIM } from '../../config/constants.js';
import { GameState } from '../../state/GameState.js';
import { audio } from '../../systems/Audio8bit.js';
import Enemy from './Enemy.js';
import { arcVelocity } from './EnemyProjectile.js';
import { TeamsIcon } from './OfficeEnemies.js';
import { floatText } from './fx.js';

const sign = (v) => (v < 0 ? -1 : 1);

// Weighted random key of { key: weight }.
function pickWeighted(weights) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  let roll = Math.random() * entries.reduce((s, [, w]) => s + w, 0);
  for (const [k, w] of entries) {
    roll -= w;
    if (roll <= 0) return k;
  }
  return entries[0][0];
}

// Cuoco della mensa: stands on the counter and throws a mix of dishes and Teams icons at the player.
// props: { rate (ms between throws), mix: { good, hot, spoiled, teams, ticket } weights }
export class Chef extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.COOK1, {
      kind: 'chef', hp: 99, stompable: false, invulnerable: true, damage: { hp: 0, stress: 0 }, bodySize: [18, 32]
    });
    this.play(ANIM.COOK_THROW);
    this.rate = props.rate || 1500;
    this.mix = props.mix || { good: 6, hot: 2, ticket: 1 };
    this.range = props.range || 560;
    this.nextThrow = this.now + 600;
  }

  think(now) {
    this.body.setVelocityX(0);
    const p = this.target;
    const canteen = this.scene.canteen;
    if (!p || !canteen) return;
    const dx = p.x - this.x;
    this.setFlipX(dx < 0);
    if (Math.abs(dx) > this.range || now < this.nextThrow) return;
    this.nextThrow = now + this.rate * (0.8 + Math.random() * 0.4) / this.speedMult();
    this.throwOne(p, canteen);
  }

  throwOne(p, canteen) {
    const kind = pickWeighted(this.mix);
    const dir = sign(p.x - this.x);
    const sx = this.x + dir * 10, sy = this.y - 30;
    // Aim around the player (a little ahead of them): they must move to catch or dodge.
    const lead = (p.body ? p.body.velocity.x : 0) * 0.6;
    const tx = Phaser.Math.Clamp(p.x + lead + Phaser.Math.Between(-70, 70), sx - this.range, sx + this.range);
    const t = 0.85 + Math.random() * 0.3;
    const v = arcVelocity(sx, sy, tx, p.body ? p.body.bottom - 8 : p.y, t);
    this.scene.tweens.add({ targets: this, scaleY: 0.9, duration: 80, yoyo: true });
    if (kind === 'teams') {
      this.scene.spawnEnemy('teamscall', sx, sy + 8, { vx: v.vx, vy: v.vy });
      floatText(this.scene, this.x, this.y - 40, 'CHIAMATA PER TE!', '#b4b8ff', 8, 700);
    } else if (kind === 'ticket') {
      canteen.throwFood(sx, sy, 'ticket', 'good', v.vx, v.vy);
    } else {
      canteen.throwFood(sx, sy, canteen.pickCourse(), kind, v.vx, v.vy);
    }
  }

  onPlayerContact() {}
}

// Teams icon thrown by the cooks: once it lands it hops like the office ones.
// If it reaches the player a call window opens ("ti rubo solo un minuto"): blocked 5 s, +stress.
export class TeamsCall extends TeamsIcon {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, props);
    this.kind = 'teamscall';
    this.body.setVelocity(props.vx || 0, props.vy || 0);
    this.wasGround = false;
    this.nextHop = this.now + 500;
  }

  think(now) {
    if (!this.onGround()) { this.angle += 12; return; }
    this.angle = 0;
    super.think(now);
  }

  onPlayerContact(player) {
    if (this.dead || this.isStunned()) return;
    if (this.scene.canteen?.teamsCall(player)) this.die('pop');
  }
}

// Il collega scroccone: runs for any dish on the floor and eats it before you do. Stomp him.
export class Moocher extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.TALKER1, {
      kind: 'moocher', hp: 1, stompable: true, isColleague: true, damage: { hp: 4, stress: 8 }, bodySize: [16, 30]
    });
    this.play(ANIM.TALKER_WALK);
    this.customTint = 0xffc890;
    this.homeX = x;
    this.patrol = props.patrol || 140;
    this.dir = -1;
    this.nextLine = 0;
  }

  think(now) {
    const food = this.scene.canteen?.food;
    let target = null;
    let best = 360;
    food?.getChildren().forEach((f) => {
      if (!f.active || !f.landedAt || f.course === 'ticket' || f.quality === 'spoiled') return;
      const d = Math.abs(f.x - this.x);
      if (d < best && Math.abs(f.y - this.y) < 50) { best = d; target = f; }
    });
    let speed = 40;
    if (target) {
      this.dir = sign(target.x - this.x);
      speed = 120;
      if (Math.abs(target.x - this.x) < 10) { this.steal(target, now); speed = 0; }
    } else {
      if (this.x < this.homeX - this.patrol) this.dir = 1;
      if (this.x > this.homeX + this.patrol) this.dir = -1;
    }
    if (this.onGround() && !this.groundAhead(this.dir)) { this.dir = -this.dir; speed = 0; }
    if (this.body.blocked.left) this.dir = 1;
    if (this.body.blocked.right) this.dir = -1;
    this.body.setVelocityX(this.dir * speed * this.speedMult());
    this.setFlipX(this.dir < 0);
  }

  steal(food, now) {
    food.destroy();
    audio.sfx('coin');
    if (now > this.nextLine) {
      this.nextLine = now + 1500;
      const line = Phaser.Utils.Array.GetRandom(['NON LO MANGIAVI, VERO?', 'SLURP!', 'ASSAGGINO!', 'OFFRI TU?']);
      floatText(this.scene, this.x, this.y - 34, line, '#ffc890', 8, 1000);
    }
  }
}

// Il capo in pausa pranzo: patrols between the tables. If he sees you on the floor in front of
// him (or bumps into you): "Già in pausa?" and stress. Stay on the tables to pass unseen.
export class Chief extends Enemy {
  constructor(scene, x, y, props = {}) {
    super(scene, x, y, TEX.GUARDIAN1, {
      kind: 'chief', hp: 99, stompable: false, invulnerable: true, damage: { hp: 0, stress: 15 }, bodySize: [18, 32]
    });
    this.play(ANIM.GUARDIAN_WALK);
    this.customTint = 0xc8d0ff;
    const half = (props.patrol || 300) / 2;
    this.minX = x - half;
    this.maxX = x + half;
    this.dir = props.dir || -1;
    this.scoldUntil = 0;
    this.sight = props.sight || 150;
  }

  think(now) {
    if (this.x < this.minX) this.dir = 1;
    if (this.x > this.maxX) this.dir = -1;
    if (this.body.blocked.left) this.dir = 1;
    if (this.body.blocked.right) this.dir = -1;
    this.body.setVelocityX(this.dir * 55 * this.speedMult());
    this.setFlipX(this.dir < 0);
    const p = this.target;
    if (!p) return;
    const dx = p.x - this.x;
    const sameFloor = Math.abs(p.body.bottom - this.body.bottom) < 24;
    if (sameFloor && sign(dx) === this.dir && Math.abs(dx) < this.sight) this.scold(p);
  }

  scold(player) {
    const now = this.now;
    if (now < this.scoldUntil || player.hasStatus('promotion')) return;
    this.scoldUntil = now + 4000;
    GameState.addStress(this.damage.stress);
    audio.sfx('hurt');
    floatText(this.scene, this.x, this.y - 40, Phaser.Utils.Array.GetRandom(['GIA\' IN PAUSA?', 'SONO LE 13:05...', 'DOPO PASSI DA ME']), '#ff8080', 9, 1200);
    floatText(this.scene, player.x, player.y - 40, `STRESS +${this.damage.stress}%`, '#ff8080', 8, 900);
  }

  onPlayerContact(player) { this.scold(player); }
}
