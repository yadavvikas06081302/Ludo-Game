const board=document.getElementById("board");
const rollBtn=document.getElementById("roll");
const newGameBtn=document.getElementById("newGame");
const diceEl=document.getElementById("dice");
const message=document.getElementById("message");

const players=[
 {name:"Red",color:"red",start:0},
 {name:"Green",color:"green",start:13},
 {name:"Yellow",color:"yellow",start:26},
 {name:"Blue",color:"blue",start:39}
];

// 52 cells around the outside of a standard 15x15 board.
const track=[];
for(let c=1;c<=5;c++) track.push([6,c]);
for(let r=5;r>=1;r--) track.push([r,6]);
for(let c=7;c<=13;c++) track.push([1,c]);
for(let r=2;r<=5;r++) track.push([r,13]);
for(let c=12;c>=9;c--) track.push([6,c]);
for(let r=7;r<=13;r++) track.push([r,8]);
for(let c=7;c>=1;c--) track.push([13,c]);
for(let r=12;r>=9;r--) track.push([r,6]);
for(let c=5;c>=1;c--) track.push([8,c]);
for(let r=7;r>=1;r--) track.push([r,1]);
for(let c=2;c<=5;c++) track.push([6,c]);
// The above route contains the complete 52-cell circuit.
const clean=[];
const used=new Set();
for(const p of track){const k=p.join(",");if(!used.has(k)){used.add(k);clean.push(p)}}
track.length=0;
track.push(...clean.slice(0,52));

const safe=[0,8,13,21,26,34,39,47];
const tokens=players.map(()=>[0,0,0,0]); // 0 home, 1..52 track, 53 finished
let current=0;
let dice=null;
let gameOver=false;

function buildBoard(){
  board.innerHTML="";
  for(let r=0;r<15;r++){
    for(let c=0;c<15;c++){
      const cell=document.createElement("div");
      cell.className="cell";

      if(r<6&&c<6)cell.classList.add("home-red");
      if(r<6&&c>8)cell.classList.add("home-green");
      if(r>8&&c<6)cell.classList.add("home-yellow");
      if(r>8&&c>8)cell.classList.add("home-blue");

      if(r>=6&&r<=8&&c>=6&&c<=8)cell.classList.add("center");

      const i=track.findIndex(p=>p[0]===r&&p[1]===c);
      if(i>=0){
        cell.classList.add("track");
        if(safe.includes(i))cell.classList.add("safe");
        if(i===0)cell.classList.add("start-red");
        if(i===13)cell.classList.add("start-green");
        if(i===26)cell.classList.add("start-yellow");
        if(i===39)cell.classList.add("start-blue");
      }

      // Colored home lanes leading to the center.
      if(c===7&&r>=1&&r<=5)cell.classList.add("lane-green");
      if(c===7&&r>=9&&r<=13)cell.classList.add("lane-yellow");
      if(r===7&&c>=1&&c<=5)cell.classList.add("lane-red");
      if(r===7&&c>=9&&c<=13)cell.classList.add("lane-blue");

      // Four home slots.
      const slot =
        (r===2||r===4)&&(c===2||c===4) ? true :
        (r===2||r===4)&&(c===10||c===12) ? true :
        (r===10||r===12)&&(c===2||c===4) ? true :
        (r===10||r===12)&&(c===10||c===12) ? true : false;
      if(slot){
        const s=document.createElement("div");
        s.className="home-slot";
        cell.appendChild(s);
      }
      board.appendChild(cell);
    }
  }
}

function canMove(pi,ti){
  if(gameOver||pi!==current||dice===null)return false;
  const pos=tokens[pi][ti];
  if(pos===53)return false;
  if(pos===0)return dice===6;
  return pos+dice<=53;
}

function drawTokens(){
  document.querySelectorAll(".token").forEach(t=>t.remove());
  players.forEach((p,pi)=>{
    tokens[pi].forEach((pos,ti)=>{
      if(pos<=0||pos>52)return;
      const index=(p.start+pos-1)%52;
      const [r,c]=track[index];
      const token=document.createElement("div");
      token.className=`token ${p.color}`;
      if(canMove(pi,ti))token.classList.add("selectable");
      token.title=`${p.name} token ${ti+1}`;
      token.onclick=()=>moveToken(pi,ti);
      board.children[r*15+c].appendChild(token);
    });
  });
}

function updatePlayer(){
  players.forEach((_,i)=>{
    document.getElementById("player"+i).classList.toggle("active",i===current);
  });
}

function rollDice(){
  if(gameOver||dice!==null)return;
  dice=1+Math.floor(Math.random()*6);
  diceEl.textContent=["","⚀","⚁","⚂","⚃","⚄","⚅"][dice];

  const possible=tokens[current].some((_,i)=>canMove(current,i));
  if(!possible){
    message.textContent=`${players[current].name} rolled ${dice}. No valid move.`;
    setTimeout(nextTurn,800);
  }else{
    message.textContent=`${players[current].name} rolled ${dice}. Select a highlighted token.`;
    drawTokens();
  }
}

function moveToken(pi,ti){
  if(!canMove(pi,ti))return;

  const rolled=dice;
  let pos=tokens[pi][ti];
  pos=pos===0?1:pos+rolled;
  tokens[pi][ti]=pos;

  if(pos<53){
    const landing=(players[pi].start+pos-1)%52;
    if(!safe.includes(landing)){
      players.forEach((p,oi)=>{
        if(oi===pi)return;
        tokens[oi].forEach((other,j)=>{
          if(other>0&&other<53){
            const otherLanding=(p.start+other-1)%52;
            if(otherLanding===landing)tokens[oi][j]=0;
          }
        });
      });
    }
  }

  dice=null;

  if(tokens[pi].every(v=>v===53)){
    gameOver=true;
    rollBtn.disabled=true;
    message.textContent=`🎉 ${players[pi].name} wins the game!`;
  }else if(rolled===6){
    message.textContent=`${players[pi].name} rolled a 6 — roll again!`;
  }else{
    nextTurn();
  }
  drawTokens();
}

function nextTurn(){
  dice=null;
  current=(current+1)%players.length;
  updatePlayer();
  message.textContent=`${players[current].name}'s turn — roll the dice.`;
  drawTokens();
}

function resetGame(){
  tokens.forEach(t=>t.fill(0));
  current=0;
  dice=null;
  gameOver=false;
  rollBtn.disabled=false;
  diceEl.textContent="🎲";
  message.textContent="Red's turn — roll the dice.";
  updatePlayer();
  buildBoard();
  drawTokens();
}

rollBtn.addEventListener("click",rollDice);
newGameBtn.addEventListener("click",resetGame);

buildBoard();
updatePlayer();
drawTokens();
// Current player state & dice value check
function onDiceRoll(diceValue) {
  const currentPlayer = getCurrentPlayer(); // 'blue', 'red', etc.
  
  // Check if player has valid moves
  const movableTokens = getMovableTokens(currentPlayer, diceValue);

  if (movableTokens.length === 0) {
    // Agar koi move possible nahi hai toh turn switch karein
    switchTurn();
    return;
  }

  // Highlightable class add karein taaki user click kar sake
  movableTokens.forEach(token => {
    const tokenElement = document.getElementById(token.id);
    tokenElement.classList.add('highlighted-token');
    
    // Click Event attachment
    tokenElement.onclick = () => moveToken(token, diceValue);
  });
}

function moveToken(token, step) {
  // Clear highlights
  document.querySelectorAll('.highlighted-token').forEach(el => {
    el.classList.remove('highlighted-token');
    el.onclick = null;
  });

  if (token.isAtHome && step === 6) {
    // Home se bahar nikalne ka logic (Starting cell index par bhejna)
    token.isAtHome = false;
    token.position = START_POSITIONS[token.color];
  } else if (!token.isAtHome) {
    // Board par aage badhane ka logic
    token.position += step;
  }

  // UI render update
  updateTokenUI(token);

  // Extra turn on 6, else next turn
  if (step !== 6) {
    switchTurn();
  }
}
