import { cellToString, DELTAS } from "./state.js";

/**
 * Returns a Set of all the occupied coordinates as Strings.
 * @param {*} state
 * @returns
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


/**
 * Check if this block can move in the specified direction.
 * @param {*} state The state of the board.
 * @param {*} blockId The id of the block to check.
 * @param {*} direction The direction to check.
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
 * @param {*} state
 * @returns
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
 * @param {*} state The state of the board.
 * @returns True if all winning
 */
export function isWon(state) {
  const mainBlocks = Object.values(state.blocks).filter((block) => block.isMain);

  const mainCells = new Set(mainBlocks.flatMap((block) => block.cells).map(cellToString));
  const winCells = new Set(state.winCondition.map(cellToString));

  // TODO: check later how a win is defined:
  // does every mainBlock need to occupy a win cell
  // or does every win cell need to be occupied by a main block?
  // if (mainCells.size !== winCells.size) {
  //   return false;
  // }

  for (const cell of mainCells) {
    if (!winCells.has(cell)) return false;
  }

  return true;
}
