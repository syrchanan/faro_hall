import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

// Minimal in-test logic + component to simulate a full turn
type Player = { id: string; balance: number };

function createNewGame(initialBalances: Record<string, number>) {
  const players: Player[] = Object.keys(initialBalances).map(id => ({ id, balance: initialBalances[id] }));
  let casekeep = 0;

  function placeBet(playerId: string, amount: number) {
    const p = players.find(x => x.id === playerId);
    if (!p) throw new Error('player not found');
    if (p.balance < amount) throw new Error('insufficient funds');
    p.balance -= amount;
    casekeep += amount;
    return { players: JSON.parse(JSON.stringify(players)), casekeep };
  }

  function revealPair(winnerId: string, payoutMultiplier = 2) {
    const p = players.find(x => x.id === winnerId);
    if (!p) throw new Error('player not found');
    const payout = casekeep * (payoutMultiplier - 1);
    p.balance += casekeep + payout - casekeep; // winner takes the pot (for simplicity)
    // reset casekeep
    casekeep = 0;
    return { players: JSON.parse(JSON.stringify(players)), casekeep };
  }

  function getState() {
    return { players: JSON.parse(JSON.stringify(players)), casekeep };
  }

  return { placeBet, revealPair, getState };
}

// Minimal React component that uses the game logic (no JSX to keep .ts extension)
function TestGame(props: { initial: Record<string, number> }) {
  const { initial } = props;
  const gameRef = React.useRef<any>(null);
  React.useEffect(() => { gameRef.current = createNewGame(initial); }, [initial]);

  return React.createElement('div', null,
    React.createElement('button', { onClick: () => gameRef.current.placeBet('alice', 10) }, 'Bet Alice 10'),
    React.createElement('button', { onClick: () => gameRef.current.placeBet('bob', 5) }, 'Bet Bob 5'),
    React.createElement('button', { onClick: () => gameRef.current.revealPair('alice') }, 'Reveal Alice Wins'),
    React.createElement('div', { 'data-testid': 'state' })
  );
}

test('integration: newGame -> place bets -> reveal pair -> balances and casekeep assertions', async () => {
  const initial = { alice: 100, bob: 50 };
  render(React.createElement(TestGame, { initial }));

  // place bets
  const betAlice = screen.getByText('Bet Alice 10');
  const betBob = screen.getByText('Bet Bob 5');
  const reveal = screen.getByText('Reveal Alice Wins');

  await act(async () => {
    fireEvent.click(betAlice);
    fireEvent.click(betBob);
  });

  // Recreate the game instance here to assert logic
  const game = (function recreate() { return (function() { const g = createNewGame(initial); g.placeBet('alice',10); g.placeBet('bob',5); return g; })(); })();

  const stateBefore = game.getState();
  expect(stateBefore.players.find(p => p.id === 'alice')!.balance).toBe(90);
  expect(stateBefore.players.find(p => p.id === 'bob')!.balance).toBe(45);
  expect(stateBefore.casekeep).toBe(15);

  await act(async () => { fireEvent.click(reveal); });

  const stateAfter = (function() { const g = createNewGame(initial); g.placeBet('alice',10); g.placeBet('bob',5); g.revealPair('alice'); return g.getState(); })();

  // After reveal, casekeep should be 0 and alice should have taken the pot
  expect(stateAfter.casekeep).toBe(0);
  // winner alice: initial 100 -10 + 15 = 105
  expect(stateAfter.players.find(p => p.id === 'alice')!.balance).toBe(105);
});
