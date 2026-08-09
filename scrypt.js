import { setupListeners } from './modules/dom.js';
import { initLock, generateCode } from './modules/lock.js';
import { initMatrix } from './modules/matrix.js';
import { GameState } from './modules/state.js';
import { generateHints } from './modules/hints.js';
import { initRoles, assignAllRoles, updateRoleScreen } from './modules/roles.js';

// --- Ініціалізація гри ---
initLock();
initMatrix();
setupListeners();

// ПОЧАТОК ГРИ
export function startGame() {
    GameState.gameCode = generateCode();
    GameState.hintsList = generateHints(GameState.gameCode);
    GameState.discusTime = GameState.playersNumber * 60;

    GameState.roundsNum = 10 - GameState.playersNumber;

    initRoles(GameState.playersNumber);

    assignAllRoles();

    GameState.currentPlayer = 1;
    updateRoleScreen(); // Заповнюємо картку для першого гравця
}