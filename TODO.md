# Block Puzzles


## TODOs:

- Improve Heuristic
- Simplify json file be defining default attributes for each game, but also add more styling options to each block
- Adjust Rabbit Colors to match original game
- Renderer: "exitSide" how to convey where to draw the border?
- Renderer: Allow for more variation in block shape -> Why does "Block" carry the shape?
- Move Solver related variables (blockIndexMap, zobristHashTable) into solver.js file?

- Improve solver.js with batching or web worker to not block the page


## DirtyDozen - BFS to A*:
### Game 10:
#### BFS:
- 67,119 iterations
- 150 moves
- 10.495 seconds
#### A*:
- 60,755 iterations
- 150 moves
- 10.064 seconds
#### A*/h=totalDistance/shapeIndexMap
- 34,235 iterations
- 150 moves
- 7.771 seconds

### Game 12:
#### BFS:
- 652,955 iterations
- 226  moves
- 104.016 seconds
#### A*:
- 632,387 iterations
- 226  moves
- 111.125 seconds
#### A*/h=totalDistance/shapeIndexMap
- 532,265 iterations
- 226 moves
- 42.298
