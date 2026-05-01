import React from 'react';
import CardSVG, { CardModel } from './CardSVG';
import Chip from './Chip';
import CasekeeperPanel from './CasekeeperPanel';

export interface PlayerView { id: string; name: string; bankroll: number; avatar?: string }
export interface GameState { players: PlayerView[]; publicCards: CardModel[]; pot: number; burnt: { rank: number }[]; currentPlayerIndex?: number; seedUrl?: string }
export interface TableProps { gameState: GameState; onPlaceBet: (amount: number) => void; onStartTurn: () => void; onRevealNext: () => void; className?: string }

const Table: React.FC<TableProps> = ({ gameState, onPlaceBet, onStartTurn, onRevealNext, className }) => {
  return (
    <main className={className} aria-label="Faro Table">
      <section aria-label="Public Cards">
        {gameState.publicCards.map((c,i) => <CardSVG key={i} card={c} size={96} />)}
      </section>
      <section aria-label="Pot">
        <Chip value={gameState.pot} />
      </section>
      <CasekeeperPanel burnt={gameState.burnt} />
      <div>
        <button onClick={() => onPlaceBet(1)}>Bet 1</button>
        <button onClick={() => onPlaceBet(5)}>Bet 5</button>
        <button onClick={onStartTurn}>Start Turn</button>
        <button onClick={onRevealNext}>Reveal Next</button>
      </div>
    </main>
  );
};

export default Table;
