import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  newGame,
  placeBet,
  resolveTurn,
  addPlayer,
  removePlayer,
  renamePlayer,
  GameState,
  Rank,
  Card,
  RANK_LABELS,
  getRandomCivilWarName,
} from '../src/lib';
import CardSVG from '../src/components/CardSVG';
import CasekeeperPanel from '../src/components/CasekeeperPanel';
import Chip from '../src/components/Chip';
import PlayerList from '../src/components/PlayerList';
import Controls from '../src/components/Controls';
import SeedShare from '../src/components/SeedShare';
import BettingBoard, { PlacedBet } from '../src/components/BettingBoard';

const CHIP_VALUES = [1, 5, 10, 25, 50, 100];

function rankName(r: Rank): string { return RANK_LABELS[r] ?? String(r); }
function cardName(c: Card): string { return `${rankName(c.rank as Rank)} of ${c.suit}`; }

let playerCounter = 1;
function makeDefaultPlayer() {
  return { id: `p${playerCounter++}`, name: getRandomCivilWarName(), bankroll: 500, startingBankroll: 500 };
}

const Home: NextPage = () => {
  const router = useRouter();

  const [seed, setSeed] = useState(() => `seed-${Math.random().toString(36).slice(2, 9)}`);
  useEffect(() => {
    if (!router?.isReady) return;
    const q = router.query?.seed;
    if (q) setSeed(Array.isArray(q) ? q[0] : q);
  }, [router?.isReady, router?.query?.seed]);

  const [game, setGame] = useState<GameState | null>(null);
  const [initError, setInitError] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [betAmount, setBetAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [coppered, setCoppered] = useState(false);
  const [lastTurn, setLastTurn] = useState<{ winner?: Card; loser?: Card; isHock?: boolean } | null>(null);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<GameState[]>([]);
  const customInputRef = useRef<HTMLInputElement>(null);

  const startGame = useCallback((gameSeed: string) => {
    try {
      const firstPlayer = makeDefaultPlayer();
      const g = newGame(gameSeed, [firstPlayer]);
      setGame(g);
      setCurrentPlayerId(firstPlayer.id);
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

  const handleAddPlayer = useCallback(() => {
    if (!game) return;
    const p = makeDefaultPlayer();
    setHistory(prev => [...prev, game]);
    setGame(addPlayer(game, p));
  }, [game]);

  const handleRemovePlayer = useCallback((id: string) => {
    if (!game) return;
    try {
      setHistory(prev => [...prev, game]);
      const next = removePlayer(game, id);
      setGame(next);
      if (currentPlayerId === id) setCurrentPlayerId(next.players[0].id);
    } catch (e: any) {
      setMessage(e?.message || 'Cannot remove player');
    }
  }, [game, currentPlayerId]);

  const handleRenamePlayer = useCallback((id: string, name: string) => {
    if (!game) return;
    setGame(renamePlayer(game, id, name));
  }, [game]);

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

  const handleNewGame = useCallback(() => {
    setSeed(`seed-${Math.random().toString(36).slice(2, 9)}`);
  }, []);

  const handleLoadSeed = useCallback((s: string) => { if (s.trim()) setSeed(s.trim()); }, []);

  const handleCustomChip = useCallback(() => {
    setShowCustom(s => !s);
    setTimeout(() => customInputRef.current?.focus(), 50);
  }, []);

  const applyCustomAmount = useCallback(() => {
    const v = parseInt(customAmount, 10);
    if (v > 0) { setBetAmount(v); setShowCustom(false); setCustomAmount(''); }
  }, [customAmount]);

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

  const currentPlayer = game.players.find(p => p.id === currentPlayerId) ?? game.players[0];
  const allBets: PlacedBet[] = game.bets.map(b => ({
    ranks: b.ranks,
    amount: b.amount,
    coppered: b.coppered,
    playerId: b.playerId,
  }));
  const deckPct = Math.round((game.deck.length / 51) * 100);

  return (
    <div className="faro-app">
      <header className="faro-header">
        <h1 className="faro-title">Faro Hall</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/rules" className="faro-btn" aria-label="View Rules">Rules</Link>
          <SeedShare seed={seed} onImport={handleLoadSeed} />
        </div>
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
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              onRenamePlayer={handleRenamePlayer}
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

          {/* Mobile turn indicator — sticky near the board */}
          <div className="turn-indicator" aria-label="Current player's turn">
            <div className="turn-avatar" aria-hidden>
              {currentPlayer.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="turn-info">
              <span className="turn-name">{currentPlayer.name}</span>
              <span className="turn-sub">${currentPlayer.bankroll} · Turn {game.turn}</span>
            </div>
            {coppered && <span className="turn-copper">© Coppered</span>}
          </div>

          {/* Horseshoe betting board */}
          <BettingBoard
            onBet={handleBoardBet}
            placedBets={allBets}
            players={game.players}
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
                  onClick={() => { setBetAmount(v); setShowCustom(false); }}
                  ariaLabel={`$${v} chip`}
                  className={betAmount === v && !showCustom ? 'chip-active' : ''}
                />
              ))}
              <button
                className={`faro-btn btn-custom${showCustom ? ' btn-custom-on' : ''}`}
                onClick={handleCustomChip}
                aria-label="Custom bet amount"
                title="Enter a custom bet amount"
              >
                X
              </button>
            </div>

            {showCustom && (
              <div className="custom-amount-row">
                <input
                  ref={customInputRef}
                  type="number"
                  min={1}
                  className="custom-amount-input"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') applyCustomAmount(); }}
                  aria-label="Custom bet amount input"
                />
                <button className="faro-btn" onClick={applyCustomAmount}>Set</button>
              </div>
            )}

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
