/** @type {number} */
export let boardWidth = undefined;

/** @type {number} */
export let boardHeight = undefined;

/** @type {Set<Cell>} */
export let winCondition = undefined;

/** @type {Set<number>} */
export let winCellKeys = undefined;

/** @type {Record<string, number>} */
let shapeIndexMap = undefined;

/** @type {BigInt[][][]} */
let zobristHashTable = undefined;

/**
 * Generates a shape signature for a block.
 * @param {Block} block The block to generate the signature for.
 * @returns {string} The shape signature of the block.
 */
function getShapeSignature(block) {
  // Normalize cells relative to top-left
  const sorted = [...block.cells].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const [minX, minY] = sorted[0];
  const normalized = sorted.map(([x, y]) => `${x - minX},${y - minY}`).join(';');

  // Include movement properties that affect game logic
  const dirs = [...block.dirs].sort().join(',');
  return `${normalized}|${block.moveType}|${dirs}|${block.isMain}`;
}

/**
 * Initialize the shape index map.
 * @param {GameState} state The current game state.
 */
function initShapeIndexMap(state) {
  shapeIndexMap = {};
  const shapeToIndex = {};
  let nextIndex = 0;

  for (const blockId in state) {
    const shape = getShapeSignature(state[blockId]);
    if (!(shape in shapeToIndex)) {
      shapeToIndex[shape] = nextIndex++;
    }
    shapeIndexMap[blockId] = shapeToIndex[shape];
  }
}

/**
 * Initialize the Zobrist hash table.
 */
function initZobristHashTable() {
  const numShapes = new Set(Object.values(shapeIndexMap)).size;
  zobristHashTable = [];
  for (let x = 0; x < boardWidth; x++) {
    zobristHashTable[x] = [];
    for (let y = 0; y < boardHeight; y++) {
      zobristHashTable[x][y] = [];
      for (let s = 0; s < numShapes; s++) {
        const high = BigInt(Math.floor(Math.random() * 2**32));
        const low = BigInt(Math.floor(Math.random() * 2**32));
        zobristHashTable[x][y][s] = (high << 32n) ^ low;
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
      hash ^= zobristHashTable[x][y][shapeIndexMap[blockId]];
    }
  }
  return hash;
}

/**
 * Translates a Cell object into a number.
 * @param {Cell} cell The x and y coordinates of a cell.
 * @returns A number representing the Cell object.
 */
export const cellKey = ([x, y]) => x + y * boardWidth;

/**
 * Checks if the given cell is a win cell.
 * @param {Cell} cell The x and y coordinates of a cell.
 * @returns {boolean} True if the cell is a win cell.
 */
export const isWinCell = ([x, y]) => winCellKeys.has(cellKey([x, y]));

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
  winCondition = new Set(gameType.winCondition);
  winCellKeys = new Set(gameType.winCondition.map(cellKey));

  initShapeIndexMap(state);
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
    newHash ^= zobristHashTable[x][y][shapeIndexMap[blockId]];
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
    newHash ^= zobristHashTable[x][y][shapeIndexMap[blockId]];
  }

  return { newState, newHash };
}
