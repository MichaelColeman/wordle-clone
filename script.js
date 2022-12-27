const letters = document.querySelectorAll('.tile');
const boardRows = document.querySelectorAll('.board-row');
const onscreenKeyboardButtons = document.querySelectorAll('.key');
const banner = document.querySelector('.banner');
const API_URL = 'https://words.dev-apis.com/word-of-the-day';
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
  // initial game state
  let currentGuess = '';
  let currentRow = 0;
  let done = false;
  let correctWord = '';

  // retrieve the current word
  getWordOfDay().then((word) => {
    correctWord = word;
    console.log(correctWord);
  });

  async function getWordOfDay() {
    try {
      const response = await fetch(API_URL);
      const responseData = await response.json();
      return responseData.word.toUpperCase();
    } catch (err) {
      console.log(err);
    }
  }

  //add event listeners to onscreen keyboard buttons
  Array.from(onscreenKeyboardButtons).forEach((key) => {
    key.addEventListener('click', (event) => {
      let input = event.target.dataset.key;

      switch (true) {
        case isLetter(input):
          addLetter(input.toUpperCase());
          // console.log(input);
          break;
        case input === '↵':
          commit();
          // console.log(`${input}: commit();`);
          break;
        case input === '←':
          backspace();
          // console.log(`${input}: backspace();`);
          break;
        default:
          console.log('error in event listener delegation');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (done) {
      return;
    }

    const action = e.key;
    switch (action) {
      case 'Enter':
        commit();
        break;
      case 'Backspace':
        backspace();
        break;
      default:
        if (isLetter(action)) {
          addLetter(action.toUpperCase());
        } else {
          console.error('Key not recognized');
        }
    }
  });

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = '';
  }

  setTileIDs();

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    //draws the character to the screen
    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;

    //adds a small animation when adding a letter
    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].classList.add('grow-shrink');
    setTimeout(() => {
      letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].classList.remove('grow-shrink');
    }, 200);
  }

  async function commit() {
    if (currentGuess.length != ANSWER_LENGTH) {
      return;
    }

    const res = await fetch('https://words.dev-apis.com/validate-word', {
      method: 'POST',
      body: JSON.stringify({ word: currentGuess }),
    });

    const resObj = await res.json();
    const validWord = resObj.validWord;
    //check the guess
    if (!validWord) {
      //make the board row shake if guess is incorrect
      boardRows[currentRow].classList.add('shake');
      setTimeout(() => {
        boardRows[currentRow].classList.remove('shake');
      }, 850);
      return;
    }

    const guessParts = currentGuess.split('');
    const wordParts = correctWord.split('');
    // console.log(wordParts);
    const map = makeMap(wordParts);

    //mark the letters as correct. and when it does,
    //it will decrement the amount of that letter remaining from the map.
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        //add color class to letter tile
        letters[currentRow * ANSWER_LENGTH + i].classList.add('correct');

        //add color class to keyboard key
        onscreenKeyboardButtons.forEach((key) => {
          if (key.dataset.key.toUpperCase() === guessParts[i]) {
            key.classList.add('correct');
          }
        });
        map[guessParts[i]]--;
      }
    }

    //mark the letters as close or wrong
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // do nothing
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        //add color class to letter tile
        letters[currentRow * ANSWER_LENGTH + i].classList.add('close');

        //add color class to keyboard key
        onscreenKeyboardButtons.forEach((key) => {
          if (key.dataset.key.toUpperCase() === guessParts[i]) {
            key.classList.add('close');
          }
        });
        map[guessParts[i]]--;
      } else {
        //add color class to letter tile
        letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong');

        //add color class to keyboard key
        onscreenKeyboardButtons.forEach((key) => {
          if (key.dataset.key === guessParts[i]) {
            key.classList.add('wrong');
            //disable the key at this location
            key.disabled = true;
          }
        });
      }
    }

    currentRow++;

    // TODO validate the word

    if (currentGuess === wordParts.join('')) {
      done = true;
      banner.classList.add('win');
      banner.textContent = "You've Won";
      return;
    } else if (currentRow === ROUNDS) {
      banner.classList.add('lose');
      banner.textContent = 'Better luck next time!';
      done = true;
    }

    currentGuess = '';
  }

  function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
      const letter = array[i];
      if (obj[letter]) {
        obj[letter]++;
      } else {
        obj[letter] = 1;
      }
    }
    return obj;
  }

  function isLetter(letter) {
    return /^[a-zA-z]$/.test(letter);
  }

  function setTileIDs() {
    Array.from(letters).forEach((letter, i) => {
      letter.id = `letter-${i}`;
    });
  }
}

init();
