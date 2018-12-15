import { PatternData } from "../typings";
import { FrameWithDeltas, FrameWithGrid, AnimationSlug, AnimationSlugEncoded, FrameWithCompressedGrid, FrameWithCompressedDeltas, CompressedFrameType } from "./typings";
import g from "../globals";
import { retileGrid, gridCopy } from "../utils";
import { removeEncodings } from "./encodings";
import { decompressDeltasToArrayArrayFromLeft } from "./deltas";

const colors = g.config.colors;

const unslugFrame = (slug: AnimationSlug): CompressedFrameType => slug.includes('^')
  ? unslugFrameWithGrid(slug)
  : unslugFrameWithDeltas(slug);

const unslugFrameWithDeltas = (slug: AnimationSlug): FrameWithCompressedDeltas => {
  // 10.2,3.005$1,1,1:1,2,5 or 10.2,3.005&1,1,1:1,2,5
  const IFirst = slug.includes('&');
  const [params, deltas] = IFirst ? slug.split('&') : slug.split('$');
  const [f, w] = params.split(',');
  const compressedDeltas = deltas.split(':');
  return {
    type: 'cdeltas',
    fade: parseFloat(f),
    wait: parseFloat(w),
    deltas: compressedDeltas.map(change => change.split(',').map(digit => parseInt(digit, 10))),
    flipped: IFirst,
  }
}

const unslugFrameWithGrid = (slug: AnimationSlug): FrameWithCompressedGrid => {
  // 10.2,3.005^14325:00324:10101
  const [params, rows] = slug.split('^');
  const [f, w] = params.split(',');
  return {
    type: 'cgrid',
    fade: parseFloat(f),
    wait: parseFloat(w),
    grid: rows.split(':')
      .map(rowString => rowString.split('')
        .map(digit => parseInt(digit, 10))),
  }
}

const decompressFrame = (frame: CompressedFrameType) => frame.type === 'cgrid'
  ? decompressFrameWithGrid(frame)
  : decompressFrameWithDeltas(frame);

const decompressFrameWithGrid = (frame: FrameWithCompressedGrid): FrameWithGrid => ({
  fade: frame.fade,
  wait: frame.wait,
  type: 'grid',
  grid: decompressDeltasToArrayArrayFromLeft(frame.grid),
})

const decompressFrameWithDeltas = (frame: FrameWithCompressedDeltas): FrameWithDeltas => {
  return {
    fade: frame.fade,
    wait: frame.wait,
    type: 'deltas',
    deltas: decompressDeltasToArrayArrayFromLeft(frame.deltas).map(d => {
      return frame.flipped ? { j: d[1], i: d[0], c: d[2] } : { j: d[0], i: d[1], c: d[2] };
    }),
  }
}

const getFrameWithGridFromFrameWithDeltas = (frame: FrameWithDeltas, lastGrid: number[][]): FrameWithGrid => {
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

const getFramesWithGridsFromSlugs = (allSlugsEncoded: AnimationSlugEncoded): FrameWithGrid[] => {
  const allSlugs = removeEncodings(allSlugsEncoded);
  let grid = new Array(g.nRows).fill(0).map(() => new Array(g.nCols).fill(0));
  const frames: FrameWithGrid[] = [];
  allSlugs.split(';')
    .forEach(slug => {
      const unsluggedFrame = unslugFrame(slug);
      const decompressedFrame = decompressFrame(unsluggedFrame);
      const frame = decompressedFrame.type === 'grid' ? decompressedFrame
        : getFrameWithGridFromFrameWithDeltas(decompressedFrame, grid);
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
  const frames = getFramesWithGridsFromSlugs(encodedSlug);

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