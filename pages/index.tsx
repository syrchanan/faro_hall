import React, { useEffect, useState, useCallback } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  newGame,
  placeBet,
  resolveTurn,
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

function rankName(r: Rank): string { return RANK_LABELS[r] ?? String(r); }
function cardName(c: Card): string { return `${rankName(c.rank as Rank)} of ${c.suit}`; }

const Home: NextPage = () => {
  const router = useRouter();

  const [seed, setSeed] = useState(DEMO_SEED);
  useEffect(() => {
    if (!router?.isReady) return;
    const q = router.query?.seed;
    if (q) setSeed(Array.isArray(q) ? q[0] : q);
  }, [router?.isReady, router?.query?.seed]);

  const [game, setGame] = useState<GameState | null>(null);
  const [initError, setInitError] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState('p1');
  const [betAmount, setBetAmount] = useState(5);
  const [coppered, setCoppered] = useState(false);
  const [lastTurn, setLastTurn] = useState<{ winner?: Card; loser?: Card; isHock?: boolean } | null>(null);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<GameState[]>([]);

  const startGame = useCallback((gameSeed: string) => {
    try {
      const g = newGame(gameSeed, DEFAULT_PLAYERS);
      setGame(g);
      setInitError(false);
      setLastTurn(null);
      setMessage(`Soda: ${cardName(g.sodaCard!)}`);
      setHistory([]);
      setCoppered(false);
    } catch {
      setGame(null);
      setInitError(true);
    }
  }, []);

  useEffect(() => { startGame(seed); }, [seed, startGame]);

  useEffect(() => {
    if (router?.isReady && seed) {
      router.replace({ query: { seed } }, undefined, { shallow: true });
    }
  }, [seed]);

  const handleBoardBet = useCallback((ranks: Rank[]) => {
    if (!game || betAmount <= 0) return;
    const label = ranks.map(r => rankName(r)).join(' · ');
    try {
      setHistory(prev => [...prev, game]);
      const next = placeBet(game, { playerId: currentPlayerId, ranks, coppered, amount: betAmount });
      setGame(next);
      setMessage(`$${betAmount} on ${label}${coppered ? ' ©' : ''}`);
    } catch (e: any) {
      setMessage(e?.message || 'Cannot place bet');
    }
  }, [game, betAmount, coppered, currentPlayerId]);

  const handleDeal = useCallback(() => {
    if (!game) return;
    if (game.deck.length <= 1) {
      setMessage(game.deck.length === 1 ? 'Hock — game over.' : 'Deck exhausted.');
      return;
    }
    setHistory(prev => [...prev, game]);
    const result = resolveTurn(game);
    setGame(result.state);
    if (result.winnerCard && result.loserCard) {
      setLastTurn({ winner: result.winnerCard, loser: result.loserCard, isHock: result.isHock });
      setMessage(
        `T${result.state.turn}  ${rankName(result.loserCard.rank as Rank)} loses · ${rankName(result.winnerCard.rank as Rank)} wins` +
        (result.isHock ? '  —  Hock next!' : '')
      );
    }
  }, [game]);

  const handleUndo = useCallback(() => {
    if (!history.length) { setMessage('Nothing to undo.'); return; }
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setGame(prev);
    setLastTurn(null);
    setMessage('Undone.');
  }, [history]);

  const handleNewGame = useCallback(() => setSeed(`seed-${Math.random().toString(36).slice(2, 9)}`), []);
  const handleLoadSeed = useCallback((s: string) => { if (s.trim()) setSeed(s.trim()); }, []);

  if (initError || !game) {
    return (
      <div className="faro-app">
        <main className="faro-loading">
          <h1>Faro Hall</h1>
          <p>{initError ? 'Failed to initialize game.' : 'Loading…'}</p>
          <button onClick={handleNewGame}>Start New Game</button>
        </main>
      </div>
    );
  }

  const allBets: PlacedBet[] = game.bets.map(b => ({ ranks: b.ranks, amount: b.amount, coppered: b.coppered }));
  const deckPct = Math.round((game.deck.length / 51) * 100);

  return (
    <div className="faro-app">
      <header className="faro-header">
        <h1 className="faro-title">Faro Hall</h1>
        <SeedShare seed={seed} onImport={handleLoadSeed} />
      </header>

      <div className="faro-layout">
        {/* ── Meta panel ── */}
        <aside className="faro-meta">
          <section className="meta-section">
            <h2 className="meta-heading">Players</h2>
            <PlayerList
              players={game.players}
              currentPlayerId={currentPlayerId}
              onSwitchPlayer={setCurrentPlayerId}
            />
          </section>

          <section className="meta-section">
            <h2 className="meta-heading">Casekeeper</h2>
            <CasekeeperPanel burnt={game.burnt} />
          </section>

          <section className="meta-section meta-controls">
            <Controls
              onNewGame={handleNewGame}
              onLoadSeed={handleLoadSeed}
              onUndo={handleUndo}
              onOpenRules={() => router.push('/rules')}
              seed={seed}
            />
          </section>
        </aside>

        {/* ── Main play area ── */}
        <main className="faro-main">
          {/* Deal display */}
          <section className="faro-deal" aria-label="Current turn">
            <div className="deal-cards">
              <div className="deal-slot">
                <div className="deal-label loss-label">Loser</div>
                {lastTurn?.loser ? (
                  <div className="deal-card deal-card-loser">
                    <CardSVG card={{ rank: RANK_LABELS[lastTurn.loser.rank], suit: lastTurn.loser.suit }} size={88} />
                  </div>
                ) : (
                  <div className="deal-card deal-card-empty">?</div>
                )}
              </div>

              <div className="deal-divider" />

              <div className="deal-slot">
                <div className="deal-label win-label">Winner</div>
                {lastTurn?.winner ? (
                  <div className="deal-card deal-card-winner">
                    <CardSVG card={{ rank: RANK_LABELS[lastTurn.winner.rank], suit: lastTurn.winner.suit }} size={88} />
                  </div>
                ) : (
                  <div className="deal-card deal-card-empty">?</div>
                )}
              </div>

              <div className="deal-soda">
                <div className="deal-label soda-label">Soda</div>
                {game.sodaCard && (
                  <CardSVG card={{ rank: RANK_LABELS[game.sodaCard.rank], suit: game.sodaCard.suit }} size={56} />
                )}
              </div>
            </div>

            <div className="deal-info">
              <span className="deal-stat">Turn <strong>{game.turn}</strong></span>
              <span className="deal-divider-v" />
              <span className="deal-stat"><strong>{game.deck.length}</strong> cards left</span>
              <div className="deck-bar">
                <div className="deck-bar-fill" style={{ width: `${deckPct}%` }} />
              </div>
              {game.deck.length === 1 && <span className="hock-badge">Hock</span>}
            </div>

            {message && (
              <div className="deal-message" role="status">{message}</div>
            )}
          </section>

          {/* Horseshoe betting board */}
          <BettingBoard
            onBet={handleBoardBet}
            placedBets={allBets}
            winnerRank={lastTurn?.winner?.rank as Rank | undefined}
            loserRank={lastTurn?.loser?.rank as Rank | undefined}
          />

          {/* Action bar: chips + copper + deal */}
          <section className="faro-action-bar" aria-label="Betting controls">
            <div className="action-chips">
              {CHIP_VALUES.map(v => (
                <Chip
                  key={v}
                  value={v}
                  size={44}
                  onClick={() => setBetAmount(v)}
                  ariaLabel={`$${v} chip`}
                  className={betAmount === v ? 'chip-active' : ''}
                />
              ))}
            </div>

            <div className="action-right">
              <button
                className={`faro-btn btn-copper${coppered ? ' btn-copper-on' : ''}`}
                onClick={() => setCoppered(c => !c)}
                aria-pressed={coppered}
                title="Copper inverts your bet — bet the loser card to win"
              >
                {coppered ? '© Coppered' : 'Copper'}
              </button>

              <button className="faro-btn btn-deal" onClick={handleDeal}>
                Deal
              </button>

              <button className="faro-btn btn-undo" onClick={handleUndo} disabled={!history.length}>
                Undo
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Home;
