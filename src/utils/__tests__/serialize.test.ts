import { exportGameState, importGameState } from "../serialize";

test('export/import roundtrip without private fields', () => {
  const state = { id: '1', seed: 's', deckOrder: ['a','b'], players: { p: 1 } };
  const exported = exportGameState(state, false);
  expect(exported).not.toContain('deckOrder');
  const parsed = importGameState(exported);
  expect(parsed.seed).toBe('s');
  expect((parsed as any).deckOrder).toBeUndefined();
});

test('export/import full roundtrip', () => {
  const state = { id: '1', seed: 's', deckOrder: ['a','b'], players: { p: 1 } };
  const exported = exportGameState(state, true);
  const parsed = importGameState(exported);
  expect(parsed.deckOrder).toEqual(['a','b']);
});
