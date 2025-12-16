import { cellToString, DELTAS } from "./state.js";

/**
 * Returns a Set of all the occupied coordinates as Strings.
 * @param {GameState} state
 * @returns {Set<string>}
 */
export function occupiedCells(state) {
  const set = new Set();
  for (const block of Object.values(state.blocks)) {
    for (const cell of block.cells) {
      set.add(cellToString(cell));
    }
  }
  return set;
}

/**
 * TODO
 * @param {GameState} state
 * @param {number} x
 * @param {number} y
 * @returns
 */
export function inBounds(state, x, y) {
  return x >= 0
      && x < state.width
      && y >= 0
      && y < state.height;
}

/** TODO: now returns the distance instead of a boolean => change function name
 * Check if this block can move in the specified direction.
 * @param {GameState} state The state of the board.
 * @param {string} blockId The id of the block to check.
 * @param {Direction} direction The direction to check.
 * @returns True if the specified block can move towards the specified
 *          direction, False otherwise.
 */
export function getMoveDistance(state, blockId, direction) {
  /** @type {Block} */
  const block = state.blocks[blockId];

  const [dx, dy] = DELTAS[direction]
  const occupied = occupiedCells(state);
  // console.log(blockId, ':', occupied)

  // Remove this block's cells from the set
  for (const [x, y] of block.cells) {
    occupied.delete(cellToString([x, y]))
  }


  switch (block.moveType) {
    case 'slide':
      return canSlide(state, block, dx, dy, occupied);
    case 'jump':
      return canJump(state, block, dx, dy, occupied);
    default:
      console.error(`Invalid moveType ${block.moveType} with block: ${block}`);
      return 0;
  }
}

/**
 * TODO
 * @param {GameState} state
 * @param {Block} block
 * @param {number} dx
 * @param {number} dy
 * @param {Set<string>} occupied
 * @returns
 */
function canSlide(state, block, dx, dy, occupied) {
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
 * TODO
 * @param {GameState} state
 * @param {Block} block
 * @param {number} dx
 * @param {number} dy
 * @param {Set<string>} occupied
 */
function canJump(state, block, dx, dy, occupied) {
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
 * Returns an Array of all possible moves in the specified board state.
 * @param {GameState} state
 * @returns {Move[]} A List of valid moves
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
 * Checks if the win condition is met.
 * @param {GameState} state The state of the board.
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
