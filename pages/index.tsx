import React, { useEffect, useState, useCallback } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  newGame,
  placeBet,
  resolveTurn,
  addPlayer,
  removePlayer,
  serializeGameState,
  GameState,
  Rank,
  Card,
} from '../src/lib';
import CardSVG from '../src/components/CardSVG';
import CasekeeperPanel from '../src/components/CasekeeperPanel';
import Chip from '../src/components/Chip';
import PlayerList from '../src/components/PlayerList';
import Controls from '../src/components/Controls';
import SeedShare from '../src/components/SeedShare';
import BettingBoard, { PlacedBet } from '../src/components/BettingBoard';

const DEMO_SEED = 'demo-seed-1';
const RANK_LABELS: Record<number, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K',
};
const DEFAULT_PLAYERS = [
  { id: 'p1', name: 'Alice', bankroll: 500 },
  { id: 'p2', name: 'Bob', bankroll: 500 },
];
const CHIP_VALUES = [1, 5, 10, 25];

function formatCard(c: Card): string {
  return `${RANK_LABELS[c.rank]} of ${c.suit}`;
}

const Home: NextPage = () => {
  const router = useRouter();

  // Seed management
  const [seed, setSeed] = useState(DEMO_SEED);
  useEffect(() => {
    if (!router?.isReady) return;
    const q = router.query?.seed;
    if (q) {
      const s = Array.isArray(q) ? q[0] : q;
      if (s) setSeed(s);
    }
  }, [router?.isReady, router?.query?.seed]);

  // Game state
  const [game, setGame] = useState<GameState | null>(null);
  const [initError, setInitError] = useState(false);

  // UI state
  const [currentPlayerId, setCurrentPlayerId] = useState('p1');
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
  const [betAmount, setBetAmount] = useState(5);
  const [coppered, setCoppered] = useState(false);
  const [lastTurn, setLastTurn] = useState<{ winner?: Card; loser?: Card; isHock?: boolean } | null>(null);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<GameState[]>([]);

  // Initialize game
  const startGame = useCallback((gameSeed: string) => {
    try {
      const g = newGame(gameSeed, DEFAULT_PLAYERS);
      setGame(g);
      setInitError(false);
      setLastTurn(null);
      setMessage(`New game started. Soda card: ${formatCard(g.sodaCard!)}`);
      setHistory([]);
      setCoppered(false);
      setSelectedRank(null);
    } catch {
      setGame(null);
      setInitError(true);
    }
  }, []);

  useEffect(() => { startGame(seed); }, [seed, startGame]);

  // Update URL when seed changes
  useEffect(() => {
    if (router?.isReady && seed) {
      router.replace({ query: { seed } }, undefined, { shallow: true });
    }
  }, [seed]);

  // Actions
  const handlePlaceBet = useCallback(() => {
    if (!game || selectedRank === null || betAmount <= 0) {
      setMessage('Select a rank and chip amount first.');
      return;
    }
    try {
      setHistory(prev => [...prev, game]);
      const next = placeBet(game, {
        playerId: currentPlayerId,
        rank: selectedRank,
        coppered,
        amount: betAmount,
      });
      setGame(next);
      setMessage(`Bet $${betAmount} on ${RANK_LABELS[selectedRank]}${coppered ? ' (coppered)' : ''}`);
    } catch (e: any) {
      setMessage(e?.message || 'Could not place bet');
    }
  }, [game, selectedRank, betAmount, coppered, currentPlayerId]);

  const handleDeal = useCallback(() => {
    if (!game) return;
    if (game.deck.length <= 1) {
      setMessage(game.deck.length === 1 ? 'Hock card remains — game over.' : 'Deck exhausted — game over.');
      return;
    }
    setHistory(prev => [...prev, game]);
    const result = resolveTurn(game);
    setGame(result.state);
    if (result.winnerCard && result.loserCard) {
      setLastTurn({ winner: result.winnerCard, loser: result.loserCard, isHock: result.isHock });
      setMessage(
        `Turn ${result.state.turn}: Loser ${formatCard(result.loserCard)} | Winner ${formatCard(result.winnerCard)}` +
        (result.isHock ? ' — Hock card next, final turn!' : '')
      );
    } else {
      setMessage('Not enough cards to deal.');
    }
  }, [game]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) {
      setMessage('Nothing to undo.');
      return;
    }
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setGame(prev);
    setLastTurn(null);
    setMessage('Undone.');
  }, [history]);

  const handleNewGame = useCallback(() => {
    const newSeed = `seed-${Math.random().toString(36).slice(2, 9)}`;
    setSeed(newSeed);
  }, []);

  const handleLoadSeed = useCallback((s: string) => {
    if (s.trim()) setSeed(s.trim());
  }, []);

  if (initError || !game) {
    return (
      <div className="faro-app">
        <main className="faro-loading">
          <h1>Faro Hall</h1>
          <p>{initError ? 'Failed to initialize game.' : 'Loading...'}</p>
          <button onClick={handleNewGame}>Start New Game</button>
        </main>
      </div>
    );
  }

  // Derive data for components
  const allBets: PlacedBet[] = game.bets.map(b => ({ rank: b.rank, amount: b.amount, coppered: b.coppered }));

  return (
    <div className="faro-app">
      {/* Header */}
      <header className="faro-header">
        <h1 className="faro-title">Faro Hall</h1>
        <SeedShare seed={seed} onImport={handleLoadSeed} />
      </header>

      <div className="faro-layout">
        {/* Sidebar: Players */}
        <aside className="faro-sidebar">
          <PlayerList
            players={game.players}
            currentPlayerId={currentPlayerId}
            onSwitchPlayer={setCurrentPlayerId}
          />
        </aside>

        {/* Main content */}
        <main className="faro-main">
          {/* Table: Turn cards */}
          <section className="faro-table" aria-label="Faro Table">
            <div className="faro-cards-display">
              <div className="faro-card-slot">
                <div className="faro-card-label">Loser</div>
                {lastTurn?.loser ? (
                  <div className="faro-card faro-card-loser">
                    <CardSVG card={{ rank: RANK_LABELS[lastTurn.loser.rank], suit: lastTurn.loser.suit }} size={100} />
                  </div>
                ) : (
                  <div className="faro-card faro-card-placeholder">?</div>
                )}
              </div>
              <div className="faro-card-slot">
                <div className="faro-card-label">Winner</div>
                {lastTurn?.winner ? (
                  <div className="faro-card faro-card-winner">
                    <CardSVG card={{ rank: RANK_LABELS[lastTurn.winner.rank], suit: lastTurn.winner.suit }} size={100} />
                  </div>
                ) : (
                  <div className="faro-card faro-card-placeholder">?</div>
                )}
              </div>
              <div className="faro-card-slot">
                <div className="faro-card-label">Soda</div>
                {game.sodaCard && (
                  <div className="faro-card faro-card-soda">
                    <CardSVG card={{ rank: RANK_LABELS[game.sodaCard.rank], suit: game.sodaCard.suit }} size={80} />
                  </div>
                )}
              </div>
            </div>
            <div className="faro-info-bar">
              <span>Turn {game.turn}</span>
              <span>Deck: {game.deck.length} cards</span>
              {game.deck.length === 1 && <span className="faro-hock-badge">Hock!</span>}
            </div>
            {message && <div className="faro-message" role="status">{message}</div>}
          </section>

          {/* Betting Board */}
          <BettingBoard
            selectedRank={selectedRank}
            onSelectRank={setSelectedRank}
            placedBets={allBets}
            winnerRank={lastTurn?.winner?.rank}
            loserRank={lastTurn?.loser?.rank}
          />

          {/* Chip selection + Deal */}
          <section className="faro-betting-controls" aria-label="Betting Controls">
            <div className="faro-chips">
              {CHIP_VALUES.map(v => (
                <Chip
                  key={v}
                  value={v}
                  size={48}
                  onClick={() => setBetAmount(v)}
                  ariaLabel={`$${v} chip`}
                  className={betAmount === v ? 'faro-chip-selected' : ''}
                />
              ))}
            </div>
            <div className="faro-bet-actions">
              <button
                className={`faro-btn faro-btn-copper ${coppered ? 'faro-btn-copper-active' : ''}`}
                onClick={() => setCoppered(c => !c)}
                aria-pressed={coppered}
              >
                {coppered ? 'Coppered' : 'Copper'}
              </button>
              <button className="faro-btn faro-btn-place" onClick={handlePlaceBet}>
                Place Bet {selectedRank !== null ? `on ${RANK_LABELS[selectedRank]}` : ''} — ${betAmount}
              </button>
              <button className="faro-btn faro-btn-deal" onClick={handleDeal}>
                Deal
              </button>
            </div>
          </section>

          {/* Casekeeper */}
          <CasekeeperPanel burnt={game.burnt} />

          {/* Controls */}
          <Controls
            onNewGame={handleNewGame}
            onLoadSeed={handleLoadSeed}
            onUndo={handleUndo}
            onOpenRules={() => router.push('/rules')}
            seed={seed}
          />
        </main>
      </div>
    </div>
  );
};

export default Home;
