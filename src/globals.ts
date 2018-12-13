import { TimelineLite } from 'gsap';
import { CoordFit } from './typings';

const outer = document.getElementById("outer");
const initialColor = "#888";

const colors = [
  initialColor,
  "#4b4e97",
  "#CCC",
  "#54374a",
  "#333",
  "#2c8bee",
]

const pageWidth = outer.clientWidth;
const pageHeight = outer.clientHeight;

const TRI_WIDTH = 101.8;
const TRI_HEIGHT = 58.3;
const IDEAL_NUM_TRIANGLES = ((500 * 0.4) + ((pageWidth * pageHeight) / 3000) * 0.6);
const MIN_COLS = 1;
const MAX_COLS = 30;
const MAX_ROWS = 50;

const getScaleForXCols = (cols: number) => pageWidth / (TRI_WIDTH * cols);
// get a relatively equal number of triangles for any aspect ratio
const getBestFit = (): CoordFit => {
  const nRowsForXCols = (cols: number, scale: number) => Math.ceil(pageHeight / (TRI_HEIGHT * scale)) + 1;

  const firstScale = getScaleForXCols(MIN_COLS);
  const firstRows = nRowsForXCols(MIN_COLS, firstScale);
  let bestFit: CoordFit = {
    cols: MIN_COLS,
    rows: firstRows,
    scale: firstScale,
    distFromIdeal: Math.abs(MIN_COLS * firstRows - IDEAL_NUM_TRIANGLES)
  };
  for (let cols = MIN_COLS + 1; cols <= MAX_COLS; cols++) {
    const scale = getScaleForXCols(cols);
    const rows = nRowsForXCols(cols, scale);
    const distFromIdeal = Math.abs(cols * rows - IDEAL_NUM_TRIANGLES);
    if (!bestFit || ((distFromIdeal < bestFit.distFromIdeal) && (rows <= MAX_ROWS))) {
      bestFit = { cols, rows, distFromIdeal, scale };
    }
  }
  return bestFit;
}


// start everything at maximums
const initialFit = { cols: MAX_COLS, rows: MAX_ROWS, scale: getScaleForXCols(MAX_COLS) };
const scaleAll = initialFit.scale;
const nRows = initialFit.rows;
const nCols = initialFit.cols;

// position tweaks for triangles
const rTriConfig = {
  startX: -122 * scaleAll,
  startY: -69.2 * scaleAll
};
const lTriConfig = {
  startX: -17.7 * scaleAll,
  startY: -66.2 * scaleAll
};



const throttleScrollUpdates = 23;
const tlMargin = 0.001;
const tlActiveArea = 1 - 2 * tlMargin;


var tl = new TimelineLite();
tl.pause();

let scrollPos = 0;
const g = {
  tl,
  pageWidth,
  pageHeight,
  nRows,
  nCols,
  scrollPos,
  lastUpdate: 0,
  triangles: [] as SVGElement[][],
  scaleAll,
  triWidth: TRI_WIDTH * scaleAll,
  triHeight: TRI_HEIGHT * scaleAll,
  config: {
    lTriConfig,
    rTriConfig,
    throttleScrollUpdates,
    initialColor,
    colors,
    tlMargin,
    tlActiveArea,
  }
};


export const fitToWindow = () => {
  const bestFit = getBestFit();
  const scaleAll = bestFit.scale;
  g.nRows = bestFit.rows;
  g.nCols = bestFit.cols;
  g.scaleAll = scaleAll;
  // position tweaks for triangles
  g.config.rTriConfig = {
    startX: -122 * scaleAll,
    startY: -69.2 * scaleAll
  };
  g.config.lTriConfig = {
    startX: -17.7 * scaleAll,
    startY: -66.2 * scaleAll
  };
  g.triWidth = TRI_WIDTH * scaleAll;
  g.triHeight = TRI_HEIGHT * scaleAll;
}

export default g;