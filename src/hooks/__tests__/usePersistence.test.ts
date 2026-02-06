import { saveToLocalStorage, loadFromLocalStorage } from "../usePersistence";

describe('usePersistence helpers', () => {
  const realLocalStorage = window.localStorage;
  beforeEach(() => {
    const store: Record<string,string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (k: string) => (k in store ? store[k] : null),
        setItem: (k: string, v: string) => { store[k] = v; },
        removeItem: (k: string) => { delete store[k]; }
      },
      writable: true
    });
  });
  afterEach(() => {
    Object.defineProperty(window, 'localStorage', { value: realLocalStorage, writable: true });
  });

  test('save and load', () => {
    const state = { id: 'x', seed: 's', deckOrder: ['a'] };
    saveToLocalStorage(state as any);
    const loaded = loadFromLocalStorage();
    expect(loaded).not.toBeNull();
    expect((loaded as any).id).toBe('x');
  });

  test('event emitted on save', () => {
    const handler = jest.fn();
    window.addEventListener('faro.gameState.changed', (e: any) => handler(e.detail));
    const state = { id: 'ev' };
    saveToLocalStorage(state as any);
    expect(handler).toHaveBeenCalledWith(state);
  });
});
