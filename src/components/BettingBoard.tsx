import React from 'react';
import styles from './styles/bettingboard.module.css';
import { Rank } from '../lib/cards';

const RANK_LABELS: Record<number, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K',
};

const ALL_RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export interface PlacedBet {
  rank: Rank;
  amount: number;
  coppered?: boolean;
}

export interface BettingBoardProps {
  selectedRank: Rank | null;
  onSelectRank: (rank: Rank) => void;
  placedBets: PlacedBet[];
  winnerRank?: Rank;
  loserRank?: Rank;
  className?: string;
}

const BettingBoard: React.FC<BettingBoardProps> = ({
  selectedRank,
  onSelectRank,
  placedBets,
  winnerRank,
  loserRank,
  className,
}) => {
  const betsByRank = new Map<Rank, PlacedBet[]>();
  for (const b of placedBets) {
    const existing = betsByRank.get(b.rank) || [];
    existing.push(b);
    betsByRank.set(b.rank, existing);
  }

  return (
    <section className={[styles.board, className || ''].join(' ').trim()} aria-label="Betting Board">
      <h3 className={styles.heading}>Place Your Bets</h3>
      <div className={styles.grid}>
        {ALL_RANKS.map(r => {
          const bets = betsByRank.get(r) || [];
          const totalBet = bets.reduce((sum, b) => sum + b.amount, 0);
          const hasCoppered = bets.some(b => b.coppered);
          const isSelected = selectedRank === r;
          const isWinner = winnerRank === r;
          const isLoser = loserRank === r;

          const cellClasses = [
            styles.cell,
            isSelected ? styles.selected : '',
            isWinner ? styles.winHighlight : '',
            isLoser ? styles.loseHighlight : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={r}
              className={cellClasses}
              onClick={() => onSelectRank(r)}
              aria-label={`Bet on ${RANK_LABELS[r]}${totalBet > 0 ? `, $${totalBet} placed` : ''}`}
              aria-pressed={isSelected}
            >
              <span className={styles.rankLabel}>{RANK_LABELS[r]}</span>
              {totalBet > 0 && (
                <span className={[styles.betIndicator, hasCoppered ? styles.copperIndicator : ''].join(' ').trim()}>
                  ${totalBet}{hasCoppered ? ' C' : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default BettingBoard;
