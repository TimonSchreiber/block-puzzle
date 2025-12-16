export const DELTAS = {
  up:    [ 0,  1],
  down:  [ 0, -1],
  left:  [-1,  0],
  right: [ 1,  0],
};

/**
 * Create a new game state from a game type definition and level.
 * @param {GameType} gameType The GameType.
 * @param {Level} level The GameLevel.
 * @returns {GameState} The initial GameState object.
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
          cells: block.cells.map(([x, y]) => [x, y]),
          isMain: block.isMain ?? false,
          dirs: block.dirs ?? gameType.defaults.dirs,
          moveType: block.moveType ?? gameType.defaults.moveType,
          blockType: block.blockType ?? gameType.defaults.blockType,
        }
      ])
    )
  };
}

/**
 * Apply a move and return a new state.
 * @param {GameState} state
 * @param {Move} move
 * @returns {GameState} The new State object
 */
export function applyMove(state, move) {
  const { blockId, direction, distance } = move;
  const [dx, dy] = DELTAS[direction];

  const block = state.blocks[blockId];

  return {
    ...state,
    blocks: {
      ...state.blocks,
      [blockId]: {
        ...block,
        cells: block.cells.map(([x, y]) => [
          x + (distance * dx),
          y + (distance * dy)
        ])
      },
    }
  };
}

/**
 * Transforms a GameState object into its string representation.
 * @param {GameState} state The GameState object to transform.
 * @returns The string representation of a GameState object.
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

/**
 * Translates a Cell object into a string.
 * @param {Cell} cell The x and y coordinates of a cell.
 * @returns A string representing the Cell object.
 */
export function cellToString([x, y]) {
  return `${x},${y}`;
}
