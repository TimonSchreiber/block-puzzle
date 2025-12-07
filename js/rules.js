import { cellToString, DELTAS } from "./state.js";

/**
 * Returns a Set of all the occupied coordinates as Strings.
 * @param {Object} state
 * @returns {Set<string>}
 */
export function occupiedCells(state) {
  return new Set(
    Object.values(state.blocks)
      .flatMap((block) =>
        block.cells.map(cellToString)
      )
  );
}

export function inBounds(state, x, y) {
  return x >= 0
      && x < state.width
      && y >= 0
      && y < state.height;
}

// TODO: Important! Add alternative functions for different types of moves (sliding vs jumping vs ...)


/**
 * Check if this block can move in the specified direction.
 * @param {Object} state The state of the board.
 * @param {string} blockId The id of the block to check.
 * @param {string} direction The direction to check.
 * @returns True if the specified block can move towards the specified
 *          direction, False otherwise.
 */
export function canMove(state, blockId, direction) {
  const block = state.blocks[blockId];

  if (!block.dirs.includes(direction)) {
    return false;
  }

  const [dx, dy] = DELTAS[direction]
  const occupied = occupiedCells(state);

  // Remove this block's cells from the set
  block.cells.forEach(([x, y]) => {
    occupied.delete(cellToString([x, y]))
  });

  for (const [x, y] of block.cells) {
    const newX = x + dx;
    const newY = y + dy;

    if (!inBounds(state, newX, newY)) {
      return false;
    }

    if (occupied.has(cellToString([newX, newY]))) {
      return false;
    }
  }

  return true;
}

/**
 * Returns an Array of all moves possible in this board state.
 * @param {Object} state
 * @returns {Array} A List of valid moves
 */
export function getValidMoves(state) {
  const directions = Object.keys(DELTAS);
  return Object.keys(state.blocks)
    .flatMap((blockId) =>
        directions.map((direction) => ({ blockId, direction }))
    )
    .filter((obj) =>
      canMove(state, obj.blockId, obj.direction)
  );
}

/**
 * Checks if the win condition is met.
 * @param {Object} state The state of the board.
 * @returns True if all winning
 */
export function isWon(state) {
  const mainBlocks = Object.values(state.blocks).filter((block) => block.isMain);

  const mainCells = new Set(mainBlocks.flatMap((block) => block.cells).map(cellToString));
  const winCells = new Set(state.winCondition.map(cellToString));

  // All main blocks need to occupy a winCell
  for (const cell of mainCells) {
    if (!winCells.has(cell)) return false;
  }

  return true;
}
