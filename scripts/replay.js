#!/usr/bin/env node
// Simple script to replay a seed and print JSON to stdout.
const seed = process.argv[2] || 'seed-0001-simple';
let GameModule;
try { GameModule = require('../src/game'); } catch(e) { try { GameModule = require('../game'); } catch(e2) { console.error('Game module not found.'); process.exit(2); } }
(async () => {
  const createGame = GameModule.createGame || GameModule.create || (GameModule.Game && GameModule.Game.create) || null;
  const GameClass = GameModule.Game || GameModule.default || null;
  if (!createGame && !GameClass) { console.error('Game factory not found.'); process.exit(2); }
  const game = createGame ? await createGame({ seed }) : await new GameClass({ seed });
  if (typeof game.placeBet === 'function') game.placeBet(100);
  if (typeof game.revealTurn === 'function') game.revealTurn();
  const out = {
    seed,
    history: game.getHistory ? game.getHistory() : game.history || null,
    balances: game.getBalances ? game.getBalances() : game.balances || null,
  };
  console.log(JSON.stringify(out, null, 2));
})();
