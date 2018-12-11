import '../assets/editor.css';
import g from '../globals';
import { initializePatternAnimations } from '../patterns';
import { createTriangles } from '../dom';
import { TriangleChange, Frame } from './typings';
import serializer from './serializer';
import deserializer from './deserializer';
import { gridCopy } from '../utils';

const colors = g.config.colors;

const outerEditor = document.getElementById('editor-outer');
const outerColors = document.getElementById('editor-colors');
const inputWait = document.getElementById('editor-option-wait') as HTMLInputElement;
const inputFade = document.getElementById('editor-option-fade') as HTMLInputElement;

class Editor {
  colorBtns: HTMLElement[];
  curColorIdx: number;
  triColors: number[][];
  changes: TriangleChange[];
  frames: Frame[];
  inputFocused: boolean;
  toolboxLocation: 'left' | 'right';
  MAX_CHANGES = 50;
  constructor() {
    this.colorBtns = [];
    this.curColorIdx = 1;
    this.triColors = [];
    this.changes = [];
    this.frames = [];
    this.inputFocused = false;
    this.toolboxLocation = 'left';
  }

  initialize = () => {
    const scroll = document.getElementById('scrollOuter');
    if (scroll) {
      scroll.style.pointerEvents = 'none';
    }
    this.setupPalette();
    this.setBtnHandlers();
    this.initializeTriangles();
    this.setTriangleHandlers();
    this.setKeyHandlers();
  }

  setupPalette = () => {
    if (outerColors) {
      colors.forEach((color, n) => {
        const btn = document.createElement('button');
        btn.className = 'editor-color';
        btn.onclick = () => {
          this.setColorActive(n);
        }
        btn.style.backgroundColor = color;
        outerColors.appendChild(btn);
        this.colorBtns.push(btn);
        if (n === this.curColorIdx) {
          btn.classList.add('editor-color-selected');
        }
      });
    }
  }

  setColorActive = (idx: number) => {
    this.curColorIdx = idx;
    this.colorBtns.forEach((btn, n) => {
      if (n === idx) {
        btn.classList.add('editor-color-selected');
      } else {
        btn.classList.remove('editor-color-selected');
      }
    })
  }

  setBtnHandlers = () => {
    const log = document.getElementById('editor-option-log');
    if (log) {
      log.onclick = this.logPattern;
    }
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
    inputFade.onfocus = () => this.inputFocused = true;
    inputFade.onblur = () => this.inputFocused = false;
    inputWait.onfocus = () => this.inputFocused = true;
    inputWait.onblur = () => this.inputFocused = false;
  }

  setKeyHandlers = () => {
    document.onkeypress = (e) => {
      if (this.inputFocused) { return; }
      if (e.key.toLowerCase() === 'a') { this.logPattern(); }
      else if (e.key.toLowerCase() === 's') { this.undoDraw(); }
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
          this.setColorActive(idx - 1);
        }
      }
    }
  }

  initializeTriangles = () => {
    document.body.style.backgroundColor = "#FFF";
    this.triColors = [];
    g.triangles.forEach((row) => {
      const newRow = [] as number[];
      row.forEach(() => {
        newRow.push(0);
      })
      this.triColors.push(newRow);
    });
    this.saveFrame(true);
  }

  setTriangleHandlers = () => {
    g.triangles.forEach((row, j) => {
      row.forEach((tri, i) => {
        tri.onpointerdown = this.setTriangleColor(tri, j, i, false);
        tri.onpointerenter = this.setTriangleColor(tri, j, i, true);
      })
    });
  }

  setTriangleColor = (el: SVGElement, j: number, i: number, checkMouseDown: boolean) => (e: PointerEvent) => {
    if (checkMouseDown && e.buttons === 0) { return; }
    const color = colors[this.curColorIdx];
    const oldColor = this.triColors[j][i];
    if (oldColor === this.curColorIdx) { return; }
    el.setAttribute('fill', color);
    this.triColors[j][i] = this.curColorIdx;
    this.logChange(oldColor, j, i);
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
    this.frames.push({
      grid: gridCopy(this.triColors),
      wait: instant ? 0 : parseFloat(inputWait.value),
      fade: instant ? 0 : parseFloat(inputFade.value),
    });
  }

  play = () => {
    const patterns = deserializer.getPatternsFromFrames(this.frames);
    g.tl.clear();
    initializePatternAnimations(patterns);
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