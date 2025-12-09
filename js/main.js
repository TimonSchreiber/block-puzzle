import { createRenderer } from './renderer.js';
import { canMove, getValidMoves, isWon, occupiedCells } from './rules.js';
import { solve } from './solver.js';
import { applyMove, createState, stateKey } from './state.js';

// test level loading
const response = await fetch('../levels.json');
const games = await response.json();

let game;
game = games.jumpingRabbits;
game = games.dirtyDozen;
game = games.rushHour;

const level = game.levels[3];

let state = createState(game, level);
console.log('Initial state:', state);

console.log('StateKey:', stateKey(state));

// test occupiedCells
console.log('Occupied cells:', occupiedCells(state));

// test canMove
console.log('R1 right:', canMove(state, 'R1', 'right'));
console.log('R1 left:', canMove(state, 'R1', 'left'));
console.log('R1 down:', canMove(state, 'R1', 'down'));

// test getValidMoves
console.log('Valid moves:', getValidMoves(state))

// test win condition
console.log('is Won:', isWon({
    winCondition: [[0, 0], [0,1]],
    blocks: {
      A: { cells: [[0, 0]], isMain: true },
      B: { cells: [[1, 1]], isMain: false }
    }
  })
);

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

// Test solve method
const solution = solve(state);

console.log(solution);

for (const move of solution) {
  renderer.render(state);
  state = applyMove(state, move.blockId, move.direction);
  await sleep(300);
}

renderer.render(state);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
