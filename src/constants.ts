
const colors = [
  "#101615",
  "#7b622d",
  "#29506d",
  "#4e7a99",
  "#6d5787",
  "#4a3546",
  "#142735",
  "#101615",
  "#101615",
  "#101615",
]
/* RGBA versions:
rgba(16, 22, 21, 0.9)
rgba(123, 98, 45, 0.9)
rgba(41, 80, 109, 0.9)
rgba(78, 122, 153, 0.9)
rgba(109, 87, 135, 0.9)
rgba(74, 53, 70, 0.9)
*/
const contentTransitions = [
  { color: "rgba(41, 80, 109, 0.9)", start: 1, end: 6 },
  { color: "rgba(109, 87, 135, 0.9)", start: 21, end: 25.9 },
  { color: "rgba(16, 22, 21, 0)", start: 32, end: 35 },
]

const throttleScrollUpdatesMS = 16;
const tlMargin = 0;
const tlActiveArea = 1 - 2 * tlMargin;
const maxCols = 30;
const maxRows = 50;
const centerX = maxCols / 2;
const centerY = maxRows / 2;

const constants = {
  throttleScrollUpdatesMS,
  colors,
  contentTransitions,
  tlMargin,
  tlActiveArea,
  triangleRelWidth: 101.8,
  triangleRelHeight: 58.3,
  minCols: 1,
  maxCols,
  maxRows,
  centerX,
  centerY,
  maxUndoChanges: 1500,
}

export const getCenterX = () => constants.centerX;
export const getCenterY = () => constants.centerY;
export default constants;