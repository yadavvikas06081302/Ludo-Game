const board=document.getElementById("board");
const rollBtn=document.getElementById("rollBtn");
const resetBtn=document.getElementById("resetBtn");
const diceEl=document.getElementById("dice");
const message=document.getElementById("message");

const players=[
 {id:"red",name:"Red",color:"red",start:0},
 {id:"green",name:"Green",color:"green",start:13},
 {id:"yellow",name:"Yellow",color:"yellow",start:26},
 {id:"blue",name:"Blue",color:"blue",start:39}
];
const path=[];
const pathCoords=[];
const pathSet=new Set();
let current=0,lastRoll=null,gameOver=false;

function addPath(r,c){pathCoords.push([r,c]);pathSet.add(r+","+c)}
// A 52-cell perimeter path around a 15x15 Ludo board.
for(let c=1;c<=13;c++) addPath(6,c);
for(let r=7;r<=13;r++) addPath(r,13);
for(let c=12;c>=1;c--) addPath(13,c);
for(let r=12;r>=7;r--) addPath(r,1);
for(let c=2;c<=5;c++) addPath(6,c);
for(let r=5;r>=1;r--) addPath(r,6);
for(let c=7;c<=13;c++) addPath(1,c);
for(let r=2;r<=5;r++) addPath(r,13);
for(let c=12;c>=7;c--) addPath(6,c);
// normalize to 52 unique cells by taking perimeter-like route
const unique=[];
const seen=new Set();
for(const p of pathCoords){const k=p.join(",");if(!seen.has(k)){seen.add(k);unique.push(p)}}
path.push(...unique.slice(0,52));

const tokens=players.map(p=>[0,0,0,0]); // 0 home, 1..52 track, 53 finished

function buildBoard(){
 board.innerHTML="";
 for(let r=0;r<15;r++)for(let c=0;c<15;c++){
   const cell=document.createElement("div");cell.className="cell";
   if(r<6&&c<6)cell.classList.add("home-red");
   if(r<6&&c>8)cell.classList.add("home-green");
   if(r>8&&c<6)cell.classList.add("home-yellow");
   if(r>8&&c>8)cell.classList.add("home-blue");
   if(r===6&&c===6||r===6&&c===7||r===7&&c===6||r===7&&c===7||r===7&&c===8||r===8&&c===7)cell.classList.add("center");
   const idx=path.findIndex(x=>x[0]===r&&x[1]===c);
   if(idx>=0){cell.classList.add("path");cell.dataset.index=idx}
   board.appendChild(cell);
 }
 renderTokens();
}
function cellForTrack(pos){let idx=pos%52;return path[idx]}
function renderTokens(){
 document.querySelectorAll(".token").forEach(x=>x.remove());
 players.forEach((p,pi)=>{
   tokens[pi].forEach((pos,ti)=>{
     if(pos<=0||pos>52)return;
     const [r,c]=cellForTrack((p.start+pos-1)%52);
     const cell=[...board.children][r*15+c];
     const t=document.createElement("div");t.className=`token ${p.color}`;
     t.title=`${p.name} token ${ti+1}`;
     if(canMove(pi,ti))t.classList.add("selectable");
     t.onclick=()=>moveToken(pi,ti);
     cell.appendChild(t);
   });
 });
}
function canMove(pi,ti){
 if(gameOver||pi!==current||lastRoll===null)return false;
 const pos=tokens[pi][ti];
 if(pos===53)return false;
 if(pos===0)return lastRoll===6;
 return pos+lastRoll<=53;
}
function roll(){
 if(gameOver||lastRoll!==null)return;
 lastRoll=Math.floor(Math.random()*6)+1;
 diceEl.textContent=["","⚀","⚁","⚂","⚃","⚄","⚅"][lastRoll];
 const movable=tokens[current].some((_,i)=>canMove(current,i));
 if(!movable){
   message.textContent=`${players[current].name} rolled ${lastRoll}. No move available.`;
   setTimeout(nextTurn,900);
 }else{
   message.textContent=`${players[current].name} rolled ${lastRoll}. Select a highlighted token.`;
   renderTokens();
 }
}
function moveToken(pi,ti){
 if(!canMove(pi,ti))return;
 const roll=lastRoll;
 let pos=tokens[pi][ti];
 if(pos===0)pos=1;else pos+=roll;
 tokens[pi][ti]=pos;
 lastRoll=null;
 capture(pi,ti);
 if(tokens[pi].every(x=>x===53)){
   gameOver=true;message.textContent=`🎉 ${players[pi].name} wins the game!`;
   rollBtn.disabled=true;renderTokens();return;
 }
 if(roll===6){
   message.textContent=`${players[pi].name} rolled a 6 — roll again!`;
 }else nextTurn();
 renderTokens();
}
function capture(pi,ti){
 const pos=tokens[pi][ti]; if(pos===53)return;
 const abs=(players[pi].start+pos-1)%52;
 const safe=[0,8,13,21,26,34,39,47];
 if(safe.includes(abs))return;
 players.forEach((p,oi)=>{
   if(oi===pi)return;
   tokens[oi].forEach((op,oj)=>{
     if(op>0&&op<53&&(p.start+op-1)%52===abs)tokens[oi][oj]=0;
   });
 });
}
function nextTurn(){
 lastRoll=null;
 current=(current+1)%players.length;
 updatePlayers();
 message.textContent=`${players[current].name}'s turn — roll the dice.`;
 renderTokens();
}
function updatePlayers(){
 players.forEach((p,i)=>document.getElementById("player-"+p.id).classList.toggle("active",i===current));
}
function reset(){
 tokens.forEach(a=>a.fill(0));current=0;lastRoll=null;gameOver=false;rollBtn.disabled=false;
 diceEl.textContent="🎲";message.textContent="Red's turn — roll the dice.";updatePlayers();buildBoard();
}
rollBtn.onclick=roll;resetBtn.onclick=reset;buildBoard();updatePlayers();
