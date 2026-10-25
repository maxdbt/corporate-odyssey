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

  // Mondo 4 trip: { items: [ids], transport: 'train'|'plane', budget, maxBudget, stageIndex, stageBudget } or null
  trip: null,

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
    this.trip = null;
    this.tripLeg = null;
    this.runStartedAt = Date.now(); // final choice survey: play time and starting level (set by the menu)
    this.runFrom = null;
    this.pendingNext = { enemySpeedMult: 1 };
    this.levelMods = { enemySpeedMult: 1, colleaguesHostile: false };
  },

  // ---- trip budget (Mondo 4)
  hasItem(id) { return !!this.trip && this.trip.items.includes(id); },
  budget() { return this.trip ? this.trip.budget : 0; },
  canAfford(n) { return !!this.trip && this.trip.budget >= n; },
  // Spends n if affordable; returns true on success.
  spend(n) {
    if (!this.canAfford(n)) return false;
    this.trip.budget -= n;
    return true;
  },
  // Adds (or removes, n < 0) budget without going below zero.
  addBudget(n) {
    if (!this.trip) return 0;
    const before = this.trip.budget;
    this.trip.budget = Math.max(0, before + n);
    this.trip.maxBudget = Math.max(this.trip.maxBudget, this.trip.budget);
    return this.trip.budget - before;
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
