import Phaser from 'phaser';
import { TEX, ANIM, DEPTH } from '../config/constants.js';

// kind -> texture
const KIND_TEX = {
  euro: TEX.EURO1,
  ticket: TEX.TICKET,
  coffee: TEX.COFFEE,
  water: TEX.WATER,
  vacation: TEX.VACATION,
  laptop: TEX.LAPTOP,
  smartphone: TEX.SMARTPHONE,
  promotion: TEX.PROMOTION,
  raise: TEX.RAISE,
  car: TEX.CAR,
  // trip (Mondo 4)
  budget: TEX.BUDGET,
  miles: TEX.MILES,
  upgrade: TEX.UPGRADE,
  df_perfume: TEX.DF_PERFUME,
  df_choco: TEX.DF_CHOCO,
  df_watch: TEX.DF_WATCH
};

const POWERUPS = ['laptop', 'smartphone', 'promotion', 'raise', 'car', 'vacation', 'budget', 'miles', 'upgrade'];

export default class Collectible extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, kind) {
    super(scene, x, y, KIND_TEX[kind] || TEX.EURO1);
    this.kind = kind;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.items.add(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setDepth(DEPTH.ITEMS);

    if (kind === 'euro' && scene.anims.exists(ANIM.EURO_SPIN)) {
      this.play({ key: ANIM.EURO_SPIN, startFrame: Phaser.Math.Between(0, 1) });
    }

    // Idle bobbing; power-ups also glow.
    scene.tweens.add({
      targets: this,
      y: y - 4,
      duration: 700 + Phaser.Math.Between(0, 300),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    if (POWERUPS.includes(kind)) {
      this.glow = scene.add.circle(x, y, 14, 0xffffaa, 0.25).setDepth(DEPTH.ITEMS - 1);
      scene.tweens.add({ targets: this.glow, scale: 1.4, alpha: 0.05, duration: 600, yoyo: true, repeat: -1 });
    }
  }

  collect() {
    if (!this.active) return;
    const scene = this.scene;
    this.body.enable = false;
    if (this.glow) this.glow.destroy();
    scene.tweens.killTweensOf(this);
    scene.tweens.add({
      targets: this,
      y: this.y - 24,
      alpha: 0,
      scale: 1.6,
      duration: 250,
      onComplete: () => this.destroy()
    });
  }

  destroy(fromScene) {
    if (this.glow) { this.glow.destroy(); this.glow = null; }
    super.destroy(fromScene);
  }
}
