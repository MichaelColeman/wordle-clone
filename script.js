//attach to HTML elements
const letters = document.querySelectorAll('.tile');
const boardRows = document.querySelectorAll('.board-row');
const banner = document.querySelector('.banner');
const onscreenKeyboardButtons = document.querySelectorAll('.key');

(async function init() {
  //initialize app state
  let currentGuess = '';
  let currentRow = 0;
  let isGameOver = false;
  const ANSWER_LENGTH = 5;
  const ROUNDS = 6;

  //grab word of the day
  const res = await fetch('https://words.dev-apis.com/word-of-the-day');
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const solutionLetters = word.split('');
  console.log(word);

  //add event listeners to onscreen keyboard buttons
  Array.from(onscreenKeyboardButtons).forEach((key) => {
    key.addEventListener('click', (event) => {
      let input = event.target.dataset.key;

      switch (true) {
        case isLetter(input):
          addLetter(input.toUpperCase());
          break;
        case input === '↵':
          commit();
          break;
        case input === '←':
          backspace();
          break;
        default:
          console.log('error in event listener delegation');
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (isGameOver) {
      return;
    }

    const action = e.key.toUpperCase();
    switch (action) {
      case 'Enter':
        commit();
        break;
      case 'Backspace':
        backspace();
        break;
      default:
        if (isLetter(action)) {
          addLetter(action);
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
    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].classList.add('pop');
    setTimeout(() => {
      letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].classList.remove('pop');
    }, 100);
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

    //map the letters in the solution to an object that keeps track of each instance of the letter.
    //this is needed to properly color the tiles
    const letterMap = makeMap(solutionLetters);
    console.log(solutionLetters);
    console.dir(letterMap);
    const guessParts = currentGuess.split('');

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      //if the letter of the players guess is in the correct tile, add the "correct" class to
      //the tile and keyboard section
      if (guessParts[i] === solutionLetters[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('correct');

        onscreenKeyboardButtons.forEach((key) => {
          if (key.dataset.key.toUpperCase() === guessParts[i]) {
            key.classList.add('correct');
          }
        });
        letterMap[guessParts[i]]--;
      }
    }

    //iterate through the letters in the guess and mark the letters as close or wrong
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      let currentLetter = guessParts[i];
      if (currentLetter === solutionLetters[i]) {
        // do nothing
      } else if (solutionLetters.includes(currentLetter) && letterMap[currentLetter] > 0) {
        //add color class to letter tile
        letters[currentRow * ANSWER_LENGTH + i].classList.add('close');

        //add color class to keyboard key
        onscreenKeyboardButtons.forEach((key) => {
          if (key.dataset.key.toUpperCase() === currentLetter) {
            key.classList.add('close');
          }
        });
        letterMap[currentLetter]--;
      } else {
        //add color class to letter tile
        letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong');

        //add color class to keyboard key
        onscreenKeyboardButtons.forEach((key) => {
          if (key.dataset.key === currentLetter) {
            key.classList.add('wrong');
          }
        });
      }
    }

    currentRow++;

    if (currentGuess === word) {
      isGameOver = true;
      banner.classList.add('win');
      banner.textContent = "You've Won";
      return;
    } else if (currentRow === ROUNDS) {
      banner.classList.add('lose');
      banner.textContent = 'Better luck next time!';
      isGameOver = true;
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
    return /^[a-zA-Z]$/.test(letter);
  }

  function setTileIDs() {
    Array.from(letters).forEach((letter, i) => {
      letter.id = `letter-${i}`;
    });
  }
})();
