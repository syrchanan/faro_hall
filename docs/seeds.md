# Deterministic Seeds for Replay Smoke Tests

This file contains deterministic seed strings and a short description for each. Use these seeds in tests and the replay script to validate deterministic replay behavior.

Seeds:

- seed-0001-simple: Small entropy seed for basic replay path; exercise normal-case draws and bets.
- seed-0002-edge-aces: Produces early high-value draws to test casekeep and balance edge cases.
- seed-0003-longgame: Produces a longer game with many turns; useful for stress on history handling.
- seed-0004-reveal-fail: Seed that triggers unusual reveal ordering or ties; validates deterministic case resolution.
- seed-0005-randomness-check: Additional seed to ensure RNG state is isolated between runs.

Note: These strings are intentionally simple and deterministic. If the game expects a specific seed format (hex/base64), replace with appropriate encodings.
