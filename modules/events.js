import { GameState } from './state.js';
import { getRandomInt } from './utils.js';
import { outputText } from './text.js';
import { toDiscuss } from './translations.js';
import { openHints } from './hints.js';
import { getOpenHintsHTML } from './hints.js';

class Event {
    constructor(name, description, action) {
        this.name = name;
        this.description = description;
        this.action = action;
        this.countAct = 0; // скільки разів подія спрацювала
    }

    execute() {
        let dynamicText = "";
        
        // Виконуємо дію. Якщо вона повертає рядок (наприклад, підказку), зберігаємо його
        if (this.action) {
            let result = this.action();
            if (result) {
                dynamicText = "<br> <br> " + result;
            }
        }
        
        this.countAct++;

        if (GameState.autoActionTimeout) clearTimeout(GameState.autoActionTimeout);
        
        // Додаємо динамічний текст до базового опису, якщо він є
        outputText("ПОДІЯ: " + this.name, this.description + dynamicText, toDiscuss, 10);
    }
}

export const GameEvents = {
    block: new Event("БЛОК", "Ввід коду <b>повністю блокується</b> на цей раунд.", () => {
        GameState.isBlocked = true;
    }),

    haste: new Event("ПОСПІХ", "Час на обговорення <i>скорочується вдвічі</i>.", () => {
        GameState.currentTime -= Math.floor(GameState.discusTime / 2);
        
        if (GameState.currentTime <= 0) GameState.currentTime = 3;
        
    }),

    silently: new Event("МОВЧАНКА", "Під час обговорення повністю <b>забороняється вербальне спілкування</b>. Не можна використовувати будь-які писемні засоби, телефон (окрім введення коду), папір. Спілкування <b>тільки жестами і мімікою</b>.", 
    () => {
        // Блокуємо обидві кнопки доступу до Блокнота
        const btn1 = document.getElementById('btn-open-matrix');
        const btn2 = document.getElementById('btn-timer-matrix');
        if (btn1) { btn1.disabled = true; btn1.classList.add('disactive'); }
        if (btn2) { btn2.disabled = true; btn2.classList.add('disactive'); }
    }),

    disclos: new Event("РОЗКРИТТЯ", "Відкриває, <i>чи є в грі диверсанти і скільки</i>. Заборонена при грі в парі.", () => {
        let sabotCount = 0;
        for (let i = 0; i < GameState.playerRoles.length; i++) {
            if(GameState.playerRoles[i] === "Диверсант") sabotCount++;
        }
        return "ДИВЕРСАНТІВ:" + sabotCount;
    }),

    diagnostic: new Event("ДІАГНОСТИКА", "Замок генерує 1 додаткову відкриту підказку.", () => {
        let opened = openHints(1);
        if (opened.length > 0) return "ПІДКАЗКА <br>" + opened[0].text;
        return "Нових підказок немає.";
    }),

    descript: new Event("ДЕШИФРУВАННЯ", "На цьому раунді замок змінює логіку. Замість загальної індикації, він підсвічує кожну конкретну цифру окремо (<b>Червоний/Жовтий/Зелений</b>), точно вказуючи, де допущена помилка.", () => {
        GameState.isWordleCheck = true;
    }),

    isolation: new Event("ІЗОЛЯЦІЯ", "Рандомно обраному гравцю забороняється будь-яким чином комунікувати весь раунд.", () => {
        let isolatedPlayer = getRandomInt(1, GameState.playersNumber);
        return `Гравець №${isolatedPlayer} зберігає абсолютну мовчанку.`;
    }),

    timerGlitch: new Event("ЗБІЙ ТАЙМЕРА", "Таймер перестає відображатися, замість нього напис [ЗБІЙ]. Час на обговорення непередбачувано змінився!", () => {
        GameState.timerGlitch = true;
        let change = getRandomInt(-20, 20);
        GameState.currentTime += change;
        
        if (GameState.currentTime <= 0) {
            GameState.currentTime = 5;
        }
    }),

    recall: new Event("ЗГАДАТИ ВСЕ", "Замок показує всі відомі підказки, а також всю історію вводів кодів з їх результатами.", () => {
        let hintsStr = getOpenHintsHTML();
        
        let historyStr = "";
        if (GameState.lockHistory.length > 0) {
            historyStr = GameState.lockHistory.join('<br>');
        } else {
            historyStr = "Історія порожня.";
        }
        
        return `<b>ВІДОМІ ПІДКАЗКИ:</b><ul>${hintsStr}</ul><b>ІСТОРІЯ ВВОДІВ:</b><br><div style="font-size: 1.5rem; letter-spacing: 2px;">${historyStr}</div>`;
    }),

    liveNotepad: new Event("ЖИВИЙ БЛОКНОТ", "Дозволяє перевірити три обведені цифри в блокноті (по одній на кожний стовпець). Якщо в стовпці обведено декілька — перевіряється найменша.", () => {
        const checkContainer = document.getElementById('notepad-check-container');
        const btnCheck = document.getElementById('btn-check-notepad');
        const resBox = document.getElementById('matrix-check-results');
        
        // Скидаємо стан інтерфейсу Блокнота перед показом
        if (resBox) resBox.classList.add('hidden');
        if (btnCheck) btnCheck.classList.remove('hidden');
        if (checkContainer) checkContainer.classList.remove('hidden');
    })
};

// Оновлена функція рандомної генерації
export function generateEvent() {
    const eventsArray = Object.values(GameEvents);
    let selectedEvent;
    let valid = false;

    while (!valid) {
        let eventNum = getRandomInt(0, eventsArray.length - 1);
        selectedEvent = eventsArray[eventNum];

        // Якщо "розкриття" і два гравця - реролл
        if(GameState.playersNumber === 2 && selectedEvent.name === "РОЗКРИТТЯ") continue;
        
        // Перевіряємо унікальні події
        if (selectedEvent.name === "БЛОК" && (selectedEvent.countAct > 0|| GameState.currentRound === GameState.roundsNum)) continue;
        if (selectedEvent.name === "ДЕШИФРУВАННЯ" && (selectedEvent.countAct > 0 || GameState.currentRound === GameState.roundsNum)) continue;
        if (selectedEvent.name === "РОЗКРИТТЯ" && selectedEvent.countAct > 0) continue;

        valid = true;
    }

    selectedEvent.execute();
}