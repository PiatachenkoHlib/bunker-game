import { GameState } from './state.js';
import { getRandomInt } from './utils.js';
import { startTimer } from './timer.js';
import { toNewRound, toBrief } from './translations.js';
import { outputText } from './text.js';
import { roleCardInner } from './dom.js';
import { getOpenHintsHTML, openHints } from './hints.js';

const Roles = {
    CIVIC: 'Мирний',
    SABOTEUR: 'Диверсант'
};

// Методи ролей
export function initRoles(pNum){
    if(pNum < 2 || pNum > 6) return;

    GameState.roleDeck.push(Roles.SABOTEUR);
    for(let i = 0; i < pNum; i++) GameState.roleDeck.push(Roles.CIVIC);

    if(pNum > 4) GameState.roleDeck.push(Roles.SABOTEUR);
}

export function giveRole(){
    let result;
    let roleNum = getRandomInt(0, GameState.roleDeck.length - 1);

    result = GameState.roleDeck[roleNum];
    GameState.roleDeck.splice(roleNum, 1);

    return result;
}

export function assignAllRoles() {
    GameState.playerRoles = [];
    for (let i = 0; i < GameState.playersNumber; i++) {
        GameState.playerRoles.push(giveRole());
    }
}

export function updateRoleScreen() {
    const rolePlayerTitle = document.getElementById('role-player-title');
    const roleName = document.getElementById('role-name');
    const roleCodeText = document.getElementById('role-code-text');

    rolePlayerTitle.textContent = `ГРАВЕЦЬ ${GameState.currentPlayer}/${GameState.playersNumber}`;
    
    let currentRole = GameState.playerRoles[GameState.currentPlayer - 1];
    
    roleName.className = "role-title"; 
    roleName.style.color = "var(--text-white)"; 

    if (currentRole === Roles.SABOTEUR) {
        roleName.textContent = "ТИ - ДИВЕРСАНТ!";
        roleCodeText.textContent = `КОД: ${GameState.gameCode.join('')}`;
    } else {
        roleName.textContent = "ТИ - МИРНИЙ!";
        roleCodeText.textContent = "КОД: ХХХ";
    }
}

let holdStartTime = 0;
let isHolding = false;

export function startHold(e) {
    if (e.type === 'touchstart') e.preventDefault(); 
    if (isHolding) return;
    isHolding = true;
    holdStartTime = Date.now();
    roleCardInner.classList.add('is-flipped');
}

export function endHold(e) {
    if (!isHolding) return;
    isHolding = false;
    roleCardInner.classList.remove('is-flipped');
    
    let holdDuration = Date.now() - holdStartTime;

    if (holdDuration >= 500) {
        GameState.currentPlayer++;
        if (GameState.currentPlayer > GameState.playersNumber) {
            toBrief(); // Просто переходимо на брифінг
        } else {
            setTimeout(updateRoleScreen, 300);
        }
    }
}