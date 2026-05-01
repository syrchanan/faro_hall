import React, { useState } from 'react';
import styles from './styles/bettingboard.module.css';
import { Rank } from '../lib/cards';

const RANK_LABELS: Record<number, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K',
};

export interface PlacedBet {
  ranks: Rank[];
  amount: number;
  coppered?: boolean;
}

export interface BettingBoardProps {
  onBet: (ranks: Rank[]) => void;
  placedBets: PlacedBet[];
  winnerRank?: Rank;
  loserRank?: Rank;
  className?: string;
}

function zoneKey(ranks: Rank[]): string {
  return [...ranks].sort((a, b) => a - b).join(',');
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

// CSS grid: columns alternate card(1fr) / bet-zone(28px), plus 7 card at end
// Col indices: 1=K/A, 2=K-Q gap, 3=Q/2, 4=Q-J gap, 5=J/3, 6=J-10 gap,
//              7=10/4, 8=10-9 gap, 9=9/5, 10=9-8 gap, 11=8/6, 12=8-7/6-7 gap, 13=7
// Row indices: 1=top row, 2=middle bet zones, 3=bottom row

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
  // Top row horizontal splits
  { ranks: [13, 12], col: 2,  row: 1 },
  { ranks: [12, 11], col: 4,  row: 1 },
  { ranks: [11, 10], col: 6,  row: 1 },
  { ranks: [10, 9],  col: 8,  row: 1 },
  { ranks: [9,  8],  col: 10, row: 1 },
  { ranks: [8,  7],  col: 12, row: 1 },

  // Bottom row horizontal splits
  { ranks: [1, 2], col: 2,  row: 3 },
  { ranks: [2, 3], col: 4,  row: 3 },
  { ranks: [3, 4], col: 6,  row: 3 },
  { ranks: [4, 5], col: 8,  row: 3 },
  { ranks: [5, 6], col: 10, row: 3 },
  { ranks: [6, 7], col: 12, row: 3 },

  // Vertical splits (between top and bottom rows)
  { ranks: [13, 1], col: 1,  row: 2 },
  { ranks: [12, 2], col: 3,  row: 2 },
  { ranks: [11, 3], col: 5,  row: 2 },
  { ranks: [10, 4], col: 7,  row: 2 },
  { ranks: [9,  5], col: 9,  row: 2 },
  { ranks: [8,  6], col: 11, row: 2 },

  // 4-way corner bets
  { ranks: [13, 12, 1, 2], col: 2,  row: 2 },
  { ranks: [12, 11, 2, 3], col: 4,  row: 2 },
  { ranks: [11, 10, 3, 4], col: 6,  row: 2 },
  { ranks: [10, 9,  4, 5], col: 8,  row: 2 },
  { ranks: [9,  8,  5, 6], col: 10, row: 2 },
];

const BettingBoard: React.FC<BettingBoardProps> = ({
  onBet,
  placedBets,
  winnerRank,
  loserRank,
  className,
}) => {
  const [hoveredRanks, setHoveredRanks] = useState<Rank[] | null>(null);

  const betsByZone = new Map<string, { total: number; hasCoppered: boolean }>();
  for (const bet of placedBets) {
    const key = zoneKey(bet.ranks);
    const prev = betsByZone.get(key) || { total: 0, hasCoppered: false };
    betsByZone.set(key, {
      total: prev.total + bet.amount,
      hasCoppered: prev.hasCoppered || !!bet.coppered,
    });
  }

  const isHov = (rank: Rank) => hoveredRanks?.includes(rank) ?? false;

  const renderCard = (card: CardDef) => {
    const bet = betsByZone.get(zoneKey([card.rank]));
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

    return (
      <button
        key={`card-${card.rank}`}
        className={cls}
        style={{ gridColumn: card.col, gridRow }}
        onClick={() => onBet([card.rank])}
        onMouseEnter={() => setHoveredRanks([card.rank])}
        onMouseLeave={() => setHoveredRanks(null)}
        aria-label={`Bet on ${RANK_LABELS[card.rank]}${bet ? `, $${bet.total} placed` : ''}`}
      >
        <span className={styles.cardRank}>{RANK_LABELS[card.rank]}</span>
        <span className={styles.cardSuit}>♠</span>
        {bet && (
          <span className={[styles.chip, bet.hasCoppered ? styles.chipCopper : ''].filter(Boolean).join(' ')}>
            ${bet.total}
          </span>
        )}
      </button>
    );
  };

  const renderZone = (zone: ZoneDef) => {
    const key = zoneKey(zone.ranks);
    const bet = betsByZone.get(key);
    const isCorner = zone.ranks.length === 4;
    const isVertical = zone.ranks.length === 2 && zone.row === 2;

    const cls = [
      styles.zone,
      isCorner ? styles.zoneCorner : isVertical ? styles.zoneVertical : styles.zoneHorizontal,
      bet ? styles.zoneHasBet : '',
    ].filter(Boolean).join(' ');

    return (
      <button
        key={`zone-${key}`}
        className={cls}
        style={{ gridColumn: zone.col, gridRow: zone.row }}
        onClick={() => onBet(zone.ranks)}
        onMouseEnter={() => setHoveredRanks(zone.ranks)}
        onMouseLeave={() => setHoveredRanks(null)}
        aria-label={`Bet on ${zone.ranks.map(r => RANK_LABELS[r]).join(' & ')}${bet ? `, $${bet.total} placed` : ''}`}
      >
        {bet ? (
          <span className={[styles.chip, styles.chipSmall, bet.hasCoppered ? styles.chipCopper : ''].filter(Boolean).join(' ')}>
            ${bet.total}
          </span>
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
