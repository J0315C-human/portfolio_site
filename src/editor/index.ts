import '../assets/editor.css';
import g from '../globals';
import { initializePatternAnimations } from '../patterns';
import { createTriangles } from '../dom';
import { TriangleChange, FrameWithGrid, TweenBlock } from './typings';
import serializer from './serializer';
import deserializer from './deserializer';
import { gridCopy } from '../utils';

const colors = g.config.colors;

const outerEditor = document.getElementById('editor-outer');
const outerColors = document.getElementById('editor-colors');
const inputWait = document.getElementById('editor-option-wait') as HTMLInputElement;
const inputFade = document.getElementById('editor-option-fade') as HTMLInputElement;
const inputSpeed = document.getElementById('editor-option-speed') as HTMLInputElement;
const inputRecolorFrom = document.getElementById('editor-option-colorfrom') as HTMLInputElement;
const inputRecolorTo = document.getElementById('editor-option-colorto') as HTMLInputElement;
const inputAnimationName = document.getElementById('editor-option-name') as HTMLInputElement;
const btnUndo = document.getElementById('editor-option-undo');
const btnFrame = document.getElementById('editor-option-frame');
const btnPlay = document.getElementById('editor-option-play');
const btnSave = document.getElementById('editor-option-save');
const btnLoad = document.getElementById('editor-option-load');
const btnRecolor = document.getElementById('editor-option-recolor');
const btnRandom = document.getElementById('editor-option-random');

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
  // for UI stuff
  colorBtns: HTMLElement[];
  curColorIdx: number;
  curAltColorIdx: number;
  inputFocused: boolean;
  toolboxLocation: 'left' | 'right';
  toolboxVisible: boolean;
  shiftDown: boolean;
  constructor() {
    this.colorBtns = [];
    this.curColorIdx = 1;
    this.curAltColorIdx = 0;
    this.triColors = [];
    this.changes = [];
    this.frames = [];
    this.inputFocused = false;
    this.toolboxLocation = 'left';
    this.elapsed = 0;
    this.newTweenBlocks = [];
    this.shiftDown = false;
    this.toolboxVisible = true;
    (window as any).logme = () => console.log(this.newTweenBlocks, this.prevTweenBlocks);
  }

  initialize = () => {
    const scroll = document.getElementById('scrollOuter');
    if (scroll) {
      scroll.style.pointerEvents = 'none';
    }
    this.setupPalette();
    this.setBtnHandlers();
    this.setFieldHandlers();
    this.setInitialState();
    this.setTriangleHandlers();
    this.setKeyHandlers();
  }

  setupPalette = () => {
    if (outerColors) {
      colors.forEach((color, n) => {
        const btn = document.createElement('button');
        btn.className = 'editor-color';
        btn.onclick = this.colorClickHandler(n);
        btn.style.backgroundColor = color;
        outerColors.appendChild(btn);
        this.colorBtns.push(btn);
        if (n === this.curColorIdx) {
          btn.classList.add('editor-color-selected');
        }
      });
    }
  }

  colorClickHandler = (n: number) => () => {
    if (this.shiftDown) {
      this.setColorActiveAlt(n);
    } else {
      this.setColorActive(n);
    }
  }
  setColorActive = (idx: number) => {
    this.curColorIdx = idx;
    this.colorBtns.forEach((btn, n) => {
      if (n === idx) {
        btn.classList.add('editor-color-selected');
        btn.classList.remove('editor-color-selected-alt');
      } else {
        btn.classList.remove('editor-color-selected');
      }
    })
  }

  setColorActiveAlt = (idx: number) => {
    this.curAltColorIdx = idx;
    this.colorBtns.forEach((btn, n) => {
      if (n === idx) {
        btn.classList.add('editor-color-selected-alt');
        btn.classList.remove('editor-color-selected');
      } else {
        btn.classList.remove('editor-color-selected-alt');
      }
    })
  }

  setBtnHandlers = () => {
    if (btnUndo) {
      btnUndo.onclick = this.undoDraw;
    }
    if (btnFrame) {
      btnFrame.onclick = () => this.saveFrame();
    }
    if (btnPlay) {
      btnPlay.onclick = this.play;
    }
    if (btnSave) {
      btnSave.onclick = this.save;
    }
    if (btnLoad) {
      btnLoad.onclick = this.load;
    }
    if (btnRecolor) {
      btnRecolor.onclick = this.recolor;
    }
    if (btnRandom) {
      btnRandom.onclick = this.random;
    }
  }

  setFieldHandlers = () => {
    inputFade.onfocus = () => this.inputFocused = true;
    inputFade.onblur = () => this.inputFocused = false;
    inputWait.onfocus = () => this.inputFocused = true;
    inputWait.onblur = () => this.inputFocused = false;
    inputAnimationName.onfocus = () => this.inputFocused = true;
    inputAnimationName.onblur = () => this.inputFocused = false;

    // update 'new' tweenblocks if this frame changes
    inputWait.onchange = this.refreshNewTweenBlocks;
    inputFade.onchange = this.refreshNewTweenBlocks;
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
    document.onkeypress = (e) => {
      if (this.inputFocused) { return; }
      if (e.key.toLowerCase() === 'a') { this.switchToolboxVisibility(); }
      if (e.key.toLowerCase() === 's') { this.undoDraw(); }
      else if (e.key.toLowerCase() === 'f') { this.saveFrame(); }
      else if (e.key.toLowerCase() === 'p') { this.play(); }
      else if (e.key.toLowerCase() === 'c') { this.clear(); }
      else if (e.key.toLowerCase() === 't') { this.switchToolboxLocation(); }
      else if (e.key.toLowerCase() === 'l') { this.load(); }
      else if (e.key.toLowerCase() === 'k') { this.save(); }
      else if (e.key === '0') { return; }
      else if (!isNaN(parseInt(e.key))) {
        const idx = parseInt(e.key);
        if (idx <= colors.length && idx > 0) {
          this.colorClickHandler(idx - 1)();
        }
      }
    }

    document.onkeydown = (e) => {
      if (e.key.toLowerCase() === 'shift') {
        this.shiftDown = true;
      }
    }
    document.onkeyup = (e) => {
      if (e.key.toLowerCase() === 'shift') {
        this.shiftDown = false;
      }
    }
  }

  setInitialState = () => {
    document.body.style.backgroundColor = "#FFF";
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
    this.setTriangleColor(j, i, this.shiftDown ? this.curAltColorIdx : this.curColorIdx);
  }

  setTriangleColor = (j: number, i: number, colorIdx: number, saveChange = true) => {
    const startPos = this.elapsed + parseFloat(inputWait.value);
    const endPos = startPos + parseFloat(inputFade.value);
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

  switchToolboxLocation = () => {
    if (this.toolboxLocation === 'left') {
      outerEditor.style.left = '60vw';
      this.toolboxLocation = 'right';
    } else {
      outerEditor.style.left = '10vw';
      this.toolboxLocation = 'left';
    }
  }

  switchToolboxVisibility = () => {
    if (this.toolboxVisible) {
      outerEditor.style.display = 'none';
      this.toolboxVisible = false;
    } else {
      outerEditor.style.display = 'block';
      this.toolboxVisible = true;
    }
  }

  logPattern = () => {
    console.log(this.triColors);
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
    const wait = instant ? 0 : parseFloat(inputWait.value);
    const fade = instant ? 0 : parseFloat(inputFade.value);
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
    const from = parseInt(inputRecolorFrom.value, 10);
    const to = parseInt(inputRecolorTo.value, 10);

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
    g.tl.timeScale(parseFloat(inputSpeed.value));
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

  save = () => serializer.saveToLocalStorage(this.frames, inputAnimationName.value);

  load = () => {
    const retiled = deserializer.loadFromLocalStorage(inputAnimationName.value);
    this.frames = retiled;
    this.triColors = gridCopy(retiled[retiled.length - 1].grid);
  }


}

const editor = new Editor();
export default editor;