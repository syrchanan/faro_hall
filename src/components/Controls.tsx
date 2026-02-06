import React, { useState } from 'react';
import styles from './styles/controls.module.css';

export interface ControlsProps { onNewGame: () => void; onLoadSeed: (seed: string) => void; onUndo: () => void; onOpenRules: () => void; seed?: string }

export const useControls = () => { const [rulesOpen, setRulesOpen] = useState(false); return { rulesOpen, openRules: () => setRulesOpen(true), closeRules: () => setRulesOpen(false) }; };

const Controls: React.FC<ControlsProps> = ({ onNewGame, onLoadSeed, onUndo, onOpenRules, seed }) => {
  const [input, setInput] = useState('');
  return (
    <div className={styles.controls} role="toolbar" aria-label="Game Controls">
      <button onClick={onNewGame}>New Game</button>
      <button onClick={() => onLoadSeed(input)}>Load Seed</button>
      <input aria-label="Seed input" value={input} onChange={e=>setInput(e.target.value)} />
      <button onClick={onUndo}>Undo</button>
      <button onClick={onOpenRules}>Rules</button>
    </div>
  );
};

export default Controls;
