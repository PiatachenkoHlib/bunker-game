import { GameState } from './state.js';
import { getRandomInt } from './utils.js';
import { outputText } from './text.js';
import { toDiscuss } from './translations.js';

let titleEvent1 = "ПОДІЯ: БЛОК";
let event1 = "Ввід коду <b>повністю блокується</b> на цей раунд.";

let titleEvent2 = "ПОДІЯ: ПОСПІХ";
let event2 = "Час на обговорення <i>скорочується вдвічі</i>.";

let titleEvent3 = "ПОДІЯ: МОВЧАНКА";
let event3 = "Обговорення відбувається повністю <b>без слів</b> — тільки жестами та мімікою.";

let titleEvent4 = "ПОДІЯ: РОЗКРИТТЯ";
let event4 = "Додаток відкриває зайві скинуті карти ролей <i>(гравці дізнаються, чи є в грі диверсанти, і скільки їх)</i>. При гри в парі - 1 додаткова підказка.";

let titleEvent5 = "ПОДІЯ: ДІАГНОСТИКА";
let event5 = "Додаток генерує <b>+1 додаткову відкриту підказку</b>.";

let titleEvent6 = "ПОДІЯ: ДЕШИФРУВАННЯ";
let event6 = "На цьому раунді замок змінює логіку. Замість загальної індикації (Mastermind), він підсвічує кожну конкретну цифру окремо (<b>Червоний/Жовтий/Зелений</b>), точно вказуючи, де допущена помилка.";

// Функція рандомної генерації
export function generateEvent() {
    let eventNum;
    let valid = false;

    while (!valid) {
        eventNum = getRandomInt(1, 6);
        if (eventNum === 1 && GameState.hasBlockOccurred) continue;
        if (eventNum === 6 && GameState.hasDecryptionOccurred) continue;
        valid = true;
    }

    switch (eventNum) {
        case 1: lockBlock(); break;
        case 2: haste(); break;
        case 3: silently(); break;
        case 4: disclos(); break;
        case 5: diagnostic(); break;
        case 6: descript(); break;
    }
}

// Події кубика

export function lockBlock(){
    if (GameState.autoActionTimeout) clearTimeout(GameState.autoActionTimeout);
    GameState.isBlocked = true;
    outputText(titleEvent1, event1, toDiscuss, 10);
    GameState.hasBlockOccurred = true;
}

export function haste(){
    if (GameState.autoActionTimeout) clearTimeout(GameState.autoActionTimeout);
    GameState.currentTime -= Math.floor(GameState.discusTime / 2);
    if (GameState.currentTime <= 0) GameState.currentTime = 3;
    outputText(titleEvent2, event2, toDiscuss, 10);
}

export function silently(){
    if (GameState.autoActionTimeout) clearTimeout(GameState.autoActionTimeout);
    outputText(titleEvent3, event3, toDiscuss, 10);
}

export function disclos(){
    if (GameState.autoActionTimeout) clearTimeout(GameState.autoActionTimeout);
    if(GameState.playersNumber === 2) diagnostic();
    else {
        let str = "";
        for(let i = 0; i < GameState.roleDeck.length; i++) str += GameState.roleDeck[i] + "<br>";
        outputText(titleEvent4, event4 + "<br> <br> НЕРОЗДАНІ РОЛІ <br>" + str, toDiscuss, 10);
    }
}

export function diagnostic(){
    if (GameState.autoActionTimeout) clearTimeout(GameState.autoActionTimeout);
    outputText(titleEvent5, event5 + "<br> <br> ПІДКАЗКА <br>" + GameState.hintsList[GameState.nextHintNumber], toDiscuss, 10);
    GameState.nextHintNumber++;
}

export function descript(){
    if (GameState.autoActionTimeout) clearTimeout(GameState.autoActionTimeout);
    GameState.isWordleCheck = true;
    outputText(titleEvent6, event6, toDiscuss, 10);
    GameState.hasDecryptionOccurred = true;
}

// Обгортки для унікальних подій, щоб фіксувати їх використання (і для ручного, і для авто-режиму)
export function triggerBlockEvent() {
    GameState.hasBlockOccurred = true;
    lockBlock();
}

export function triggerDecryptionEvent() {
    GameState.hasDecryptionOccurred = true;
    descript();
}