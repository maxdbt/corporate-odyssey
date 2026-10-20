// Global run state shared by all scenes. Plain singleton: import { GameState } and mutate via helpers.

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const GameState = {
  character: 'man',
  levelIndex: 0,

  hp: 100,            // Salute Mentale 0..100
  stress: 0,          // 0..100 (>= 100 => panic, inverted controls)
  euro: 0,            // Bonus Economici collected (display)
  tickets: 0,         // Buoni Pasto collected (display)
  bonusProgress: 0,   // every 100 points of euro+tickets => +25 HP
  vacationDays: 0,    // Giorni di Ferie
  checkpoint: null,   // { levelIndex, x, y } set when a vacation day is collected

  device: null,       // null | 'laptop' | 'smartphone'  (enables shooting)
  weapon: 'email',    // one of WEAPONS

  // Modifiers that apply to the NEXT level (set by quizzes), consumed by beginLevel().
  pendingNext: { enemySpeedMult: 1 },
  // Modifiers for the current level.
  levelMods: { enemySpeedMult: 1, colleaguesHostile: false },

  newGame(character) {
    this.character = character;
    this.levelIndex = 0;
    this.hp = 100;
    this.stress = 0;
    this.euro = 0;
    this.tickets = 0;
    this.bonusProgress = 0;
    this.vacationDays = 0;
    this.checkpoint = null;
    this.device = null;
    this.weapon = 'email';
    this.pendingNext = { enemySpeedMult: 1 };
    this.levelMods = { enemySpeedMult: 1, colleaguesHostile: false };
  },

  // Call when a level starts fresh (not when respawning from a checkpoint).
  beginLevel(index) {
    if (this.checkpoint && this.checkpoint.levelIndex !== index) this.checkpoint = null;
    this.levelIndex = index;
    this.levelMods = { enemySpeedMult: this.pendingNext.enemySpeedMult, colleaguesHostile: false };
    this.pendingNext = { enemySpeedMult: 1 };
  },

  // Restore vitals after a Game Over (restart or checkpoint).
  revive() {
    this.hp = 100;
    this.stress = 0;
  },

  addHp(n) { this.hp = clamp(this.hp + n, 0, 100); },
  addStress(n) { this.stress = clamp(this.stress + n, 0, 100); },
  isPanicking() { return this.stress >= 100; },

  // kind: 'euro' | 'ticket'. Returns true if the 100-threshold healed the player.
  addBonus(kind, amount) {
    if (kind === 'ticket') this.tickets = Math.max(0, this.tickets + amount);
    else this.euro = Math.max(0, this.euro + amount);
    if (amount <= 0) return false;
    this.bonusProgress += amount;
    let healed = false;
    while (this.bonusProgress >= 100) {
      this.bonusProgress -= 100;
      this.addHp(25);
      healed = true;
    }
    return healed;
  },

  hasCheckpoint() {
    return !!this.checkpoint && this.checkpoint.levelIndex === this.levelIndex;
  }
};
