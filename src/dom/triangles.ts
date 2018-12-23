import Globals from '../globals';
import EventChannel from '../editor/EventChannel';
import constants from '../constants';

const svgNS = "http://www.w3.org/2000/svg";
const lPath = "M119.486 125.534L17.052 66.368l102.495-58.89-.06 118.056z";
const rPath = "M121.361 10.228l102.434 59.166-102.494 58.89.06-118.056z";

export default class Triangles {
  g: Globals;
  triangles: SVGElement[][];
  svgOuter: HTMLElement;
  eventChannel: EventChannel;
  constructor(globals: Globals, eventChannel: EventChannel) {
    this.g = globals;
    this.svgOuter = document.getElementById("svg")
    this.triangles = [];
    this.eventChannel = eventChannel;
    this.subscribeEvents();
  }

  initialize = () => {
    this.setInitialSizing();
    this.createTriangles();
  }

  setInitialSizing = () => {
    const { pageHeight, pageWidth } = this.g;
    const svgOuter = this.svgOuter;
    svgOuter.style.width = `${pageWidth}px`;
    svgOuter.style.height = `${pageHeight}px`;
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
    const group = this.svgOuter;
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

  private fill = (payload: { j: number, i: number, color: string }) => this.triangles[payload.j][payload.i].setAttribute('fill', payload.color);


  private setOnPointerDown = (payload: { j: number, i: number, handler: (el: SVGElement) => (e: PointerEvent) => void }) => {
    const tri = this.triangles[payload.j][payload.i];
    tri.onpointerdown = payload.handler(tri);
  }

  private setOnPointerEnter = (payload: { j: number, i: number, handler: (el: SVGElement) => (e: PointerEvent) => void }) => {
    const tri = this.triangles[payload.j][payload.i];
    tri.onpointerenter = payload.handler(tri);
  }

  private applyElementToCall = (payload: { j: number, i: number, call: (el: SVGElement) => void }) => {
    const tri = this.triangles[payload.j][payload.i];
    payload.call(tri);
  }

  private subscribeEvents = () => {
    this.eventChannel.subscribe('triangles_init', this.initialize);
    this.eventChannel.subscribe('triangle_fill', this.fill);
    this.eventChannel.subscribe('triangles_draw_grid', this.drawGrid);
    this.eventChannel.subscribe('triangle_set_onpointerdown', this.setOnPointerDown);
    this.eventChannel.subscribe('triangle_set_onpointerenter', this.setOnPointerEnter);
    this.eventChannel.subscribe('triangle_call', this.applyElementToCall);
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
}
