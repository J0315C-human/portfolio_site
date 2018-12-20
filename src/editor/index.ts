import g from '../globals';
import { createTriangles } from '../dom';
import { TriangleChange, FrameWithGrid, TweenBlock } from './typings';
import UIControls from './uiControls';
import EventChannel from './EventChannel';
import { gridCopy } from '../utils';
import deserializer from './deserializer';
import { initializePatternAnimations } from '../patterns';
import serializer from './serializer';

const colors = g.config.colors;


/* What this class does:
-Keeps track of past frames from animation
-saves/loads animations from storage
-keeps track of timing for 'tween blocks'
-keeps track of current frame:
  -colors
  -timing
  -draw state
  -draw event logging/undo
-setup /tear down of animations
-

*/
class Editor {
  // for storing previous frames
  frames: FrameWithGrid[];
  prevTweenBlocks: TweenBlock[][][]; // a list of tweenBlocks for each position 
  // for tracking the Current Editing Frame
  newTweenBlocks: { j: number, i: number, color: number, tweenBlock: TweenBlock }[];
  triColors: number[][];
  elapsed: number;
  // for saving changes to be undone with "undo"
  changes: TriangleChange[];
  MAX_UNDO_CHANGES = 50;

  uiControls: UIControls;
  eventChannel: EventChannel;
  constructor(uiControls: UIControls, eventChannel: EventChannel) {
    this.uiControls = uiControls;
    this.eventChannel = eventChannel;

    this.triColors = [];
    this.changes = [];
    this.frames = [];
    this.elapsed = 0;
    this.newTweenBlocks = [];
    (window as any).logme = () => console.log(this);
  }

  initialize = () => {
    this.setInitialState();
    this.setBtnHandlers();
    this.setUIHandlers();
    this.setKeyHandlers();
    this.setTriangleHandlers();
  }

  setBtnHandlers = () => {
    const ec = this.eventChannel;
    ec.subscribe('btnUndo', this.undoDraw);
    ec.subscribe('btnFrame', () => this.saveFrame(false));
    ec.subscribe('btnPlay', this.play);
    ec.subscribe('btnSave', this.save);
    ec.subscribe('btnLoad', this.load);
    ec.subscribe('btnRecolor', this.recolor);
    ec.subscribe('btnRandom', this.random);
  }

  setUIHandlers = () => {
    // update 'new' tweenblocks if this frame changes
    const ec = this.eventChannel;
    const uiState = this.uiControls.state;

    ec.subscribe('inputWait', this.refreshNewTweenBlocks);
    ec.subscribe('inputFade', this.refreshNewTweenBlocks);

    ec.subscribe('setColor', (colIdx) => uiState.curColorIdx = colIdx);
    ec.subscribe('setAltColor', (colIdx) => uiState.curAltColorIdx = colIdx);
  }

  getLastFrame = () => this.frames[this.frames.length - 1];

  clearCurrentFrame = () => {
    const grid = this.getLastFrame().grid;
    grid.forEach((row, j) => {
      row.forEach((colorIdx, i) => {
        g.triangles[j][i].setAttribute('fill', colors[colorIdx]);
        this.triColors[j][i] = colorIdx;
      })
    })
    this.newTweenBlocks = [];
  }

  refreshNewTweenBlocks = () => {
    const tweenBlocksToAdd = this.newTweenBlocks.map(tb => ({ i: tb.i, j: tb.j, color: tb.color }));
    this.clearCurrentFrame();
    tweenBlocksToAdd.forEach(tb => {
      this.setTriangleColor(tb.j, tb.i, tb.color, false);
    })
  }

  removeTweenBlockAt = (j: number, i: number) => {
    this.newTweenBlocks = this.newTweenBlocks.filter(tb => !(tb.i === i && tb.j === j));
  }

  addTweenBlock = (j: number, i: number, color: number, tweenBlock: TweenBlock) => {
    this.removeTweenBlockAt(j, i);
    this.newTweenBlocks.push({ i, j, color, tweenBlock })
  }

  setKeyHandlers = () => {
    const ec = this.eventChannel;
    ec.subscribe('keypress_s', this.undoDraw);
    ec.subscribe('keypress_f', this.saveFrame);
    ec.subscribe('keypress_p', this.play);
    ec.subscribe('keypress_c', this.clear);
    ec.subscribe('keypress_l', this.load);
    ec.subscribe('keypress_k', this.save);
  }

  setInitialState = () => {
    this.triColors = [];
    this.prevTweenBlocks = [];
    g.triangles.forEach((row) => {
      const newRow = [] as number[];
      const newRow2 = [] as TweenBlock[][];
      row.forEach(() => {
        newRow.push(0);
        newRow2.push([{ start: 0, end: 0 }]); // initial 'tween blocks' just to start
      })
      this.triColors.push(newRow);
      this.prevTweenBlocks.push(newRow2);
    });
    this.saveFrame(true);
  }

  setTriangleHandlers = () => {
    g.triangles.forEach((row, j) => {
      row.forEach((tri, i) => {
        tri.onpointerdown = this.setTriangleColorClickHandler(tri, j, i, false);
        tri.onpointerenter = this.setTriangleColorClickHandler(tri, j, i, true);
      })
    });
  }

  setTriangleColorClickHandler = (el: SVGElement, j: number, i: number, checkMouseDown: boolean) => (e: PointerEvent) => {
    if (checkMouseDown && e.buttons === 0) { return; }
    const uiState = this.uiControls.state;
    this.setTriangleColor(j, i, uiState.shiftDown ? uiState.curAltColorIdx : uiState.curColorIdx);
  }

  setTriangleColor = (j: number, i: number, colorIdx: number, saveChange = true) => {
    const uiState = this.uiControls.state;
    const startPos = this.elapsed + uiState.wait;
    const endPos = startPos + uiState.fade;
    const oldColor = this.triColors[j][i];
    const lastFrameColor = this.getLastFrame().grid[j][i];
    if (oldColor === colorIdx) { return; }
    if (this.checkForActiveTweens(startPos, endPos, j, i)) {
      return;
    } else {
      // remove tweenblock if it's back to the original color
      if (lastFrameColor === colorIdx) {
        this.removeTweenBlockAt(j, i);
      } else {
        this.addTweenBlock(j, i, colorIdx, {
          start: startPos,
          end: endPos,
        });
      }
    }

    g.triangles[j][i].setAttribute('fill', colors[colorIdx]);
    this.triColors[j][i] = colorIdx;
    if (saveChange) {
      this.logChange(oldColor, j, i);
    }
  }

  checkForActiveTweens = (start: number, end: number, j: number, i: number) => {
    const tweenBlockList = this.prevTweenBlocks[j][i];
    return tweenBlockList.some(tb => !(start >= tb.end || end <= tb.start));
  }

  undoDraw = () => {
    if (!this.changes.length) { return; }
    const chg = this.changes.pop();
    this.setTriangleColor(chg.j, chg.i, chg.oldColor, false);
  }

  logChange = (oldColorIdx: number, j: number, i: number) => {
    const change = { oldColor: oldColorIdx, i, j };
    if (this.changes.length < this.MAX_UNDO_CHANGES) {
      this.changes.push(change);
    } else {
      this.changes = [...this.changes.slice(1, this.MAX_UNDO_CHANGES), change];
    }
  }

  clear = () => {
    g.triangles.forEach((row, j) => {
      row.forEach((tri, i) => {
        tri.setAttribute('fill', colors[0]);
        this.triColors[j][i] = 0;
      })
    });
  }

  saveFrame = (instant?: boolean) => {
    const uiState = this.uiControls.state;
    const wait = instant ? 0 : uiState.wait;
    const fade = instant ? 0 : uiState.fade;
    this.elapsed += wait + fade;
    this.frames.push({
      type: 'grid',
      grid: gridCopy(this.triColors),
      wait,
      fade,
    });
    this.newTweenBlocks.forEach(ntb => {
      this.prevTweenBlocks[ntb.j][ntb.i].push(ntb.tweenBlock);
    })
    this.newTweenBlocks = [];
    this.changes = [];
  }

  recolor = () => {
    const uiState = this.uiControls.state;
    const from = uiState.colorFrom;
    const to = uiState.colorTo;

    if (!colors[to - 1]) { return; }
    for (let j = 0; j < g.nRows; j++) {
      for (let i = 0; i < g.nCols; i++) {
        if (this.triColors[j][i] + 1 === from) {
          this.setTriangleColor(j, i, (to - 1));
        }
      }
    }
  }

  random = () => {
    const percent = 0.7;
    for (let j = 0; j < g.nRows; j++) {
      for (let i = 0; i < g.nCols; i++) {
        if (Math.random() < percent) {
          const colorIdx = Math.floor(Math.random() * colors.length);
          this.setTriangleColor(j, i, colorIdx);
        }
      }
    }
  }

  play = () => {
    const patterns = deserializer.getPatternsFromFrames(this.frames);
    g.tl.clear();
    initializePatternAnimations(patterns);
    g.tl.timeScale(this.uiControls.state.speed);
    g.tl.play();
    g.tl.eventCallback("onComplete", () => {
      setTimeout(this.cleanupAfterPlay, 100);
    });
  }

  cleanupAfterPlay = () => {
    g.tl.clear();
    this.recreateCanvas();
    this.redraw();
  }

  recreateCanvas = () => {
    createTriangles();
    this.setTriangleHandlers();
  }

  drawFrame = (idx: number) => {
    if (this.frames[idx]) {
      const grid = this.frames[idx].grid;
      grid.forEach((row, j) => {
        row.forEach((colIdx, i) => {
          const color = colors[colIdx];
          g.triangles[j][i].setAttribute('fill', color);
        })
      })
    }
  }

  redraw = () => {
    this.triColors.forEach((row, j) => {
      row.forEach((colIdx, i) => {
        const color = colors[colIdx];
        g.triangles[j][i].setAttribute('fill', color);
      })
    })
  }

  save = () => serializer.saveToLocalStorage(this.frames, this.uiControls.state.animationName);

  load = () => {
    const retiled = deserializer.loadFromLocalStorage(this.uiControls.state.animationName);
    this.frames = retiled;
    this.triColors = gridCopy(retiled[retiled.length - 1].grid);
  }


}

export default Editor;