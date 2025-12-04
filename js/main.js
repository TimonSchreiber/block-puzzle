
import { canMove, getValidMoves, isWon, occupiedCells } from './rules.js';
import { createState } from './state.js';

// test level loading
const response = await fetch('./js/levels.json');
const games = await response.json();

const rushHour = games.rushHour;
const level0 = rushHour.levels[0];

const state = createState(rushHour, level0);
console.log('Initial state', state);

// test occupiedCells
console.log('Occupied cells', occupiedCells(state));

// test canMove
console.log('C3 right', canMove(state, 'C3', 'right'));
console.log('C3 left', canMove(state, 'C3', 'left'));
console.log('C3 down', canMove(state, 'C3', 'down'));

// test getValidMoves
const validMoves = getValidMoves(state);
console.log('Valid moves:', validMoves)

// test win condition
const won = isWon({
  winCondition: [[0, 0]],
  blocks: {
    A: { cells: [[0, 0]], isMain: true },
    B: { cells: [[1, 1]], isMain: false }
  }
});
console.log('is Won:', won);
