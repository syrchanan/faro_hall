// src/lib/casekeep.ts

export type CasekeepState = Record<string, { drawn: number; total: 4 }>;

export function createCasekeep(): CasekeepState {
  return {};
}

export function recordDraw(casekeep: CasekeepState, card: { rank: number }): CasekeepState {
  const key = String(card.rank);
  const existing = casekeep[key] || { drawn: 0, total: 4 as const };
  return { ...casekeep, [key]: { drawn: existing.drawn + 1, total: 4 } };
}

export function calculateCaseResults(cases) {
  if (!Array.isArray(cases)) throw new TypeError('cases must be an array');
  let wins = 0, losses = 0;
  cases.forEach(c => {
    if (c.result === 'win') wins += 1;
    else if (c.result === 'lose') losses += 1;
  });
  return { wins, losses };
}

export function resetCases() {
  return [];
}

export function addCase(cases, newCase) {
  if (!Array.isArray(cases)) throw new TypeError('cases must be an array');
  if (!newCase) throw new TypeError('newCase required');
  return [...cases, newCase];
}
