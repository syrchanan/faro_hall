# High Priority

1. Upgrade Next.js — The current 13.4 is broken on Node 22 (SWC binary 404). Upgrading to Next.js 14+ would fix npm run build and unlock the App Router,  
improved static export, and better performance. This is the single biggest blocker to deploying.
2. Add tests for the new game page — pages/index.tsx is now a substantial component with betting flow, undo, seed management, and component integration,  
but has zero test coverage. Write integration tests similar to the ones in src/pages/index.integration.test.tsx but targeting the new page.
3. Add tests for BettingBoard and casekeep.ts — The new BettingBoard component and src/lib/casekeep.ts module have no test files. Both are critical game  
components.

# Medium Priority

4. Persistence integration — The new main page doesn't use saveToLocal/loadFromLocal yet. Add autosave on state changes and restore-on-load so games      
survive page refreshes.
5. Undo across turns — The undo system stores history in React state (lost on refresh). Consider persisting undo history or at minimum capping the history
  array to avoid memory growth during long games.
6. Polish the Table component — Table.tsx exists but isn't used by the main page (the page renders cards directly). Either integrate the Table component  
or remove it to avoid confusion.
7. Delete src/pages/index.tsx — The old test page is only kept for backward compatibility with src/pages/*.test.tsx tests. Once you write new tests for   
pages/index.tsx, the old page and its tests can be removed.

# Lower Priority

8. Calling last turn — In real Faro, when 3 cards remain players can "call the turn" (predict the order of the final 3 cards) for a 4:1 payout. This is an
  authentic Faro feature not yet implemented.
9. Card flip animations — The CSS is ready (transitions on .faro-card) but no actual flip animation triggers yet. Add a brief card-back-to-front CSS      
transform on deal.
10. Dark theme toggle — Theme variables for .dark-theme exist in theme.css but there's no UI to toggle it. Add a button in the header or auto-detect      
prefers-color-scheme.
11. Sound effects — Optional click/deal/win sounds would enhance the casino atmosphere.
12. Deploy to GitHub Pages — Once the Next.js upgrade is done and npm run build works, set up the GitHub Actions CI (ci.yml already exists) to auto-deploy
  on push.