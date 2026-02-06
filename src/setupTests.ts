import '@testing-library/jest-dom';

// Global test setup: keep minimal to avoid duplicate imports or side-effects.
// Note: do NOT import `jest-axe/extend-expect` globally here — import it in individual
// accessibility tests so its matchers are only available where needed.

// Suppress noisy jsdom messages about unimplemented navigation APIs that appear in
// some environments ("Not implemented: navigation"). Tests can still assert navigation
// behavior by mocking the router or window APIs explicitly.
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
    try {
      const first = args[0];
      // Normalize the message whether args[0] is a string or an Error-like object.
      const msg = typeof first === 'string'
        ? first
        : (first && typeof (first as any).message === 'string' ? (first as any).message : String(first));

      // Suppress only the exact jsdom/navigation message (or close prefix matches) we know are noisy.
      // Be strict: only silence messages that equal or start with the known jsdom text so we don't
      // accidentally swallow useful test failures.
      if (typeof msg === 'string' && (msg === 'Not implemented: navigation' || msg.startsWith('Not implemented: navigation'))) {
        return;
      }
    } catch (e) {
      // fall through to original
    }
    return originalConsoleError.apply(console, args as any);
  });

  // Also suppress known noisy console.warn messages from persistence/load flows in tests
  jest.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
    try {
      const first = args[0];
      const msg = typeof first === 'string' ? first : (first && typeof (first as any).message === 'string' ? (first as any).message : String(first));
      if (typeof msg === 'string' && (
        msg.startsWith('Failed to load saved game state') ||
        msg.startsWith('Failed to clear saved game state') ||
        msg.startsWith('Failed to load saved game for seed') ||
        msg.startsWith('Autosave failed')
      )) {
        return;
      }
    } catch (e) {
      // fall through
    }
    return originalConsoleWarn.apply(console, args as any);
  });
});

afterAll(() => {
  // restore the original console.error/warn to avoid leaking the mock to other processes
  try {
    const maybeMockErr = (console.error as any);
    if (maybeMockErr && typeof maybeMockErr.mockRestore === 'function') {
      maybeMockErr.mockRestore();
    }
  } catch (e) {
    // ignore and fall back
  }
  try {
    const maybeMockWarn = (console.warn as any);
    if (maybeMockWarn && typeof maybeMockWarn.mockRestore === 'function') {
      maybeMockWarn.mockRestore();
    }
  } catch (e) {
    // ignore
  }
  // As a final fallback, reset to the original references captured earlier.
  (console as any).error = originalConsoleError;
  (console as any).warn = originalConsoleWarn;
});
