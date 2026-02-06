/**
 * Jest smoke tests for deterministic replay seeds.
 * Uses the src/lib functional API.
 */
import { expect, test, describe } from '@jest/globals';
import { newGame, resolveTurn, placeBet, GameState, Rank } from '../lib';

const SEEDS = [
  'seed-0001-simple',
  'seed-0002-edge-aces',
  'seed-0003-longgame',
  'seed-0004-reveal-fail',
  'seed-0005-randomness-check',
];

const DEFAULT_PLAYERS = [
  { id: 'p1', name: 'Alice', bankroll: 1000 },
  { id: 'p2', name: 'Bob', bankroll: 1000 },
];

describe('Deterministic replay smoke tests', () => {
  for (const seed of SEEDS) {
    test('replay deterministic for ' + seed, () => {
      // Run a game with fixed actions
      let state1 = newGame(seed, DEFAULT_PLAYERS);
      const turns1: any[] = [];
      for (let i = 0; i < 5; i++) {
        const result = resolveTurn(state1);
        turns1.push({ winner: result.winnerCard, loser: result.loserCard });
        state1 = result.state;
      }

      // Replay with same seed — should produce identical results
      let state2 = newGame(seed, DEFAULT_PLAYERS);
      const turns2: any[] = [];
      for (let i = 0; i < 5; i++) {
        const result = resolveTurn(state2);
        turns2.push({ winner: result.winnerCard, loser: result.loserCard });
        state2 = result.state;
      }

      expect(turns2).toEqual(turns1);
      expect(state2.deck.length).toEqual(state1.deck.length);
      expect(state2.burnt).toEqual(state1.burnt);
    });
  }
});
