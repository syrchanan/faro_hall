import { seedToUrl, urlToSeed, deterministicSeedFromEntropy } from "../seed";

test('seedToUrl and urlToSeed roundtrip', () => {
  const seed = "hello-world-seed-123";
  const url = seedToUrl(seed, { replay: 1 });
  const decoded = urlToSeed(url);
  expect(decoded).toBe(seed);
});

test('deterministicSeedFromEntropy produces a value', async () => {
  const s = await deterministicSeedFromEntropy('entropy-abc');
  expect(typeof s).toBe('string');
  expect(s.length).toBeGreaterThan(0);
});
