const SVG_NS = 'http://www.w3.org/2000/svg';

// TODO: add styles and change rectangle/circle/triangle of json to generic?/car/truck/rabbit/fox/mushroom
// const blockTypeStyles = { rabbit: { shape: '...', pattern: '...', borderRadius: '...' }} // corner-shape?

/**
 * Creates a renderer for the game.
 * @param {SVGSVGElement} svg The SVG element to render into.
 * @param {Board} board The game board.
 * @param {Theme} theme The theme object.
 * @param {Record<string, string>} blockColors A mapping of block IDs to colors.
 * @returns {Renderer} The renderer object with a render method.
 */
export function createRenderer(svg, board, theme, blockColors) {
  const cellSize = 10;
  const padding = 5;
  const blockMargin = 1;

  let blockElements = {};
  let isInitialized = false;

  /**
   * Initializes the renderer.
   */
  function initialize() {
    const width = board.width * cellSize + 2 * padding;
    const height = board.height * cellSize + 2 * padding;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.background = theme.background;
    svg.innerHTML = '';

    const gridLayer = createGroup('grid-layer'); // TODO: needed?
    const winLayer = createGroup('win-layer');
    const blocksLayer = createGroup('blocks-layer');
    svg.append(gridLayer, winLayer, blocksLayer)

    drawBoard(gridLayer);
    drawWinArea(winLayer);

    isInitialized = true;
  }

  /**
   * Draws the board.
   * @param {SVGElement} parent The parent SVG element.
   */
  function drawBoard(parent) {
    const boardBackground = createRect(
      padding, padding,
      board.width * cellSize, board.height * cellSize,
      { fill: theme.board }
    );
    parent.append(boardBackground);

    // TODO: is the grid needed?
    // for (let x = 0; x <= board.width; x++) {
    //   const line = createLine(
    //     padding + x * cellSize, padding,
    //     padding + x * cellSize, padding + board.height * cellSize,
    //     { stroke: theme.board, 'stroke-width': 1 }
    //   );
    //   parent.append(line);
    // }

    // for (let y = 0; y <= board.height; y++) {
    //   const line = createLine(
    //     padding, padding + y * cellSize,
    //     padding + board.width * cellSize, padding + y * cellSize,
    //     { stroke: theme.board, 'stroke-width': 1 }
    //   );
    //   parent.append(line);
    // }
  }

  /**
   * Draws the win area.
   * @param {SVGElement} parent The parent SVG element.
   */
  function drawWinArea(parent) {
    board.winCondition.forEach(([x, y]) => {
      const { px, py } = gameToSvg(x, y);
      const rect = createRect(
        // TODO: subtracted and added blockmargin temporarily to make it visible: find a better solution!
        px - blockMargin, py - blockMargin,
        cellSize + 2 * blockMargin, cellSize + 2 * blockMargin,
        { fill: theme.winArea, opacity: 0.25, class: 'win-cell' }
      );
      parent.append(rect);
    });
  }

  /**
   * Renders the given game state.
   * @param {GameState} state The state of the board.
   */
  function render(state) {
    if (!isInitialized) {
      initialize();
    }

    const blocksLayer = svg.querySelector('.blocks-layer');

    for (const blockId in state) {
      const block = state[blockId];
      if (blockElements[blockId]) {
        updateBlockPosition(blockId, block);
      } else {
        const { group, cells } = createBlockElement(blockId, block);
        blocksLayer.append(group);
        blockElements[blockId] = cells;
      }
    }
  }

  /**
   * Creates a block element.
   * @param {string} blockId The ID of the block.
   * @param {Block} block The block object.
   * @returns {{group: SVGElement, cells: SVGElement[]}} The group element and cell rectangles.
   */
  function createBlockElement(blockId, block) {
    const group = createGroup(`block-${blockId}`);
    group.setAttribute('data-block-id', blockId); // TODO: add attributes to createGroup function?

    // TODO: check blockTypeStyles[blockId] //blockType

    const color = blockColors[blockId];
    const cellRects = [];

    for (const [x, y] of block.cells) {
      const { px, py } = gameToSvg(x, y);

      // if (style.shape === 'cirlcle') {
      //   // TODO: add draw circle function back to renderer.js
      //   // TODO: add more shape types?
      // } else {
        const rect = createRect(
          px, py,
          cellSize, cellSize,
          { fill: color, class: 'block-cell' }
        );
        cellRects.push(rect);
        group.append(rect);
      // }
    }

    return { group, cells: cellRects };
  }

  /**
   * Updates the position of a block element.
   * @param {string} blockId The ID of the block.
   * @param {Block} block The block object.
   */
  function updateBlockPosition(blockId, block) {
    const element = blockElements[blockId];

    block.cells.forEach(([x, y], index) => {
      const rect = element[index];
      const {px, py } = gameToSvg(x, y);
      rect.setAttribute('x', px /* + blockMargin */); // TODO: removed margin
      rect.setAttribute('y', py /* + blockMargin */);
    });
  }

  /**
   * Converts game coordinates to SVG coordinates.
   * @param {number} gameX The x coordinate in game space.
   * @param {number} gameY The y coordinate in game space.
   * @returns {{px: number, py: number}} The SVG coordinates {px, py}.
   */
  function gameToSvg(gameX, gameY) {
    return {
      px: padding + gameX * cellSize,
      py: padding + (board.height - 1 - gameY) * cellSize
    };
  }

  /**
   * TODO: needed?
   * @param {number} svgX
   * @param {number} svgY
   * @returns {{x: number, y: number}} The game coordinates {x, y}.
   */
  function svgToGame(svgX, svgY) {
    return {
      x: Math.floor((svgX - padding) / cellSize),
      y: board.height - 1 - Math.floor((svgY - padding) / cellSize) // TODO: is this correct?
    };
  }

  /**
   * Creates an SVG group element.
   * @param {string} classname The class name for the group.
   * @returns {SVGElement} The created group element.
   */
  function createGroup(classname) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', classname);
    return g;
  }

  /**
   * Creates an SVG rectangle element.
   * @param {number} x The x coordinate.
   * @param {number} y The y coordinate.
   * @param {number} width The width.
   * @param {number} height The height.
   * @param {Record<string, unknown>} [attr] Additional attributes as key-value pairs.
   * @returns {SVGElement} The created rectangle element.
   */
  function createRect(x, y, width, height, attr = {}) {
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', `${x}`);
    rect.setAttribute('y', `${y}`);
    rect.setAttribute('width', `${width}`);
    rect.setAttribute('height', `${height}`);

    for (const k in attr) {
      rect.setAttribute(k, `${attr[k]}`);
    }

    return rect;
  }

  return { render };
}
