
const colors = [
  "#101615",
  "#1b5588",
  "#96B27D",
  "#7D6336",
  "#EBCE89",
  "#CB6A2E",
  "#662717",
  "#8a2060",
  "#571da3",
  "#2d501e",
]

const overlayTransitions = [
  // { color: '#030', wait: 0.05, fade: 0.3},
  // { color: '#005', wait: 0, fade: 0.3},
  // { color: '#300', wait: 0.05, fade: 0.3},
]

const throttleScrollUpdatesMS = 23;
const tlMargin = 0.001;
const tlActiveArea = 1 - 2 * tlMargin;
const maxCols = 30;
const maxRows = 50;
const centerX = maxCols / 2;
const centerY = maxRows / 2;

const constants = {
  throttleScrollUpdatesMS,
  colors,
  overlayTransitions,
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