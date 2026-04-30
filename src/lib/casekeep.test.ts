// src/lib/casekeep.test.ts
import { calculateCaseResults, resetCases, addCase } from './casekeep';

describe('casekeep module', () => {
  it('calculates case results correctly', () => {
    const cases = [{ id: 1, result: 'win' }, { id: 2, result: 'lose' }];
    const results = calculateCaseResults(cases);
    expect(results.wins).toBe(1);
    expect(results.losses).toBe(1);
  });

  it('resets cases', () => {
    let cases = [{ id: 1 }];
    cases = resetCases();
    expect(cases).toEqual([]);
  });

  it('adds a case', () => {
    let cases = [];
    cases = addCase(cases, { id: 1, result: 'win' });
    expect(cases).toHaveLength(1);
    expect(cases[0].result).toBe('win');
  });

  it('handles edge cases', () => {
    // Add test(s) for invalid input, such as null or corrupted data
    expect(() => calculateCaseResults(null)).toThrow();
    expect(() => addCase([], null)).toThrow();
  });
});
