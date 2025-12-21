import { extractMin, insert } from './heap.js';
import { deltas, getValidMoves, isWon } from './rules.js';
import { applyMove, stateKey, winCondition } from './state.js';

/**
 * Solves the block puzzle using A* search.
 * @param {GameState} initialState The initial state of the board.
 * @returns {GameState[]} The list of states from the initial state to the goal state, or null if no solution is found.
 */
export function solveAStar(initialState) {
  const initialHash = stateKey(initialState);

  /** @type {Set<BigInt>} */
  // const closed = new Set(/* [initialHash] */);


  /** @type {Map<BigInt, number>} */
  const gScore = new Map([[initialHash, 0]]);

  /** @type {SearchNode[]} */
  const open = [{ state: initialState, parent: null, hash: initialHash, g: 0, f: 0 }];

  let iterations = 0;

  while (open.length > 0) {
    const { state, parent, hash, g, f } = extractMin(open);

    if (g !== gScore.get(hash)) {
      continue;
    }

    iterations++;

    // TODO: remove debug logging
    if (iterations % 10_000 === 0) {
      console.log(`Iteration ${iterations}: open=${open.length}, closed=${gScore.size}, g=${g}, f=${f}, hash=${hash}`);
      console.assert(hash !== (parent?.hash ?? 0n), 'State equals parent!');
    }

    if (isWon(state)) {
      console.log(`Solution found in ${iterations} iterations, ${g} moves`);
      return reconstructPath({ state, parent, hash, g, f });
    }

    for (const { blockId, direction, distance } of getValidMoves(state)) {
      const [dx, dy] = deltas[direction];
      const { newState, newHash } = applyMove(hash, state, blockId, dx, dy, distance);

      const tentativeG = g + 1;
      const bestKnownG = gScore.get(newHash) ?? Number.MAX_SAFE_INTEGER;
      if (tentativeG >= bestKnownG) {
        continue;
      }
      gScore.set(newHash, tentativeG);
      insert(open, {
        state: newState,
        parent: { state, parent, hash, g, f },
        hash: newHash,
        g: g + 1,
        f: g + 1 + heuristic(newState),
      });
      }
  }

  console.log(`No Solution found in ${iterations} iterations!, ${gScore.size} states explored`);
  return [];
}

/** TODO: Optimize heuristic function
 * Calculates the heuristic value for a given state.
 * @param {GameState} state The state of the board.
 * @returns {number} The heuristic value.
 */
function heuristic(state) {
  let totalDistance = 0;

  for (const blockId in state) {
    const block = state[blockId];
    if (!block.isMain) continue;

    for (const [bx, by] of block.cells) {
      let minDistance = Number.MAX_SAFE_INTEGER;
      for (const [wx, wy] of winCondition) {
        minDistance = Math.min(minDistance, Math.abs(bx - wx) + Math.abs(by - wy));
      }
      totalDistance += minDistance;
    }
  }
  return totalDistance;
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
