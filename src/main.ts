import { TimelineLite, TweenLite, Linear } from 'gsap';
import './assets/styles.css';

const initialColor = "#444";
const outer = document.getElementById("outer");
const svgOuter = document.getElementById("svg");
const pageWidth = outer.clientWidth;
const pageHeight = outer.clientHeight;
const throttleScrollUpdates = 25;

const scaleAll = 0.7;
svgOuter.style.width = `${pageWidth}px`;
svgOuter.style.height = `${pageHeight}px`;

const nudge = -9.2;
const rightConfig = {
  startX: -122 * scaleAll,
  startY: (-60 + nudge) * scaleAll
};
const leftConfig = {
  startX: -17.7 * scaleAll,
  startY: (-57 + nudge) * scaleAll
};

const width = 101.8 * scaleAll;
const height = 58.3 * scaleAll;

const nRows = Math.ceil(pageHeight / height) + 1;
const nCols = Math.ceil(pageWidth / width);

console.log({ nRows, nCols });
const colors = [
  "#74556D",
  "#888",
  "#22A5ED",
  "#DEDE99",
  "#D399ab",
  "#F29583",
  "#FF33BB",
  "#86ca97"
];
 
const getColor = idx => (col, row) => colors[idx];

const pattern0 = (col, row) =>
  row % 2 ? (col % 2 ? "#D399ab" : "#A0B") : col % 2 ? "#FF33BB" : "#000";

const pattern1 = (col, row) => colors[col % 3];

const pattern2 = (col, row) => colors[2 + 2 * (col % 2) + row % 2];

const pattern3 = (col, row) => colors[2 + Math.ceil(col / 2) % 4];

const pattern4 = (col, row) => colors[(col + row) % colors.length];
const sectionFuncs = [
  getColor(0),
  pattern4,
  pattern2,
  getColor(4),
  pattern3,
  pattern0,
  pattern1,
  getColor(7),
];

const getTriangle = (path, config) => (x, y) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "path");
  el.setAttribute("d", path);
  el.setAttribute("fill", initialColor);
  el.setAttribute("strokeWidth", '0');
  el.style.transform = `translate(${config.startX +
    x * width}px,${config.startY + y * height}px) scale(${scaleAll})`;
  return el;
};

const getLeftTriangle = getTriangle(
  "M119.486 125.534L17.052 66.368l102.495-58.89-.06 118.056z",
  leftConfig
);

const getRightTriangle = getTriangle(
  "M121.361 10.228l102.434 59.166-102.494 58.89.06-118.056z",
  rightConfig
);

const svg = document.getElementById("rootSvg");

const elements = [];
const colorLength = 9 + nCols / 6;
var tl = new TimelineLite();
tl.pause();
// add tweens to timeline for color animations
for (let j = 0; j < nRows; j++) {
  const row = [];
  for (let i = 0; i < nCols; i++) {
    const evenRow = j % 2 === 0;
    const evenCol = i % 2 === 0;
    const isLeft = evenRow ? evenCol : !evenCol;
    const tri = isLeft ? getRightTriangle(i, j) : getLeftTriangle(i, j);

    svg.appendChild(tri);
    row.push(tri);

    const dur = 10;

    sectionFuncs.forEach((func, n) => {
      const startPos = n * colorLength + j * 0.5;

      const color = func(i, j);
      tl.add(
        TweenLite.to(tri, dur, { css: { fill: color }, ease: Linear.easeNone }),
        startPos
      );
    });
  }
  elements.push(row);
}

const totalDur = tl.duration();

const tlMargin = 0.01;
const tlActiveArea = 1 - 2 * tlMargin;
let position;
tl.time((1 - tlMargin) * totalDur);
// set scroll handler
let lastUpdate = 0;

const scrollHandler = () => {
  tl.time((1 - (tlMargin + position * tlActiveArea)) * totalDur);
};

document.getElementById("scrollOuter").onscroll = (e: any) => {
  const now = Date.now();
  if (now - lastUpdate < throttleScrollUpdates) {
    return;
  }
  lastUpdate = now;
  position =
    e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
  // kick off all the expensive rendering in a RAF
  window.requestAnimationFrame(scrollHandler);
};

window.onresize = () => {
  const newWidth = outer.clientWidth;
  const newHeight = outer.clientHeight;
  const hRatio = newWidth / pageWidth;
  const vRatio = newHeight / pageHeight;
  svgOuter.style.transform = `scale(${hRatio}, ${vRatio})`;
};
