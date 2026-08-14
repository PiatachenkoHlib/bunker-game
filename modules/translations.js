import { GameState } from './state.js';
import { startTimer } from './timer.js';
import { outputData, outputText } from './text.js';
import { generateEvent } from './events.js';
import { state1, stateRole, stateRound, btnRestart, restartModal, lockDigitsUI } from './dom.js';
import { openHints, getOpenHintsHTML } from './hints.js';

// Методи переходів
export function toBrief() {
    stateRole.classList.add('hidden');
    stateRound.classList.remove('hidden');
    GameState.isLockActive = false;
    
    document.getElementById('round-title').textContent = "БРИФІНГ";
    
    // Залишаємо ТІЛЬКИ таймер
    document.getElementById('round-actions').classList.add('hidden');
    document.getElementById('round-input').classList.add('hidden');
    document.getElementById('round-manual-event').classList.add('hidden');
    document.getElementById('round-timer').classList.remove('hidden');
    document.getElementById('btn-timer-matrix').classList.add('hidden');
    
    const btnSkip = document.getElementById('btn-skip-discuss');
    btnSkip.classList.remove('hidden');
    btnSkip.textContent = "Пропустити";
    
    startTimer(300, 'timer-display', toPreRoundOne); 
}

// Видача підказок перед стартом Раунду 1
export function toPreRoundOne() {
    if (GameState.activeTimer) clearInterval(GameState.activeTimer);
    
    openHints(GameState.playersNumber);
    let waitTime = (5 * GameState.playersNumber) + 5;
    
    // Після закриття вікна підказок — запускаємо Раунд 1
    outputText("ПОЧАТКОВІ ПІДКАЗКИ", `<ul>${getOpenHintsHTML()}</ul>`, toNewRound, waitTime);
}

export function toNewRound() {
    if (GameState.currentRound >= GameState.roundsNum) {
        toLose();
        return; // Зупиняємо функцію, щоб цикл не продовжувався
    }

    GameState.isWordleCheck = false;
    GameState.isBlocked = false;
    GameState.currentRound++;
    GameState.currentTime = GameState.discusTime;
    GameState.timerGlitch = false;
    GameState.isPassDeviceActive = true; // Активуємо режим "Передачі"
    GameState.isLockActive = false;
    
    document.getElementById('notepad-check-container')?.classList.add('invisible');
    
    // Повертаємо кнопки Блокнота до життя
    const btn1 = document.getElementById('btn-open-matrix');
    const btn2 = document.getElementById('btn-timer-matrix');
    if (btn1) { btn1.disabled = false; btn1.classList.remove('disactive', 'hidden'); }
    if (btn2) { btn2.disabled = false; btn2.classList.remove('disactive', 'hidden'); }
    
    lockDigitsUI.forEach(el => el.classList.remove('green-text', 'yellow-text', 'red-text'));

    document.getElementById('round-title').textContent = `РАУНД ${GameState.currentRound}/${GameState.roundsNum}`;
    
    // Ховаємо всі ігрові блоки
    document.getElementById('round-actions').classList.add('hidden');
    document.getElementById('round-timer').classList.add('hidden');
    document.getElementById('round-input').classList.add('hidden');
    document.getElementById('round-manual-event').classList.add('hidden');
    const roundScreen = document.getElementById('state-round');
    roundScreen.querySelector('.universal-info-box')?.classList.add('hidden');
    
    // ПОКАЗУЄМО ОВЕРЛЕЙ ПЕРЕДАЧІ
    document.getElementById('pass-device-overlay').classList.remove('hidden');

    // Таймер раунду ЗАПУСКАЄТЬСЯ вже зараз (на фоні)
    GameState.discusTime = GameState.playersNumber * 60;
    startTimer(GameState.discusTime, 'timer-display', toInputCode);
    
    // Автогенерація події та перевірка на АБУЗ
    if (GameState.autoActionTimeout) clearTimeout(GameState.autoActionTimeout);
    GameState.autoActionTimeout = setTimeout(() => {
        if (GameState.isPassDeviceActive) {
            // ШТРАФ: Гравці не встигли передати пристрій
            document.getElementById('pass-device-overlay').classList.add('hidden');
            GameState.isPassDeviceActive = false;
            
            if (GameState.activeTimer) clearInterval(GameState.activeTimer); // Зупиняємо таймер
            outputData("РАУНД ПРОПУЩЕНО", "Ви надто довго передавали пристрій. Час вийшов!", "alert-text");
            GameState.transitionTimeout = setTimeout(toNewRound, 5000); // Перекидаємо на наступний раунд
        } else {
            generateEvent(); // Якщо все ок — просто генеруємо подію
        }
    }, (GameState.discusTime / 2) * 1000);
}

export function toDiscuss() {
    GameState.isLockActive = !GameState.isBlocked;
    
    // Ховаємо обидва можливих стартових екрани
    document.getElementById('round-actions').classList.add('hidden');
    document.getElementById('round-manual-event').classList.add('hidden'); 
    
    // Показуємо таймер
    document.getElementById('round-timer').classList.remove('hidden');
    
    const btnSkip = document.getElementById('btn-skip-discuss');
    btnSkip.classList.remove('hidden');
    btnSkip.textContent = "Перейти до вводу";
        
    startTimer(GameState.currentTime, 'timer-display', toInputCode);
}

export function toInputCode() {
    GameState.isLockActive = !GameState.isBlocked;
    document.getElementById('round-timer').classList.add('hidden');
    document.getElementById('round-input').classList.remove('hidden');
    
    if (GameState.isBlocked) {
        outputData("ВВІД ЗАБЛОКОВАНО", "Подія 'Блок' діє до кінця раунду.");
        GameState.transitionTimeout = setTimeout(toNewRound, 5000); // Через 5 секунд перекидаємо на новий раунд
        return;
    }

    startTimer(10, 'input-timer-display', () => {
        document.getElementById('btn-submit-code').click();
    });
}

export function toWin() {
    outputData('КОД ПРАВИЛЬНИЙ!', "Двері повільно відчиняються. Гравці глибоко вдихають свіже повітря...", 'title-secondary green-text');
}

export function toLose() {
    outputData('КОД НЕПРАВИЛЬНИЙ! Спроби закінчились', `Система виявилась сильнішою. Мирні назавжди залишаться в цих холодних стінах...<br>Справжній код був: ${GameState.gameCode}<b></b>`, 'alert-text');
}

export function toRestart() {
    // 1. Скидаємо глобальні змінні
    GameState.currentPlayer = 1;
    GameState.currentRound = 0;
    GameState.currentTime = 0;
    GameState.isLockActive = false;
    GameState.isWordleCheck = false;
    GameState.isBlocked = false;
    GameState.hasBlockOccurred = false;
    GameState.hasDecryptionOccurred = false;
    GameState.roleDeck = [];
    GameState.allHints = [];
    GameState.openedHints = [];
    GameState.lockHistory = [];
    GameState.timerGlitch = false;
    lockDigitsUI.forEach(el => {
        el.classList.remove('green-text', 'yellow-text', 'red-text')
        el.textContent = "0";
    });

    // Очищення блокнота
    const cells = document.querySelectorAll('.matrix-cell');
    cells.forEach(cell => {
        cell.dataset.state = 0;
        cell.classList.remove('crossed', 'circled');
    });
    document.getElementById('notepad-check-container')?.classList.add('invisible');
    
    if (GameState.activeTimer) clearInterval(GameState.activeTimer); // Зупиняємо таймер
    if (GameState.autoActionTimeout) clearTimeout(GameState.autoActionTimeout); // ДОДАЙ ЦЕЙ РЯДОК
    if (GameState.transitionTimeout) clearTimeout(GameState.transitionTimeout);

    // 2. Ховаємо всі ігрові екрани та оверлеї
    stateRole.classList.add('hidden');
    stateRound.classList.add('hidden');
    btnRestart.classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');

    // 3. Відновлюємо інтерфейс раунду до початкового стану
    document.getElementById('round-actions').classList.remove('hidden');
    document.getElementById('round-timer').classList.add('hidden');
    document.getElementById('round-input').classList.add('hidden');
    document.getElementById('round-manual-event').classList.add('hidden');

    // 4. Повертаємо стартовий екран
    state1.classList.remove('hidden');
}