export type Rank = 1|2|3|4|5|6|7|8|9|10|11|12|13;

export const RANK_LABELS: Record<number, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K',
};
export type Suit = 'hearts'|'diamonds'|'clubs'|'spades';

export interface Card { rank: Rank; suit: Suit }

export function makeDeck(): Card[] {
  const suits: Suit[] = ['hearts','diamonds','clubs','spades'];
  const ranks: Rank[] = [1,2,3,4,5,6,7,8,9,10,11,12,13];
  const deck: Card[] = [];
  for (const s of suits) {
    for (const r of ranks) deck.push({rank:r, suit:s});
  }
  return deck;
}

export function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
