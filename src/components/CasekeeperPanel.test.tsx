import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CasekeeperPanel from './CasekeeperPanel';

describe('CasekeeperPanel', () => {
  test('displays rank labels as A, 2-10, J, Q, K — not #N notation', () => {
    const { container } = render(<CasekeeperPanel burnt={[]} />);
    const cells = container.querySelectorAll('[data-rank]');
    expect(cells.length).toBe(13);

    const ace = container.querySelector('[data-rank="1"]')!;
    expect(ace.textContent).toContain('A');
    expect(ace.textContent).not.toContain('#1');

    const jack = container.querySelector('[data-rank="11"]')!;
    expect(jack.textContent).toContain('J');

    const queen = container.querySelector('[data-rank="12"]')!;
    expect(queen.textContent).toContain('Q');

    const king = container.querySelector('[data-rank="13"]')!;
    expect(king.textContent).toContain('K');
  });

  test('renders exactly 4 pip indicators per rank cell', () => {
    const { container } = render(<CasekeeperPanel burnt={[]} />);
    const cells = container.querySelectorAll('[data-rank]');
    cells.forEach(cell => {
      const pips = cell.querySelectorAll('[data-pip]');
      expect(pips.length).toBe(4);
    });
  });

  test('fills pips matching the burnt count for each rank', () => {
    const burnt = [
      { rank: 1 }, { rank: 1 },       // 2 burnt for A
      { rank: 3 },                      // 1 burnt for 3
      { rank: 13 }, { rank: 13 }, { rank: 13 }, { rank: 13 }, // 4 burnt for K
    ];
    const { container } = render(<CasekeeperPanel burnt={burnt as any} />);

    const aceFilled = container.querySelectorAll('[data-rank="1"] [data-pip="filled"]');
    const aceEmpty  = container.querySelectorAll('[data-rank="1"] [data-pip="empty"]');
    expect(aceFilled.length).toBe(2);
    expect(aceEmpty.length).toBe(2);

    const threeFilled = container.querySelectorAll('[data-rank="3"] [data-pip="filled"]');
    const threeEmpty  = container.querySelectorAll('[data-rank="3"] [data-pip="empty"]');
    expect(threeFilled.length).toBe(1);
    expect(threeEmpty.length).toBe(3);

    // all 4 drawn — no empty pips
    const kingFilled = container.querySelectorAll('[data-rank="13"] [data-pip="filled"]');
    const kingEmpty  = container.querySelectorAll('[data-rank="13"] [data-pip="empty"]');
    expect(kingFilled.length).toBe(4);
    expect(kingEmpty.length).toBe(0);
  });

  test('does not render H (hock) or S (soda) marker buttons — removed as non-functional', () => {
    const { container } = render(<CasekeeperPanel burnt={[]} />);
    const hockBtns = container.querySelectorAll('[aria-label*="Hock"]');
    const sodaBtns = container.querySelectorAll('[aria-label*="Soda"]');
    expect(hockBtns.length).toBe(0);
    expect(sodaBtns.length).toBe(0);
  });
});
