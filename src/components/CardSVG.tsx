import React from 'react';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export interface CardModel { rank: string; suit: Suit; }
export interface CardSVGProps { card: CardModel; size?: number; className?: string; }

const suitPaths: Record<Suit, string> = {
  hearts: 'M12 21s-6-4.35-9-7.5C-1 10 4 4 8 4c2.2 0 3.5 1.2 4 2 0.5-.8 1.8-2 4-2 4 0 9 6 5 9.5-3 3.15-9 7.5-9 7.5z',
  diamonds: 'M12 2l10 14-10 10L2 16 12 2z',
  clubs: 'M12 6a3 3 0 1 0-3 3 3 3 0 0 0 3-3zm6 8a3 3 0 1 0-3 3 3 3 0 0 0 3-3zM6 14a3 3 0 1 0-3 3 3 3 0 0 0 3-3z',
  spades: 'M12 2s-8 8-9 12c-1 4 4 6 9 8 5-2 10-4 9-8-1-4-9-12-9-12z',
};

const CardSVG: React.FC<CardSVGProps> = ({ card, size = 120, className }) => {
  const { rank, suit } = card;
  const w = size;
  const h = Math.round(size * 1.4);
  const isRed = suit === 'hearts' || suit === 'diamonds';
  return (
    <svg width={w} height={h} viewBox="0 0 24 34" role="img" aria-label={rank + ' of ' + suit} className={className} tabIndex={0}>
      <defs>
        <style>{'.rank{font-family: Arial, sans-serif; font-size:6px; font-weight:700;} '}</style>
      </defs>
      <rect x={0.5} y={0.5} width={23} height={33} rx={2} ry={2} fill="#fff" stroke="#000" />
      <text x={2} y={7} className="rank" fill={isRed ? '#c00' : '#000'}>{rank}</text>
      <path d={suitPaths[suit]} transform="translate(6,10) scale(0.9)" fill={isRed ? '#c00' : '#000'} aria-hidden="true" />
    </svg>
  );
};

export default CardSVG;
