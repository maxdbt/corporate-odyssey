// Shared UI for the static trip scenes (suitcase, transport, journey, rental, negotiation):
// mini HUD with health / stress / budget, Windows-style choice dialog, result panel.
import Phaser from 'phaser';
import { FONT, GAME_WIDTH, GAME_HEIGHT, TEX } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';

export const tstyle = (size, color = '#ffffff', extra = {}) => ({
  fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#000000', strokeThickness: 3, ...extra
});
const plain = (size, color = '#000000', extra = {}) => ({ fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, ...extra });

// Top strip: SALUTE, STRESS, BUDGET. Returns refresh().
export function tripHud(scene, title) {
  const d = 50;
  scene.add.rectangle(0, 0, GAME_WIDTH, 30, 0x000000, 0.85).setOrigin(0).setDepth(d);
  const g = scene.add.graphics().setDepth(d + 1);
  scene.add.text(8, 15, 'SALUTE', tstyle(8, '#9dffb0')).setOrigin(0, 0.5).setDepth(d + 1);
  scene.add.text(150, 15, 'STRESS', tstyle(8, '#ffb0b0')).setOrigin(0, 0.5).setDepth(d + 1);
  scene.add.image(300, 15, TEX.BUDGET).setDepth(d + 1);
  scene.add.text(312, 15, 'BUDGET', tstyle(8, '#9dffb0')).setOrigin(0, 0.5).setDepth(d + 1);
  const budgetText = scene.add.text(450, 15, '', tstyle(10)).setOrigin(0, 0.5).setDepth(d + 1);
  if (title) scene.add.text(GAME_WIDTH - 8, 15, title, tstyle(10, '#ffd800')).setOrigin(1, 0.5).setDepth(d + 1);
  const bar = (x, v, col) => g.fillStyle(0xffffff).fillRect(x, 10, 72, 10).fillStyle(0x222222).fillRect(x + 1, 11, 70, 8)
    .fillStyle(col).fillRect(x + 1, 11, Math.round(70 * Phaser.Math.Clamp(v / 100, 0, 1)), 8);
  const refresh = () => {
    g.clear();
    bar(60, GameState.hp, GameState.hp > 50 ? 0x3ce05a : GameState.hp > 25 ? 0xffd800 : 0xff3030);
    bar(202, GameState.stress, GameState.stress >= 100 ? 0xff0000 : 0xff9fd0);
    const t = GameState.trip;
    const b = t ? t.budget : 0;
    const ratio = t && t.maxBudget ? b / t.maxBudget : 0;
    g.fillStyle(0xffffff).fillRect(366, 10, 80, 10).fillStyle(0x222222).fillRect(367, 11, 78, 8)
      .fillStyle(ratio > 0.4 ? 0x3ce05a : ratio > 0.15 ? 0xffd800 : 0xff3030).fillRect(367, 11, Math.round(78 * Phaser.Math.Clamp(ratio, 0, 1)), 8);
    budgetText.setText(`${Math.round(b)} €`);
  };
  refresh();
  return refresh;
}

// Windows-style dialog with options. opts: { title, text, options: [{ label, note?, disabled? (reason) }], onPick(i) }.
// Keyboard: UP/DOWN + ENTER (or the option number), mouse/touch: click. Returns { close() }.
export function choiceDialog(scene, opts) {
  const W = opts.width || 520;
  const rowH = 30;
  const textH = opts.textHeight || 56;
  const H = 34 + textH + opts.options.length * rowH + 14;
  const left = GAME_WIDTH / 2 - W / 2;
  const top = Math.max(36, (opts.y || GAME_HEIGHT / 2) - H / 2);
  const c = scene.add.container(0, 0).setDepth(opts.depth || 60);
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.5).fillRect(left + 6, top + 6, W, H);
  g.fillStyle(0xd4d0c8, 1).fillRect(left, top, W, H);
  g.lineStyle(2, 0xffffff).lineBetween(left, top, left + W, top).lineBetween(left, top, left, top + H);
  g.lineStyle(2, 0x404040).lineBetween(left + W, top, left + W, top + H).lineBetween(left, top + H, left + W, top + H);
  g.fillStyle(0x000080, 1).fillRect(left + 3, top + 3, W - 6, 20);
  c.add(g);
  c.add(scene.add.text(left + 10, top + 13, opts.title || 'Trasferta', plain(10, '#ffffff')).setOrigin(0, 0.5));
  c.add(scene.add.text(left + 14, top + 30, opts.text || '', plain(10, '#000000', { wordWrap: { width: W - 28 }, lineSpacing: 3 })));

  let sel = opts.options.findIndex((o) => !o.disabled);
  const rows = opts.options.map((o, i) => {
    const y = top + 34 + textH + i * rowH;
    const bg = scene.add.rectangle(left + 12, y, W - 24, rowH - 4, 0xd4d0c8).setOrigin(0).setStrokeStyle(1, 0x808080);
    const label = scene.add.text(left + 22, y + 4, `${i + 1}. ${o.label}`, plain(10, o.disabled ? '#8a8a8a' : '#000000'));
    const noteText = o.disabled || o.note || '';
    const note = scene.add.text(left + W - 22, y + 15, noteText, plain(8, o.disabled ? '#a03030' : '#305080')).setOrigin(1, 0);
    bg.setInteractive({ useHandCursor: !o.disabled }).on('pointerdown', () => pick(i));
    bg.on('pointerover', () => { if (!o.disabled) { sel = i; paint(); } });
    c.add([bg, label, note]);
    return { bg, label, o };
  });
  const paint = () => rows.forEach((r, i) => {
    const on = i === sel;
    r.bg.setFillStyle(on ? 0x000080 : 0xd4d0c8);
    r.label.setColor(r.o.disabled ? '#8a8a8a' : on ? '#ffffff' : '#000000');
  });
  paint();
  c.setAlpha(0);
  scene.tweens.add({ targets: c, alpha: 1, duration: 150 });

  const readyAt = scene.time.now + 350;
  let closed = false;
  const move = (d) => {
    for (let k = 1; k <= rows.length; k++) {
      const j = (sel + d * k + rows.length * 4) % rows.length;
      if (!rows[j].o.disabled) { sel = j; break; }
    }
    audio.sfx('select');
    paint();
  };
  function pick(i) {
    if (closed || scene.time.now < readyAt || i < 0 || !rows[i] || rows[i].o.disabled) return;
    closed = true;
    audio.sfx('select');
    close();
    opts.onPick(i);
  }
  const onKey = (ev) => {
    const k = ev.key;
    if (k === 'ArrowUp' || k === 'w' || k === 'W') move(-1);
    else if (k === 'ArrowDown' || k === 's' || k === 'S') move(1);
    else if (k === 'Enter' || k === ' ' || k === 'z' || k === 'Z') pick(sel);
    else if (k >= '1' && k <= '9') pick(Number(k) - 1);
  };
  scene.input.keyboard?.on('keydown', onKey);
  function close() {
    scene.input.keyboard?.off('keydown', onKey);
    c.destroy();
  }
  return { close };
}

// Result panel: title + effect lines, closes with ENTER/SPACE/click and calls onClose.
export function resultPanel(scene, { title, lines = [], color = '#ffffff', onClose, y = GAME_HEIGHT / 2, hint = 'INVIO / TOCCA per continuare' }) {
  const cx = GAME_WIDTH / 2;
  const h = 70 + lines.length * 18;
  const c = scene.add.container(0, 0).setDepth(70);
  c.add(scene.add.rectangle(cx, y, 500, h, 0x000000, 0.85).setStrokeStyle(3, 0xffd800));
  c.add(scene.add.text(cx, y - h / 2 + 18, title, tstyle(14, color, { align: 'center' })).setOrigin(0.5));
  c.add(scene.add.text(cx, y - h / 2 + 40, lines.join('\n'), tstyle(11, '#ffffff', { align: 'center', lineSpacing: 5 })).setOrigin(0.5, 0));
  const ht = scene.add.text(cx, y + h / 2 - 12, hint, tstyle(8, '#9be7ff')).setOrigin(0.5);
  c.add(ht);
  scene.tweens.add({ targets: ht, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 });
  const readyAt = scene.time.now + 600;
  let closed = false;
  const done = () => {
    if (closed || scene.time.now < readyAt) return;
    closed = true;
    scene.input.keyboard?.off('keydown', onKey);
    scene.input.off('pointerdown', done);
    c.destroy();
    onClose?.();
  };
  const onKey = (ev) => { if (['Enter', ' ', 'z', 'Z'].includes(ev.key)) done(); };
  scene.input.keyboard?.on('keydown', onKey);
  scene.input.on('pointerdown', done);
  return c;
}

// Text lines describing a set of effects { hp, stress, budget }.
export function effectLines(e) {
  const out = [];
  const sgn = (v) => (v > 0 ? `+${v}` : `${v}`);
  if (e.hp) out.push(`SALUTE MENTALE ${sgn(e.hp)}%`);
  if (e.stress) out.push(`STRESS ${sgn(e.stress)}%`);
  if (e.budget) out.push(`BUDGET ${sgn(e.budget)} €`);
  return out;
}

export function applyEffects(e) {
  if (e.hp) GameState.addHp(e.hp);
  if (e.stress) GameState.addStress(e.stress);
  if (e.budget) GameState.addBudget(e.budget);
}
