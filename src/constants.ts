import Globals from "./globals";

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

const color1 = [
  '#6c7528', 
  '#6f7228', 
  '#716f29', 
  '#746b2a', 
  '#76682b', 
  '#79652c', 
  '#7b622d',
  '#7b622d',
  '#7b622d',
  '#7b622d',
  '#7b622d',
  '#7b622d',
  '#7e602e',
  '#815e30',
  '#845b31',
  '#875932',
  '#8a5734',
  '#8d5535',
  '#905336',
]
const color2 = [
  '#246560', 
  '#256262', 
  '#265e64', 
  '#275a66', 
  '#275769', 
  '#28546b', 
  '#29506d',
  '#29506d',
  '#29506d',
  '#29506d',
  '#29506d',
  '#29506d',
  '#2e4e6d',
  '#334c6d',
  '#374b6d',
  '#3c496c',
  '#41476c',
  '#46456c',
  '#4b436c',
]
const color3 = [
  '#458a87', 
  '#46878a', 
  '#48858d', 
  '#498290', 
  '#4b7f93', 
  '#4c7d96', 
  '#4e7a99',
  '#4e7a99',
  '#4e7a99',
  '#4e7a99',
  '#4e7a99',
  '#4e7a99',
  '#527898',
  '#557597',
  '#597396',
  '#5c7095',
  '#606e94',
  '#636b93',
  '#676992',
]

const color4 = [
  '#7e5977',
  '#7c587a',
  '#79587c',
  '#76587f',
  '#735882',
  '#705784',
  '#6d5787',
  '#6a5888',
  '#675889',
  '#675889',
  '#64598a',
  '#64598a',
  '#615a8b',
  '#615a8b',
  '#5e5b8c',
  '#5c5c8c',
  '#595c8d',
  '#565d8e',
  '#535e8f',
]
const color5 = [
  '#624243',
  '#604144',
  '#5d4044',
  '#5a3e44',
  '#583c44',
  '#553b45',
  '#523a45',
  '#4f3845',
  '#4d3646',
  '#4d3646',
  '#4d3646',
  '#4a3546',
  '#4d3242',
  '#4d3242',
  '#4f303f',
  '#4f303f',
  '#522d3c',
  '#552a38',
  '#582834',
]

const color6 = [
  '#123a30',
  '#123731',
  '#133432',
  '#133133',
  '#132e33',
  '#142a34',
  '#142735', 
  '#142735', 
  '#142735', 
  '#142735', 
  '#142735', 
  '#142735', 
  '#182636', 
  '#1b2636', 
  '#1e2537', 
  '#222538', 
  '#262439', 
  '#292339', 
  '#2c233a', 
]

const _nVariations = 19;
const colorMatrix = [color1, color2, color3, color4, color5, color6];

const getColorVariation = (colorIdx: number, row: number, g: Globals) => {
  if (colorIdx === 0 || colorIdx > 6) {
    return colors[0];
  }
  const pos = (g.nRows - row) / g.nRows;
  return colorMatrix[colorIdx - 1][Math.round(pos * _nVariations - 1)]
}

/* RGBA versions:
rgba(16, 22, 21, 0.9)
rgba(123, 98, 45, 0.9)
rgba(41, 80, 109, 0.9)
rgba(78, 122, 153, 0.9)
rgba(109, 87, 135, 0.9)
rgba(74, 53, 70, 0.9)
*/
const contentTransitions = [
  { color: "rgba(41, 80, 109, 0.65)", start: 3.5, end: 9 },
  { color: "rgba(109, 87, 135, 0.65)", start: 21, end: 25.9 },
  { color: "rgba(16, 22, 21, 0)", start: 32, end: 35 },
]

const throttleScrollUpdatesMS = 32;
const tlMargin = 0;
const tlActiveArea = 1 - 2 * tlMargin;
const maxCols = 30;
const maxRows = 44;
const centerX = maxCols / 2;
const centerY = maxRows / 2;
// scale the canvas down for performance
const constants = {
  throttleScrollUpdatesMS,
  colors,
  getColorVariation,
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