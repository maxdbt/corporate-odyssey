// Final choice survey: every ending choice (CEO / Caraibi) is sent, anonymous, to a Google Sheet through a
// Google Apps Script web app (see docs/SURVEY.md). Each choice is also kept in localStorage.
import { GameState } from '../state/GameState.js';

// Web app URL of the Apps Script ("https://script.google.com/macros/s/.../exec"). Empty = local log only.
export const SURVEY_URL = '';

const LOCAL_KEY = 'co_final_choices';
const PLAYER_KEY = 'co_player_id';

// Random anonymous id, so repeated plays from the same browser can be told apart (no personal data).
function playerId() {
  try {
    let id = localStorage.getItem(PLAYER_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2, 10);
      localStorage.setItem(PLAYER_KEY, id);
    }
    return id;
  } catch {
    return 'n/a';
  }
}

// choice: 'ceo' | 'caraibi'. Never throws: the ending must go on even offline.
export function logFinalChoice(choice) {
  const row = {
    ts: new Date().toISOString(),
    choice,
    character: GameState.character,
    version: __APP_VERSION__,
    tripLeg: GameState.tripLeg || '',
    startedFrom: GameState.runFrom || '',
    minutes: GameState.runStartedAt ? Math.round((Date.now() - GameState.runStartedAt) / 60000) : '',
    player: playerId()
  };
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    list.push(row);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(-50)));
  } catch { /* storage disabled */ }
  if (!SURVEY_URL) return;
  // text/plain + no-cors: a "simple" request, so no CORS preflight (Apps Script does not answer OPTIONS).
  fetch(SURVEY_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(row) })
    .catch(() => {});
}
