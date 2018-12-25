import { FrameWithGrid, TweenBlockWithCoords } from './typings';
import UIControls from './uiControls';
import EventChannel from './EventChannel';
import { gridCopy } from '../utils';
import serializer from './serializer';
import Globals from '../globals';
import Elements from './elements';
import TweenBlocks from './tweenBlocks';
import UndoQueue from './undoQueue';
import { getTimingFunction } from '../patterns/timingFunctions';
import { getCursor } from '../patterns/cursorTypes';
import constants from '../constants';
/* What this class does:
-Keeps track of past frames from animation
-keeps track of current frame:
  -colors
  -timing
  -draw state
*/

class Editor {
  // for storing previous frames
  frames: FrameWithGrid[];
  // for tracking the Current Editing Frame
  triColors: number[][];
  elapsed: number;
  tweenBlocks: TweenBlocks;
  // for saving changes to be undone with "undo"
  undoQueue: UndoQueue;
  elements: Elements;
  uiControls: UIControls;
  eventChannel: EventChannel;
  g: Globals;
  isPlaying: boolean;
  constructor(eventChannel: EventChannel, elements: Elements, globals: Globals) {
    this.uiControls = new UIControls(eventChannel, elements, globals);
    this.undoQueue = new UndoQueue();
    this.eventChannel = eventChannel;
    this.g = globals;
    this.elements = elements;
    this.isPlaying = false;
    this.triColors = [];
    this.frames = [];
    this.setElapsed(0);
    this.tweenBlocks = new TweenBlocks(this.g);
  }

  initialize = () => {
    this.eventChannel.dispatch({ type: 'triangles_init' });
    this.uiControls.initialize();
    this.setInitialState();
    this.setBtnHandlers();
    this.setUIHandlers();
    this.setKeyHandlers();
    this.setTriangleHandlers();
    this.setOtherEventHandlers();
  }

  public setElapsed = (elapsed: number) => {
    this.elapsed = elapsed;
    this.setElapsedDisplay(elapsed);
  }
  private setElapsedDisplay = (elapsed: number) => {
    const el = this.elements.divCurrentTime;
    const curText = el.textContent;
    const newText = elapsed.toFixed(3);
    if (curText !== newText) {
      this.elements.divCurrentTime.textContent = newText;
    }
  }

  private setBtnHandlers = () => {
    const ec = this.eventChannel;
    const uiState = this.uiControls.state;
    ec.subscribe('btnUndo', this.undoQueue.undo);
    ec.subscribe('btnFrame', () => this.stashFrame(false));
    ec.subscribe('btnPlay', this.play);
    ec.subscribe('btnSave', this.save);
    ec.subscribe('btnLoad', this.load);
    ec.subscribe('btnRecolor', this.recolor);
    ec.subscribe('btnRandom', this.random);
    ec.subscribe('btnSaveGrid', () => {
      localStorage.setItem(uiState.gridName, JSON.stringify(this.triColors));
    });
    ec.subscribe('btnLoadGrid', () => {
      const json = localStorage.getItem(this.uiControls.state.gridName);
      const grid = JSON.parse(json);
      this.addUndoToOldTriangleGrid();
      for (let j = 0; j < this.g.nRows; j++) {
        for (let i = 0; i < this.g.nCols; i++) {
          this.setTriangleColor(j, i, grid[j][i]);
        }
      }
    });
    ec.subscribe('btnAddAnimation', () => {
      this.eventChannel.dispatch({
        type: 'add_animation_localstorage_to_editor',
        payload: { name: this.uiControls.state.animationName },
      })
    })
  }

  private setUIHandlers = () => {
    // update 'new' tweenblocks if this frame changes
    const ec = this.eventChannel;
    const uiState = this.uiControls.state;

    ec.subscribe('inputWait', this.updateCurrentFrameTiming);
    ec.subscribe('inputFade', this.updateCurrentFrameTiming);
    ec.subscribe('inputTiming', this.updateCurrentFrameTiming);

    ec.subscribe('setColor', (colIdx) => uiState.curColorIdx = colIdx);
    ec.subscribe('setAltColor', (colIdx) => uiState.curAltColorIdx = colIdx);
  }

  private setKeyHandlers = () => {
    const callIfInputNotFocused = (func: () => any) => () => { if (!this.uiControls.state.inputFocused) func(); }
    const ec = this.eventChannel;
    ec.subscribe('keypress_s', callIfInputNotFocused(this.undoQueue.undo));
    ec.subscribe('keypress_f', callIfInputNotFocused(this.stashFrame));
    ec.subscribe('keypress_p', callIfInputNotFocused(this.play));
    ec.subscribe('keypress_c', callIfInputNotFocused(this.clear));
    ec.subscribe('keypress_l', callIfInputNotFocused(this.load));
    ec.subscribe('keypress_k', callIfInputNotFocused(this.save));
    ec.subscribe('keypress_r', callIfInputNotFocused(this.recolor));
  }

  private setOtherEventHandlers = () => {
    this.eventChannel.subscribe('editor_load_frames', this.loadFrames(true));
    this.eventChannel.subscribe('editor_add_frames', this.loadFrames(false));
    this.eventChannel.subscribe('animation_finished', () => {
      this.g.tl.clear();
      this.recreateCanvas();
      this.redrawCurrentFrame();
      this.setElapsedDisplay(this.elapsed);
      this.isPlaying = false;
    });
  }

  private recreateCanvas = () => {
    this.eventChannel.dispatch({ type: 'triangles_init' })
    this.setTriangleHandlers();
  }

  private getLastFrame = () => this.frames[this.frames.length - 1];

  private clearCurrentFrame = () => {
    const grid = this.getLastFrame().grid;
    grid.forEach((row, j) => {
      row.forEach((colorIdx, i) => {
        this.eventChannel.dispatch({ type: 'triangle_fill', payload: { j, i, color: constants.colors[colorIdx] } });
        this.triColors[j][i] = colorIdx;
      })
    })
    this.tweenBlocks.clear();
  }

  private updateCurrentFrameTiming = () => {
    const tweenBlocksToAdd = this.tweenBlocks.newBlocks.map(tb => ({ i: tb.i, j: tb.j, color: tb.color }));
    this.clearCurrentFrame();
    // "replay" all the changes with the new timing
    tweenBlocksToAdd.forEach(tb => {
      this.setTriangleColor(tb.j, tb.i, tb.color);
    })
  }

  private setInitialState = () => {
    this.triColors = [];
    for (let j = 0; j < this.g.nRows; j++) {
      const newRow = [] as number[];
      for (let i = 0; i < this.g.nCols; i++) {
        newRow.push(0);
      }
      this.triColors.push(newRow);
    }
    this.stashFrame(true);
  }

  private setTriangleHandlers = () => {
    for (let j = 0; j < this.g.nRows; j++)
      for (let i = 0; i < this.g.nCols; i++) {
        this.eventChannel.dispatch({
          type: 'triangle_set_onpointerdown',
          payload: {
            j, i,
            handler: this.setTriangleColorClickHandler(j, i, false),
          }
        });
        this.eventChannel.dispatch({
          type: 'triangle_set_onpointerenter',
          payload: {
            j, i,
            handler: this.setTriangleColorClickHandler(j, i, true),
          }
        });
      }
  }

  private setTriangleColorClickHandler = (j: number, i: number, checkMouseDown: boolean) => (el: SVGElement) => (e: PointerEvent) => {
    if (checkMouseDown && e.buttons === 0) return;
    const { curAltColorIdx, curColorIdx, shiftDown, cursorMode } = this.uiControls.state;
    const colorIdx = shiftDown ? curAltColorIdx : curColorIdx;
    const cursor = getCursor(cursorMode, j, i);
    const changes = cursor.map(pos => ({ j: pos.j, i: pos.i, color: this.triColors[pos.j][pos.i] }))
      .filter(chg => chg.color !== colorIdx);
    if (cursor.length === 0 || changes.length === 0) return;
    cursor.forEach(pos => {
      this.setTriangleColor(pos.j, pos.i, colorIdx);
    })
    this.undoQueue.add(() => {
      changes.forEach(chg => {
        this.setTriangleColor(chg.j, chg.i, chg.color);
      })
    })
  }

  private setTriangleColor = (j: number, i: number, colorIdx: number) => {
    const getOffset = getTimingFunction(this.uiControls.state.timingFunction);
    const uiState = this.uiControls.state;
    const startPos = this.elapsed + uiState.wait + getOffset(j, i);
    const endPos = startPos + uiState.fade;
    const lastFrameColor = this.getLastFrame().grid[j][i];
    const oldColor = this.triColors[j][i];
    if (oldColor === colorIdx) { return; }
    if (this.tweenBlocks.checkForActiveTweens(startPos, endPos, j, i)) {
      return;
    } else {
      // remove tweenblock if it's back to the original color
      if (lastFrameColor === colorIdx) {
        this.tweenBlocks.removeTweenBlockAt(j, i);
      } else {
        this.tweenBlocks.addTweenBlock(j, i, colorIdx, {
          start: startPos,
          end: endPos,
        });
      }
    }

    this.eventChannel.dispatch({ type: 'triangle_fill', payload: { j, i, color: constants.colors[colorIdx] } })
    this.triColors[j][i] = colorIdx;
  }

  private clear = () => {
    this.addUndoToOldTriangleGrid();
    for (let j = 0; j < this.g.nRows; j++) {
      for (let i = 0; i < this.g.nCols; i++) {
        this.setTriangleColor(j, i, this.uiControls.state.curColorIdx);
      }
    }
  }

  private stashFrame = (instant?: boolean) => {
    const uiState = this.uiControls.state;
    const wait = instant ? 0 : uiState.wait;
    const fade = instant ? 0 : uiState.fade;
    this.setElapsed(this.elapsed + wait + fade);
    this.frames.push({
      type: 'grid',
      grid: gridCopy(this.triColors),
      wait,
      fade,
      timingFunc: uiState.timingFunction,
    });
    // for use in undoing:
    const stashedTweenBlocks = this.tweenBlocks.newBlocks
      .map(tb => ({ i: tb.i, j: tb.j, start: tb.tweenBlock.start, end: tb.tweenBlock.end }))
    this.tweenBlocks.stashTweenBlocks();
    this.undoQueue.add(this.undoStashFrame(stashedTweenBlocks));
  }

  private undoStashFrame = (stashedTweenBlocks: TweenBlockWithCoords[]) => () => {
    const getOffset = getTimingFunction(this.uiControls.state.timingFunction);
    const popped = this.frames.pop();
    const poppedDuration = popped.wait + popped.fade;
    this.setElapsed(this.elapsed - poppedDuration);
    const last = this.frames[this.frames.length - 1];
    this.tweenBlocks.clear();
    this.tweenBlocks.erasePastTweenBlocks(stashedTweenBlocks);
    for (let j = 0; j < this.g.nRows; j++)
      for (let i = 0; i < this.g.nCols; i++) {
        const newColorIdx = popped.grid[j][i];
        const offset = getOffset(j, i);
        if (last.grid[j][i] != newColorIdx) {
          this.tweenBlocks.addTweenBlock(j, i, newColorIdx, {
            start: this.elapsed + offset,
            end: this.elapsed + poppedDuration + offset,
          });
        }
      }
  }

  private recolor = () => {
    const uiState = this.uiControls.state;
    this.addUndoToOldTriangleGrid();
    const from = uiState.curAltColorIdx + 1;
    const to = uiState.curColorIdx + 1;
    const { nRows, nCols } = this.g
    if (!constants.colors[to - 1]) { return; }
    for (let j = 0; j < nRows; j++) {
      for (let i = 0; i < nCols; i++) {
        if (this.triColors[j][i] + 1 === from) {
          this.setTriangleColor(j, i, (to - 1));
        }
      }
    }
  }

  private random = () => {
    const { nRows, nCols } = this.g
    this.addUndoToOldTriangleGrid();
    const percent = 0.7;
    for (let j = 0; j < nRows; j++) {
      for (let i = 0; i < nCols; i++) {
        if (Math.random() < percent) {
          const colorIdx = Math.floor(Math.random() * constants.colors.length);
          this.setTriangleColor(j, i, colorIdx);
        }
      }
    }
  }

  private play = () => {
    if (this.isPlaying) {
      if (this.g.tl.paused()) {
        this.g.tl.play();
      } else {
        this.g.tl.pause();
      }
      return;
    }
    this.eventChannel.dispatch({
      type: 'load_animation_editor_to_timeline',
      payload: { frames: this.frames },
    })
    this.g.tl.timeScale(this.uiControls.state.speed);
    let t = 0;
    while (t < this.g.tl.totalDuration()) {
      this.g.tl.add(() => this.setElapsedDisplay(this.g.tl.time()), t);
      t += 0.1;
    }
    this.g.tl.eventCallback("onComplete", () => {
      this.eventChannel.dispatch({ type: 'animation_finished' });
    });
    // undo: pause and reset
    this.undoQueue.add(() => {
      this.g.tl.pause();
      this.eventChannel.dispatch({ type: 'animation_finished' });
    })
    this.setElapsedDisplay(0);
    this.isPlaying = true;
    this.g.tl.play();
  }

  // private drawFrame = (idx: number) => {
  //   if (this.frames[idx]) {
  //     const grid = this.frames[idx].grid;
  //     grid.forEach((row, j) => {
  //       row.forEach((colIdx, i) => {
  //         const color = this.g.config.colors[colIdx];
  //         this.eventChannel.dispatch({ type: 'triangle_fill', payload: { j, i, color } });
  //       })
  //     })
  //   }
  // }

  private redrawCurrentFrame = () => {
    this.eventChannel.dispatch({
      type: 'triangles_draw_grid',
      payload: { grid: this.triColors }
    });
  }

  private addUndoToOldTriangleGrid = () => {
    const { nRows, nCols } = this.g
    const oldGrid = gridCopy(this.triColors);
    this.undoQueue.add(() => {
      for (let j = 0; j < nRows; j++) {
        for (let i = 0; i < nCols; i++) {
          this.setTriangleColor(j, i, oldGrid[j][i]);
        }
      }
    })
  }

  private save = () => serializer.saveToLocalStorage(this.frames, this.uiControls.state.animationName);

  private load = () => {
    this.eventChannel.dispatch({
      type: 'load_animation_localstorage_to_editor',
      payload: { name: this.uiControls.state.animationName },
    })
  }

  private loadFrames = (replace: boolean) => (payload: { frames: FrameWithGrid[] }) => {
    const oldTriColors = gridCopy(this.triColors);
    const oldFramesLength = this.frames.length;
    this.triColors = gridCopy(payload.frames[payload.frames.length - 1].grid);
    this.frames = replace
      ? payload.frames
      : this.frames.concat(payload.frames.slice(1));
    const finalPosition = this.tweenBlocks.loadFromFrames(this.frames);
    this.setElapsed(finalPosition);
    this.redrawCurrentFrame();
    // undo: remove all the frames and reset to that point
    this.undoQueue.add(() => {
      this.triColors = oldTriColors;
      this.frames = this.frames.slice(0, oldFramesLength);
      const finalPosition = this.tweenBlocks.loadFromFrames(this.frames);
      this.setElapsed(finalPosition);
      this.redrawCurrentFrame();
    })
  }

}

export default Editor;