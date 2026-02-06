import { makeDeck, shuffle } from './cards';
import { seedFromString, mulberry32 } from './rng';

describe('cards utilities', () => {
  test('makeDeck creates 52 unique cards', () => {
    const deck = makeDeck();
    expect(deck.length).toBe(52);
    const set = new Set(deck.map((c) => `${c.rank}-${c.suit}`));
    expect(set.size).toBe(52);
  });

  test('shuffle is deterministic given seeded RNG and preserves cards', () => {
    const deck = makeDeck();
    const seed = seedFromString('shuffle-seed');
    const r1 = mulberry32(seed);
    const r2 = mulberry32(seed);
    const s1 = shuffle(deck, r1);
    const s2 = shuffle(deck, r2);
    expect(s1).toEqual(s2);

    // same multiset of cards
    const toKeys = (arr: any[]) => arr.map((c) => `${c.rank}-${c.suit}`).sort();
    expect(toKeys(s1)).toEqual(toKeys(deck));
  });
});
