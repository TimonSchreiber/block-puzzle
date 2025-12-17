import { getValidMoves, isWon } from "./rules.js";
import { applyMove, stateKey } from "./state.js";

/**
 * Solves the block puzzle using A* search.
 * @param {GameState} initialState The initial state of the board.
 * @returns {Move[]} The list of moves to solve the puzzle, or an empty list if no solution exists.
 */
export function solve(initialState) {
  /** @type {Set<BigInt>} */
  const closed = new Set();

  /** @type {{ state: GameState, moves: Move[], g: number, f: number }[]} */
  const open = [{ state: initialState, moves: [], g: 0, f: 0 }];

  closed.add(stateKey(initialState));

  let iterations = 0;

  while (open.length > 0) {
    iterations++;
    const { state, moves } = popMinElement(open);

    if (isWon(state)) {
      console.log(`Solution found in ${iterations} iterations, ${moves.length} moves`);
      return moves;
    }

    for (const move of getValidMoves(state)) {
      const newState = applyMove(state, move);
      const newKey = stateKey(newState);

      if (!closed.has(newKey)) {
        // Note: state marked as closed because all moves have the same cost, but technically not correct
        // Should only close when state is popped from open
        closed.add(newKey);
        open.push({
          state: newState,
          moves: [...moves, move],
          g: moves.length + 1,
          f: moves.length + 1 + heuristic(newState),
        });
      }
    }
  }

  console.log('No solution found!');
  return [];
}

/**
 * Calculates the heuristic value for a given state.
 * @param {GameState} state The state of the board.
 * @returns {number} The heuristic value.
 */
function heuristic(state) {
  let minDistance = Number.MAX_SAFE_INTEGER;

  const mainCells = (Object.values(state.blocks).filter((block) => block.isMain))
    .flatMap((block) => block.cells);

  for (const mainCell of mainCells) {
    for (const winCell of state.winCondition) {
      const distance = Math.abs(mainCell[0] - winCell[0]) + Math.abs(mainCell[1] - winCell[1]);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
  }

  return minDistance;
}

/**
 * Pops and returns the element with the minimum 'f' value from the open list.
 * @param {{ state: GameState, moves: Move[], g: number, f: number }[]} open The open list.
 * @returns {{ state: GameState, moves: Move[], g: number, f: number }} The element with the minimum 'f' value.
 */
function popMinElement(open) {
  let min = Number.MAX_SAFE_INTEGER;
  let minIndex = -1;

  for (let i = 0; i < open.length; i++) {
    const { f } = open[i];
    if (f < min) {
      min = f;
      minIndex = i;
    }
  }

  const minElements = open.splice(minIndex, 1);
  return minElements[0];
}
