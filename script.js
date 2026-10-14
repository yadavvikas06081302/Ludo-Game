(()=>{'use strict';
const C=['red','green','yellow','blue'], START=[0,13,26,39], SAFE=new Set([0,8,13,21,26,34,39,47]);
const $=id=>document.getElementById(id), board=$('board');
let players=[],turn=0,die=0,rolled=false,legal=[],winner=-1,animating=false;
const path=[];
function buildPath(){
 // 52 distinct outer-ring cells, clockwise, matching a standard 15x15 Ludo cross.
 const p=[];
 for(let c=1;c<=5;c++)p.push([6,c]); // west approach
 p.push([5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8]);
 for(let c=9;c<=14;c++)p.push([6,c]);
 p.push([7,14],[8,14]);
 for(let c=13;c>=9;c--)p.push([8,c]);
 for(let r=9;r<=14;r++)p.push([r,8]);
 p.push([14,7],[14,6]);
 for(let r=13;r>=9;r--)p.push([r,6]);
 for(let c=5;c>=0;c--)p.push([8,c]);
 p.push([7,0]);
 // This route has 52 unique coordinates; use exactly the first lap in order.
 const seen=new Set();p.forEach(x=>{let k=x.join(',');if(!seen.has(k)){seen.add(k);path.push(x)}});
}
function at(r,c){return board.querySelector(`[data-pos="${r},${c}"]`)}
function makeCell(r,c,cls=''){let e=document.createElement('div');e.className='sq '+cls;e.dataset.pos=`${r},${c}`;board.append(e);return e}
function drawBoard(){
 board.innerHTML='';
 for(let r=0;r<15;r++)for(let c=0;c<15;c++)makeCell(r,c);
 const homes=[{r:0,c:0,i:0},{r:0,c:9,i:1},{r:9,c:9,i:2},{r:9,c:0,i:3}];
 homes.forEach(h=>{let e=at(h.r,h.c);e.className=`sq home ${C[h.i]}`;e.style.gridRow=`${h.r+1}/span 6`;e.style.gridColumn=`${h.c+1}/span 6`;let yard=document.createElement('div');yard.className='yard';for(let t=0;t<4;t++){let spot=document.createElement('div');spot.className='yard-spot';spot.dataset.yard=`${h.i}-${t}`;yard.append(spot)}e.append(yard)});
 // Standard 52-step outer path.
 path.forEach((p,i)=>{let e=at(...p);e.className='sq track';e.dataset.track=i});
 const lanes=[
 [[7,1],[7,2],[7,3],[7,4],[7,5]],
 [[1,7],[2,7],[3,7],[4,7],[5,7]],
 [[7,13],[7,12],[7,11],[7,10],[7,9]],
 [[13,7],[12,7],[11,7],[10,7],[9,7]]
 ];
 lanes.forEach((arr,i)=>arr.forEach((p,j)=>{let e=at(...p);e.className=`sq lane ${C[i]}`;e.dataset.lane=`${i}-${j}`}));
 const starts=[[6,1],[1,8],[8,13],[13,6]];
 starts.forEach((p,i)=>{at(...p).classList.add('start',C[i]);at(...p).dataset.start=i});
 let center=at(6,6);center.className='sq center';center.style.gridRow='7/span 3';center.style.gridColumn='7/span 3';center.textContent='★';
}
function init(){
 let n=+$('playerCount').value;
 players=C.map((color,i)=>({color,index:i,name:$('name'+i).value.trim()||color,active:n===4||(n===3&&i!==2)||(n===2&&(i===0||i===2)),t:[-1,-1,-1,-1]})).filter(p=>p.active);
 turn=0;die=0;rolled=false;legal=[];winner=-1;animating=false;
 render();$('status').textContent='Roll a 6 to bring a token out.';
}
function pos(p,prog){return prog<51?(START[p.index]+prog)%52:null}
function can(p,t){let x=p.t[t];return x===-1?die===6:x<56&&x+die<=56}
function hostFor(p,t,x){
 if(x===-1)return board.querySelector(`[data-yard="${p.index}-${t}"]`);
 if(x>=56)return at(7,7);
 if(x>=51){let lane=[[[7,1],[7,2],[7,3],[7,4],[7,5]],[[1,7],[2,7],[3,7],[4,7],[5,7]],[[7,13],[7,12],[7,11],[7,10],[7,9]],[[13,7],[12,7],[11,7],[10,7],[9,7]]][p.index];return at(...lane[Math.min(4,x-51)])}
 const q=pos(p,x);return path[q]?at(...path[q]):null;
}
function render(){
 drawBoard();
 players.forEach((p,pi)=>p.t.forEach((x,ti)=>{let h=hostFor(p,ti,x);if(!h)return;let b=document.createElement('button');b.className=`token ${p.color}`;b.textContent=ti+1;b.setAttribute('aria-label',`${p.name} token ${ti+1}`);b.title=`${p.name} token ${ti+1}`;
 if(rolled&&pi===turn&&legal.includes(ti)&&winner<0&&!animating){b.classList.add('movable');b.addEventListener('click',()=>move(ti))}else b.disabled=true;h.append(b)}));
 const p=players[turn];$('turnName').textContent=winner>=0?`${players[winner].name} wins!`:p.name;$('turnName').style.color=winner>=0?'#facc15':`var(--${p.color})`;
 $('dice').textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][Math.max(0,die-1)];$('dice').disabled=rolled||winner>=0||animating;
 $('scores').innerHTML=players.map(p=>`<div class="score"><strong style="color:var(--${p.color})">${esc(p.name)}</strong>${p.t.filter(x=>x===56).length}/4 tokens home</div>`).join('');
}
function esc(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function roll(){if(rolled||winner>=0||animating)return;die=1+Math.floor(Math.random()*6);rolled=true;let p=players[turn];legal=p.t.map((_,i)=>i).filter(i=>can(p,i));$('status').textContent=`${p.name} rolled ${die}. `+(legal.length?'Tap a glowing token.':'No legal move; turn passes.');if(!legal.length){render();setTimeout(()=>endTurn(false),650)}else render()}
function move(t){
 if(!rolled||!legal.includes(t)||animating)return;animating=true;render();
 const p=players[turn],old=p.t[t],steps=old===-1?0:die;
 // Animate step-by-step, including leaving home.
 const target=old===-1?0:old+die;let current=old;
 const advance=()=>{
  if(current<target){current=current===-1?0:current+1;p.t[t]=current;render();setTimeout(advance,110);return}
  finishMove(p,t,target);
 };
 advance();
}
function finishMove(p,t,target){
 let captured=false;
 if(target<51){let q=pos(p,target);if(!SAFE.has(q))players.forEach(other=>{if(other===p)return;other.t=other.t.map(x=>{if(x>=0&&x<51&&pos(other,x)===q){captured=true;return -1}return x})})}
 if(p.t.every(x=>x===56)){winner=turn;$('status').textContent=`🏆 ${p.name} wins! All four tokens reached home.`;rolled=false;legal=[];animating=false;render();return}
 let extra=die===6||captured||target===56;$('status').textContent=captured?'Capture! Opponent token sent home.':target===56?'Token reached home!':extra?'Bonus turn! Roll again.':'Move complete.';
 animating=false;endTurn(extra);
}
function endTurn(extra){rolled=false;legal=[];die=0;if(!extra&&winner<0)turn=(turn+1)%players.length;render()}
$('dice').addEventListener('click',roll);$('apply').addEventListener('click',init);$('newGame').addEventListener('click',init);
$('playerCount').addEventListener('change',()=>{let n=+$('playerCount').value;document.querySelectorAll('.names label').forEach((el,i)=>el.style.display=(n===4||(n===3&&i!==2)||(n===2&&(i===0||i===2)))?'grid':'none')});
buildPath();init();
})();