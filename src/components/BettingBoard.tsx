import React, { useState } from 'react';
import styles from './styles/bettingboard.module.css';
import { Rank, RANK_LABELS } from '../lib/cards';

export interface PlacedBet {
  ranks: Rank[];
  amount: number;
  coppered?: boolean;
  playerId?: string;
}

export interface BettingBoardProps {
  onBet: (ranks: Rank[]) => void;
  placedBets: PlacedBet[];
  winnerRank?: Rank;
  loserRank?: Rank;
  className?: string;
  players?: { id: string; name: string; bankroll: number }[];
}

function zoneKey(ranks: Rank[]): string {
  return [...ranks].sort((a, b) => a - b).join(',');
}

function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

interface CardDef {
  rank: Rank;
  col: number;
  rowStart: number;
  rowEnd: number;
}

interface ZoneDef {
  ranks: Rank[];
  col: number;
  row: number;
}

const TOP_CARDS: CardDef[] = [
  { rank: 13, col: 1,  rowStart: 1, rowEnd: 2 },
  { rank: 12, col: 3,  rowStart: 1, rowEnd: 2 },
  { rank: 11, col: 5,  rowStart: 1, rowEnd: 2 },
  { rank: 10, col: 7,  rowStart: 1, rowEnd: 2 },
  { rank: 9,  col: 9,  rowStart: 1, rowEnd: 2 },
  { rank: 8,  col: 11, rowStart: 1, rowEnd: 2 },
];

const BOTTOM_CARDS: CardDef[] = [
  { rank: 1, col: 1,  rowStart: 3, rowEnd: 4 },
  { rank: 2, col: 3,  rowStart: 3, rowEnd: 4 },
  { rank: 3, col: 5,  rowStart: 3, rowEnd: 4 },
  { rank: 4, col: 7,  rowStart: 3, rowEnd: 4 },
  { rank: 5, col: 9,  rowStart: 3, rowEnd: 4 },
  { rank: 6, col: 11, rowStart: 3, rowEnd: 4 },
];

const SEVEN_CARD: CardDef = { rank: 7, col: 13, rowStart: 1, rowEnd: 4 };

const BET_ZONES: ZoneDef[] = [
  { ranks: [13, 12], col: 2,  row: 1 },
  { ranks: [12, 11], col: 4,  row: 1 },
  { ranks: [11, 10], col: 6,  row: 1 },
  { ranks: [10, 9],  col: 8,  row: 1 },
  { ranks: [9,  8],  col: 10, row: 1 },
  { ranks: [8,  7],  col: 12, row: 1 },

  { ranks: [1, 2], col: 2,  row: 3 },
  { ranks: [2, 3], col: 4,  row: 3 },
  { ranks: [3, 4], col: 6,  row: 3 },
  { ranks: [4, 5], col: 8,  row: 3 },
  { ranks: [5, 6], col: 10, row: 3 },
  { ranks: [6, 7], col: 12, row: 3 },

  { ranks: [13, 1], col: 1,  row: 2 },
  { ranks: [12, 2], col: 3,  row: 2 },
  { ranks: [11, 3], col: 5,  row: 2 },
  { ranks: [10, 4], col: 7,  row: 2 },
  { ranks: [9,  5], col: 9,  row: 2 },
  { ranks: [8,  6], col: 11, row: 2 },

  { ranks: [13, 12, 1, 2], col: 2,  row: 2 },
  { ranks: [12, 11, 2, 3], col: 4,  row: 2 },
  { ranks: [11, 10, 3, 4], col: 6,  row: 2 },
  { ranks: [10, 9,  4, 5], col: 8,  row: 2 },
  { ranks: [9,  8,  5, 6], col: 10, row: 2 },

  { ranks: [8, 6, 7], col: 12, row: 2 },
];

// Player colors for chip differentiation (cycles if more than 8 players)
const PLAYER_COLORS = [
  '#1d4ed8', '#7c3aed', '#b45309', '#0f766e',
  '#be185d', '#15803d', '#b91c1c', '#0369a1',
];

function playerColor(idx: number): string {
  return PLAYER_COLORS[idx % PLAYER_COLORS.length];
}

const BettingBoard: React.FC<BettingBoardProps> = ({
  onBet,
  placedBets,
  winnerRank,
  loserRank,
  className,
  players = [],
}) => {
  const [hoveredRanks, setHoveredRanks] = useState<Rank[] | null>(null);

  // Build per-player index for color assignment
  const playerIndex = new Map<string, number>();
  players.forEach((p, i) => playerIndex.set(p.id, i));
  const playerNameMap = new Map<string, string>(players.map(p => [p.id, p.name]));

  // Group bets by zone+player for per-player chip rendering
  // key: zoneKey → Map<playerId, { total, coppered }>
  const betsByZoneAndPlayer = new Map<string, Map<string, { total: number; coppered: boolean }>>();
  for (const bet of placedBets) {
    const zk = zoneKey(bet.ranks);
    if (!betsByZoneAndPlayer.has(zk)) betsByZoneAndPlayer.set(zk, new Map());
    const playerMap = betsByZoneAndPlayer.get(zk)!;
    const pid = bet.playerId ?? '__anon__';
    const prev = playerMap.get(pid) || { total: 0, coppered: false };
    playerMap.set(pid, {
      total: prev.total + bet.amount,
      coppered: prev.coppered || !!bet.coppered,
    });
  }

  const isHov = (rank: Rank) => hoveredRanks?.includes(rank) ?? false;

  const renderBetChips = (key: string) => {
    const playerMap = betsByZoneAndPlayer.get(key);
    if (!playerMap || playerMap.size === 0) return null;

    return Array.from(playerMap.entries()).map(([pid, info]) => {
      const idx = playerIndex.get(pid) ?? 0;
      const color = info.coppered ? '#b87333' : playerColor(idx);
      const pName = playerNameMap.get(pid);
      const initial = pName ? initials(pName) : '';
      return (
        <span
          key={pid}
          data-player-id={pid}
          className={styles.chip}
          style={{ background: color }}
          title={pName ? `${pName}: $${info.total}${info.coppered ? ' ©' : ''}` : undefined}
        >
          {initial && <span className={styles.chipInitial}>{initial}</span>}
          ${info.total}
        </span>
      );
    });
  };

  const renderCard = (card: CardDef) => {
    const key = zoneKey([card.rank]);
    const chips = renderBetChips(key);
    const hasBet = !!chips && (chips as any[]).length > 0;
    const hovered = isHov(card.rank);
    const isWinner = winnerRank === card.rank;
    const isLoser = loserRank === card.rank;
    const isSpanning = card.rowEnd - card.rowStart > 1;

    const cls = [
      styles.card,
      hovered && !isWinner && !isLoser ? styles.cardHovered : '',
      isWinner ? styles.cardWinner : '',
      isLoser ? styles.cardLoser : '',
      isSpanning ? styles.cardSeven : '',
    ].filter(Boolean).join(' ');

    const gridRow = isSpanning ? `${card.rowStart} / ${card.rowEnd}` : String(card.rowStart);
    const totalBet = hasBet
      ? (chips as any[]).reduce((sum: number, c: any) => sum + 0, 0)
      : 0;

    return (
      <button
        key={`card-${card.rank}`}
        className={cls}
        style={{ gridColumn: card.col, gridRow }}
        onClick={() => onBet([card.rank])}
        onMouseEnter={() => setHoveredRanks([card.rank])}
        onMouseLeave={() => setHoveredRanks(null)}
        aria-label={`Bet on ${RANK_LABELS[card.rank]}${hasBet ? `, bets placed` : ''}`}
      >
        <span className={styles.cardRank}>{RANK_LABELS[card.rank]}</span>
        <span className={styles.cardSuit}>♠</span>
        {hasBet && <div className={styles.chipStack}>{chips}</div>}
      </button>
    );
  };

  const renderZone = (zone: ZoneDef) => {
    const key = zoneKey(zone.ranks);
    const chips = renderBetChips(key);
    const hasBet = !!chips && (chips as any[]).length > 0;
    const isCorner = zone.ranks.length === 4;
    const isVertical = zone.ranks.length === 2 && zone.row === 2;

    const cls = [
      styles.zone,
      isCorner ? styles.zoneCorner : isVertical ? styles.zoneVertical : styles.zoneHorizontal,
      hasBet ? styles.zoneHasBet : '',
    ].filter(Boolean).join(' ');

    return (
      <button
        key={`zone-${key}`}
        className={cls}
        style={{ gridColumn: zone.col, gridRow: zone.row }}
        onClick={() => onBet(zone.ranks)}
        onMouseEnter={() => setHoveredRanks(zone.ranks)}
        onMouseLeave={() => setHoveredRanks(null)}
        aria-label={`Bet on ${zone.ranks.map(r => RANK_LABELS[r]).join(' & ')}${hasBet ? `, bets placed` : ''}`}
      >
        {hasBet ? (
          <div className={styles.chipStack}>{chips}</div>
        ) : (
          <span className={styles.zoneDot} />
        )}
      </button>
    );
  };

  const hoverLabel = hoveredRanks
    ? hoveredRanks.length === 1
      ? RANK_LABELS[hoveredRanks[0]]
      : hoveredRanks.map(r => RANK_LABELS[r]).join(' · ')
    : null;

  return (
    <section className={[styles.board, className || ''].join(' ').trim()} aria-label="Faro Betting Layout">
      <div className={styles.grid}>
        {TOP_CARDS.map(renderCard)}
        {BOTTOM_CARDS.map(renderCard)}
        {renderCard(SEVEN_CARD)}
        {BET_ZONES.map(renderZone)}
      </div>
      <div className={styles.hoverBar} aria-live="polite">
        {hoverLabel && <span className={styles.hoverLabel}>{hoverLabel}</span>}
      </div>
    </section>
  );
};

export default BettingBoard;
