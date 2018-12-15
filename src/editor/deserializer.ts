import { PatternData } from "../typings";
import { FrameWithDeltas, FrameWithGrid, FrameType, AnimationSlug, AnimationSlugEncoded } from "./typings";
import g from "../globals";
import { retileGrid, gridCopy } from "../utils";
import { removeEncodings } from "./encodings";

const colors = g.config.colors;

const unslugFrame = (slug: AnimationSlug): FrameType => slug.includes('$')
  ? unslugFrameWithDeltas(slug)
  : unslugFrameWithGrid(slug);

const unslugFrameWithDeltas = (slug: AnimationSlug): FrameWithDeltas => {
  // 10.2,3.005$1,1,1:1,2,5
  const [params, deltas] = slug.split('$');
  const [f, w] = params.split(',');
  const d = deltas.split(':');
  return {
    type: 'deltas',
    fade: parseFloat(f),
    wait: parseFloat(w),
    deltas: d.map(change => {
      const [j, i, c] = change.split(',');
      return {
        j: parseInt(j),
        i: parseInt(i),
        c: parseInt(c)
      }
    })
  }
}

const unslugFrameWithGrid = (slug: AnimationSlug): FrameWithGrid => {
  // 10.2,3.005^14325:00324:10101
  const [params, rows] = slug.split('^');
  const [f, w] = params.split(',');
  return {
    type: 'grid',
    fade: parseFloat(f),
    wait: parseFloat(w),
    grid: rows.split(':').map(rowString => rowString.split('').map(digit => parseInt(digit))),
  }
}

const getFrameFromFrameWithDeltas = (frame: FrameWithDeltas, lastGrid: number[][]): FrameWithGrid => {
  const f: FrameWithGrid = {
    type: 'grid',
    wait: frame.wait,
    fade: frame.fade,
    grid: lastGrid.map((row, j) => row.map((_, i) => {
      const delta = frame.deltas.find(d => d.i === i && d.j === j);
      if (!delta) { return lastGrid[j][i]; }
      else { return delta.c; }
    })),
  }
  return f;
}

const getFramesFromSlugs = (allSlugsEncoded: AnimationSlugEncoded): FrameWithGrid[] => {
  const allSlugs = removeEncodings(allSlugsEncoded);
  let grid = new Array(g.nRows).fill(0).map(() => new Array(g.nCols).fill(0));
  const frames: FrameWithGrid[] = [];
  allSlugs.split(';')
    .forEach(slug => {
      const unsluggedFrame = unslugFrame(slug);
      const frame = unsluggedFrame.type === 'grid' ? unsluggedFrame
        : getFrameFromFrameWithDeltas(unsluggedFrame, grid);
      grid = gridCopy(frame.grid);
      frames.push(frame);
    })
  return frames;
}

const getPatternsFromFrames = (frames: FrameWithGrid[]) => {
  const patterns: PatternData[] = [];
  const getZeroOffset = () => 0;
  frames.forEach((frame, n) => {
    const lastGrid = n > 0 ? frames[n - 1].grid : undefined;
    const pattern: PatternData = {
      getColor: (col, row) => {
        if (!frame.grid[row]) { return colors[0]; }
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

const loadFromLocalStorage = (retileRows = g.nRows, retileCols = g.nCols): FrameWithGrid[] => {
  const encodedSlug = window.localStorage.getItem('animation')
  const frames = getFramesFromSlugs(encodedSlug);

  const retiled = frames.map(frame => ({
    ...frame,
    grid: retileGrid(frame.grid, retileRows, retileCols),
  }));
  return retiled;
}

const deserializer = {
  getPatternsFromFrames,
  loadFromLocalStorage,
}
export default deserializer;