import { PatternData } from "../typings";
import { Frame } from "./typings";
import g from "../globals";
import { retileGrid } from "../utils";

const colors = g.config.colors;

export const getPatternsFromFrames = (frames: Frame[]) => {
  const patterns: PatternData[] = [];
  const getZeroOffset = () => 0;
  frames.forEach((frame, n) => {
    const lastGrid = n > 0 ? frames[n - 1].grid : undefined;
    const pattern: PatternData = {
      getColor: (col, row) => {
        const colorIdx = frame.grid[row][col];
        if (lastGrid && lastGrid[row][col] === colorIdx) { return undefined; }
        else { return colors[colorIdx]; }
      },
      getDuration: () => frame.fade,
      getOffset: getZeroOffset,
      wait: frame.wait,
    }
    patterns.push(pattern);
  })
  return patterns;
}


export const loadFromLocalStorage = () => {
  const json = window.localStorage.getItem('animation');
  const parsed = JSON.parse(json) as Frame[];

  const retiled = parsed.map(frame => ({
    wait: frame.wait,
    fade: frame.fade,
    grid: retileGrid(frame.grid, g.nRows, g.nCols),
  }));
  return retiled;

}

const deserializer = {
  getPatternsFromFrames,
  loadFromLocalStorage,
}
export default deserializer;