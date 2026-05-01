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

  test('every rank row has hock and soda toggle buttons with correct aria attributes', () => {
    const RANK_LABELS: Record<number, string> = {
      1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
      8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K',
    };
    const { container } = render(<CasekeeperPanel burnt={[]} />);
    for (let rank = 1; rank <= 13; rank++) {
      const label = RANK_LABELS[rank];
      const cell = container.querySelector(`[data-rank="${rank}"]`)!;
      expect(cell).not.toBeNull();
      const buttons = cell.querySelectorAll('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].getAttribute('aria-label')).toBe(`Mark ${label} as Hock (last card)`);
      expect(buttons[1].getAttribute('aria-label')).toBe(`Mark ${label} as Soda (first card)`);
      expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
      expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
    }
  });
});
