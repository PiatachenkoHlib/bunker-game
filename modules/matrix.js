const matrixModal = document.getElementById('matrix-modal');
const matrixGrid = document.getElementById('matrix-grid');

let isSwiping = false;
let lastTouchedCell = null;

export function initMatrix() {

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
}

// Винесли зміну стану в окрему функцію, щоб її міг викликати і клік, і свайп
function toggleCellState(cell) {
    let state = parseInt(cell.dataset.state);
    state = (state + 1) % 3; // Перемикання: 0 -> 1 -> 2 -> 0
    cell.dataset.state = state;

    cell.classList.remove('crossed', 'circled');
    if (state === 1) cell.classList.add('crossed');
    else if (state === 2) cell.classList.add('circled');
}

// Зупинка проведення мишею
