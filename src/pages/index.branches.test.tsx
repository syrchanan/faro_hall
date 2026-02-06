import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

// We'll mock router and lib to control behavior for branch testing
let mockNewGame = jest.fn();
let mockResolveTurn = jest.fn();
let mockSerialize = jest.fn();

jest.mock('next/router', () => ({ useRouter: () => ({ query: {}, replace: jest.fn() }) }));
jest.mock('../lib', () => ({
  newGame: (...args: any[]) => mockNewGame(...args),
  placeBet: (...args: any[]) => undefined,
  resolveTurn: (...args: any[]) => mockResolveTurn(...args),
  serializeGameState: (...args: any[]) => mockSerialize(...args),
  deserializeGameState: (...args: any[]) => undefined,
}));

const HomePage = require('./index').default as React.ComponentType;

// Save originals to restore between tests
const ORIGINAL_URL_CREATE = URL.createObjectURL;
const ORIGINAL_URL_REVOKE = URL.revokeObjectURL;
const ORIGINAL_BODY_CONTAINS = document.body.contains;

afterEach(() => {
  // unmount any mounted trees and clear mocks
  cleanup();
  jest.clearAllMocks();
  // restore globals
  // @ts-ignore
  URL.createObjectURL = ORIGINAL_URL_CREATE;
  // @ts-ignore
  URL.revokeObjectURL = ORIGINAL_URL_REVOKE;
  document.body.contains = ORIGINAL_BODY_CONTAINS;
});

describe('HomePage branch coverage tests', () => {
  test('exportState revokes URL and removes anchor when body.contains is true', async () => {
    const createMock = jest.fn(() => 'blob:1');
    const revokeMock = jest.fn();
    // @ts-ignore
    global.URL.createObjectURL = createMock;
    // @ts-ignore
    global.URL.revokeObjectURL = revokeMock;

    // make sure newGame returns a valid state so exportState runs
    mockNewGame = jest.fn(() => ({
      seed: 's', deck: [1,2,3], burnt: [], bets: [], players: [{ id: 'p1', name: 'A', bankroll: 1 }]
    }));
    mockSerialize = jest.fn(() => '{"ok":true}');

    const appendSpy = jest.spyOn(document.body, 'appendChild');
    const removeSpy = jest.spyOn(document.body, 'removeChild');

    render(<HomePage />);
    const exportBtn = screen.getByRole('button', { name: /Export JSON/i });

    // ensure document.body.contains returns true for the created anchor
    const origContains = document.body.contains;
    document.body.contains = (n: Node) => true;

    fireEvent.click(exportBtn);

    await waitFor(() => expect(createMock).toHaveBeenCalled());
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(revokeMock).toHaveBeenCalled();

    // restore
    document.body.contains = origContains;
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  test('exportState does not call removeChild when body.contains is false', async () => {
    const createMock = jest.fn(() => 'blob:2');
    const revokeMock = jest.fn();
    // @ts-ignore
    global.URL.createObjectURL = createMock;
    // @ts-ignore
    global.URL.revokeObjectURL = revokeMock;

    mockNewGame = jest.fn(() => ({
      seed: 's', deck: [1], burnt: [], bets: [], players: [{ id: 'p1', name: 'A', bankroll: 1 }]
    }));
    mockSerialize = jest.fn(() => '{}');

    const appendSpy = jest.spyOn(document.body, 'appendChild');
    const removeSpy = jest.spyOn(document.body, 'removeChild');

    render(<HomePage />);
    const exportBtn = screen.getByRole('button', { name: /Export JSON/i });

    // simulate contains false
    const origContains = document.body.contains;
    document.body.contains = (n: Node) => false;

    fireEvent.click(exportBtn);

    await waitFor(() => expect(createMock).toHaveBeenCalled());
    expect(appendSpy).toHaveBeenCalled();
    // removeChild should NOT be called when contains is false
    expect(removeSpy).not.toHaveBeenCalled();
    expect(revokeMock).toHaveBeenCalled();

    document.body.contains = origContains;
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  test('lastTurn shows winner or loser as n/a when respective card is missing', async () => {
    // Setup a state so the page renders
    mockNewGame = jest.fn(() => ({
      seed: 's', deck: [1,2], burnt: [], bets: [], players: [{ id: 'p1', name: 'A', bankroll: 1 }]
    }));

    // Case 1: resolveTurn returns winner null, loser present
    mockResolveTurn = jest.fn(() => ({ state: mockNewGame(), winnerCard: null, loserCard: { rank: 'K', suit: 'Hearts' } }));
    render(<HomePage />);
    const resolveBtn = screen.getByRole('button', { name: /Resolve Turn/i });
    fireEvent.click(resolveBtn);

    await waitFor(() => expect(screen.queryByText(/No turns yet/i)).not.toBeInTheDocument());
    expect(screen.getByText(/Loser:/i)).toBeInTheDocument();
    // winner should be displayed as 'n/a'
    expect(screen.getByText(/Winner:/i)).toHaveTextContent(/n\/a/i);

    // unmount and prepare next case by clearing DOM
    cleanup();
    jest.clearAllMocks();

    // Case 2: resolveTurn returns loser null, winner present
    mockNewGame = jest.fn(() => ({
      seed: 's2', deck: [1,2,3], burnt: [], bets: [], players: [{ id: 'p1', name: 'B', bankroll: 1 }]
    }));
    mockResolveTurn = jest.fn(() => ({ state: mockNewGame(), winnerCard: { rank: 'A', suit: 'Spades' }, loserCard: null }));

    render(<HomePage />);
    const resolveBtn2 = screen.getByRole('button', { name: /Resolve Turn/i });
    fireEvent.click(resolveBtn2);

    await waitFor(() => expect(screen.queryByText(/No turns yet/i)).not.toBeInTheDocument());
    // loser should be 'n/a'
    expect(screen.getByText(/Loser:/i)).toHaveTextContent(/n\/a/i);
    expect(screen.getByText(/Winner:/i)).toBeInTheDocument();
  });
});
