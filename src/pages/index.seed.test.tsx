import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock next/router before importing the page so the page module sees the mocked router.
jest.mock('next/router', () => ({ useRouter: jest.fn() }));

import * as nextRouter from 'next/router';
import HomePage from './index';

describe('HomePage seed handling from URL query', () => {
  afterEach(() => {
    // reset mocked implementation between tests
    (nextRouter.useRouter as jest.Mock).mockReset();
  });

  test('uses seed when query.seed is a string', () => {
    (nextRouter.useRouter as jest.Mock).mockReturnValue({ query: { seed: 'from-query' }, replace: jest.fn() });
    render(<HomePage />);
    const input = screen.getByLabelText(/Seed:/i) as HTMLInputElement;
    expect(input.value).toBe('from-query');
  });

  test('coerces non-string seed (array) to string', () => {
    (nextRouter.useRouter as jest.Mock).mockReturnValue({ query: { seed: ['a', 'b'] }, replace: jest.fn() });
    render(<HomePage />);
    const input = screen.getByLabelText(/Seed:/i) as HTMLInputElement;
    expect(input.value).toBe('a,b');
  });

  test('falls back to demo seed when no query.seed', () => {
    (nextRouter.useRouter as jest.Mock).mockReturnValue({ query: {}, replace: jest.fn() });
    render(<HomePage />);
    const input = screen.getByLabelText(/Seed:/i) as HTMLInputElement;
    expect(input.value).toBe('demo-seed-1');
  });
});
