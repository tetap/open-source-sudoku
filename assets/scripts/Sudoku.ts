export type Difficulty = '轻松' | '适中' | '挑战';
export interface Snapshot { board: number[]; notes: number[][] }
export interface Save { level?: number; unlocked?: number; mode?: 'journey' | 'free'; version: 1; puzzle: number[]; solution: number[]; board: number[]; notes: number[][]; seconds: number; difficulty: Difficulty; daily: boolean; date: string }
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
export function peers(a: number, b: number): boolean {
  return (a / 9 | 0) === (b / 9 | 0) || a % 9 === b % 9 || (a / 27 | 0) === (b / 27 | 0) && (a % 9 / 3 | 0) === (b % 9 / 3 | 0);
}
export function candidates(board: number[], i: number): number[] {
  return range(9).map(n => n + 1).filter(n => !board.some((v, j) => j !== i && v === n && peers(i, j)));
}
export function solutionCount(input: number[], limit = 2): number {
  const board = [...input]; let count = 0;
  function solve() {
    let at = -1, opts: number[] = [];
    for (let i = 0; i < 81; i++) if (!board[i]) {
      const c = candidates(board, i);
      if (!c.length) return;
      if (at < 0 || c.length < opts.length) { at = i; opts = c; if (c.length === 1) break; }
    }
    if (at < 0) { count++; return; }
    for (const n of opts) { board[at] = n; solve(); if (count >= limit) break; }
    board[at] = 0;
  }
  if (board.length !== 81 || board.some((v, i) => !Number.isInteger(v) || v < 0 || v > 9 || v > 0 && board.some((w, j) => i !== j && w === v && peers(i, j)))) return 0;
  solve(); return count;
}
function random(seed: number) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function generate(difficulty: Difficulty, seed = Date.now()): { puzzle: number[]; solution: number[] } {
  const rng = random(seed);
  const shuffle = (a: number[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const groups = () => shuffle(range(3)).flatMap(g => shuffle(range(3)).map(v => g * 3 + v));
  const rows = groups(), cols = groups(), digits = shuffle(range(9).map(n => n + 1));
  const solution = rows.flatMap(r => cols.map(c => digits[(r * 3 + (r / 3 | 0) + c) % 9]));
  const puzzle = [...solution], target = { '轻松': 42, '适中': 35, '挑战': 29 }[difficulty];
  for (const i of shuffle(range(81))) {
    if (puzzle.filter(Boolean).length <= target) break;
    const v = puzzle[i]; puzzle[i] = 0;
    if (solutionCount(puzzle) !== 1) puzzle[i] = v;
  }
  return { puzzle, solution };
}
export interface LogicStep { index: number; value: number; technique: 'single' | 'hidden'; explanation: string }
export function logicalStep(board: number[]): LogicStep | undefined {
  for (let i=0;i<81;i++) if (!board[i]) { const c=candidates(board,i); if(c.length===1)return {index:i,value:c[0],technique:'single',explanation:`第${(i/9|0)+1}行第${i%9+1}列，排除同行、同列和同宫的数字后，只能填 ${c[0]}`}; }
  const units = [...range(9).map(r=>range(9).map(c=>r*9+c)),...range(9).map(c=>range(9).map(r=>r*9+c)),...range(9).map(b=>range(9).map(k=>(b/3|0)*27+(b%3)*3+(k/3|0)*9+k%3))];
  for(let u=0;u<units.length;u++)for(let n=1;n<=9;n++){
    const cells=units[u].filter(i=>!board[i]&&candidates(board,i).includes(n));
    if(cells.length===1)return {index:cells[0],value:n,technique:'hidden',explanation:`${u<9?'这一行':u<18?'这一列':'这个九宫格'}中，数字 ${n} 只能放在标出的空格`};
  }
}
export function ratePuzzle(puzzle:number[]) {
  const board=[...puzzle];let steps=0,hidden=0;
  while(board.includes(0)){const step=logicalStep(board);if(!step)return {solved:false,steps,hidden};board[step.index]=step.value;steps++;if(step.technique==='hidden')hidden++;}
  return {solved:true,steps,hidden};
}
export function levelProfile(level:number){
  const n=Math.max(1,Math.floor(level));
  return { clues:n===1?78:Math.max(31,64-Math.floor(Math.log2(n)*6)), allowHidden:n>=16, label:n===1?'新手教学':n<6?'行列练习':n<16?'九宫格练习':n<50?'唯一位置':'综合推理' };
}
export function generateLevel(level:number){
  const profile=levelProfile(level), seed=level*104729;
  const {solution}=generate('轻松',seed);const puzzle=[...solution];
  if(level===1){[0,40,80].forEach(i=>puzzle[i]=0);return {puzzle,solution};}
  const rng=random(seed+31),order=range(81);
  for(let i=80;i>0;i--){const j=Math.floor(rng()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  let clues=81;
  for(const i of order){if(clues<=profile.clues)break;const value=puzzle[i];puzzle[i]=0;const rating=ratePuzzle(puzzle);
    if(!rating.solved||(!profile.allowHidden&&rating.hidden>0))puzzle[i]=value;else clues--;
  }
  return {puzzle,solution};
}
export function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export class Sudoku {
  puzzle: number[] = []; solution: number[] = []; board: number[] = []; notes: number[][] = [];
  level = 1; unlocked = 1; mode: 'journey' | 'free' = 'journey';
  selected = -1; pencil = false; seconds = 0; paused = false; difficulty: Difficulty = '轻松'; daily = false; date = localDate(); history: Snapshot[] = [];
  constructor(save?: Save) {
    if (save && this.valid(save)) { Object.assign(this, save); this.mode=save.mode??'free'; this.board = [...save.board]; this.notes = save.notes.map(n => [...n]); }
    else this.startLevel(1);
  }
  private valid(s: Save) {
    const nums = (v: unknown): v is number[] => Array.isArray(v) && v.length === 81 && v.every(n => Number.isInteger(n) && n >= 0 && n <= 9);
    return (s.level===undefined||Number.isSafeInteger(s.level)&&s.level>=1) && (s.unlocked===undefined||Number.isSafeInteger(s.unlocked)&&s.unlocked>=1&&(s.level===undefined||s.unlocked>=s.level)) && (s.mode===undefined||s.mode==='journey'||s.mode==='free') && s.version === 1 && nums(s.puzzle) && nums(s.solution) && nums(s.board) && s.solution.every((n, i) => n > 0 && !s.solution.some((v,j) => j !== i && v === n && peers(i,j))) && s.puzzle.every((n,i) => !n || n === s.solution[i] && n === s.board[i]) && Array.isArray(s.notes) && s.notes.length === 81 && s.notes.every(n => Array.isArray(n) && n.every(v => Number.isInteger(v) && v >= 1 && v <= 9)) && Number.isFinite(s.seconds) && s.seconds >= 0 && ['轻松','适中','挑战'].includes(s.difficulty) && typeof s.daily === 'boolean' && typeof s.date === 'string';
  }
  start(difficulty: Difficulty, daily = false) {
    this.mode = 'free';
    this.date = localDate(); this.difficulty = difficulty; this.daily = daily;
    const seed = daily ? Number(this.date.replace(/-/g,'')) : Date.now() + Math.floor(Math.random()*100000);
    Object.assign(this, generate(difficulty, seed)); this.board = [...this.puzzle]; this.notes = Array.from({length:81}, () => []);
    this.seconds = 0; this.selected = -1; this.pencil = false; this.paused = false; this.history = [];
  }
  startLevel(level:number){
    this.level=Math.max(1,Math.min(Math.floor(level),this.unlocked));this.mode='journey';this.daily=false;this.difficulty=this.level<16?'轻松':this.level<50?'适中':'挑战';
    Object.assign(this,generateLevel(this.level));this.board=[...this.puzzle];this.notes=Array.from({length:81},()=>[]);this.history=[];this.seconds=0;this.selected=-1;this.pencil=false;this.paused=false;
  }
  nextLevel(){if(this.won&&this.mode==='journey'){this.unlocked=Math.max(this.unlocked,this.level+1);this.startLevel(this.level+1);}}
  get tutorial(){return this.mode==='journey'&&this.level===1&&!this.won;}
  get tutorialIndex(){return [0,40,80].find(i=>this.board[i]!==this.solution[i])??-1;}
  get progress(){const total=this.puzzle.filter(n=>!n).length;const correct=this.board.filter((n,i)=>!this.puzzle[i]&&n===this.solution[i]).length;return {correct,total};}
  get won() { return this.board.every((v,i) => v === this.solution[i]); }
  get filled() { return this.board.filter(Boolean).length; }
  conflict(i: number) { return !!this.board[i] && this.board.some((v,j) => j !== i && v === this.board[i] && peers(i,j)); }
  private checkpoint() { this.history.push({ board: [...this.board], notes: this.notes.map(n => [...n]) }); if (this.history.length > 150) this.history.shift(); }
  enter(n: number) {
    const i = this.selected;
    if (!Number.isInteger(n) || n<0 || n>9 || i < 0 || this.puzzle[i] || this.paused || this.won) return;
    if(this.tutorial&&(i!==this.tutorialIndex||n!==this.solution[i]||this.pencil))return;
    if(!this.pencil&&this.board[i]===n)return;
    this.checkpoint();
    if (this.pencil && n) {
      if (this.board[i]) { this.history.pop(); return; }
      this.notes[i] = this.notes[i].includes(n) ? this.notes[i].filter(v => v !== n) : [...this.notes[i],n].sort();
    } else {
      this.board[i] = n; this.notes[i] = [];
      if (n) this.notes.forEach((notes,j) => { if (peers(i,j)) this.notes[j] = notes.filter(v => v !== n); });
    }
  }
  undo() { if (this.paused || this.won || this.tutorial) return; const s = this.history.pop(); if (s) { this.board = s.board; this.notes = s.notes; } }
  hint() {
    if (this.paused || this.won || this.tutorial) return;
    const i = this.selected >= 0 && this.board[this.selected] !== this.solution[this.selected] ? this.selected : this.board.findIndex((v,j) => v !== this.solution[j]);
    if (i < 0) return;
    this.selected = i; const pencil = this.pencil; this.pencil = false; this.enter(this.solution[i]); this.pencil = pencil;
  }
  save(): Save { return { level:this.level,unlocked:this.mode==='journey'&&this.won?Math.max(this.unlocked,this.level+1):this.unlocked,mode:this.mode,version: 1, puzzle: this.puzzle, solution: this.solution, board: this.board, notes: this.notes, seconds: this.seconds, difficulty: this.difficulty, daily: this.daily, date: this.date }; }
}
