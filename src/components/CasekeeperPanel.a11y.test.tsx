import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CasekeeperPanel from './CasekeeperPanel';

expect.extend(toHaveNoViolations as any);

describe('CasekeeperPanel accessibility', () => {
  const burnt = [{ rank: 3 }, { rank: 3 }, { rank: 5 }];

  test('has no automated accessibility violations', async () => {
    const { container } = render(<CasekeeperPanel burnt={burnt as any} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('renders as a single flat list — one row per rank, no responsive grid columns', () => {
    const { container } = render(<CasekeeperPanel burnt={burnt as any} />);
    const rows = container.querySelectorAll('[data-rank]');
    expect(rows.length).toBe(13);
    // no inline grid-template-columns style (removed responsive grid)
    const inlineGridEl = container.querySelector('[style*="grid-template-columns"]');
    expect(inlineGridEl).toBeNull();
  });

  test('rank rows have no interactive buttons — H/S markers removed', () => {
    const { container } = render(<CasekeeperPanel burnt={[]} />);
    for (let rank = 1; rank <= 13; rank++) {
      const cell = container.querySelector(`[data-rank="${rank}"]`)!;
      expect(cell).not.toBeNull();
      const buttons = cell.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    }
  });
});
