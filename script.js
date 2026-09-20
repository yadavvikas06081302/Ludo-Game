const players = ['green', 'red', 'blue', 'yellow'];
let currentPlayerIndex = 0;
let diceValue = 0;
let isRollAllowed = true;

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
    document.getElementById('status').childNodes[0].nodeValue = "No moves! Next turn in 1s...";
    setTimeout(switchTurn, 1000);
  }
}

function enableTokenSelection(player) {
  for (let i = 1; i <= 4; i++) {
    const token = document.getElementById(`${player}-t${i}`);
    if (token) {
      token.classList.add('clickable');
      token.onclick = () => handleTokenClick(token, player, i);
    }
  }
}

function handleTokenClick(token, player, tokenNum) {
  alert(`${player.toUpperCase()} Token ${tokenNum} Unlocked/Moved!`);
  disableAllTokens();
  
  // Rule: Extra turn on rolling 6
  isRollAllowed = true;
  rollBtn.disabled = false;
  document.getElementById('status').childNodes[0].nodeValue = "Rolled 6! Roll again: ";
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
