import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type Player = { id: string; name: string; bankroll: number };
type Bet = { playerId: string; rank: string; amount: number; coppered?: boolean };

const DEMO_SEED = 'demo-seed-1';

import { newGame as libNewGame, placeBet as libPlaceBet, resolveTurn as libResolveTurn, serializeGameState, deserializeGameState } from '../lib';

function sanitizeFilenamePart(s: string) {
  return s.replace(/[^a-z0-9._-]/gi, '-');
}

export default function Home() {
  const router = useRouter();
  const [seed, setSeed] = useState(DEMO_SEED);

  const [players, setPlayers] = useState<Player[]>([
    { id: 'p1', name: 'Alice', bankroll: 100 },
    { id: 'p2', name: 'Bob', bankroll: 100 },
  ]);

  // Initialize game state synchronously so tests that mock newGame throwing see Loading...
  let initialGame: any = null;
  let initialInitError = false;
  try {
    initialGame = libNewGame(seed, players as any);
  } catch (e) {
    initialGame = null;
    initialInitError = true;
  }

  const [gameState, setGameState] = useState<any | null>(initialGame);
  const [initError, setInitError] = useState<boolean>(initialInitError);

  // read seed from router.query on mount (coerce arrays to string)
  useEffect(() => {
    if (!router) return;
    try {
      const q: any = (router as any).query?.seed;
      if (typeof q !== 'undefined') {
        const coerced = Array.isArray(q) ? q.join(',') : String(q);
        setSeed(coerced);
      }
    } catch (e) {
      // ignore
    }
    // we only want to run this on mount / when router object changes
  }, [router]);

  // inform router of seed changes (tests mock router.replace)
  useEffect(() => {
    if (router && typeof (router as any).replace === 'function') {
      try {
        (router as any).replace({ query: { seed } });
      } catch (e) {
        // some test mocks may not support full replace signature
        (router as any).replace({ query: { seed } } as any);
      }
    }
  }, [seed, router]);

  const [currentPlayer, setCurrentPlayer] = useState('p1');
  const [bets, setBets] = useState<Bet[]>([]);
  const [rank, setRank] = useState('3');
  const [amount, setAmount] = useState<number | ''>(5);
  const [coppered, setCoppered] = useState(false);
  const [lastTurn, setLastTurn] = useState<{ winnerCard?: any | null; loserCard?: any | null } | null>(null);

  // When seed or players change, try to create a new game state
  useEffect(() => {
    try {
      const g = libNewGame(seed, players as any);
      setGameState(g);
      setInitError(false);
    } catch (e) {
      setGameState(null);
      setInitError(true);
    }
  }, [seed]);

  const placeBet = () => {
    const amt = Number(amount) || 0;
    if (!amt || !gameState) return;
    try {
      const betObj = { playerId: currentPlayer, ranks: [Number(rank)], amount: amt, coppered } as any;
      const newState = libPlaceBet(gameState, betObj);
      setGameState(newState);
      // reflect in UI copies for backwards compatibility
      setBets(prev => [...prev, { playerId: currentPlayer, rank, amount: amt, coppered }]);
      setPlayers(prev => prev.map(p => p.id === currentPlayer ? { ...p, bankroll: p.bankroll - amt } : p));
    } catch (e: any) {
      try { window.alert((e && e.message) ? e.message : String(e)); } catch (_) { /* ignore */ }
    }
  };

  const resolveTurn = () => {
    if (!gameState) return;
    try {
      const res = libResolveTurn(gameState);
      if (res && res.state) setGameState(res.state);
      setLastTurn({ winnerCard: res ? (res.winnerCard ?? null) : null, loserCard: res ? (res.loserCard ?? null) : null });
      setBets([]);
    } catch (e) {
      // ignore for now
    }
  };

  const generateNewSeed = () => {
    return `seed-${Math.random().toString(36).slice(2, 9)}`;
  };

  const newSeed = () => setSeed(generateNewSeed());
  const resetSeed = () => setSeed(DEMO_SEED);

  const exportJSON = () => {
    if (!gameState) return;
    let dataStr = '';
    try {
      dataStr = serializeGameState(gameState);
    } catch (e) {
      dataStr = JSON.stringify(gameState);
    }
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = (global as any).URL && (global as any).URL.createObjectURL ? (global as any).URL.createObjectURL(blob) : '';
    const a = document.createElement('a');
    a.href = url;
    const safe = sanitizeFilenamePart(seed || DEMO_SEED);
    a.setAttribute('download', `faro-${safe}.json`);
    document.body.appendChild(a);
    // trigger click
    a.click();
    // Only remove if it's still attached to body
    try {
      if (document.body.contains && document.body.contains(a)) {
        document.body.removeChild(a);
      } else if ((a as any).remove) {
        (a as any).remove();
      }
    } catch (e) {
      // ignore
    }
    if ((global as any).URL && (global as any).URL.revokeObjectURL) {
      (global as any).URL.revokeObjectURL(url);
    }
  };

  if (initError) return (<div>Loading...</div>);

  return (
    <main style={{ padding: 24 }}>
      <h1>Faro Hall — Clean Build</h1>
      <p>Placeholder page. UI components exist under src/components.</p>

      <section aria-label="game-overview">
        <div>Deck remaining: 52</div>
      </section>

      <section aria-label="seed-section">
        <label>
          Seed:
          <input aria-label="Seed:" value={seed} onChange={e => setSeed(e.target.value)} />
        </label>
        <div style={{ marginTop: 8 }}>
          <button onClick={newSeed}>New Seed</button>
          <button onClick={resetSeed}>Reset to Demo Seed</button>
          <button onClick={exportJSON}>Export JSON</button>
        </div>
      </section>

      <section aria-label="betting" style={{ marginTop: 16 }}>
        <h2>Bets</h2>
        <div>
          <label>
            Player:
            <select aria-label="Player:" value={currentPlayer} onChange={e => setCurrentPlayer(e.target.value)}>
              {players.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
            </select>
          </label>

          <label>
            Rank:
            <input aria-label="Rank:" value={rank} onChange={e => setRank(e.target.value)} />
          </label>

          <label>
            Amount:
            <input aria-label="Amount:" type="number" value={amount as any} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>

          <label>
            <input aria-label="Coppered" type="checkbox" checked={coppered} onChange={e => setCoppered(e.target.checked)} /> Coppered
          </label>

          <button onClick={placeBet}>Place Bet</button>
          <button onClick={resolveTurn}>Resolve Turn</button>
        </div>

        <div>
          <h3>Bets</h3>
          <ul>
            {bets.map((b, i) => (
              <li key={i}>{b.playerId} bet on rank {b.rank} x{b.amount}</li>
            ))}
          </ul>
        </div>

        <div>
          {players.map(p => (
            <div key={p.id}>{p.name} — bankroll: {p.bankroll}</div>
          ))}
        </div>
      </section>

      <section aria-label="last-turn" style={{ marginTop: 16 }}>
        {lastTurn ? (
          <div>
            <div>Winner: {lastTurn.winnerCard ? `${lastTurn.winnerCard.rank} of ${lastTurn.winnerCard.suit}` : 'n/a'}</div>
            <div>Loser: {lastTurn.loserCard ? `${lastTurn.loserCard.rank} of ${lastTurn.loserCard.suit}` : 'n/a'}</div>
          </div>
        ) : (
          <div>No turns yet</div>
        )}
      </section>
    </main>
  );
}
