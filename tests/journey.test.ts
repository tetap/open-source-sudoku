import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Sudoku,generateLevel,ratePuzzle,solutionCount,levelProfile} from '../assets/scripts/Sudoku';
import {GameView,Painter} from '../assets/scripts/GameView';
test('tutorial gates inputs, resumes and advances only after completion',()=>{
  const g=new Sudoku();assert.equal(g.tutorial,true);assert.equal(g.progress.total,3);g.nextLevel();assert.equal(g.level,1);
  g.selected=40;g.enter(g.solution[40]);assert.equal(g.board[40],0);
  g.selected=0;g.enter(g.solution[0]%9+1);assert.equal(g.board[0],0);g.enter(g.solution[0]);
  const resumed=new Sudoku(JSON.parse(JSON.stringify(g.save())));assert.equal(resumed.tutorialIndex,40);
  for(const i of [40,80]){resumed.selected=i;resumed.enter(resumed.solution[i]);}assert.equal(resumed.won,true);assert.equal(resumed.save().unlocked,2);
  resumed.nextLevel();assert.equal(resumed.level,2);assert.equal(resumed.unlocked,2);assert.equal(resumed.progress.correct,0);
});
test('journey puzzles are deterministic, unique and solvable with advertised techniques',()=>{
  for(const level of [2,3,5,10,15,16,25,50,100,1000,100000]){
    const a=generateLevel(level),b=generateLevel(level),rating=ratePuzzle(a.puzzle);
    assert.deepEqual(a,b);assert.equal(solutionCount(a.puzzle),1);assert.equal(rating.solved,true);if(!levelProfile(level).allowHidden)assert.equal(rating.hidden,0);
  }
});
test('tutorial can be completed through actual view coordinates',()=>{
  const a=new GameView(()=>{}),p:Painter={rect(){},line(){},text(){}};
  for(const i of [0,40,80]){a.draw(p);a.tap(24+i%9*38+19,270+(i/9|0)*38+19);a.draw(p);const n=a.game.solution[i];a.tap(24+(n-1)*38.5+17,718);}
  assert.equal(a.game.won,true);a.draw(p);a.tap(195,448);assert.equal(a.game.level,2);
});
