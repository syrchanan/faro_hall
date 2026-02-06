// Serialization helpers for full game export/import

export type GameState = {
  id?: string;
  createdAt?: string;
  seed?: string;
  deckOrder?: string[];
  players?: Record<string, any>;
  [k: string]: any;
};

export function exportGameState(state: GameState, includePrivate = false): string {
  const copy = Object.assign({}, state);
  if (!includePrivate) {
    delete copy.deckOrder;
  }
  return JSON.stringify(copy);
}

export function importGameState(json: string): GameState {
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) throw new Error("Invalid game state");
    return parsed as GameState;
  } catch (e) {
    throw new Error("Failed to parse game state JSON: " + (e as Error).message);
  }
}
