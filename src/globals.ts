import { TimelineLite } from 'gsap';
import { CoordFit } from './typings';


export interface TriangleConfig { startX: number, startY: number; }


export default class Globals {
  tl: TimelineLite;
  pageWidth: number;
  pageHeight: number;
  nRows: number;
  nCols: number;
  scrollPos: number;
  lastUpdate: number;
  scaleAll: number;
  triWidth: number;
  triHeight: number;
  config: {
    lTriConfig: TriangleConfig;
    rTriConfig: TriangleConfig;
    throttleScrollUpdatesMS: number;
    colors: string[];
    tlMargin: number;
    tlActiveArea: number;
  }

  private TRI_WIDTH: number;
  private TRI_HEIGHT: number;
  private IDEAL_NUM_TRIANGLES: number;
  private MIN_COLS: number;
  private MAX_COLS: number;
  private MAX_ROWS: number;

  constructor() {

    const pageWidth = document.getElementById("outer").clientWidth;
    const pageHeight = document.getElementById("outer").clientHeight;

    const colors = [
      "#101615",
      "#2F6876",
      "#96B27D",
      "#7D6336",
      "#EBCE89",
      "#CB6A2E",
      "#662717",
    ]
    
    this.pageWidth = pageWidth;
    this.pageHeight = pageHeight;
    this.TRI_WIDTH = 101.8;
    this.TRI_HEIGHT = 58.3;
    this.IDEAL_NUM_TRIANGLES = ((500 * 0.4) + ((pageWidth * pageHeight) / 3000) * 0.6);
    this.MIN_COLS = 1;
    this.MAX_COLS = 30;
    this.MAX_ROWS = 50;

    // start everything at maximums
    const initialFit = {
      cols: this.MAX_COLS,
      rows: this.MAX_ROWS,
      scale: this.getScaleForXCols(this.MAX_COLS)
    };
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

    const throttleScrollUpdatesMS = 23;
    const tlMargin = 0.001;
    const tlActiveArea = 1 - 2 * tlMargin;

    var tl = new TimelineLite();
    tl.pause();

    this.tl = tl;

    this.nRows = nRows;
    this.nCols = nCols;
    this.scrollPos = 0;
    this.lastUpdate = 0;
    this.scaleAll = scaleAll;
    this.triWidth = this.TRI_WIDTH * scaleAll;
    this.triHeight = this.TRI_HEIGHT * scaleAll;
    this.config = {
      lTriConfig,
      rTriConfig,
      throttleScrollUpdatesMS,
      colors,
      tlMargin,
      tlActiveArea,
    }
  }

  getScaleForXCols = (cols: number) => this.pageWidth / (this.TRI_WIDTH * cols);

  // get a relatively equal number of triangles for any aspect ratio
  getBestFit = (): CoordFit => {
    const { pageHeight, TRI_HEIGHT, MIN_COLS, IDEAL_NUM_TRIANGLES, MAX_COLS, MAX_ROWS } = this;
    const nRowsForXCols = (cols: number, scale: number) => Math.ceil(pageHeight / (TRI_HEIGHT * scale)) + 1;

    const firstScale = this.getScaleForXCols(MIN_COLS);
    const firstRows = nRowsForXCols(MIN_COLS, firstScale);
    let bestFit: CoordFit = {
      cols: MIN_COLS,
      rows: firstRows,
      scale: firstScale,
      distFromIdeal: Math.abs(MIN_COLS * firstRows - IDEAL_NUM_TRIANGLES)
    };
    for (let cols = MIN_COLS + 1; cols <= MAX_COLS; cols++) {
      const scale = this.getScaleForXCols(cols);
      const rows = nRowsForXCols(cols, scale);
      const distFromIdeal = Math.abs(cols * rows - IDEAL_NUM_TRIANGLES);
      if (!bestFit || ((distFromIdeal < bestFit.distFromIdeal) && (rows <= MAX_ROWS))) {
        bestFit = { cols, rows, distFromIdeal, scale };
      }
    }
    return bestFit;
  }

  getGlobalSizingFromWindow = () => {
    const bestFit = this.getBestFit();
    const scaleAll = bestFit.scale;
    this.nRows = bestFit.rows;
    this.nCols = bestFit.cols;
    this.scaleAll = scaleAll;
    // position tweaks for triangles
    this.config.rTriConfig = {
      startX: -122 * scaleAll,
      startY: -69.2 * scaleAll
    };
    this.config.lTriConfig = {
      startX: -17.7 * scaleAll,
      startY: -66.2 * scaleAll
    };
    this.triWidth = this.TRI_WIDTH * scaleAll;
    this.triHeight = this.TRI_HEIGHT * scaleAll;
  }
}