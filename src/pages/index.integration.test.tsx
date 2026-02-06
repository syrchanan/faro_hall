import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import 'jest-axe/extend-expect';

// Mock Next.js router used by the page
const replaceMock = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ query: {}, replace: replaceMock })
}));

import HomePage from './index';

describe('HomePage (integration)', () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  test('place bet updates bets list and player bankroll', async () => {
    render(<HomePage />);
    const user = userEvent.setup();

    // wait for initial render
    expect(await screen.findByText(/Deck remaining:/i)).toBeInTheDocument();

    // set form values and submit — wrap interactions in act to avoid React test warnings
    const playerSelect = screen.getByLabelText(/Player:/i);
    const rankInput = screen.getByLabelText(/Rank:/i);
    const amountInput = screen.getByLabelText(/Amount:/i);
    const copperedCheckbox = screen.getByLabelText(/Coppered/i);
    const placeBtn = screen.getByRole('button', { name: /Place Bet/i });

    await act(async () => {
      await user.selectOptions(playerSelect, 'p1');
      await user.clear(rankInput);
      await user.type(rankInput, '3');
      await user.clear(amountInput);
      await user.type(amountInput, '5');
      await user.click(copperedCheckbox);
      await user.click(placeBtn);
    });

    // Bets list should contain the placed bet (uses playerId in UI)
    const betsSection = screen.getByRole('heading', { name: /Bets/i, level: 3 }).closest('div');
    const betsList = within(betsSection!).getByText(/p1 bet on rank 3 x5/i);
    expect(betsList).toBeInTheDocument();

    // Player bankroll for Alice (p1) should be reduced from 100 to 95
    expect(screen.getByText(/Alice — bankroll: 95/i)).toBeInTheDocument();
  });

  test('resolve turn clears bets and shows last turn info', async () => {
    render(<HomePage />);
    const user = userEvent.setup();

    // place a bet first (wrap interactions in act to avoid warnings)
    const amountInput = screen.getByLabelText(/Amount:/i);
    const placeBtn = screen.getByRole('button', { name: /Place Bet/i });
    await act(async () => {
      await user.clear(amountInput);
      await user.type(amountInput, '2');
      await user.click(placeBtn);
    });

    // ensure bet exists
    const betsSection = screen.getByRole('heading', { name: /Bets/i, level: 3 }).closest('div');
    expect(within(betsSection!).getAllByRole('listitem').length).toBeGreaterThan(0);

    // resolve turn (wrap in act so state updates are flushed)
    const resolveBtn = screen.getByRole('button', { name: /Resolve Turn/i });
    await act(async () => {
      await user.click(resolveBtn);
    });

    // bets cleared
    expect(within(betsSection!).queryAllByRole('listitem').length).toBe(0);

    // last turn shows winner/loser text
    expect(await screen.findByText(/Winner:/i)).toBeInTheDocument();
    expect(screen.getByText(/Loser:/i)).toBeInTheDocument();
  });

  test('export JSON triggers download with expected filename', async () => {
    render(<HomePage />);
    const user = userEvent.setup();

    // Safely mock global.URL methods and capture original object for restore
    const origURL = (global as any).URL;
    const mockedURL = { ...(origURL || {}), createObjectURL: jest.fn().mockReturnValue('blob://1'), revokeObjectURL: jest.fn() };
    (global as any).URL = mockedURL;

    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const origCreate = document.createElement.bind(document);
    let createdAnchor: HTMLAnchorElement | undefined;
    const createSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName: any) => {
      const el = origCreate(tagName);
      if (tagName === 'a') createdAnchor = el as HTMLAnchorElement;
      return el;
    });

    const exportBtn = screen.getByRole('button', { name: /Export JSON/i });
    await user.click(exportBtn);

    expect(mockedURL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(createdAnchor).toBeDefined();
    // default seed in page is demo-seed-1
    expect(createdAnchor!.download).toBe('faro-demo-seed-1.json');

    // restore spies and globals
    createSpy.mockRestore();
    clickSpy.mockRestore();
    (global as any).URL = origURL;
  });

  test('changing seed updates URL via router.replace', async () => {
    render(<HomePage />);
    const user = userEvent.setup();

    const seedInput = screen.getByLabelText(/Seed:/i);
    await act(async () => {
      await user.clear(seedInput);
      await user.type(seedInput, 'test-seed-xyz');
    });

    // new seed value set in input; effect will call router.replace
    // allow effect to run by waiting a tick
    expect(seedInput).toHaveValue('test-seed-xyz');
    // router.replace should have been called with query containing seed
    expect(replaceMock).toHaveBeenCalled();
    const calledWith = replaceMock.mock.calls[replaceMock.mock.calls.length - 1][0];
    expect(calledWith).toHaveProperty('query');
    expect(calledWith.query).toHaveProperty('seed', 'test-seed-xyz');
  });

  test('has no detectable accessibility violations', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
