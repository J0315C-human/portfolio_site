import g from '../globals';


const svgNS = "http://www.w3.org/2000/svg";
const lPath = "M119.486 125.534L17.052 66.368l102.495-58.89-.06 118.056z";
const rPath = "M121.361 10.228l102.434 59.166-102.494 58.89.06-118.056z";

export const setInitialSizing = () => {
  const { pageHeight, pageWidth } = g;

  const svgOuter = document.getElementById("svg");
  svgOuter.style.width = `${pageWidth}px`;
  svgOuter.style.height = `${pageHeight}px`;
}

const getTriangle = (path, config) => (x, y) => {
  const { scaleAll, triWidth, triHeight } = g;
  const { initialColor } = g.config;

  const el = document.createElementNS(svgNS, "path");
  el.classList.add('triangle');
  el.setAttribute("d", path);
  el.setAttribute("fill", initialColor);
  el.setAttribute("strokeWidth", '0');
  el.style.transform = `translate(${config.startX +
    x * triWidth}px,${config.startY + y * triHeight}px) scale(${scaleAll})`;
  return el;
};

const getLeftTriangle = (x, y) => { return getTriangle(lPath, g.config.lTriConfig)(x, y); }
const getRightTriangle = (x, y) => { return getTriangle(rPath, g.config.rTriConfig)(x, y); }

export const createTriangles = () => {

  const { nRows, nCols } = g;
  const group = document.getElementById("rootGroup");
  while (group.firstChild) { group.removeChild(group.firstChild); };
  g.triangles = [];
  for (let j = 0; j < nRows; j++) {
    const row = [];
    for (let i = 0; i < nCols; i++) {
      const evenRow = j % 2 === 0;
      const evenCol = i % 2 === 0;
      const isLeft = evenRow ? evenCol : !evenCol;
      const tri = isLeft ? getRightTriangle(i, j) : getLeftTriangle(i, j);

      group.appendChild(tri);
      row.push(tri);
    }
    g.triangles.push(row);
  }
}
