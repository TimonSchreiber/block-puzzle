/**
 * @typedef {[number, number]} Cell
 * A position on the board as [x, y]
 */

/**
 * @typedef {'up' | 'down' | 'left' | 'right'} Direction
 */

/**
 * @typedef {'slide' | 'jump'} MoveType
 */

/** TODO: replace with rabbit/fox/car/truck/mushroom/generic/...
 * @typedef {'rectangle' | 'circle' | 'triangle'} BlockType
 */

/**
 * @typedef {Object} Block
 * @property {Cell[]} cells - Positions occupied by this block
 * @property {boolean} isMain - Whether this is a main block
 * @property {Direction[]} dirs - Allowed movement directions
 * @property {MoveType} moveType - Movement type
 * @property {BlockType} blockType - Visual block type // TODO: why store this here?
 */

/**
 * @typedef {Object<string, Block>} GameState
 */

/**
 * @typedef {Object} Move
 * @property {string} blockId - Which block to move
 * @property {Direction} direction - Direction to move
 * @property {number} distance - Distance to move
 */

/**
 * @typedef {Object} Board
 * @property {number} width - Board width
 * @property {number} height - Board height
 * @property {Cell[]} winCondition - Cells that main blocks must occupy
 */

/**
 * @typedef {Object} Theme
 * @property {string} background - Background colo
 * @property {string} board - Board color
 * @property {string} grid - Grid line color // TODO: remove if not used
 * @property {string} winArea - Win area highlight color
 */

/**
 * @typedef {Object} Defaults
 * @property {Direction[]} dirs - The default allowed directions.
 * @property {MoveType} moveType - The default move type.
 * @property {BlockType} blockType - The default block type.
 */

/**
 * @typedef {Object} GameType
 * @property {string} name - Display name
 * @property {number} width - Board width
 * @property {number} height - Board height
 * @property {Cell[]} winCondition - Win positions
 * @property {Defaults} defaults - Default block properties
 * @property {Theme} theme - Visual theme
 * @property {Level[]} levels - Available levels
 */

/**
 * @typedef {Object} Level
 * @property {number} id - Level ID
 * @property {string} name - Level name
 * @property {number} optimalMoves - Known optimal solution length
 * @property {Object<string, LevelBlock>} blocks - Block definitions
 */

/**
 * @typedef {Object} LevelBlock
 * @property {Cell[]} cells - Initial positions
 * @property {boolean} [isMain] - Is this a main block
 * @property {Direction[]} [dirs] - Movement directions (overrides default)
 * @property {MoveType} [moveType] - Movement type (overrides default)
 * @property {BlockType} [blockType] - Visual block type
 * @property {string} color - Block color
 */

/**
 * @typedef {Object} Renderer
 * @property {(state: GameState) => void} render - Renders the given game state
 */

/** TODO: used?
 * @typedef {Object} RuleSet
 * @property {(state: GameState, blockId: string, direction: Direction) => boolean} canMove
 * @property {(state: GameState) => Move[]} getValidMoves
 * @property {(state: GameState, blockId: string, direction: Direction) => number} getMoveDistance
 */

/**
 * @typedef {Object} SearchNode
 * @property {GameState} state - The game state
 * @property {SearchNode} [parent] - The parent node
 * @property {BigInt} hash - The Zobrist hash of the state
 * @property {number} g - Cost from start to this node
 * @property {number} f - Estimated remaining cost to goal
 */
