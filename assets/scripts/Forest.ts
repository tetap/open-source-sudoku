import type { Painter } from './GameView';
/** Shared vector art: no external image requests, usable in Creator and browser. */
export function forest(p:Painter,phase:number,celebrate:boolean){
  const oval=(x:number,y:number,w:number,h:number,c:string)=>p.ellipse?.(x,y,w,h,c);
  const leaf=(x:number,y:number,s:number,flip=1)=>{
    p.polygon?.([[x,y],[x-22*s*flip,y-11*s],[x-31*s*flip,y-34*s],[x-7*s*flip,y-30*s],[x+5*s*flip,y-10*s]],'#375547');
    p.line(x,y,x-21*s*flip,y-25*s,'#638267',.7);
  };
  p.rect(0,0,390,844,'#0D191A');
  for(let i=0;i<16;i++)oval(195,150,480-i*22,390-i*17,['#0F1D1D','#101F1F','#112121','#122323'][i%4]);
  p.polygon?.([[0,0],[43,0],[12,80],[28,142],[0,193]],'#101F20');
  p.polygon?.([[390,66],[351,84],[328,133],[365,116],[390,120]],'#17282B');
  for(let i=0;i<4;i++)p.line(15+i*101,0,-25+i*95,92,'#263A35',.65);
  oval(66,184,186,48,'#0A1416');oval(73,177,172,35,'#293A35');oval(69,164,146,13,'#4D6544');
  for(let i=0;i<21;i++)p.line(i*6,163+(i%3)*2,i*6+3,157-(i%4)*2,'#6E8557',1.3);
  for(let i=0;i<10;i++){const x=18+(i*47)%359,y=74+(i*31)%97;oval(x,y,3+(i%3),3+(i%3),i%3===0?'#D3D9A4':'#526D57');}
  // Rounded seed spirit, with a leaf sprout and small lantern.
  const bob=Math.sin(phase)*2;
  oval(100,170,66,10,'#14221B');oval(86,147+bob,23,32,'#899D7D');oval(118,146+bob,23,32,'#839579');
  oval(101,139+bob,48,49,'#C1CFAB');oval(101,134+bob,43,39,'#D6DDBD');
  oval(88,162+bob,18,11,'#BECBA9');oval(113,163+bob,18,11,'#B1C29E');
  oval(92,137+bob,4,5,'#344C3E');oval(111,137+bob,4,5,'#344C3E');
  oval(87,145+bob,8,4,'#BBAD8C');oval(117,145+bob,8,4,'#BBAD8C');
  p.line(98,147+bob,102,149+bob,'#526B50',1.3);p.line(102,149+bob,106,146+bob,'#526B50',1.3);
  p.line(102,113+bob,102,91+bob,'#799664',2);leaf(102,106+bob,.7,-1);leaf(101,99+bob,.55,1);
  oval(139,153,30,30,'#3E4430');oval(139,153,20,20,'#80723F');oval(139,153,11,14,'#F4D58E');
  p.line(134,146,137,140,'#D3BD7A',1);p.line(137,140,142,146,'#D3BD7A',1);
  // Stream, stones and foreground foliage frame the controls without covering them.
  oval(196,828,330,42,'#1B302E');oval(196,826,245,23,'#2C4540');oval(196,826,171,12,'#42564A');oval(196,826,94,4,'#99A17A');oval(196,826,35,2,'#E7D8A1');
  for(const side of [0,1]){
    const x=side?390:0;
    oval(x,831,136,91,'#18292A');oval(x+(side?-34:34),814,70,30,'#293C39');
    for(let i=0;i<5;i++)leaf(x+(side?-1:1)*(12+i*13),844-(i%2)*16,.8+(i%3)*.18,side?-1:1);
    for(let i=0;i<3;i++)leaf(x,190-i*15,.65+i*.12,side?1:-1);
  }
  if(celebrate)for(let i=0;i<15;i++)oval(40+i*23,75+(i*41+phase*15)%105,3,3,'#D8D49A');
}
