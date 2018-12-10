import g from "../globals";
import { TweenLite, Linear } from 'gsap';
import { PatternData } from "../typings";

export const colors = [
  "#4b4e97",
  "#555",
  "#54374a",
  "#3f2878",
  "#999",
  "#333",
  "#2c8bee",
];

const getColor = idx => (col, row) => colors[idx];

const pattern3 = (col, row) => colors[2 + Math.ceil(col / 2) % 4];

const pattern1 = (col, row) => Math.random() > 0.5 ? colors[1] : undefined;

const diagFade = (a: number, b: number) => (col, row) => ((g.nRows - row) * a + (g.nCols - col) * b);
const diagFadeDown = (a: number, b: number) => (col, row) => (g.nRows * a + g.nCols * b) - ((g.nRows - row) * a + (g.nCols - col) * b);

const staggeredDiagFade = (a: number, b: number, staggerAmt: number) => (col, row) => {
  const evenCol = col % 2 === 0;
  const evenRow = row % 2 === 0;
  const delay = (evenCol !== evenRow) ? 0 : staggerAmt;
  return diagFade(a, b)(col, row) + delay;
}
export const patterns: PatternData[] = [
  {
    getColor: getColor(5),
    wait: 0.5,
    getOffset: staggeredDiagFade(0.2, -0.3, 0.5),
    getDuration: () => 5,
  },
  {
    getColor: pattern1,
    wait: 2,
    getOffset: diagFade(0.6, -0.2),
    getDuration: () => 5,
  },
  {
    getColor: getColor(4),
    wait: 0.5,
    getOffset: diagFade(0.6, -0.2),
    getDuration: () => 5,
  },
  {
    getColor: pattern3,
    wait: 0.5,
    getOffset: diagFadeDown(0.4, 0.2),
    getDuration: () => 5,
  },
];

const updateTimelineGlobals = () => {
  const totalDur = g.tl.duration();
  g.tl.time(g.config.tlMargin * totalDur);
}

export const initializePatternAnimations = (patternData: PatternData[]) => {
  patternData.forEach(({ getColor, wait, getDuration, getOffset }, n) => {
    const animStart = g.tl.duration() + wait;
    g.triangles.forEach((row, j) => {
      row.forEach((triangle, i) => {
        const color = getColor(i, j);
        if (!color) { return; };
        const startPos = animStart + getOffset(i, j);
        const duration = getDuration(i, j);

        // tween to the next value
        g.tl.add(TweenLite.to(triangle, duration, { fill: color, ease: Linear.easeNone }), startPos);
      });
    });
  });

  updateTimelineGlobals();
}