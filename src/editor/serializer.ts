import { Frame, FrameCompressed, TriangleDelta } from "./typings";

const compressToStringGrids = (frames: Frame[]) => {
  // get starting colors
  const compressed: FrameCompressed[] = [];
  frames.forEach((frame) => {
    const stringGrid = frame.grid.map(row => row.map(val => `${val}`).join(''));
    compressed.push({ t: 'c', g: stringGrid, w: frame.wait, f: frame.fade })
  })
  return compressed;
}

const compressToDeltas = (frames: Frame[]) => {
  // get starting colors
  const grid = frames[0].grid.map(row => row.map(r => -1));
  const compressed: FrameCompressed[] = [];
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
    console.log('    delt: ', compDeltas[i], deltLength);
    console.log(' str: ', compString[i], strLength);
    if (deltLength < strLength) { best.push(compDeltas[i]); }
    else { best.push(compString[i]); }
  }
  console.log(compDeltas.length, compString.length);
  console.log({ delt: JSON.stringify(compDeltas).length, str: JSON.stringify(compString).length, best: JSON.stringify(best).length });
}

const saveToLocalStorage = (frames: Frame[]) => {

  window.localStorage.setItem('animation', JSON.stringify(frames));
  window.localStorage.setItem('animationCompressed', JSON.stringify(compressToDeltas(frames)));
}


const serializer = {
  saveToLocalStorage,
}

export default serializer;