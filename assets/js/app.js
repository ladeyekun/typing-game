'use strict';

import { wordBank } from "./words.js";
import { select, listen, getRandomNumber } from "./util.js";

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
const startObj = select('.start span');
const timerObj = select('.timer span');
const randomWordObj = select('.random-words p');
const hitsCounterObj = select('.hit-counter');
const inputObj = select('.input');
const progressBar = select('.progress-bar');

const dialog = select('.dialog-overlay');
const scoreDialog = select('.scores');
const scores = [];
const words = [];
let wordBankCopy = wordBank.toSorted(() => Math.random() - 0.5);

let longestWord = '';
let progressBarIncremental = 0;
let progressBarWidth = 0;

let gameStarted = false;
let totalGameTime = 15;
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
        gameStarted = true;
        gameSound.play();
        startObj.innerText = RESTART;
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
    wordBankCopy = wordBank.toSorted(() => Math.random() - 0.5);
    if (timerObj.classList.contains('blink')) timerObj.classList.remove('blink');    
    randomWordObj.innerText = '';
    timerObj.innerText = '---';
    startObj.innerText = START;
    inputObj.value = '';
    hits = 0;
    updateHits();
    disableInput();
    longestWord = '';
    words.length = 0;
    progressBarReset();
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

function endGame() {
    if (hits > 0) {
        let percentage = hits * 100 / wordBank.length
        addScore(now(), hits, parseFloat(percentage.toFixed(2)));
        console.log(localStorage);
    }
    showScores();
    stopSound(gameSound);
    resetGame();
    clearInterval(timer);
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
        console.log(data);
        data.sort((a, b) => {
            if (b.hits > a.hits) return 1;
            if (b.hits < a.hits) return -1;
            return b.date - a.date;
        });
        console.log(data);
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
    if (wordBankCopy.length === 0) endGame();
    let word = wordBankCopy[getRandomNumber(1, wordBankCopy.length) - 1];
    wordBankCopy = wordBankCopy.filter(element => element !== word);
    //updateWordBank(wordBankCopy, word);
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
        scoreDialog.innerText = '';
        for (const [index, score] of highestScores.entries()) {
            const rowDiv = document.createElement('div');
            const col1Div = document.createElement('p');
            const col2Div = document.createElement('p');
            const col3Div = document.createElement('p');

            rowDiv.classList.add('row', 'flex', 'flex-between');
            col1Div.classList.add('col-1');
            col2Div.classList.add('col-2');
            col3Div.classList.add('col-3');

            col1Div.innerText = `${index + 1}`;
            col2Div.innerText = `${score.hits.toString().padStart(3, 0)} hits`;
            col3Div.innerText = `${score.date}`;

            rowDiv.appendChild(col1Div);
            rowDiv.appendChild(col2Div);
            rowDiv.appendChild(col3Div);

            scoreDialog.appendChild(rowDiv);

           // console.log(`Index=${index}, scoreObj=${score}`);
        }

        dialog.style.display = 'block';
    }
}

function updateWordBank(arr, word) {
    let index = arr.indexOf(word);
    if (index !== -1) arr.splice(index, 1);
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
    }
});

if ('scores' in localStorage) localStorage.removeItem('scores');


