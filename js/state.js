const DELTAS = {
  up:    [ 0,  1],
  down:  [ 0, -1],
  left:  [-1,  0],
  right: [ 1,  0],
};

/**
 * Create a new game state from a game type definition and level.
 * @param {*} gameType
 * @param {*} level
 * @returns
 */
export function createState(gameType, level) {
  return {
    width: gameType.width,
    height: gameType.height,
    winCondition: gameType.winCondition,
    blocks: structuredClone(level.blocks),
  };
}

/**
 * Applay a move and return a new state.
 * @param {*} state
 * @param {*} blockId
 * @param {*} direction
 * @returns
 */
export function applyMove(state, blockId, direction) {
  const [dx, dy] = DELTAS[direction];
  const block = state.blocks[blockId];

  return {
    ...state,
    blocks: {
      ...state.blocks,
      [blockId]: {
        ...block,
        cells: block.cells.map(([x, y]) => [x + dx, y + dy])
      },
    }
  };
}

export function stateKey(state) {
  // TODO: Generate a string representation of the board configuration => FEN style
}

/** TODO: needed? */
export function reverseDirection(direction) {
  return {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
  }[direction];
}

export function cellToString([x, y]) {
  return `${x},${y}`;
}
