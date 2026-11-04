import { Sudoku, Difficulty, peers, localDate, logicalStep, levelProfile } from './Sudoku';
import { forest } from './Forest';
export interface Painter { ellipse?(x:number,y:number,w:number,h:number,c:string):void; polygon?(points:number[][],c:string):void; clearText?():void; rect(x:number,y:number,w:number,h:number,color:string,r?:number):void; text(s:string,x:number,y:number,size:number,color:string,align?:'left'|'center'|'right',serif?:boolean):void; line(x:number,y:number,x2:number,y2:number,color:string,width:number):void }
interface Hit { x:number;y:number;w:number;h:number;run:()=>void }
const C={bg:'#0D191A',panel:'#1E302D',edge:'#0B1515',ink:'#D4DFD7',muted:'#93AB9E',white:'#E0E6DE',blue:'#3E624E',yellow:'#B6D9AF'};
export class GameView {
  game:Sudoku;hits:Hit[]=[];modal:'new'|'help'|null=null;toast='';toastUntil=0; hintStep: ReturnType<typeof logicalStep>;
  constructor(private persist:(s:string)=>void,saved?:string){let data;try{data=saved?JSON.parse(saved):undefined;}catch{}this.game=new Sudoku(data);}
  save(){this.persist(JSON.stringify(this.game.save()));}
  tick(){if(!this.game.paused&&!this.game.won&&!this.modal){this.game.seconds++;this.save();}}
  tap(x:number,y:number){const hit=[...this.hits].reverse().find(h=>x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h);if(hit){hit.run();this.save();}}
  private hit(x:number,y:number,w:number,h:number,run:()=>void){this.hits.push({x,y,w,h,run});}
  notify(s:string){this.toast=s;this.toastUntil=Date.now()+1800;}
  draw(p:Painter){
    this.hits=[];const g=this.game;
    const text=(s:string,x:number,y:number,size=16,c=C.white,align:'left'|'center'|'right'='left')=>p.text(s,x,y,size,c,align,false);
    const button=(s:string,x:number,y:number,w:number,h:number,run:()=>void,primary=false)=>{p.rect(x,y+4,w,h,C.edge,12);p.rect(x,y,w,h,primary?C.yellow:C.panel,12);text(s,x+w/2,y+h/2,16,primary?'#183426':C.white,'center');this.hit(x,y,w,h+4,run);};
    const icon=(kind:number,x:number,y:number,c:string)=>{
      const line=(a:number,b:number,d:number,e:number)=>p.line(x+a,y+b,x+d,y+e,c,2);
      if(kind===0){line(9,4,-7,4);line(-7,4,-2,-1);line(-7,4,-2,9);line(9,4,9,13);line(9,13,0,13);}
      if(kind===1){line(-8,5,1,-4);line(1,-4,10,5);line(10,5,1,14);line(1,14,-8,5);line(-2,14,11,14);}
      if(kind===2){line(-7,12,-5,4);line(-5,4,5,-6);line(5,-6,10,-1);line(10,-1,0,9);line(0,9,-7,12);line(-4,3,1,8);}
      if(kind===3){p.rect(x-7,y-7,14,17,c,7);p.rect(x-4,y+12,8,2,c,1);p.rect(x-3,y+16,6,2,c,1);}
    };
    forest(p,g.seconds*.7,g.won);
    text('‹',25,41,34);this.hit(16,18,44,44,()=>this.modal='new');text('森间数独',195,42,20,C.white,'center');
    text('?',344,41,22,C.muted,'center');this.hit(322,18,44,44,()=>this.modal='help');
    p.rect(168,94,190,69,'#35473E',23);p.rect(169,95,188,67,'#1C2C29',23);
    const greeting=g.won?'做到了！下一关见。':g.tutorial?'我陪你，先试着填一格。':g.paused?'等你回来。':'别着急，再看看空格。';
    text(g.won?'全部解开了':g.mode==='journey'?`第 ${g.level} 关 · ${levelProfile(g.level).label}`:'自由练习',184,115,13,C.yellow);
    text(greeting,184,142,12,C.white);
    p.rect(24,176,342,38,'#34483D',19);p.rect(25,177,340,36,'#182824',18);
    text(g.daily?'每日挑战':g.difficulty,43,196,13);text('已解',140,196,11,C.muted);text(`${g.progress.correct}/${g.progress.total}`,170,196,13,C.yellow);
    const time=`${String(g.seconds/60|0).padStart(2,'0')}:${String(g.seconds%60).padStart(2,'0')}`;
    text(time,302,196,14,C.white,'right');
    this.hit(310,174,50,44,()=>g.paused=!g.paused);
    if(!g.paused){p.rect(330,189,3,13,C.muted,1);p.rect(337,189,3,13,C.muted,1);}else text('▶',335,196,16,C.white,'center');
    text('成长进度',25,235,11,C.muted);p.rect(96,232,268,6,'#2C3B35',3);const progress=268*g.progress.correct/g.progress.total;if(progress>0)p.rect(96,232,progress,6,'#9BC7A3',3);
    p.rect(21,266,348,348,'#62786B',8);p.rect(22,267,346,346,'#162522',7);
    if(!g.paused&&!g.won){
      for(let i=0;i<81;i++){
        const x=24+i%9*38,y=270+(i/9|0)*38,selected=i===g.selected,related=g.selected>=0&&peers(i,g.selected),same=g.selected>=0&&!!g.board[i]&&g.board[i]===g.board[g.selected];
        p.rect(x,y,38,38,((i/27|0)+(i%9/3|0))%2?'#1A2927':'#182523');
        if(related)p.rect(x,y,38,38,'#20362C');
        if(same)p.rect(x,y,38,38,'#304B3A');
        if(g.conflict(i))p.rect(x,y,38,38,'#593632');
        if(selected){p.rect(x+1,y+1,36,36,'#6F9C78',6);p.rect(x+3,y+3,32,32,'#3C5E47',4);}
        if(g.board[i])text(String(g.board[i]),x+19,y+20,25,selected?'#FFFFFF':g.conflict(i)?'#EDA497':g.puzzle[i]?C.ink:'#A6CDB2','center');
        else g.notes[i].forEach(n=>text(String(n),x+7+(n-1)%3*12,y+7+((n-1)/3|0)*12,9,selected?C.white:'#91AA99','center'));
        this.hit(x,y,38,38,()=>{if(g.tutorial&&i!==g.tutorialIndex)return;g.selected=i;});
        if(g.tutorial&&i===g.tutorialIndex){p.line(x+3,y+3,x+35,y+3,'#E79D25',3);p.line(x+3,y+35,x+35,y+35,'#E79D25',3);p.line(x+3,y+3,x+3,y+35,'#E79D25',3);p.line(x+35,y+3,x+35,y+35,'#E79D25',3);}
      }
      for(let i=1;i<9;i++){const thick=i%3===0;p.line(24+i*38,270,24+i*38,612,thick?'#66796E':'#35443E',thick?1.2:0.6);p.line(24,270+i*38,366,270+i*38,thick?'#66796E':'#35443E',thick?1.2:0.6);}
    }else{
      text(g.won?'挑战成功！':'游戏暂停',195,331,30,C.ink,'center');
      text(g.won?`${g.difficulty} · 用时 ${time}`:'进度已保存',195,377,16,'#61799E','center');
      if(g.won){text('完成',195,273,25,'#D18B14','center');}
      button(g.won?(g.mode==='journey'?'下一关':'再玩一局'):'继续游戏',105,424,180,48,()=>{if(!g.won)g.paused=false;else if(g.mode==='journey'){g.nextLevel();this.hintStep=undefined;}else this.modal='new';},true);
    }
    const tools=[['撤销',()=>g.undo()],['擦除',()=>g.enter(0)],['笔记',()=>g.pencil=!g.pencil],['提示',()=>{if(g.tutorial)return;if(g.board.some((v,i)=>v&&v!==g.solution[i])){g.selected=g.board.findIndex((v,i)=>!!v&&v!==g.solution[i]);this.notify('先检查标出的数字，再继续推理');return;}if(this.hintStep&&g.selected===this.hintStep.index&&!g.board[this.hintStep.index]){const pencil=g.pencil;g.pencil=false;g.enter(this.hintStep.value);g.pencil=pencil;this.hintStep=undefined;}else{this.hintStep=logicalStep(g.board);if(this.hintStep)g.selected=this.hintStep.index;else this.notify('当前题目需要更多推理，试试笔记');}}]] as const;
    tools.forEach(([s,fn],i)=>{const x=38+i*88;p.rect(x,628,54,54,'#3A4B40',20);p.rect(x+1,629,52,52,i===2&&g.pencil?C.blue:'#1C2A26',19);icon(i,x+27,646,i===3?C.yellow:C.white);text(s,x+27,670,12,C.white,'center');this.hit(x-8,625,70,60,()=>{if(!g.paused&&!g.won&&!g.tutorial)fn();});});
    for(let n=1;n<=9;n++){
      const x=24+(n-1)*38.5,count=g.board.filter(v=>v===n).length,done=count===9&&g.board.every((v,i)=>v!==n||v===g.solution[i]);
      p.rect(x,697,34,45,'#4C6050',14);p.rect(x+1,698,32,44,done?'#14211E':g.tutorial&&g.selected===g.tutorialIndex&&g.solution[g.tutorialIndex]===n?'#638362':'#25362D',13);text(String(n),x+17,718,25,done?'#667E6D':'#BBD7BE','center');this.hit(x,693,34,54,()=>g.enter(n));
    }
    button(g.mode==='journey'?'重新选关':'闯关模式',24,747,164,48,()=>this.modal='new');button('每日挑战',202,747,164,48,()=>{if(g.daily&&g.date===localDate()){this.notify('正在进行今日挑战');return;}this.modal='new';},true);
    if(g.tutorial&&!g.paused){
      const i=g.tutorialIndex,step=[0,40,80].indexOf(i),n=g.solution[i];
      p.rect(24,622,342,63,'#304A39',14);
      const rule=['这一行只差一个数字','这一列只差一个数字','这个九宫格只差一个数字'][step];
      text(`${step+1} / 3   ${rule}`,38,641,14,C.yellow);
      text(g.selected===i?`点击下方亮起的 ${n}，填进空格`:'先点击金色边框里的空格',38,669,13,C.white);
    }else if(this.hintStep&&!g.board[this.hintStep.index]&&!g.paused&&!g.won){
      this.hits=this.hits.filter(h=>h.y<622||h.y>=693);const s=this.hintStep;p.rect(24,622,342,65,C.panel,10);
      text(s.technique==='single'?'排除法：这个空格只有一个候选数':'唯一位置：数字只能放在这里',36,638,12,C.yellow);
      text(`第${(s.index/9|0)+1}行，第${s.index%9+1}列 → ${s.value}`,36,669,15);
      button('填入',278,644,76,36,()=>{const pencil=g.pencil;g.pencil=false;g.selected=s.index;g.enter(s.value);g.pencil=pencil;this.hintStep=undefined;},true);
    }
    if(this.modal){
      p.clearText?.();p.rect(0,0,390,844,'#0B1429');this.hits=[];p.rect(20,201,350,450,C.edge,20);p.rect(20,195,350,450,C.panel,20);
      if(this.modal==='help'){
        text('怎么玩',44,242,26);['每行、每列、每个九宫格内，','填入 1—9，数字不能重复。','','点击空格，再点击数字键。','不确定的数字可以先记在笔记里。','红色格子代表数字重复。','提示会填入一个正确数字。','','游戏进度自动保存。'].forEach((s,i)=>text(s,44,289+i*29,14,C.muted));
        button('开始游戏',44,570,302,48,()=>this.modal=null,true);
      }else{
        text('开始挑战',44,242,26);text('开始新游戏将替换当前进度',44,278,13,C.muted);
        button(`继续闯关 · 第 ${g.unlocked} 关`,44,310,302,50,()=>{g.startLevel(g.unlocked);this.hintStep=undefined;this.modal=null;},true);
        button('重玩新手教学',44,372,302,50,()=>{g.startLevel(1);this.hintStep=undefined;this.modal=null;});
        button('自由练习 · 适中',44,434,302,50,()=>{g.start('适中');this.hintStep=undefined;this.modal=null;});
        button('每日挑战 · 适中',44,502,302,50,()=>{g.start('适中',true);this.modal=null;},true);button('返回游戏',44,570,302,48,()=>this.modal=null);
      }
    }
    if(this.toast&&Date.now()<this.toastUntil){p.rect(30,150,330,44,C.blue,12);text(this.toast,195,172,13,C.white,'center');}
  }
}
