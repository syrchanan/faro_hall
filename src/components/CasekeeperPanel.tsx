import React from 'react';
import styles from './styles/casekeeper.module.css';
import { RANK_LABELS } from '../lib/cards';

export interface CasekeeperPanelProps {
  className?: string;
  burnt?: { rank: number }[];
}

const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

function burntCountsFromArray(burnt: { rank: number }[]): number[] {
  const counts = new Array(14).fill(0);
  for (const b of burnt) {
    if (b && typeof b.rank === 'number' && b.rank >= 1 && b.rank <= 13) {
      counts[b.rank] += 1;
    }
  }
  return counts;
}

const CasekeeperPanel: React.FC<CasekeeperPanelProps> = ({ className, burnt }) => {
  const counts = burnt && burnt.length > 0
    ? burntCountsFromArray(burnt)
    : new Array(14).fill(0);

  return (
    <section
      className={[styles.panel, className || ''].join(' ').trim()}
      aria-label="Casekeeper Panel"
    >
      <div className={styles.list}>
        {RANKS.map(rank => {
          const count = counts[rank];
          const label = RANK_LABELS[rank];

          return (
            <div key={rank} data-rank={rank} className={styles.row}>
              <span className={styles.rankLabel}>{label}</span>

              <div className={styles.pips} role="group" aria-label={`${count} of 4 drawn for ${label}`}>
                {[0, 1, 2, 3].map(i => (
                  <span
                    key={i}
                    className={i < count ? styles.pipFilled : styles.pipEmpty}
                    data-pip={i < count ? 'filled' : 'empty'}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CasekeeperPanel;
