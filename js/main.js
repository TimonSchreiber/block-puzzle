import { createRenderer } from './renderer.js';
import { solve } from './solver.js';
import { applyMove, createState, initBlockIndexMap, initZobristHashTable } from './state.js';

/** @typedef {import('./types.js').Cell} Cell */
/** @typedef {import('./types.js').Direction} Direction */
/** @typedef {import('./types.js').MoveType} MoveType */
/** @typedef {import('./types.js').BlockType} BlockType */
/** @typedef {import('./types.js').Block} Block */
/** @typedef {import('./types.js').GameState} GameState */
/** @typedef {import('./types.js').Move} Move */
/** @typedef {import('./types.js').Theme} Theme */
/** @typedef {import('./types.js').Defaults} Defaults */
/** @typedef {import('./types.js').GameType} GameType */
/** @typedef {import('./types.js').Level} Level */
/** @typedef {import('./types.js').LevelBlock} LevelBlock */
/** @typedef {import('./types.js').RuleSet} RuleSet */

// load level
const response = await fetch('../levels.json');
const games = await response.json();

/** @type {globalThis.GameType} */
let game;

/** @type {globalThis.Level} */
let level;

/** @type {globalThis.GameState} */
let state;

let renderer;

// Solve button
const buttonSolve = document.querySelector('button');
buttonSolve.addEventListener('click', (async () => {
    // Compute and show solution
    console.log('Start solving...');

    const start = performance.now();
    const solution = solve(state);
    const end = performance.now();
    console.log('Time:', (end - start).toFixed(3), 'ms');

    for (const move of solution) {
      renderer.render(state);
      state = applyMove(state, move);
      await sleep(300);
    }

    renderer.render(state);

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }));

// Level selector
const levelSelect = document.getElementById('level-select');
Object.entries(games).forEach(([id, gameType]) => {
  const optGroup = document.createElement('optgroup');
  optGroup.label = gameType.name;
  gameType.levels.forEach((level) => {
    const option = document.createElement('option');
    option.value = `${id}:${level.id}`;
    option.textContent = level.name;
    optGroup.append(option);
  });
  levelSelect.append(optGroup)
});

levelSelect.addEventListener('change', (event) => {
  const [selectedGame, selectedLevel] = event.target.value.split(':');

  game = games[selectedGame];
  level = game.levels[parseInt(selectedLevel)];

  state = createState(game, level);

  initBlockIndexMap(state);
  initZobristHashTable(state);

  // Create renderer
  const svg = document.querySelector('svg');
  svg.innerHTML = '';
  renderer = createRenderer(
    svg, game.theme,
    Object.fromEntries(
      Object.entries(level.blocks)
        .map(([blockId, block]) => [blockId, block.color])
    )
  );
  renderer.render(state);

  buttonSolve.disabled = false;
});
