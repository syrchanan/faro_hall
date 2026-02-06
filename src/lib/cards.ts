export type Rank = 1|2|3|4|5|6|7|8|9|10|11|12|13;
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
