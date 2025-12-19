import { createRenderer } from './renderer.js';
import { solve } from './solver.js';
import { boardHeight, boardWidth, initState, winCondition } from './state.js';

// load level
const response = await fetch('../levels.json');
const games = await response.json();

/** @type {HTMLButtonElement} */
const solveButton = document.querySelector('button#solve-button');

/** @type {HTMLSelectElement} */
const levelSelect = document.querySelector('select#level-select');

/** @type {GameType} */
let game;

/** @type {Level} */
let level;

/** @type {GameState} */
let state;

/** @type {Renderer} */
let renderer;

/**
 * Sleeps for the specified time.
 * @param {number} ms Time to sleep in milliseconds.
 */
const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

/** Populates the level select element with available games and levels. */
const populateSelectElement = () => {
  Object.entries(games).forEach(([id, gameType]) => {
    const optGroup = document.createElement('optgroup');
    optGroup.label = gameType.name;

    /** @param {Level} level */
    const addLevel = (level) => {
      const option = document.createElement('option');
      option.value = `${id}:${level.id}`;
      option.textContent = level.name;
      optGroup.append(option);
    };

    gameType.levels.forEach(addLevel);
    levelSelect.append(optGroup);
  });
};

/** Handles the change event for the level select element. */
const handleLevelSelectChange = () => {
  if (!levelSelect.value) {
    solveButton.disabled = true;
    return;
  }

  const [selectedGame, selectedLevel] = levelSelect.value.split(':');

  game = games[selectedGame];
  level = game.levels[parseInt(selectedLevel)];

  state = initState(game, level);

  // Create renderer
  const svg = document.querySelector('svg');
  svg.innerHTML = '';
  renderer = createRenderer(
    svg,
    { width: boardWidth, height: boardHeight, winCondition },
    game.theme,
    Object.fromEntries(
      Object.entries(level.blocks)
        .map(([blockId, block]) => [blockId, block.color])
    )
  );
  renderer.render(state);

  solveButton.disabled = false;
};

/** Handles solving the current game level. */
const solveGame = async () => {
  // Compute and show solution
  console.log(`Start solving ${game.name} - ${level.name} ...`);

  const start = performance.now();
  const solution = solve(state);
  const end = performance.now();
  console.log(`Time: ${(end - start).toFixed(3)} ms`);

  for (const gameState of solution) {
    renderer.render(gameState);
    await sleep(300);
  }
};

// Event listeners
solveButton.addEventListener('click', solveGame);

populateSelectElement();
levelSelect.addEventListener('change', handleLevelSelectChange);
