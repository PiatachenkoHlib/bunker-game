export const GameState = {
    gameCode: [0, 0, 0],

    playersNumber: 0,
    currentPlayer: 1,

    roundsNum: 0,
    currentRound: 0,

    discusTime: 0,
    currentTime: 0,

    isWordleCheck: false,
    isBlocked: false,

    lockHistory: [],
    timerGlitch: false,

    hintsList: [],
    nextHintNumber: 0,

    roleDeck: [],
    playerRoles: [],
    
    activeTimer: null,
    autoActionTimeout: null
};