import { createRenderer } from './renderer.js';
import { getValidMoves, occupiedCells } from './rules.js';
import { solve } from './solver.js';
import { applyMove, createState, stateKey } from './state.js';

/** @typedef {import('./types.js').Cell} Cell */
/** @typedef {import('./types.js').Direction} Direction */
/** @typedef {import('./types.js').MoveType} MoveType */
/** @typedef {import('./types.js').BlockType} BlockType */
/** @typedef {import('./types.js').Block} Block */
/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').Move} Move */
/** @typedef {import('./types.js').Theme} Theme */
/** @typedef {import('./types.js').Defaults} Defaults */
/** @typedef {import('./types.js').GameType} GameType */
/** @typedef {import('./types.js').Level} Level */
/** @typedef {import('./types.js').LevelBlock} LevelBlock */
/** @typedef {import('./types.js').RuleSet} RuleSet */

// test level loading
const response = await fetch('../levels.json');
const games = await response.json();

let game;
game = games.rushHour;
game = games.jumpingRabbits;
game = games.dirtyDozen;

const level = game.levels[1];
const showSolution = true;

let state = createState(game, level);

// Test renderer
const svg = document.querySelector('svg');
const renderer = createRenderer(
  svg, game.theme,
  Object.fromEntries(
    Object.entries(level.blocks)
      .map(([blockId, block]) => [blockId, block.color])
  )
);
renderer.render(state);

if (showSolution) {
    // Test solve method
    console.log('Start solving...');

    const start = performance.now();
    const solution = solve(state);
    const end = performance.now();
    console.log('Time:', (end - start).toFixed(3), 'ms');

    // console.log(solution);

    for (const move of solution) {
      renderer.render(state);
      state = applyMove(state, move);
      await sleep(300);
    }

    renderer.render(state);

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
}
