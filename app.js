const intro=document.getElementById('intro'),site=document.getElementById('site'),start=document.getElementById('start'),sound=document.getElementById('sound');let audioOn=true,ctx;function tone(freq=440,duration=.12,type='square',volume=.035){if(!audioOn)return;try{ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+duration)}catch(e){}}start.addEventListener('click',()=>{audioOn=sound.checked;if(audioOn){tone(523,.12);setTimeout(()=>tone(659,.12),110);setTimeout(()=>tone(784,.2),220)}intro.classList.add('hide');site.classList.add('ready')});document.getElementById('soundToggle').addEventListener('click',e=>{audioOn=!audioOn;e.currentTarget.textContent=audioOn?'♫':'♪';if(audioOn)tone(660)});document.getElementById('theme').addEventListener('click',e=>{document.body.classList.toggle('night');e.currentTarget.textContent=document.body.classList.contains('night')?'☀':'☾';tone(520,.08)});document.getElementById('hamb').addEventListener('click',()=>{const nav=document.querySelector('header nav');nav.classList.toggle('mobile-open')});document.querySelectorAll('header nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('header nav').classList.remove('mobile-open')));const navStyle=document.createElement('style');navStyle.textContent='@media(max-width:680px){header nav.mobile-open{display:flex;position:absolute;top:62px;left:0;right:0;background:#fffdf4;border-bottom:3px solid #1d2b4f;padding:18px;flex-direction:column;gap:16px}}';document.head.append(navStyle);const fill=document.getElementById('xpfill'),pct=document.getElementById('pct'),complete=document.getElementById('complete');let completed=false;function updateXP(){const max=document.documentElement.scrollHeight-innerHeight;const n=max>0?Math.round(scrollY/max*100):0;fill.style.width=n+'%';pct.textContent=String(n).padStart(2,'0')+'%';if(n>=99&&!completed){completed=true;complete.classList.add('show');tone(784,.2);setTimeout(()=>complete.classList.remove('show'),3500)}}addEventListener('scroll',updateXP,{passive:true});updateXP();


/* PIXEL ADVENTURE — controls for keyboard and touch */
(()=> {
  const world=document.getElementById('game-world');
  if(!world) return;
  const player=document.getElementById('game-player');
  const overlay=document.getElementById('game-overlay');
  const startBtn=document.getElementById('game-start');
  const resetBtn=document.getElementById('game-reset');
  const scoreEl=document.getElementById('game-score');
  const bestEl=document.getElementById('game-best');
  const statusEl=document.getElementById('game-status');
  const obstacles=[...world.querySelectorAll('.game-obstacle')];
  const stars=[...world.querySelectorAll('.game-star')];
  const sprites={idle:'diam.gif',run:'berjalan.gif',jump:'lompat.gif'};
  let running=false, x=55, y=0, vy=0, score=0, best=0, last=0, frame=0;
  const held={left:false,right:false};
  let jumpQueued=false, sprite='idle', raf=0;
  const ground=38;
  function setSprite(next){
    if(sprite===next) return;
    sprite=next;
    player.src=sprites[next];
  }
  function dimensions(){return {w:world.clientWidth,h:world.clientHeight,pw:player.offsetWidth,ph:player.offsetHeight};}
  function paint(){
    player.style.left=x+'px';
    player.style.bottom=(ground+y)+'px';
    setSprite(y>0?'jump':(held.left||held.right?'run':'idle'));
    scoreEl.textContent=String(score).padStart(3,'0');
    bestEl.textContent=String(best).padStart(3,'0');
  }
  function reset(){
    cancelAnimationFrame(raf);running=false;x=55;y=0;vy=0;score=0;last=0;
    obstacles.forEach((o,i)=>{o.style.display='block';o.style.left=[38,64,88][i]+'%';});
    stars.forEach((s,i)=>{s.style.display='block';s.style.left=[51,77][i]+'%';});
    held.left=false;held.right=false;jumpQueued=false;
    setSprite('idle');paint();
    statusEl.textContent='SIAP DIMAINKAN';
    overlay.classList.remove('hidden');
    overlay.querySelector('b').textContent='SIAP, PLAYER?';
    overlay.querySelector('span').textContent='Hindari balok dan kumpulkan bintang!';
    startBtn.textContent='▶ MULAI GAME';
  }
  function start(){
    if(running)return;
    running=true;overlay.classList.add('hidden');statusEl.textContent='GAME BERJALAN';last=performance.now();
    raf=requestAnimationFrame(loop);
  }
  function end(){
    running=false;cancelAnimationFrame(raf);best=Math.max(best,score);
    statusEl.textContent='GAME SELESAI';
    overlay.classList.remove('hidden');
    overlay.querySelector('b').textContent='GAME OVER!';
    overlay.querySelector('span').textContent='Skor kamu: '+score+'. Coba lagi!';
    startBtn.textContent='↻ MAIN LAGI';
    setSprite('idle');
  }
  function loop(now){
    if(!running)return;
    const dt=Math.min((now-last)/1000,.035);last=now;
    const d=dimensions();
    if(held.left)x-=230*dt;
    if(held.right)x+=230*dt;
    x=Math.max(0,Math.min(d.w-d.pw,x));
    if(jumpQueued&&y===0){vy=470;jumpQueued=false;}
    y+=vy*dt;vy-=1250*dt;
    if(y<0){y=0;vy=0;}
    const playerRect={left:x+12,right:x+d.pw-12,bottom:ground+y+8,top:ground+y+d.ph-12};
    obstacles.forEach(o=>{
      if(o.style.display==='none')return;
      const left=o.offsetLeft,right=left+o.offsetWidth,bottom=ground+o.offsetHeight,top=ground+o.offsetHeight;
      if(playerRect.right>left+3&&playerRect.left<right-3&&playerRect.bottom<top+ground&&playerRect.top>ground+2&&y<o.offsetHeight-5){end();}
    });
    if(!running)return;
    stars.forEach(s=>{
      if(s.style.display==='none')return;
      const sx=s.offsetLeft,sy=s.offsetTop;
      if(x+d.pw>sx&&x<sx+s.offsetWidth&&d.h-(ground+y)<sy+30&&d.h-(ground+y+d.ph)<sy+30){
        s.style.display='none';score+=10;
      }
    });
    if(now%800<40){score+=1;}
    paint();
    raf=requestAnimationFrame(loop);
  }
  function press(dir,on){if(dir==='jump'){if(on)jumpQueued=true;return;}held[dir]=on;if(on&&running)setSprite('run');}
  startBtn.addEventListener('click',()=>{if(!running){if(statusEl.textContent==='GAME SELESAI')reset();start();}});
  resetBtn.addEventListener('click',reset);
  document.addEventListener('keydown',e=>{
    if(['ArrowLeft','ArrowRight',' ','a','A','d','D'].includes(e.key))e.preventDefault();
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')press('left',true);
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')press('right',true);
    if(e.key===' '||e.key==='ArrowUp'||e.key==='w'||e.key==='W')press('jump',true);
    if(e.key==='Enter'&&!running&&overlay)start();
  });
  document.addEventListener('keyup',e=>{
    if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')press('left',false);
    if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')press('right',false);
  });
  document.querySelectorAll('.game-control').forEach(btn=>{
    const dir=btn.dataset.control;
    btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);press(dir,true);});
    ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>btn.addEventListener(ev,e=>{e.preventDefault();press(dir,false);}));
  });
  window.addEventListener('blur',()=>{held.left=false;held.right=false;});
// PLAYER ADVENTURE GAME
(() => {
  const player = document.getElementById("gamePlayer");
  const world = document.getElementById("gameWorld");
  const status = document.getElementById("gameStatus");

  if (!player || !world) return;

  let position = 20;
  let moving = false;
  let jumping = false;

  function move(direction) {
    const max = world.clientWidth - player.offsetWidth;

    position += direction * 12;
    position = Math.max(0, Math.min(position, max));

    player.style.left = position + "px";
    player.src = "berjalan.gif";
    status.textContent = "SEDANG BERJALAN";

    moving = true;
  }

  function stop() {
    if (jumping) return;

    player.src = "diam.gif";
    status.textContent = "SIAP BERMAIN";
    moving = false;
  }

  function jump() {
    if (jumping) return;

    jumping = true;
    player.src = "lompat.gif";
    player.classList.add("jumping");
    status.textContent = "MELONCAT!";

    setTimeout(() => {
      player.classList.remove("jumping");
      jumping = false;

      if (!moving) {
        player.src = "diam.gif";
        status.textContent = "SIAP BERMAIN";
      }
    }, 550);
  }

  document.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === "ArrowRight") move(1);
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === " ") jump();
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      stop();
    }
  });

  document.getElementById("gameLeft").addEventListener("click", () => {
    move(-1);
    setTimeout(stop, 150);
  });

  document.getElementById("gameRight").addEventListener("click", () => {
    move(1);
    setTimeout(stop, 150);
  });

  document.getElementById("gameJump").addEventListener("click", jump);
})();
})();
