import React from 'react';
import styles from './styles/chip.module.css';

export interface ChipProps { size?: number; value: number; coppered?: boolean; ariaLabel?: string; onClick?: () => void; className?: string; }

const Chip: React.FC<ChipProps> = ({ size = 40, value, coppered = false, ariaLabel, onClick, className }) => {
  const style: React.CSSProperties = { width: size, height: size };
  const label = ariaLabel || ('Chip ' + value);
  return (
    <button className={[styles.chip, coppered ? styles.copper : ''].join(' ').trim() + (className ? ' ' + className : '')} style={style} onClick={onClick} aria-label={label}>
      <span className={styles.value}>{value}</span>
    </button>
  );
};

export default Chip;
