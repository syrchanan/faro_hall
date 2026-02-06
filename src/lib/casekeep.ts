import { Card, Rank } from './cards';

export type CasekeepEntry = { drawn: number; total: 4 };
export type CasekeepState = Record<Rank, CasekeepEntry>;

const ALL_RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export function createCasekeep(): CasekeepState {
  const state = {} as CasekeepState;
  for (const r of ALL_RANKS) {
    state[r] = { drawn: 0, total: 4 };
  }
  return state;
}

export function recordDraw(state: CasekeepState, card: Card): CasekeepState {
  const entry = state[card.rank];
  return {
    ...state,
    [card.rank]: { ...entry, drawn: Math.min(entry.drawn + 1, 4) },
  };
}

export function getRemainingByRank(state: CasekeepState, rank: Rank): number {
  const entry = state[rank];
  return entry.total - entry.drawn;
}
