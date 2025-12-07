const SVG_NS = 'http://www.w3.org/2000/svg';

export function createRenderer(svg, theme, blockColors) {
  const cellSize = 10;
  const padding = 5;
  const blockMargin = 1;

  let blockElements = {};
  let isInitialized = false;

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

  function drawWinArea(parent, state) {
    switch (theme.winDisplay) {
      case 'exit':
      case 'cells':
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
        break;
      // case 'exit':
      // FIXME: check px, py, width, and height
      //   const exitY = theme.exitRow;
      //   const { px, py } = gameToSvg(state, 0, exitY);
      //   // TODO: Add exitCOlumn to the json file?
      //   // if (theme.exitSides.includes('down')) {
      //   //   const rect = createRect(
      //   //     py + 10, // FIXME: ???
      //   //     padding + state.height * cellSize - 2,
      //   //     cellSize - 20, // FIXME: ???
      //   //     padding,
      //   //     { fill: theme.winArea }
      //   //   );
      //   //   parent.append(rect);
      //   // }
      //   if (theme.exitSide == 'right') {
      //     const rect = createRect(
      //       padding + state.width * cellSize - 2,
      //       py + 10, // FIXME: ???
      //       padding,
      //       cellSize, //- 20, // FIXME: ???
      //       { fill: theme.winArea }
      //     );
      //     parent.append(rect);
      //   }
      //   // TODO: add all directions??
      //   break;
    }
  }

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

  function createBlockElement(state, blockId, block) {
    const group = createGroup(`block-${blockId}`);
    group.setAttribute('data-block-id', blockId); // TODO: add attributes to createGroup function?

    const color = blockColors[blockId];
    const cellRects = [];

    block.cells.forEach(([x, y]) => {
      const { px, py } = gameToSvg(state, x, y);

      const rect = createRect(
        // TODO: check coordinates and margin
        px,// + blockMargin,
        py,// + blockMargin,
        cellSize,// - 2 * blockMargin,
        cellSize,// - 2 * blockMargin,
        {
          fill: color,
          class: 'block-cell',
        }
      );
      cellRects.push(rect);
      group.append(rect);
    });

    return { group, cells: cellRects };
  }

  function updateBlockPosition(state, blockId, block) {
    const element = blockElements[blockId];


    block.cells.forEach(([x, y], index) => {
      const rect = element[index];
      const {px, py } = gameToSvg(state, x, y);
      rect.setAttribute('x', px /* + blockMargin */); // TODO: removed margin
      rect.setAttribute('y', py /* + blockMargin */);
    });
  }

  function gameToSvg(state, gameX, gameY) {
    return {
      px: padding + gameX * cellSize,
      py: padding + (state.height - 1 - gameY) * cellSize
    };
  }

  // TODO: needed?
  function svgToGame(state, svgX, svgY) {
    return {
      x: Math.floor((svgX - padding) / cellSize),
      y: state.height - 1 - Math.floor((svgY - padding) / cellSize) // TODO: is this correct?
    };
  }

  function createGroup(classname) {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', classname);
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

  // TODO: no longer needed?
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

  return { render };
}
