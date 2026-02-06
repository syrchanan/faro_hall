import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CasekeeperPanel from './CasekeeperPanel';

describe('CasekeeperPanel', () => {
  test('renders 13 rank cells and shows counts from burnt cards and toggles hock/soda', () => {
    const burnt = [
      { rank: 1 },
      { rank: 3 },
      { rank: 3 },
      { rank: 13 },
    ];

    const { getByText, getAllByText, getByLabelText } = render(<CasekeeperPanel burnt={burnt} />);

    // There should be labels for several ranks
    expect(getByText('#1')).toBeTruthy();
    expect(getByText('#3')).toBeTruthy();
    expect(getByText('#13')).toBeTruthy();

    // Counts should reflect burnt array (rank 3 has 2)
    const rank3count = getAllByText('2')[0];
    expect(rank3count).toBeTruthy();

    // Toggle hock for rank 3
    const hockBtn = getByLabelText('Toggle hock for rank 3') as HTMLButtonElement;
    fireEvent.click(hockBtn);
    expect(hockBtn.getAttribute('aria-pressed')).toBe('true');

    // Toggle soda for rank 3
    const sodaBtn = getByLabelText('Toggle soda for rank 3') as HTMLButtonElement;
    fireEvent.click(sodaBtn);
    expect(sodaBtn.getAttribute('aria-pressed')).toBe('true');
  });
});
