/** @type {Record<string, number>} */
let blockIndexMap = undefined;

/** @type {BigInt[][][]} */
let zobristHashTable = undefined;

export let boardWidth = undefined;
export let boardHeight = undefined;
export let winCondition = undefined;

/**
 * Initialize the block index map.
 * @param {GameState} state The current game state.
 */
function initBlockIndexMap(state) {
  blockIndexMap = {};
  let index = 0;
  for (const blockId in state) {
    blockIndexMap[blockId] = index++;
  }
}

/**
 * Initialize the Zobrist hash table.
 */
function initZobristHashTable() {
  zobristHashTable = [];
  for (let x = 0; x < boardWidth; x++) {
    zobristHashTable[x] = [];
    for (let y = 0; y < boardHeight; y++) {
      zobristHashTable[x][y] = [];
      for (const blockId in blockIndexMap) {
        const high = BigInt(Math.floor(Math.random() * 2**32));
        const low = BigInt(Math.floor(Math.random() * 2**32));
        zobristHashTable[x][y][blockIndexMap[blockId]] = (high << 32n) ^ low;
      }
    }
  }
}

/**
 * Generates a unique key for the given game state using Zobrist hashing.
 * @param {GameState} state The state of the board.
 * @returns {BigInt} The unique key representing the state.
 */
export function stateKey(state) {
  let hash = 0n;
  for (const blockId in state) {
    const block = state[blockId];
    for (const [x, y] of block.cells) {
      hash ^= zobristHashTable[x][y][blockIndexMap[blockId]];
    }
  }
  return hash;
}

/**
 * Initialize the game variables and return the initial state.
 * @param {GameType} gameType The GameType.
 * @param {Level} level The GameLevel.
 * @returns {GameState} The initial GameState object.
 */
export function initState(gameType, level) {
  /** @type {GameState} */
  const state = Object.fromEntries(
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
  );

  boardWidth = gameType.width;
  boardHeight = gameType.height;
  winCondition = gameType.winCondition;

  initBlockIndexMap(state);
  initZobristHashTable();

  return state;
}

/**
 * Applies a move to the given state and returns the new state.
 * @param {BigInt} hash The current Zobrist hash.
 * @param {GameState} state The current game state.
 * @param {string} blockId The ID of the block to move.
 * @param {number} dx The x direction of the move.
 * @param {number} dy The y direction of the move.
 * @param {number} distance The distance to move the block.
 * @returns {{newState: GameState, newHash: BigInt}} The new state and its Zobrist hash.
 */
export function applyMove(hash, state, blockId, dx, dy, distance) {
  let newHash = hash;

  // Remove old position from hash
  for (const [x, y] of state[blockId].cells) {
    newHash ^= zobristHashTable[x][y][blockIndexMap[blockId]];
  }

  /** @type {GameState} */
  const newState = {};
  for (const id in state) {
    const block = state[id];
    if (id === blockId) {
      newState[id] = {
        ...block,
        cells: block.cells.map(([x, y]) => [
          x + (distance * dx),
          y + (distance * dy)
        ])
      };
    } else {
      newState[id] = block;
    }
  }

  // Add new position to hash
  const newBlock = newState[blockId];
  for (const [x, y] of newBlock.cells) {
    newHash ^= zobristHashTable[x][y][blockIndexMap[blockId]];
  }

  return { newState, newHash };
}
