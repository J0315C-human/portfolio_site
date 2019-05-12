import { TimelineLite } from 'gsap';
import { CoordFit } from './typings';
import constants from './constants';


export interface TriangleConfig { startX: number, startY: number; }


export default class Globals {
  tl: TimelineLite;
  mode: 'editor' | 'normal';
  pageWidth: number;
  pageHeight: number;
  nRows: number;
  nCols: number;
  renderType: 'svg' | 'canvas';
  scrollPos: number;
  lastUpdate: number;
  scaleAll: number;
  isMobile: boolean;
  triWidth: number;
  triHeight: number;
  config: {
    lTriConfig: TriangleConfig;
    rTriConfig: TriangleConfig;
  }

  private IDEAL_NUM_TRIANGLES: number;

  constructor() {

    const pageWidth = document.getElementById("outer").clientWidth;
    const pageHeight = document.getElementById("outer").clientHeight;

    const runEditor = window.localStorage.getItem("editor");
    this.mode = (runEditor && runEditor === 'true') ? 'editor' : 'normal';

    this.pageWidth = pageWidth;
    this.pageHeight = pageHeight;
    this.IDEAL_NUM_TRIANGLES = ((500 * 0.4) + ((pageWidth * pageHeight) / 3000) * 0.6);
    this.isMobile = pageHeight > pageWidth;
    // start everything at maximums
    const initialFit = {
      cols: constants.maxCols,
      rows: constants.maxRows,
      scale: this.getScaleForXCols(constants.maxCols)
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

    var tl = new TimelineLite();
    tl.pause();

    this.tl = tl;
    (window as any).tl = tl;
    this.nRows = nRows;
    this.renderType = 'canvas';
    this.nCols = nCols;
    this.scrollPos = 0;
    this.lastUpdate = 0;
    this.scaleAll = scaleAll;
    this.triWidth = constants.triangleRelWidth * scaleAll;
    this.triHeight = constants.triangleRelHeight * scaleAll;
    this.config = {
      lTriConfig,
      rTriConfig,
    }
  }

  getScaleForXCols = (cols: number) => this.pageWidth / (constants.triangleRelWidth * cols);

  // get a relatively equal number of triangles for any aspect ratio
  getBestFit = (): CoordFit => {
    const { pageHeight, IDEAL_NUM_TRIANGLES } = this;
    const nRowsForXCols = (cols: number, scale: number) => Math.ceil(pageHeight / (constants.triangleRelHeight * scale)) + 1;

    const firstScale = this.getScaleForXCols(constants.minCols);
    const firstRows = nRowsForXCols(constants.minCols, firstScale);
    let bestFit: CoordFit = {
      cols: constants.minCols,
      rows: firstRows,
      scale: firstScale,
      distFromIdeal: Math.abs(constants.minCols * firstRows - IDEAL_NUM_TRIANGLES)
    };
    for (let cols = constants.minCols + 1; cols <= constants.maxCols; cols++) {
      const scale = this.getScaleForXCols(cols);
      const rows = nRowsForXCols(cols, scale);
      const distFromIdeal = Math.abs(cols * rows - IDEAL_NUM_TRIANGLES);
      if (!bestFit || ((distFromIdeal < bestFit.distFromIdeal) && (rows <= constants.maxRows))) {
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
    this.triWidth = constants.triangleRelWidth * scaleAll;
    this.triHeight = constants.triangleRelHeight * scaleAll;
    constants.centerX = this.nCols / 2;
    constants.centerY = this.nRows / 2;
  }
}