export const DELTAS = {
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
    blocks: Object.fromEntries(
      Object.entries(level.blocks).map(([blockId, block]) => [
        blockId,
        {
          cells: structuredClone(block.cells),
          isMain: block.isMain,
          dirs: block.dirs
        }
      ])
    )
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

/**
 * TODO:
 * @param {*} state
 * @returns
 */
export function stateKey(state) {
  return Object.values(state.blocks)
    .map((block) => {
      const sortedCells = [...block.cells]
        .sort((a, b) => a[0] - b[0] || a[1] - b[1])
        .map(cellToString)
        .join(';');
      // TODO: is it necessary to sort or can I assume the dirs are always the same order?
      const sortedDirs = block.dirs.map((dir) => dir[0])/* .sort() */.join(',');
      const isMain = block.isMain ? 1 : '';
      return `${sortedCells}:${sortedDirs}:${isMain}`;
    })
    .sort()
    .join('|');
}

/** TODO: needed? Move somewhere else? */
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
