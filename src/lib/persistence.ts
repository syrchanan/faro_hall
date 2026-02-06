import { GameState, serializeGameState, deserializeGameState } from './game';

const STORAGE_KEY = 'faro:autosave';

function keyFor(seed?: string) {
  return seed ? `${STORAGE_KEY}:${seed}` : STORAGE_KEY;
}

export function saveToLocal(state: GameState) {
  try {
    const s = serializeGameState(state);
    const key = keyFor(state?.seed || undefined);
    localStorage.setItem(key, s);
    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') console.error('Failed to save game state', err);
    return false;
  }
}

export function loadFromLocal(seed?: string): GameState | null {
  try {
    const key = keyFor(seed);
    const s = localStorage.getItem(key);
    if (!s) return null;
    return deserializeGameState(s);
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') console.warn('Failed to load saved game state', err);
    return null;
  }
}

export function clearLocal(seed?: string) {
  try {
    const key = keyFor(seed);
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') console.warn('Failed to clear saved game state', err);
    return false;
  }
}
