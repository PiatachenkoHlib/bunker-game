import { GameState } from './state.js';
import { startTimer } from './timer.js';
import { outputData, outputText } from './text.js';
import { generateEvent } from './events.js';
import { giveHints } from './hints.js';
import { state1, stateRole, stateRound, btnRestart, restartModal } from './dom.js';

// Методи переходів
export function toBrief() {
    stateRole.classList.add('hidden');
    stateRound.classList.remove('hidden');
    
    document.getElementById('round-title').textContent = "ФАЗА 0: БРИФІНГ";
    
    document.getElementById('round-actions').classList.add('hidden');
    document.getElementById('round-timer').classList.remove('hidden');
    
    // Налаштовуємо кнопку пропуску для брифінгу
    const btnSkip = document.getElementById('btn-skip-discuss');
    btnSkip.classList.remove('hidden');
    btnSkip.textContent = "Пропустити";
    
    let briefTime = GameState.playersNumber * 2 * 60;
    startTimer(briefTime, 'timer-display', toNewRound);
}

export function toNewRound() {
    GameState.isWordleCheck = false;
    GameState.isBlocked = false;
    GameState.currentRound++;
    GameState.currentTime = GameState.discusTime;

    document.getElementById('round-title').textContent = `РАУНД ${GameState.currentRound}/${GameState.roundsNum}`;
    
    // Ховаємо ВСІ блоки, окрім стартових дій
    document.getElementById('round-timer').classList.add('hidden');
    document.getElementById('round-input').classList.add('hidden');
    document.getElementById('round-result').classList.add('hidden');
    document.getElementById('round-manual-event').classList.add('hidden'); // Новий блок
    
    // Переконуємось, що показуємо меню дій
    document.getElementById('round-actions').classList.remove('hidden');

    GameState.discusTime = GameState.playersNumber * 60;
    startTimer(GameState.discusTime, 'timer-display', toInputCode);
    
    // Автогенерація події
    if (GameState.autoActionTimeout) clearTimeout(GameState.autoActionTimeout);
    GameState.autoActionTimeout = setTimeout(() => {
        generateEvent();
    }, (GameState.discusTime / 2) * 1000);
}

export function toDiscuss() {
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
    document.getElementById('round-timer').classList.add('hidden');
    document.getElementById('round-input').classList.remove('hidden');
    
    if (GameState.isBlocked) {
        outputData("ВВІД ЗАБЛОКОВАНО", "Подія 'Блок' діє до кінця раунду.");
        setTimeout(toNewRound, 5000); // Через 5 секунд перекидаємо на новий раунд
        return;
    }

    startTimer(10, 'input-timer-display', () => {
        document.getElementById('btn-submit-code').click();
    });
}

export function toWin() {
    outputData('КОД ПРАВИЛЬНИЙ!', 'Перемога мирних', 'title-secondary green-text');
}

export function toLose() {
    outputData('КОД НЕПРАВИЛЬНИЙ! Спроби закінчились', 'Перемога диверсантів', 'alert-text');
}

export function toRestart() {
    // 1. Скидаємо глобальні змінні
    GameState.currentPlayer = 1;
    GameState.currentRound = 0;
    GameState.nextHintNumber = 0;
    GameState.currentTime = 0;
    GameState.isWordleCheck = false;
    GameState.isBlocked = false;
    GameState.hasBlockOccurred = false;
    GameState.hasDecryptionOccurred = false;
    GameState.roleDeck = [];
    GameState.hintsList = [];
    
    if (GameState.activeTimer) clearInterval(GameState.activeTimer); // Зупиняємо таймер

    // 2. Ховаємо всі ігрові екрани та оверлеї
    stateRole.classList.add('hidden');
    stateRound.classList.add('hidden');
    btnRestart.classList.add('hidden');
    document.getElementById('overlay').classList.add('hidden');

    // 3. Відновлюємо інтерфейс раунду до початкового стану
    document.getElementById('round-actions').classList.remove('hidden');
    document.getElementById('round-timer').classList.add('hidden');
    document.getElementById('round-input').classList.add('hidden');
    document.getElementById('round-result').classList.add('hidden');
    document.getElementById('round-manual-event').classList.add('hidden');

    // 4. Повертаємо стартовий екран
    state1.classList.remove('hidden');
}