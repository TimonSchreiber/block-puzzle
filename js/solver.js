import { deltas, getValidMoves, isWon } from "./rules.js";
import { applyMove, stateKey, winCondition } from "./state.js";

/**
 * Solves the block puzzle using A* search.
 * @param {GameState} initialState The initial state of the board.
 * @returns {GameState[]} The list of states from the initial state to the goal state, or null if no solution is found.
 */
export function solve(initialState) {
  const initialHash = stateKey(initialState);

  /** @type {Set<BigInt>} */
  const closed = new Set();

  /** @type {SearchNode[]} */
  const open = [{ state: initialState, parent: null, hash: initialHash, g: 0, f: 0 }];

  closed.add(initialHash);

  let iterations = 0;
  const maxIterations = 50_000;

  while (open.length > 0 && iterations < maxIterations) {
    const { state, parent, hash, g, f } = popMinElement(open);

    if (isWon(state)) {
      console.log(`Solution found in ${iterations} iterations, ${g} moves`);
      return reconstructPath({ state, parent, hash, g, f });
    }

    for (const {blockId, direction, distance} of getValidMoves(state)) {
      const [dx, dy] = deltas[direction];
      const { newState, newHash } = applyMove(hash, state, blockId, dx, dy, distance);

      if (!closed.has(newHash)) {
        // Note: state marked as closed because all moves have the same cost,
        // but technically not correct. Should only close when state is popped
        // from open
        closed.add(newHash);
        open.push({
          state: newState,
          parent: { state, parent, hash, g, f },
          hash: newHash,
          g: g + 1,
          f: g + 1 + heuristic(newState),
        });
      }
    }
    iterations++;
  }

  console.log(`No Solution found in ${iterations} iterations!`);
  return [];
}

/** TODO: Optimize heuristic function
 * Calculates the heuristic value for a given state.
 * @param {GameState} state The state of the board.
 * @returns {number} The heuristic value.
 */
function heuristic(state) {
  let minDistance = Number.MAX_SAFE_INTEGER;

  const mainCells = [];

  for (const blockId in state) {
    const block = state[blockId];
    if (block.isMain) {
      mainCells.push(...block.cells);
    }
  }

  for (const mainCell of mainCells) {
    for (const winCell of winCondition) {
      const distance = Math.abs(mainCell[0] - winCell[0]) + Math.abs(mainCell[1] - winCell[1]);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
  }

  return minDistance;
}

/** TODO: Implement a min-heap for better performance
 * Pops and returns the element with the minimum 'f' value from the open list.
 * @param {SearchNode[]} open The open list.
 * @returns {SearchNode} The element with the minimum 'f' value.
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

/**
 * Reconstructs the path of states from the initial state to the goal state.
 * @param {SearchNode} node The goal node.
 * @returns {GameState[]} The list of states from the initial state to the goal state.
 */
function reconstructPath(node) {
  const states = [];
  while (node != null) {
    states.push(node.state);
    node = node.parent;
  }
  return states.reverse();
}
