import Phaser from 'phaser';
import { TEX, DEPTH } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from './Audio8bit.js';
import { floatText, sparks } from '../entities/enemies/fx.js';

// The meal the player must put on the tray before the checkout (cassa) lets them out.
export const COURSES = ['primo', 'secondo', 'contorno', 'dolce'];
export const COURSE_TEX = {
  primo: TEX.DISH_PRIMO, secondo: TEX.DISH_SECONDO, contorno: TEX.DISH_CONTORNO, dolce: TEX.DISH_DOLCE
};
const COURSE_LABEL = { primo: 'PRIMO', secondo: 'SECONDO', contorno: 'CONTORNO', dolce: 'DOLCE' };

const COOL_MS = 2500;        // a hot dish stops steaming after this long on the ground
const GROUND_MS = 7000;      // dishes left on the floor disappear after this long
const DESSERT_STRESS = -20;

// A dish (or a meal ticket) thrown by a cook. quality: 'good' | 'hot' | 'spoiled'.
export class Food extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, course, quality, vx, vy) {
    super(scene, x, y, course === 'ticket' ? TEX.TICKET : COURSE_TEX[course]);
    this.course = course;
    this.quality = course === 'ticket' ? 'good' : quality;
    this.landedAt = 0;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.canteen.food.add(this);
    this.setDepth(DEPTH.ITEMS).setScale(1.25);
    this.body.setSize(14, 10).setVelocity(vx, vy).setDragX(0);
    this.spin = Phaser.Math.Between(-300, 300);

    if (this.quality === 'hot') {
      this.setTint(0xff9070);
      this.fx = scene.add.particles(0, 0, TEX.FX_PX, {
        follow: this, followOffset: { y: -6 }, speedY: { min: -40, max: -20 }, speedX: { min: -8, max: 8 },
        lifespan: 600, frequency: 70, scale: { start: 1.5, end: 3 }, alpha: { start: 0.8, end: 0 }, tint: 0xffffff
      }).setDepth(DEPTH.ITEMS + 1);
    } else if (this.quality === 'spoiled') {
      this.setTint(0x9acd50);
      this.flies = [0, 1, 2].map(() => scene.add.rectangle(x, y, 2, 2, 0x111111).setDepth(DEPTH.ITEMS + 1));
      this.fliesT = Math.random() * 10;
    }
  }

  get onGround() { return this.body && (this.body.blocked.down || this.body.touching.down); }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.body) return;
    const now = this.scene.time.now;
    if (!this.landedAt) {
      this.angle += this.spin * delta / 1000;
      if (this.onGround) {
        this.landedAt = now;
        this.angle = 0;
        this.body.setVelocityX(0);
      }
    } else {
      this.body.setVelocityX(0);
      if (this.quality === 'hot' && now - this.landedAt > COOL_MS) this.cool();
      const left = GROUND_MS - (now - this.landedAt);
      if (left < 2000) this.setAlpha(Math.floor(now / 100) % 2 ? 0.3 : 1);
      if (left <= 0) { this.destroy(); return; }
    }
    if (this.flies) {
      this.fliesT += delta / 1000;
      this.flies.forEach((f, i) => {
        const a = this.fliesT * (5 + i) + i * 2.1;
        f.setPosition(this.x + Math.cos(a) * (7 + i * 2), this.y - 8 + Math.sin(a * 1.3) * 4);
      });
    }
    if (this.y > this.scene.physics.world.bounds.bottom) this.destroy();
  }

  // Hot dishes become edible once they have cooled down on the floor.
  cool() {
    this.quality = 'good';
    this.clearTint();
    this.fx?.stop();
    floatText(this.scene, this.x, this.y - 10, 'SI E\' RAFFREDDATO', '#9be7ff', 7, 800);
  }

  destroy(fromScene) {
    this.fx?.destroy();
    this.fx = null;
    this.flies?.forEach((f) => f.destroy());
    this.flies = null;
    super.destroy(fromScene);
  }
}

// Canteen rules for levels with `canteen: {}`: thrown food, the meal tray, the checkout and the Teams call.
export default class Canteen {
  // saved = tray restored from a checkpoint (vacation day).
  constructor(scene, saved = null) {
    this.scene = scene;
    this.slots = Object.fromEntries(COURSES.map((c) => [c, !!saved?.[c]]));
    this.food = scene.physics.add.group();
    this.exitWarnAt = 0;
    const oneWay = (a, b) => scene.oneWayProcess(a, b);
    scene.physics.add.collider(this.food, scene.platforms);
    scene.physics.add.collider(this.food, scene.oneWay, null, oneWay);
    scene.physics.add.overlap(scene.player, this.food, (p, f) => this.eat(f));
    if (this.mealComplete()) scene.time.delayedCall(0, () => this.openCheckout(true));
  }

  missing() { return COURSES.filter((c) => !this.slots[c]); }

  mealComplete() { return this.missing().length === 0; }

  // Course to throw next: missing courses are twice as likely, so the meal stays reachable.
  pickCourse() {
    const pool = COURSES.flatMap((c) => (this.slots[c] ? [c] : [c, c]));
    return Phaser.Utils.Array.GetRandom(pool);
  }

  throwFood(x, y, course, quality, vx, vy) {
    return new Food(this.scene, x, y, course, quality, vx, vy);
  }

  eat(food) {
    const s = this.scene;
    const p = s.player;
    if (!food.active || s.ended) return;
    if (food.course === 'ticket') {
      audio.sfx('coin');
      if (GameState.addBonus('ticket', p.hasStatus('raise') ? 2 : 1)) {
        s.ui?.message?.('100 BONUS! SALUTE MENTALE +25%', '#7CFC00', 1500);
        audio.sfx('powerup');
      }
      food.destroy();
      return;
    }
    if (food.quality === 'hot') {
      // Too hot: it burns and gets dropped (the dish stays where it is only if the player is invulnerable).
      if (!p.takeDamage(10, 5, food.x)) return;
      audio.sfx('hurt');
      floatText(s, p.x, p.y - 40, 'SCOTTA!!', '#ff7050', 10);
      food.destroy();
      return;
    }
    if (food.quality === 'spoiled') {
      if (p.hasStatus('promotion')) { food.destroy(); return; }
      GameState.addStress(15);
      p.applyStatus('nausea', 4000);
      audio.sfx('hurt');
      floatText(s, p.x, p.y - 40, 'AVARIATO! STRESS +15%', '#b8f070', 9);
      food.destroy();
      return;
    }
    const c = food.course;
    sparks(s, food.x, food.y, 0xffffff, 6);
    food.destroy();
    if (c === 'dolce') {
      GameState.addStress(DESSERT_STRESS);
      floatText(s, p.x, p.y - 52, `STRESS ${DESSERT_STRESS}%`, '#ff9fd0', 9);
    }
    if (!this.slots[c]) {
      this.slots[c] = true;
      audio.sfx('powerup');
      if (this.mealComplete()) this.openCheckout();
      else s.ui?.message?.(`${COURSE_LABEL[c]} PRESO!`, '#7CFC00', 900);
    } else {
      audio.sfx('coin');
      GameState.addBonus('euro', 3);
      floatText(s, p.x, p.y - 40, 'BIS! +3 EURO', '#ffe066', 9);
    }
  }

  openCheckout(silent = false) {
    const s = this.scene;
    if (!silent) {
      s.ui?.message?.('PASTO COMPLETO!\nVAI ALLA CASSA', '#7CFC00', 2000);
      audio.sfx('checkpoint');
    }
    if (s.goal) {
      s.goal.setTint(0xb0ffb0);
      s.goal.label?.setColor('#7CFC00');
    }
  }

  // Called when the player touches the checkout: true = the level can end.
  allowExit() {
    if (this.mealComplete()) return true;
    const s = this.scene;
    const now = s.time.now;
    s.player.body.setVelocityX(-220);
    if (now > this.exitWarnAt) {
      this.exitWarnAt = now + 1500;
      audio.sfx('hurt');
      s.ui?.message?.(`VASSOIO INCOMPLETO!\nTI MANCA: ${this.missing().map((c) => COURSE_LABEL[c]).join(', ')}`, '#ff8080', 1600);
    }
    return false;
  }

  // Teams call: "ti rubo solo un minuto". Blocks the player for 5 s and adds stress.
  teamsCall(player) {
    if (player.hasStatus('promotion') || player.hasStatus('invuln') || player.hasStatus('stuck')) return false;
    if (player.hasStatus('shield')) return player.takeDamage(0, 0, player.x);
    GameState.addStress(20);
    player.body.setVelocity(0, player.body.velocity.y);
    player.applyStatus('stuck', 5000);
    player.applyStatus('invuln', 6500);
    audio.sfx('alarm');
    this.scene.ui?.teamsCall?.(5000);
    return true;
  }

  destroy() {
    this.food?.clear(true, true);
  }
}
