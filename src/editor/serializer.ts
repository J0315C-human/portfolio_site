import { FrameType, TriangleDelta, FrameWithDeltas, FrameWithGrid, AnimationSlug, AnimationSlugEncoded } from "./typings";
import { addEncodings } from "./encodings";

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

const slugifyFrames = (frames: FrameType[]): AnimationSlug[] => {

  const slugifyFrameWithDeltas = (frame: FrameWithDeltas) => {
    const { fade: f, wait: w, deltas: d } = frame;
    return `${f},${w}$${d.map(delta => `${delta.j},${delta.i},${delta.c}`).join(':')}`;
  }

  const slugifyFrameWithGrid = (frame: FrameWithGrid) => {
    const { fade: f, wait: w, grid: g } = frame;
    const rowStrings = g.map(row => row.join(''));
    return `${f},${w}^${rowStrings.join(':')}`;
  }

  return frames.map(frame => {
    if (frame.type === 'deltas') { return slugifyFrameWithDeltas(frame); }
    else if (frame.type === 'grid') { return slugifyFrameWithGrid(frame); }
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

const compressAndEncodeFrames = (frames: FrameWithGrid[]) => {
  const deltas = convertFrameGridsToDeltas(frames);
  const grids = frames;

  const deltaSlugs = slugifyFrames(deltas);
  const gridSlugs = slugifyFrames(grids);

  const encDeltaSlugs = deltaSlugs.map(addEncodings);
  const encGridSlugs = gridSlugs.map(addEncodings);

  const best = mergeCompressionResults(encDeltaSlugs, encGridSlugs).join(';');

  // get sizes
  const start = JSON.stringify(frames).length;
  const d1 = JSON.stringify(deltas).length;
  const d2 = JSON.stringify(deltaSlugs).length;
  const d3 = JSON.stringify(encDeltaSlugs).length;

  const s1 = JSON.stringify(grids).length;
  const s2 = JSON.stringify(gridSlugs).length;
  const s3 = JSON.stringify(encGridSlugs).length;
  console.log(`uncompressed: ${stats(start)}`);

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

const saveToLocalStorage = (frames: FrameWithGrid[]) => window.localStorage.setItem('animation', compressAndEncodeFrames(frames));
const serializer = {
  saveToLocalStorage,
}

export default serializer;