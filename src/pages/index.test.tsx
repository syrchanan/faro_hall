import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from './index';

// Mock next/router to control query and replace
const replaceMock = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ query: {}, replace: replaceMock })
}));

// Mock createObjectURL / revokeObjectURL used by exportState
const createObjectURLMock = jest.fn(() => 'blob:url');
const revokeObjectURLMock = jest.fn();

describe('HomePage (focused RTL tests)', () => {
  beforeAll(() => {
    // define on global URL
    // @ts-ignore
    global.URL.createObjectURL = createObjectURLMock;
    // @ts-ignore
    global.URL.revokeObjectURL = revokeObjectURLMock;
  });

  afterEach(() => {
    replaceMock.mockClear();
    createObjectURLMock.mockClear();
    revokeObjectURLMock.mockClear();
  });

  test('renders initial UI and seed controls', () => {
    render(<HomePage />);
    expect(screen.getByText(/Faro Hall/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Seed:/i)).toBeInTheDocument();
  });

  test('changing seed calls router.replace (shallow) via effect', async () => {
    render(<HomePage />);
    const seedInput = screen.getByLabelText(/Seed:/i) as HTMLInputElement;
    fireEvent.change(seedInput, { target: { value: 'my-seed-xyz' } });
    // effect runs asynchronously; wait for the replace to be called
    await waitFor(() => expect(replaceMock).toHaveBeenCalled());
  });

  test('resolving a turn updates Last Turn display', async () => {
    render(<HomePage />);
    // initially there should be "No turns yet"
    expect(screen.getByText(/No turns yet/i)).toBeInTheDocument();
    const resolveBtn = screen.getByRole('button', { name: /Resolve Turn/i });
    fireEvent.click(resolveBtn);
    // after resolving, last turn winner/loser should appear (non-empty)
    await waitFor(() => expect(screen.queryByText(/No turns yet/i)).not.toBeInTheDocument());
    expect(screen.getByText(/Loser:/i)).toBeInTheDocument();
    expect(screen.getByText(/Winner:/i)).toBeInTheDocument();
  });

  test('exportState triggers download link creation and click', () => {
    // spy on document.createElement to capture anchor click
    const originalCreateElement = document.createElement;
    const clickMock = jest.fn();
    document.createElement = ((tagName: string) => {
      const el = originalCreateElement.call(document, tagName);
      if (tagName === 'a') {
        // @ts-ignore
        el.click = clickMock;
      }
      return el;
    }) as typeof document.createElement;

    render(<HomePage />);
    const exportBtn = screen.getByRole('button', { name: /Export JSON/i });
    fireEvent.click(exportBtn);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();

    // restore
    document.createElement = originalCreateElement;
  });
});

test('New Seed and Reset buttons update seed input and call router.replace', async () => {
  render(<HomePage />);
  const seedInput = screen.getByLabelText(/Seed:/i) as HTMLInputElement;
  const newSeedBtn = screen.getByRole('button', { name: /New Seed/i });
  const resetBtn = screen.getByRole('button', { name: /Reset to Demo Seed/i });
  const oldValue = seedInput.value;
  fireEvent.click(newSeedBtn);
  // New seed should change the input value
  expect(seedInput.value).not.toBe(oldValue);
  fireEvent.click(resetBtn);
  expect(seedInput.value).toBe('demo-seed-1');
  // router.replace should have been called by the effect when seed changed
  await waitFor(() => expect(replaceMock).toHaveBeenCalled());
});

// Additional test: ensure exportState appends/removes anchor and revokes URL with sanitized filename
test('exportState appends anchor with sanitized filename, then removes it and revokes URL', async () => {
  const appendSpy = jest.spyOn(document.body, 'appendChild');
  const removeSpy = jest.spyOn(document.body, 'removeChild');

  render(<HomePage />);
  const seedInput = screen.getByLabelText(/Seed:/i) as HTMLInputElement;
  // set a seed containing characters that should be sanitized
  fireEvent.change(seedInput, { target: { value: 'weird/seed:123' } });

  const exportBtn = screen.getByRole('button', { name: /Export JSON/i });
  fireEvent.click(exportBtn);

  await waitFor(() => expect(appendSpy).toHaveBeenCalled());
  // find the anchor element among appendChild calls (testing library may append containers first)
  const appendedNodes = appendSpy.mock.calls.map(c => c[0]);
  const anchor = appendedNodes.find((n: any) => n && n.tagName === 'A') as HTMLAnchorElement | undefined;
  expect(anchor).toBeDefined();
  if (!anchor) throw new Error('export anchor was not appended to document.body');
  const download = (anchor.getAttribute('download') || '');
  expect(download.startsWith('faro-')).toBe(true);
  expect(download).not.toContain('/');
  expect(download).toContain('.json');

  await waitFor(() => expect(removeSpy).toHaveBeenCalledWith(anchor));

  // global revoke mock defined above should have been called
  expect((global as any).URL.revokeObjectURL).toHaveBeenCalled();

  appendSpy.mockRestore();
  removeSpy.mockRestore();
});
