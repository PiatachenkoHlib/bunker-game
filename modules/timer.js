import { GameState } from "./state.js";

// duration - час у секундах, elementId - куди виводити, onFinish - що робити в кінці
export function startTimer(duration, elementId, onFinish) {
    if (GameState.activeTimer) clearInterval(GameState.activeTimer);

    // Використовуємо логіку глобального лічильника
    GameState.currentTime = duration; 
    const display = document.getElementById(elementId);

    function updateDisplay() {
    if (GameState.timerGlitch) {
        display.textContent = "[ЗБІЙ]";
        display.classList.add("red-text");
    } else {
        display.classList.remove("red-text");
        
        let minutes = Math.floor(GameState.currentTime / 60);
        let seconds = GameState.currentTime % 60;
        
        let secondsStr = "";
        if (seconds < 10) {
            secondsStr = "0" + seconds;
        } else {
            secondsStr = seconds;
        }
        
        display.textContent = minutes + ":" + secondsStr;
    }
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
