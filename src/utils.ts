import { FrameWithGrid } from "./editor/typings";
import Globals from "./globals";
import { PatternData } from "./typings";
import { getTimingFunction } from './patterns/timingFunctions';
import constants from "./constants";
import Random from "./prng";

export const retileGrid = (grid: any[][], rows: number, cols: number) => {
  const newGrid = [];
  for (let j = 0; j < rows; j++) {
    const newRow = [];
    const row = grid[j % grid.length];
    for (let i = 0; i < cols; i++) {
      newRow.push(row[i % row.length]);
    }
    newGrid.push(newRow);
  }
  return newGrid;
}

export const gridCopy = (grid: any[][]) => grid.map((row) => [...row])

export const gridFlippedDiag = (grid: any[][]) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = [];
  for (let j = 0; j < cols; j++) {
    const newRow = [];
    for (let i = 0; i < rows; i++) {
      newRow.push(grid[i][j]);
    }
    newGrid.push(newRow);
  }
  return newGrid;
}

export const getPatternsFromFrames = (frames: FrameWithGrid[], g: Globals): PatternData[] => {
  const patterns: PatternData[] = [];
  const colors = constants.colors;
  frames.forEach((frame, n) => {
    const lastGrid = n > 0 ? frames[n - 1].grid : undefined;
    const pattern: PatternData = {
      getColor: (col, row) => {
        if (!frame.grid[row]) { return colors[0]; }
        const colorIdx = frame.grid[row][col];
        if (lastGrid && lastGrid[row][col] === colorIdx) { return undefined; }
        else { return constants.getColorVariation(colorIdx, row, g); }
      },
      fade: frame.fade,
      getOffset: getTimingFunction(frame.timingFunc),
      wait: frame.wait,
    }
    patterns.push(pattern);
  })
  return patterns;
}


const _offsetMultiplier = 0.07;
export const offsetPositionRandomly = (x: number, y: number, triangleWidth: number) => {
  const rand = new Random(Math.floor(x * y))
  const xOffset = (rand.nextFloat() - 0.5) * triangleWidth * _offsetMultiplier;
  const yOffset = (rand.nextFloat() - 0.5) * triangleWidth * _offsetMultiplier;
  return {
    x: x + xOffset,
    y: y + yOffset
  }
}