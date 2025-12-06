// GAME JS
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

let W = canvas.width, H = canvas.height;
let keys = {};
let lastTime = 0;
let running = false, paused = false;
let player, bullets, enemies, stars, score, lives, spawnTimer;

function reset(){
  player = {x:100,y:H/2,w:46,h:30,spd:260,cooldown:0};
  bullets = [];
  enemies = [];
  stars = createStars(80);
  score = 0;
  lives = 3;
  spawnTimer = 0;
  updateHUD();
}

function createStars(n){
  const arr=[];
  for(let i=0;i<n;i++) arr.push({x:Math.random()*W,y:Math.random()*H,r:1,spd:50+Math.random()*100});
  return arr;
}

window.addEventListener('keydown', e=>{ keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()] = false; });

function spawnEnemy(){
  const size = 30 + Math.random()*30;
  enemies.push({x:W+size,y:Math.random()*(H-size),w:size,h:size,spd:80+Math.random()*150,health:2});
}

function shoot(){
  if(player.cooldown>0) return;
  bullets.push({x:player.x+player.w,y:player.y+player.h/2-3,w:12,h:6,spd:520});
  player.cooldown=0.2;
}

function update(dt){
  // stars
  stars.forEach(s=>{s.x-=s.spd*dt; if(s.x<0)s.x=W});

  // move
  let dx=0,dy=0;
  if(keys['arrowleft']||keys['a']) dx=-1;
  if(keys['arrowright']||keys['d']) dx=1;
  if(keys['arrowup']||keys['w']) dy=-1;
  if(keys['arrowdown']||keys['s']) dy=1;
  const len=Math.hypot(dx,dy)||1;
  player.x+=dx/len*player.spd*dt;
  player.y+=dy/len*player.spd*dt;

  player.x=Math.max(0,Math.min(W-player.w,player.x));
  player.y=Math.max(0,Math.min(H-player.h,player.y));

  // shoot
  if(keys[' ']) shoot();
  if(player.cooldown>0) player.cooldown-=dt;

  bullets=because(bullets,b=>{
    b.x+=b.spd*dt;
    return b.x<W;
  });

  spawnTimer+=dt;
  if(spawnTimer>1){spawnTimer=0; spawnEnemy();}

  enemies=because(enemies,e=>{
    e.x-=e.spd*dt;
    if(e.x+e.w<0) return false;
    if(hit(player,e)){
      lives--;
      updateHUD();
      return false;
    }
    bullets.forEach((b,i)=>{
      if(hit(b,e)){
        e.health--;
        bullets.splice(i,1);
      }
    });
    if(e.health<=0){ score+=10; updateHUD(); return false; }
    return true;
  });
}

function because(arr,fn){ return arr.filter(fn); }

function hit(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

function updateHUD(){ scoreEl.textContent=score; livesEl.textContent=lives; }

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fff';
  stars.forEach(s=>ctx.fillRect(s.x,s.y,s.r,s.r));

  ctx.fillStyle='#57c7ff'; ctx.fillRect(player.x,player.y,player.w,player.h);

  ctx.fillStyle='#fff7'; bullets.forEach(b=>ctx.fillRect(b.x,b.y,b.w,b.h));

  ctx.fillStyle='#ff6b6b'; enemies.forEach(e=>ctx.fillRect(e.x,e.y,e.w,e.h));
}

function loop(ts){
  if(!running) return;
  if(paused) return requestAnimationFrame(loop);
  const dt=Math.min(0.05,(ts-lastTime)/1000);
  lastTime=ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

startBtn.onclick=()=>{ if(!running){ reset(); running=true; requestAnimationFrame(loop);} };
pauseBtn.onclick=()=>{ paused=!paused; };
restartBtn.onclick=()=>{ reset(); running=true; paused=false; lastTime=0; requestAnimationFrame(loop); };
reset();
