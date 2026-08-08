import { getRandomInt } from './utils.js';
import { GameState } from './state.js';

export function generateHints(code) {
    let hints = new Set();

    let positionX;
    let positionY;
    let str;
    let isConditionTrue = false;

    let max = code[0];
    let min = code[0];
    let positionMax = 0;
    let positionMin = 0;

    for(let i = 0; i < code.length; i++) {
        if(code[i] > max) {
            max = code[i];
            positionMax = i;
        } else if(code[i] < min) {
            min = code[i];
            positionMin = i;
        }
    }
    
    // --- ПІДКАЗКИ ---
    // 1. Цифра Х більша/менша за У
    positionX = getRandomInt(0, 2);
    positionY = getRandomInt(0, 2);
    while(positionX === positionY) {
        positionY = getRandomInt(0, 2);
    }

    str = code[positionX] > code[positionY] ? "більша" : "менша";
    hints.add(`Цифра №<b>${positionX + 1}</b> <b>${str}</b> за цифру №<b>${positionY + 1}</b>.`);

    // 2. Парність цифри 
    positionX = getRandomInt(0, 2);
    str = code[positionX] % 2 === 0 ? "парна" : "непарна";
    hints.add(`Цифра №<b>${positionX + 1}</b> — <b>${str}</b>.`);

    // 3. Найбільша цифра
    hints.add(`Цифра №<b>${positionMax + 1}</b> — <b>найбільша</b>.`);

    // 4. Різниця між найбільшою та найменшою
    hints.add(`Різниця між найбільшою та найменшою цифрою в коді дорівнює <b>${max - min}</b>.`);

    // 5. Сусіди
    if (Math.abs(code[0] - code[1]) === 1 ||
        Math.abs(code[0] - code[2]) === 1 ||
        Math.abs(code[1] - code[2]) === 1) {
        isConditionTrue = true;
    }

    if(isConditionTrue) {
        hints.add(`У коді <b>є</b> дві цифри-сусіди.`);
    } else {
        hints.add(`У коді <b>немає</b> жодних двох цифр-сусідів.`);
    }

    // 6. Найбільша цифра і сума двох інших
    str = code[positionMax] > code[0] + code[1] + code[2] - code[positionMax] ? "більша" : "менша";
    hints.add(`Найбільша цифра в коді <b>${str}</b> за суму двох інших цифр.`);

    // 7. Парність суми всіх цифр
    str = (code[0] + code[1] + code[2]) % 2 === 0 ? "парна" : "непарна";
    hints.add(`Сума всіх трьох цифр <b>${str}</b>.`);

    // 8. Однакова або різна парність двох цифр
    positionX = getRandomInt(0, 2);
    positionY = getRandomInt(0, 2);
    while(positionX === positionY) positionY = getRandomInt(0, 2);

    str = code[positionX] % 2 === code[positionY] % 2 ? "однакову" : "різну";
    hints.add(`Цифри на позиціях <b>${positionX + 1}</b> та <b>${positionY + 1}</b> мають <b>${str}</b> парність.`);
    
    // 9. Сума цифр і 9
    positionX = getRandomInt(0, 2);
    positionY = getRandomInt(0, 2);
    while(code[positionX] + code[positionY] === 9 || positionX === positionY){
        positionX = getRandomInt(0, 2);
        positionY = getRandomInt(0, 2);
    }
    str = code[positionX] + code[positionY] > 9 ? "більша" : "менша";
    hints.add(`Сума цифр на позиціях <b>${positionX+1}</b> та <b>${positionY+1}</b> суворо <b>${str}</b> за 9.`);

    // 10. Сума цифр і кратність 3
    positionX = getRandomInt(0, 2);
    positionY = getRandomInt(0, 2);
    while(positionX === positionY) {
        positionY = getRandomInt(0, 2);
    }
    str = (code[positionX] + code[positionY]) % 3 === 0 ? "кратна" : "некратна";
    hints.add(`Сума цифр на позиціях <b>${positionX+1}</b> та <b>${positionY+1}</b> <b>${str}</b> 3.`);

    // Тасування підказок методом Фішера-Ейтса
    let hintsArray = Array.from(hints);
    for (let i = hintsArray.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [hintsArray[i], hintsArray[j]] = [hintsArray[j], hintsArray[i]];
    }

    return hintsArray;
}

export function giveHints(hintsNumber){
    let result = ``;

    let limit = Math.min(hintsNumber, GameState.hintsList.length);

    for (let i = 0; i < limit; i++) {
        result += `<li>${GameState.hintsList[i]}</li>`;
    }

    return result;
}