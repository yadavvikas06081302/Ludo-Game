const players = ['green', 'red', 'blue', 'yellow'];
let currentPlayerIndex = 1; // Starting with Red as in screenshot
let diceValue = 0;
let isRollAllowed = true;

// Define starting positions on grid for each color path
const startPositions = {
  red: { row: 7, col: 2 },
  green: { row: 2, col: 9 },
  blue: { row: 9, col: 14 },
  yellow: { row: 14, col: 7 }
};

const playerTurnText = document.getElementById('player-turn');
const diceDisplay = document.getElementById('dice-display');
const rollBtn = document.getElementById('roll-btn');

const colorHex = {
  green: '#2ecc71',
  red: '#ff4d4d',
  blue: '#3498db',
  yellow: '#f1c40f'
};

function rollDice() {
  if (!isRollAllowed) return;

  diceValue = Math.floor(Math.random() * 6) + 1;
  diceDisplay.innerText = `🎲 ${diceValue}`;
  isRollAllowed = false;
  rollBtn.disabled = true;

  const currentPlayer = players[currentPlayerIndex];

  if (diceValue === 6) {
    document.getElementById('status').childNodes[0].nodeValue = "Rolled 6! Tap token to move: ";
    enableTokenSelection(currentPlayer);
  } else {
    document.getElementById('status').childNodes[0].nodeValue = "No 6! Next turn in 1s...";
    setTimeout(switchTurn, 1000);
  }
}

function enableTokenSelection(player) {
  for (let i = 1; i <= 4; i++) {
    const token = document.getElementById(`${player}-t${i}`);
    if (token) {
      token.classList.add('clickable');
      token.onclick = () => moveTokenToStart(token, player);
    }
  }
}

function moveTokenToStart(token, player) {
  // Disable clicks and animation
  disableAllTokens();

  const board = document.getElementById('board');
  const startPos = startPositions[player];

  // Token ko Home Box se nikalke Board Grid cell par append karna
  token.style.gridRow = startPos.row;
  token.style.gridColumn = startPos.col;
  token.classList.add('on-board');

  // Board par move karna
  board.appendChild(token);

  // Turn management (Extra turn on 6)
  document.getElementById('status').childNodes[0].nodeValue = "Moved! Roll again: ";
  isRollAllowed = true;
  rollBtn.disabled = false;
}

function disableAllTokens() {
  document.querySelectorAll('.token').forEach(t => {
    t.classList.remove('clickable');
    t.onclick = null;
  });
}

function switchTurn() {
  disableAllTokens();
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  const nextPlayer = players[currentPlayerIndex];

  playerTurnText.innerText = nextPlayer.toUpperCase();
  playerTurnText.style.color = colorHex[nextPlayer];
  document.getElementById('status').childNodes[0].nodeValue = "Turn: ";

  isRollAllowed = true;
  rollBtn.disabled = false;
}
