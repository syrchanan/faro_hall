import React from 'react';
import styles from './styles/playerlist.module.css';

export interface HotseatPlayer { id: string; name: string; bankroll: number }
export interface PlayerListProps { players: HotseatPlayer[]; currentPlayerId?: string; onSwitchPlayer?: (id: string) => void; className?: string }

const initials = (name: string) => name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();

const PlayerList: React.FC<PlayerListProps> = ({ players, currentPlayerId, onSwitchPlayer, className }) => {
  return (
    <aside className={[styles.list, className||''].join(' ').trim()} aria-label="Players">
      {players.map(p => (
        <button key={p.id} className={[styles.player, p.id===currentPlayerId?styles.current:''].join(' ').trim()} onClick={() => onSwitchPlayer && onSwitchPlayer(p.id)} aria-pressed={p.id===currentPlayerId}>
          <div className={styles.avatar} aria-hidden>{initials(p.name)}</div>
          <div className={styles.info}>
            <div className={styles.name}>{p.name}</div>
            <div className={styles.bank}>{'$' + p.bankroll}</div>
          </div>
        </button>
      ))}
    </aside>
  );
};

export default PlayerList;
