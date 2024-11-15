'use strict';

class Score {
    #date;
    #hits;
    #percentage;

    constructor(date, hits, percentage) {
        this.#date = date;
        this.#hits = hits;
        this.#percentage = percentage;
    }

    get date() {
        return this.#date;
    }

    get hits() {
        return this.#hits;
    }

    get percentage() {
        return this.#percentage;
    }
}


function select(selector, scope = document) {
    return scope.querySelector(selector);
}

function listen(event, selector, callback) {
    return selector.addEventListener(event, callback);
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const wordBank = [
    'dinosaur', 'love', 'pineapple', 'calendar', 'robot', 'building',
    'population', 'weather', 'bottle', 'history', 'dream', 'character', 'money',
    'absolute', 'discipline', 'machine', 'accurate', 'connection', 'rainbow',
    'bicycle', 'eclipse', 'calculator', 'trouble', 'watermelon', 'developer',
    'philosophy', 'database', 'periodic', 'capitalism', 'abominable', 'phone',
    'component', 'future', 'pasta', 'microwave', 'jungle', 'wallet', 'canada',
    'velvet', 'potion', 'treasure', 'beacon', 'labyrinth', 'whisper', 'breeze',
    'coffee', 'beauty', 'agency', 'chocolate', 'eleven', 'technology',
    'alphabet', 'knowledge', 'magician', 'professor', 'triangle', 'earthquake',
    'baseball', 'beyond', 'evolution', 'banana', 'perfume', 'computer',
    'butterfly', 'discovery', 'ambition', 'music', 'eagle', 'crown',
    'chess', 'laptop', 'bedroom', 'delivery', 'enemy', 'button', 'door', 'bird',
    'superman', 'library', 'unboxing', 'bookstore', 'language', 'homework',
    'beach', 'economy', 'interview', 'awesome', 'challenge', 'science',
    'mystery', 'famous', 'league', 'memory', 'leather', 'planet', 'software',
    'update', 'yellow', 'keyboard', 'window', 'beans', 'truck', 'sheep',
    'blossom', 'secret', 'wonder', 'enchantment', 'destiny', 'quest', 'sanctuary',
    'download', 'blue', 'actor', 'desk', 'watch', 'giraffe', 'brazil',
    'audio', 'school', 'detective', 'hero', 'progress', 'winter', 'passion',
    'rebel', 'amber', 'jacket', 'article', 'paradox', 'social', 'resort',
    'mask', 'escape', 'promise', 'band', 'level', 'hope', 'moonlight', 'media',
    'orchestra', 'volcano', 'guitar', 'raindrop', 'inspiration', 'diamond',
    'illusion', 'firefly', 'ocean', 'cascade', 'journey', 'laughter', 'horizon',
    'exploration', 'serendipity', 'infinity', 'silhouette', 'wanderlust',
    'marvel', 'nostalgia', 'serenity', 'reflection', 'twilight', 'harmony',
    'symphony', 'solitude', 'essence', 'melancholy', 'melody', 'vision',
    'silence', 'whimsical', 'eternity', 'cathedral', 'embrace', 'poet', 'ricochet',
    'mountain', 'dance', 'sunrise', 'dragon', 'adventure', 'galaxy', 'echo',
    'fantasy', 'radiant', 'serene', 'legend', 'starlight', 'light', 'pressure',
    'bread', 'cake', 'caramel', 'juice', 'mouse', 'charger', 'pillow', 'candle',
    'film', 'jupiter'
];

const startBtn = select('.start');
const startObj = select('.start span');
const timerObj = select('.timer span');
const randomWordObj = select('.random-words p');
const hitsCounterObj = select('.hit-counter');
const inputObj = select('.input');

const dialog = select('.dialog-overlay');
const summary = select('.details');
const scores = [];
const words = [];
let wordBankCopy = [...wordBank];

let longestWord = '';
let lastWordGenerationTime = 0;
let fastestTime = 0;

let gameStarted = false;
let totalGameTime = 10;
let hits = 0;
const START = 'start';
const RESTART = 'restart';
let timer = null;

const gameSound = new Audio('./assets/media/game-01.mp3');
gameSound.type = 'audio/mp3';

const hitsSound = new Audio('./assets/media/hits-01.mp3');
hitsSound.type = 'audio/mp3';

const keypressSound = new Audio('./assets/media/keyboard.mp3');
keypressSound.type = 'audio/mp3';

listen('click', startBtn, () => {
    startGame();
});

listen('keydown', inputObj, (event) => {
    keypressSound.play();
    if (event.key === 'Backspace') event.preventDefault();
    if (event.key !== randomWordObj.innerText.charAt(0)) event.preventDefault();
});

listen('input', inputObj, (event) => {
    let char = event.data;
    if (randomWordObj.innerText.charAt(0) === char) {
        checkWord(char);
    }
});

listen('click', window, (event) => {
    if (event.target === dialog) {
        dialog.style.display = 'none';
    }
});

function startGame() {
    if (!gameStarted) {
        resetGame();
        gameStarted = true;
        gameSound.play();
        startObj.innerText = RESTART;
        startTiming();
        setTimeout(() => {
            getRandomWords();
            enableInput();    
        }, 1000);
    } else 
     restartGame();
}

function resetGame() {
    gameStarted = false;
    wordBankCopy = [...wordBank];
    randomWordObj.innerText = '';
    timerObj.innerText = '---';
    startObj.innerText = START;
    inputObj.value = '';
    hits = 0;
    updateHits();
    disableInput();
    longestWord = '';
    fastestTime = 0;
    lastWordGenerationTime = 0;
    words.length = 0;
    stopSound(gameSound);
}

function stopSound(sound) {
    sound.pause();
    sound.currentTime = 0;
}

function restartGame() {
    if (gameStarted) {
        resetGame();
        clearInterval(timer);
        startGame();
    }
}

function startTiming() {
    let seconds = totalGameTime;
    timer = setInterval (() => {
        timerObj.innerText = formatTimer(seconds);
        seconds--;
        if (seconds < 0) {
            let percentage = hits * 100 / wordBank.length
            scores.push(new Score(now(), hits, percentage.toFixed(2)));
            dialogContent();
            stopSound(gameSound);
            resetGame();
            clearInterval(timer);
        }
    }, 1000);
}

function formatTimer(timer) {
    return String(timer).padStart(3, '0');
}

function disableInput() {
    inputObj.disabled = true;
    inputObj.placeholder = 'Hit START to play';
}

function enableInput() {
    inputObj.disabled = false;
    inputObj.placeholder = '';
    inputObj.focus();
}

function getRandomWords() {
    let word = wordBankCopy[getRandomNumber(1, wordBankCopy.length) - 1];
    wordBankCopy = wordBankCopy.filter(element => element !== word);
    words.push(word);
    timeToGetWord();
    randomWordObj.innerText = word;
}

function timeToGetWord() {
    if (lastWordGenerationTime === 0) {
        lastWordGenerationTime = now();
    } else {
        let diff = (now() - lastWordGenerationTime) / 1000;
        if (fastestTime === 0) {
            fastestTime = diff;
        } else {
            fastestTime = 
                diff < fastestTime ? diff : fastestTime;
        }
    }
}

function checkWord(char) {
    deleteFirstLetter();
    if (randomWordObj.innerText.length === 0) {
        hits++;
        updateHits(true);
        updateLongestWord();
        getRandomWords();
        inputObj.value = '';
    }
}

function updateLongestWord() {
    if (words.length > 0) {
        let previous = words[words.length - 1];
        longestWord = 
            (previous.length > longestWord.length) ? previous : longestWord;
    }
}

function deleteFirstLetter() {
    let word = randomWordObj.innerText;
    randomWordObj.innerText = (word.length >= 2) ? word.slice(1) : '';
}

function updateHits(playSound = false) {
    hitsCounterObj.innerText = hits;
    if (playSound) hitsSound.play();
}

function dialogContent() {
    let html = '';
    html += `<p><strong>Hits: </strong>${hits}</p>`;
    html += `<p><strong>Percentage: </strong>`;
    html += `${(hits * 100 / wordBank.length).toFixed(2)}%</p>`;
    html += `<p><strong>Fastest hit time: </strong>`;
    html += `${fastestTime.toFixed(2)}s</p>`;
    html += `<p><strong>Longest word hit: </strong>${longestWord}</p>`;
    summary.innerHTML = html;
    dialog.style.display = 'flex';
}

function now() {
    return new Date();
}

function sleep(callback, milliseconds) {
    setTimeout(callback, milliseconds);
}


