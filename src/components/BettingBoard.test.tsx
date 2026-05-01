import React from 'react';
import { render, screen } from '@testing-library/react';
import BettingBoard from './BettingBoard';
import { Rank } from '../lib/cards';

const noop = () => {};

describe('BettingBoard layout zones', () => {
  test('renders a bet zone covering ranks 6, 7, and 8 (three-way end zone)', () => {
    render(<BettingBoard onBet={noop} placedBets={[]} />);
    // The zone aria-label uses rank labels joined by " & "
    // Ranks: 6='6', 7='7', 8='8' — order may vary so check all three are present
    const zones = screen.getAllByRole('button');
    const threeWay = zones.find(btn => {
      const label = btn.getAttribute('aria-label') ?? '';
      return label.includes('6') && label.includes('7') && label.includes('8');
    });
    expect(threeWay).toBeDefined();
  });

  test('renders single-rank bet buttons for all 13 ranks', () => {
    render(<BettingBoard onBet={noop} placedBets={[]} />);
    const labels = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    for (const lbl of labels) {
      // single-rank card buttons have aria-label "Bet on X"
      const btn = screen.getAllByRole('button').find(b =>
        (b.getAttribute('aria-label') ?? '').startsWith(`Bet on ${lbl}`) &&
        !(b.getAttribute('aria-label') ?? '').includes('&')
      );
      expect(btn).toBeDefined();
    }
  });

  test('winner and loser card buttons are present and clickable', () => {
    const onBet = jest.fn();
    render(
      <BettingBoard
        onBet={onBet}
        placedBets={[]}
        winnerRank={3 as any}
        loserRank={7 as any}
      />
    );
    const allBtns = screen.getAllByRole('button');
    const winBtn = allBtns.find(b => b.getAttribute('aria-label') === 'Bet on 3');
    const loseBtn = allBtns.find(b => b.getAttribute('aria-label') === 'Bet on 7');
    expect(winBtn).toBeDefined();
    expect(loseBtn).toBeDefined();
    winBtn!.click();
    expect(onBet).toHaveBeenCalledWith([3]);
  });
});

describe('BettingBoard per-player bet differentiation', () => {
  test('shows separate chips for each player when multiple players bet on the same rank', () => {
    const { container } = render(
      <BettingBoard
        onBet={noop}
        placedBets={[
          { ranks: [7 as Rank], amount: 10, playerId: 'p1' },
          { ranks: [7 as Rank], amount: 20, playerId: 'p2' },
        ]}
        players={[
          { id: 'p1', name: 'Alice', bankroll: 100 },
          { id: 'p2', name: 'Bob', bankroll: 100 },
        ]}
      />
    );
    expect(container.querySelector('[data-player-id="p1"]')).toBeTruthy();
    expect(container.querySelector('[data-player-id="p2"]')).toBeTruthy();
  });

  test('shows a single chip when only one player has bet on a rank', () => {
    const { container } = render(
      <BettingBoard
        onBet={noop}
        placedBets={[{ ranks: [5 as Rank], amount: 15, playerId: 'p1' }]}
        players={[{ id: 'p1', name: 'Alice', bankroll: 100 }]}
      />
    );
    expect(container.querySelectorAll('[data-player-id="p1"]').length).toBe(1);
    expect(container.querySelector('[data-player-id="p2"]')).toBeNull();
  });
});
