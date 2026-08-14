import { GameState } from './state.js';
import { getRandomInt } from './utils.js';
import { outputData } from './text.js';
import { toWin, toLose, toNewRound } from './translations.js';
import { lockDigitsUI } from './dom.js';

export function generateCode() {

    let number = [];

    number[0] = getRandomInt(0, 9);

    number[1] = getRandomInt(0, 9);
    while(number[1] === number[0]) {
        number[1] = getRandomInt(0, 9);
    }
    
    number[2] = getRandomInt(0, 9);
    while(number[2] === number[0] || number[2] === number[1]) {
        number[2] = getRandomInt(0, 9);
    }

    return number;
}

// Перевірки замка
export function mastermindCheck(inputNum, targetNum) {
    let guessedDigs = 0;
    let fullGuessedDigs = 0;
    let uniqueInput = Array.from(new Set(inputNum));

    for (let i = 0; i < uniqueInput.length; i++) {
        if (targetNum.includes(uniqueInput[i])) {
            guessedDigs++;
        }
    }
    for (let i = 0; i < inputNum.length; i++) {
        if (inputNum[i] === targetNum[i]) {
            fullGuessedDigs++;
        }
    }

    // Запис історії для звичайного вводу
    let historyEntry = `${inputNum.join('')}: ${guessedDigs}|${fullGuessedDigs}`;    
    GameState.lockHistory.push(historyEntry);

    // Очищаємо класи перед фарбуванням
    lockDigitsUI.forEach(el => el.classList.remove('green-text', 'yellow-text', 'red-text'));

    // Фарбування замка
    
    if (fullGuessedDigs === targetNum.length) {
        lockDigitsUI.forEach(el => el.classList.add('green-text'));
        return true;
    } else {
        lockDigitsUI.forEach(el => el.classList.add('red-text'));
        return `Знайдено цифр: <b>${guessedDigs}</b><br>З них на своєму місці: <b>${fullGuessedDigs}</b>`;
    }
}

export function wordleCheck(inputNum, targetNum) {
    let result = '';
    let fullGuessedDigs = 0;
    let historyEntry = "";

    for (let i = 0; i < inputNum.length; i++) { 
        lockDigitsUI[i].classList.remove('green-text', 'yellow-text', 'red-text');

        if (inputNum[i] === targetNum[i]) { 
            result += `<b>${inputNum[i]}</b> — є, і на своєму місці<br>`;
            historyEntry += `<span class="green-text">${inputNum[i]}</span> `; 
            lockDigitsUI[i].classList.add('green-text');
            fullGuessedDigs++; 
        } 
        else if (targetNum.includes(inputNum[i])) { 
            result += `<b>${inputNum[i]}</b> — є, але не на своєму місці<br>`;
            historyEntry += `<span class="yellow-text">${inputNum[i]}</span> `; 
            lockDigitsUI[i].classList.add('yellow-text');
        } 
        else {
            result += `<b>${inputNum[i]}</b> — немає<br>`;
            historyEntry += `<span class="red-text">${inputNum[i]}</span> `; 
            lockDigitsUI[i].classList.add('red-text');
        }
    }

    GameState.lockHistory.push(historyEntry.trim());

    if (fullGuessedDigs === targetNum.length) return true;
    else return result;
}

// Обробка введеного коду
export function inputCode(code) {
    let result = GameState.isWordleCheck ? wordleCheck(code, GameState.gameCode) : mastermindCheck(code, GameState.gameCode);

    if (result === true) {
        toWin();
        return;
    } else if (GameState.currentRound === GameState.roundsNum) {
        toLose();
        return;
    }
    
    outputData("НЕПРАВИЛЬНИЙ КОД", result, 'alert-text');
    GameState.transitionTimeout = setTimeout(toNewRound, 6000);

    GameState.isLockActive = false;
}

// Прокрутка цифр, ініціалізація замка
export function initLock() {
    lockDigitsUI.forEach((digitElement) => {
        let startY = 0;
        let endY = 0;
        let startTime = 0; // Для вимірювання часу
        const threshold = 30; 

        function updateDigit(delta, timeElapsed) {
            if (!GameState.isLockActive) return; 

            let val = parseInt(digitElement.textContent);
            
            // Визначаємо швидкість (пікселів на мілісекунду)
            let velocity = Math.abs(delta) / timeElapsed;
            
            // Скільки цифр прогорнути за раз
            let steps = 1;
            if (velocity > 1.2) steps = 3;      // Дуже швидкий свайп
            else if (velocity > 0.6) steps = 2; // Середній свайп

            if (delta > 0) {
                // Свайп ВГОРУ (використовуємо остачу від ділення для циклічності)
                val = (val + steps) % 10;
            } else {
                // Свайп ВНИЗ
                val = (val - steps + 10) % 10;
            }
            digitElement.textContent = val;
        }

        // --- Обробка Touch ---
        digitElement.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startTime = Date.now();
        });

        digitElement.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

        digitElement.addEventListener('touchend', (e) => {
            endY = e.changedTouches[0].clientY;
            let timeElapsed = Date.now() - startTime;
            let deltaY = startY - endY;

            if (Math.abs(deltaY) > threshold) updateDigit(deltaY, timeElapsed);
        });

        // --- Обробка Миші ---
        let isMouseDown = false;
        
        digitElement.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            startY = e.clientY;
            startTime = Date.now();
        });

        window.addEventListener('mouseup', (e) => {
            if (!isMouseDown) return;
            isMouseDown = false;
            endY = e.clientY;
            let timeElapsed = Date.now() - startTime;
            let deltaY = startY - endY;

            if (Math.abs(deltaY) > threshold) updateDigit(deltaY, timeElapsed);
        });
    });

    // --- Рандомне переключення замка ---
    setInterval(() => {
        // Замок крутиться сам лише під час активних раундів (не на брифінгу),
        // коли він не заблокований подією "БЛОК" і не на екрані передачі
        if (GameState.isLockActive) {
            
            // 10% імовірність кожні 2 секунди
            if (Math.random() <= 0.10) { 
                let randIndex = getRandomInt(0, 2); // Обираємо випадкову комірку 0, 1 або 2
                let digitEl = lockDigitsUI[randIndex];
                let currentVal = parseInt(digitEl.textContent);
                
                // Випадковий напрямок: +1 або -1
                let change = Math.random() < 0.5 ? 1 : -1; 
                
                // Оновлюємо значення (з урахуванням переходу через нуль)
                digitEl.textContent = (currentVal + change + 10) % 10;
                
                setTimeout(() => { digitEl.style.color = ""; }, 300);
            }
        }
    }, 2000);
}