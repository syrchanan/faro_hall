# Faro Hall

A modern, client-side implementation of [Faro](https://en.wikipedia.org/wiki/Faro_(card_game)) — one of the oldest banking card games — built with Next.js, React, and TypeScript.

## What is Faro?

Faro is a card game popular in saloons and gambling halls from the 18th through early 20th centuries. Players bet on which **rank** (Ace through King) will appear as the winning card each turn. The banker draws two cards per turn: the first is the **loser**, the second is the **winner**. Features include coppering (reversing bets), splits (doublets), a casekeeper for card counting, and the soda/hock mechanics for the first and last cards.

## Features

- **Authentic Faro rules** — soda, hock, coppering, splits, casekeep tracking
- **Deterministic seeded games** — share a URL to replay the exact same deck
- **Hotseat multiplayer** — multiple players on one device
- **Interactive betting board** — click ranks to bet, toggle copper, choose chip amounts
- **Casekeeper panel** — tracks all 13 ranks and cards remaining
- **Casino-themed UI** — felt green, gold accents, card animations
- **Mobile responsive** — stacks vertically on small screens, large touch targets
- **No backend** — fully static, client-only, deployable to GitHub Pages
- **Accessibility** — ARIA labels, keyboard navigation, focus management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 13.4 (static export) |
| UI | React 18, TypeScript 5.2 |
| Validation | Zod 3.21 |
| Testing | Jest 29, Testing Library, jest-axe |
| Styling | CSS Modules + global CSS custom properties |

## Project Structure

```
faro_hall/
  pages/              # Next.js routes
    index.tsx          # Main game page (full Faro UI)
    rules.tsx          # Complete Faro rules
    _app.tsx           # App wrapper, global styles
  src/
    lib/               # Game logic (authoritative layer)
      cards.ts         # Card types, deck creation, shuffle
      rng.ts           # Seeded PRNG (FNV-1a + Mulberry32)
      game.ts          # Game state, betting, turn resolution
      casekeep.ts      # Casekeeper tracking per rank
      persistence.ts   # LocalStorage save/load
      schemas.ts       # Zod validation schemas
      index.ts         # Barrel exports
    components/        # React UI components
      CardSVG.tsx      # SVG playing card rendering
      BettingBoard.tsx # 13-rank interactive betting grid
      CasekeeperPanel.tsx  # Card count tracker
      Chip.tsx         # Casino chip button
      PlayerList.tsx   # Player sidebar with bankrolls
      Controls.tsx     # Game toolbar (new, seed, undo, rules)
      SeedShare.tsx    # Seed URL sharing
      Table.tsx        # Game table container
      styles/          # CSS Modules for each component
    styles/
      theme.css        # CSS custom properties (colors, spacing)
  styles/
    globals.css        # Global styles, layout, casino theme
```

## Getting Started

### Prerequisites

- Node.js 18+ (Node 22 has a known SWC binary issue with Next.js 13.4)
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000. The game loads with a demo seed. Click ranks on the betting board, choose a chip amount, and hit Deal.

### Testing

```bash
# On Windows with Node 22, use the direct path:
node ./node_modules/jest/bin/jest.js

# Standard:
npm test
```

19 test suites, 68 tests covering game logic, components, accessibility, integration, and deterministic replay.

### Build

```bash
npm run build
```

> **Note:** Next.js 13.4 with Node 22 has a known issue where the SWC binary download fails (404). Use Node 18 or 20 for production builds.

## How to Play

1. **Start** — The deck is shuffled. The soda card (first card) is revealed.
2. **Select a player** from the sidebar.
3. **Click a rank** on the betting board (A through K).
4. **Choose a chip amount** ($1, $5, $10, $25).
5. **Toggle Copper** if you want to bet against the rank.
6. **Place Bet** to commit.
7. **Deal** to draw two cards (loser + winner) and resolve bets.
8. **Repeat** until only one card remains (the hock).

### Bet Resolution

| Outcome | Result |
|---------|--------|
| Rank matches **winner** | Win: stake returned + equal winnings |
| Rank matches **loser** | Lose: house keeps stake |
| Rank matches **neither** | Push: stake returned, bet stays |
| Rank matches **both** (split) | House takes half the stake |
| **Coppered** bet | Win/loss inverted |

## Seed Sharing

Every game is deterministic based on its seed. The seed appears in the URL query parameter. Copy the URL to share an identical game with someone else — they'll get the same deck order and can replay your exact session.

## Architecture Notes

- **Immutable state** — all game functions return new state objects, never mutating
- **Zod validation** — runtime schema validation on deserialized game states
- **Seeded PRNG** — FNV-1a hash for seed-to-number, Mulberry32 for deterministic random
- **Backward compatible** — `casekeep`, `sodaCard`, `turn` are optional fields so old saved states still load
- **Separation of concerns** — game logic in `src/lib/` is pure functions with no UI dependencies; components in `src/components/` handle rendering

## Known Issues

- `npm run build` fails on Node 22 due to Next.js 13.4 SWC binary not available for newer Node versions. Use Node 18/20, or upgrade Next.js.
- One pre-existing TypeScript error: `jest-axe` ambient module declaration not resolved by `tsc --noEmit`. Does not affect test execution.

## License

Private project.
