import { GameState } from './state.js';

export let rules = `<h2>Загальні правила та Мета</h2>
<p>Гравці опиняються в замкненому бункері. Їхня мета — розгадати тризначний код на замку, де всі три цифри різні. На це є обмежена кількість раундів. Серед гравців можуть бути <b>Диверсанти</b>. Диверсант знає справжній код від самого початку, і його мета — заплутати мирних гравців, маніпулювати обговоренням та завадити їм підібрати код до закінчення раундів. Диверсантів може і не буде, оскільки колода карт ролей на роздачу завжди містить більше карт, ніж гравців.
Кількість раундів для кожної гри розраховується як 9 — кількість гравців. В колоді карт ролей завжди міститься по одній "мирній" на кожного гравця і 1 (для 2-4 гравців) або 2 (для 5-6) картки диверсантів.</p>

<h2>Роль замка</h2>
<p>Додаток — не просто пасивний інструмент, а повноцінна третя сторона конфлікту. Мехінаки замка, елементи інтерфейсу, логіки спеціально зроблені так, щоб створювати дискомфорт для мирних, і можуть зіграти роль у критичній ситуаці</p>

<h2>Хід гри</h2>
<h3>Роздача ролей</h3>
<p>Гравці по черзі, передаючи пристрій з рук в руки, приховано переглядають свої ролі, а диверсанти - ще й запам'ятовують код.</p>
<h3>Брифінг</h3>
<p>Триває 5 хв. Під час брифінгу гравцям слід з'ясувати:
<ul>
<li>як вони контролюватимуть пристрій (передаватимуть по черзі або назначать капітана)</li>
<li>як занотовуватимуть інформацію</li>
<li>як будуть спілкуватися під час події "Мовчанка" (чит. нижче)</li>
<li>інші нюанси спілкування</li>
</ul>
Після брифінгу буде виведено математичні підказки про код — напр., "одна цифра більша за іншу", або "в коді є 2 парні цифри підряд". Гравцям слід занотувати ці підказки, уважно стежачи за умовами, оскільки після закриття тексту вони будуть недоступні. Після цього починається новий раунд.</p>

<h3>Основний Раунд (Повторюється)</h3>
<p><b>Етап 1. Подія середовища</b><br>
Додаток генерує випадкову подію на поточний раунд. Це може бути блокування вводу, нова підказка або скорочення часу на обговорення. Подію також можна обрати самостійно.</p>

<p><b>Етап 2. Обговорення</b><br>
Гравці обговорюють гіпотези, пропонують коди для введення. Час розраховано по 1 хвилині на гравця.<b>Замок активний</b>, тому гравці можуть виставляти потенційний код прямо під час обговорення.</p>

<p><b>Етап 3. Ввід</b><br>
10 секунд на ввід коду. Якщо гравці не встигнуть натиснути кнопку — замок перевірить введену комбінацію і, якщо вона неправильна, надасть загальну інформацію — скільки цифр взагалі є в коді, скіьки з них — на своєму місці.</p>
<br>
<p>Гра завершується, коли вгадано код (перемога мирних), або коли закінчуються раунди (перемога диверсантів). Успіхів!</p>`;

// Виведення тексту
export function outputText(title, text, action = null, autoCloseTime = 0) {
    const overlay = document.getElementById('overlay');
    const titleEl = document.getElementById('overlay-title');
    const contentEl = document.getElementById('overlay-text-content');
    const timeBarWrapper = document.getElementById('time-bar-wrapper');
    const timeBar = document.getElementById('overlay-time-bar');

    // Очищаємо попередній авто-таймаут, якщо він був
    if (GameState.autoActionTimeout) {
        clearTimeout(GameState.autoActionTimeout);
        GameState.autoActionTimeout = null;
    }

    titleEl.textContent = title;
    
    contentEl.innerHTML = text;

    overlay.classList.remove('hidden');

    // --- Логіка тайм-бару ---
    if (timeBarWrapper && timeBar) {
        if (autoCloseTime > 0) {
            timeBarWrapper.classList.remove('hidden');
            timeBar.style.transition = 'none';
            timeBar.style.width = '100%';
            
            void timeBar.offsetWidth; 
            
            timeBar.style.transition = `width ${autoCloseTime}s linear`;
            timeBar.style.width = '0%';
        } else {
            timeBarWrapper.classList.add('hidden');
        }
    }
    // ------------------------

    if (autoCloseTime > 0) {
        GameState.autoActionTimeout = setTimeout(() => {
            overlay.classList.add('hidden');
            if (action) action();
        }, autoCloseTime * 1000);
    }

    document.getElementById('overlay-column').onclick = function() {
        if (GameState.autoActionTimeout) {
            clearTimeout(GameState.autoActionTimeout);
            GameState.autoActionTimeout = null;
        }
        overlay.classList.add('hidden');
        if (action) action();
    };
}
export function outputData(title, text, titleClass = "alert-text") {
    // 1. Знаходимо поточний активний екран (той, що не має класу hidden)
    const activeScreen = document.querySelector('.screen:not(.hidden)');
    if (!activeScreen) return;

    // 2. Шукаємо наш універсальний контейнер саме на цьому екрані
    const infoBox = activeScreen.querySelector('.universal-info-box');
    if (!infoBox) return;

    const titleEl = infoBox.querySelector('.info-title');
    const textEl = infoBox.querySelector('.info-text');

    // 3. Обробка заголовка (Якщо null або порожньо - ховаємо повністю)
    if (!title || title === "") {
        titleEl.classList.add('hidden');
    } else {
        titleEl.classList.remove('hidden');
        titleEl.textContent = title;
        titleEl.className = `info-title ${titleClass}`; 
    }

    // 4. Вставляємо текст і показуємо контейнер
    textEl.innerHTML = text;
    infoBox.classList.remove('hidden');

    // 5. Якщо ми на екрані раунду, треба сховати менюшки і таймери, щоб вони не перекривали текст
    if (activeScreen.id === 'state-round') {
        document.getElementById('round-actions')?.classList.add('hidden');
        document.getElementById('round-timer')?.classList.add('hidden');
        document.getElementById('round-input')?.classList.add('hidden');
        document.getElementById('round-manual-event')?.classList.add('hidden');
    }
}