import { TriangleDelta, FrameWithDeltas, FrameWithGrid, AnimationSlug, AnimationSlugEncoded, FrameWithCompressedGrid, CompressedFrameType, FrameWithCompressedDeltas } from "./typings";
import { addEncodings } from "./encodings";
import { compressArrayArrayToDeltasFromLeft } from "./deltas";

const convertFrameGridsToDeltas = (frames: FrameWithGrid[]): FrameWithDeltas[] => {
  // get starting colors
  const grid = frames[0].grid.map(row => row.map(r => -1));
  const compressed: FrameWithDeltas[] = [];
  frames.forEach((frame) => {
    const changes: TriangleDelta[] = [];
    frame.grid.forEach((row, j) => {
      row.forEach((colorIdx, i) => {
        if (grid[j][i] === colorIdx) { return; }
        else {
          grid[j][i] = colorIdx;
          changes.push({ j, i, c: colorIdx });
        }
      })
    });
    compressed.push({
      type: 'deltas',
      deltas: changes,
      wait: frame.wait,
      fade: frame.fade
    });
  })
  return compressed;
}

const compressFrameWithGrid = (frame: FrameWithGrid): FrameWithCompressedGrid => ({
  ...frame,
  grid: compressArrayArrayToDeltasFromLeft(frame.grid),
  type: 'cgrid'
})

const compressFrameWithDeltas = (frame: FrameWithDeltas): FrameWithCompressedDeltas => {
  const arrayed = frame.deltas.map(d => [d.j, d.i, d.c]);
  const comp = compressArrayArrayToDeltasFromLeft(arrayed);
  return {
  ...frame,
  type: 'cdeltas',
  deltas: comp,
}}

const slugifyFrames = (frames: CompressedFrameType[]): AnimationSlug[] => {

  const slugifyFrameWithDeltas = (frame: FrameWithCompressedDeltas) => {
    const { fade: f, wait: w, deltas: d } = frame;
    return `${f},${w}$${d.map(delta => delta.join(',')).join(':')}`;
    // return `${f},${w}$${d.map(delta => `${delta.j},${delta.i},${delta.c}`).join(':')}`;
  }

  const slugifyFrameWithGrid = (frame: FrameWithCompressedGrid) => {
    const { fade: f, wait: w, grid: g } = frame;
    const rowStrings = g.map(row => row.join(''));
    return `${f},${w}^${rowStrings.join(':')}`;
  }

  return frames.map(frame => {
    if (frame.type === 'cdeltas') { return slugifyFrameWithDeltas(frame); }
    else if (frame.type === 'cgrid') { return slugifyFrameWithGrid(frame); }
    else return 'ERROR';
  });
}

const mergeCompressionResults = (a: AnimationSlugEncoded[], b: AnimationSlugEncoded[]): AnimationSlugEncoded[] => {
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

const serializeFrames = (frames: FrameWithGrid[]) => {
  const deltas = convertFrameGridsToDeltas(frames);
  const grids = frames;

  const deltasCompressed = deltas.map(compressFrameWithDeltas);
  const gridsCompressed = frames.map(compressFrameWithGrid);

  const deltaSlugs = slugifyFrames(deltasCompressed);
  const gridSlugs = slugifyFrames(gridsCompressed);

  const encDeltaSlugs = deltaSlugs.map(addEncodings);
  const encGridSlugs = gridSlugs.map(addEncodings);

  // for (let i = 0; i< deltas.length; i++) {
  //   console.log({delta: deltas[i]});
  //   console.log({deltaComp: deltasCompressed[i]});
  //   console.log({deltaSlug: deltaSlugs[i]});
  //   console.log({encoded: encDeltaSlugs[i]});
  //   console.log('');
  // }

  const best = mergeCompressionResults(encDeltaSlugs, encGridSlugs).join(';');

  // get sizes
  const start = JSON.stringify(frames).length;
  const d0 = JSON.stringify(deltas).length;
  const d1 = JSON.stringify(deltasCompressed).length;
  const d2 = JSON.stringify(deltaSlugs).length;
  const d3 = JSON.stringify(encDeltaSlugs).length;

  const g0 = JSON.stringify(grids).length;
  const g1 = JSON.stringify(gridsCompressed).length;
  const g2 = JSON.stringify(gridSlugs).length;
  const g3 = JSON.stringify(encGridSlugs).length;
  console.log(`uncompressed: ${stats(start)}`);

  console.log('Deltas:');
  console.log(`---deltified: ${stats(d0)}, ` + (100 * d0 / start).toFixed(2) + ' %');
  console.log(`--compressed: ${stats(d1)}, ` + (100 * d1 / d0).toFixed(2) + ' %');
  console.log(`-----slugged: ${stats(d2)}, ` + (100 * d2 / d1).toFixed(2) + ' %');
  console.log(`-----encoded: ${stats(d3)}, ` + (100 * d3 / d2).toFixed(2) + ' %');
  console.log('ratio: ' + (100 * d3 / start).toFixed(2) + ' %');
  console.log('Grids:');
  console.log(`--compressed: ${stats(g1)}, ` + (100 * g1 / g0).toFixed(2) + ' %');
  console.log(`-----slugged: ${stats(g2)}, ` + (100 * g2 / g1).toFixed(2) + ' %');
  console.log(`-----encoded: ${stats(g3)}, ` + (100 * g3 / g2).toFixed(2) + ' %');
  console.log('ratio: ' + (100 * g3 / start).toFixed(2) + ' %');
  console.log('BEST ratio: ' + (100 * best.length / start).toFixed(2) + ' %');
  return best;
}

const saveToLocalStorage = (frames: FrameWithGrid[]) => window.localStorage.setItem('animation', serializeFrames(frames));
const serializer = {
  saveToLocalStorage,
}

export default serializer;