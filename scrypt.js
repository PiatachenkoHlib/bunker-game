// --- Основні змінні ---
let gameCode = [0, 0, 0];

let playersNumber = 0;
let currentPlayer = 1;

let roundsNum = 0;
let currentRound = 0;

const Roles = {
    CIVIC: 'Мирний',
    SABOTEUR: 'Диверсант'
}
let roleDeck = [];

let hintsList = [];
let nextHintNumber = 0;

let discusTime = 0;
let currentDiscusTime = 0;

let isWordleCheck = false;
let isBlocked = false;

let activeTimer = null;

let hasBlockOccurred = false;
let hasDecryptionOccurred = false;

// --- DOM Елементи ---

// Кнопка рестарту та модальне вікно
const btnRestart = document.getElementById('btn-restart');
const restartModal = document.getElementById('restart-modal');
const btnConfirmRestart = document.getElementById('btn-confirm-restart');
const btnCancelRestart = document.getElementById('btn-cancel-restart');

// Стартовий екран (Стан 1)
const state1 = document.getElementById('state-1');
const btnStart = document.getElementById('btn-start');
const btnRules = document.getElementById('btn-rules');
const btnMinus = document.getElementById('btn-minus');
const btnPlus = document.getElementById('btn-plus');
const playerCountDisplay = document.getElementById('player-count');

// Екран ролей (Стани 2-3)
const stateRole = document.getElementById('state-role');
const rolePlayerTitle = document.getElementById('role-player-title');
const roleCard = document.getElementById('role-card');
const roleCardInner = roleCard.querySelector('.card-inner');
const roleName = document.getElementById('role-name');
const roleCodeText = document.getElementById('role-code-text');

// Основний екран раундів (Стани 5-10)
const stateRound = document.getElementById('state-round');
const roundTitle = document.getElementById('round-title');

// Елементи цифр у коді
const lockDigitsUI = [
    document.getElementById('digit-1'),
    document.getElementById('digit-2'),
    document.getElementById('digit-3')
];

// Текстові параметри
let rules = `<h2>1. Загальна концепція та Мета</h2>
<p>Гравці опиняються в замкненому бункері. Їхня мета — розгадати тризначний код на замку, де усі три цифри різні (від 0 до 9). На це є обмежена кількість раундів. Серед гравців можуть бути <b>Диверсанти</b>. Диверсант знає справжній код від самого початку, і його мета — заплутати мирних гравців, маніпулювати обговоренням та завадити їм підібрати код до закінчення раундів. Диверсантів може і не буде, оскільки колода карт ролей на роздачу завжди містить більше карт, ніж гравців.</p>

<h2>2. Механіка Замка (Індикація)</h2>
<p>Гра використовує систему індикації Mastermind. Після введення коду замок не вказує статус конкретних цифр, а видає лише загальний результат:</p>
<ul>
<li>Кількість вгаданих цифр, які стоять на своїх правильних місцях.</li>
<li>Кількість вгаданих цифр, які є в коді, але стоять не на своєму місці.</li>
</ul>

<h2>3. Баланс за кількістю гравців</h2>
<p>Кількість раундів динамічно адаптується під групу за формулою: <b>10 мінус кількість гравців</b>.</p>
<ul>
<li><b>2 гравця:</b> 1 картка диверсанта, 1 зайва картка ролі, 8 раундів.</li>
<li><b>3-4 гравця:</b> 1 картка диверсанта, 1 зайва картка ролі, 7-6 раундів.</li>
<li><b>5-6 гравців:</b> 2 картки диверсанта, 2 зайві карти ролі, 5-4 раундів.</li>
</ul>

<h2>4. Хід гри</h2>
<h3>Фаза 0: Брифінг (Тільки на початку гри)</h3>
<p>Триває кількість гравців х 2 хвилини. Гравці таємно дізнаються свої ролі та отримують видні всім математичні підказки - стільки ж, скільки і гравців (наприклад, "Сума всіх трьох цифр є парним числом" або "У коді немає жодних двох цифр-сусідів"). Вони обговорюють підказки, записують умови та будують перші гіпотези. Замок і кубик у цій фазі неактивні.</p>

<h3>Основний Раунд (Повторюється N разів)</h3>
<p><b>Крок 1. Подія Середовища (Кидок кубика d6)</b><br>
Додаток генерує випадкову подію на поточний раунд:<br>
<ul>
<li><b>Блок:</b> Ввід коду повністю блокується на цей раунд <i>(може випасти лише 1 раз за гру)</i>.</li>
<li><b>Поспіх:</b> Час на обговорення скорочується вдвічі.</li>
<li><b>Мовчанка:</b> Обговорення відбувається повністю без слів — тільки жестами та мімікою.</li>
<li><b>Розкриття:</b> Додаток відкриває зайві скинуті карти ролей.</li>
<li><b>Діагностика:</b> Додаток генерує +1 додаткову відкриту підказку.</li>
<li><b>Дешифрування (Wordle-сканер):</b> Замок змінює логіку. Замість загальної індикації (Mastermind), він підсвічує кожну конкретну цифру окремо (Червоний/Жовтий/Зелений) <i>(може випасти лише 1 раз за гру)</i>.</li>
</ul></p>

<p><b>Крок 2. Обговорення та Дедукція</b><br>
Таймер: Кількість гравців × 1 хв.<br>
Гравці обговорюють гіпотези. <b>Замок активний</b>, тому гравці можуть виставляти потенційний код прямо під час обговорення.</p>

<p><b>Крок 3. Ввід</b><br>
Таймер: 10 секунд.<br>
Фінальне вікно для прийняття рішення. Капітан має встигнути натиснути кнопку "ВВІД". Якщо код не відправлено вчасно, спроба згорає.</p>`;

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

// Допоміжна функція для генерації строгих цілих чисел
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCode() {
    gameCode[0] = getRandomInt(0, 9);

    gameCode[1] = getRandomInt(0, 9);
    while(gameCode[1] === gameCode[0]) {
        gameCode[1] = getRandomInt(0, 9);
    }
    
    gameCode[2] = getRandomInt(0, 9);
    while(gameCode[2] === gameCode[0] || gameCode[2] === gameCode[1]) {
        gameCode[2] = getRandomInt(0, 9);
    }
}

// Методи підказок
function generateHints(code) {
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

function giveHints(hintsNumber){
    let result = ``;

    let limit = Math.min(hintsNumber, hintsList.length);

    for (let i = 0; i < limit; i++) {
        result += `<li>${hintsList[i]}</li>`;
    }

    return result;
}

// Методи ролей
function initRoles(pNum){
    if(pNum < 2 || pNum > 6) return;

    roleDeck.push(Roles.SABOTEUR);
    for(let i = 0; i < pNum; i++) roleDeck.push(Roles.CIVIC);

    if(pNum > 4) roleDeck.push(Roles.SABOTEUR);
}

function giveRole(){
    let result;
    let roleNum = getRandomInt(0, roleDeck.length - 1);

    result = roleDeck[roleNum];
    roleDeck.splice(roleNum, 1);

    return result;
}

// Перевірки замка
function mastermindCheck(inputNum, targetNum) {
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

    if (fullGuessedDigs === targetNum.length) return true;
    else return `Знайдено цифр: <b>${guessedDigs}</b><br>З них на своєму місці: <b>${fullGuessedDigs}</b>`;}

function wordleCheck(inputNum, targetNum) {
    let result = '';
    let fullGuessedDigs = 0;

  for (let i = 0; i < inputNum.length; i++) { 
    if (inputNum[i] === targetNum[i]) { 
        result += `<b>${inputNum[i]}</b> — є, і на своєму місці<br>`;
        fullGuessedDigs++; 
    } 
    else if (targetNum.includes(inputNum[i])) { 
        result += `<b>${inputNum[i]}</b> — є, але не на своєму місці<br>`;
    } 
    else {
        result += `<b>${inputNum[i]}</b> — немає<br>`;
    }
}

    if (fullGuessedDigs === targetNum.length) return true;
    else return result;
}

// Обробка введеного коду
function inputCode(code) {
    let result = isWordleCheck ? wordleCheck(code, gameCode) : mastermindCheck(code, gameCode);

    if (result === true) {
        toWin();
        return;
    } else if (currentRound === roundsNum) {
        toLose();
        return;
    }
    
    outputData("НЕПРАВИЛЬНИЙ КОД", result, 'alert-text');
    setTimeout(toNewRound, 6000);
}

// Події кубика

function lockBlock(){
    isBlocked = true;
    outputText(titleEvent1, event1, toDiscuss)
    hasBlockOccurred = true;
}

function haste(){
    currentDiscusTime = Math.floor(currentDiscusTime - (discusTime / 2))
    outputText(titleEvent2, event2, toDiscuss)
}

function silently(){
    outputText(titleEvent3, event3, toDiscuss)
}

function disclos(){
    if(playersNumber === 2) diagnostic();
    else {
        let str = ""
        for(let i = 0; i < roleDeck.length; i++){
            str += roleDeck[i] + "<br>";
        }
        outputText(titleEvent4, event4 + "<br> <br> НЕРОЗДАНІ РОЛІ <br>" + str, toDiscuss)
    }
}

function diagnostic(){
    outputText(titleEvent5, event5 + "<br> <br> ПІДКАЗКА <br>" + hintsList[nextHintNumber], toDiscuss)
    nextHintNumber++;
}

function descript(){
    isWordleCheck = true;
    outputText(titleEvent6, event6, toDiscuss)
    hasDecryptionOccurred = true
}

// Функція рандомної генерації
function generateEvent() {
    let eventNum;
    let valid = false;

    while (!valid) {
        eventNum = getRandomInt(1, 6);
        if (eventNum === 1 && hasBlockOccurred) continue;
        if (eventNum === 6 && hasDecryptionOccurred) continue;
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

// Обгортки для унікальних подій, щоб фіксувати їх використання (і для ручного, і для авто-режиму)
function triggerBlockEvent() {
    hasBlockOccurred = true;
    lockBlock();
}

function triggerDecryptionEvent() {
    hasDecryptionOccurred = true;
    descript();
}

// ПОЧАТОК ГРИ
function startGame() {
    generateCode();
    hintsList = generateHints(gameCode);
    discusTime = playersNumber * 60;

    roundsNum = 10 - playersNumber;

    initRoles(playersNumber);

    playerRoles = [];
    for (let i = 0; i < playersNumber; i++) {
        playerRoles.push(giveRole());
    }

    currentPlayer = 1;
    updateRoleScreen(); // Заповнюємо картку для першого гравця
}

// Методи переходів
function toBrief() {
    stateRole.classList.add('hidden');
    stateRound.classList.remove('hidden');
    
    document.getElementById('round-title').textContent = "ФАЗА 0: БРИФІНГ";
    
    document.getElementById('round-actions').classList.add('hidden');
    document.getElementById('round-timer').classList.remove('hidden');
    
    // Налаштовуємо кнопку пропуску для брифінгу
    const btnSkip = document.getElementById('btn-skip-discuss');
    btnSkip.classList.remove('hidden');
    btnSkip.textContent = "Пропустити";
    
    let briefTime = playersNumber * 2 * 60;
    startTimer(briefTime, 'timer-display', toNewRound);
}

function toNewRound() {
    isWordleCheck = false;
    isBlocked = false;
    currentRound++;
    currentDiscusTime = discusTime;

    document.getElementById('round-title').textContent = `РАУНД ${currentRound}/${roundsNum}`;
    
    // Ховаємо ВСІ блоки, окрім стартових дій
    document.getElementById('round-timer').classList.add('hidden');
    document.getElementById('round-input').classList.add('hidden');
    document.getElementById('round-result').classList.add('hidden');
    document.getElementById('round-manual-event').classList.add('hidden'); // Новий блок
    
    // Переконуємось, що показуємо меню дій
    document.getElementById('round-actions').classList.remove('hidden');
}

function toDiscuss() {
    // Ховаємо обидва можливих стартових екрани
    document.getElementById('round-actions').classList.add('hidden');
    document.getElementById('round-manual-event').classList.add('hidden'); 
    
    // Показуємо таймер
    document.getElementById('round-timer').classList.remove('hidden');
    
    const btnSkip = document.getElementById('btn-skip-discuss');
    btnSkip.classList.remove('hidden');
    btnSkip.textContent = "Перейти до вводу";
        
    startTimer(currentDiscusTime, 'timer-display', toInputCode);
}

function toInputCode() {
    document.getElementById('round-timer').classList.add('hidden');
    document.getElementById('round-input').classList.remove('hidden');
    
    if (isBlocked) {
        outputData("ВВІД ЗАБЛОКОВАНО", "Подія 'Блок' діє до кінця раунду.");
        setTimeout(toNewRound, 5000); // Через 5 секунд перекидаємо на новий раунд
        return;
    }

    startTimer(10, 'input-timer-display', () => {
        document.getElementById('btn-submit-code').click();
    });
}

function toWin() {
    outputData('КОД ПРАВИЛЬНИЙ!', 'Перемога мирних', 'title-secondary green-text');
}

function toLose() {
    outputData('КОД НЕПРАВИЛЬНИЙ! Спроби закінчились', 'Перемога диверсантів', 'alert-text');
}

function toRestart() {
    // 1. Скидаємо глобальні змінні
    currentPlayer = 1;
    currentRound = 0;
    nextHintNumber = 0;
    isWordleCheck = false;
    isBlocked = false;
    hasBlockOccurred = false;
    hasDecryptionOccurred = false;
    roleDeck = [];
    hintsList = [];
    
    if (activeTimer) clearInterval(activeTimer); // Зупиняємо таймер

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

// Виведення тексту
function outputText(title, text, action = null) {
    const overlay = document.getElementById('overlay');
    const titleEl = document.getElementById('overlay-title');
    const contentEl = document.getElementById('overlay-text-content');
    const columnEl = document.getElementById('overlay-column');

    // Наповнюємо даними
    titleEl.textContent = title;
    
    // Перевіряємо, чи це список підказок (чи містить теги <li>)
    // Якщо так - огортаємо в <ol>, якщо ні - просто виводимо текст
    if (text.includes('<li>')) {
        contentEl.innerHTML = `<ol>${text}</ol>`;
    } else {
        // Якщо це звичайний текст, замінюємо \n на HTML-перенесення
        contentEl.innerHTML = text.replace(/\n/g, '<br>');
    }

    // Показуємо оверлей
    overlay.classList.remove('hidden');

    // Очищаємо попередні обробники кліків, щоб вони не накопичувались
    columnEl.onclick = null; 

    // Вішаємо нову подію на клік
    columnEl.onclick = function() {
        // Ховаємо оверлей
        overlay.classList.add('hidden');
        
        // Якщо передано функцію action, виконуємо її!
        if (action) {
            action();
        }
    };
}

function outputData(title, text, titleClass = "alert-text") {
    document.getElementById('round-actions').classList.add('hidden');
    document.getElementById('round-timer').classList.add('hidden');
    document.getElementById('round-input').classList.add('hidden');
    document.getElementById('round-manual-event').classList.add('hidden');

    const resultBlock = document.getElementById('round-result');
    const titleEl = document.getElementById('result-status');
    
    titleEl.textContent = title;
    titleEl.className = titleClass; 
    
    document.getElementById('result-stats-box').innerHTML = text;
    
    resultBlock.classList.remove('hidden');
}


// duration - час у секундах, elementId - куди виводити, onFinish - що робити в кінці
function startTimer(duration, elementId, onFinish) {
    // Якщо якийсь таймер вже йде, обов'язково зупиняємо його
    if (activeTimer) clearInterval(activeTimer);

    let timer = duration;
    const display = document.getElementById(elementId);

    // Функція для оновлення тексту на екрані
    function updateDisplay() {
        let minutes = Math.floor(timer / 60);
        let seconds = timer % 60;
        
        // Додаємо нуль спереду, якщо секунд менше 10 (напр. 3:05)
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
    }

    // Виводимо початковий час одразу
    updateDisplay();

    // Запускаємо інтервал
    activeTimer = setInterval(function () {
        timer--;
        updateDisplay();

        // Коли час вийшов
        if (timer <= 0) {
            clearInterval(activeTimer); // Зупиняємо відлік
            if (onFinish) onFinish(); // Запускаємо подію завершення (наприклад, штраф)
        }
    }, 1000);
}

// Заповнення тексту картки для поточного гравця
function updateRoleScreen() {
    const rolePlayerTitle = document.getElementById('role-player-title');
    const roleName = document.getElementById('role-name');
    const roleCodeText = document.getElementById('role-code-text');

    rolePlayerTitle.textContent = `ГРАВЕЦЬ ${currentPlayer}/${playersNumber}`;
    
    let currentRole = playerRoles[currentPlayer - 1];
    
    roleName.className = "role-title"; 
    roleName.style.color = "var(--text-white)"; 

    if (currentRole === Roles.SABOTEUR) {
        roleName.textContent = "ТИ - ДИВЕРСАНТ!";
        roleCodeText.textContent = `КОД: ${gameCode.join('')}`;
    } else {
        roleName.textContent = "ТИ - МИРНИЙ!";
        roleCodeText.textContent = "КОД: ХХХ";
    }
}

// Прокрутка цифр
lockDigitsUI.forEach((digitElement) => {
    let startY = 0;
    let endY = 0;
    let startTime = 0; // Для вимірювання часу
    const threshold = 30; 

    function updateDigit(delta, timeElapsed) {
        if (isBlocked) return; 

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

let holdStartTime = 0;
let isHolding = false;

function startHold(e) {
    if (e.type === 'touchstart') e.preventDefault(); 
    if (isHolding) return;
    isHolding = true;
    holdStartTime = Date.now();
    roleCardInner.classList.add('is-flipped');
}

function endHold(e) {
    if (!isHolding) return;
    isHolding = false;
    roleCardInner.classList.remove('is-flipped');
    
    let holdDuration = Date.now() - holdStartTime;
    if (holdDuration >= 500) {
        currentPlayer++;
        if (currentPlayer > playersNumber) {
            nextHintNumber = playersNumber; 
            outputText("ПОЧАТКОВІ ПІДКАЗКИ", giveHints(nextHintNumber), toBrief);
        } else {
            setTimeout(updateRoleScreen, 300);
        }
    }
}

// ЛОГІКА МАТРИЦІ
const matrixModal = document.getElementById('matrix-modal');
const matrixGrid = document.getElementById('matrix-grid');

let isSwiping = false;
let lastTouchedCell = null;

// Винесли зміну стану в окрему функцію, щоб її міг викликати і клік, і свайп
function toggleCellState(cell) {
    let state = parseInt(cell.dataset.state);
    state = (state + 1) % 3; // Перемикання: 0 -> 1 -> 2 -> 0
    cell.dataset.state = state;

    cell.classList.remove('crossed', 'circled');
    if (state === 1) cell.classList.add('crossed');
    else if (state === 2) cell.classList.add('circled');
}

// Генерація цифр для Матриці
for (let i = 0; i <= 9; i++) {
    for (let col = 1; col <= 3; col++) {
        let cell = document.createElement('div');
        cell.className = 'matrix-cell';
        cell.textContent = i;
        cell.dataset.state = 0;

        // Для миші (комп'ютер)
        cell.addEventListener('mousedown', function() {
            isSwiping = true;
            toggleCellState(this);
        });
        cell.addEventListener('mouseenter', function() {
            if (isSwiping) toggleCellState(this);
        });
        
        matrixGrid.appendChild(cell);
    }
}

// Зупинка проведення мишею
window.addEventListener('mouseup', () => isSwiping = false);

// Для свайпів (телефони).
matrixGrid.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Блокуємо випадковий скрол
    let touch = e.touches[0];
    let element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('matrix-cell')) {
        if (element !== lastTouchedCell) {
            toggleCellState(element);
            lastTouchedCell = element;
        }
    }
}, { passive: false });

matrixGrid.addEventListener('touchend', () => {
    lastTouchedCell = null;
});

// Закриття Матриці
document.getElementById('btn-close-matrix').addEventListener('click', () => {
    matrixModal.classList.add('hidden');
});

// --- ОБРОБНИКИ ПОДІЙ (EVENT LISTENERS) ---

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
    playersNumber = selectedPlayers; // Передаємо вибрану кількість у глобальну змінну
    
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

// Кнопка "Пропустити" / "Перейти до вводу"
document.getElementById('btn-skip-discuss').addEventListener('click', () => {
    if (activeTimer) clearInterval(activeTimer); // Обов'язково вбиваємо таймер
    
    if (currentRound === 0) {
        // Якщо ми на брифінгу, переходимо одразу до нового раунду
        toNewRound();
    } else {
        // Якщо це звичайний раунд, переходимо до фази вводу коду
        toInputCode();
    }
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
    if (activeTimer) clearInterval(activeTimer); 
    
    // Викликаємо твою перевірку
    inputCode(code); 
});

// --- для ручного вибору подій ---

// Відкрити екран ручного вибору
document.getElementById('btn-choose-event').addEventListener('click', () => {
    document.getElementById('round-actions').classList.add('hidden');
    document.getElementById('round-manual-event').classList.remove('hidden');
});

// Кнопка "Назад"
document.getElementById('btn-back-to-actions').addEventListener('click', () => {
    document.getElementById('round-manual-event').classList.add('hidden');
    document.getElementById('round-actions').classList.remove('hidden');
});

// Прив'язка 6 кнопок до конкретних функцій подій
document.getElementById('btn-manual-1').addEventListener('click', lockBlock);
document.getElementById('btn-manual-2').addEventListener('click', haste);
document.getElementById('btn-manual-3').addEventListener('click', silently);
document.getElementById('btn-manual-4').addEventListener('click', disclos);
document.getElementById('btn-manual-5').addEventListener('click', diagnostic);
document.getElementById('btn-manual-6').addEventListener('click', descript);
//---------------------------