import { saveToLocal, loadFromLocal, clearLocal } from './persistence';
import * as game from './game';

describe('persistence', () => {
  const STORAGE_KEY = 'faro:autosave';

  // Example state must conform to GameStateSchema (deck entries are Card objects)
  const exampleState = {
    seed: 'test-seed',
    deck: [
      { rank: 1, suit: 'hearts' },
      { rank: 2, suit: 'hearts' },
      { rank: 3, suit: 'hearts' }
    ],
    burnt: [],
    bets: [],
    players: [{ id: 'p1', name: 'A', bankroll: 10 }]
  } as any;

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('saveToLocal stores serialized state under seed-specific key and returns true', () => {
    const res = saveToLocal(exampleState);
    expect(res).toBe(true);
    const raw = localStorage.getItem(`${STORAGE_KEY}:${exampleState.seed}`);
    // persistence uses serializeGameState which by default JSON.stringify the object
    expect(raw).toBe(JSON.stringify(exampleState));
  });

  test('saveToLocal returns false when serialization throws', () => {
    jest.spyOn(game, 'serializeGameState').mockImplementation(() => { throw new Error('boom'); });
    const res = saveToLocal(exampleState);
    expect(res).toBe(false);
  });

  test('loadFromLocal returns GameState when present', () => {
    localStorage.setItem(`${STORAGE_KEY}:${exampleState.seed}`, JSON.stringify(exampleState));
    const loaded = loadFromLocal(exampleState.seed);
    expect(loaded).toEqual(exampleState);
  });

  test('loadFromLocal returns null when nothing saved', () => {
    const loaded = loadFromLocal('no-such-seed');
    expect(loaded).toBeNull();
  });

  test('loadFromLocal returns null when stored data is invalid JSON or invalid state', () => {
    // store invalid JSON
    localStorage.setItem(`${STORAGE_KEY}:bad`, 'not-json');
    const loaded = loadFromLocal('bad');
    expect(loaded).toBeNull();

    // store JSON that's structurally invalid for GameState
    localStorage.setItem(`${STORAGE_KEY}:bad2`, JSON.stringify({ foo: 'bar' }));
    const loaded2 = loadFromLocal('bad2');
    expect(loaded2).toBeNull();
  });

  test('clearLocal removes key and returns true', () => {
    localStorage.setItem(`${STORAGE_KEY}:abc`, 'x');
    const res = clearLocal('abc');
    expect(res).toBe(true);
    expect(localStorage.getItem(`${STORAGE_KEY}:abc`)).toBeNull();
  });

  test('clearLocal returns false when removeItem throws', () => {
    // Spy on Storage.prototype so jest can mock removeItem in this environment
    jest.spyOn(Storage.prototype, 'removeItem' as any).mockImplementation(() => { throw new Error('rm fail'); });
    const res = clearLocal('abc');
    expect(res).toBe(false);
  });
});
