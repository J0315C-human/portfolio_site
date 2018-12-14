import '../assets/editor.css';
import g from '../globals';
import { initializePatternAnimations } from '../patterns';
import { createTriangles } from '../dom';
import { TriangleChange, Frame, TweenBlock } from './typings';
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

class Editor {
  colorBtns: HTMLElement[];
  curColorIdx: number;
  curAltColorIdx: number;
  triColors: number[][];
  changes: TriangleChange[];
  frames: Frame[];
  prevTweenBlocks: TweenBlock[][]; // a list of tweenBlocks for each position 
  newTweenBlocks: { j: number, i: number, tweenBlock: TweenBlock }[];
  elapsed: number;
  inputFocused: boolean;
  toolboxLocation: 'left' | 'right';
  shiftDown: boolean;
  MAX_CHANGES = 50;
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
  }

  initialize = () => {
    const scroll = document.getElementById('scrollOuter');
    if (scroll) {
      scroll.style.pointerEvents = 'none';
    }
    this.setupPalette();
    this.setBtnHandlers();
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
    const undo = document.getElementById('editor-option-undo');
    if (undo) {
      undo.onclick = this.undoDraw;
    }
    const frame = document.getElementById('editor-option-frame');
    if (frame) {
      frame.onclick = () => this.saveFrame();
    }
    const play = document.getElementById('editor-option-play');
    if (play) {
      play.onclick = this.play;
    }
    const save = document.getElementById('editor-option-save');
    if (save) {
      save.onclick = this.save;
    }
    const load = document.getElementById('editor-option-load');
    if (load) {
      load.onclick = this.load;
    }
    const recolor = document.getElementById('editor-option-recolor');
    if (recolor) {
      recolor.onclick = this.recolor;
    }
    const random = document.getElementById('editor-option-random');
    if (random) {
      random.onclick = this.random;
    }
    inputFade.onfocus = () => this.inputFocused = true;
    inputFade.onblur = () => this.inputFocused = false;
    inputWait.onfocus = () => this.inputFocused = true;
    inputWait.onblur = () => this.inputFocused = false;
    inputWait.onchange = this.updateNewTweenBlocks;
    inputFade.onchange = this.updateNewTweenBlocks;
  }

  updateNewTweenBlocks = () => {
    const w = parseFloat(inputWait.value);
    const f = parseFloat(inputFade.value);
    const startPos = this.elapsed + w;
    this.newTweenBlocks.forEach(tb => {
      tb.tweenBlock = {
        start: startPos,
        end: startPos + f,
      }
    })
  }

  setKeyHandlers = () => {
    document.onkeypress = (e) => {
      if (this.inputFocused) { return; }
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
      const newRow2 = [] as TweenBlock[];
      row.forEach(() => {
        newRow.push(0);
        newRow2.push({ start: 0, end: 0 }); // initial 'blocks' just to start
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
    this.setTriangleColor(el, j, i, this.shiftDown ? this.curAltColorIdx : this.curColorIdx);
  }

  setTriangleColor = (el: SVGElement, j: number, i: number, colorIdx: number) => {
    const startPos = this.elapsed + parseFloat(inputWait.value);
    if (this.checkForActiveTweens(startPos, j, i)) {
      return;
    } else {
      this.newTweenBlocks.push({
        i, j, tweenBlock: {
          start: startPos,
          end: startPos + parseFloat(inputFade.value),
        }
      })
    }
    const oldColor = this.triColors[j][i];
    if (oldColor === colorIdx) { return; }
    el.setAttribute('fill', colors[colorIdx]);
    this.triColors[j][i] = colorIdx;
    this.logChange(oldColor, j, i);
  }

  checkForActiveTweens = (t: number, j: number, i: number) => {
    const tweenBlock = this.prevTweenBlocks[j][i];
    return (tweenBlock.start < t) && (tweenBlock.end > t);
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

  logPattern = () => {
    console.log(this.triColors);
  }

  undoDraw = () => {
    if (!this.changes.length) { return; }
    const chg = this.changes.pop();
    const tri = g.triangles[chg.j][chg.i];
    tri.setAttribute('fill', colors[chg.oldColor]);
    this.triColors[chg.j][chg.i] = chg.oldColor;
  }

  logChange = (oldColorIdx: number, j: number, i: number) => {
    const change = { oldColor: oldColorIdx, i, j };
    if (this.changes.length < this.MAX_CHANGES) {
      this.changes.push(change);
    } else {
      this.changes = [...this.changes.slice(1, this.MAX_CHANGES), change];
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
      grid: gridCopy(this.triColors),
      wait,
      fade,
    });
    this.newTweenBlocks.forEach(ntb => {
      this.prevTweenBlocks[ntb.j][ntb.i] = ntb.tweenBlock;
    })
    this.newTweenBlocks = [];
  }

  recolor = () => {
    const from = parseInt(inputRecolorFrom.value, 10);
    const to = parseInt(inputRecolorTo.value, 10);

    if (!colors[to - 1]) { return; }
    for (let j = 0; j < g.nRows; j++) {
      for (let i = 0; i < g.nCols; i++) {
        if (this.triColors[j][i] + 1 === from) {
          this.setTriangleColor(g.triangles[j][i], j, i, (to - 1));
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
          this.setTriangleColor(g.triangles[j][i], j, i, colorIdx);
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

  save = () => serializer.saveToLocalStorage(this.frames);

  load = () => {
    const retiled = deserializer.loadFromLocalStorage();
    this.frames = retiled;
    this.triColors = gridCopy(retiled[retiled.length - 1].grid);
  }


}

const editor = new Editor();
export default editor;