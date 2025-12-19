/**
 * Compare two SearchNodes by their f value.
 * @param {SearchNode} a The first SearchNode.
 * @param {SearchNode} b The second SearchNode.
 * @returns {number} Negative if a < b, positive if a > b, zero if equal
 */
const compare = (a, b) => a.f - b.f;

/**
 * Returns the index of the parent node in a binary heap.
 * @param {number} i The index of the current node.
 * @returns {number} The index of the parent node.
 */
const parent = (i) => Math.floor((i - 1) / 2);

/**
 * Returns the index of the left child node in a binary heap.
 * @param {number} i The index of the current node.
 * @returns {number} The index of the left child node.
 */
const left = (i) => 2 * i + 1;

/**
 * Returns the index of the right child node in a binary heap.
 * @param {number} i The index of the current node.
 * @returns {number} The index of the right child node.
 */
const right = (i) => 2 * i + 2;

/**
 * Inserts a node into the open list in the correct position based on its f value.
 * @param {SearchNode[]} open The open list.
 * @param {SearchNode} node The node to insert.
 */
export function insert(open, node) {
  // insert at end
  let index = open.length;
  open.push(node);

  // rebalance the heap
  while (index > 0) {
    const parentIndex = parent(index);

    // Swap with parent if necessary
    if (compare(open[index], open[parentIndex]) >= 0) {
      break;
    }

    [open[index], open[parentIndex]] = [open[parentIndex], open[index]];
    index = parentIndex;
  }
}

/**
 * Extracts and removes the node with the minimum f value from the open list.
 * @param {SearchNode[]} open The open list.
 * @returns {?SearchNode} The node with the minimum f value, or null if the list is empty.
 */
export function extractMin(open) {
  if (open.length === 0) {
    return null;
  }

  const minNode = open[0];
  const lastNode = open.pop();

  if (open.length === 0) {
    return minNode;
  }

  // replace root with last element
  open[0] = lastNode;

  let index = 0;

  // rebalance the heap
  while (left(index) < open.length) {
    const leftIndex = left(index);
    const rightIndex = right(index);

    // Find the smaller child
    let smallerChild = leftIndex;
    if (rightIndex < open.length && compare(open[rightIndex], open[leftIndex]) < 0) {
      smallerChild = rightIndex;
    }

    // Swap with the smaller child if necessary
    if (compare(open[index], open[smallerChild]) <= 0) {
      break;
    }

    [open[index], open[smallerChild]] = [open[smallerChild], open[index]];
    index = smallerChild;
  }

  return minNode;
}
