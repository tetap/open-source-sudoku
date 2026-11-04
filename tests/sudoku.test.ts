import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sudoku, generate, solutionCount, peers, generateLevel, ratePuzzle, levelProfile } from '../assets/scripts/Sudoku';
import { GameView, Painter } from '../assets/scripts/GameView';
test('generated puzzles are valid and uniquely solvable across difficulties and seeds',()=>{
  for(const d of ['轻松','适中','挑战'] as const) for(let seed=1;seed<=8;seed++) {
    const {puzzle,solution}=generate(d,seed);assert.equal(solutionCount(puzzle),1);assert.equal(solutionCount(solution),1);
    assert.ok(puzzle.every((n,i)=>!n||n===solution[i]));assert.ok(puzzle.filter(Boolean).length>=({轻松:42,适中:35,挑战:29}[d]));
  }
});
test('seeded daily boards repeat and other seeds differ',()=>{
  assert.deepEqual(generate('适中',20261104),generate('适中',20261104));assert.notDeepEqual(generate('适中',20261104),generate('适中',20261105));
});
test('notes, peer cleanup, undo, fixed cells and hints',()=>{
  const g=new Sudoku();g.start('轻松');const i=g.board.findIndex(n=>!n);g.selected=i;g.pencil=true;g.enter(g.solution[i]);assert.deepEqual(g.notes[i],[g.solution[i]]);
  g.pencil=false;g.enter(g.solution[i]);assert.equal(g.board[i],g.solution[i]);assert.deepEqual(g.notes[i],[]);g.undo();assert.equal(g.board[i],0);assert.deepEqual(g.notes[i],[g.solution[i]]);
  g.selected=g.puzzle.findIndex(Boolean);const v=g.board[g.selected];g.enter(0);assert.equal(g.board[g.selected],v);
  g.selected=i;g.hint();assert.equal(g.board[i],g.solution[i]);assert.equal(g.won,false);
  const fixed=g.puzzle.findIndex(Boolean), empty=g.board.findIndex((n,j)=>!n&&peers(j,fixed));if(empty>=0){g.selected=empty;g.enter(g.board[fixed]);assert.equal(g.conflict(empty),true);}
});
test('storage roundtrip, corrupt saves, pause and completion',()=>{
  const g=new Sudoku();g.start('轻松');g.seconds=79;const save=JSON.parse(JSON.stringify(g.save()));assert.deepEqual(new Sudoku(save).save(),save);
  save.notes=[null];assert.doesNotThrow(()=>new Sudoku(save));assert.doesNotThrow(()=>new GameView(()=>{},'{broken'));
  const before=g.filled;g.paused=true;g.hint();assert.equal(g.filled,before);g.paused=false;
  while(!g.won)g.hint();assert.equal(g.filled,81);const board=[...g.board];g.undo();assert.deepEqual(g.board,board);
});
test('render and tap input share board coordinates, pause hides board, modal cancels',()=>{
  const app=new GameView(()=>{});app.game.start('轻松');const p:Painter={rect(){},line(){},text(){}};
  app.draw(p);const i=app.game.board.findIndex(n=>!n);app.tap(24+(i%9)*38+19,270+(i/9|0)*38+19);assert.equal(app.game.selected,i);
  app.draw(p);const n=app.game.solution[i];app.tap(24+(n-1)*38.5+17,718);assert.equal(app.game.board[i],n);
  app.tap(340,196);app.draw(p);assert.equal(app.game.paused,true);assert.ok(app.hits.length<40);
  app.tap(100,770);assert.equal(app.modal,'new');app.draw(p);app.tap(100,594);assert.equal(app.modal,null);
});
