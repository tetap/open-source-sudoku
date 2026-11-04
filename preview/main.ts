import { GameView, Painter } from '../assets/scripts/GameView';
const canvas=document.querySelector('canvas')!;
const ctx=canvas.getContext('2d')!;
const key='shujian.save.v1';
let saved:string|undefined;try{saved=localStorage.getItem(key)||undefined;}catch{}
const app=new GameView(s=>{try{localStorage.setItem(key,s);}catch{}},saved);
const painter:Painter={
  ellipse(x,y,w,h,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,w/2,h/2,0,0,Math.PI*2);ctx.fill();},
  polygon(points,c){ctx.fillStyle=c;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();},
  rect(x,y,w,h,c,r=0){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();},
  line(x,y,x2,y2,c,w){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();},
  text(s,x,y,size,c,align='left',serif=false){ctx.fillStyle=c;ctx.font=`${size}px ${serif?'Georgia, "Songti SC", serif':'"PingFang SC", "Microsoft YaHei", sans-serif'}`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(s,x,y);}
};
function resize(){const dpr=Math.min(devicePixelRatio||1,3);canvas.width=390*dpr;canvas.height=844*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);app.draw(painter);}
canvas.addEventListener('pointerup',e=>{const r=canvas.getBoundingClientRect();app.tap((e.clientX-r.left)*390/r.width,(e.clientY-r.top)*844/r.height);app.draw(painter);});
document.addEventListener('keydown',e=>{if(app.modal)return;if(/^[1-9]$/.test(e.key))app.game.enter(Number(e.key));else if(e.key==='Backspace'||e.key==='Delete')app.game.enter(0);else if(e.key==='n')app.game.pencil=!app.game.pencil;else return;app.save();app.draw(painter);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){app.game.paused=true;app.save();}app.draw(painter);});
window.addEventListener('resize',resize);resize();setInterval(()=>{app.tick();app.draw(painter);},1000);
