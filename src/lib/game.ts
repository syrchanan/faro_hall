import { Card, makeDeck, shuffle, Rank } from './cards';
import { mulberry32, seedFromString } from './rng';
import { BetSchema, GameStateSchema, CardSchema, PlayerSchema } from './schemas';
import { CasekeepState, createCasekeep, recordDraw } from './casekeep';

export type Bet = { playerId: string; rank: Rank; coppered?: boolean; amount: number };

export type GameState = {
  seed: string;
  deck: Card[];
  burnt: Card[];
  bets: Bet[];
  players: { id: string; name: string; bankroll: number }[];
  casekeep?: CasekeepState;
  sodaCard?: Card | null;
  turn?: number;
};

export function newGame(seed: string, players: { id: string; name: string; bankroll: number }[]): GameState {
  const s = seedFromString(seed);
  const rnd = mulberry32(s);
  const deck = makeDeck();
  const shuffled = shuffle(deck, rnd);

  const playersCopy = players.map(p => ({ ...p }));
  let casekeep = createCasekeep();

  // Soda: first card turned face-up at start, no action on it
  const sodaCard = shuffled[0];
  const remainingDeck = shuffled.slice(1);
  casekeep = recordDraw(casekeep, sodaCard);

  return {
    seed,
    deck: remainingDeck,
    burnt: [sodaCard],
    bets: [],
    players: playersCopy,
    casekeep,
    sodaCard,
    turn: 0,
  };
}

export function draw(state: GameState): { state: GameState; drawn?: Card } {
  if (state.deck.length === 0) return { state };
  const [top, ...rest] = state.deck;
  const ck = state.casekeep || createCasekeep();
  const casekeep = recordDraw(ck, top);
  const newState = { ...state, deck: rest, burnt: [...state.burnt, top], casekeep };
  return { state: newState, drawn: top };
}

export function placeBet(state: GameState, bet: Bet): GameState {
  const parsed = BetSchema.parse(bet as any);

  const pIndex = state.players.findIndex(p => p.id === parsed.playerId);
  if (pIndex === -1) throw new Error('Unknown player');

  const player = state.players[pIndex];
  if (player.bankroll < parsed.amount) throw new Error('Insufficient funds');

  const playersCopy = state.players.map(p => ({ ...p }));
  playersCopy[pIndex] = { ...playersCopy[pIndex], bankroll: playersCopy[pIndex].bankroll - parsed.amount };

  const betObj: Bet = { playerId: parsed.playerId, rank: parsed.rank as Rank, coppered: parsed.coppered, amount: parsed.amount };
  const betsCopy = state.bets.concat([betObj]);
  return { ...state, bets: betsCopy, players: playersCopy };
}

export function resolveTurn(state: GameState): { state: GameState; winnerCard?: Card; loserCard?: Card; isHock?: boolean } {
  // Hock: last card remaining — no action
  if (state.deck.length <= 1) {
    return { state, isHock: state.deck.length === 1 };
  }

  if (state.deck.length < 2) return { state };

  const [loser, ...rest1] = state.deck;
  const [winner, ...rest2] = rest1;

  const burnt = state.burnt.concat([loser, winner]);
  let casekeep = state.casekeep || createCasekeep();
  casekeep = recordDraw(casekeep, loser);
  casekeep = recordDraw(casekeep, winner);

  const playersCopy = state.players.map(p => ({ ...p }));

  for (const b of state.bets) {
    const pIdx = playersCopy.findIndex(p => p.id === b.playerId);
    if (pIdx === -1) continue;
    const wouldWin = (b.rank === winner.rank);
    const wouldLose = (b.rank === loser.rank);

    if (wouldWin && wouldLose) {
      // Split — both cards same rank — return half stake (house takes half)
      playersCopy[pIdx].bankroll += Math.floor(b.amount / 2);
      continue;
    }
    if (!wouldWin && !wouldLose) {
      // Bet stays for next turn — return stake
      playersCopy[pIdx].bankroll += b.amount;
      continue;
    }

    let finalWin = wouldWin;
    const coppered = (typeof b.coppered === 'boolean') ? b.coppered : false;
    if (coppered) finalWin = !finalWin;

    if (finalWin) {
      playersCopy[pIdx].bankroll += b.amount * 2;
    }
    // else: lost, stake already deducted
  }

  const isHock = rest2.length === 1;
  const newState: GameState = {
    ...state,
    deck: rest2,
    burnt,
    bets: [],
    players: playersCopy,
    casekeep,
    turn: (state.turn || 0) + 1,
  };
  return { state: newState, winnerCard: winner, loserCard: loser, isHock };
}

export function addPlayer(state: GameState, player: { id: string; name: string; bankroll: number }): GameState {
  if (state.players.some(p => p.id === player.id)) throw new Error('Player already exists');
  return { ...state, players: [...state.players, { ...player }] };
}

export function removePlayer(state: GameState, playerId: string): GameState {
  const filtered = state.players.filter(p => p.id !== playerId);
  if (filtered.length === state.players.length) throw new Error('Player not found');
  // Also remove their bets, refunding amounts
  const playerBets = state.bets.filter(b => b.playerId === playerId);
  const remainingBets = state.bets.filter(b => b.playerId !== playerId);
  // No refund needed since bets are already deducted — just remove them
  return { ...state, players: filtered, bets: remainingBets };
}

export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

export function deserializeGameState(s: string): GameState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch (err) {
    throw new Error('Invalid JSON');
  }
  const res = GameStateSchema.safeParse(parsed);
  if (!res.success) {
    throw new Error('Invalid game state: ' + res.error.message);
  }
  return res.data as unknown as GameState;
}
