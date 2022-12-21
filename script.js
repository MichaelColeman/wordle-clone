const letters = document.querySelectorAll('.tile');
const ANSWER_LENGTH = 5;

function isLetter(letter) {
  return /^[a-zA-z]$/.test(letter);
}

function backspace() {}

function setTileIDs() {
  Array.from(letters).forEach((letter, i) => {
    letter.id = `letter-${i}`;
    // console.log(letter.id);
  });
}

async function init() {
  let currentGuess = '';
  let currentRow = 0;

  document.addEventListener('keydown', (e) => {
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

  setTileIDs();

  function addLetter(letter) {
    console.log(letter);

    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    //this chooses which box to place each character in the users current guess
    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;
  }

  async function commit() {
    if (currentGuess.length != ANSWER_LENGTH) {
      return;
    }

    currentRow++;
    currentGuess = '';
  }
}

init();
