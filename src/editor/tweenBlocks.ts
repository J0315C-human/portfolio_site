import { TweenBlock, FrameWithGrid, TweenBlockWithCoords } from "./typings";
import Globals from "../globals";
import { gridCopy } from "../utils";


export default class TweenBlocks {
  prevBlocks: TweenBlock[][][]; // a list of tweenBlocks for each position 
  newBlocks: { j: number, i: number, color: number, tweenBlock: TweenBlock }[];

  g: Globals
  constructor(globals: Globals) {
    this.g = globals;
    this.newBlocks = [];
    this.prevBlocks = [];
    for (let j = 0; j < this.g.nRows; j++) {
      const newRow2 = [] as TweenBlock[][];
      for (let i = 0; i < this.g.nCols; i++) {
        newRow2.push([{ start: 0, end: 0 }]); // initial 'tween blocks' just to start
      }
      this.prevBlocks.push(newRow2);
    }
  }

  clearAllBlocks = () => {
    this.clear();
    this.prevBlocks = [];
    for (let j = 0; j < this.g.nRows; j++) {
      const newRow2 = [] as TweenBlock[][];
      for (let i = 0; i < this.g.nCols; i++) {
        newRow2.push([{ start: 0, end: 0 }]); // initial 'tween blocks' just to start
      }
      this.prevBlocks.push(newRow2);
    }
  }

  clear = () => {
    this.newBlocks = [];
  }

  erasePastTweenBlocks = (tweenBlocks: TweenBlockWithCoords[]) => {
    tweenBlocks.forEach(tbwc => {
      const { i, j, start, end } = tbwc;
      this.prevBlocks[j][i] = this.prevBlocks[j][i].filter(tb =>
        !(tb.start === start && tb.end === end))
    })
  }

  removeTweenBlockAt = (j: number, i: number) => {
    this.newBlocks = this.newBlocks.filter(tb => !(tb.i === i && tb.j === j));
  }

  addTweenBlock = (j: number, i: number, color: number, tweenBlock: TweenBlock) => {
    this.removeTweenBlockAt(j, i);
    this.newBlocks.push({ i, j, color, tweenBlock })
  }

  // true if the animation will overlap with a tweenBlock in the given position
  checkForActiveTweens = (start: number, end: number, j: number, i: number) => {
    const tweenBlockList = this.prevBlocks[j][i];
    return tweenBlockList.some(tb => !(start >= tb.end || end <= tb.start));
  }

  // push all current tweenBlocks to their positions and start new
  stashTweenBlocks = () => {
    this.newBlocks.forEach(tb => {
      this.prevBlocks[tb.j][tb.i].push(tb.tweenBlock);
    })
    this.clear();
  }

  loadFromFrames = (frames: FrameWithGrid[]): number => {
    this.clearAllBlocks();
    const gridState = gridCopy(frames[0].grid);
    let elapsed = 0;
    frames.forEach(frame => {
      const startPos = elapsed + frame.wait;
      const endPos = startPos + frame.fade;
      frame.grid.forEach((row, j) => {
        row.forEach((colorIdx, i) => {
          if (gridState[j][i] !== colorIdx) {
            gridState[j][i] = colorIdx;
            this.addTweenBlock(j, i, colorIdx, {
              start: startPos,
              end: endPos,
            })
          }
        })
      })
      elapsed += frame.wait + frame.fade;
      this.stashTweenBlocks();
    })
    return elapsed;
  }
}