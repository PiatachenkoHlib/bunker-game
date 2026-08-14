import { GameState } from './state.js';
import { startGame } from '../scrypt.js';
import { generateEvent, GameEvents } from './events.js';
import { toRestart, toNewRound, toInputCode, toPreRoundOne } from './translations.js';
import { inputCode } from './lock.js';
import { outputText, rules } from './text.js';
import { startHold, endHold } from './roles.js';

// --- DOM Елементи ---

// Кнопка рестарту та модальне вікно
export const btnRestart = document.getElementById('btn-restart');
export const restartModal = document.getElementById('restart-modal');
const btnConfirmRestart = document.getElementById('btn-confirm-restart');
const btnCancelRestart = document.getElementById('btn-cancel-restart');

// Стартовий екран (Стан 1)
export const state1 = document.getElementById('state-1');
const btnStart = document.getElementById('btn-start');
const btnRules = document.getElementById('btn-rules');
const btnMinus = document.getElementById('btn-minus');
const btnPlus = document.getElementById('btn-plus');
const playerCountDisplay = document.getElementById('player-count');

// Екран ролей (Стани 2-3)
export const stateRole = document.getElementById('state-role');
export const rolePlayerTitle = document.getElementById('role-player-title');
const roleCard = document.getElementById('role-card');
export const roleCardInner = roleCard.querySelector('.card-inner');
export const roleName = document.getElementById('role-name');
export const roleCodeText = document.getElementById('role-code-text');

// Основний екран раундів (Стани 5-10)
export const stateRound = document.getElementById('state-round');
const roundTitle = document.getElementById('round-title');

// Елементи цифр у коді
export const lockDigitsUI = [
    document.getElementById('digit-1'),
    document.getElementById('digit-2'),
    document.getElementById('digit-3')
];

const matrixModal = document.getElementById('matrix-modal');

// --- ОБРОБНИКИ ПОДІЙ (EVENT LISTENERS) ---

export function setupListeners() {

    // Логіка кнопки Рестарту
    btnRestart.addEventListener('click', () => {
        // Показуємо модальне вікно підтвердження
        restartModal.classList.remove('hidden');
    });

    // Кнопка "Ні" у вікні підтвердження
    btnCancelRestart.addEventListener('click', () => {
        restartModal.classList.add('hidden');
    });

    // Кнопка "Так" у вікні підтвердження
    btnConfirmRestart.addEventListener('click', () => {
        restartModal.classList.add('hidden');
        toRestart();
    });


    // Логіка кнопок вибору кількості гравців
    let selectedPlayers = 4; // Стартове значення

    btnMinus.addEventListener('click', () => {
        if (selectedPlayers > 2) {
            selectedPlayers--;
            playerCountDisplay.textContent = selectedPlayers;
        }
    });

    btnPlus.addEventListener('click', () => {
        if (selectedPlayers < 6) {
            selectedPlayers++;
            playerCountDisplay.textContent = selectedPlayers;
        }
    });

    // Кнопка "ПОЧАТИ ГРУ"
    btnStart.addEventListener('click', () => {
        GameState.playersNumber = selectedPlayers; // Передаємо вибрану кількість у глобальну змінну
        
        // Ховаємо стартовий екран і показуємо екран ролей
        state1.classList.add('hidden');
        stateRole.classList.remove('hidden');
        
        // Показуємо кнопку рестарту, бо гра почалася
        btnRestart.classList.remove('hidden');

        // Запускаємо логіку початку гри
        startGame();
    });

    // Кнопка "Згенерувати подію"
    document.getElementById('btn-gen-event').addEventListener('click', () => {
        generateEvent(); // Ця функція викличе рандом і виведе подію на екран
    });

    // Кнопка блокноту у меню дій
    document.getElementById('btn-open-matrix').addEventListener('click', () => {
        matrixModal.classList.remove('hidden');
    });

    // Кнопка блокноту під час обговорення
    document.getElementById('btn-timer-matrix').addEventListener('click', () => {
        matrixModal.classList.remove('hidden');
    });

    // Кнопка "правила"
    btnRules.addEventListener('click', () => {
        // Використовуємо наш універсальний оверлей для виводу правил
        outputText('ПРАВИЛА ГРИ', rules);
    });

    // Перегляд ролей: слухачі для комп'ютера (миша) та телефонів (тапи)
    roleCard.addEventListener('mousedown', startHold);
    window.addEventListener('mouseup', endHold);
    roleCard.addEventListener('touchstart', startHold);
    window.addEventListener('touchend', endHold);

    // --- Логіка пропуску таймера ---
    document.getElementById('btn-skip-discuss').addEventListener('click', () => {
        if (GameState.activeTimer) clearInterval(GameState.activeTimer); 
        
        if (GameState.currentRound === 0) {
            // З брифінгу ми тепер йдемо на видачу підказок
            toPreRoundOne();
        } else {
            toInputCode();
        }
    });

    // --- Кнопка підтвердження передачі пристрою ---
    document.getElementById('btn-confirm-pass').addEventListener('click', () => {
        document.getElementById('pass-device-overlay').classList.add('hidden');
        GameState.isPassDeviceActive = false;
        document.getElementById('round-actions').classList.remove('hidden');
    });

    // Кнопка "ВВІД"
    document.getElementById('btn-submit-code').addEventListener('click', () => {
        // Збираємо числа із замка в масив
        let code = [
            parseInt(lockDigitsUI[0].textContent),
            parseInt(lockDigitsUI[1].textContent),
            parseInt(lockDigitsUI[2].textContent)
        ];
        
        // Якщо таймер ще йде, зупиняємо його, бо код вже введено
        if (GameState.activeTimer) clearInterval(GameState.activeTimer); 
        
        // Викликаємо твою перевірку
        inputCode(code); 
    });

    // --- для ручного вибору подій ---

    // Відкрити екран ручного вибору
    document.getElementById('btn-choose-event').addEventListener('click', () => {
        document.getElementById('round-actions').classList.add('hidden');
        document.getElementById('round-manual-event').classList.remove('hidden');

        // Робимо кнопку "Розкриття" неактивною при грі вдвох
        const btnReveal = document.getElementById('btn-manual-4');
        if (GameState.playersNumber === 2) {
            btnReveal.classList.add('disactive');
            btnReveal.disabled = true; // Блокуємо на рівні HTML
        } else {
            btnReveal.classList.remove('disactive');
            btnReveal.disabled = false;
        }
    });

    // Кнопка "Назад"
    document.getElementById('btn-back-to-actions').addEventListener('click', () => {
        document.getElementById('round-manual-event').classList.add('hidden');
        document.getElementById('round-actions').classList.remove('hidden');
    });

    // Прив'язка кнопок до конкретних функцій подій
    document.getElementById('btn-manual-1').addEventListener('click', () => GameEvents.block.execute());
    document.getElementById('btn-manual-2').addEventListener('click', () => GameEvents.haste.execute());
    document.getElementById('btn-manual-3').addEventListener('click', () => GameEvents.silently.execute());
    document.getElementById('btn-manual-4').addEventListener('click', () => GameEvents.disclos.execute());
    document.getElementById('btn-manual-5').addEventListener('click', () => GameEvents.diagnostic.execute());
    document.getElementById('btn-manual-6').addEventListener('click', () => GameEvents.descript.execute());
    document.getElementById('btn-manual-7').addEventListener('click', () => GameEvents.isolation.execute());
    document.getElementById('btn-manual-8').addEventListener('click', () => GameEvents.timerGlitch.execute());
    document.getElementById('btn-manual-9').addEventListener('click', () => GameEvents.recall.execute());
    document.getElementById('btn-manual-10').addEventListener('click', () => GameEvents.liveNotepad.execute());
    //---------------------------
}