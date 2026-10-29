// Mondo 4 "La Trasferta": stage routing and trip state helpers.
// Stages: Sede (destination choice) -> Valigia -> Mezzo -> Aeroporto|Stazione -> Volo|Treno -> random ground leg (the chosen one) -> Cliente -> Mondo 5.
import Phaser from 'phaser';
import { GameState } from '../state/GameState.js';
import { LEVELS } from '../levels/index.js';
import { TRANSPORT, DEFAULT_SUITCASE, BUDGET_TO_EURO, EXTRA_SLOT_PRICE } from '../data/trip.js';

const indexOf = (id) => LEVELS.findIndex((l) => l.id === id);

// Ground legs, one per client site chosen at the start (DestinationScene); random if none was chosen (debug).
export const GROUND_LEGS = ['4-7', '4-8', '4-9'];
export const LEG_LEVEL = { desert: '4-7', glacier: '4-8', sea: '4-9' };
// Every ground leg (including the ones still to redesign, selectable from the menu).
export const isGroundLeg = (id) => ['4-7', '4-8', '4-9'].includes(id);

// Starts level/stage `index` from any scene: static stages have their own scene, the rest run in GameScene.
export function startLevel(scene, index, data = {}) {
  const lvl = LEVELS[index];
  if (!lvl) { scene.scene.start('VictoryScene'); return; }
  scene.scene.start(lvl.scene || 'GameScene', { levelIndex: index, ...data });
}

// Index of the level that follows `index` (trip stages branch on the chosen transport).
export function nextIndex(index) {
  const id = LEVELS[index]?.id;
  const plane = GameState.trip?.transport === 'plane';
  switch (id) {
    case '4-1': return indexOf('4-2');
    case '4-2': return indexOf(plane ? '4-3' : '4-4');
    case '4-3': return indexOf('4-5');
    case '4-4': return indexOf('4-6');
    case '4-5':
    case '4-6': return indexOf(LEG_LEVEL[GameState.trip?.leg] || Phaser.Utils.Array.GetRandom(GROUND_LEGS));
    case '4-7':
    case '4-8':
    case '4-9': return indexOf('4-10');
    case '4-10': return indexOf('5-1');
    default: return index + 1;
  }
}

export function goNext(scene, index) {
  const next = nextIndex(index);
  if (next < 0 || next >= LEVELS.length) scene.scene.start('VictoryScene');
  else startLevel(scene, next);
}

export const isTripStage = (index) => !!LEVELS[index]?.trip;

// Makes sure a trip exists when a stage starts (debug: stages can be started on their own).
export function ensureTrip(index) {
  const id = LEVELS[index]?.id;
  if (id === '4-1') {
    GameState.trip = { items: [], extraSlots: 0, transport: null, budget: 0, maxBudget: 0, stageIndex: -1, stageBudget: 0 };
    return GameState.trip;
  }
  if (!GameState.trip) {
    const transport = ['4-3', '4-5'].includes(id) ? 'plane' : 'train';
    const budget = TRANSPORT[transport].budget;
    GameState.trip = { items: [...DEFAULT_SUITCASE], transport, budget, maxBudget: budget, stageIndex: -1, stageBudget: budget };
  }
  return GameState.trip;
}

// Fresh start of a stage: a restart of the same stage restores the budget it began with.
export function beginStage(index) {
  const trip = ensureTrip(index);
  if (trip.stageIndex === index) trip.budget = trip.stageBudget;
  else { trip.stageIndex = index; trip.stageBudget = trip.budget; }
  return trip;
}

// Euro already spent on extra suitcase places (taken from the trip fund together with the ticket).
export const extraSlotsCost = () => (GameState.trip?.extraSlots || 0) * EXTRA_SLOT_PRICE;

export function setTransport(kind) {
  const t = GameState.trip;
  t.transport = kind;
  t.budget = TRANSPORT[kind].budget - extraSlotsCost();
  t.maxBudget = t.budget;
}

// End of the trip: leftover budget becomes euro bonus. Returns the euro gained.
export function finishTrip() {
  const left = GameState.budget();
  const euro = Math.round(left * BUDGET_TO_EURO);
  if (euro > 0) GameState.addBonus('euro', euro);
  GameState.tripLeg = GameState.trip?.leg || null; // the client comes to the final celebration
  GameState.trip = null;
  return euro;
}

// No spare underwear: every stage starts with extra stress. Returns true if applied.
export function underwearPenalty() {
  if (!GameState.trip || GameState.hasItem('underwear')) return false;
  GameState.addStress(10);
  return true;
}
