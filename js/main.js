import { createRenderer } from './renderer.js';
import { canMove, getValidMoves, isWon, occupiedCells } from './rules.js';
import { createState, stateKey } from './state.js';

// test level loading
const response = await fetch('./js/levels.json');
const games = await response.json();

// const game = games.rushHour;
// const game = games.dirtyDozen;
const game = games.jumpingRabbits;
const level = game.levels[0];

const state = createState(game, level);
console.log('Initial state', state);

console.log('StateKey', stateKey(state));

// test occupiedCells
console.log('Occupied cells', occupiedCells(state));

// test canMove
// console.log('C3 right', canMove(state, 'C3', 'right'));
// console.log('C3 left', canMove(state, 'C3', 'left'));
// console.log('C3 down', canMove(state, 'C3', 'down'));

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

const svg = document.querySelector('svg');
const renderer = createRenderer(svg);
renderer.render(state);
