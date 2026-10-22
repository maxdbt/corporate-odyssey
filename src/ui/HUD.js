import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT, TEX, WEAPON_LABEL } from '../config/constants.js';
import { COURSES, COURSE_TEX } from '../systems/Canteen.js';

const STATUS_LABEL = {
  drunk: 'UBRIACO',
  nausea: 'NAUSEA',
  frozen: 'CONGELATO',
  cold: 'RAFFREDDATO',
  asleep: 'ADDORMENTATO',
  stuck: 'BLOCCATO',
  promotion: 'PROMOZIONE',
  raise: 'AUMENTO x2',
  shield: 'AUTO AZIENDALE',
  upgrade: 'UPGRADE BUSINESS'
};

const STATUS_COLOR = {
  drunk: '#ffe680', nausea: '#b8f070', frozen: '#9be7ff', cold: '#bfefff', asleep: '#c0a0ff', stuck: '#ff9f40',
  promotion: '#ffd800', raise: '#7dff7d', shield: '#7fd4ff', upgrade: '#ffd800'
};

const WEAPON_TEX = {
  email: TEX.P_EMAIL, teams: TEX.P_TEAMS, coffee: TEX.P_COFFEE, clock: TEX.P_CLOCK, www: TEX.P_WWW
};

const textStyle = (size, color = '#ffffff') => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 3
});

// 8-bit HUD drawn in UIScene (fixed, unaffected by the game camera).
export default class HUD {
  constructor(scene, onWeaponTap) {
    this.scene = scene;
    this.root = scene.add.container(0, 0).setDepth(10);
    this.time = 0;

    // Top strip background
    const strip = scene.add.rectangle(0, 0, GAME_WIDTH, 44, 0x000000, 0.85).setOrigin(0, 0);
    this.root.add(strip);

    // Mental health bar
    this.root.add(scene.add.image(12, 12, TEX.UI_BRAIN).setScale(1.2));
    this.root.add(scene.add.text(22, 4, 'SALUTE MENTALE', textStyle(9, '#9dffb0')));
    // Stress bar
    this.root.add(scene.add.image(12, 32, TEX.UI_STRESS).setScale(1.2));
    this.root.add(scene.add.text(22, 24, 'STRESS', textStyle(9, '#ffb0b0')));
    this.bars = scene.add.graphics();
    this.root.add(this.bars);
    this.hpText = scene.add.text(196, 9, '', textStyle(10)).setOrigin(0, 0.5);
    this.stressText = scene.add.text(196, 29, '', textStyle(10)).setOrigin(0, 0.5);
    this.panicText = scene.add.text(232, 29, 'PANICO! COMANDI INVERTITI', textStyle(9, '#ff3030')).setOrigin(0, 0.5).setVisible(false);
    this.root.add([this.hpText, this.stressText, this.panicText]);

    // Level name & timer (center)
    this.levelText = scene.add.text(GAME_WIDTH / 2, 4, '', textStyle(10, '#ffd800')).setOrigin(0.5, 0);
    this.root.add(scene.add.image(GAME_WIDTH / 2 - 26, 30, TEX.UI_CLOCK));
    this.timerText = scene.add.text(GAME_WIDTH / 2 - 16, 30, '', textStyle(13)).setOrigin(0, 0.5);
    this.root.add([this.levelText, this.timerText]);

    // Counters (right)
    const rx = 520;
    this.root.add(scene.add.image(rx, 12, TEX.UI_EURO));
    this.euroText = scene.add.text(rx + 9, 12, '', textStyle(11, '#ffe066')).setOrigin(0, 0.5);
    this.root.add(scene.add.image(rx, 32, TEX.UI_TICKET));
    this.ticketText = scene.add.text(rx + 9, 32, '', textStyle(11, '#ffffff')).setOrigin(0, 0.5);
    this.root.add(scene.add.image(rx + 70, 12, TEX.UI_VACATION));
    this.vacText = scene.add.text(rx + 79, 12, '', textStyle(11, '#7dffd4')).setOrigin(0, 0.5);
    this.root.add(scene.add.text(rx + 62, 26, 'FERIE', textStyle(8, '#7dffd4')));
    this.root.add([this.euroText, this.ticketText, this.vacText]);

    // Weapon / device box (tap to switch)
    const wx = 690;
    this.weaponBox = scene.add.rectangle(wx, 22, 100, 38, 0x1a1a40, 0.85).setStrokeStyle(2, 0x7fffd4);
    this.deviceIcon = scene.add.image(wx - 34, 22, TEX.LAPTOP);
    this.weaponIcon = scene.add.image(wx - 12, 22, TEX.P_EMAIL).setScale(1.4);
    this.weaponText = scene.add.text(wx + 2, 22, '', textStyle(8, '#7fffd4')).setOrigin(0, 0.5);
    this.noDeviceText = scene.add.text(wx, 22, 'NESSUN\nDISPOSITIVO', { ...textStyle(8, '#888888'), align: 'center' })
      .setOrigin(0.5);
    this.root.add([this.weaponBox, this.deviceIcon, this.weaponIcon, this.weaponText, this.noDeviceText]);
    if (onWeaponTap) {
      this.weaponBox.setInteractive({ useHandCursor: true });
      this.weaponBox.on('pointerdown', onWeaponTap);
    }

    // Statuses (left, below strip)
    this.statusText = scene.add.text(6, 50, '', { ...textStyle(10), lineSpacing: 2 });
    this.root.add(this.statusText);

    // Boss bar
    this.bossRoot = scene.add.container(GAME_WIDTH / 2, 62).setVisible(false);
    this.bossBg = scene.add.rectangle(0, 0, 304, 14, 0x000000, 0.8).setStrokeStyle(2, 0xffffff);
    this.bossFill = scene.add.rectangle(-150, 0, 300, 10, 0xff3030).setOrigin(0, 0.5);
    this.bossName = scene.add.text(0, -14, '', textStyle(10, '#ff8080')).setOrigin(0.5);
    this.bossRoot.add([this.bossBg, this.bossFill, this.bossName]);

    // Fog overlay ("HUD appannato")
    this.fogGfx = scene.add.graphics().setDepth(20).setAlpha(0);
    this._drawFog();

    // Center banner
    this.banner = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '', {
      ...textStyle(30), strokeThickness: 6, align: 'center'
    }).setOrigin(0.5).setDepth(30).setVisible(false);
  }

  _drawFog() {
    const g = this.fogGfx;
    g.clear();
    g.fillStyle(0xdde6ee, 0.82);
    g.fillRect(0, 0, GAME_WIDTH, 70);
    // Condensation blobs
    for (let i = 0; i < 60; i++) {
      g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.2, 0.6));
      const s = Phaser.Math.Between(4, 14);
      g.fillRect(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, 66), s, s);
    }
  }

  update(data, delta) {
    if (!data) return;
    this.time += delta || 16;
    const hp = Phaser.Math.Clamp(data.hp ?? 100, 0, 100);
    const stress = Phaser.Math.Clamp(data.stress ?? 0, 0, 100);
    const panic = stress >= 100;

    const g = this.bars;
    g.clear();
    // HP
    g.fillStyle(0x000000, 1).fillRect(100, 3, 92, 12);
    g.fillStyle(0xffffff, 1).fillRect(101, 4, 90, 10);
    g.fillStyle(0x222222, 1).fillRect(102, 5, 88, 8);
    const hpCol = hp > 50 ? 0x3ce05a : hp > 25 ? 0xffd800 : 0xff3030;
    g.fillStyle(hpCol, 1).fillRect(102, 5, Math.round(88 * hp / 100), 8);
    // Stress
    g.fillStyle(0x000000, 1).fillRect(100, 23, 92, 12);
    g.fillStyle(0xffffff, 1).fillRect(101, 24, 90, 10);
    g.fillStyle(0x222222, 1).fillRect(102, 25, 88, 8);
    const pulse = panic && Math.floor(this.time / 150) % 2 === 0;
    const stressCol = panic ? (pulse ? 0xff0000 : 0x880000) : stress > 70 ? 0xff6a00 : 0xff9fd0;
    g.fillStyle(stressCol, 1).fillRect(102, 25, Math.round(88 * stress / 100), 8);
    // pixel segments
    g.fillStyle(0x000000, 0.35);
    for (let x = 110; x < 190; x += 9) { g.fillRect(x, 5, 1, 8); g.fillRect(x, 25, 1, 8); }

    this.hpText.setText(`${Math.round(hp)}%`);
    this.stressText.setText(`${Math.round(stress)}%`);
    this.panicText.setVisible(panic).setColor(pulse ? '#ff3030' : '#ffffff');

    this.levelText.setText(`${data.levelId || ''}  ${data.levelName || ''}`.trim());
    if (data.timeLeft !== undefined && data.timeLeft !== null) {
      const t = Math.max(0, Math.ceil(data.timeLeft));
      this.timerText.setText(`${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`);
      this.timerText.setColor(t <= 30 && Math.floor(this.time / 250) % 2 ? '#ff4040' : '#ffffff');
    } else {
      this.timerText.setText('--:--');
    }

    this.euroText.setText(`${data.euro ?? 0}`);
    this.ticketText.setText(`${data.tickets ?? 0}`);
    this.vacText.setText(`x${data.vacationDays ?? 0}`);

    const hasDevice = !!data.device;
    this.deviceIcon.setVisible(hasDevice);
    this.weaponIcon.setVisible(hasDevice);
    this.weaponText.setVisible(hasDevice);
    this.noDeviceText.setVisible(!hasDevice);
    if (hasDevice) {
      this.deviceIcon.setTexture(data.device === 'smartphone' ? TEX.SMARTPHONE : TEX.LAPTOP);
      this.weaponIcon.setTexture(WEAPON_TEX[data.weapon] || TEX.P_EMAIL);
      this.weaponText.setText(WEAPON_LABEL[data.weapon] || '');
    }

    const lines = (data.statuses || []).map((s) => {
      const label = STATUS_LABEL[s.name] || String(s.name).toUpperCase();
      return s.remaining === Infinity ? label : `${label} ${Math.ceil(s.remaining / 1000)}s`;
    });
    this.statusText.setText(lines.join('\n'));
    const first = (data.statuses || [])[0];
    this.statusText.setColor(first ? (STATUS_COLOR[first.name] || '#ffffff') : '#ffffff');

    this._updateTray(data.meal);
    this._updateBudget(data.budget);
  }

  // Trip budget (top right, Mondo 4): bar + amount; flashes red when it changes downwards.
  _updateBudget(b) {
    if (!b) { this.budgetBox?.setVisible(false); return; }
    const s = this.scene;
    if (!this.budgetBox) {
      this.budgetBox = s.add.container(GAME_WIDTH - 156, 50);
      const bg = s.add.rectangle(0, 0, 150, 32, 0x103a20, 0.9).setOrigin(0).setStrokeStyle(2, 0x000000);
      const icon = s.add.image(12, 16, TEX.BUDGET);
      const label = s.add.text(24, 3, 'BUDGET TRASFERTA', textStyle(7, '#9dffb0'));
      this.budgetGfx = s.add.graphics();
      this.budgetText = s.add.text(144, 3, '', textStyle(8, '#ffffff')).setOrigin(1, 0);
      this.budgetBox.add([bg, icon, label, this.budgetGfx, this.budgetText]);
      this.root.add(this.budgetBox);
      this.lastBudget = b.value;
      this.budgetFlashUntil = 0;
    }
    if (b.value < this.lastBudget) this.budgetFlashUntil = this.time + 600;
    this.lastBudget = b.value;
    const flash = this.time < this.budgetFlashUntil && Math.floor(this.time / 100) % 2;
    const ratio = b.max > 0 ? Phaser.Math.Clamp(b.value / b.max, 0, 1) : 0;
    const col = flash ? 0xff3030 : ratio > 0.4 ? 0x3ce05a : ratio > 0.15 ? 0xffd800 : 0xff3030;
    this.budgetGfx.clear().fillStyle(0x000000).fillRect(24, 16, 120, 10).fillStyle(0x222222).fillRect(25, 17, 118, 8)
      .fillStyle(col).fillRect(25, 17, Math.round(118 * ratio), 8);
    this.budgetText.setText(`${Math.round(b.value)} €`).setColor(flash ? '#ff6060' : '#ffffff');
    this.budgetBox.setVisible(true);
  }

  // Canteen meal tray (top right): one slot per course, lit when collected.
  _updateTray(meal) {
    if (!meal) { this.tray?.setVisible(false); return; }
    if (!this.tray) {
      const s = this.scene;
      this.tray = s.add.container(GAME_WIDTH - 156, 50);
      const bg = s.add.rectangle(0, 0, 150, 34, 0xd84a2a, 0.9).setOrigin(0).setStrokeStyle(2, 0x000000);
      const label = s.add.text(75, 1, 'VASSOIO', textStyle(7, '#ffe066')).setOrigin(0.5, 0);
      this.trayIcons = COURSES.map((c, i) => {
        const x = 20 + i * 36;
        const icon = s.add.image(x, 21, COURSE_TEX[c]).setScale(1.5);
        const check = s.add.text(x + 9, 24, 'v', textStyle(9, '#7CFC00'));
        return { c, icon, check };
      });
      this.tray.add([bg, label, ...this.trayIcons.flatMap((t) => [t.icon, t.check])]);
      this.root.add(this.tray);
    }
    this.tray.setVisible(true);
    this.trayIcons.forEach(({ c, icon, check }) => {
      icon.setAlpha(meal[c] ? 1 : 0.3).setTint(meal[c] ? 0xffffff : 0x000000);
      check.setVisible(!!meal[c]);
    });
  }

  // Teams call window: "ti rubo solo un minuto" with a call timer, closes after ms.
  teamsCall(ms) {
    const s = this.scene;
    this.callWin?.destroy();
    const c = s.add.container(GAME_WIDTH / 2, 190).setDepth(25);
    const W = 300, H = 140;
    const parts = [
      s.add.rectangle(4, 4, W, H, 0x000000, 0.5),
      s.add.rectangle(0, 0, W, H, 0x2b2b40).setStrokeStyle(2, 0x000000),
      s.add.rectangle(0, -H / 2 + 10, W, 20, 0x5b5fc7),
      s.add.text(-W / 2 + 8, -H / 2 + 10, 'Teams - Chiamata in corso', textStyle(8, '#ffffff')).setOrigin(0, 0.5),
      s.add.text(W / 2 - 10, -H / 2 + 10, 'x', textStyle(9, '#ffffff')).setOrigin(0.5),
      s.add.circle(-W / 2 + 46, -6, 24, 0x7b83eb).setStrokeStyle(2, 0xffffff),
      s.add.text(-W / 2 + 46, -6, 'RS', textStyle(14, '#ffffff')).setOrigin(0.5),
      s.add.text(-W / 2 + 84, -30, 'RESPONSABILE', textStyle(9, '#b4b8ff')),
      s.add.text(-W / 2 + 84, -14, '"TI RUBO SOLO\nUN MINUTO..."', { ...textStyle(12, '#ffffff'), lineSpacing: 2 }),
      s.add.rectangle(-30, H / 2 - 22, 40, 18, 0xc4314b),
      s.add.text(-30, H / 2 - 22, 'FINE', textStyle(8, '#ffffff')).setOrigin(0.5)
    ];
    const timer = s.add.text(30, H / 2 - 22, '00:00', textStyle(10, '#7CFC00')).setOrigin(0, 0.5);
    c.add([...parts, timer]);
    c.setScale(0.2);
    s.tweens.add({ targets: c, scale: 1, duration: 200, ease: 'Back.Out' });
    // Timer runs at "meeting speed": 5 real seconds look like a full minute.
    const start = s.time.now;
    const ev = s.time.addEvent({
      delay: 100, loop: true, callback: () => {
        const sec = Math.min(60, Math.floor((s.time.now - start) / ms * 60));
        timer.setText(`00:${String(sec).padStart(2, '0')}`.replace('00:60', '01:00'));
      }
    });
    this.callWin = c;
    s.time.delayedCall(ms, () => {
      ev.remove();
      s.tweens.add({ targets: c, scale: 0, duration: 150, onComplete: () => c.destroy() });
      if (this.callWin === c) this.callWin = null;
    });
  }

  fog(ms) {
    this._drawFog();
    this.scene.tweens.killTweensOf(this.fogGfx);
    this.fogGfx.setAlpha(1);
    this.scene.tweens.add({ targets: this.fogGfx, alpha: 0, delay: ms * 0.6, duration: ms * 0.4 });
  }

  message(text, color = '#ffffff', ms = 2000) {
    const b = this.banner;
    this.scene.tweens.killTweensOf(b);
    b.setText(text).setColor(color).setVisible(true).setAlpha(1).setScale(0.3);
    this.scene.tweens.add({ targets: b, scale: 1, duration: 250, ease: 'Back.Out' });
    this.scene.tweens.add({
      targets: b, alpha: 0, delay: Math.max(300, ms - 400), duration: 400,
      onComplete: () => b.setVisible(false)
    });
  }

  bossBar(name, ratio) {
    if (ratio === null || ratio === undefined) {
      this.bossRoot.setVisible(false);
      return;
    }
    this.bossRoot.setVisible(true);
    this.bossName.setText(name || 'BOSS');
    this.bossFill.width = Math.round(300 * Phaser.Math.Clamp(ratio, 0, 1));
  }
}
