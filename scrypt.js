import { setupListeners } from './modules/dom.js';
import { initLock, generateCode } from './modules/lock.js';
import { initMatrix } from './modules/matrix.js';
import { GameState } from './modules/state.js';
import { generateHints } from './modules/hints.js';
import { initRoles, assignAllRoles, updateRoleScreen } from './modules/roles.js';
import { outputData } from './modules/text.js';

// --- Ініціалізація гри ---
initLock();
initMatrix();
setupListeners();

// ПОЧАТОК ГРИ
export function startGame() {
    GameState.gameCode = generateCode();
    GameState.allHints = generateHints(GameState.gameCode);
    GameState.discusTime = GameState.playersNumber * 60;

    GameState.roundsNum = 9 - GameState.playersNumber;

    initRoles(GameState.playersNumber);

    assignAllRoles();

    GameState.currentPlayer = 1;
    updateRoleScreen();
}