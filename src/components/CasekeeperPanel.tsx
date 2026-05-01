import React, { useState } from 'react';
import styles from './styles/casekeeper.module.css';

export interface CasekeeperState { [rank: string]: { remaining: number; hock?: boolean; soda?: boolean } }
export interface CasekeeperPanelProps {
  state?: CasekeeperState;
  onToggleMarker?: (rank: string, marker: 'hock' | 'soda') => void;
  className?: string;
  burnt?: { rank: number }[];
}

const RANK_LABELS: Record<number, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K',
};

const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

type MarkerMap = Record<number, { hock: boolean; soda: boolean }>;

function initMarkers(): MarkerMap {
  const m: MarkerMap = {};
  for (const r of RANKS) m[r] = { hock: false, soda: false };
  return m;
}

function burntCountsFromArray(burnt: { rank: number }[]): number[] {
  const counts = new Array(14).fill(0);
  for (const b of burnt) {
    if (b && typeof b.rank === 'number' && b.rank >= 1 && b.rank <= 13) {
      counts[b.rank] += 1;
    }
  }
  return counts;
}

const CasekeeperPanel: React.FC<CasekeeperPanelProps> = ({
  state,
  onToggleMarker,
  className,
  burnt,
}) => {
  const [markers, setMarkers] = useState<MarkerMap>(initMarkers);

  const counts = burnt && burnt.length > 0
    ? burntCountsFromArray(burnt)
    : new Array(14).fill(0);

  const toggle = (rank: number, marker: 'hock' | 'soda') => {
    setMarkers(prev => ({
      ...prev,
      [rank]: { ...prev[rank], [marker]: !prev[rank][marker] },
    }));
    onToggleMarker?.(String(rank), marker);
  };

  return (
    <section
      className={[styles.panel, className || ''].join(' ').trim()}
      aria-label="Casekeeper Panel"
    >
      <div className={styles.list}>
        {RANKS.map(rank => {
          const count = counts[rank];
          const m = markers[rank];
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

              <div className={styles.markerBtns}>
                <button
                  aria-pressed={m.hock}
                  aria-label={`Mark ${label} as Hock (last card)`}
                  title={`Hock — mark ${label} as the last card (no bets resolve)`}
                  className={m.hock ? styles.markerOn : styles.marker}
                  onClick={() => toggle(rank, 'hock')}
                >
                  H
                </button>
                <button
                  aria-pressed={m.soda}
                  aria-label={`Mark ${label} as Soda (first card)`}
                  title={`Soda — mark ${label} as the opening card (no bets resolve)`}
                  className={m.soda ? styles.markerOn : styles.marker}
                  onClick={() => toggle(rank, 'soda')}
                >
                  S
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CasekeeperPanel;
