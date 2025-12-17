export const DELTAS = {
  up:    [ 0,  1],
  down:  [ 0, -1],
  left:  [-1,  0],
  right: [ 1,  0],
};

const U64_CEIL = 2n ** 64n - 1n;

/** @type {Record<string, number>} */
let blockIndexMap = undefined;

/** @type {BigInt[][][]} */
let zobristHashTable = undefined;;

/**
 * Initialize the block index map.
 * @param {GameState} state The current game state.
 */
export function initBlockIndexMap(state) {
  let blockIndexMap = {};
  let index = 0;
  for (const blockId in state.blocks) {
    blockIndexMap[blockId] = index++;
  }
  console.log('Block index map:', blockIndexMap);
}

/**
 * Initialize the Zobrist hash table.
 * @param {GameState} state The current game state.
 */
export function initZobristHashTable(state) {
  zobristHashTable = [];
  for (let x = 0; x < state.width; x++) {
    zobristHashTable[x] = [];
    for (let y = 0; y < state.height; y++) {
      zobristHashTable[x][y] = [];
      for (const blockId in blockIndexMap) {
        const index = blockIndexMap[blockId];
        zobristHashTable[x][y][index] = BigInt.asUintN(
          64, BigInt(Math.floor(Math.random() * U64_CEIL))
        );
      }
    }
  }
  console.log('Zobrist hash table:', zobristHashTable);
}

/**
 * Generates a unique key for the given game state using Zobrist hashing.
 * @param {GameState} state The state of the board.
 * @returns {BigInt} The unique key representing the state.
 */
export function stateKey(state) {
  let hash = 0n;
  for (const blockId in state.blocks) {
    const block = state.blocks[blockId];
    // TODO: remove later
    const idx = blockIndexMap[blockId];
    if (idx === undefined) {
      throw new Error(`Block ID ${blockId} not found in blockIndexMap`);
    }
    for (const [x, y] of block.cells) {
      hash ^= zobristHashTable[x][y][blockIndexMap[blockId]];
    }
  }
  return hash;
}

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
 * Translates a Cell object into a string.
 * @param {Cell} cell The x and y coordinates of a cell.
 * @returns A string representing the Cell object.
 */
export function cellToString([x, y]) {
  return `${x},${y}`;
}
