/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CasekeeperPanel from '../../../src/components/CasekeeperPanel';
import Controls from '../../../src/components/Controls';
import PlayerList from '../../../src/components/PlayerList';

expect.extend(toHaveNoViolations);

describe('basic accessibility checks', () => {
  test('CasekeeperPanel has no axe violations', async () => {
    const burnt = [{ rank: 1 }, { rank: 3 }, { rank: 3 }];
    const { container } = render(<CasekeeperPanel burnt={burnt} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Controls has no axe violations', async () => {
    const { container } = render(
      <Controls
        onNewGame={() => {}}
        onLoadSeed={() => {}}
        onUndo={() => {}}
        onOpenRules={() => {}}
        seed=""
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('PlayerList has no axe violations', async () => {
    const players = [
      { id: 'p1', name: 'Alice', bankroll: 100 },
      { id: 'p2', name: 'Bob', bankroll: 200 },
      { id: 'p3', name: 'Carol', bankroll: 300 },
    ];
    const { container } = render(
      <PlayerList players={players} currentPlayerId="p1" onSwitchPlayer={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
