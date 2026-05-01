import { CIVIL_WAR_NAMES, getRandomCivilWarName } from './players';

describe('Civil War player names', () => {
  test('CIVIL_WAR_NAMES is a non-empty array of strings with at least 10 entries', () => {
    expect(Array.isArray(CIVIL_WAR_NAMES)).toBe(true);
    expect(CIVIL_WAR_NAMES.length).toBeGreaterThanOrEqual(10);
    for (const name of CIVIL_WAR_NAMES) {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });

  test('getRandomCivilWarName returns a name from the list', () => {
    for (let i = 0; i < 20; i++) {
      const name = getRandomCivilWarName();
      expect(CIVIL_WAR_NAMES).toContain(name);
    }
  });

  test('all names are unique', () => {
    const set = new Set(CIVIL_WAR_NAMES);
    expect(set.size).toBe(CIVIL_WAR_NAMES.length);
  });
});
