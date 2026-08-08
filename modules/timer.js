import { GameState } from "./state.js";

// duration - час у секундах, elementId - куди виводити, onFinish - що робити в кінці
export function startTimer(duration, elementId, onFinish) {
    if (GameState.activeTimer) clearInterval(GameState.activeTimer);

    // Використовуємо логіку глобального лічильника
    GameState.currentTime = duration; 
    const display = document.getElementById(elementId);

    function updateDisplay() {
        let minutes = Math.floor(GameState.currentTime / 60);
        let seconds = GameState.currentTime % 60;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
    }

    updateDisplay();

    GameState.activeTimer = setInterval(function () {
        GameState.currentTime--; 
        updateDisplay();

        if (GameState.currentTime <= 0) {
            clearInterval(GameState.activeTimer);
            if (onFinish) onFinish();
        }
    }, 1000);
}
