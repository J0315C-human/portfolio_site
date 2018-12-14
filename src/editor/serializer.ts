import { Frame, FrameCompressed, TriangleDelta, FrameCompressedWithDeltaList, FrameCompressedWithDeltaListSameColor, FrameCompressedWithStringGrid } from "./typings";
import { addEncodings } from "./encodings";

const compressFramesToStringGrids = (frames: Frame[]) => {
  // get starting colors
  const compressed: FrameCompressedWithStringGrid[] = [];
  frames.forEach((frame) => {
    const stringGrid = frame.grid.map(row => row.map(val => `${val}`).join(''));
    compressed.push({ t: 'c', g: stringGrid, w: frame.wait, f: frame.fade })
  })
  return compressed;
}

const compressFramesToDeltas = (frames: Frame[]) => {
  // get starting colors
  const grid = frames[0].grid.map(row => row.map(r => -1));
  const compressed: (FrameCompressedWithDeltaList | FrameCompressedWithDeltaListSameColor)[] = [];
  frames.forEach((frame) => {
    const changes: TriangleDelta[] = [];
    let sameColor = true;
    let lastColor = undefined;
    frame.grid.forEach((row, j) => {
      row.forEach((colorIdx, i) => {
        if (grid[j][i] === colorIdx) { return; }
        else {
          if (lastColor !== undefined && colorIdx !== lastColor) {
            sameColor = false;
          }
          lastColor = colorIdx;
          grid[j][i] = colorIdx;
          changes.push({ j, i, c: colorIdx });
        }
      })
    });
    if (sameColor && lastColor !== undefined) {
      compressed.push({
        t: 'b',
        d: changes.map(chg => ({ i: chg.i, j: chg.j })),
        c: lastColor,
        w: frame.wait, f: frame.fade
      });
    } else {
      compressed.push({ t: 'a', d: changes, w: frame.wait, f: frame.fade });
    }
  })
  return compressed;
}

const encodeFramesCompressed = (frames: FrameCompressed[]) => {
  return frames.map(frame => {
    if (frame.t === 'a') { return encodeFrameCompressedWithDeltaList(frame); }
    else if (frame.t === 'b') { return encodeFrameCompressedWithDeltaListSameColor(frame); }
    else if (frame.t === 'c') { return encodeFrameCompressedWithStringGrid(frame); }
    else return 'ERROR';
  });
}
const encodeFrameCompressedWithDeltaList = (frame: FrameCompressedWithDeltaList) => {
  const { f, w, d } = frame;
  return `${f},${w}$${d.map(delta => `${delta.j},${delta.i},${delta.c}`).join(':')}`;
}
const encodeFrameCompressedWithDeltaListSameColor = (frame: FrameCompressedWithDeltaListSameColor) => {
  const { f, w, c, d } = frame;
  return `${f},${w},${c}&${d.map(delta => `${delta.j},${delta.i}`).join(':')}`;

}
const encodeFrameCompressedWithStringGrid = (frame: FrameCompressedWithStringGrid) => {
  const { f, w, g } = frame;
  return `${f},${w}^${g.join(':')}`;
}

const mergeCompressionResults = (a: string[], b: string[]) => {
  const best = [];
  a.forEach((str, i) => {
    if (str.length <= b[i].length) {
      best.push(str);
    } else {
      best.push(b[i]);
    }
  })
  return best;
}

const stats = (x: number) => `${x} chars / ${(x / 1024).toFixed(2)} KB`;

const compressAndEncodeFrames = (frames: Frame[]) => {
  const compDeltas = compressFramesToDeltas(frames);
  const compString = compressFramesToStringGrids(frames);

  const encDeltas = encodeFramesCompressed(compDeltas);
  const encString = encodeFramesCompressed(compString);

  const shortDeltas = encDeltas.map(addEncodings);
  const shortString = encString.map(addEncodings);

  const start = JSON.stringify(frames).length;
  const d1 = JSON.stringify(compDeltas).length;
  const d2 = JSON.stringify(encDeltas).length;
  const d3 = JSON.stringify(shortDeltas).length;

  const s1 = JSON.stringify(compString).length;
  const s2 = JSON.stringify(encString).length;
  const s3 = JSON.stringify(shortString).length;

  const best = mergeCompressionResults(shortDeltas, shortString).join(';');
  console.log(`uncompressed: ${start}`);

  console.log('Deltas:');
  console.log(`--compressed: ${stats(d2)}, ` + (100 * d1 / start).toFixed(2) + ' %');
  console.log(`-----encoded: ${stats(d3)}, ` + (100 * d2 / d1).toFixed(2) + ' %');
  console.log(`---shortened: ${stats(d3)}, ` + (100 * d3 / d2).toFixed(2) + ' %');
  console.log('ratio: ' + (100 * d3 / start).toFixed(2) + ' %');
  console.log('Grids:');
  console.log(`--compressed: ${stats(s2)}, ` + (100 * s1 / start).toFixed(2) + ' %');
  console.log(`-----encoded: ${stats(s3)}, ` + (100 * s2 / s1).toFixed(2) + ' %');
  console.log(`---shortened: ${stats(s3)}, ` + (100 * s3 / s2).toFixed(2) + ' %');
  console.log('ratio: ' + (100 * s3 / start).toFixed(2) + ' %');
  console.log('BEST ratio: ' + (100 * best.length / start).toFixed(2) + ' %');
  return best;
}

const saveToLocalStorage = (frames: Frame[]) => window.localStorage.setItem('animation', compressAndEncodeFrames(frames));
const serializer = {
  saveToLocalStorage,
}

export default serializer;