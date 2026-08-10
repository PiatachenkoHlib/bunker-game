import { getRandomInt } from './utils.js';
import { GameState } from './state.js';

class Hint {
    constructor(mathPower, cognDif, text, predicateFunc) {
        this.mathPower = mathPower;
        this.cognDif = cognDif;
        this.text = text;
        this.check = predicateFunc;
        this.isOpen = false;
    }
}

export function generateHints(code) {
    let hints = [];

    // Базові математичні допоміжні функції
    const isPrime = n => {
        if(n < 2) return false;
        for(let i = 2; i <= Math.sqrt(n); i++) if(n % i === 0) return false;
        return true;
    };
    
    // ==========================================
    // 0. ЛЕГКІ ПІДКАЗКИ
    // ==========================================
    
    { // 1. Парність / непарність
        let posX = getRandomInt(0, 2);
        let isEven = code[posX] % 2 === 0;
        hints.push(new Hint(50, 0,
            `Цифра №${posX + 1} є ${isEven ? 'парною' : 'непарною'}.`,
            (test) => (test[posX] % 2 === 0) === isEven
        ));
    }

    { // 2. Менша за 5 / більша за 4
        let posX = getRandomInt(0, 2);
        let less5 = code[posX] < 5;
        hints.push(new Hint(50, 0,
            `Цифра №${posX + 1} ${less5 ? 'менша за 5' : 'більша за 4'}.`,
            (test) => (test[posX] < 5) === less5
        ));
    }

    { // 3. Просте або нуль / складене або одиниця
        let posX = getRandomInt(0, 2);
        let primesAndZero = [0, 2, 3, 5, 7];
        let isP = primesAndZero.includes(code[posX]);
        hints.push(new Hint(50, 0,
            `Цифра №${posX + 1} є ${isP ? 'простим числом або нулем' : 'складеним числом або одиницею'}.`,
            (test) => primesAndZero.includes(test[posX]) === isP
        ));
    }

    // ==========================================
    // 1. СЕРЕДНІ ПІДКАЗКИ
    // ==========================================
    
    { // 4. Більша / менша за іншу
        let x, y; do { x = getRandomInt(0, 2); y = getRandomInt(0, 2); } while (x === y);
        let bigger = code[x] > code[y];
        hints.push(new Hint(50, 1,
            `Цифра №${x + 1} ${bigger ? 'більша' : 'менша'} за цифру №${y + 1}.`,
            (test) => (test[x] > test[y]) === bigger
        ));
    }

    { // 5. Однакова / різна парність
        let x, y; do { x = getRandomInt(0, 2); y = getRandomInt(0, 2); } while (x === y);
        let sameP = (code[x] % 2) === (code[y] % 2);
        hints.push(new Hint(sameP ? 45 : 55, 1,
            `Цифри №${x + 1} та №${y + 1} мають ${sameP ? 'однакову' : 'різну'} парність.`,
            (test) => ((test[x] % 2) === (test[y] % 2)) === sameP
        ));
    }

    { // 6. Сума суворо більша / менша за 9
        let x, y; do { x = getRandomInt(0, 2); y = getRandomInt(0, 2); } while (x === y || code[x] + code[y] === 9);
        let greater9 = code[x] + code[y] > 9;
        hints.push(new Hint(56, 1,
            `Сума цифр №${x + 1} і №${y + 1} суворо ${greater9 ? 'більша' : 'менша'} за 9.`,
            (test) => (test[x] + test[y] > 9) === greater9
        ));
    }

    { // 7. Сума всіх трьох парна / непарна
        let evenSum = (code[0] + code[1] + code[2]) % 2 === 0;
        hints.push(new Hint(50, 1,
            `Сума всіх трьох цифр є ${evenSum ? 'парним' : 'непарним'} числом.`,
            (test) => ((test[0] + test[1] + test[2]) % 2 === 0) === evenSum
        ));
    }

    { // 8. Середня за значенням
        let midPos = 0, max = Math.max(...code), min = Math.min(...code)
        for(let i=0; i<3; i++) 
            if(code[i] !== max && code[i] !== min) midPos = i;
        hints.push(new Hint(66.7, 1,
            `Цифра №${midPos + 1} є середньою за значенням.`,
            (test) => {
                let tMax = Math.max(...test), tMin = Math.min(...test);
                return test[midPos] !== tMax && test[midPos] !== tMin;
            }
        ));
    }

    { // 9. Дві цифри-сусіди
        let hasN = Math.abs(code[0]-code[1])===1 || Math.abs(code[0]-code[2])===1 || Math.abs(code[1]-code[2])===1;
        hints.push(new Hint(hasN ? 53 : 47, 1,
            `У коді ${hasN ? 'є дві цифри-сусіди' : 'немає жодних двох цифр-сусідів'}.`,
            (test) => (Math.abs(test[0]-test[1])===1 || Math.abs(test[0]-test[2])===1 || Math.abs(test[1]-test[2])===1) === hasN
        ));
    }

    { // 10. Добуток двох більший / менший або рівний 15
        let x, y; 
        do { x = getRandomInt(0, 2); 
            y = getRandomInt(0, 2); 
        } 
        while (x === y);

        let greater15 = code[x] * code[y] > 15;
        hints.push(new Hint(greater15 ? 53.4 : 47.6, 1,
            `Добуток цифр №${x + 1} та №${y + 1} ${greater15 ? 'більший за' : 'менший або рівний'} 15.`,
            (test) => (test[x] * test[y] > 15) === greater15
        ));
    }

    // ==========================================
    // 2. СКЛАДНІ ПІДКАЗКИ
    // ==========================================
    
    { // 11. Різниця найбільшої та найменшої
        let greater5 = (Math.max(...code) - Math.min(...code)) > 5;
        hints.push(new Hint(50, 2,
            `Різниця між найбільшою та найменшою цифрами в коді ${greater5 ? 'більша за 5' : 'менше за 6'}.`,
            (test) => (Math.max(...test) - Math.min(...test) > 5) === greater5
        ));
    }

    { // 12. Найбільша і сума двох інших
        let cMax = Math.max(...code);
        let greaterSum = cMax > (code[0] + code[1] + code[2] - cMax);
        hints.push(new Hint(greaterSum ? 60 : 40, 2,
            `Найбільша цифра в коді ${greaterSum ? 'більша' : 'менша або дорівнює'} сумі двох інших.`,
            (test) => {
                let tMax = Math.max(...test);
                return (tMax > (test[0]+test[1]+test[2]-tMax)) === greaterSum;
            }
        ));
    }

    { // 13. Сума всіх при діленні на 3
        let mod = (code[0] + code[1] + code[2]) % 3;
        hints.push(new Hint(mod === 0 ? 65 : 67.5, 2,
            `Сума всіх трьох цифр коду при діленні на 3 дає остачу ${mod}.`,
            (test) => (test[0] + test[1] + test[2]) % 3 === mod
        ));
    }

    { // 14. Рівно одна з N1, N2, N3
        let pDigit = code[getRandomInt(0, 2)];
        let missing = [0,1,2,3,4,5,6,7,8,9].filter(d => !code.includes(d)).sort(() => Math.random() - 0.5);
        let set3 = [pDigit, missing[0], missing[1]].sort(() => Math.random() - 0.5);
        hints.push(new Hint(47.5, 2,
            `В коді є рівно одна з цифр: ${set3.join(', ')}.`,
            (test) => test.filter(d => set3.includes(d)).length === 1
        ));
    }

    // ==========================================
    // 3. ДУЖЕ СКЛАДНІ (ТА АСИМЕТРИЧНІ) ПІДКАЗКИ
    // ==========================================
    
    { // 15. Рівно 2 з N1, N2, N3, N4
        let pCopy = [...code].sort(() => Math.random() - 0.5);
        let mCopy = [0,1,2,3,4,5,6,7,8,9].filter(d => !code.includes(d)).sort(() => Math.random() - 0.5);
        let set4 = [pCopy[0], pCopy[1], mCopy[0], mCopy[1]].sort(() => Math.random() - 0.5);
        hints.push(new Hint(70, 3,
            `У коді є рівно 2 цифри з переліку ${set4.join(', ')}.`,
            (test) => test.filter(d => set4.includes(d)).length === 2
        ));
    }

    { // 16. Сума непарних є квадратом / не є > 7 / не є < 8
        let sum = code.filter(d => d%2!==0).reduce((a,b)=>a+b, 0);
        let isSq = [0, 1, 4, 9, 16, 25].includes(sum);
        let txt = isSq ? 'є квадратом цілого числа' : (sum > 7 ? 'не є квадратом цілого числа, і становить більше 7' : 'не є квадратом цілого числа, і становить менше 8');
        hints.push(new Hint(isSq ? 65.8 : (sum > 7 ? 63.3 : 70.8), 3,
            `Сума всіх непарних цифр у коді ${txt}.`,
            (test) => {
                let tSum = test.filter(d => d%2!==0).reduce((a,b)=>a+b, 0);
                let tSq = [0, 1, 4, 9, 16, 25].includes(tSum);
                if (isSq) return tSq;
                if (sum > 7) return !tSq && tSum > 7;
                return !tSq && tSum < 8;
            }
        ));
    }

    { // 17. Чергуються / 2 парні підряд / 2 непарні підряд
        let e0 = code[0]%2===0, e1 = code[1]%2===0, e2 = code[2]%2===0;
        let type = (e0!==e1 && e1!==e2) ? 0 : ((e0===e1 && e0) || (e1===e2 && e1) ? 1 : 2);
        let txt = type === 0 ? 'парні та непарні цифри чергуються' : (type === 1 ? 'є дві парні цифри підряд' : 'є дві непарні цифри підряд');
        hints.push(new Hint(type === 0 ? 72.2 : 63.9, 3,
            `У коді ${txt}.`,
            (test) => {
                let te0 = test[0]%2===0, te1 = test[1]%2===0, te2 = test[2]%2===0;
                let tType = (te0!==te1 && te1!==te2) ? 0 : ((te0===te1 && te0) || (te1===te2 && te1) ? 1 : 2);
                return tType === type;
            }
        ));
    }

    { // 18. Сума позицій кратна 3 / немає такої
        let pairs = [[0,1], [0,2], [1,2]].filter(p => (code[p[0]]+code[p[1]])%3===0);
        if (pairs.length > 0) {
            let pair = pairs[getRandomInt(0, pairs.length-1)];
            hints.push(new Hint(66.7, 3,
                `Сума цифр на позиціях №${pair[0]+1} та №${pair[1]+1} кратна 3.`,
                (test) => (test[pair[0]]+test[pair[1]])%3===0
            ));
        } else {
            hints.push(new Hint(78, 3,
                `У коді немає жодної пари цифр, сума яких була б кратна 3.`,
                (test) => ![[0,1], [0,2], [1,2]].some(p => (test[p[0]]+test[p[1]])%3===0)
            ));
        }
    }

    { // 19. Ділиться націло (не 0 і 1) / немає і рівно N простих
        let hasDiv = [[0,1], [0,2], [1,2]].some(p => {
            let a = code[p[0]], b = code[p[1]]; return a>1 && b>1 && (a%b===0 || b%a===0);
        });
        let primeCount = code.filter(d => [2,3,5,7].includes(d)).length;
        if (hasDiv) {
            hints.push(new Hint(62.5, 3,
                `У коді є хоча б одна пара цифр, де одна ділиться на іншу націло, і ці цифри не 0 і 1.`,
                (test) => [[0,1], [0,2], [1,2]].some(p => { let a = test[p[0]], b = test[p[1]]; return a>1 && b>1 && (a%b===0 || b%a===0); })
            ));
        } else {
            let pWord = primeCount === 1 ? 'просте число' : (primeCount === 0 ? 'простих чисел' : 'простих числа');
            hints.push(new Hint(70, 3,
                `У коді немає жодної пари цифр (окрім 0 та 1), де б одна ділилась націло на іншу, і в коді є рівно ${primeCount} ${pWord}.`,
                (test) => {
                    let tDiv = [[0,1], [0,2], [1,2]].some(p => { let a = test[p[0]], b = test[p[1]]; return a>1 && b>1 && (a%b===0 || b%a===0); });
                    let tPrimes = test.filter(d => [2,3,5,7].includes(d)).length;
                    return !tDiv && tPrimes === primeCount;
                }
            ));
        }
    }

    { // 20. Різниця по модулю 3, 4 або 5 / немає такої
        let pairs = [[0,1], [0,2], [1,2]].filter(p => [3,4,5].includes(Math.abs(code[p[0]]-code[p[1]])));
        if (pairs.length > 0) {
            let pair = pairs[getRandomInt(0, pairs.length-1)];
            hints.push(new Hint(64, 3,
                `Різниця цифр №${pair[0]+1} і №${pair[1]+1} по модулю дорівнює 3, 4 або 5.`,
                (test) => [3,4,5].includes(Math.abs(test[pair[0]]-test[pair[1]]))
            ));
        } else {
            hints.push(new Hint(74, 3,
                `У коді немає жодної пари цифр, різниця яких по модулю дорівнювала б 3, 4 або 5.`,
                (test) => ![[0,1], [0,2], [1,2]].some(p => [3,4,5].includes(Math.abs(test[p[0]]-test[p[1]])))
            ));
        }
    }

    { // 21. Двоцифрове число є простим / немає такого
        let pairs = [];
        for(let i=0; i<3; i++) for(let j=0; j<3; j++) if(i!==j && isPrime(code[i]*10+code[j])) pairs.push([i,j]);
        if (pairs.length > 0) {
            let pair = pairs[getRandomInt(0, pairs.length-1)];
            hints.push(new Hint(73.4, 3,
                `Двоцифрове число, утворене цифрами №${pair[0]+1} та №${pair[1]+1} (в такому порядку), є простим. Цифра №${pair[0]+1} може бути нулем`,
                (test) => isPrime(test[pair[0]]*10+test[pair[1]])
            ));
        } else {
            hints.push(new Hint(80, 3,
                `В коді немає жодної пари цифр, щоб утворене з них двоцифрове число було б простим (враховуючи порядок).`,
                (test) => {
                    let hasP = false;
                    for(let i=0; i<3; i++) for(let j=0; j<3; j++) if(i!==j && isPrime(test[i]*10+test[j])) hasP = true;
                    return !hasP;
                }
            ));
        }
    }

    return hints;
}

export function getOpenHintsHTML() {
    let result = ``;
    for (let hint of GameState.allHints) {
        if (hint.isOpen) {
            result += `<li>${hint.text}</li>`;
        }
    }
    return result;
}

export function openHints(num) {
    let closedHints = GameState.allHints.filter(h => !h.isOpen);
    let limit = Math.min(num, closedHints.length);
    let newlyOpened = [];

    for (let i = closedHints.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [closedHints[i], closedHints[j]] = [closedHints[j], closedHints[i]];
    }

    for (let i = 0; i < limit; i++) {
        closedHints[i].isOpen = true;
        newlyOpened.push(closedHints[i]);
    }

    return newlyOpened;
}