import React, { useEffect, useState } from 'react';
import styles from './styles/casekeeper.module.css';

export interface CasekeeperState { [rank: string]: { remaining: number; hock?: boolean; soda?: boolean } }
export interface CasekeeperPanelProps { state?: CasekeeperState; onToggleMarker?: (rank: string, marker: 'hock'|'soda') => void; className?: string; burnt?: any[]; }

const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

const CasekeeperPanel: React.FC<CasekeeperPanelProps> = ({ state, onToggleMarker, className, burnt }) => {
  // Compute counts from burnt prop (array of objects with rank numbers 1-13) if provided, otherwise use state
  const burntCounts = React.useMemo(() => {
    const counts: number[] = new Array(13).fill(0);
    if (Array.isArray(burnt)) {
      for (const b of burnt) {
        if (!b || typeof b.rank !== 'number') continue;
        const idx = Math.min(Math.max(1, b.rank), 13) - 1;
        counts[idx] += 1;
      }
    }
    return counts;
  }, [burnt]);

  // Toggle state for markers when onToggleMarker isn't provided or for immediate UI feedback
  const [markers, setMarkers] = useState<Record<number, { hock: boolean; soda: boolean }>>(() => {
    const init: Record<number, { hock: boolean; soda: boolean }> = {};
    // initialize from provided state if available
    if (state) {
      ranks.forEach((r, i) => {
        const key = r;
        const s = (state as any)[key] || { remaining: 0, hock: false, soda: false };
        init[i] = { hock: !!s.hock, soda: !!s.soda };
      });
    }
    return init;
  });

  useEffect(() => {
    // ensure markers has keys for all ranks
    setMarkers(prev => {
      const next = { ...prev } as Record<number, { hock: boolean; soda: boolean }>;
      ranks.forEach((_, i) => {
        if (!next[i]) next[i] = { hock: false, soda: false };
      });
      return next;
    });
  }, []);

  // responsive columns (tests expect 4 columns at small width, 7 at large)
  const [cols, setCols] = useState<number>(() => (typeof (global as any).innerWidth === 'number' && (global as any).innerWidth >= 600 ? 7 : 4));
  useEffect(() => {
    const onResize = () => {
      const w = (global as any).innerWidth || window.innerWidth;
      setCols(w >= 600 ? 7 : 4);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggle = (idx: number, marker: 'hock'|'soda') => {
    setMarkers(prev => {
      const cur = prev[idx] || { hock: false, soda: false };
      const next = { ...prev, [idx]: { ...cur, [marker]: !cur[marker] } };
      return next;
    });
    if (onToggleMarker) {
      const rankLabel = String(idx + 1);
      onToggleMarker(rankLabel, marker);
    }
  };

  return (
    <section className={[styles.panel, className || ''].join(' ').trim()} aria-label='Casekeeper Panel'>
      <h3 className={styles.heading}>Casekeeper</h3>
      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {ranks.map((r, i) => {
          const s = (state && (state as any)[r]) || { remaining: 0, hock: false, soda: false };
          const count = burnt && burnt.length ? burntCounts[i] : (s && s.remaining) || 0;
          const m = markers[i] || { hock: !!s.hock, soda: !!s.soda };
          return (
            <div key={r} className={styles.cell}>
              <div className={styles.rank}>{'#' + String(i + 1)}</div>
              <div className={styles.count} aria-live='polite'>{count}</div>
              <div className={styles.markers}>
                <button aria-pressed={m.hock} aria-label={'Toggle hock for rank ' + String(i + 1)} onClick={() => toggle(i, 'hock')} className={m.hock ? styles.on : ''}>H</button>
                <button aria-pressed={m.soda} aria-label={'Toggle soda for rank ' + String(i + 1)} onClick={() => toggle(i, 'soda')} className={m.soda ? styles.on : ''}>S</button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CasekeeperPanel;
