const SVG_NS = 'http://www.w3.org/2000/svg';

export function createRenderer(svg) {
  const cellSize = 10;
  const padding = 5;
  const blockMargin = 1;

  let blockElements = {};
  let isInitialized = false;

  function initialize(state) {
    const width = state.width * cellSize + 2 * padding;
    const height = state.height * cellSize + 2 * padding;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.innerHtml = '';

    const gridGroup = createGroup('grid-layer');
    const winGroup = createGroup('win-layer');
    const blocksGroup = createGroup('blocks-layer');
    svg.append(gridGroup, winGroup, blocksGroup)

    const background = createRect(
      padding, padding,
      state.width * cellSize, state.height * cellSize,
      { fill: 'lightgrey' }
    );
    gridGroup.append(background);

    drawGrid(gridGroup, state);
    drawWinArea(winGroup, state);

    isInitialized = true;
  }

  function drawGrid(parent, state) {
    const gridColor = 'grey';

    for (let x = 0; x <= state.width; x++) {
      const line = createLine(
        padding + x * cellSize, padding,
        padding + x * cellSize, padding + state.height * cellSize,
        { stroke: gridColor, 'stroke-width': 1 }
      );
      parent.append(line);
    }

    for (let y = 0; y <= state.height; y++) {
      const line = createLine(
        padding, padding + y * cellSize,
        padding + state.width * cellSize, padding + y * cellSize,
        { stroke: gridColor, 'stroke-width': 1 }
      );
      parent.append(line);
    }
  }

  function drawWinArea(parent, state) {
    // TODO: maybe only draw the outline and not filled
    state.winCondition.forEach(([x, y]) => {
      const { px, py } = gameToSvg(state, x, y);
      const rect = createRect(
        px, py,
        cellSize, cellSize,
        { fill: 'red', opacity: 0.25 }
      );
      parent.append(rect);
    });
  }

  function render(state) {
    if (!isInitialized) {
      initialize(state);
    }

    const blocksGroup = svg.querySelector('.blocks-layer');

    blocksGroup.innerHtml = '';
    blockElements = {};

    Object.entries(state.blocks).forEach(([blockId, block]) => {
      const element = createBlockElement(state, blockId, block);
      blocksGroup.append(element);
      blockElements[blockId] = element;
    });
  }

  function createBlockElement(state, blockId, block) {
    const group = createGroup(`block-${blockId}`);
    group.setAttribute('data-block-id', blockId); // TODO: add attributes to createGroup function?

    const bounds = getBlockBounds(block.cells);
    const { px, py } = gameToSvg(state, bounds.minX, bounds.maxY);
    const width = (bounds.maxX - bounds.minX + 1) * cellSize;
    const height = (bounds.maxY - bounds.minY + 1) * cellSize;

    const rect = createRect(
      px + blockMargin,
      py + blockMargin,
      width - 2 * blockMargin,
      height - 2 * blockMargin,
      {
        fill: block.color,
        class: 'block-rect',
      }
    );

    group.append(rect);

    return group;
  }

  function gameToSvg(state, gameX, gameY) {
    return {
      px: padding + gameX * cellSize,
      py: padding + (state.height - 1 - gameY) * cellSize
    };
  }

  function svgToGame(state, svgX, svgY) {
    return {
      x: Math.floor((svgX - padding) / cellSize),
      y: state.height - 1 - Math.floor((svgY - padding) / cellSize) // TODO: is this correct?
    };
  }

  function getBlockBounds(cells) {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    cells.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });

    return { minX, minY, maxX, maxY };
  }

  function createGroup(classname) {
    const g = document.createElementNS(SVG_NS, 'g');
    if (classname) {
      g.setAttribute('class', classname);
    }
    return g;
  }

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

  function createLine(x1, y1, x2, y2, attr = {}) {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);

    Object.entries(attr)
      .forEach(([k, v]) => line.setAttribute(k, v));

    return line;
  }

  return {
    render,
    svgToGame
  };
}
