import { getValidMoves, isWon } from "./rules.js";
import { applyMove, stateKey } from "./state.js";

export function solve(initialState) {
  const seen = new Set();
  const queue = [{ state: initialState, moves: [] }];

  seen.add(stateKey(initialState));

  while (queue.length > 0) {
    const { state, moves } = queue.shift();

    if (isWon(state)) {
      console.log(`Solution found!`);
      return moves;
    }

    for (const move of getValidMoves(state)) {
      const newState = applyMove(state, move.blockId, move.direction);
      const key = stateKey(newState);

      if (!seen.has(key)) {
        seen.add(key);
        queue.push({
          state: newState,
          moves: [...moves, move]
        });
      }
    }
  }

  console.log('No solution found!');
  return null;
}
