
const colors = [
  "#101615",
  "#1b5588",
  "#84b940",
  "#7D6336",
  "#EBCE89",
  "#CB6A2E",
  "#662717",
  "#8a2060",
  "#571da3",
  "#141f63",
]

const overlayTransitions = [
  { color: "rgb(0, 97, 191)", start: 19, end: 45 },
  { color: "rgb(121, 0, 0)", start: 52, end: 55 },
  { color: "rgb(0, 23, 72)", start: 67, end: 74 },
  { color: "rgb(51, 49, 22)", start: 77, end: 83 },
  { color: "rgb(20, 100, 90)", start: 86, end: 89 },
  { color: "rgb(59, 39, 138)", start: 93, end: 99 },
  { color: "#000", start: 116, end: 120 }
]

const contentTransitions = [
  { color: "rgba(18, 36, 53, 0.9)", start: 1, end: 8.5 },
  { color: "rgba(38, 26, 22, 0.9)", start: 9.5, end: 11 },
  { color: "rgba(57, 32, 24, 0.9)", start: 11, end: 12.5 },
  { color: "rgba(85, 40, 27, 0.9)", start: 12.5, end: 15 },
  { color: "rgba(95, 42, 28, 0.9)", start: 15, end: 18 },
  { color: "rgba(95, 40, 24, 0.9)", start: 24, end: 25 },
  { color: "rgba(94, 37, 18, 0.9)", start: 25, end: 27 },
  { color: "rgba(93, 31, 22, 0.9)", start: 27, end: 29 },
  { color: "rgba(90, 22, 38, 0.9)", start: 29, end: 31 },
  { color: "rgba(85, 30, 57, 0.9)", start: 31, end: 33 },
  { color: "rgba(81, 40, 74, 0.9)", start: 33, end: 35 },
  { color: "rgba(79, 44, 82, 0.9)", start: 35, end: 37 },
  { color: "rgba(78, 48, 89, 0.9)", start: 37, end: 39 },
  { color: "rgba(77, 48, 91, 0.9)", start: 39, end: 41 },
  { color: "rgba(77, 49, 92, 0.9)", start: 41, end: 43 },
  { color: "rgba(90, 56, 22, 0.9)", start: 53, end: 60 },
  { color: "rgba(56, 116, 130, 0.9)", start: 60, end: 64 },
  { color: "rgba(40, 73, 98, 0.9)", start: 69, end: 74 },
  { color: "rgba(26, 62, 119, 0.9)", start: 79, end: 81 },
  { color: "rgba(136, 143, 61, 0.9)", start: 84, end: 89 },
  { color: "rgba(53, 32, 126, 0.9)", start: 94, end: 100 },
  { color: "rgba(24, 48, 70, 0.9)", start: 116, end: 120 }
]

const throttleScrollUpdatesMS = 23;
const tlMargin = 0;
const tlActiveArea = 1 - 2 * tlMargin;
const maxCols = 30;
const maxRows = 50;
const centerX = maxCols / 2;
const centerY = maxRows / 2;

const constants = {
  throttleScrollUpdatesMS,
  colors,
  overlayTransitions,
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