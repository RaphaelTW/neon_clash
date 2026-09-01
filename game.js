(() => {
"use strict";

const TAU = Math.PI * 2;
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const selectScreen = document.getElementById("select-screen");
const fightScreen = document.getElementById("fight-screen");
const rosterEl = document.getElementById("roster");
const p1Preview = document.getElementById("preview-p1");
const p2Preview = document.getElementById("preview-p2");

const ui = {
  p1Name: document.getElementById("p1-name"),
  p1Title: document.getElementById("p1-title"),
  p1Stats: document.getElementById("p1-stats"),
  p2Name: document.getElementById("p2-name"),
  p2Title: document.getElementById("p2-title"),
  p2Stats: document.getElementById("p2-stats"),
  hudP1: document.getElementById("hud-p1-name"),
  hudP2: document.getElementById("hud-p2-name"),
  p1Health: document.getElementById("p1-health"),
  p2Health: document.getElementById("p2-health"),
  p1Mana: document.getElementById("p1-mana"),
  p2Mana: document.getElementById("p2-mana"),
  p1Stamina: document.getElementById("p1-stamina"),
  p2Stamina: document.getElementById("p2-stamina"),
  p1Special: document.getElementById("p1-special"),
  p2Special: document.getElementById("p2-special"),
  p1Rounds: document.getElementById("p1-rounds"),
  p2Rounds: document.getElementById("p2-rounds"),
  timer: document.getElementById("timer"),
  roundLabel: document.getElementById("round-label"),
  combatMessage: document.getElementById("combat-message"),
  resultOverlay: document.getElementById("result-overlay"),
  winnerText: document.getElementById("winner-text"),
  winnerSubtitle: document.getElementById("winner-subtitle"),
  pauseOverlay: document.getElementById("pause-overlay"),
  difficultyWrap: document.getElementById("difficulty-wrap"),
  p2Slot: document.getElementById("p2-slot-label")
};

const fighters = [
  {
    id:"kael", name:"KAEL IGNIS", title:"O Punho Solar",
    colors:["#ff5b35","#ffcf58","#251119"], accent:"#ff7a39",
    stats:{power:9,speed:7,defense:6,energy:7},
    style:"brawler", special:"SUPERNOVA",
    bio:"Brutal no corpo a corpo. Acumula calor e explode a curta distância."
  },
  {
    id:"nyx", name:"NYX VESPER", title:"A Lâmina do Vazio",
    colors:["#7c4dff","#ff4ee8","#0d1021"], accent:"#b96bff",
    stats:{power:7,speed:10,defense:5,energy:8},
    style:"assassin", special:"ECLIPSE",
    bio:"Extremamente rápida. Teleporta através do inimigo durante o especial."
  },
  {
    id:"bront", name:"BRONT TITAN", title:"O Colosso de Ferro",
    colors:["#97a4af","#4ed1ff","#12171b"], accent:"#90e8ff",
    stats:{power:10,speed:4,defense:10,energy:5},
    style:"tank", special:"TREMOR ÔMEGA",
    bio:"Lento, pesado e resistente. Seus golpes quebram defesa com facilidade."
  },
  {
    id:"aiko", name:"AIKO RAIJIN", title:"A Dançarina da Tempestade",
    colors:["#38d9ff","#f6f17a","#101629"], accent:"#56edff",
    stats:{power:6,speed:9,defense:6,energy:10},
    style:"caster", special:"TEMPESTADE RAIJIN",
    bio:"Domina raios e projéteis. Mana alta e controle de distância."
  },
  {
    id:"volt", name:"VOLT REX", title:"O Predador Cinético",
    colors:["#b6ff4d","#29ff9f","#0d1712"], accent:"#7dff69",
    stats:{power:8,speed:8,defense:7,energy:6},
    style:"rush", special:"OVERDRIVE",
    bio:"Pressão constante. Dash ofensivo e sequências rápidas."
  },
  {
    id:"morvane", name:"MORVANE", title:"O Arauto Carmesim",
    colors:["#ff315e","#ab183d","#16070d"], accent:"#ff315e",
    stats:{power:9,speed:6,defense:7,energy:9},
    style:"drain", special:"PACTO DE SANGUE",
    bio:"Converte parte do dano do especial em cura e domina o meio alcance."
  }
];

const arenas = {
  neon: {
    sky:["#080923","#181252"], ground:"#0b0f1d", glow:"#3ee7ff",
    draw(c,w,h,t){
      const grad=c.createLinearGradient(0,0,0,h); grad.addColorStop(0,"#080923");grad.addColorStop(.58,"#1a1250");grad.addColorStop(1,"#080912");c.fillStyle=grad;c.fillRect(0,0,w,h);
      c.globalAlpha=.35;
      for(let i=0;i<22;i++){
        const x=(i*131)%w, bh=80+(i*47)%250;
        c.fillStyle=i%2?"#111a33":"#170d31";
        c.fillRect(x,h*.63-bh,85,bh);
        c.fillStyle=i%3?"#23d8ff":"#ff2f9b";
        for(let y=h*.63-bh+15;y<h*.63-12;y+=25) c.fillRect(x+12,y,5,8);
      }
      c.globalAlpha=1;
      const sunY=h*.28; c.strokeStyle="rgba(255,61,154,.28)"; c.lineWidth=2;
      for(let y=sunY;y<sunY+170;y+=18){c.beginPath();c.moveTo(w*.38,y);c.lineTo(w*.62,y);c.stroke();}
      const floorY=h*.72;c.fillStyle="#080b15";c.fillRect(0,floorY,w,h-floorY);
      c.strokeStyle="rgba(68,231,255,.18)";c.lineWidth=1;
      for(let y=floorY;y<h;y+=34){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
      for(let x=-w;x<w*2;x+=90){c.beginPath();c.moveTo(w/2+(x-w/2)*.1,floorY);c.lineTo(x,h);c.stroke();}
      c.fillStyle="rgba(68,231,255,.08)";c.fillRect(0,floorY-4,w,4);
    }
  },
  temple: {
    draw(c,w,h,t){
      const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,"#060918");g.addColorStop(.62,"#151b35");g.addColorStop(1,"#080b10");c.fillStyle=g;c.fillRect(0,0,w,h);
      c.fillStyle="#e8efff";c.beginPath();c.arc(w*.5,h*.22,85,0,TAU);c.fill();
      c.fillStyle="#d6dbed";c.beginPath();c.arc(w*.53,h*.19,84,0,TAU);c.fill();
      c.globalAlpha=.4;c.fillStyle="#111729";
      for(let i=0;i<9;i++){let x=i*w/8;c.fillRect(x-10,h*.40,20,h*.32);c.fillRect(x-30,h*.4,60,12);}
      c.globalAlpha=1;c.fillStyle="#0b101b";c.beginPath();c.moveTo(0,h*.58);for(let x=0;x<=w;x+=80)c.lineTo(x,h*.51-((x/80)%2)*30);c.lineTo(w,h*.74);c.lineTo(0,h*.74);c.fill();
      c.fillStyle="#0a0b0f";c.fillRect(0,h*.72,w,h*.28);
      c.strokeStyle="rgba(130,160,255,.16)";
      for(let x=0;x<w;x+=80){c.beginPath();c.moveTo(x,h*.72);c.lineTo(x+40,h);c.stroke();}
    }
  },
  forge: {
    draw(c,w,h,t){
      const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,"#1c0909");g.addColorStop(.55,"#39120c");g.addColorStop(1,"#090706");c.fillStyle=g;c.fillRect(0,0,w,h);
      for(let i=0;i<20;i++){const x=(i*177 + t*.02)%w, y=h*.18+(i*71)%(h*.42);c.fillStyle="rgba(255,119,48,.25)";c.beginPath();c.arc(x,y,3+(i%5),0,TAU);c.fill();}
      c.fillStyle="#120c09";c.fillRect(0,h*.72,w,h*.28);
      c.fillStyle="#e54a18";c.fillRect(0,h*.72-5,w,5);
      c.strokeStyle="rgba(255,116,43,.16)";
      for(let x=0;x<w;x+=95){c.beginPath();c.moveTo(x,h*.72);c.lineTo(x-70,h);c.stroke();}
      c.fillStyle="#22100b";for(let i=0;i<7;i++){let x=i*w/6;c.fillRect(x-30,h*.33,60,h*.39);c.fillStyle="#ff6f29";c.fillRect(x-20,h*.38,40,5);c.fillStyle="#22100b";}
    }
  }
};

const state = {
  screen:"select", mode:"cpu", p1Index:0, p2Index:1, picking:"p1",
  arena:"neon", difficulty:"normal", paused:false, running:false,
  round:1, p1Rounds:0, p2Rounds:0, timer:99, timerAcc:0, roundLock:false,
  projectiles:[], particles:[], shakes:0, lastTime:0, aiClock:0
};

const keys = {};
let P1=null, P2=null;

class Fighter {
  constructor(def, side){
    this.def=def;this.side=side;
    this.x=side===1?430:1170; this.y=620;
    this.vx=0;this.vy=0;this.w=92;this.h=190;
    this.facing=side===1?1:-1;
    this.health=100;this.mana=100;this.stamina=100;this.special=0;
    this.grounded=true;this.blocking=false;this.attack=null;this.attackTimer=0;
    this.hitFlash=0;this.stun=0;this.dashTimer=0;this.invuln=0;this.combo=0;this.comboTimer=0;
    this.cooldowns={power:0,special:0,dash:0};
    this.dead=false;
  }
  reset(){
    this.x=this.side===1?430:1170;this.y=620;this.vx=this.vy=0;
    this.health=100;this.mana=100;this.stamina=100;this.special=0;
    this.blocking=false;this.attack=null;this.attackTimer=0;this.stun=0;this.dead=false;this.combo=0;
  }
  update(dt, opponent){
    const s=dt/16.666;
    if(this.dead)return;
    this.hitFlash=Math.max(0,this.hitFlash-dt);
    this.stun=Math.max(0,this.stun-dt);
    this.invuln=Math.max(0,this.invuln-dt);
    this.dashTimer=Math.max(0,this.dashTimer-dt);
    for(const k in this.cooldowns)this.cooldowns[k]=Math.max(0,this.cooldowns[k]-dt);

    this.comboTimer-=dt;if(this.comboTimer<=0)this.combo=0;
    this.mana=Math.min(100,this.mana+0.018*dt);
    this.stamina=Math.min(100,this.stamina+(this.blocking?.014:.026)*dt);

    if(!this.grounded){this.vy+=0.78*s;this.y+=this.vy*s;}
    if(this.y>=620){this.y=620;this.vy=0;this.grounded=true;}
    this.x+=this.vx*s;this.vx*=Math.pow(.78,s);
    this.x=Math.max(80,Math.min(1520,this.x));
    if(Math.abs(opponent.x-this.x)>5 && !this.attack) this.facing=opponent.x>this.x?1:-1;

    if(this.attack){
      this.attackTimer-=dt;
      if(!this.attack.didHit && this.attackTimer < this.attack.activeAt){
        this.tryHit(opponent,this.attack);
        this.attack.didHit=true;
      }
      if(this.attackTimer<=0)this.attack=null;
    }
  }
  move(dir){
    if(this.stun>0 || this.attack || this.blocking || this.dead)return;
    const speed=(4.2 + this.def.stats.speed*.28);
    this.vx=dir*speed;
  }
  jump(){
    if(this.grounded && this.stun<=0 && !this.attack && !this.blocking && this.stamina>=10){
      this.vy=-14.5;this.grounded=false;this.stamina-=10;
    }
  }
  setBlock(v){
    if(this.stun>0 || this.attack || this.dead){this.blocking=false;return;}
    if(v && this.stamina>2){this.blocking=true;this.vx*=.5}else this.blocking=false;
  }
  punch(){
    if(!this.canAct() || this.stamina<8)return;
    this.stamina-=8;this.attack={type:"punch",timer:240,activeAt:135,range:92,damage:5+this.def.stats.power*.55,knock:4,didHit:false};this.attackTimer=240;
  }
  kick(){
    if(!this.canAct() || this.stamina<14)return;
    this.stamina-=14;this.attack={type:"kick",timer:360,activeAt:210,range:122,damage:8+this.def.stats.power*.72,knock:7,didHit:false};this.attackTimer=360;
  }
  power(opponent){
    if(!this.canAct() || this.mana<28 || this.cooldowns.power>0)return;
    this.mana-=28;this.cooldowns.power=650;
    const y=this.y-this.h*.56;
    const speed=12 + this.def.stats.speed*.16;
    const behaviors={
      brawler:{size:24,damage:13,speed:speed,life:1000,kind:"fireball"},
      assassin:{size:18,damage:11,speed:speed*1.35,life:900,kind:"void"},
      tank:{size:34,damage:16,speed:speed*.72,life:1200,kind:"rock"},
      caster:{size:19,damage:12,speed:speed*1.18,life:1250,kind:"lightning"},
      rush:{size:22,damage:12,speed:speed*1.5,life:820,kind:"kinetic"},
      drain:{size:27,damage:14,speed:speed*.88,life:1200,kind:"blood"}
    };
    const b=behaviors[this.def.style];
    state.projectiles.push({owner:this,x:this.x+this.facing*55,y,vx:this.facing*b.speed,size:b.size,damage:b.damage,life:b.life,kind:b.kind,color:this.def.accent});
    burst(this.x+this.facing*55,y,this.def.accent,10);
  }
  specialMove(opponent){
    if(!this.canAct() || this.special<100 || this.cooldowns.special>0)return;
    this.special=0;this.cooldowns.special=1200;this.invuln=500;
    announce(this.def.special);
    const style=this.def.style;
    if(style==="brawler"){
      this.attack={type:"special",timer:720,activeAt:470,range:220,damage:28,knock:18,didHit:false};this.attackTimer=720;
      burst(this.x,this.y-85,this.def.accent,46,2.4);
    } else if(style==="assassin"){
      const start=this.x;this.x=opponent.x-opponent.facing*100;this.facing=opponent.x>this.x?1:-1;
      this.attack={type:"special",timer:620,activeAt:410,range:165,damage:27,knock:13,didHit:false};this.attackTimer=620;
      burst(start,this.y-95,this.def.accent,30,2.2);burst(this.x,this.y-95,this.def.accent,30,2.2);
    } else if(style==="tank"){
      this.attack={type:"special",timer:800,activeAt:510,range:330,damage:31,knock:22,didHit:false};this.attackTimer=800;
      for(let i=0;i<30;i++) state.particles.push({x:this.x+(Math.random()-.5)*480,y:690,vx:(Math.random()-.5)*3,vy:-Math.random()*8-2,life:800,size:4+Math.random()*10,color:this.def.accent});
      state.shakes=18;
    } else if(style==="caster"){
      for(let i=0;i<5;i++){
        setTimeout(()=>{if(state.running && !state.paused){state.projectiles.push({owner:this,x:opponent.x+(i-2)*70,y:190,vx:0,vy:17,size:22,damage:6,life:900,kind:"lightning",color:this.def.accent});burst(opponent.x+(i-2)*70,250,this.def.accent,8);}},i*85);
      }
      this.attack={type:"cast",timer:640,activeAt:0,range:0,damage:0,knock:0,didHit:true};this.attackTimer=640;
    } else if(style==="rush"){
      this.vx=this.facing*26;this.dashTimer=480;this.invuln=250;
      this.attack={type:"special",timer:520,activeAt:300,range:180,damage:26,knock:17,didHit:false};this.attackTimer=520;
      burst(this.x,this.y-90,this.def.accent,35,2.8);
    } else if(style==="drain"){
      this.attack={type:"special",timer:720,activeAt:450,range:240,damage:29,knock:12,didHit:false,drain:true};this.attackTimer=720;
      burst(this.x,this.y-100,this.def.accent,42,2.5);
    }
  }
  dash(){
    if(!this.canAct() || this.stamina<22 || this.cooldowns.dash>0)return;
    this.stamina-=22;this.cooldowns.dash=500;this.dashTimer=180;this.invuln=130;this.vx=this.facing*20;
    burst(this.x,this.y-70,this.def.accent,12,1.2);
  }
  canAct(){return this.stun<=0 && !this.attack && !this.blocking && !this.dead}
  tryHit(opponent,a){
    const dy=Math.abs((this.y-this.h*.48)-(opponent.y-opponent.h*.48));
    if(Math.abs(opponent.x-this.x) <= a.range + opponent.w*.42 && dy<150) opponent.receiveHit(a.damage,a.knock,this,a);
  }
  receiveHit(dmg,knock,attacker,attackMeta={}){
    if(this.invuln>0 || this.dead)return;
    let final=dmg;
    if(this.blocking && this.stamina>0){
      final*=.28;this.stamina=Math.max(0,this.stamina-dmg*1.8);
      if(this.stamina<=0){this.blocking=false;this.stun=520;announce("GUARD BREAK");}
    } else {
      this.stun=Math.min(650,150+dmg*8);
      this.special=Math.min(100,this.special+dmg*1.4);
      attacker.special=Math.min(100,attacker.special+dmg*1.8);
      attacker.combo++;attacker.comboTimer=850;
    }
    this.health=Math.max(0,this.health-final);
    this.hitFlash=110;this.vx=attacker.facing*knock;
    if(!this.grounded)this.vy-=2;
    if(attackMeta.drain) attacker.health=Math.min(100,attacker.health+final*.35);
    burst(this.x,this.y-this.h*.5,attacker.def.accent,16,1.7);
    state.shakes=Math.min(20,state.shakes+Math.max(2,dmg*.35));
    if(this.health<=0){this.dead=true;this.vx=attacker.facing*16;this.vy=-8;this.grounded=false;}
  }
  draw(c, t){
    drawFighter(c,this.def,this.x,this.y,this.facing,1,this, t);
  }
}

function drawFighter(c,def,x,y,facing,scale=1,instance=null,t=0){
  c.save();c.translate(x,y);c.scale(facing*scale,scale);

  if(instance?.hitFlash>0){c.shadowColor="#fff";c.shadowBlur=28}
  if(instance?.blocking){
    c.strokeStyle=def.accent;c.globalAlpha=.5;c.lineWidth=6;c.beginPath();c.arc(0,-95,76,-Math.PI*.7,Math.PI*.7);c.stroke();c.globalAlpha=1;
  }
  if(instance?.special>=100){
    c.strokeStyle=def.accent;c.globalAlpha=.35;c.lineWidth=3;
    c.beginPath();c.arc(0,-98,86+Math.sin(t*.01)*5,0,TAU);c.stroke();c.globalAlpha=1;
  }

  const bob=instance?.grounded!==false?Math.sin(t*.006+(x*.01))*2:0;
  c.translate(0,bob);

  // shadow
  c.save();c.scale(1/facing,1);c.globalAlpha=.32;c.fillStyle="#000";c.beginPath();c.ellipse(0,3,56,13,0,0,TAU);c.fill();c.restore();

  // legs
  c.lineCap="round";c.lineWidth=22;c.strokeStyle=def.colors[2];
  c.beginPath();c.moveTo(-17,-65);c.lineTo(-24,-10);c.stroke();
  c.beginPath();c.moveTo(17,-65);c.lineTo(26,-10);c.stroke();

  // boots
  c.lineWidth=17;c.strokeStyle=def.colors[0];
  c.beginPath();c.moveTo(-25,-9);c.lineTo(-42,-3);c.stroke();
  c.beginPath();c.moveTo(26,-9);c.lineTo(46,-3);c.stroke();

  // torso
  const torso=c.createLinearGradient(-45,-150,45,-60);torso.addColorStop(0,def.colors[0]);torso.addColorStop(1,def.colors[2]);
  c.fillStyle=torso;c.beginPath();c.moveTo(-44,-150);c.quadraticCurveTo(0,-174,44,-150);c.lineTo(35,-65);c.lineTo(-35,-65);c.closePath();c.fill();

  // chest emblem
  c.strokeStyle=def.colors[1];c.lineWidth=5;c.beginPath();
  if(def.style==="brawler"){c.moveTo(-16,-125);c.lineTo(0,-104);c.lineTo(16,-125)}
  else if(def.style==="assassin"){c.arc(0,-116,17,.2,Math.PI*1.8)}
  else if(def.style==="tank"){c.rect(-18,-133,36,32)}
  else if(def.style==="caster"){c.moveTo(0,-136);c.lineTo(-14,-111);c.lineTo(12,-118);c.lineTo(0,-96)}
  else if(def.style==="rush"){c.moveTo(-20,-128);c.lineTo(7,-113);c.lineTo(-5,-102);c.lineTo(22,-88)}
  else {c.moveTo(-17,-127);c.quadraticCurveTo(0,-95,17,-127);c.quadraticCurveTo(0,-142,-17,-127)}
  c.stroke();

  // arms — attack pose
  c.strokeStyle=def.colors[0];c.lineWidth=20;
  let handX=54,handY=-104;
  if(instance?.attack){
    const progress=instance.attackTimer/(instance.attack.timer||1);
    if(instance.attack.type==="punch"){handX=95;handY=-118;}
    else if(instance.attack.type==="kick"){handX=38;handY=-105;}
    else if(instance.attack.type==="special"){handX=112;handY=-112;}
  }
  c.beginPath();c.moveTo(35,-136);c.lineTo(handX,handY);c.stroke();
  c.beginPath();c.moveTo(-35,-136);c.lineTo(-54,-97);c.stroke();

  // extra kick leg
  if(instance?.attack?.type==="kick"){
    c.strokeStyle=def.colors[2];c.lineWidth=22;c.beginPath();c.moveTo(18,-69);c.lineTo(90,-67);c.stroke();
    c.strokeStyle=def.colors[0];c.lineWidth=17;c.beginPath();c.moveTo(87,-67);c.lineTo(112,-64);c.stroke();
  }

  // head
  c.fillStyle="#d2a17f";c.beginPath();c.arc(0,-184,29,0,TAU);c.fill();
  // mask/hair
  c.fillStyle=def.colors[2];c.beginPath();c.arc(0,-194,30,Math.PI,TAU);c.fill();
  if(def.style==="assassin"){c.fillRect(-31,-194,62,16)}
  if(def.style==="tank"){c.fillStyle=def.colors[0];c.fillRect(-29,-194,58,18)}
  if(def.style==="caster"){c.fillStyle=def.colors[1];c.beginPath();c.moveTo(-28,-200);c.lineTo(-10,-235);c.lineTo(0,-201);c.lineTo(16,-238);c.lineTo(27,-197);c.fill()}
  if(def.style==="rush"){c.fillStyle=def.colors[1];for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*10,-208);c.lineTo(i*13,-239-Math.abs(i)*3);c.lineTo(i*10+8,-207);c.fill();}}
  if(def.style==="morvane"){}

  // eye glow
  c.fillStyle=def.colors[1];c.shadowColor=def.colors[1];c.shadowBlur=10;c.fillRect(9,-188,8,3);c.shadowBlur=0;

  // power hand
  if(instance?.attack?.type==="special"){
    c.globalAlpha=.7;c.fillStyle=def.accent;c.shadowColor=def.accent;c.shadowBlur=24;c.beginPath();c.arc(handX+11,handY,24,0,TAU);c.fill();c.shadowBlur=0;c.globalAlpha=1;
  }
  c.restore();
}

function burst(x,y,color,count=12,power=1){
  for(let i=0;i<count;i++){
    const a=Math.random()*TAU, sp=(1+Math.random()*6)*power;
    state.particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:350+Math.random()*500,size:2+Math.random()*6,color});
  }
}

function updateParticles(dt){
  state.particles=state.particles.filter(p=>{
    p.life-=dt;p.x+=p.vx*dt/16.666;p.y+=p.vy*dt/16.666;p.vy+=.12*dt/16.666;return p.life>0;
  });
}
function drawParticles(c){
  for(const p of state.particles){
    c.globalAlpha=Math.min(1,p.life/300);c.fillStyle=p.color;c.beginPath();c.arc(p.x,p.y,p.size,0,TAU);c.fill();
  } c.globalAlpha=1;
}
function updateProjectiles(dt){
  for(const p of state.projectiles){
    p.life-=dt;p.x+=(p.vx||0)*dt/16.666;p.y+=(p.vy||0)*dt/16.666;
    const target=p.owner===P1?P2:P1;
    if(p.life>0 && !target.dead && Math.abs(p.x-target.x)<p.size+target.w*.45 && Math.abs(p.y-(target.y-target.h*.48))<p.size+target.h*.45){
      target.receiveHit(p.damage,6,p.owner);p.life=0;
    }
  }
  state.projectiles=state.projectiles.filter(p=>p.life>0 && p.x>-100 && p.x<1700 && p.y<1000);
}
function drawProjectiles(c,t){
  for(const p of state.projectiles){
    c.save();c.translate(p.x,p.y);c.shadowColor=p.color;c.shadowBlur=24;c.fillStyle=p.color;
    if(p.kind==="lightning"){
      c.lineWidth=8;c.strokeStyle=p.color;c.beginPath();c.moveTo(0,-40);for(let y=-30;y<=40;y+=14)c.lineTo((Math.random()-.5)*24,y);c.stroke();
    } else if(p.kind==="rock"){
      c.rotate(t*.006);c.beginPath();for(let i=0;i<7;i++){let a=i/7*TAU,r=p.size*(.78+Math.random()*.22);let px=Math.cos(a)*r,py=Math.sin(a)*r;i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.fill();
    } else {
      const g=c.createRadialGradient(0,0,2,0,0,p.size);g.addColorStop(0,"#fff");g.addColorStop(.25,p.color);g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.beginPath();c.arc(0,0,p.size*1.5,0,TAU);c.fill();
    }
    c.restore();
  }
}

function announce(text){
  ui.combatMessage.textContent=text;
  ui.combatMessage.classList.remove("show");
  void ui.combatMessage.offsetWidth;
  ui.combatMessage.classList.add("show");
}

function renderPortrait(canvasEl,def,flip=false){
  const c=canvasEl.getContext("2d"),w=canvasEl.width,h=canvasEl.height;
  c.clearRect(0,0,w,h);
  const g=c.createRadialGradient(w*.5,h*.35,10,w*.5,h*.5,w*.7);g.addColorStop(0,def.colors[0]+"44");g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.fillRect(0,0,w,h);
  c.save();c.translate(w/2,h*.93);drawFighter(c,def,0,0,flip?-1:1,1.55,null,performance.now());c.restore();
}

function statHTML(def){
  return ["power","speed","defense","energy"].map(k=>{
    const names={power:"PODER",speed:"VELOC.",defense:"DEFESA",energy:"ENERGIA"};
    return `<div class="stat"><span>${names[k]}</span><div class="stat-track"><div class="stat-fill" style="width:${def.stats[k]*10}%"></div></div><b>${def.stats[k]}</b></div>`;
  }).join("");
}

function updateSelectUI(){
  const a=fighters[state.p1Index],b=fighters[state.p2Index];
  ui.p1Name.textContent=a.name;ui.p1Title.textContent=a.title;ui.p1Stats.innerHTML=statHTML(a);
  ui.p2Name.textContent=b.name;ui.p2Title.textContent=b.title;ui.p2Stats.innerHTML=statHTML(b);
  renderPortrait(p1Preview,a,false);renderPortrait(p2Preview,b,true);
  [...rosterEl.children].forEach((el,i)=>{
    el.classList.toggle("selected-p1",i===state.p1Index);
    el.classList.toggle("selected-p2",i===state.p2Index);
  });
}

function buildRoster(){
  fighters.forEach((f,i)=>{
    const btn=document.createElement("button");btn.className="fighter-choice";btn.dataset.index=i;
    const cv=document.createElement("canvas");cv.width=220;cv.height=160;btn.appendChild(cv);
    const label=document.createElement("span");label.className="choice-label";label.textContent=f.name;btn.appendChild(label);
    btn.addEventListener("click",()=>{
      if(state.mode==="cpu"){
        if(state.picking==="p1"){state.p1Index=i;state.picking="p2";} else {state.p2Index=i;state.picking="p1";}
      } else {
        if(state.picking==="p1"){state.p1Index=i;state.picking="p2";} else {state.p2Index=i;state.picking="p1";}
      }
      updateSelectUI();
    });
    rosterEl.appendChild(btn);renderPortrait(cv,f,false);
  });
}

function switchScreen(name){
  state.screen=name;
  selectScreen.classList.toggle("active",name==="select");
  fightScreen.classList.toggle("active",name==="fight");
}

function startFight(rematch=false){
  state.arena=document.getElementById("arena-select").value;
  state.difficulty=document.getElementById("difficulty").value;
  if(!rematch){state.p1Rounds=0;state.p2Rounds=0;state.round=1;}
  P1=new Fighter(fighters[state.p1Index],1);P2=new Fighter(fighters[state.p2Index],2);
  state.timer=99;state.timerAcc=0;state.projectiles=[];state.particles=[];state.roundLock=true;state.paused=false;state.running=true;
  ui.hudP1.textContent=P1.def.name;ui.hudP2.textContent=P2.def.name;
  ui.resultOverlay.classList.add("hidden");ui.pauseOverlay.classList.add("hidden");
  switchScreen("fight");updateHUD();
  announce(`ROUND ${state.round}`);
  setTimeout(()=>{if(state.screen==="fight"){announce("FIGHT!");state.roundLock=false;}},850);
}

function resetRound(){
  state.round++;
  P1.reset();P2.reset();state.timer=99;state.timerAcc=0;state.projectiles=[];state.particles=[];state.roundLock=true;
  updateHUD();announce(`ROUND ${state.round}`);
  setTimeout(()=>{if(state.screen==="fight"){announce("FIGHT!");state.roundLock=false;}},850);
}

function finishRound(){
  if(state.roundLock)return;state.roundLock=true;
  let winner;
  if(P1.health===P2.health) winner=0;
  else winner=P1.health>P2.health?1:2;
  if(winner===1)state.p1Rounds++;if(winner===2)state.p2Rounds++;
  announce(winner?`PLAYER ${winner} WINS`:"DRAW");
  updateHUD();
  setTimeout(()=>{
    if(state.p1Rounds>=2 || state.p2Rounds>=2){
      state.running=false;
      const champ=state.p1Rounds>state.p2Rounds?P1:P2;
      ui.winnerText.textContent=`${champ.def.name} VENCEU`;
      ui.winnerSubtitle.textContent=`${champ.def.special} decidiu o combate.`;
      ui.resultOverlay.classList.remove("hidden");
    } else resetRound();
  },1200);
}

function updateHUD(){
  const set=(el,v)=>el.style.width=`${Math.max(0,Math.min(100,v))}%`;
  set(ui.p1Health,P1?.health||0);set(ui.p2Health,P2?.health||0);set(ui.p1Mana,P1?.mana||0);set(ui.p2Mana,P2?.mana||0);
  set(ui.p1Stamina,P1?.stamina||0);set(ui.p2Stamina,P2?.stamina||0);set(ui.p1Special,P1?.special||0);set(ui.p2Special,P2?.special||0);
  ui.timer.textContent=String(Math.ceil(state.timer)).padStart(2,"0");ui.roundLabel.textContent=`ROUND ${state.round}`;
  ui.p1Rounds.textContent=`${state.p1Rounds>=1?"●":"○"} ${state.p1Rounds>=2?"●":"○"}`;
  ui.p2Rounds.textContent=`${state.p2Rounds>=2?"●":"○"} ${state.p2Rounds>=1?"●":"○"}`;
}

function handleHumanControls(){
  if(state.roundLock||state.paused||!state.running)return;
  P1.setBlock(keys["KeyS"]);
  if(keys["KeyA"])P1.move(-1);if(keys["KeyD"])P1.move(1);
  if(state.mode==="local"){
    P2.setBlock(keys["ArrowDown"]);
    if(keys["ArrowLeft"])P2.move(-1);if(keys["ArrowRight"])P2.move(1);
  }
}

function pressed(code){
  if(state.screen!=="fight"||state.paused||state.roundLock||!state.running)return;
  if(code==="KeyW")P1.jump();if(code==="KeyJ")P1.punch();if(code==="KeyK")P1.kick();if(code==="KeyL")P1.power(P2);if(code==="KeyU")P1.specialMove(P2);if(code==="KeyI")P1.dash();
  if(state.mode==="local"){
    if(code==="ArrowUp")P2.jump();if(code==="Digit1")P2.punch();if(code==="Digit2")P2.kick();if(code==="Digit3")P2.power(P1);if(code==="Digit4")P2.specialMove(P1);if(code==="Digit5")P2.dash();
  }
}

function updateAI(dt){
  if(state.mode!=="cpu"||state.roundLock||state.paused||!state.running||P2.dead)return;
  state.aiClock-=dt;if(state.aiClock>0)return;
  const dif={easy:{tick:270,skill:.34},normal:{tick:170,skill:.57},hard:{tick:95,skill:.78}}[state.difficulty];
  state.aiClock=dif.tick+Math.random()*dif.tick*.65;
  const dist=Math.abs(P1.x-P2.x),r=Math.random();
  P2.setBlock(false);
  if(P2.stun>0)return;
  if(P2.special>=100 && r<dif.skill*.55){P2.specialMove(P1);return;}
  if(P2.health<35 && r<.18+dif.skill*.15){P2.setBlock(true);return;}
  if(dist>330){
    if(P2.mana>=28 && r<.38+dif.skill*.2)P2.power(P1);else P2.move(P1.x>P2.x?1:-1);
  } else if(dist>145){
    if(r<.28)P2.dash();else if(r<.58)P2.move(P1.x>P2.x?1:-1);else P2.power(P1);
  } else {
    if(r<.12)P2.setBlock(true);
    else if(r<.48)P2.punch();
    else if(r<.78)P2.kick();
    else if(r<.9)P2.dash();
    else P2.jump();
  }
}

function drawArena(t){
  const shakeX=(Math.random()-.5)*state.shakes,shakeY=(Math.random()-.5)*state.shakes;
  ctx.save();ctx.translate(shakeX,shakeY);
  arenas[state.arena].draw(ctx,canvas.width,canvas.height,t);
  drawProjectiles(ctx,t);P1.draw(ctx,t);P2.draw(ctx,t);drawParticles(ctx);
  if(P1.combo>=2){ctx.font="800 34px Orbitron";ctx.fillStyle=P1.def.accent;ctx.textAlign="left";ctx.fillText(`${P1.combo} HIT`,95,370);}
  if(P2.combo>=2){ctx.font="800 34px Orbitron";ctx.fillStyle=P2.def.accent;ctx.textAlign="right";ctx.fillText(`${P2.combo} HIT`,1505,370);}
  ctx.restore();state.shakes*=.82;if(state.shakes<.3)state.shakes=0;
}

function loop(t){
  requestAnimationFrame(loop);
  if(state.screen!=="fight"||!P1||!P2)return;
  const dt=Math.min(34,t-state.lastTime||16.666);state.lastTime=t;
  if(!state.paused && state.running){
    handleHumanControls();updateAI(dt);
    if(!state.roundLock){
      P1.update(dt,P2);P2.update(dt,P1);updateProjectiles(dt);updateParticles(dt);
      state.timerAcc+=dt;
      if(state.timerAcc>=1000){state.timer-=state.timerAcc/1000;state.timerAcc=0;}
      if(state.timer<=0){state.timer=0;finishRound();}
      if(P1.health<=0||P2.health<=0)finishRound();
    } else {updateParticles(dt);}
    updateHUD();
  }
  drawArena(t);
}

window.addEventListener("keydown",e=>{
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault();
  if(!keys[e.code])pressed(e.code);keys[e.code]=true;
  if(e.code==="Escape" && state.screen==="fight")togglePause();
  if(e.code==="Enter" && state.screen==="select")startFight();
});
window.addEventListener("keyup",e=>{keys[e.code]=false;if(e.code==="KeyS"&&P1)P1.setBlock(false);if(e.code==="ArrowDown"&&P2)P2.setBlock(false);});

document.querySelectorAll(".mode-btn").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".mode-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");
  state.mode=btn.dataset.mode;ui.difficultyWrap.style.opacity=state.mode==="cpu"?"1":".35";ui.p2Slot.textContent=state.mode==="cpu"?"CPU":"PLAYER 2";
}));

document.getElementById("fight-btn").addEventListener("click",()=>startFight());
document.getElementById("back-btn").addEventListener("click",()=>{state.running=false;switchScreen("select");updateSelectUI();});
document.getElementById("pause-btn").addEventListener("click",togglePause);
document.getElementById("resume-btn").addEventListener("click",togglePause);
document.getElementById("pause-select-btn").addEventListener("click",()=>{state.running=false;state.paused=false;ui.pauseOverlay.classList.add("hidden");switchScreen("select");});
document.getElementById("rematch-btn").addEventListener("click",()=>startFight(false));
document.getElementById("result-select-btn").addEventListener("click",()=>{switchScreen("select");updateSelectUI();});
document.getElementById("arena-select").addEventListener("change",e=>state.arena=e.target.value);
document.getElementById("difficulty").addEventListener("change",e=>state.difficulty=e.target.value);

function togglePause(){
  if(!state.running)return;
  state.paused=!state.paused;ui.pauseOverlay.classList.toggle("hidden",!state.paused);
}

buildRoster();updateSelectUI();requestAnimationFrame(loop);
})();