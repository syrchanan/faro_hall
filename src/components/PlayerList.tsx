import React, { useState } from 'react';
import styles from './styles/playerlist.module.css';

export interface HotseatPlayer {
  id: string;
  name: string;
  bankroll: number;
  startingBankroll?: number;
}

export interface PlayerListProps {
  players: HotseatPlayer[];
  currentPlayerId?: string;
  onSwitchPlayer?: (id: string) => void;
  onAddPlayer?: () => void;
  onRemovePlayer?: (id: string) => void;
  onRenamePlayer?: (id: string, name: string) => void;
  className?: string;
}

const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayerId,
  onSwitchPlayer,
  onAddPlayer,
  onRemovePlayer,
  onRenamePlayer,
  className,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (p: HotseatPlayer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(p.id);
    setEditValue(p.name);
  };

  const commitEdit = (id: string) => {
    const trimmed = editValue.trim();
    if (trimmed && onRenamePlayer) onRenamePlayer(id, trimmed);
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <aside className={[styles.list, className || ''].join(' ').trim()} aria-label="Players">
      {players.map(p => {
        const net = p.startingBankroll !== undefined ? p.bankroll - p.startingBankroll : 0;
        const netSign = net > 0 ? '+' : '';
        const isCurrent = p.id === currentPlayerId;
        const isEditing = editingId === p.id;

        return (
          <div
            key={p.id}
            className={[styles.player, isCurrent ? styles.current : ''].join(' ').trim()}
          >
            <button
              className={styles.playerMain}
              onClick={() => onSwitchPlayer && onSwitchPlayer(p.id)}
              aria-pressed={isCurrent}
            >
              <div className={styles.avatar} aria-hidden>{initials(p.name)}</div>
              <div className={styles.info}>
                {isEditing ? (
                  <input
                    className={styles.nameInput}
                    value={editValue}
                    autoFocus
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => commitEdit(p.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitEdit(p.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    onClick={e => e.stopPropagation()}
                    aria-label="Player name"
                  />
                ) : (
                  <div className={styles.name}>{p.name}</div>
                )}
                <div className={styles.bankRow}>
                  <span className={styles.bank}>${p.bankroll}</span>
                  {net !== 0 && (
                    <span className={net >= 0 ? styles.netPos : styles.netNeg}>
                      {netSign}{net}
                    </span>
                  )}
                </div>
              </div>
            </button>

            <div className={styles.actions}>
              {onRenamePlayer && !isEditing && (
                <button
                  className={styles.actionBtn}
                  onClick={e => startEdit(p, e)}
                  title="Rename player"
                  aria-label={`Rename ${p.name}`}
                >
                  ✎
                </button>
              )}
              {onRemovePlayer && (
                <button
                  className={styles.actionBtn}
                  onClick={e => { e.stopPropagation(); onRemovePlayer(p.id); }}
                  title="Remove player"
                  aria-label={`Remove ${p.name}`}
                  disabled={players.length <= 1}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        );
      })}

      {onAddPlayer && (
        <button className={styles.addBtn} onClick={onAddPlayer} aria-label="Add player">
          + Add Player
        </button>
      )}
    </aside>
  );
};

export default PlayerList;
