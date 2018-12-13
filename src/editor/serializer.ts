import { Frame, FrameCompressed, TriangleDelta, FrameCompressedWithDeltaList, FrameCompressedWithDeltaListSameColor, FrameCompressedWithStringGrid } from "./typings";

const compressToStringGrids = (frames: Frame[]) => {
  // get starting colors
  const compressed: FrameCompressedWithStringGrid[] = [];
  frames.forEach((frame) => {
    const stringGrid = frame.grid.map(row => row.map(val => `${val}`).join());
    compressed.push({ t: 'c', g: stringGrid, w: frame.wait, f: frame.fade })
  })
  return compressed;
}

const compressToDeltas = (frames: Frame[]) => {
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

export const compressFrames = (frames: Frame[]) => {
  const compDeltas = compressToDeltas(frames);
  const compString = compressToStringGrids(frames);
  const best: FrameCompressed[] = [];
  for (let i = 0; i < frames.length; i++) {
    const deltLength = JSON.stringify(compDeltas[i]).length;
    const strLength = JSON.stringify(compString[i]).length;
    if (deltLength < strLength) { best.push(compDeltas[i]); }
    else { best.push(compString[i]); }
  }
  return best;
}
export const encodeFramesCompressed = (frames: FrameCompressed[]) => {
  return frames.map(frame => {
    if (frame.t === 'a') { return encodeFrameCompressedWithDeltaList(frame); }
    else if (frame.t === 'b') { return encodeFrameCompressedWithDeltaListSameColor(frame); }
    else if (frame.t === 'c') { return encodeFrameCompressedWithStringGrid(frame); }
    else return 'ERROR';
  }).join(';');
}
export const encodeFrameCompressedWithDeltaList = (frame: FrameCompressedWithDeltaList) => {
  const { f, w, d } = frame;
  return `${f},${w}$${d.map(delta => `${delta.j},${delta.i},${delta.c}`).join(':')}`;
}
export const encodeFrameCompressedWithDeltaListSameColor = (frame: FrameCompressedWithDeltaListSameColor) => {
  const { f, w, c, d } = frame;
  return `${f},${w},${c}&${d.map(delta => `${delta.j},${delta.i}`).join(':')}`;

}
export const encodeFrameCompressedWithStringGrid = (frame: FrameCompressedWithStringGrid) => {
  const { f, w, g } = frame;
  return `${f},${w}^${g.join(':')}`;
}

const saveToLocalStorage = (frames: Frame[]) => {
  const compressed = compressFrames(frames);
  const encoded = encodeFramesCompressed(compressed);
  const s1 = JSON.stringify(frames).length;
  const s2 = JSON.stringify(compressed).length;
  const s3 = encoded.length;
  console.log(`uncompressed: ${s1} chars / ${Math.ceil(s1 / 1024)} KB`);
  console.log(`--compressed: ${s2} chars / ${Math.ceil(s2 / 1024)} KB`);
  console.log(`-----encoded: ${s3} chars / ${Math.ceil(s3 / 1024)} KB`);
  window.localStorage.setItem('animation', encoded);
}


const serializer = {
  saveToLocalStorage,
}

export default serializer;