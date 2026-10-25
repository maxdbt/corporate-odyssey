import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TEX, playerTex } from '../config/constants.js';
import { GameState } from '../state/GameState.js';
import { audio } from '../systems/Audio8bit.js';
import { setupStaticCamera } from '../utils/view.js';
import { tstyle, resultPanel, effectLines } from '../ui/TripUI.js';
import { ensurePartyTextures } from '../gfx/party.js';

const SONG_S = 25;
const BPM_START = 110;
const BPM_END = 128;
const FALL_S = 1.6;          // time an arrow takes from the top to the hit line
const PERFECT_S = 0.07;
const GOOD_S = 0.15;
const GOOD_PRECISION = 0.6;  // >= 60% precision: prize, otherwise a disaster
const HIT_Y = 390;
const SPAWN_Y = 40;
const LANES = [
  { dir: 'left', x: 560, angle: -90, color: 0xff5ab4 },
  { dir: 'down', x: 620, angle: 180, color: 0x5ab4ff },
  { dir: 'up', x: 680, angle: 0, color: 0x3cf0a0 },
  { dir: 'right', x: 740, angle: 90, color: 0xffd23f }
];
const KEYS = {
  ArrowLeft: 0, a: 0, A: 0, ArrowDown: 1, s: 1, S: 1, ArrowUp: 2, w: 2, W: 2, ArrowRight: 3, d: 3, D: 3
};
const PLAYER_X = 380;
const PLAYER_Y = 432;

// Jingle Bells, one entry per beat-long slot: [note, beats] (16 bars, loops).
const MELODY = [
  ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['G5', 1], ['C5', 1], ['D5', 1], ['E5', 4],
  ['F5', 1], ['F5', 1], ['F5', 1], ['F5', 1], ['F5', 1], ['E5', 1], ['E5', 1], ['E5', 1], ['E5', 1], ['D5', 1], ['D5', 1], ['E5', 1], ['D5', 2], ['G5', 2],
  ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['E5', 1], ['E5', 2], ['E5', 1], ['G5', 1], ['C5', 1], ['D5', 1], ['E5', 4],
  ['F5', 1], ['F5', 1], ['F5', 1], ['F5', 1], ['F5', 1], ['E5', 1], ['E5', 1], ['E5', 1], ['G5', 1], ['G5', 1], ['F5', 1], ['D5', 1], ['C5', 4]
];
const BASS = ['C', 'C', 'C', 'C', 'F', 'C', 'G', 'G', 'C', 'C', 'C', 'C', 'F', 'C', 'G', 'C']; // one root per bar
const SLOTS = [];
MELODY.forEach(([n, b]) => { SLOTS.push([n, b]); for (let i = 1; i < b; i++) SLOTS.push(null); });

const RIVALS = [
  { name: 'IL CAPO REPARTO', skill: [0.8, 0.92] },
  { name: 'LO STAGISTA', skill: [0.15, 0.3] },
  { name: 'LA CONTABILE', skill: [0.45, 0.7] },
  { name: 'IL SISTEMISTA', skill: [0.35, 0.6] },
  { name: 'QUELLA DEL MARKETING', skill: [0.5, 0.75] }
];
const COLLEAGUES = [[TEX.PARTY1, TEX.PARTY2], [TEX.TALKER1, TEX.TALKER2], [TEX.CONSULTANT1, TEX.CONSULTANT2],
  [TEX.ACTIVIST1, TEX.ACTIVIST2], [TEX.PARTY2, TEX.PARTY1]];

const OUTCOMES = {
  good: [
    { id: 'raise', title: 'IL MEGA-DIRETTORE TI HA NOTATO!', color: '#7CFC00', hp: 20, stress: -10, euro: 12,
      text: ['Ti da\' un aumento... di 12 € lordi.', 'Ma e\' pur sempre un aumento!'] },
    { id: 'trip', title: 'HAI VINTO LA GARA DI BALLO!', color: '#7CFC00', hp: 40, stress: -30,
      text: ['Premio: un viaggio premio...', '...a Coccia di Morto!'] },
    { id: 'cotechino', title: 'SEI STATO BRAVISSIMO!', color: '#7CFC00', hp: 50, stress: -20,
      text: ['Vinci una fornitura di cotechino a vita.'] }
  ],
  bad: [
    { id: 'donkey', title: 'HAI BALLATO COME UN CIUCO DI ALICUDI', color: '#ff8080', stress: 15, time: -20,
      text: ['Per la vergogna ti ubriachi', 'e svieni al centro della pista.'] },
    { id: 'wine', title: 'INCIDENTE DIPLOMATICO!', color: '#ff8080', stress: 25,
      text: ['Ballando scoordinato sbatti contro il Mega-Direttore', 'e gli rovesci il vino rosso sul vestito.'] },
    { id: 'jingle', title: 'SEI ARRIVATO ULTIMO!', color: '#ff8080', stress: 20,
      text: ['Ti tocca cantare "Jingle Bells" davanti', 'al consiglio di amministrazione. Stonando.'] }
  ]
};

const bpmAt = (t) => BPM_START + (BPM_END - BPM_START) * Phaser.Math.Clamp(t / SONG_S, 0, 1);

// 1-1 SALA FESTE (overlay over GameScene, entered through PartyDoor): a 25 s "just dance" contest on a
// Christmas disco track that speeds up. Arrows fall in 4 lanes: press the matching arrow on the line.
// Precision >= 60% wins a random prize, otherwise a random disaster. Rivals' scores are only flavour.
export default class PartyScene extends Phaser.Scene {
  constructor() {
    super('PartyScene');
  }

  init() {
    this.phase = 'intro';
    this.songT = -3;
    this.stats = { perfect: 0, good: 0, miss: 0, stray: 0 };
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.leaving = false;
    // Beat times with the (mildly) accelerating tempo, then the chart: every 2 beats, every beat, then a few doubles.
    this.beats = [];
    for (let t = 0; t < SONG_S; t += 60 / bpmAt(t)) this.beats.push(t);
    const times = [];
    this.beats.forEach((t, i) => {
      const f = t / SONG_S;
      if (f < 0.3) { if (i % 2 === 0) times.push(t); } else times.push(t);
      if (f >= 0.8 && i % 4 === 1 && i < this.beats.length - 1) times.push((t + this.beats[i + 1]) / 2);
    });
    let last = -1;
    let prev = -1;
    this.arrows = times.map((t) => {
      let lane = Phaser.Math.Between(0, 3);
      while (lane === last && (lane === prev || Math.random() < 0.5)) lane = Phaser.Math.Between(0, 3);
      prev = last;
      last = lane;
      return { t, lane, sprite: null, done: false };
    });
    this.nextBeat = 0;
    this.maxScore = this.arrows.reduce((s, a, i) => s + 100 * Math.min(4, 1 + Math.floor(i / 10)), 0);
  }

  create() {
    setupStaticCamera(this);
    ensurePartyTextures(this);
    audio.stopMusic();
    this.drawRoom();
    this.drawLanes();
    this.drawHud();
    this.rivals = RIVALS.map((r) => ({ ...r, target: this.maxScore * Phaser.Math.FloatBetween(...r.skill) }));
    this.input.keyboard?.on('keydown', (ev) => {
      if (ev.repeat || this.phase !== 'dance') return;
      const lane = KEYS[ev.key];
      if (lane !== undefined) this.press(lane);
    });
    if (this.sys.game.device.input.touch) this.touchButtons();
    this.countText = this.add.text(GAME_WIDTH / 2, 200, '', tstyle(48, '#ffd800', { strokeThickness: 8 })).setOrigin(0.5).setDepth(40);
    this.add.text(GAME_WIDTH / 2, 260, 'Premi le FRECCE (o WASD) quando toccano la linea!', tstyle(11, '#ffffff'))
      .setOrigin(0.5).setDepth(40).setName('howto');
    this.phase = 'dance';
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  // ---------------------------------------------------------------- drawing

  drawRoom() {
    const g = this.add.graphics();
    g.fillStyle(0x1a0a2a).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    for (let x = 0; x < GAME_WIDTH; x += 40) g.fillStyle(x % 80 ? 0x22103a : 0x1e0c32).fillRect(x, 0, 40, 330);
    // Garland with baubles across the top
    g.fillStyle(0x2a7a3a).fillRect(0, 0, GAME_WIDTH, 8);
    for (let x = 10; x < GAME_WIDTH; x += 30) g.fillStyle([0xd02020, 0xffd800, 0x2a6ad8][(x / 30 | 0) % 3]).fillRect(x, 8, 6, 6);
    this.add.image(40, 330, TEX.XMAS_TREE).setOrigin(0.5, 1).setScale(1.6);
    this.add.text(PLAYER_X - 60, 26, 'GARA DI BALLO DI NATALE', tstyle(14, '#ff5ab4', { strokeThickness: 5 })).setOrigin(0.5);
    this.floor = this.add.graphics();
    this.paintFloor(-1);
    this.beams = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    this.add.line(0, 0, PLAYER_X - 60, 14, PLAYER_X - 60, 46, 0x888888).setOrigin(0);
    this.ball = this.add.image(PLAYER_X - 60, 62, 'mirror_ball').setScale(1.4);
    // Colleagues dancing on the back row
    this.crowd = COLLEAGUES.map(([a, b], i) => {
      const x = 120 + i * 90 + (i > 2 ? 40 : 0);
      const c = this.add.image(x, 336, a).setOrigin(0.5, 1).setScale(2);
      c.frames2 = [a, b];
      if (i === 4) c.setTint(0xffc0e0);
      return c;
    });
    const c = GameState.character || 'man';
    this.char = c;
    this.player = this.add.image(PLAYER_X, PLAYER_Y, playerTex(c, 'idle')).setOrigin(0.5, 1).setScale(3).setDepth(5);
    this.add.text(PLAYER_X, PLAYER_Y - 112, 'TU', tstyle(10, '#ffd800')).setOrigin(0.5).setDepth(5);
  }

  paintFloor(beat) {
    const g = this.floor.clear();
    const cols = [0xff5ab4, 0x5ab4ff, 0x3cf0a0, 0xffd23f, 0xb45aff];
    for (let r = 0; r < 3; r++) for (let x = 0; x < 520; x += 52) {
      const i = x / 52 + r * 10;
      const lit = beat >= 0 && (i * 7 + beat * 3) % 4 === 0;
      g.fillStyle(lit ? cols[(i + beat) % 5] : ((i + r) % 2 ? 0x2a1a3a : 0x34224a)).fillRect(x, 330 + r * 40, 51, 39);
    }
  }

  drawLanes() {
    this.add.rectangle(650, GAME_HEIGHT / 2 + 10, 250, GAME_HEIGHT - 20, 0x000000, 0.55).setStrokeStyle(2, 0xff5ab4);
    this.add.rectangle(650, HIT_Y, 244, 2, 0xffffff, 0.35);
    this.targets = LANES.map((l) => this.add.image(l.x, HIT_Y, 'dance_target').setAngle(l.angle).setScale(1.5).setTint(l.color).setAlpha(0.7));
    this.judgeText = this.add.text(650, 300, '', tstyle(18, '#ffffff', { strokeThickness: 6 })).setOrigin(0.5).setDepth(30);
  }

  drawHud() {
    this.add.rectangle(100, 98, 192, 118, 0x000000, 0.6).setStrokeStyle(2, 0xffd800);
    this.add.text(100, 47, 'CLASSIFICA', tstyle(9, '#ffd800')).setOrigin(0.5);
    this.boardText = this.add.text(10, 58, '', tstyle(8, '#ffffff', { strokeThickness: 2, lineSpacing: 3 }));
    this.scoreText = this.add.text(650, 18, '', tstyle(12, '#ffffff')).setOrigin(0.5).setDepth(30);
    this.comboText = this.add.text(650, 36, '', tstyle(10, '#3cf0a0')).setOrigin(0.5).setDepth(30);
    this.timeText = this.add.text(PLAYER_X - 60, 100, '', tstyle(10, '#9be7ff')).setOrigin(0.5);
  }

  touchButtons() {
    LANES.forEach((l, i) => {
      const b = this.add.image(44 + i * 62, 408, 'dance_arrow').setAngle(l.angle).setScale(1.8).setTint(l.color).setAlpha(0.8).setDepth(35)
        .setInteractive();
      b.on('pointerdown', () => { if (this.phase === 'dance') this.press(i); });
    });
  }

  // ---------------------------------------------------------------- play

  get multiplier() { return Math.min(4, 1 + Math.floor(this.combo / 10)); }

  press(lane) {
    const t = this.songT;
    const l = LANES[lane];
    this.targets[lane].setScale(1.8);
    this.tweens.add({ targets: this.targets[lane], scale: 1.5, duration: 120 });
    if (t < -0.2) return;
    let best = null;
    this.arrows.forEach((a) => {
      if (!a.done && a.lane === lane && Math.abs(a.t - t) <= GOOD_S && (!best || Math.abs(a.t - t) < Math.abs(best.t - t))) best = a;
    });
    if (!best) { this.stats.stray++; this.judge('miss', l); return; }
    best.done = true;
    best.sprite?.destroy();
    this.judge(Math.abs(best.t - t) <= PERFECT_S ? 'perfect' : 'good', l);
  }

  judge(kind, lane) {
    if (kind === 'miss') {
      this.combo = 0;
      audio.sfx('miss');
      this.stumble();
    } else {
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.stats[kind]++;
      this.score += (kind === 'perfect' ? 100 : 50) * this.multiplier;
      audio.sfx(kind === 'perfect' ? 'perfect' : 'select');
      this.move(lane.dir);
    }
    const [txt, col] = { perfect: ['PERFETTO!', '#ffd800'], good: ['BENE', '#3cf0a0'], miss: ['SBAGLIATO', '#ff6060'] }[kind];
    this.judgeText.setText(txt).setColor(col).setScale(1.3).setAlpha(1);
    this.tweens.killTweensOf(this.judgeText);
    this.tweens.add({ targets: this.judgeText, scale: 1, duration: 120 });
    this.tweens.add({ targets: this.judgeText, alpha: 0, delay: 350, duration: 250 });
  }

  // The player's move matches the arrow; a miss makes them stumble.
  move(dir) {
    const p = this.player;
    this.tweens.killTweensOf(p);
    p.setPosition(PLAYER_X, PLAYER_Y).setAngle(0);
    if (dir === 'left' || dir === 'right') {
      p.setTexture(playerTex(this.char, 'walk1')).setFlipX(dir === 'left');
      this.tweens.add({ targets: p, x: PLAYER_X + (dir === 'left' ? -14 : 14), duration: 90, yoyo: true });
    } else if (dir === 'up') {
      p.setTexture(playerTex(this.char, 'jump'));
      this.tweens.add({ targets: p, y: PLAYER_Y - 24, duration: 110, yoyo: true });
    } else p.setTexture(playerTex(this.char, 'crouch'));
    this.poseUntil = this.time.now + 260;
  }

  stumble() {
    const p = this.player;
    this.tweens.killTweensOf(p);
    p.setPosition(PLAYER_X, PLAYER_Y).setTexture(playerTex(this.char, 'hurt'));
    this.tweens.add({ targets: p, angle: { from: -12, to: 12 }, duration: 70, yoyo: true, repeat: 1, onComplete: () => p.setAngle(0) });
    this.poseUntil = this.time.now + 320;
  }

  onBeat(i, time) {
    const beatLen = 60 / bpmAt(this.beats[i]);
    audio.sfx('kick');
    this.time.delayedCall(beatLen * 500, () => audio.sfx('hat'));
    const slot = SLOTS[i % SLOTS.length];
    if (slot) audio.note(slot[0], slot[1] * beatLen * 0.85, 'square', 0.35);
    const root = BASS[Math.floor(i / 4) % BASS.length];
    audio.note(`${root}${i % 2 ? 3 : 2}`, beatLen * 0.8, 'triangle', 0.5);
    this.paintFloor(i);
    this.crowd.forEach((c, k) => {
      c.setTexture(c.frames2[(i + k) % 2]);
      this.tweens.add({ targets: c, y: 330, duration: beatLen * 400, yoyo: true });
    });
    this.tweens.add({ targets: this.ball, scale: 1.55, duration: 80, yoyo: true });
    if (time > (this.poseUntil || 0)) this.player.setFlipX(i % 2 === 1);
  }

  update(time, delta) {
    this.ball.angle += delta * 0.05;
    const g = this.beams.clear();
    const bx = this.ball.x;
    const by = this.ball.y;
    [0xff5ab4, 0x3cf0a0, 0x5ab4ff, 0xffd23f].forEach((c, i) => {
      const a = time / 900 * (i % 2 ? 1 : -1) + i * 1.6;
      const ax = Math.sin(a) * 0.8;
      g.fillStyle(c, 0.12).fillTriangle(bx, by, bx + Math.sin(ax - 0.12) * 420, by + Math.cos(ax - 0.12) * 420,
        bx + Math.sin(ax + 0.12) * 420, by + Math.cos(ax + 0.12) * 420);
    });
    if (this.phase !== 'dance') return;

    this.songT += delta / 1000;
    const t = this.songT;
    if (t < 0) this.countText.setText(String(Math.ceil(-t)));
    else if (t < 0.6) this.countText.setText('BALLA!');
    else if (this.countText.text) { this.countText.setText(''); this.children.getByName('howto')?.destroy(); }

    while (this.nextBeat < this.beats.length && t >= this.beats[this.nextBeat]) this.onBeat(this.nextBeat++, time);

    // Arrows: spawn FALL_S before their time, slide down, missed when past the window.
    this.arrows.forEach((a) => {
      if (a.done) return;
      const left = a.t - t;
      if (left > FALL_S) return;
      const l = LANES[a.lane];
      if (!a.sprite) a.sprite = this.add.image(l.x, SPAWN_Y, 'dance_arrow').setAngle(l.angle).setScale(1.5).setTint(l.color).setDepth(20);
      a.sprite.y = HIT_Y - (left / FALL_S) * (HIT_Y - SPAWN_Y);
      if (left < -GOOD_S) {
        a.done = true;
        this.stats.miss++;
        this.tweens.add({ targets: a.sprite, alpha: 0, y: a.sprite.y + 30, duration: 200, onComplete: (tw, [s]) => s.destroy() });
        this.judge('miss', l);
      }
    });

    if (time > (this.poseUntil || 0) && this.player.texture.key !== playerTex(this.char, 'idle')) {
      this.player.setTexture(playerTex(this.char, 'idle')).setAngle(0);
    }
    this.refreshHud(t);
    if (t > SONG_S + 0.8) this.endSong();
  }

  precision() {
    const s = this.stats;
    const total = this.arrows.length + s.stray;
    return total ? (s.perfect + s.good * 0.6) / total : 0;
  }

  refreshHud(t) {
    const prog = Phaser.Math.Clamp(t / SONG_S, 0, 1);
    const board = [{ name: 'TU', score: this.score, me: true },
      ...this.rivals.map((r) => ({ name: r.name, score: Math.round(r.target * prog / 10) * 10 }))]
      .sort((a, b) => b.score - a.score);
    this.boardText.setText(board.map((b, i) => `${i + 1}. ${b.me ? '> TU <' : b.name}`.padEnd(24) + String(b.score).padStart(6)).join('\n'));
    this.scoreText.setText(`PUNTI ${this.score}`);
    this.comboText.setText(this.combo >= 2 ? `COMBO ${this.combo}  x${this.multiplier}` : `PRECISIONE ${Math.round(this.precision() * 100)}%`);
    this.timeText.setText(`BRANO ${Math.max(0, Math.ceil(SONG_S - Math.max(0, t)))}s`);
  }

  // ---------------------------------------------------------------- outcome

  endSong() {
    this.phase = 'skit';
    this.arrows.forEach((a) => a.sprite?.destroy());
    const prec = this.precision();
    const good = prec >= GOOD_PRECISION;
    this.result = Phaser.Utils.Array.GetRandom(OUTCOMES[good ? 'good' : 'bad']);
    this.prec = prec;
    audio.sfx(good ? 'cheer' : 'gameover');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45).setDepth(45);
    // Spotlight on the dance floor: the gag happens right where the player is dancing.
    this.add.ellipse(PLAYER_X, PLAYER_Y - 6, 380, 60, 0xfff4b0, 0.18).setDepth(46);
    this.tweens.killTweensOf(this.player);
    this.player.setPosition(PLAYER_X, PLAYER_Y).setAngle(0).setFlipX(false).setTexture(playerTex(this.char, 'idle')).setDepth(55);
    this.skitLayer = this.add.container(0, 0).setDepth(56);
    this.skit(this.result.id);
    this.time.delayedCall(2600, () => this.showResult());
  }

  // Short gag for each outcome, played on the dance floor around the player (the result panel goes above).
  skit(id) {
    const L = this.skitLayer;
    const p = this.player;
    const px = PLAYER_X;
    const fy = PLAYER_Y;
    const head = fy - p.displayHeight;
    const add = (o) => { L.add(o); return o; };
    const hop = () => this.tweens.add({ targets: p, y: fy - 26, duration: 160, yoyo: true, repeat: 2, ease: 'Quad.Out' });
    // The Mega-Direttore walks onto the floor and stops next to the player.
    const ceoIn = (x, dur = 600) => {
      const ceo = add(this.add.image(560, fy, 'ceo_standing').setOrigin(0.5, 1).setScale(1.4));
      this.tweens.add({ targets: ceo, x, duration: dur, ease: 'Quad.Out' });
      return ceo;
    };
    if (id === 'raise') {
      p.setTexture(playerTex(this.char, 'jump'));
      const ceo = ceoIn(px + 90);
      const slip = add(this.add.container(px + 15, head - 45).setScale(0));
      slip.add(this.add.rectangle(0, 0, 110, 70, 0xfaf6e8).setStrokeStyle(3, 0x888888));
      slip.add(this.add.text(0, -24, 'BUSTA PAGA', tstyle(8, '#333333', { strokeThickness: 0 })).setOrigin(0.5));
      for (let i = 0; i < 2; i++) slip.add(this.add.rectangle(-6, -8 + i * 9, 76, 3, 0xbbbbbb));
      slip.add(this.add.text(0, 20, '+12 € LORDI', tstyle(12, '#2a9a3a', { strokeThickness: 3 })).setOrigin(0.5).setAngle(-6));
      this.tweens.add({ targets: slip, scale: 1, delay: 650, duration: 300, ease: 'Back.Out', onStart: () => audio.sfx('coin') });
      this.time.delayedCall(700, hop);
      const bravo = add(this.add.text(ceo.x, fy - 88 * 1.4 - 14, 'BRAVO!', tstyle(10, '#ffd800')).setOrigin(0.5).setAlpha(0));
      this.tweens.add({ targets: bravo, alpha: 1, x: px + 95, delay: 900, duration: 200 });
    } else if (id === 'trip') {
      const s = add(this.add.container(px + 85, -80));
      s.add(this.add.rectangle(0, 0, 90, 60, 0x8a5a2a).setStrokeStyle(4, 0x4a2a12));
      s.add(this.add.rectangle(0, -37, 30, 10, 0x000000, 0).setStrokeStyle(4, 0x4a2a12));
      s.add(this.add.rectangle(0, 4, 80, 24, 0xfff4dc));
      s.add(this.add.text(0, 4, 'COCCIA\nDI MORTO', tstyle(8, '#d02020', { strokeThickness: 0, align: 'center' })).setOrigin(0.5));
      this.tweens.add({ targets: s, y: fy - 32, duration: 700, ease: 'Bounce.Out', onComplete: () => {
        p.setTexture(playerTex(this.char, 'jump'));
        hop();
      } });
    } else if (id === 'cotechino') {
      p.setTexture(playerTex(this.char, 'jump'));
      hop();
      for (let i = 0; i < 9; i++) {
        const row = Math.floor(i / 2);
        const side = i % 2 ? 1 : -1;
        const x = px + side * 105 + (row % 2 ? 6 : -6);
        const c = add(this.add.image(x, -30, 'cotechino').setScale(2));
        this.tweens.add({ targets: c, y: fy - 16 - row * 30, delay: i * 140, duration: 400, ease: 'Bounce.Out' });
      }
    } else if (id === 'donkey') {
      // The player faints right on the floor: rotate around the feet and lie down.
      p.setTexture(playerTex(this.char, 'hurt'));
      this.tweens.add({ targets: p, angle: 90, duration: 500, ease: 'Bounce.Out', onComplete: () => {
        audio.sfx('hurt');
        this.cameras.main.shake(120, 0.006);
      } });
      const sx = px + p.displayHeight * 0.75;
      const sy = fy - p.displayWidth * 0.5 - 18;
      for (let i = 0; i < 3; i++) {
        const st = add(this.add.text(sx, sy, '*', tstyle(20, '#ffd800')).setOrigin(0.5).setAlpha(0));
        this.tweens.add({ targets: st, alpha: 1, delay: 500, duration: 100 });
        this.tweens.addCounter({ from: 0, to: 360, duration: 1200, repeat: -1,
          onUpdate: (tw) => { const a = Phaser.Math.DegToRad(tw.getValue() + i * 120); st.setPosition(sx + Math.cos(a) * 30, sy + Math.sin(a) * 9); } });
      }
      const z = add(this.add.text(px + 40, fy - 70, 'ZZZ...', tstyle(14, '#ffffff')).setOrigin(0.5).setAlpha(0));
      this.tweens.add({ targets: z, alpha: 1, y: fy - 90, delay: 900, duration: 600 });
    } else if (id === 'wine') {
      // The Mega-Direttore is on the floor with a glass; the player dances clumsily into him and spills the wine.
      const ceoX = px + 95;
      const ceo = ceoIn(ceoX, 500);
      const glass = add(this.add.text(560 - 30, fy - 70, 'Y', tstyle(20, '#ff4060')).setOrigin(0.5));
      this.tweens.add({ targets: glass, x: ceoX - 30, duration: 500, ease: 'Quad.Out' });
      p.setTexture(playerTex(this.char, 'walk1'));
      this.tweens.add({ targets: p, x: px + 40, angle: 15, delay: 650, duration: 220, ease: 'Quad.In', onComplete: () => {
        audio.sfx('hurt');
        this.cameras.main.shake(120, 0.008);
        p.setTexture(playerTex(this.char, 'hurt'));
        this.tweens.add({ targets: p, x: px, angle: 0, duration: 250 });
        this.tweens.add({ targets: ceo, x: ceoX + 6, duration: 50, yoyo: true, repeat: 5 });
        // Glass flips onto the suit: stains on the jacket.
        this.tweens.add({ targets: glass, x: ceoX, y: fy - 80, angle: 200, duration: 220, onComplete: () => {
          glass.destroy();
          const suitY = fy - 88 * 1.4 + 52 * 1.4;
          for (let i = 0; i < 7; i++) {
            add(this.add.circle(ceoX + Phaser.Math.Between(-18, 18), suitY + Phaser.Math.Between(-16, 16), Phaser.Math.Between(4, 10), 0x9a0a2a));
          }
          add(this.add.text(ceoX, fy - 88 * 1.4 - 16, 'NOOO!', tstyle(14, '#ffffff'))).setOrigin(0.5);
        } });
      } });
    } else {
      // Singing Jingle Bells on the floor, out of tune, in front of the board.
      const mx = px + 55;
      add(this.add.rectangle(mx, fy - 32, 5, 64, 0x333333));
      add(this.add.rectangle(mx, fy - 2, 26, 4, 0x333333));
      add(this.add.circle(mx, head + 40, 8, 0x666666));
      const notes = ['E5', 'D#5', 'F5', 'C#5', 'E5', 'A#4', 'G5', 'C5'];
      notes.forEach((n, i) => this.time.delayedCall(i * 260, () => {
        audio.note(n, 0.22, 'square', 0.4);
        const m = add(this.add.image(mx, head + 30, 'music_note').setScale(2).setTint(0xff6060).setAngle(Phaser.Math.Between(-40, 40)));
        this.tweens.add({ targets: m, x: mx + 20 + i * 14, y: head - 20 + Phaser.Math.Between(-20, 20), angle: m.angle * 2, alpha: 0.3, duration: 900 });
      }));
      add(this.add.text(px - 130, fy - 50, 'IL CONSIGLIO\nNON APPLAUDE', tstyle(9, '#cccccc', { align: 'center' })).setOrigin(0.5));
    }
  }

  showResult() {
    const o = this.result;
    this.phase = 'result';
    const lines = [...o.text, '', ...effectLines(o)];
    if (o.euro) lines.push(`BONUS +${o.euro} €`);
    if (o.time) lines.push(`TEMPO ${o.time}s`);
    lines.push(`Precisione ${Math.round(this.prec * 100)}%  -  combo max ${this.maxCombo}`);
    resultPanel(this, { title: o.title, color: o.color, lines, y: 140, onClose: () => this.finish() });
  }

  finish() {
    if (this.leaving) return;
    this.leaving = true;
    const o = this.result;
    if (o.hp) GameState.addHp(o.hp);
    if (o.stress) GameState.addStress(o.stress);
    if (o.euro) GameState.addBonus('euro', o.euro);
    const gs = this.scene.get('GameScene');
    if (gs && o.time) gs.timeLeft = Math.max(1, gs.timeLeft + o.time);
    audio.music('level');
    this.scene.resume('GameScene');
    gs?.ui?.message?.(o.hp ? 'SI TORNA AL LAVORO... CON LO SPIRITO GIUSTO!' : 'SI TORNA AL LAVORO... CHE FIGURACCIA!', o.hp ? '#9dffb0' : '#ff9090', 2200);
    this.scene.stop();
  }
}
