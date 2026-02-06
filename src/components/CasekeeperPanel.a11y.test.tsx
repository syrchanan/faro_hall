import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CasekeeperPanel from './CasekeeperPanel';

expect.extend(toHaveNoViolations as any);

describe('CasekeeperPanel accessibility & responsive behavior', () => {
  const burnt = [ { rank: 3 }, { rank: 3 }, { rank: 5 } ];

  test('has no automated accessibility violations', async () => {
    const { container } = render(<CasekeeperPanel burnt={burnt as any} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('adjusts grid columns based on viewport width', async () => {
    // small screen
    (global as any).innerWidth = 500;
    const { container } = render(<CasekeeperPanel burnt={burnt as any} />);
    // the grid element is the first div with a grid style
    const grid = container.querySelector('div[style*="grid-template-columns"]') as HTMLElement | null;
    expect(grid).not.toBeNull();
    expect(grid!.style.gridTemplateColumns).toContain('repeat(4');

    // now simulate resize to larger screen
    (global as any).innerWidth = 1024;
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      // after resize effect runs, columns should switch to 7
      const g = container.querySelector('div[style*="grid-template-columns"]') as HTMLElement | null;
      expect(g).not.toBeNull();
      expect(g!.style.gridTemplateColumns).toContain('repeat(7');
    });
  });
});
