import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// We'll use mock variables so tests can adjust behavior without resetting modules
let newGameMock = jest.fn();
let placeBetMock = jest.fn();
let resolveTurnMock = jest.fn();
let serializeMock = jest.fn();
let deserializeMock = jest.fn();

jest.mock('next/router', () => ({ useRouter: () => ({ query: {}, replace: jest.fn() }) }));
jest.mock('../lib', () => ({
  newGame: (...args: any[]) => newGameMock(...args),
  placeBet: (...args: any[]) => placeBetMock(...args),
  resolveTurn: (...args: any[]) => resolveTurnMock(...args),
  serializeGameState: (...args: any[]) => serializeMock(...args),
  deserializeGameState: (...args: any[]) => deserializeMock(...args),
}));

const HomePage = require('./index').default as React.ComponentType;

afterEach(() => {
  jest.clearAllMocks();
});

describe('HomePage error/edge branches', () => {
  test('shows Loading... when newGame throws during initialization', async () => {
    newGameMock = jest.fn(() => { throw new Error('init failure'); });

    render(<HomePage />);

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('alerts when placeBet throws', async () => {
    // Use the real newGame behavior (default mock returns undefined -> component may handle),
    // but ensure placeBet throws when called.
    newGameMock = jest.fn(() => {
      // Provide a minimal valid game state so component renders and place bet button exists
      return {
        seed: 's',
        deck: [],
        burnt: [],
        bets: [],
        players: [{ id: 'p1', name: 'Alice', bankroll: 100 }]
      };
    });
    placeBetMock = jest.fn(() => { throw new Error('bet failed'); });

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<HomePage />);

    const placeBtn = screen.getByRole('button', { name: /Place Bet/i });
    fireEvent.click(placeBtn);

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());

    alertSpy.mockRestore();
  });
});
