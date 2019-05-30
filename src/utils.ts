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

const _offsetMultipliers = {
  center: -0.35,
  centerCorrect: 0.2,
  squirm: 0.4,
  squirmXCorrect: 1.01,
};
export const addPositionDistortion = (x: number, y: number, triangleWidth: number, g: Globals) => {
  if (g.distortType === 'center'){
    const midWidth = g.pageWidth / 2;
    const midHeight = g.pageHeight / 2;
    const xDist = midWidth - x;
    const yDist = midHeight - y;
    const maxMagnitude = Math.sqrt(Math.pow(midHeight, 2) + Math.pow(midWidth, 2));
    const magnitude = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
    const mult = magnitude / maxMagnitude;
    return {
      x: (x + xDist * mult * _offsetMultipliers.center) + xDist * _offsetMultipliers.centerCorrect,
      y: (y + yDist * mult * _offsetMultipliers.center) + yDist * _offsetMultipliers.centerCorrect,
    }
  } else if (g.distortType === 'squirm') {
    const rand = new Random(Math.floor(x * y))
    const xOffset = (rand.nextFloat() - 0.5) * triangleWidth * _offsetMultipliers.squirm;
    const yOffset = (rand.nextFloat() - 0.5) * triangleWidth * _offsetMultipliers.squirm;
    return {
      x: (x + xOffset) * _offsetMultipliers.squirmXCorrect,
      y: y + yOffset
    }
  } else if (g.distortType === 'rotate') {
    const midWidth = g.pageWidth / 2;
    const midHeight = g.pageHeight / 2;
    const xDist = midWidth - x;
    const yDist = midHeight - y;
    const maxMagnitude = Math.sqrt(Math.pow(midHeight, 2) + Math.pow(midWidth, 2));
    const magnitude = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
    const mult = magnitude / maxMagnitude;
    const angle = (mult > 0.55 ? 0 : (0.55 - mult)) + Math.PI;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    return {
      x: (xDist * cosine - yDist * sine) + midWidth,
      y: (xDist * sine + yDist * cosine) + midHeight,
    }
  }else {
    return { x, y };
  }
}