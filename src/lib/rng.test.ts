import { seedFromString, mulberry32 } from './rng';

describe('rng utilities', () => {
  test('seedFromString is deterministic', () => {
    const a = seedFromString('hello');
    const b = seedFromString('hello');
    expect(a).toBe(b);
    const c = seedFromString('different');
    expect(typeof a).toBe('number');
    expect(a).not.toBe(c);
  });

  test('mulberry32 produces deterministic sequence in [0,1)', () => {
    const seed = seedFromString('seed123');
    const r1 = mulberry32(seed);
    const r2 = mulberry32(seed);
    const seq1 = [r1(), r1(), r1()];
    const seq2 = [r2(), r2(), r2()];
    expect(seq1).toEqual(seq2);
    seq1.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  });
});
