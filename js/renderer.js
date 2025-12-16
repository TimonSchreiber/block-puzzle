const SVG_NS = 'http://www.w3.org/2000/svg';


// TODO: add styles and change rectangle/circle/triangle of json to generic?/car/truck/rabbit/fox/mushroom
// const blockTypeStyles = { rabbit: { shape: '...', pattern: '...', borderRadius: '...' }} // corner-shape?

/**
 * TODO
 * @param {SVGSVGElement} svg
 * @param {*} theme
 * @param {*} blockColors
 * @returns
 */
export function createRenderer(svg, theme, blockColors) {
  const cellSize = 10;
  const padding = 5;
  const blockMargin = 1;

  let blockElements = {};
  let isInitialized = false;

  /**
   * TODO
   * @param {GameState} state
   */
  function initialize(state) {
    const boardWidth = state.width * cellSize + 2 * padding;
    const boardHeight = state.height * cellSize + 2 * padding;

    svg.setAttribute('viewBox', `0 0 ${boardWidth} ${boardHeight}`);
    svg.style.background = theme.background;
    svg.innerHtml = '';

    const gridLayer = createGroup('grid-layer'); // TODO: needed?
    const winLayer = createGroup('win-layer');
    const blocksLayer = createGroup('blocks-layer');
    svg.append(gridLayer, winLayer, blocksLayer)

    drawBoard(gridLayer, state);
    drawWinArea(winLayer, state);

    isInitialized = true;
  }

  /**
   * TODO
   * @param {SVGElement} parent
   * @param {GameState} state
   */
  function drawBoard(parent, state) {
    const boardBackground = createRect(
      padding, padding,
      state.width * cellSize, state.height * cellSize,
      { fill: theme.board }
    );
    parent.append(boardBackground);

    // TODO: is the grid needed?
    // for (let x = 0; x <= state.width; x++) {
    //   const line = createLine(
    //     padding + x * cellSize, padding,
    //     padding + x * cellSize, padding + state.height * cellSize,
    //     { stroke: theme.board, 'stroke-width': 1 }
    //   );
    //   parent.append(line);
    // }

    // for (let y = 0; y <= state.height; y++) {
    //   const line = createLine(
    //     padding, padding + y * cellSize,
    //     padding + state.width * cellSize, padding + y * cellSize,
    //     { stroke: theme.board, 'stroke-width': 1 }
    //   );
    //   parent.append(line);
    // }
  }

  /**
   * TODO
   * @param {SVGElement} parent
   * @param {GameState} state
   */
  function drawWinArea(parent, state) {
    state.winCondition.forEach(([x, y]) => {
      const { px, py } = gameToSvg(state, x, y);
      const rect = createRect(
        // TODO: subtarcted and added blockmargin temporarily to make it visible: find a better solution!
        px - blockMargin, py - blockMargin,
        cellSize + 2 * blockMargin, cellSize + 2 * blockMargin,
        { fill: theme.winArea, opacity: 0.25, class: 'win-cell' }
      );
      parent.append(rect);
    });
  }

  /**
   * TODO
   * @param {GameState} state
   */
  function render(state) {
    if (!isInitialized) {
      initialize(state);
    }

    const blocksLayer = svg.querySelector('.blocks-layer');

    Object.entries(state.blocks).forEach(([blockId, block]) => {
      if (blockElements[blockId]) {
        updateBlockPosition(state, blockId, block);
      } else {
        const { group, cells } = createBlockElement(state, blockId, block);
        blocksLayer.append(group);
        blockElements[blockId] = cells;
      }
    });
  }

  /**
   * TODO:
   * @param {GameState} state
   * @param {string} blockId
   * @param {Block} block
   * @returns
   */
  function createBlockElement(state, blockId, block) {
    const group = createGroup(`block-${blockId}`);
    group.setAttribute('data-block-id', blockId); // TODO: add attributes to createGroup function?

    // TODO: check blockTypeSyles[block.blockType]

    const color = blockColors[blockId];
    const cellRects = [];

    for (const [x, y] of block.cells) {
      const { px, py } = gameToSvg(state, x, y);

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
   * TODO
   * @param {GameState} state
   * @param {string} blockId
   * @param {Block} block
   */
  function updateBlockPosition(state, blockId, block) {
    const element = blockElements[blockId];

    block.cells.forEach(([x, y], index) => {
      const rect = element[index];
      const {px, py } = gameToSvg(state, x, y);
      rect.setAttribute('x', px /* + blockMargin */); // TODO: removed margin
      rect.setAttribute('y', py /* + blockMargin */);
    });
  }

  /**
   * TODO
   * @param {GameState} state
   * @param {number} gameX
   * @param {number} gameY
   * @returns
   */
  function gameToSvg(state, gameX, gameY) {
    return {
      px: padding + gameX * cellSize,
      py: padding + (state.height - 1 - gameY) * cellSize
    };
  }

  /**
   * TODO: needed?
   * @param {GameState} state
   * @param {number} svgX
   * @param {number} svgY
   * @returns
   */
  function svgToGame(state, svgX, svgY) {
    return {
      x: Math.floor((svgX - padding) / cellSize),
      y: state.height - 1 - Math.floor((svgY - padding) / cellSize) // TODO: is this correct?
    };
  }

  /**
   * TODO
   * @param {string} classname
   * @returns
   */
  function createGroup(classname) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', classname);
    return g;
  }

  /**
   * TODO
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {Object} [attr]
   * @returns
   */
  function createRect(x, y, width, height, attr = {}) {
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);

    Object.entries(attr)
      .forEach(([k, v]) => rect.setAttribute(k, v));

    return rect;
  }

  return { render };
}
