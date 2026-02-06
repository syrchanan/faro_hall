# Contributing

Thanks for taking an interest in Faro Hall. This file documents how to run tests and submit changes.

- Install dependencies: npm ci
- Run tests: npm test
- Run typecheck: npx tsc --noEmit
- Lint: npm run lint

Testing guidelines:
- Add unit tests under src/lib/*.test.ts
- Keep runtime validation with zod for any deserialized inputs

Pull request checklist:
- All tests pass and coverage is sufficient
- CI workflow present (.github/workflows/ci.yml)
- Follow project lint rules
