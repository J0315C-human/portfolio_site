import Globals from '../globals';
import Elements from '../editor/elements';

const svgNS = "http://www.w3.org/2000/svg";
const lPath = "M119.486 125.534L17.052 66.368l102.495-58.89-.06 118.056z";
const rPath = "M121.361 10.228l102.434 59.166-102.494 58.89.06-118.056z";

export default class Triangles {
  g: Globals;
  elements: Elements;
  constructor(globals: Globals, elements: Elements) {
    this.g = globals;
    this.elements = elements;
  }

  setInitialSizing = () => {
    const { pageHeight, pageWidth } = this.g;

    const svgOuter = this.elements.svgOuter;
    svgOuter.style.width = `${pageWidth}px`;
    svgOuter.style.height = `${pageHeight}px`;
  }

  getLeftTriangle = (x, y) => { return this.getTriangle(lPath, this.g.config.lTriConfig)(x, y); }
  getRightTriangle = (x, y) => { return this.getTriangle(rPath, this.g.config.rTriConfig)(x, y); }

  getTriangle = (path, config) => (x, y) => {
    const { scaleAll, triWidth, triHeight } = this.g;
    const { colors } = this.g.config;

    const el = document.createElementNS(svgNS, "path");
    el.classList.add('triangle');
    el.setAttribute("d", path);
    el.setAttribute("fill", colors[0]);
    el.setAttribute("strokeWidth", '0');
    el.style.transform = `translate(${config.startX +
      x * triWidth}px,${config.startY + y * triHeight}px) scale(${scaleAll})`;
    return el;
  };

  createTriangles = () => {
    const { nRows, nCols } = this.g;
    const group = this.elements.rootSvgGroup;
    while (group.firstChild) { group.removeChild(group.firstChild); };
    this.g.triangles = [];
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
      this.g.triangles.push(row);
    }
  }

}
