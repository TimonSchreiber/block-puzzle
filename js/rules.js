import { cellToString } from "./state.js";

export function canMove(state, blockId, direction) {
  // TODO
}

export function getValidMoves() {
  // TODO
}

export function isWon(state) {
  const mainBlocks = Object.values(state.blocks).filter((block) => block.isMain);

  const mainCells = new Set(mainBlocks.flatMap((block) => block.cells).map(cellToString));
  const winCells = new Set(state.winCondition.map(cellToString));

  if (mainCells.size !== winCells.size) {
    return false;
  }

  for (const cell of winCells) {
    if (!mainCells.has(cell)) return false;
  }

  return true;
}
