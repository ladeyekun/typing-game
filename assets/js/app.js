'use strict';

import { wordBank } from "./words.js";
import { select, listen, getRandomNumber, create } from "./util.js";

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

const startBtn = select('.start');
const timerObj = select('.timer span');
const randomWordObj = select('.random-words p');
const hitsCounterObj = select('.hit-counter');
const inputObj = select('.input');
const progressBar = select('.progress-bar');
const viewScoreBtn = select('.view-score');
const instructionBtn = select('.instruction');
const instruction = select('.instruction-dialog');
const dialog = select('.dialog-overlay');
const scoreDialog = select('.scores');
const scores = [];
const words = [];
const wordBankCopy = wordBank.toSorted(() => Math.random() - 0.5);

let longestWord = '';
let progressBarIncremental = 0;
let progressBarWidth = 0;

let gameStarted = false;
let totalGameTime = 20;
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

function startGame() {
    if (!gameStarted) {
        resetGame();
        instructionBtn.style.display = 'none';
        viewScoreBtn.style.display = 'none';
        gameStarted = true;
        gameSound.play();
        startBtn.innerText = RESTART;
        startTiming();
        setTimeout(() => {
            removeClass(randomWordObj, 'animate');
            getRandomWords();
            addClass(randomWordObj, 'animate');
            enableInput();    
        }, 1000);
    } else 
     restartGame();
}

function resetGame() {
    gameStarted = false;
    wordBankCopy.sort(() => Math.random() - 0.5);
    if (timerObj.classList.contains('blink')) timerObj.classList.remove('blink');    
    randomWordObj.innerText = '';
    timerObj.innerText = '---';
    startBtn.innerText = START;
    inputObj.value = '';
    hits = 0;
    updateHits();
    disableInput();
    longestWord = '';
    words.length = 0;
    progressBarReset();
    stopSound(gameSound);
    clearInterval(timer);
}

function stopSound(sound) {
    sound.pause();
    sound.currentTime = 0;
}

function restartGame() {
    if (gameStarted) {
        resetGame();
        startGame();
    }
}

function endGame() {
    if (hits > 0) {
        let percentage = hits * 100 / wordBank.length
        addScore(now(), hits, parseFloat(percentage.toFixed(2)));
    }
    setTimeout(() => {
        showScores();
    }, 1000);

    stopSound(gameSound);
    resetGame();
    viewScoreBtn.style.display = 'block';
    instructionBtn.style.display = 'block';
}

function addScore(date, hits, percentage) {
    const scoreObj = {
        date: date,
        hits: hits,
        percentrage: percentage
    }
    const arr = fetchData('scores');
    arr.unshift(scoreObj);
    storeData(arr, 'scores');

    scores.push(scoreObj);

}

function fetchData(name) {
    if (localStorage.length > 0 && name in localStorage) {
        return JSON.parse(localStorage.getItem(name));
    }
    return [];
}

function storeData(data, name) {
    if (data.length > 0 && name.trim().length > 0) {
        data.sort((a, b) => {
            if (b.hits > a.hits) return 1;
            if (b.hits < a.hits) return -1;
            return b.date - a.date;
        });
        data.splice(9);
        localStorage.setItem(name, JSON.stringify(data));
    }
}

function startTiming() {
    let seconds = totalGameTime;
    timer = setInterval (() => {
        timerObj.innerText = formatTimer(seconds);
        seconds--;

        if (seconds < 5 ) timerObj.classList.add('blink');

        if (seconds < 0) {
            endGame();
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
    inputObj.placeholder = 'Enter the word';
    inputObj.focus();
}

function getRandomWords() {
    if (wordBankCopy.length === words.length) endGame();
    let word = '';
    do {
        word = wordBankCopy[getRandomNumber(1, wordBankCopy.length) - 1];
    } while (words.includes(word));

    words.push(word);
    progressBarIncremental = getIncrementalValue(word);
    randomWordObj.innerText = word;
}

function checkWord(char) {
    updateProgressBar();
    deleteFirstLetter();
    if (randomWordObj.innerText.length === 0) {
        hits++;
        updateHits(true);
        updateLongestWord();
        progressBarReset();
        removeClass(randomWordObj, 'animate');
        getRandomWords();
        addClass(randomWordObj, 'animate');
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

function showScores() {
    const highestScores = fetchData('scores');
    
    if (highestScores.length > 0) {
        viewScoreBtn.style.display = 'none';
        scoreDialog.innerText = '';
        loadScores(scoreDialog, 'Rank', 'Hits', 'Date', true);

        for (const [index, score] of highestScores.entries()) {
            loadScores(scoreDialog, index + 1, score.hits, score.date);
        }

        dialog.style.display = 'block';
    } else {

    }
}

function loadScores(score, col1, col2, col3, heading = false) {
    const rowDiv = create('div');
    const col1Div = create('p');
    const col2Div = create('p');
    const col3Div = create('p');

    rowDiv.classList.add('row', 'flex', 'flex-between');
    col1Div.classList.add('col-1');
    col2Div.classList.add('col-2');
    col3Div.classList.add('col-3');

    if (heading) {
        col1Div.innerHTML = `<strong>${col1}</strong>`;
        col2Div.innerHTML = `<strong>${col2}</strong>`;
        col3Div.innerHTML = `<strong>${col3}</strong>`;    
    } else {
        col1Div.innerText = `${col1}`;
        col2Div.innerText = `${col2.toString().padStart(3, 0)}`;
        col3Div.innerText = `${col3}`;    
    }

    rowDiv.appendChild(col1Div);
    rowDiv.appendChild(col2Div);
    rowDiv.appendChild(col3Div);

    score.appendChild(rowDiv);
}

function now() {
    const date = new Date();
    const options = { month: 'short', day: '2-digit', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-ca', options);

    return formattedDate;
}

function sleep(callback, milliseconds) {
    setTimeout(callback, milliseconds);
}

function removeClass(selector, className) {
    if (selector.classList.contains(className)) 
        selector.classList.remove(className);
}

function addClass(selector, className) {
    if (!selector.classList.contains(className))
        selector.classList.add(className);
}

function getIncrementalValue(word) {
    if (word.length > 0) {
        let result = (1 / word.length * 100).toFixed(2);
        return parseFloat(result);
    }
    return 0;
}

function updateProgressBar() {
    if (progressBarWidth < 100) {
        progressBarWidth += progressBarIncremental;
        progressBar.style.width = `${progressBarWidth}%`;
    }
}

function progressBarReset() {
    progressBarIncremental = 0;
    progressBarWidth = 0;
    progressBar.style.width = '0%';
}


listen('click', startBtn, () => {
    startGame();
});

listen('keydown', inputObj, (event) => {
    keypressSound.play();
    if (event.key === 'Backspace') event.preventDefault();
    if (event.key.toLowerCase() !== randomWordObj.innerText.charAt(0)) event.preventDefault();
});

listen('input', inputObj, (event) => {
    let char = event.data.toLowerCase();
    if (randomWordObj.innerText.charAt(0) === char) {
        checkWord(char);
    }
});

listen('click', window, (event) => {
    if (event.target === dialog) {
        dialog.style.display = 'none';
        if (fetchData('scores').length > 0) viewScoreBtn.style.display = 'block';
    }
    if (event.target === instruction) {
        instruction.style.display = 'none';
        instructionBtn.style.display = 'block';
    }    
});

listen('load', window, () => {
    if (fetchData('scores').length > 0){
        viewScoreBtn.style.display = 'block';
    }
    instructionBtn.style.display = 'block';
});

listen('click', viewScoreBtn, () => {
    showScores();
});

listen('click', instructionBtn, () => {
    instructionBtn.style.display = 'none';
    instruction.style.display = 'block';
});


