const board=document.getElementById("board"),rollBtn=document.getElementById("roll"),resetBtn=document.getElementById("reset"),dice=document.getElementById("dice"),msg=document.getElementById("msg");
const P=[{n:"Red",c:"red",s:0},{n:"Green",c:"green",s:13},{n:"Yellow",c:"yellow",s:26},{n:"Blue",c:"blue",s:39}],T=P.map(()=>[0,0,0,0]);
let turn=0,die=null,over=false;
const track=[];for(let c=1;c<=13;c++)track.push([6,c]);for(let r=7;r<=13;r++)track.push([r,13]);for(let c=12;c>=1;c--)track.push([13,c]);for(let r=12;r>=7;r--)track.push([r,1]);
const safe=[0,8,13,21,26,34,39,47];
function build(){board.innerHTML="";for(let r=0;r<15;r++)for(let c=0;c<15;c++){let x=document.createElement("div");x.className="cell";if(r<6&&c<6)x.classList.add("redhome");if(r<6&&c>8)x.classList.add("greenhome");if(r>8&&c<6)x.classList.add("yellowhome");if(r>8&&c>8)x.classList.add("bluehome");if(r>=6&&r<=8&&c>=6&&c<=8)x.classList.add("center");let i=track.findIndex(q=>q[0]==r&&q[1]==c);if(i>=0){x.classList.add("track");if(safe.includes(i))x.classList.add("safe")}board.appendChild(x)}} 
function can(pi,ti){if(over||pi!==turn||die===null)return false;let n=T[pi][ti];return n!==53&&(n===0?die===6:n+die<=53)}
function draw(){document.querySelectorAll(".token").forEach(x=>x.remove());P.forEach((p,pi)=>T[pi].forEach((n,ti)=>{if(n<=0||n>52)return;let i=(p.s+n-1)%52,[r,c]=track[i],x=document.createElement("div");x.className="token "+p.c;if(can(pi,ti))x.classList.add("selectable");x.onclick=()=>move(pi,ti);board.children[r*15+c].appendChild(x)}))}
function status(){P.forEach((_,i)=>document.getElementById("p"+i).classList.toggle("active",i===turn))}
function roll(){if(over||die!==null)return;die=1+Math.floor(Math.random()*6);dice.textContent=["","⚀","⚁","⚂","⚃","⚄","⚅"][die];if(!T[turn].some((_,i)=>can(turn,i))){msg.textContent=P[turn].n+" has no valid move.";setTimeout(next,700)}else msg.textContent=P[turn].n+" rolled "+die+". Select a highlighted token.";draw()}
function move(pi,ti){if(!can(pi,ti))return;let n=T[pi][ti];n=n===0?1:n+die;T[pi][ti]=n;let at=(P[pi].s+n-1)%52;if(n<53&&!safe.includes(at))P.forEach((p,oi)=>{if(oi!==pi)T[oi].forEach((v,j)=>{if(v>0&&v<53&&(p.s+v-1)%52===at)T[oi][j]=0})});let six=die===6;die=null;if(T[pi].every(v=>v===53)){over=true;msg.textContent="🎉 "+P[pi].n+" wins!";rollBtn.disabled=true}else if(six)msg.textContent=P[pi].n+" rolled 6 — roll again!";else next();draw()}
function next(){die=null;turn=(turn+1)%4;status();msg.textContent=P[turn].n+"'s turn — roll the dice.";draw()}
function reset(){T.forEach(a=>a.fill(0));turn=0;die=null;over=false;rollBtn.disabled=false;dice.textContent="🎲";msg.textContent="Red's turn — roll the dice.";status();build();draw()}
rollBtn.onclick=roll;resetBtn.onclick=reset;build();status();draw();
