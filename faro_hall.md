# Faro Hall Project Specification

## Project Title
**Faro Hall** — Modern, Static, Client-Side Next.js Faro Card Game

---

## 1. Project Overview
Faro Hall is a static web application that enables users to play the classic card game of Faro, featuring an engaging, modern, and responsive UI. The entire experience lives on the client, requiring no backend, making it ideal for hosting on platforms like GitHub Pages. The game strictly follows authentic Faro rules including all nuances such as betting, coppering, casekeep tracking, hock/soda management, and supports local hotseat multiplayer. Each session allows sharing and recreating games via seeded URLs. The project is committed to slim deployment, minimal dependencies, and best-in-class code and test quality.

MANDATES (TOP IMPLEMENTATION PRIORITIES):
- Prioritize creating the game logic, UI components, and full functionality before adding tests.
- All logic should be separated from UI.
- UI should be broken up into specific components (one for casekeep, one for table, one for generated svgs of cards, etc), created and saved in a `src/components/` folder.
- Mobile friendly, an highly polished UI. 

---

## 2. Goals

- **Modern, Responsive UI**: Highly polished, intuitive, and mobile-friendly.
- **Authentic Faro Experience**: Robust, accurate implementation of all Faro rules and mechanics.
- **Easy Game Sharing**: Deterministic game seed in the URL enables others to replay the exact same game flow.
- **Hotseat Multiplayer**: Multiple users can play sequentially on a single device.
- **No Remote Multiplayer/Accounts**: Single-device only, never requiring a backend.
- **Minimal Client-Only Stack**: Prioritize Next.js static export, TypeScript, and as few external libraries as possible.
- **Comprehensive Testing**: Full suite of tests (unit, integration, UI) — every rule, scenario, and UI workflow.
- **Deployable on GitHub Pages**: Pure-static output, fast and secure.
- **Accessibility**: WCAG AA compliance for basic accessibility (contrast, ARIA as-needed, keyboard navigation).
- **Well-documented, Maintainable**: Top-grade docs, comments, typed interfaces, and developer onboarding experience.

---

## 3. Functional Requirements

### 3.1 Game Logic
- **Rulesets**: Implement strict, historically accurate Faro rules:
  - 52-card deck, shuffled per seed.
  - Standard dealing: One "banker's" (dealer's) card, one "player's" card per turn.
  - Place bets on ranks before each turn.
  - **Betting Features**: Multiple chips, any rank, coppering (reverse bet), split bets allowed.
  - **Casekeeper/Casekeep**: Track cards drawn per rank with full user visibility (casekeep panel).
  - **Soda/Hock**: Manage and display final undrawn card — bonus mechanics as per rules.
  - Bets resolved faithfully per turn.
- **Game Seed**:
  - Game initiated with a robust cryptographic random seed.
  - All shuffles and outcomes based solely on the seed.
  - Seed is stored in and restored via the URL (hash or query string).
  - Loading the seed always fully reconstructs the underlying deck and history.
- **Multiplayer (Hotseat)**:
  - Add/remove unlimited local players (3+ supported in UI).
  - Each player has a unique nickname (entered or random).
  - Individual chip stacks tracked and visualized.
  - Clearly indicate whose turn it is and provide a smooth transition between players.
  - Each player can review personal bet history in the UI.
- **Persistence**:
  - All game state and settings held in browser memory with backup to `localStorage` (auto-save resume experience for current device).
- **Game Controls & Navigation**:
  - New game, load game by seed, reset table, undo last action (where applicable), switch player, and quick rules access.
  - Copy/share link for the current game and seed.

### 3.2 User Interface & Experience
- **Design & Feel**:
  - Table felt: deep green/blue, casino-like but modern (minimal gloss/shadow, no skeuomorphism).
  - Large, easy-to-tap betting chips.
  - Animated card drawing/dealing with velocity and flip effect.
  - Visual casekeep panel: clearly shows card/rank status and what is still in play.
- **Responsive & Mobile**:
  - Touch controls for chips, bets, card draw; drag-drop not required but supported if smooth.
  - Layouts adapt responsively to mobile, tablet, and desktop.
  - Click, tap, and keyboard navigation for all major actions (accessibility).
- **Coppering & Mechanisms**:
  - Each betting chip can be toggled as "coppered" (reverse bet marker visually apparent using copper icon/overlay).
  - Bets adjustable until deal begins each turn.
  - Animated feedback for bet win/loss, hock/soda events.
- **Casekeeper Panel**:
  - Shows a per-rank ledger—what has/will appear.
  - Allows toggling hock/soda/casekeep markers each round (automatic based on drawn cards).
- **Notifications & Help**:
  - Contextual tooltips and hover info explain unfamiliar game mechanics.
  - Modal and separate /rules page with full, plain-language instructions and diagram.
- **Player/Bankroll Info**:
  - Each player displayed with name, avatar (default initials), and bankroll.
  - Player list easily switchable (swipe, click, or menu on mobile).

### 3.3 Sharing & Replay
- **Reproducible Sharing**: Each game uniquely identified by URL containing seed—link can be copied for anyone to reload exact scenario.
- **Game History**: Option to view last few hands for reviewer/audit/integrity.
- **Import/Export**: Export/import minimal JSON of bet and draw history (including seed) for offline review/archive.

### 3.4 Testing & Quality
- **Comprehensive Automated Tests**:
  - 100% coverage for essential game logic (card draw, bet resolution, coppering, hock, winning checks).
  - Integration tests for key UI/user workflows (starting new game, hotseat turn cycle, bet resolving).
  - Smoke tests for all app routes, page loads, and seed sharing flows.
  - Use Jest (unit/integration)
- **Linting, Formatting, Type Checks**:
  - Strong typing enforced (TypeScript, strictNullChecks).
  - ESLint and Prettier—CI blocks merge on violations or uncovered code.
- **Accessibility Audits**:
  - ARIA labels, must work with screen readers, color contrast checks.
- **Documentation**:
  - README with game rules, dev setup, usage instructions, and contribution guide.
  - In-code comments and JSDoc-style documentation for all core APIs/logic.

---

## 4. Technical Requirements

### 4.1 Technology Stack
- **Framework**: Next.js (latest stable, SSG mode only: `next export` for static build)
- **Language**: TypeScript (strict mode, all files)
- **Styling**: CSS Modules, PostCSS, or Tailwind CSS (if used, only core; avoid large UI kits/frameworks). SCSS optional, but must remain slim.
- **State Mgmt**: React Context or plain hooks—no Redux or heavyweight state libs.
- **Animation**: Prefer pure CSS or tiny libraries (e.g., react-spring only if needed).
- **Testing**: Jest (unit/integration, headless), React Testing Library or equivalent for UI.
- **No Server/DB**: No API endpoints; all state local, optionally with browser `localStorage`/`sessionStorage`.

### 4.2 Dependencies
- Strict minimalism: No Material UI/Bootstrap/Ant; consider icon sets only if very compact (SVG preferred).
- Game logic implemented fully in-project (no external card game state libraries).
- Only add dependencies by consensus/code review.

---

## 5. Deliverables

- **Fully static Next.js app**, source code in repo, ready for `next export` static output.
- **Complete implementation** of all Faro game rules, multiplayer, sharing & seed mechanics, and UI per above.
- **Game logic tests plus UI smoke/integration tests**; CI setup (e.g., GitHub Actions) running all tests on push/PR.
- **Design assets** (cards, layout, icons), all licensed or custom.
- **Documentation**: Complete README, instructions, and in-code docs.
- **Accessibility checks** passed.
- **Demo seeds** for replaying sample games.
- **Manual and/or script for easy deployment to GitHub Pages.**

---

## 6. Further Goals

- **Animated chip stacks, table background customization, SFX.**
- **Multiple themes (dark/light/classic).**
- **Offline PWA installability.**
- **In-browser tutorial or onboarding.**
- **Player stats (locally, no sync).**
- **Historical audit replay tools.**

---

## 7. Out of Scope

- No remote/networked multiplayer, chat, or authentication.
- No server-side rendering or API endpoints.
- No large 3rd-party UI/component frameworks.

---

## 8. Appendix: Key Reference Materials
- [Wikipedia: Faro (card game)](https://en.wikipedia.org/wiki/Faro_(card_game))
- [Pagat Faro Rules](https://www.pagat.com/banking/faro.html)
- [Historical Casekeep Photos/References]