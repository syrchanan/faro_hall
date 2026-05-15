import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const replaceMock = jest.fn();
const pushMock = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({ query: {}, replace: replaceMock, isReady: true, push: pushMock }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

import HomePage from '../../pages/index';

afterEach(() => {
  replaceMock.mockClear();
  pushMock.mockClear();
});

describe('Game page chip values', () => {
  test('renders chips 1, 10, and 100', () => {
    render(<HomePage />);
    expect(screen.getByLabelText('$1 chip')).toBeInTheDocument();
    expect(screen.getByLabelText('$10 chip')).toBeInTheDocument();
    expect(screen.getByLabelText('$100 chip')).toBeInTheDocument();
  });

  test('does not render removed chip values (5, 25, 50)', () => {
    render(<HomePage />);
    expect(screen.queryByLabelText('$5 chip')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('$25 chip')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('$50 chip')).not.toBeInTheDocument();
  });

  test('X chip is present and acts as a button', () => {
    render(<HomePage />);
    const xChip = screen.getByLabelText('Custom bet amount');
    expect(xChip.tagName).toBe('BUTTON');
  });
});

describe('Game page custom bet chip', () => {
  test('clicking X chip shows custom amount input', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByLabelText('Custom bet amount'));
    expect(screen.getByLabelText('Custom bet amount input')).toBeInTheDocument();
  });

  test('entering amount via X chip input shows a custom chip', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByLabelText('Custom bet amount'));
    const input = screen.getByLabelText('Custom bet amount input');
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByLabelText('$42 custom chip')).toBeInTheDocument();
  });

  test('clicking X chip again clears the custom chip', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByLabelText('Custom bet amount'));
    const input = screen.getByLabelText('Custom bet amount input');
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByLabelText('$42 custom chip')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Custom bet amount'));
    expect(screen.queryByLabelText('$42 custom chip')).not.toBeInTheDocument();
  });
});

describe('Game page header', () => {
  test('SeedShare import/export is not present in the header', () => {
    render(<HomePage />);
    expect(screen.queryByLabelText('Seed Share')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Import seed')).not.toBeInTheDocument();
  });
});
