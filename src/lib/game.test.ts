import { newGame, draw, placeBet, resolveTurn, serializeGameState, deserializeGameState, addPlayer, removePlayer, renamePlayer } from './game';
import { seedFromString, mulberry32 } from './rng';
import { makeDeck, shuffle } from './cards';

describe('game utilities', () => {
  const players = [{ id: 'p1', name: 'Alice', bankroll: 100 }];

  test('newGame is deterministic for a given seed and creates full deck and players', () => {
    const g1 = newGame('seed-xyz', players);
    const g2 = newGame('seed-xyz', players);
    expect(g1.deck).toEqual(g2.deck);
    // 51 cards in deck after soda card is removed
    expect(g1.deck.length).toBe(51);
    expect(g1.sodaCard).toBeDefined();
    // players preserved with startingBankroll added
    expect(g1.players[0].id).toBe('p1');
    expect(g1.players[0].name).toBe('Alice');
    expect(g1.players[0].bankroll).toBe(100);
    expect(g1.players[0].startingBankroll).toBe(100);
  });

  test('draw moves top card to burnt and reduces deck', () => {
    const g = newGame('another-seed', players);
    const originalDeck = g.deck.slice();
    const originalBurnt = g.burnt.length; // 1 from soda
    const res = draw(g);
    expect(res.drawn).toBeDefined();
    expect(res.state.deck.length).toBe(originalDeck.length - 1);
    expect(res.state.burnt.length).toBe(originalBurnt + 1);
    // burnt last should equal drawn
    expect(res.drawn).toEqual(res.state.burnt[res.state.burnt.length - 1]);
    // further draw continues to remove top
    const res2 = draw(res.state);
    expect(res2.state.deck.length).toBe(originalDeck.length - 2);
    expect(res2.state.burnt.length).toBe(originalBurnt + 2);
  });

  test('placeBet deducts bankroll and records bet', () => {
    const g = newGame('seed-bet', players);
    const after = placeBet(g, { playerId: 'p1', ranks: [5], amount: 10 });
    expect(after.players[0].bankroll).toBe(90);
    expect(after.bets.length).toBe(1);
    expect(after.bets[0].amount).toBe(10);
  });

  test('placeBet throws on unknown player or insufficient funds', () => {
    const g = newGame('seed-bet2', players);
    expect(() => placeBet(g, { playerId: 'unknown', ranks: [2], amount: 5 } as any)).toThrow();
    expect(() => placeBet(g, { playerId: 'p1', ranks: [2], amount: 1000 })).toThrow();
    expect(() => placeBet(g, { playerId: 'p1', ranks: [2], amount: 0 })).toThrow();
  });

  test('resolveTurn pays winners and clears bets (standard win)', () => {
    // Build a deterministic state where top two cards are loser then winner
    const state = {
      seed: 's1',
      deck: [ { rank: 2 as any, suit: 'hearts' }, { rank: 3 as any, suit: 'clubs' } ],
      burnt: [],
      bets: [],
      players: [{ id: 'p1', name: 'Alice', bankroll: 100 }]
    };
    // place a bet on the winner (rank 3)
    const afterBet = placeBet(state as any, { playerId: 'p1', ranks: [3], amount: 10 });
    // resolve turn
    const resolved = resolveTurn(afterBet);
    // paid: bankroll 100 -> 90 after bet -> +20 on win => 110
    expect(resolved.state.players.find(p => p.id === 'p1')!.bankroll).toBe(110);
    expect(resolved.state.bets.length).toBe(0);
    expect(resolved.winnerCard).toBeDefined();
    expect(resolved.loserCard).toBeDefined();
  });

  test('coppered bet inverts outcome', () => {
    const state = {
      seed: 's2',
      deck: [ { rank: 4 as any, suit: 'hearts' }, { rank: 9 as any, suit: 'clubs' } ],
      burnt: [],
      bets: [],
      players: [{ id: 'p1', name: 'Alice', bankroll: 100 }]
    };
    // place a coppered bet on the winner (rank 9) which should lose
    const afterBet = placeBet(state as any, { playerId: 'p1', ranks: [9], amount: 10, coppered: true });
    const resolved = resolveTurn(afterBet);
    // coppered inversion: should lose => bankroll stays at 90
    expect(resolved.state.players.find(p => p.id === 'p1')!.bankroll).toBe(90);

    // coppered on loser should win
    const state2 = {
      seed: 's3',
      deck: [ { rank: 7 as any, suit: 'hearts' }, { rank: 12 as any, suit: 'clubs' } ],
      burnt: [],
      bets: [],
      players: [{ id: 'p1', name: 'Alice', bankroll: 100 }]
    };
    const afterBet2 = placeBet(state2 as any, { playerId: 'p1', ranks: [7], amount: 10, coppered: true });
    const resolved2 = resolveTurn(afterBet2);
    // coppered on loser flips to win => bankroll 110
    expect(resolved2.state.players.find(p => p.id === 'p1')!.bankroll).toBe(110);
  });

  test('split when both cards match — house takes half', () => {
    const state = {
      seed: 's4',
      deck: [ { rank: 6 as any, suit: 'hearts' }, { rank: 6 as any, suit: 'spades' } ],
      burnt: [],
      bets: [],
      players: [{ id: 'p1', name: 'Alice', bankroll: 100 }]
    } as any;
    const afterBet = placeBet(state, { playerId: 'p1', ranks: [6], amount: 10 });
    const resolved = resolveTurn(afterBet);
    // split: house takes half. bankroll 100 -> 90 after bet -> +5 (half of 10) = 95
    expect(resolved.state.players.find(p => p.id === 'p1')!.bankroll).toBe(95);
  });

  test('resolveTurn with insufficient deck returns same state', () => {
    const state = {
      seed: 's5',
      deck: [ { rank: 1 as any, suit: 'hearts' } ],
      burnt: [],
      bets: [],
      players: [{ id: 'p1', name: 'Alice', bankroll: 100 }]
    };
    const res = resolveTurn(state as any);
    expect(res.state).toBe(state);
    expect(res.winnerCard).toBeUndefined();
  });

  test('serialize/deserialize roundtrip and validation', () => {
    const g = newGame('roundtrip', players);
    const s = serializeGameState(g);
    const parsed = deserializeGameState(s);
    expect(parsed.seed).toBe(g.seed);
    expect(Array.isArray(parsed.deck)).toBe(true);

    // malformed JSON
    expect(() => deserializeGameState('not-json')).toThrow();
    // missing fields
    const bad = JSON.stringify({ foo: 'bar' });
    expect(() => deserializeGameState(bad as any)).toThrow();
  });

  // Additional tests suggested by reviewer
  test('deserialize rejects malformed cards and ranks', () => {
    const badCard = JSON.stringify({
      seed: 'x',
      deck: [{ rank: 99, suit: 'hearts' }],
      burnt: [],
      bets: [],
      players: [{ id: 'p1', name: 'Alice', bankroll: 100 }]
    });
    expect(() => deserializeGameState(badCard as any)).toThrow();

    const badSuit = JSON.stringify({
      seed: 'x',
      deck: [{ rank: 5, suit: 'invalid' }],
      burnt: [],
      bets: [],
      players: [{ id: 'p1', name: 'Alice', bankroll: 100 }]
    });
    expect(() => deserializeGameState(badSuit as any)).toThrow();
  });

  test('placeBet validates ranks and amount at runtime', () => {
    const g = newGame('seed-validate', players);
    // invalid rank in array
    expect(() => placeBet(g, { playerId: 'p1', ranks: [0] as any, amount: 5 })).toThrow();
    expect(() => placeBet(g, { playerId: 'p1', ranks: [14] as any, amount: 5 })).toThrow();
    // invalid amount
    expect(() => placeBet(g, { playerId: 'p1', ranks: [3], amount: 0 })).toThrow();
    expect(() => placeBet(g, { playerId: 'p1', ranks: [3], amount: -10 })).toThrow();
  });

  test('multiple players and bets resolve correctly and immutably', () => {
    const state = {
      seed: 'multi',
      deck: [ { rank: 2 as any, suit: 'hearts' }, { rank: 3 as any, suit: 'clubs' } ],
      burnt: [],
      bets: [],
      players: [
        { id: 'p1', name: 'Alice', bankroll: 100 },
        { id: 'p2', name: 'Bob', bankroll: 50 }
      ]
    };

    const after1 = placeBet(state as any, { playerId: 'p1', ranks: [3], amount: 10 });
    const after2 = placeBet(after1, { playerId: 'p2', ranks: [2], amount: 5, coppered: true });

    // ensure original state not mutated
    expect(state.players[0].bankroll).toBe(100);
    expect(after1.players[0].bankroll).toBe(90);
    expect(after2.players[1].bankroll).toBe(45);

    const resolved = resolveTurn(after2);
    // winner is rank 3, loser rank 2
    // p1 bet on 3 -> wins: bankroll 90 + 20 = 110
    expect(resolved.state.players.find(p => p.id === 'p1')!.bankroll).toBe(110);
    // p2 coppered on loser rank 2 -> coppered should invert loss->win, so bankroll 45 + 10 = 55
    expect(resolved.state.players.find(p => p.id === 'p2')!.bankroll).toBe(55);
  });

  test('multiple bets by same player and stake accounting', () => {
    const state = {
      seed: 'multi2',
      deck: [ { rank: 8 as any, suit: 'hearts' }, { rank: 9 as any, suit: 'clubs' } ],
      burnt: [],
      bets: [],
      players: [ { id: 'p1', name: 'Alice', bankroll: 100 } ]
    };
    const s1 = placeBet(state as any, { playerId: 'p1', ranks: [9], amount: 10 }); // bankroll 90
    const s2 = placeBet(s1, { playerId: 'p1', ranks: [8], amount: 5 }); // bankroll 85
    const resolved = resolveTurn(s2);
    // winner is rank 9, loser 8 -> bet on 9 wins (10 -> +20), bet on 8 loses (5 lost)
    // final bankroll 85 + 20 = 105
    expect(resolved.state.players.find(p => p.id === 'p1')!.bankroll).toBe(105);
  });

  test('edge cases: unknown player id on placeBet', () => {
    const g = newGame('edge', players);
    expect(() => placeBet(g, { playerId: 'unknown', ranks: [3], amount: 5 } as any)).toThrow();
  });

  test('multi-rank split bet: one rank wins and one loses in same turn', () => {
    const state = {
      seed: 'split-multi',
      deck: [ { rank: 9 as any, suit: 'hearts' }, { rank: 8 as any, suit: 'clubs' } ],
      burnt: [],
      bets: [],
      players: [{ id: 'p1', name: 'Alice', bankroll: 100 }]
    } as any;
    // bet on 9-8 split; loser=9, winner=8 => both ranks hit => split
    const afterBet = placeBet(state, { playerId: 'p1', ranks: [9, 8], amount: 10 });
    const resolved = resolveTurn(afterBet);
    // split: 100 -> 90 after bet -> +5 (half stake back) = 95
    expect(resolved.state.players.find(p => p.id === 'p1')!.bankroll).toBe(95);
  });

  test('multi-rank bet wins when one covered rank is the winner', () => {
    const state = {
      seed: 'multi-win',
      deck: [ { rank: 2 as any, suit: 'hearts' }, { rank: 9 as any, suit: 'clubs' } ],
      burnt: [],
      bets: [],
      players: [{ id: 'p1', name: 'Alice', bankroll: 100 }]
    } as any;
    // bet on 9-8 corner; winner=9, loser=2 (not in bet) => win
    const afterBet = placeBet(state, { playerId: 'p1', ranks: [9, 8], amount: 10 });
    const resolved = resolveTurn(afterBet);
    // win: 100 -> 90 -> +20 = 110
    expect(resolved.state.players.find(p => p.id === 'p1')!.bankroll).toBe(110);
  });

});

// Additional targeted tests to cover previously uncovered branches
test('resolveTurn ignores bets with unknown players (skips pIdx === -1)', () => {
  const state: any = {
    seed: 'unknown-bet',
    deck: [ { rank: 2, suit: 'hearts' }, { rank: 3, suit: 'clubs' } ],
    burnt: [],
    bets: [],
    players: [{ id: 'p1', name: 'Alice', bankroll: 100 }]
  };
  const afterBet = placeBet(state, { playerId: 'p1', ranks: [3], amount: 5 }); // bankroll becomes 95
  const corrupted: any = { ...afterBet, bets: afterBet.bets.concat([{ playerId: 'nope', ranks: [3], amount: 10 }]) };
  const resolved = resolveTurn(corrupted);
  // bankroll: 95 (after stake) + 10 winnings = 105
  expect(resolved.state.players.find((p: any) => p.id === 'p1')!.bankroll).toBe(105);
});

test('resolveTurn treats non-boolean coppered as false (fallback branch)', () => {
  const state: any = {
    seed: 'coppered-fallback',
    deck: [ { rank: 8, suit: 'hearts' }, { rank: 9, suit: 'clubs' } ],
    burnt: [],
    bets: [],
    players: [{ id: 'p1', name: 'Alice', bankroll: 100 }]
  };
  const afterBet = placeBet(state, { playerId: 'p1', ranks: [9], amount: 10 }); // bankroll 90
  const tampered: any = { ...afterBet, bets: [{ ...afterBet.bets[0], coppered: 'yes' as any }] };
  const resolved = resolveTurn(tampered);
  // coppered malformed => treated as false => win -> bankroll 90 + 20 = 110
  expect(resolved.state.players.find((p: any) => p.id === 'p1')!.bankroll).toBe(110);
});

// ── New behaviour: unresolved bets persist ──────────────────────────────────

test('resolveTurn preserves bets whose rank did not appear this turn', () => {
  const state: any = {
    seed: 'stay-bet',
    deck: [
      { rank: 2, suit: 'hearts' },   // loser
      { rank: 3, suit: 'clubs' },    // winner
      { rank: 4, suit: 'diamonds' }, // still in deck after
    ],
    burnt: [],
    bets: [],
    players: [{ id: 'p1', name: 'Alice', bankroll: 100 }],
  };

  // Bet on rank 5 — neither loser (2) nor winner (3)
  const afterBet = placeBet(state, { playerId: 'p1', ranks: [5], amount: 10 });
  expect(afterBet.players[0].bankroll).toBe(90); // stake deducted on place

  const resolved = resolveTurn(afterBet);

  // Bet on 5 was not involved — it must remain on the table
  expect(resolved.state.bets.length).toBe(1);
  expect(resolved.state.bets[0].ranks).toEqual([5]);
  expect(resolved.state.bets[0].amount).toBe(10);

  // Bankroll unchanged (stake stays on the table, not returned)
  expect(resolved.state.players[0].bankroll).toBe(90);
});

test('resolveTurn only clears bets that were resolved (win/lose/split), keeps the rest', () => {
  const state: any = {
    seed: 'mixed-bets',
    deck: [
      { rank: 2, suit: 'hearts' },   // loser
      { rank: 3, suit: 'clubs' },    // winner
      { rank: 4, suit: 'diamonds' }, // remaining
    ],
    burnt: [],
    bets: [],
    players: [{ id: 'p1', name: 'Alice', bankroll: 100 }],
  };

  const s1 = placeBet(state, { playerId: 'p1', ranks: [3], amount: 10 }); // wins
  const s2 = placeBet(s1,    { playerId: 'p1', ranks: [7], amount: 5  }); // stays

  const resolved = resolveTurn(s2);

  // Only the unresolved bet on rank 7 should remain
  expect(resolved.state.bets.length).toBe(1);
  expect(resolved.state.bets[0].ranks).toEqual([7]);

  // bankroll: 100 - 10 - 5 = 85 (after placing), +20 (win on 3) = 105
  // rank-7 bet stays deducted (not returned)
  expect(resolved.state.players[0].bankroll).toBe(105);
});

test('resolveTurn loss-first ordering: losing bets settled before winning bets', () => {
  // Two bets by same player: one loses, one wins.
  // Regardless of internal ordering the bankroll math must be correct.
  const state: any = {
    seed: 'order-test',
    deck: [
      { rank: 8, suit: 'hearts' },  // loser
      { rank: 9, suit: 'clubs' },   // winner
    ],
    burnt: [],
    bets: [],
    players: [{ id: 'p1', name: 'Alice', bankroll: 100 }],
  };

  // Place losing bet BEFORE winning bet to exercise "lose first" ordering
  const s1 = placeBet(state, { playerId: 'p1', ranks: [8], amount: 5  }); // will lose
  const s2 = placeBet(s1,    { playerId: 'p1', ranks: [9], amount: 10 }); // will win

  const resolved = resolveTurn(s2);

  // after bets: 100-5-10 = 85; loss: 0 extra; win: +20 = 105
  expect(resolved.state.players[0].bankroll).toBe(105);
  expect(resolved.state.bets.length).toBe(0);
});

// ── New feature: removePlayer enforces minimum 1 player ───────────────────────

test('removePlayer throws when only one player remains', () => {
  const state = newGame('solo-seed', [{ id: 'p1', name: 'Alice', bankroll: 100 }]);
  expect(() => removePlayer(state, 'p1')).toThrow('Cannot remove the last player');
});

test('removePlayer works when two or more players exist', () => {
  const state = newGame('two-seed', [
    { id: 'p1', name: 'Alice', bankroll: 100 },
    { id: 'p2', name: 'Bob', bankroll: 100 },
  ]);
  const after = removePlayer(state, 'p2');
  expect(after.players.length).toBe(1);
  expect(after.players[0].id).toBe('p1');
});

// ── New feature: renamePlayer ─────────────────────────────────────────────────

test('renamePlayer changes the name of a player', () => {
  const state = newGame('rename-seed', [{ id: 'p1', name: 'Alice', bankroll: 100 }]);
  const after = renamePlayer(state, 'p1', 'Beauregard');
  expect(after.players[0].name).toBe('Beauregard');
  expect(after.players[0].id).toBe('p1');
  expect(after.players[0].bankroll).toBe(100);
});

test('renamePlayer throws when player not found', () => {
  const state = newGame('rename-err', [{ id: 'p1', name: 'Alice', bankroll: 100 }]);
  expect(() => renamePlayer(state, 'unknown', 'Hiram')).toThrow('Player not found');
});

test('renamePlayer does not mutate original state', () => {
  const state = newGame('rename-immutable', [{ id: 'p1', name: 'Alice', bankroll: 100 }]);
  renamePlayer(state, 'p1', 'Cornelius');
  expect(state.players[0].name).toBe('Alice');
});

// ── New feature: startingBankroll tracked per player ─────────────────────────

test('newGame sets startingBankroll equal to initial bankroll', () => {
  const state = newGame('start-bank', [{ id: 'p1', name: 'Alice', bankroll: 200 }]);
  expect(state.players[0].startingBankroll).toBe(200);
});

test('startingBankroll is preserved after bets and resolves', () => {
  const base: any = {
    seed: 'net-test',
    deck: [{ rank: 3, suit: 'hearts' }, { rank: 5, suit: 'clubs' }],
    burnt: [],
    bets: [],
    players: [{ id: 'p1', name: 'Alice', bankroll: 100, startingBankroll: 100 }],
  };
  const afterBet = placeBet(base, { playerId: 'p1', ranks: [5], amount: 10 });
  const result = resolveTurn(afterBet);
  // startingBankroll should still be 100 after a win
  expect(result.state.players[0].startingBankroll).toBe(100);
  // bankroll changed (win doubles stake: 90 + 20 = 110)
  expect(result.state.players[0].bankroll).toBe(110);
});

test('addPlayer sets startingBankroll on the new player', () => {
  const state = newGame('add-start', [{ id: 'p1', name: 'Alice', bankroll: 100 }]);
  const after = addPlayer(state, { id: 'p2', name: 'Bob', bankroll: 300 });
  expect(after.players[1].startingBankroll).toBe(300);
});
