import * as lib from './index';
import { newGame, draw } from './index';

describe('lib index and utilities', () => {
  test('index re-exports expected symbols', () => {
    expect(lib.makeDeck).toBeDefined();
    expect(lib.seedFromString).toBeDefined();
    expect(lib.newGame).toBeDefined();
  });

  test('draw on empty deck returns same state and no drawn card', () => {
    const state = { seed: 's', deck: [], burnt: [], bets: [], players: [] } as any;
    const res = draw(state);
    expect(res.drawn).toBeUndefined();
    expect(res.state).toEqual(state);
  });

  test('newGame clones players array so external mutation does not affect internal state', () => {
    const players = [{ id: 'p1', name: 'Alice', bankroll: 100 }];
    const g = newGame('clone-seed', players);
    // mutate returned players
    g.players[0].bankroll = 0;
    // original should be unchanged
    expect(players[0].bankroll).toBe(100);
  });
});
