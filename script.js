const letters = document.querySelectorAll('.tile');
const boardRows = document.querySelectorAll('.board-row');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
  //app state
  let currentGuess = '';
  let currentRow = 0;
  let done = false;
  //grab word of the day
  const res = await fetch('https://words.dev-apis.com/word-of-the-day');
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordParts = word.split('');
  console.log(word);

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
        console.log(e.key);
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
    console.log(currentGuess);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = '';
  }

  setTileIDs();

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    //draws the character to the screen
    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;

    //adds a small animation when adding a letter
    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].classList.add(
      'grow-shrink'
    );
    console.log(boardRows[currentRow]);
    setTimeout(() => {
      letters[
        ANSWER_LENGTH * currentRow + currentGuess.length - 1
      ].classList.remove('grow-shrink');
    }, 850);
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
      console.log(boardRows[currentRow]);
      setTimeout(() => {
        boardRows[currentRow].classList.remove('shake');
      }, 850);
      return;
    }

    const guessParts = currentGuess.split('');
    const map = makeMap(wordParts);

    //mark the letters as correct. and when it does,
    //it will decrement the amount of that letter remaining from the map.
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        //mark as correct
        letters[currentRow * ANSWER_LENGTH + i].classList.add('correct');
        map[guessParts[i]]--;
      }
    }

    //marksthe letters as close or wrong
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // do nothing
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('close');
        map[guessParts[i]]--;
      } else {
        letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong');
      }
    }

    currentRow++;

    // TODO validate the word

    if (currentGuess === word) {
      alert("you've won");
      done = true;
      return;
    } else if (currentRow === ROUNDS) {
      alert("you've lost");
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
