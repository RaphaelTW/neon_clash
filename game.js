(() => {
"use strict";

const TAU = Math.PI * 2;
const WORLD_W = 1600, WORLD_H = 900, FLOOR_Y = 720;

const $ = (id) => document.getElementById(id);
const canvas = $("game-canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true;

const DOM = {
  select: $("select-screen"), fight: $("fight-screen"), intro: $("intro-overlay"),
  roster: $("roster"), p1Preview: $("preview-p1"), p2Preview: $("preview-p2"),
  p1Name:$("p1-name"),p1Title:$("p1-title"),p1Bio:$("p1-bio"),p1Stats:$("p1-stats"),p1Special:$("p1-special-name"),
  p2Name:$("p2-name"),p2Title:$("p2-title"),p2Bio:$("p2-bio"),p2Stats:$("p2-stats"),p2Special:$("p2-special-name"),
  p2Slot:$("p2-slot-label"),difficultyWrap:$("difficulty-wrap"),
  hudP1:$("hud-p1-name"),hudP2:$("hud-p2-name"),p1Health:$("p1-health"),p2Health:$("p2-health"),
  p1HealthText:$("p1-health-text"),p2HealthText:$("p2-health-text"),
  p1Mana:$("p1-mana"),p2Mana:$("p2-mana"),p1Stamina:$("p1-stamina"),p2Stamina:$("p2-stamina"),
  p1Super:$("p1-super"),p2Super:$("p2-super"),p1Wins:$("p1-wins"),p2Wins:$("p2-wins"),
  timer:$("timer"),roundLabel:$("round-label"),arenaLabel:$("arena-label"),
  announcement:$("announcement"),commandToast:$("command-toast"),
  comboP1:$("combo-p1"),comboP2:$("combo-p2"),
  pauseOverlay:$("pause-overlay"),resultOverlay:$("result-overlay"),
  winnerText:$("winner-text"),winnerDetail:$("winner-detail"),
  padP1:$("pad-p1"),padP2:$("pad-p2"),soundBtn:$("sound-btn"),debugBtn:$("debug-btn")
};

const fighterDefs = [
  {
    id:"kael", name:"KAEL IGNIS", title:"O Punho Solar", style:"brawler",
    primary:"#ff6339", secondary:"#ffd35a", accent:"#ff7a39",
    stats:{power:9,speed:7,defense:6,energy:7},
    special:"SUPERNOVA", finisher:"SOL ABSOLUTO",
    command:"ONDA SOLAR", bio:"Lutador de pressão. Punhos incendiários e explosões de curto alcance."
  },
  {
    id:"nyx", name:"NYX VESPER", title:"A Lâmina do Vazio", style:"assassin",
    primary:"#7850ff", secondary:"#ff55ea", accent:"#bb62ff",
    stats:{power:7,speed:10,defense:5,energy:8},
    special:"ECLIPSE", finisher:"ZERO LUNAR",
    command:"CORTE FANTASMA", bio:"Assassina veloz. Teleportes curtos, lâminas de energia e alto potencial de combo."
  },
  {
    id:"bront", name:"BRONT TITAN", title:"O Colosso de Ferro", style:"tank",
    primary:"#7f92a1", secondary:"#55ddff", accent:"#8be9ff",
    stats:{power:10,speed:4,defense:10,energy:5},
    special:"TREMOR ÔMEGA", finisher:"NÚCLEO DE TITÃ",
    command:"ONDA SÍSMICA", bio:"Gigante blindado. Lento, brutal e capaz de quebrar a guarda com facilidade."
  },
  {
    id:"aiko", name:"AIKO RAIJIN", title:"A Dançarina da Tempestade", style:"caster",
    primary:"#36d9ff", secondary:"#f8ef74", accent:"#56e8ff",
    stats:{power:6,speed:9,defense:6,energy:10},
    special:"TEMPESTADE RAIJIN", finisher:"DEUSA DO TROVÃO",
    command:"ARCO ELÉTRICO", bio:"Especialista em distância. Controla raios, espaço e regeneração de mana."
  },
  {
    id:"volt", name:"VOLT REX", title:"O Predador Cinético", style:"rush",
    primary:"#8dff58", secondary:"#28f0a7", accent:"#72ff71",
    stats:{power:8,speed:8,defense:7,energy:6},
    special:"OVERDRIVE", finisher:"VELOCIDADE TERMINAL",
    command:"RUPTURA CINÉTICA", bio:"Rushdown agressivo. Dashes longos e golpes que atravessam rapidamente a arena."
  },
  {
    id:"morvane", name:"MORVANE", title:"O Arauto Carmesim", style:"drain",
    primary:"#f1375c", secondary:"#ff8ca0", accent:"#ff345d",
    stats:{power:9,speed:6,defense:7,energy:9},
    special:"PACTO DE SANGUE", finisher:"TRONO CARMESIM",
    command:"ORBE HEMÁTICO", bio:"Feiticeiro de médio alcance. Rouba vida e cresce quando o combate se prolonga."
  }
];

const animFrames = {idle:4,walk:6,jump:3,fall:3,punch:4,kick:5,hurt:3,ko:5,special:6,finisher:7};
const animFPS = {idle:5,walk:10,jump:7,fall:7,punch:15,kick:13,hurt:10,ko:8,special:12,finisher:12};
const images = {};

const arenas = {
  neon:{name:"DISTRITO NEON"},
  temple:{name:"TEMPLO LUNAR"},
  forge:{name:"FORJA VULCÂNICA"}
};

const state = {
  screen:"select", mode:"cpu", pick:"p1", p1Index:0, p2Index:1, arena:"neon",
  difficulty:"normal", winsNeeded:2, p1Wins:0, p2Wins:0, round:1,
  timer:99, timerAcc:0, running:false, paused:false, roundLock:true, roundEnding:false,
  projectiles:[],particles:[],afterImages:[],shake:0,flash:0,
  finisherWindow:null, finisherUsed:false, lastTime:0, aiClock:0, previewTime:0,
  sound:true, cinematic:0, hitStop:0, debugHitboxes:false, cameraZoom:1
};

let P1=null,P2=null;
const keys={};
const inputBuffers={1:[],2:[]};
const gamepadPrev={};

class SynthAudio {
  constructor(){this.ctx=null}
  ensure(){
    if(!state.sound)return;
    if(!this.ctx) this.ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(this.ctx.state==="suspended") this.ctx.resume();
  }
  tone(freq=220,dur=.08,type="square",gain=.045,slide=0){
    if(!state.sound)return;
    this.ensure(); if(!this.ctx)return;
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,this.ctx.currentTime);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),this.ctx.currentTime+dur);
    g.gain.setValueAtTime(gain,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+dur);
    o.connect(g);g.connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+dur);
  }
  hit(power=1){this.tone(105+power*9,.055,"square",.035+power*.004,-50)}
  whoosh(){this.tone(330,.12,"sawtooth",.025,180)}
  select(){this.tone(440,.045,"sine",.035,120)}
  power(){this.tone(180,.18,"sawtooth",.04,480)}
  super(){this.tone(90,.45,"sawtooth",.065,780)}
  ko(){this.tone(120,.42,"square",.055,-75)}
}
const audio=new SynthAudio();

function loadAssets(){
  const jobs=[];
  fighterDefs.forEach(f=>{
    images[f.id]={};
    Object.keys(animFrames).forEach(anim=>{
      const img=new Image();
      img.src=`./assets/fighters/${f.id}/${anim}.png`;
      images[f.id][anim]=img;
      jobs.push(new Promise(resolve=>{img.onload=resolve;img.onerror=resolve;}));
    });
  });
  return Promise.all(jobs);
}

function statHTML(def){
  const labels={power:"PODER",speed:"VELOC.",defense:"DEFESA",energy:"ENERGIA"};
  return Object.keys(labels).map(k=>`
    <div class="stat"><span>${labels[k]}</span><div class="stat-track"><div class="stat-fill" style="width:${def.stats[k]*10}%"></div></div><b>${def.stats[k]}</b></div>
  `).join("");
}

function drawSprite(c,def,anim,frame,x,y,flip=false,scale=1,alpha=1){
  const img=images[def.id]?.[anim];
  if(!img || !img.complete || !img.naturalWidth)return;
  const fw=240,fh=300,fr=Math.min(animFrames[anim]-1,Math.max(0,frame));
  c.save();c.globalAlpha=alpha;c.translate(x,y);if(flip)c.scale(-1,1);
  c.drawImage(img,fr*fw,0,fw,fh,-fw*.5*scale,-fh*scale,fw*scale,fh*scale);
  c.restore();
}

function renderPreview(cv,def,flip,t){
  const c=cv.getContext("2d"),w=cv.width,h=cv.height;
  c.clearRect(0,0,w,h);
  const grad=c.createRadialGradient(w*.5,h*.4,10,w*.5,h*.48,w*.53);
  grad.addColorStop(0,def.primary+"33");grad.addColorStop(1,"rgba(0,0,0,0)");
  c.fillStyle=grad;c.fillRect(0,0,w,h);
  c.strokeStyle=def.secondary+"22";c.lineWidth=2;
  c.beginPath();c.arc(w*.5,h*.52,145+Math.sin(t*.002)*6,0,TAU);c.stroke();
  const fr=Math.floor(t/180)%4;
  drawSprite(c,def,"idle",fr,w*.5,h*.9,flip,1.58,1);
}

function buildRoster(){
  DOM.roster.innerHTML="";
  fighterDefs.forEach((f,i)=>{
    const b=document.createElement("button");b.className="roster-card";b.dataset.index=i;
    const cv=document.createElement("canvas");cv.width=190;cv.height=150;
    const sp=document.createElement("span");sp.textContent=f.name;
    b.append(cv,sp);
    b.addEventListener("click",()=>{
      audio.select();
      if(state.pick==="p1"){state.p1Index=i;state.pick="p2"} else {state.p2Index=i;state.pick="p1"}
      updateSelectUI();
    });
    DOM.roster.appendChild(b);
  });
}

function updateRosterThumbs(t){
  [...DOM.roster.children].forEach((b,i)=>{
    const cv=b.querySelector("canvas"),c=cv.getContext("2d");
    c.clearRect(0,0,cv.width,cv.height);
    const f=fighterDefs[i];
    const g=c.createLinearGradient(0,0,0,cv.height);g.addColorStop(0,f.primary+"28");g.addColorStop(1,"#070811");
    c.fillStyle=g;c.fillRect(0,0,cv.width,cv.height);
    drawSprite(c,f,"idle",Math.floor(t/230+i)%4,cv.width/2,cv.height+16,false,.68,1);
  });
}

function updateSelectUI(){
  const a=fighterDefs[state.p1Index],b=fighterDefs[state.p2Index];
  DOM.p1Name.textContent=a.name;DOM.p1Title.textContent=a.title;DOM.p1Bio.textContent=a.bio;DOM.p1Stats.innerHTML=statHTML(a);DOM.p1Special.textContent=a.special;
  DOM.p2Name.textContent=b.name;DOM.p2Title.textContent=b.title;DOM.p2Bio.textContent=b.bio;DOM.p2Stats.innerHTML=statHTML(b);DOM.p2Special.textContent=b.special;
  [...DOM.roster.children].forEach((el,i)=>{
    el.classList.toggle("p1-picked",i===state.p1Index);
    el.classList.toggle("p2-picked",i===state.p2Index);
  });
}

function switchScreen(name){
  state.screen=name;
  DOM.select.classList.toggle("active",name==="select");
  DOM.fight.classList.toggle("active",name==="fight");
}

function announce(text,finisher=false){
  DOM.announcement.textContent=text;
  DOM.announcement.classList.toggle("finisher",!!finisher);
  DOM.announcement.classList.remove("show");
  void DOM.announcement.offsetWidth;
  DOM.announcement.classList.add("show");
}
let toastTimer=null;
function toast(text){
  DOM.commandToast.textContent=text;DOM.commandToast.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>DOM.commandToast.classList.remove("show"),1100);
}

function burst(x,y,color,count=14,power=1){
  for(let i=0;i<count;i++){
    const a=Math.random()*TAU,sp=(1+Math.random()*6)*power;
    state.particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:280+Math.random()*520,size:2+Math.random()*7,color});
  }
}
function ring(x,y,color,r=20){
  state.particles.push({x,y,vx:0,vy:0,life:280,size:r,color,ring:true});
}

function shadowImage(f){
  state.afterImages.push({def:f.def,anim:f.anim,frame:f.frame,x:f.x,y:f.y,flip:f.facing<0,life:180});
}


function rectsOverlap(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function styleBodyWidth(style){
  return {tank:92,brawler:72,assassin:62,caster:66,rush:68,drain:72}[style]||70;
}
function hitSpark(x,y,color,blocked=false){
  burst(x,y,blocked?"#dce7ff":color,blocked?12:24,blocked?.8:1.7);
  ring(x,y,blocked?"#91cfff":"#ffffff",blocked?14:22);
  if(!blocked){
    for(let i=0;i<5;i++){
      state.particles.push({x,y,vx:(Math.random()-.5)*11,vy:(Math.random()-.5)*6,life:180+Math.random()*130,size:1.5+Math.random()*3,color:"#ffffff"});
    }
  }
}
function resolvePushBoxes(a,b){
  if(!a||!b||a.dead||b.dead)return;
  const A=a.getPushBox(),B=b.getPushBox();
  if(!rectsOverlap(A,B))return;
  const overlap=Math.min(A.x+A.w-B.x,B.x+B.w-A.x);
  if(overlap<=0)return;
  const push=overlap/2+.2;
  if(a.x<b.x){a.x-=push;b.x+=push}else{a.x+=push;b.x-=push}
  a.x=clamp(a.x,70,WORLD_W-70);b.x=clamp(b.x,70,WORLD_W-70);
}

class Fighter {
  constructor(def,side){
    this.def=def;this.side=side;
    this.reset();
  }
  reset(){
    this.x=this.side===1?420:1180;this.y=FLOOR_Y;
    this.vx=0;this.vy=0;this.facing=this.side===1?1:-1;this.grounded=true;
    this.health=100;this.mana=100;this.stamina=100;this.super=0;
    this.stun=0;this.invuln=0;this.blocking=false;this.dead=false;this.fatal=false;
    this.attack=null;this.cool={power:0,command:0,super:0,dash:0};
    this.combo=0;this.comboTime=0;
    this.anim="idle";this.frame=0;this.animTime=0;this.animLocked=false;
  }
  setAnim(name,force=false){
    if(!force && this.animLocked)return;
    if(this.anim!==name){this.anim=name;this.frame=0;this.animTime=0}
  }
  canAct(){return !this.dead&&!this.fatal&&this.stun<=0&&!this.attack&&!this.animLocked}
  getHurtBox(){
    const w=styleBodyWidth(this.def.style);
    const airLift=this.grounded?0:10;
    return {x:this.x-w/2,y:this.y-205-airLift,w,h:188};
  }
  getPushBox(){
    const w=styleBodyWidth(this.def.style)*.78;
    return {x:this.x-w/2,y:this.y-160,w,h:158};
  }
  getAttackBox(){
    if(!this.attack||this.attack.noMelee||this.attack.activeStart==null)return null;
    const elapsed=this.attack.duration-this.attack.time;
    if(elapsed<this.attack.activeStart||elapsed>this.attack.activeEnd)return null;
    const hb=this.attack.hitbox||{offsetX:42,offsetY:-165,w:120,h:92};
    const x=this.facing>0?this.x+hb.offsetX:this.x-hb.offsetX-hb.w;
    return {x,y:this.y+hb.offsetY,w:hb.w,h:hb.h};
  }
  move(dir){
    if(!this.canAct()||this.blocking)return;
    this.vx=dir*(4.7+this.def.stats.speed*.36);
    if(this.grounded)this.setAnim("walk");
  }
  jump(){
    if(!this.canAct()||!this.grounded||this.stamina<10)return;
    this.stamina-=10;this.vy=-15.3;this.grounded=false;this.setAnim("jump",true);
  }
  setBlock(v){
    if(this.dead||this.fatal||this.stun>0||this.attack){this.blocking=false;return}
    if(v&&this.stamina>1){this.blocking=true;this.vx*=.6}else this.blocking=false;
  }
  dash(){
    if(!this.canAct()||this.stamina<20||this.cool.dash>0)return;
    this.stamina-=20;this.cool.dash=520;this.invuln=150;this.vx=this.facing*(18+this.def.stats.speed*.45);
    shadowImage(this);audio.whoosh();burst(this.x,this.y-110,this.def.accent,10,.8);
  }
  punch(){
    if(!this.canAct()||this.stamina<7)return;
    this.stamina-=7;this.startAttack("punch",270,82,145,7+this.def.stats.power*.48,4.7,{hitbox:{offsetX:38,offsetY:-172,w:112,h:70}});
  }
  kick(){
    if(!this.canAct()||this.stamina<13)return;
    this.stamina-=13;this.startAttack("kick",400,135,235,10+this.def.stats.power*.66,7.5,{hitbox:{offsetX:32,offsetY:-150,w:158,h:82}});
  }
  startAttack(anim,duration,activeStart,activeEnd,damage,knock,meta={}){
    this.blocking=false;
    this.attack={anim,duration,time:duration,activeStart,activeEnd,damage,knock,hit:false,...meta};
    this.animLocked=true;this.setAnim(anim,true);audio.whoosh();
  }
  power(){
    if(!this.canAct()||this.mana<25||this.cool.power>0)return;
    this.mana-=25;this.cool.power=610;this.animLocked=true;this.setAnim("special",true);
    this.attack={anim:"special",duration:430,time:430,activeAt:-1,range:0,damage:0,knock:0,hit:true,noMelee:true};
    setTimeout(()=>{if(state.running&&!this.dead)this.spawnPowerProjectile(false)},150);
    audio.power();
  }
  spawnPowerProjectile(command=false){
    const cfg={
      brawler:{kind:"fire",speed:12.5,size:24,damage:command?17:13},
      assassin:{kind:"void",speed:16,size:18,damage:command?16:11},
      tank:{kind:"quake",speed:8,size:35,damage:command?20:16},
      caster:{kind:"lightning",speed:13.5,size:20,damage:command?17:12},
      rush:{kind:"kinetic",speed:17,size:20,damage:command?16:12},
      drain:{kind:"blood",speed:10.5,size:28,damage:command?18:14,drain:true}
    }[this.def.style];
    state.projectiles.push({
      owner:this,x:this.x+this.facing*72,y:this.y-135,vx:this.facing*cfg.speed,vy:0,
      life:1300,size:cfg.size,damage:cfg.damage,kind:cfg.kind,color:this.def.accent,drain:cfg.drain||false,
      command
    });
    burst(this.x+this.facing*70,this.y-135,this.def.accent,14,1.05);
  }
  commandMove(opponent){
    if(!this.canAct()||this.mana<34||this.cool.command>0)return;
    this.mana-=34;this.cool.command=820;toast(`${this.def.command}!`);audio.power();
    switch(this.def.style){
      case "brawler":
        this.animLocked=true;this.setAnim("special",true);
        this.attack={anim:"special",duration:500,time:500,activeAt:-1,hit:true,noMelee:true};
        setTimeout(()=>this.spawnPowerProjectile(true),150);break;
      case "assassin":
        shadowImage(this);this.invuln=260;this.x=opponent.x-opponent.facing*105;this.facing=opponent.x>this.x?1:-1;
        this.startAttack("special",470,160,315,18,13,{command:true,hitbox:{offsetX:28,offsetY:-185,w:185,h:125}});burst(this.x,this.y-120,this.def.accent,24,1.4);break;
      case "tank":
        this.startAttack("special",610,250,430,21,18,{command:true,guardBreak:true,hitbox:{offsetX:15,offsetY:-125,w:330,h:125}});
        for(let i=0;i<22;i++)state.particles.push({x:this.x+(Math.random()-.5)*420,y:FLOOR_Y-5,vx:(Math.random()-.5)*4,vy:-2-Math.random()*7,life:700,size:4+Math.random()*10,color:this.def.accent});
        state.shake=14;break;
      case "caster":
        this.animLocked=true;this.setAnim("special",true);
        this.attack={anim:"special",duration:560,time:560,activeAt:-1,hit:true,noMelee:true};
        for(let i=0;i<3;i++)setTimeout(()=>{
          if(state.running)state.projectiles.push({owner:this,x:opponent.x+(i-1)*55,y:180,vx:0,vy:18,life:650,size:24,damage:7,kind:"bolt",color:this.def.accent,command:true});
        },i*80);break;
      case "rush":
        this.invuln=170;this.vx=this.facing*26;shadowImage(this);
        this.startAttack("special",430,135,310,18,15,{command:true,hitbox:{offsetX:10,offsetY:-180,w:210,h:125}});break;
      case "drain":
        this.animLocked=true;this.setAnim("special",true);
        this.attack={anim:"special",duration:520,time:520,activeAt:-1,hit:true,noMelee:true};
        setTimeout(()=>this.spawnPowerProjectile(true),150);break;
    }
  }
  superMove(opponent){
    if(state.finisherWindow?.attacker===this){performFinisher(this,opponent);return}
    if(!this.canAct()||this.super<100||this.cool.super>0)return;
    this.super=0;this.cool.super=1600;this.invuln=550;this.animLocked=true;this.setAnim("special",true);
    announce(this.def.special);audio.super();state.flash=.35;state.cinematic=420;
    const style=this.def.style;
    if(style==="caster"){
      this.attack={anim:"special",duration:900,time:900,activeAt:-1,hit:true,noMelee:true};
      for(let i=0;i<7;i++)setTimeout(()=>{
        if(!state.running)return;
        const px=opponent.x+(i-3)*48;
        state.projectiles.push({owner:this,x:px,y:120,vx:0,vy:20,life:700,size:26,damage:5.3,kind:"bolt",color:this.def.accent,super:true});
      },i*70);
    }else if(style==="assassin"){
      shadowImage(this);this.x=opponent.x-opponent.facing*110;this.facing=opponent.x>this.x?1:-1;
      this.attack={anim:"special",duration:780,time:780,activeStart:300,activeEnd:540,damage:31,knock:15,hit:false,super:true,hitbox:{offsetX:25,offsetY:-190,w:215,h:135}};
      for(let i=0;i<5;i++)setTimeout(()=>shadowImage(this),i*60);
    }else if(style==="tank"){
      this.attack={anim:"special",duration:900,time:900,activeStart:360,activeEnd:650,damage:35,knock:24,hit:false,super:true,guardBreak:true,hitbox:{offsetX:10,offsetY:-145,w:420,h:145}};
      state.shake=22;
    }else if(style==="rush"){
      this.vx=this.facing*29;this.attack={anim:"special",duration:720,time:720,activeStart:250,activeEnd:510,damage:32,knock:20,hit:false,super:true,hitbox:{offsetX:5,offsetY:-190,w:245,h:140}};
      for(let i=0;i<7;i++)setTimeout(()=>shadowImage(this),i*55);
    }else if(style==="drain"){
      this.attack={anim:"special",duration:820,time:820,activeStart:320,activeEnd:590,damage:33,knock:13,hit:false,super:true,drain:true,hitbox:{offsetX:20,offsetY:-200,w:275,h:150}};
    }else{
      this.attack={anim:"special",duration:820,time:820,activeStart:320,activeEnd:600,damage:34,knock:20,hit:false,super:true,hitbox:{offsetX:20,offsetY:-190,w:285,h:145}};
    }
    burst(this.x,this.y-130,this.def.accent,45,2.0);
  }
  receiveHit(damage,knock,attacker,meta={}){
    if(this.invuln>0||this.dead||this.fatal||state.roundEnding)return;
    let dmg=damage;
    const blocked=this.blocking&&this.stamina>0&&!meta.guardBreak;
    if(blocked){
      dmg*=.25;this.stamina=Math.max(0,this.stamina-damage*1.7);audio.hit(.5);
      state.hitStop=Math.max(state.hitStop,42);hitSpark(this.x+attacker.facing*28,this.y-130,attacker.def.accent,true);
      if(this.stamina<=0){this.blocking=false;this.stun=620;toast("GUARD BREAK");state.shake=7}
    }else{
      this.blocking=false;this.stun=Math.min(700,145+damage*9);
      this.setAnim("hurt",true);this.animLocked=true;
      attacker.combo++;attacker.comboTime=900;
      attacker.super=Math.min(100,attacker.super+damage*1.65);
      this.super=Math.min(100,this.super+damage*1.2);
      audio.hit(Math.min(3,damage/8));
      state.hitStop=Math.max(state.hitStop,Math.min(105,46+damage*2.2));
      hitSpark(this.x+attacker.facing*20,this.y-130,attacker.def.accent,false);
    }
    this.health=Math.max(0,this.health-dmg);
    if(meta.drain)attacker.health=Math.min(100,attacker.health+dmg*.32);
    this.vx=attacker.facing*knock;
    if((this.x<95&&this.vx<0)||(this.x>WORLD_W-95&&this.vx>0)){this.vx*=-.48;state.shake=Math.max(state.shake,11);burst(this.x,this.y-110,"#ffffff",12,1.0)}
    state.shake=Math.max(state.shake,Math.min(18,damage*.45));
    if(this.health<=0)handleDefeat(this,attacker);
  }
  update(dt,opponent){
    const s=dt/16.666;
    if(this.dead){
      if(!this.grounded){this.vy+=.78*s;this.y+=this.vy*s;if(this.y>=FLOOR_Y){this.y=FLOOR_Y;this.vy=0;this.grounded=true}}
      this.updateAnim(dt);return;
    }
    this.stun=Math.max(0,this.stun-dt);this.invuln=Math.max(0,this.invuln-dt);
    Object.keys(this.cool).forEach(k=>this.cool[k]=Math.max(0,this.cool[k]-dt));
    this.comboTime-=dt;if(this.comboTime<=0)this.combo=0;
    this.mana=Math.min(100,this.mana+(0.013+this.def.stats.energy*.0014)*dt);
    this.stamina=Math.min(100,this.stamina+(this.blocking?.010:.024)*dt);

    if(!this.grounded){
      this.vy+=.82*s;this.y+=this.vy*s;
      if(!this.attack&&!this.fatal)this.setAnim(this.vy<0?"jump":"fall",true);
      if(this.y>=FLOOR_Y){
        const landedHard=this.vy>10;this.y=FLOOR_Y;this.vy=0;this.grounded=true;
        if(landedHard)burst(this.x,FLOOR_Y-8,"#dbe7ff",8,.45);
        if(!this.attack&&!this.fatal)this.setAnim("idle",true);
      }
    }
    this.x+=this.vx*s;this.vx*=Math.pow(.80,s);this.x=Math.max(70,Math.min(WORLD_W-70,this.x));
    if(!this.attack&&!this.fatal&&Math.abs(opponent.x-this.x)>8)this.facing=opponent.x>this.x?1:-1;

    if(this.attack){
      this.attack.time-=dt;
      const elapsed=this.attack.duration-this.attack.time;
      if(!this.attack.hit && this.attack.activeStart>=0 && elapsed>=this.attack.activeStart && elapsed<=this.attack.activeEnd){
        const atk=this.getAttackBox(),hurt=opponent.getHurtBox();
        if(atk&&rectsOverlap(atk,hurt)){
          this.attack.hit=true;
          opponent.receiveHit(this.attack.damage,this.attack.knock,this,{guardBreak:this.attack.guardBreak,drain:this.attack.drain});
        }
      }
      if(this.attack.time<=0){
        this.attack=null;this.animLocked=false;if(this.grounded&&!this.fatal)this.setAnim("idle",true);
      }
    }else if(this.stun<=0&&this.animLocked&&!this.fatal){this.animLocked=false;this.setAnim(this.grounded?"idle":(this.vy<0?"jump":"fall"),true)}
    if(this.grounded&&!this.attack&&!this.blocking&&!this.animLocked&&Math.abs(this.vx)<.55&&!this.fatal)this.setAnim("idle");
    this.updateAnim(dt);
  }
  updateAnim(dt){
    this.animTime+=dt;
    const count=animFrames[this.anim]||1,fps=animFPS[this.anim]||8;
    const f=Math.floor(this.animTime/(1000/fps));
    if(this.anim==="ko")this.frame=Math.min(count-1,f);
    else if(this.animLocked&&["punch","kick","hurt","special","finisher"].includes(this.anim))this.frame=Math.min(count-1,f);
    else this.frame=f%count;
  }
  draw(c){
    if(this.blocking){
      c.save();c.strokeStyle=this.def.accent;c.globalAlpha=.45;c.lineWidth=6;c.beginPath();
      c.arc(this.x,this.y-135,82,this.facing>0?-2.15:-1.0,this.facing>0?1.0:2.15);c.stroke();c.restore();
    }
    if(this.super>=100&&!this.dead){
      c.save();c.strokeStyle=this.def.accent;c.globalAlpha=.28;c.lineWidth=3;c.beginPath();c.arc(this.x,this.y-135,88+Math.sin(performance.now()*.008)*5,0,TAU);c.stroke();c.restore();
    }
    drawSprite(c,this.def,this.anim,this.frame,this.x,this.y,this.facing<0,1,1);
    if(state.debugHitboxes){
      const hurt=this.getHurtBox(),push=this.getPushBox(),atk=this.getAttackBox();
      c.save();c.lineWidth=2;
      c.strokeStyle="#44ff78";c.strokeRect(hurt.x,hurt.y,hurt.w,hurt.h);
      c.strokeStyle="#4ba3ff";c.strokeRect(push.x,push.y,push.w,push.h);
      if(atk){c.strokeStyle="#ff405a";c.strokeRect(atk.x,atk.y,atk.w,atk.h)}
      c.restore();
    }
  }
}

function handleDefeat(loser,attacker){
  if(state.roundEnding||state.finisherWindow)return;
  const attackerWins=attacker.side===1?state.p1Wins:state.p2Wins;
  if(attackerWins+1>=state.winsNeeded){
    loser.health=1;loser.fatal=true;loser.stun=999999;loser.animLocked=true;loser.setAnim("hurt",true);
    loser.vx=0;state.finisherWindow={attacker,loser,remaining:6000};state.timerAcc=0;
    announce("FINALIZE!",true);toast("ESPECIAL para executar a finalização");audio.super();
  }else{
    loser.dead=true;loser.animLocked=true;loser.setAnim("ko",true);loser.vy=-7;loser.grounded=false;
    state.roundEnding=true;announce("K.O.");audio.ko();
    setTimeout(()=>finishRound(attacker,false),1200);
  }
}

function performFinisher(attacker,loser){
  if(!state.finisherWindow||state.roundEnding)return;
  state.finisherWindow=null;state.roundEnding=true;state.finisherUsed=true;
  attacker.attack=null;attacker.vx=0;attacker.animLocked=true;attacker.setAnim("finisher",true);
  loser.vx=0;loser.animLocked=true;loser.setAnim("hurt",true);
  announce(attacker.def.finisher,true);audio.super();state.cinematic=1200;state.flash=.7;state.shake=18;
  for(let i=0;i<70;i++)setTimeout(()=>burst(loser.x,loser.y-130,attacker.def.accent,3,1.8),i*12);
  setTimeout(()=>{
    loser.health=0;loser.dead=true;loser.fatal=false;loser.setAnim("ko",true);loser.vy=-9;loser.grounded=false;
    audio.ko();state.flash=.55;
  },950);
  setTimeout(()=>finishRound(attacker,true),1900);
}

function finishRound(winner,finisher){
  if(!winner)return;
  if(winner.side===1)state.p1Wins++;else state.p2Wins++;
  updateHUD();
  const wonMatch=(winner.side===1?state.p1Wins:state.p2Wins)>=state.winsNeeded;
  if(wonMatch){
    state.running=false;
    setTimeout(()=>{
      DOM.winnerText.textContent=`${winner.def.name} VENCEU`;
      DOM.winnerDetail.textContent=finisher?`${winner.def.finisher} encerrou o combate.`:`${winner.def.special} garantiu a vitória.`;
      DOM.resultOverlay.classList.remove("hidden");
    },450);
  }else{
    setTimeout(()=>resetRound(),700);
  }
}

function resetRound(){
  state.round++;state.timer=99;state.timerAcc=0;state.roundEnding=false;state.finisherWindow=null;state.projectiles=[];state.particles=[];state.afterImages=[];state.hitStop=0;state.cameraZoom=1;
  P1.reset();P2.reset();state.roundLock=true;updateHUD();announce(`ROUND ${state.round}`);
  setTimeout(()=>{if(state.screen==="fight"){announce("FIGHT!");state.roundLock=false}},850);
}

function startFight(rematch=false){
  audio.ensure();
  state.difficulty=$("difficulty").value;state.winsNeeded=parseInt($("rounds-select").value,10);
  if(!rematch){state.p1Wins=0;state.p2Wins=0;state.round=1}
  state.timer=99;state.timerAcc=0;state.running=true;state.paused=false;state.roundLock=true;state.roundEnding=false;state.finisherWindow=null;state.finisherUsed=false;
  state.projectiles=[];state.particles=[];state.afterImages=[];state.aiClock=0;state.hitStop=0;state.cameraZoom=1;
  P1=new Fighter(fighterDefs[state.p1Index],1);P2=new Fighter(fighterDefs[state.p2Index],2);
  DOM.hudP1.textContent=P1.def.name;DOM.hudP2.textContent=P2.def.name;DOM.arenaLabel.textContent=arenas[state.arena].name;
  DOM.resultOverlay.classList.add("hidden");DOM.pauseOverlay.classList.add("hidden");
  switchScreen("fight");updateHUD();announce("ROUND 1");
  setTimeout(()=>{if(state.screen==="fight"){announce("FIGHT!");state.roundLock=false}},850);
}

function winsDots(n){
  return Array.from({length:state.winsNeeded},(_,i)=>i<n?"●":"○").join(" ");
}
function setWidth(el,v){el.style.width=`${Math.max(0,Math.min(100,v))}%`}
function updateHUD(){
  if(!P1||!P2)return;
  setWidth(DOM.p1Health,P1.health);setWidth(DOM.p2Health,P2.health);
  setWidth(DOM.p1Mana,P1.mana);setWidth(DOM.p2Mana,P2.mana);
  setWidth(DOM.p1Stamina,P1.stamina);setWidth(DOM.p2Stamina,P2.stamina);
  setWidth(DOM.p1Super,P1.super);setWidth(DOM.p2Super,P2.super);
  DOM.p1HealthText.textContent=Math.ceil(P1.health);DOM.p2HealthText.textContent=Math.ceil(P2.health);
  DOM.timer.textContent=String(Math.max(0,Math.ceil(state.timer))).padStart(2,"0");
  DOM.roundLabel.textContent=`ROUND ${state.round}`;
  DOM.p1Wins.textContent=winsDots(state.p1Wins);DOM.p2Wins.textContent=winsDots(state.p2Wins);
  DOM.comboP1.textContent=P1.combo>=2?`${P1.combo} HIT`:"";DOM.comboP2.textContent=P2.combo>=2?`${P2.combo} HIT`:"";
}

function drawArena(c,t){
  if(state.arena==="neon"){
    const g=c.createLinearGradient(0,0,0,WORLD_H);g.addColorStop(0,"#070822");g.addColorStop(.58,"#191052");g.addColorStop(1,"#060811");c.fillStyle=g;c.fillRect(0,0,WORLD_W,WORLD_H);
    c.globalAlpha=.42;
    for(let i=0;i<22;i++){
      const x=(i*127)%WORLD_W,bh=90+(i*53)%270;c.fillStyle=i%2?"#101a33":"#190c32";c.fillRect(x,FLOOR_Y-bh,88,bh);
      c.fillStyle=i%3?"#34ddff":"#ff3d96";for(let y=FLOOR_Y-bh+18;y<FLOOR_Y-15;y+=27)c.fillRect(x+13,y,5,8);
    }
    c.globalAlpha=1;
    c.fillStyle="rgba(255,61,149,.13)";c.beginPath();c.arc(WORLD_W*.5,230,125,0,TAU);c.fill();
    c.strokeStyle="rgba(255,61,149,.28)";c.lineWidth=3;for(let y=155;y<310;y+=20){c.beginPath();c.moveTo(675,y);c.lineTo(925,y);c.stroke()}
    // animated hover traffic / signage
    for(let i=0;i<4;i++){
      const hx=(t*.09+i*430)%1900-150,hy=410+i%2*55;
      c.fillStyle=i%2?"rgba(70,232,255,.50)":"rgba(255,61,149,.45)";
      c.fillRect(hx,hy,48,4);c.fillRect(hx-24,hy+2,22,2);
    }
    c.fillStyle="#070a13";c.fillRect(0,FLOOR_Y,WORLD_W,WORLD_H-FLOOR_Y);
    c.strokeStyle="rgba(70,232,255,.16)";c.lineWidth=1;
    for(let y=FLOOR_Y;y<WORLD_H;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(WORLD_W,y);c.stroke()}
    for(let x=-800;x<2400;x+=100){c.beginPath();c.moveTo(800+(x-800)*.13,FLOOR_Y);c.lineTo(x,WORLD_H);c.stroke()}
  } else if(state.arena==="temple"){
    const g=c.createLinearGradient(0,0,0,WORLD_H);g.addColorStop(0,"#050816");g.addColorStop(.6,"#161d3a");g.addColorStop(1,"#080a10");c.fillStyle=g;c.fillRect(0,0,WORLD_W,WORLD_H);
    c.fillStyle="#edf2ff";c.beginPath();c.arc(800,190,95,0,TAU);c.fill();c.fillStyle="#c9d0e2";c.beginPath();c.arc(840,165,92,0,TAU);c.fill();
    c.globalAlpha=.5;c.fillStyle="#0e1526";
    for(let i=0;i<8;i++){let x=120+i*200;c.fillRect(x-14,330,28,390);c.fillRect(x-48,330,96,14)}
    c.globalAlpha=1;c.fillStyle="#080c16";c.beginPath();c.moveTo(0,610);for(let x=0;x<=WORLD_W;x+=100)c.lineTo(x,540-(x/100%2)*35);c.lineTo(WORLD_W,FLOOR_Y);c.lineTo(0,FLOOR_Y);c.fill();
    for(let i=0;i<9;i++){
      const lx=120+i*180,ly=500+Math.sin(t*.002+i)*7;
      c.fillStyle="rgba(255,214,128,.55)";c.beginPath();c.arc(lx,ly,4,0,TAU);c.fill();
    }
    c.fillStyle="#090a0f";c.fillRect(0,FLOOR_Y,WORLD_W,180);c.strokeStyle="rgba(120,150,255,.15)";
    for(let x=0;x<WORLD_W;x+=85){c.beginPath();c.moveTo(x,FLOOR_Y);c.lineTo(x+45,WORLD_H);c.stroke()}
  } else {
    const g=c.createLinearGradient(0,0,0,WORLD_H);g.addColorStop(0,"#170706");g.addColorStop(.57,"#3e110a");g.addColorStop(1,"#080605");c.fillStyle=g;c.fillRect(0,0,WORLD_W,WORLD_H);
    for(let i=0;i<25;i++){let x=(i*173+t*.035)%WORLD_W,y=130+(i*61)%390;c.fillStyle="rgba(255,110,35,.23)";c.beginPath();c.arc(x,y,2+i%5,0,TAU);c.fill()}
    c.fillStyle="#21100b";for(let i=0;i<7;i++){let x=i*270;c.fillRect(x-34,270,68,450);c.fillStyle="#ff6425";c.fillRect(x-26,345,52,6);c.fillStyle="#21100b"}
    for(let i=0;i<5;i++){
      const px=130+i*330,ph=36+Math.sin(t*.004+i)*18;
      c.fillStyle="#2b1710";c.fillRect(px,430,52,180);
      c.fillStyle="rgba(255,103,38,.75)";c.fillRect(px+8,500-ph,36,ph);
    }
    c.fillStyle="#100a07";c.fillRect(0,FLOOR_Y,WORLD_W,180);c.fillStyle="#f0541e";c.fillRect(0,FLOOR_Y-6,WORLD_W,6);
    c.strokeStyle="rgba(255,110,35,.16)";for(let x=0;x<WORLD_W;x+=95){c.beginPath();c.moveTo(x,FLOOR_Y);c.lineTo(x-65,WORLD_H);c.stroke()}
  }
  c.fillStyle="rgba(255,255,255,.035)";c.fillRect(0,FLOOR_Y-3,WORLD_W,3);
}

function updateEffects(dt){
  state.particles=state.particles.filter(p=>{
    p.life-=dt;if(!p.ring){p.x+=p.vx*dt/16.666;p.y+=p.vy*dt/16.666;p.vy+=.12*dt/16.666}return p.life>0
  });
  state.afterImages=state.afterImages.filter(a=>(a.life-=dt)>0);
  state.flash=Math.max(0,state.flash-dt*.0018);state.cinematic=Math.max(0,state.cinematic-dt);
}
function drawEffects(c){
  for(const a of state.afterImages)drawSprite(c,a.def,a.anim,a.frame,a.x,a.y,a.flip,1,a.life/350);
  for(const p of state.particles){
    c.save();c.globalAlpha=Math.min(1,p.life/220);c.strokeStyle=p.color;c.fillStyle=p.color;
    if(p.ring){c.lineWidth=4;c.beginPath();c.arc(p.x,p.y,p.size+(280-p.life)*.18,0,TAU);c.stroke()}
    else{c.beginPath();c.arc(p.x,p.y,p.size,0,TAU);c.fill()}
    c.restore();
  }
}
function updateProjectiles(dt){
  state.projectiles=state.projectiles.filter(p=>{
    p.life-=dt;p.x+=(p.vx||0)*dt/16.666;p.y+=(p.vy||0)*dt/16.666;
    const target=p.owner===P1?P2:P1;
    const projectileBox={x:p.x-p.size,y:p.y-p.size,w:p.size*2,h:p.size*2};
    if(p.life>0&&!target.dead&&!target.fatal&&rectsOverlap(projectileBox,target.getHurtBox())){
      target.receiveHit(p.damage,p.command?10:6,p.owner,{drain:p.drain});burst(p.x,p.y,p.color,18,1.3);return false;
    }
    return p.life>0&&p.x>-100&&p.x<1700&&p.y<1000;
  });
}
function drawProjectiles(c,t){
  state.projectiles.forEach(p=>{
    c.save();c.translate(p.x,p.y);c.shadowColor=p.color;c.shadowBlur=28;c.strokeStyle=p.color;c.fillStyle=p.color;
    if(p.kind==="bolt"){
      c.lineWidth=9;c.beginPath();c.moveTo(0,-50);for(let y=-38;y<55;y+=13)c.lineTo((Math.random()-.5)*24,y);c.stroke();
    }else if(p.kind==="quake"){
      c.rotate(t*.008);c.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU,r=p.size*(.72+Math.random()*.22),x=Math.cos(a)*r,y=Math.sin(a)*r;i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.fill();
    }else{
      const g=c.createRadialGradient(0,0,2,0,0,p.size*1.5);g.addColorStop(0,"#fff");g.addColorStop(.25,p.color);g.addColorStop(1,"rgba(0,0,0,0)");
      c.fillStyle=g;c.beginPath();c.arc(0,0,p.size*1.6,0,TAU);c.fill();
      if(p.kind==="kinetic"){c.strokeStyle=p.color;c.globalAlpha=.6;c.lineWidth=5;c.beginPath();c.moveTo(-p.owner.facing*55,0);c.lineTo(0,0);c.stroke()}
    }c.restore();
  });
}

function drawFight(t){
  const shakeX=(Math.random()-.5)*state.shake,shakeY=(Math.random()-.5)*state.shake;
  const dist=Math.abs(P1.x-P2.x);
  const targetZoom=1+clamp((620-dist)/620,0,1)*.022+(state.cinematic>0?.018:0);
  state.cameraZoom+=(targetZoom-state.cameraZoom)*.08;
  const focusX=clamp((P1.x+P2.x)/2,620,980),focusY=455;
  ctx.save();
  ctx.translate(WORLD_W/2+shakeX,WORLD_H/2+shakeY);
  ctx.scale(state.cameraZoom,state.cameraZoom);
  ctx.translate(-focusX,-focusY);
  drawArena(ctx,t);drawEffects(ctx);drawProjectiles(ctx,t);P1.draw(ctx);P2.draw(ctx);
  ctx.restore();
  if(state.debugHitboxes){
    ctx.save();ctx.fillStyle="rgba(3,5,10,.72)";ctx.fillRect(18,810,355,66);
    ctx.font="700 15px Rajdhani";ctx.fillStyle="#44ff78";ctx.fillText("VERDE: HURTBOX",32,834);
    ctx.fillStyle="#4ba3ff";ctx.fillText("AZUL: PUSHBOX",32,854);
    ctx.fillStyle="#ff405a";ctx.fillText("VERMELHO: ATTACK BOX (frames ativos)",155,834);ctx.restore();
  }
  if(state.flash>0){ctx.fillStyle=`rgba(255,255,255,${Math.min(.55,state.flash)})`;ctx.fillRect(0,0,WORLD_W,WORLD_H)}
  state.shake*=.84;if(state.shake<.25)state.shake=0;
}

function pushInput(side,token){
  const now=performance.now(),buf=inputBuffers[side];buf.push({token,t:now});
  while(buf.length&&now-buf[0].t>700)buf.shift();
}
function hasQCF(side){
  const now=performance.now(),arr=inputBuffers[side].filter(e=>now-e.t<600).map(e=>e.token);
  let d=-1,f=-1;
  for(let i=0;i<arr.length;i++){if(arr[i]==="D")d=i;if(d>=0&&i>d&&arr[i]==="F"){f=i;break}}
  return d>=0&&f>d;
}
function directionalToken(f,dir){
  if(dir==="down")return "D";
  if(dir==="right")return f.facing>0?"F":"B";
  if(dir==="left")return f.facing<0?"F":"B";
  return "N";
}

function inputAction(side,action){
  const f=side===1?P1:P2,opp=side===1?P2:P1;
  if(!f||state.screen!=="fight"||state.paused||!state.running||state.roundLock||state.roundEnding)return;
  if(action==="punch"){
    if(hasQCF(side)){inputBuffers[side]=[];f.commandMove(opp)}else f.punch();
  }else if(action==="kick")f.kick();
  else if(action==="power")f.power();
  else if(action==="special")f.superMove(opp);
  else if(action==="dash")f.dash();
  else if(action==="jump")f.jump();
}

function handleKeyboardHeld(){
  if(!P1||state.screen!=="fight"||state.paused||!state.running||state.roundLock||state.roundEnding)return;
  P1.setBlock(!!keys.KeyS);
  if(keys.KeyA)P1.move(-1);if(keys.KeyD)P1.move(1);
  if(state.mode==="local"){
    P2.setBlock(!!keys.ArrowDown);
    if(keys.ArrowLeft)P2.move(-1);if(keys.ArrowRight)P2.move(1);
  }
}

window.addEventListener("keydown",e=>{
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();
  if(e.repeat)return;
  keys[e.code]=true;
  if(state.screen==="select"&&e.code==="Enter"){startFight();return}
  if(e.code==="F2"&&state.screen==="fight"){
    state.debugHitboxes=!state.debugHitboxes;
    DOM.debugBtn.classList.toggle("active",state.debugHitboxes);
    DOM.debugBtn.textContent=`HITBOX: ${state.debugHitboxes?"ON":"OFF"}`;
    toast(state.debugHitboxes?"HITBOX DEBUG ATIVO":"HITBOX DEBUG DESATIVADO");
    return;
  }
  if(e.code==="Escape"&&state.screen==="fight"){togglePause();return}
  if(!P1||state.screen!=="fight")return;
  const p1dir={KeyS:"down",KeyA:"left",KeyD:"right"}[e.code];
  if(p1dir)pushInput(1,directionalToken(P1,p1dir));
  const p2dir={ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"}[e.code];
  if(p2dir&&state.mode==="local")pushInput(2,directionalToken(P2,p2dir));
  const p1act={KeyW:"jump",KeyJ:"punch",KeyK:"kick",KeyL:"power",KeyU:"special",KeyI:"dash"}[e.code];
  if(p1act)inputAction(1,p1act);
  const p2act={ArrowUp:"jump",Digit1:"punch",Digit2:"kick",Digit3:"power",Digit4:"special",Digit5:"dash"}[e.code];
  if(p2act&&state.mode==="local")inputAction(2,p2act);
});
window.addEventListener("keyup",e=>{keys[e.code]=false;if(P1&&e.code==="KeyS")P1.setBlock(false);if(P2&&e.code==="ArrowDown")P2.setBlock(false)});

function pollGamepads(){
  const pads=navigator.getGamepads?navigator.getGamepads():[];
  const live=[...pads].filter(Boolean);
  DOM.padP1.textContent=live[0]?`P1: ${shortPad(live[0].id)}`:"P1: TECLADO";
  DOM.padP2.textContent=live[1]?`P2: ${shortPad(live[1].id)}`:"P2: TECLADO";
  live.slice(0,2).forEach((gp,idx)=>{
    const side=idx+1;if(side===2&&state.mode!=="local")return;
    const f=side===1?P1:P2;
    if(!f||state.screen!=="fight")return;
    const prev=gamepadPrev[gp.index]||{btn:[],dir:{}};
    const btn=gp.buttons.map(b=>b.pressed);
    const left=gp.axes[0]<-.45||btn[14], right=gp.axes[0]>.45||btn[15], up=gp.axes[1]<-.55||btn[12], down=gp.axes[1]>.55||btn[13];
    if(!state.paused&&!state.roundLock&&!state.roundEnding){
      f.setBlock(!!btn[4]);
      if(left)f.move(-1);if(right)f.move(1);
      const dir={left,right,down};
      for(const d of ["left","right","down"])if(dir[d]&&!prev.dir?.[d])pushInput(side,directionalToken(f,d));
      if(up&&!prev.up)inputAction(side,"jump");
      const map={0:"punch",1:"kick",2:"power",3:"special",5:"dash"};
      Object.entries(map).forEach(([bi,act])=>{if(btn[bi]&&!prev.btn?.[bi])inputAction(side,act)});
    }
    if(btn[9]&&!prev.btn?.[9]&&state.screen==="fight")togglePause();
    gamepadPrev[gp.index]={btn,dir:{left,right,down},up};
  });
}
function shortPad(id){
  if(/xbox/i.test(id))return "XBOX CONTROLLER";
  if(/dual|playstation|wireless controller/i.test(id))return "PLAYSTATION";
  return "GAMEPAD";
}

function updateAI(dt){
  if(state.mode!=="cpu"||state.paused||state.roundLock||state.roundEnding||P2.dead||P2.fatal)return;
  state.aiClock-=dt;if(state.aiClock>0)return;
  const cfg={easy:{tick:260,skill:.32},normal:{tick:165,skill:.56},hard:{tick:92,skill:.80}}[state.difficulty];
  state.aiClock=cfg.tick+Math.random()*cfg.tick*.7;
  const dist=Math.abs(P1.x-P2.x),r=Math.random();P2.setBlock(false);
  if(P2.stun>0)return;
  if(P2.super>=100&&r<cfg.skill*.42){P2.superMove(P1);return}
  if(dist>340){
    if(P2.mana>=34&&r<.18+cfg.skill*.32)P2.commandMove(P1);
    else if(P2.mana>=25&&r<.36+cfg.skill*.2)P2.power();
    else P2.move(P1.x>P2.x?1:-1);
  }else if(dist>160){
    if(r<.22)P2.dash();else if(r<.55)P2.move(P1.x>P2.x?1:-1);else if(P2.mana>=34)P2.commandMove(P1);else P2.kick();
  }else{
    if(P2.health<38&&r<.13+cfg.skill*.12)P2.setBlock(true);
    else if(r<.40)P2.punch();else if(r<.72)P2.kick();else if(r<.88)P2.dash();else P2.jump();
  }
}

function updateGame(dt){
  if(state.paused||!state.running)return;
  pollGamepads();
  if(state.hitStop>0){
    state.hitStop=Math.max(0,state.hitStop-dt);
    updateEffects(dt*.25);updateHUD();return;
  }
  handleKeyboardHeld();updateAI(dt);
  if(!state.roundLock&&!state.roundEnding){
    P1.update(dt,P2);P2.update(dt,P1);resolvePushBoxes(P1,P2);updateProjectiles(dt);updateEffects(dt);
    if(state.finisherWindow){
      state.finisherWindow.remaining-=dt;
      if(state.finisherWindow.remaining<=0){
        const {attacker,loser}=state.finisherWindow;state.finisherWindow=null;loser.health=0;loser.dead=true;loser.fatal=false;loser.setAnim("ko",true);
        state.roundEnding=true;announce("K.O.");setTimeout(()=>finishRound(attacker,false),1000);
      }
    }else{
      state.timerAcc+=dt;if(state.timerAcc>=1000){const sec=Math.floor(state.timerAcc/1000);state.timer-=sec;state.timerAcc-=sec*1000}
      if(state.timer<=0){
        state.timer=0;state.roundEnding=true;const winner=P1.health===P2.health?null:(P1.health>P2.health?P1:P2);
        if(winner){announce("TIME!");setTimeout(()=>finishRound(winner,false),900)}
        else{announce("DRAW");setTimeout(()=>{state.roundEnding=false;resetRound()},900)}
      }
    }
  }else updateEffects(dt);
  updateHUD();
}

function togglePause(){
  if(!state.running&&state.screen==="fight")return;
  state.paused=!state.paused;DOM.pauseOverlay.classList.toggle("hidden",!state.paused);
}

function gameLoop(t){
  requestAnimationFrame(gameLoop);
  const dt=Math.min(34,t-state.lastTime||16.666);state.lastTime=t;
  if(state.screen==="select"){
    state.previewTime=t;
    renderPreview(DOM.p1Preview,fighterDefs[state.p1Index],false,t);
    renderPreview(DOM.p2Preview,fighterDefs[state.p2Index],true,t);
    updateRosterThumbs(t);pollGamepads();
  }else if(P1&&P2){
    updateGame(dt);drawFight(t);
  }
}

document.querySelectorAll(".mode-btn").forEach(btn=>btn.addEventListener("click",()=>{
  audio.select();document.querySelectorAll(".mode-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");
  state.mode=btn.dataset.mode;DOM.p2Slot.textContent=state.mode==="cpu"?"CPU":"PLAYER 2";DOM.difficultyWrap.style.opacity=state.mode==="cpu"?"1":".35";
}));
document.querySelectorAll(".arena-card").forEach(btn=>btn.addEventListener("click",()=>{
  audio.select();document.querySelectorAll(".arena-card").forEach(b=>b.classList.remove("active"));btn.classList.add("active");state.arena=btn.dataset.arena;
}));

$("enter-game").addEventListener("click",()=>{audio.ensure();DOM.intro.classList.add("hidden")});
window.addEventListener("keydown",e=>{if(e.code==="Enter"&&!DOM.intro.classList.contains("hidden")){e.preventDefault();e.stopImmediatePropagation();audio.ensure();DOM.intro.classList.add("hidden")}},{capture:true});
$("fight-btn").addEventListener("click",()=>startFight(false));
$("pause-btn").addEventListener("click",togglePause);
$("resume-btn").addEventListener("click",togglePause);
$("pause-select-btn").addEventListener("click",()=>{state.running=false;state.paused=false;DOM.pauseOverlay.classList.add("hidden");switchScreen("select")});
$("rematch-btn").addEventListener("click",()=>startFight(false));
$("result-select-btn").addEventListener("click",()=>{DOM.resultOverlay.classList.add("hidden");switchScreen("select")});
$("debug-btn").addEventListener("click",()=>{
  state.debugHitboxes=!state.debugHitboxes;DOM.debugBtn.classList.toggle("active",state.debugHitboxes);
  DOM.debugBtn.textContent=`HITBOX: ${state.debugHitboxes?"ON":"OFF"}`;toast(state.debugHitboxes?"HITBOX DEBUG ATIVO":"HITBOX DEBUG DESATIVADO");
});
$("sound-btn").addEventListener("click",()=>{state.sound=!state.sound;DOM.soundBtn.textContent=`SOM: ${state.sound?"ON":"OFF"}`;if(state.sound)audio.select()});

loadAssets().then(()=>{buildRoster();updateSelectUI();requestAnimationFrame(gameLoop)});
})();