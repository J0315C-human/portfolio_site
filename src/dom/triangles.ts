import Globals from '../globals';
import EventChannel from '../editor/EventChannel';
import constants from '../constants';

const svgNS = "http://www.w3.org/2000/svg";
const lPath = "M119.486 125.534L17.052 66.368l102.495-58.89-.06 118.056z";
const rPath = "M121.361 10.228l102.434 59.166-102.494 58.89.06-118.056z";

export interface CanvasTriangle {
  color: string;
  isLeft: boolean;
}

export default class Triangles {
  g: Globals;
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  canvasTriangles: CanvasTriangle[][];
  triangles: SVGElement[][];
  rootGroup: HTMLElement;
  eventChannel: EventChannel;
  colWidthCanvas: number;
  rowHeightCanvas: number;
  leftTrianglePath: { x: number, y: number }[];
  rightTrianglePath: { x: number, y: number }[];
  constructor(globals: Globals, eventChannel: EventChannel) {
    this.g = globals;
    this.rootGroup = document.getElementById("rootGroup");
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.canvasCtx = this.canvas.getContext('2d');
    this.triangles = [];
    this.canvasTriangles = [];
    this.eventChannel = eventChannel;
    this.subscribeEvents();

  }

  private initCanvasSizing = () => {

    const _widthRatio = Math.sqrt(3);
    this.rowHeightCanvas = this.g.triHeight;
    this.colWidthCanvas = _widthRatio * this.rowHeightCanvas;
    this.rightTrianglePath = [
      { x: 0, y: this.rowHeightCanvas },
      { x: this.colWidthCanvas, y: 0 },
      { x: this.colWidthCanvas, y: this.rowHeightCanvas * 2 },
      { x: 0, y: this.rowHeightCanvas },
    ]

    this.leftTrianglePath = [
      { x: 0, y: 0 },
      { x: this.colWidthCanvas, y: this.rowHeightCanvas },
      { x: 0, y: this.rowHeightCanvas * 2 },
      { x: 0, y: 0 },
    ]
  }

  initialize = () => {
    if (this.g.renderType === 'svg') {
      this.setInitialSizing();
      this.createTriangles();
    } else {
      this.initCanvasSizing();
      this.setInitialCanvasSizing();
      this.createCanvasTriangles();
      window.requestAnimationFrame(this.onCanvasFrame);
    }
  }

  setInitialSizing = () => {
    const { pageHeight, pageWidth } = this.g;
    const rootGroup = this.rootGroup;
    rootGroup.style.width = `${pageWidth}px`;
    rootGroup.style.height = `${pageHeight}px`;
  }

  setInitialCanvasSizing = () => {
    const { pageHeight, pageWidth } = this.g;
    const canvas = this.canvas;
    canvas.width = pageWidth;
    canvas.height = pageHeight;
  }

  private getLeftTriangle = (x, y) => { return this.getTriangle(lPath, this.g.config.lTriConfig)(x, y); }
  private getRightTriangle = (x, y) => { return this.getTriangle(rPath, this.g.config.rTriConfig)(x, y); }

  private getTriangle = (path, config) => (x, y) => {
    const { scaleAll, triWidth, triHeight } = this.g;
    const { colors } = constants;

    const el = document.createElementNS(svgNS, "path");
    el.classList.add('triangle');
    el.setAttribute("d", path);
    el.setAttribute("fill", colors[0]);
    el.setAttribute("strokeWidth", '0');
    el.style.transform = `translate(${config.startX +
      x * triWidth}px,${config.startY + y * triHeight}px) scale(${scaleAll})`;
    return el;
  };

  private createTriangles = () => {
    const { nRows, nCols } = this.g;
    const group = this.rootGroup;
    while (group.firstChild) { group.removeChild(group.firstChild); };
    this.triangles = [];
    for (let j = 0; j < nRows; j++) {
      const row = [];
      for (let i = 0; i < nCols; i++) {
        const evenRow = j % 2 === 0;
        const evenCol = i % 2 === 0;
        const isLeft = evenRow ? evenCol : !evenCol;
        const tri = isLeft ? this.getRightTriangle(i, j) : this.getLeftTriangle(i, j);

        group.appendChild(tri);
        row.push(tri);
      }
      this.triangles.push(row);
    }
  }

  private createCanvasTriangles = () => {
    const { nRows, nCols } = this.g;
    this.canvasTriangles = [];
    for (let j = 0; j < nRows; j++) {
      const row = [];
      for (let i = 0; i < nCols; i++) {
        const evenRow = j % 2 === 0;
        const evenCol = i % 2 === 0;
        const isLeft = evenRow ? evenCol : !evenCol;
        const canvasTriangle: CanvasTriangle = {
          isLeft, color: constants.colors[0]
        }
        row.push(canvasTriangle);
      }
      this.canvasTriangles.push(row);
    }
  }

  private fill = (payload: { j: number, i: number, color: string }) => this.triangles[payload.j][payload.i].setAttribute('fill', payload.color);

  private setOnPointerDown = (payload: { j: number, i: number, handler: (el: SVGElement) => (e: PointerEvent) => void }) => {
    const tri = this.triangles[payload.j][payload.i];
    tri.onpointerdown = payload.handler(tri);
  }

  private setOnPointerEnter = (payload: { j: number, i: number, handler: (el: SVGElement) => (e: PointerEvent) => void }) => {
    const tri = this.triangles[payload.j][payload.i];
    tri.onpointerenter = payload.handler(tri);
  }

  private applyElementToCall = (payload: { j: number, i: number, call: (el: SVGElement | CanvasTriangle) => void }) => {
    if (this.g.renderType === 'svg') {
      const tri = this.triangles[payload.j][payload.i];
      payload.call(tri);
    } else {
      const canvasTri = this.canvasTriangles[payload.j][payload.i];
      payload.call(canvasTri);
    }
  }

  private subscribeEvents = () => {
    this.eventChannel.subscribe('triangles_init', this.initialize);
    this.eventChannel.subscribe('triangle_call', this.applyElementToCall);
    // editor only:
    this.eventChannel.subscribe('triangle_fill', this.fill);
    this.eventChannel.subscribe('triangles_draw_grid', this.drawGrid);
    this.eventChannel.subscribe('triangle_set_onpointerdown', this.setOnPointerDown);
    this.eventChannel.subscribe('triangle_set_onpointerenter', this.setOnPointerEnter);
  }

  private drawGrid = (payload: { grid: number[][] }) => {
    payload.grid.forEach((row, j) => {
      row.forEach((colIdx, i) => {
        const color = constants.colors[colIdx];
        const el = this.triangles[j][i];
        el.setAttribute('fill', color);
      })
    })
  }

  private drawCanvasTriangles = () => {
    const ctx = this.canvasCtx;
    this.canvasTriangles.forEach((row, j) => {
      row.forEach((tri, i) => {
        const startX = i * this.colWidthCanvas;
        const startY = (j - 1) * this.rowHeightCanvas;
        ctx.fillStyle = tri.color;
        if (tri.isLeft) {

          ctx.moveTo(startX + this.leftTrianglePath[0].x, startY + this.leftTrianglePath[0].y);
          ctx.beginPath();
          this.leftTrianglePath.forEach((point, n) => {
            if (n === 0) return;
            ctx.lineTo(startX + point.x, startY + point.y)
          });
        } else {
          ctx.moveTo(startX + this.rightTrianglePath[0].x, startY + this.rightTrianglePath[0].y);
          ctx.beginPath();
          this.rightTrianglePath.forEach((point, n) => {
            if (n === 0) return;
            ctx.lineTo(startX + point.x, startY + point.y)
          });
        }
        ctx.closePath();
        ctx.fill();
      })
    })
  }

  private onCanvasFrame = () => {
    this.drawCanvasTriangles();
    window.requestAnimationFrame(this.onCanvasFrame);
  }
}
