import { GameState } from './state.js';

export let rules = `<h2>1. Загальна концепція та Мета</h2>
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

// Виведення тексту
export function outputText(title, text, action = null, autoCloseTime = 0) {
    const overlay = document.getElementById('overlay');
    const titleEl = document.getElementById('overlay-title');
    const contentEl = document.getElementById('overlay-text-content');
    const columnEl = document.getElementById('overlay-column');

    // Очищаємо попередній авто-таймаут, якщо він був
    if (GameState.autoActionTimeout) {
        clearTimeout(GameState.autoActionTimeout);
        GameState.autoActionTimeout = null;
    }

    titleEl.textContent = title;
    if (text.includes('<li>')) {
        contentEl.innerHTML = `<ol>${text}</ol>`;
    } else {
        contentEl.innerHTML = text.replace(/\n/g, '<br>');
    }

    overlay.classList.remove('hidden');

    // Якщо задано час — запускаємо автозакриття (Пункт з TODO)
    if (autoCloseTime > 0) {
        GameState.autoActionTimeout = setTimeout(() => {
            overlay.classList.add('hidden');
            if (action) action();
        }, autoCloseTime * 1000);
    }

    columnEl.onclick = function() {
        if (GameState.autoActionTimeout) {
            clearTimeout(GameState.autoActionTimeout);
            GameState.autoActionTimeout = null;
        }
        overlay.classList.add('hidden');
        if (action) action();
    };
}

export function outputData(title, text, titleClass = "alert-text") {
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
