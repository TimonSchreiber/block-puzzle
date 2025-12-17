import { cellToString, DELTAS } from "./state.js";

/**
 * Returns a Set of all the occupied coordinates as Strings.
 * @param {GameState} state
 * @returns {Set<string>}
 */
function occupiedCells(state) {
  const set = new Set();
  for (const block of Object.values(state.blocks)) {
    for (const cell of block.cells) {
      set.add(cellToString(cell));
    }
  }
  return set;
}

/**
 * Check if the specified coordinates are within the bounds of the board.
 * @param {GameState} state The state of the board.
 * @param {number} x The x coordinate.
 * @param {number} y The y coordinate.
 * @returns {boolean} True if the coordinates are within bounds.
 */
const inBounds = (state, x, y) =>
  x >= 0 && x < state.width &&
  y >= 0 && y < state.height;


/**
 * Returns the maximum distance a block can move in a given direction.
 * @param {GameState} state The state of the board.
 * @param {string} blockId The ID of the block to move.
 * @param {Direction} direction The direction to move.
 * @returns {number} The maximum distance the block can move.
 */
function getMoveDistance(state, blockId, direction) {
  /** @type {Block} */
  const block = state.blocks[blockId];

  const [dx, dy] = DELTAS[direction]
  const occupied = occupiedCells(state);

  // Remove this block's cells from the set
  for (const [x, y] of block.cells) {
    occupied.delete(cellToString([x, y]))
  }

  switch (block.moveType) {
    case 'slide':
      return getSlideDistance(state, block, dx, dy, occupied);
    case 'jump':
      return getJumpDistance(state, block, dx, dy, occupied);
    default:
      console.error(`Invalid moveType ${block.moveType} with block: ${block}`);
      return 0;
  }
}

/**
 * Calculates the maximum slide distance for a block in a given direction.
 * @param {GameState} state The state of the board.
 * @param {Block} block The block to move.
 * @param {number} dx The x delta.
 * @param {number} dy The y delta.
 * @param {Set<string>} occupied The set of occupied cells.
 * @returns {number} The maximum distance the block can slide.
 */
function getSlideDistance(state, block, dx, dy, occupied) {
  let distance = 0;

  while (true) {
    distance++;

    for (const [x, y] of block.cells) {
      const newX = x + (dx * distance);
      const newY = y + (dy * distance);

      if (!inBounds(state, newX, newY)
        || occupied.has(cellToString([newX, newY]))) {
        return distance - 1;
      }
    }
  }
}

/**
 * Calculates the jump distance for a block in a given direction.
 * @param {GameState} state The state of the board.
 * @param {Block} block The block to move.
 * @param {number} dx The x delta.
 * @param {number} dy The y delta.
 * @param {Set<string>} occupied The set of occupied cells.
 * @returns {number} The jump distance (0 if no jump is possible).
 */
function getJumpDistance(state, block, dx, dy, occupied) {
  if (block.cells.length !== 1) {
    // TODO: maybe make this more generic so that larger blocks can jump
    console.warn('Jump only supported for single-cell blocks');
    return 0;
  }

  const [x, y] = block.cells[0];

  let foundObstacle = false;
  let distance = 1;
  while (true) {
    const newX = x + (distance * dx);
    const newY = y + (distance * dy);

    if (!inBounds(state, newX, newY)) {
      return 0;
    }

    if (occupied.has(cellToString([newX, newY]))) {
      foundObstacle = true;
      distance++;
    } else {
      return foundObstacle ? distance : 0;
    }
  }
}

/**
 * Returns a list of all valid moves in the current state.
 * @param {GameState} state The state of the board.
 * @returns {Move[]} A list of all valid moves.
 */
export function getValidMoves(state) {
  const moves = [];

  for (const [blockId, block] of Object.entries(state.blocks)) {
    for (const direction of block.dirs) {
      const maxDistance = getMoveDistance(state, blockId, direction);

      switch (block.moveType) {
        case 'slide':
          // All distances from 1 to maxDistance are valid moves
          for (let d = 1; d <= maxDistance; d++) {
            moves.push({ blockId, direction, distance: d });
          }
          break;
        case 'jump':
          // Only one meaningful move
          moves.push({ blockId, direction, distance: maxDistance });
          break;
      }
    }
  }

  return moves;
}

/**
 * Checks if the game is won.
 * @param {GameState} state The state of the board.
 * @returns {boolean} True if the game is won.
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
