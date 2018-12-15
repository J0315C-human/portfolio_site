import { PatternData } from "../typings";
import { Frame, FrameCompressedWithDeltaList, FrameCompressedWithStringGrid, FrameCompressed, FrameCompressedWithDeltaListSameColor } from "./typings";
import g from "../globals";
import { retileGrid, gridCopy } from "../utils";
import { removeEncodings } from "./encodings";

const colors = g.config.colors;

const decodeFrame = (compressed: string): FrameCompressed => {
  if (compressed.includes('$')) { return decodeFrameCompressedWithDeltaList(compressed); }
  else if (compressed.includes('&')) { return decodeFrameCompressedWithDeltaListSameColor(compressed); }
  else { return decodeFrameCompressedWithStringGrid(compressed); }
}
const decodeFrameCompressedWithDeltaList = (frame: string): FrameCompressedWithDeltaList => {
  // 10.2,3.005$1,1,1:1,2,5
  const [params, deltas] = frame.split('$');
  const [f, w] = params.split(',');
  const d = deltas.split(':');
  return {
    t: 'deltaList',
    f: parseFloat(f),
    w: parseFloat(w),
    d: d.map(change => {
      const [j, i, c] = change.split(',');
      return {
        j: parseInt(j),
        i: parseInt(i),
        c: parseInt(c)
      }
    })
  }
}

const decodeFrameCompressedWithDeltaListSameColor = (frame: string): FrameCompressedWithDeltaListSameColor => {
  // 10.2,3.005,4&1,1:1,2
  const [params, deltas] = frame.split('&');
  const [f, w, c] = params.split(',');
  const d = deltas.split(':');
  return {
    t: 'deltaListSameColor',
    f: parseFloat(f),
    w: parseFloat(w),
    c: parseInt(c),
    d: d.map(change => {
      const [j, i] = change.split(',');
      return {
        j: parseInt(j),
        i: parseInt(i),
      }
    })
  }
}
const decodeFrameCompressedWithStringGrid = (frame: string): FrameCompressedWithStringGrid => {
  // 10.2,3.005^14325:00324:10101
  const [params, rows] = frame.split('^');
  const [f, w] = params.split(',');
  return {
    t: 'stringGrid',
    f: parseFloat(f),
    w: parseFloat(w),
    g: rows.split(':'),
  }
}

const getFrameFromFrameCompressedWithDeltaList = (frame: FrameCompressedWithDeltaList, lastGrid: number[][]) => {
  const f: Frame = {
    wait: frame.w,
    fade: frame.f,
    grid: lastGrid.map((row, j) => row.map((col, i) => {
      const delta = frame.d.find(d => d.i === i && d.j === j);
      if (!delta) { return lastGrid[j][i]; }
      else { return delta.c; }
    })),
  }
  return f;
}
const getFrameFromFrameCompressedWithDeltaListSameColor = (frame: FrameCompressedWithDeltaListSameColor, lastGrid: number[][]) => {
  const f: Frame = {
    wait: frame.w,
    fade: frame.f,
    grid: lastGrid.map((row, j) => row.map((col, i) => {
      const delta = frame.d.find(d => d.i === i && d.j === j);
      if (!delta) { return lastGrid[j][i]; }
      else { return frame.c; }
    })),
  }
  return f;
}
const getFrameFromFrameCompressedWithStringGrid = (frame: FrameCompressedWithStringGrid) => {
  const f: Frame = {
    wait: frame.w,
    fade: frame.f,
    grid: frame.g.map(row => row.split('').map(n => parseInt(n, 10))),
  }
  return f;
}

export const getFramesFromEncodedFrames = (encoded: string) => {
  let grid = new Array(g.nRows).fill(0).map(() => new Array(g.nCols).fill(0));
  const decodedFrames: Frame[] = [];
  encoded.split(';')
    .forEach(encodedFrame => {
      const decodedCompressed = decodeFrame(encodedFrame);
      const frame = decodedCompressed.t === 'deltaList' ? getFrameFromFrameCompressedWithDeltaList(decodedCompressed, grid)
        : decodedCompressed.t === 'deltaListSameColor' ? getFrameFromFrameCompressedWithDeltaListSameColor(decodedCompressed, grid)
          : getFrameFromFrameCompressedWithStringGrid(decodedCompressed);
      grid = gridCopy(frame.grid);
      decodedFrames.push(frame);
    })
  return decodedFrames;
}

export const getPatternsFromFrames = (frames: Frame[]) => {
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

export const loadFromLocalStorage = (retileRows = g.nRows, retileCols = g.nCols) => {
  const encoded = removeEncodings(window.localStorage.getItem('animation'));
  const frames = getFramesFromEncodedFrames(encoded);

  const retiled = frames.map(frame => ({
    wait: frame.wait,
    fade: frame.fade,
    grid: retileGrid(frame.grid, retileRows, retileCols),
  }));
  return retiled;
}

const deserializer = {
  getPatternsFromFrames,
  loadFromLocalStorage,
}
export default deserializer;