import { TimingFunctionName } from "../editor/typings";
import constants, { getCenterX, getCenterY } from "../constants";

const { maxCols, maxRows } = constants;

const getZeroOffset = () => 0;
const getSwipeRight = (dur: number) => (row: number, col: number) => (col / maxCols) * dur;
const getSwipeLeft = (dur: number) => (row: number, col: number) => ((maxCols - col) / maxCols) * dur;

const swipeRightSlow = getSwipeRight(1);
const swipeRight = getSwipeRight(0.5);
const swipeRightFast = getSwipeRight(0.2);
const swipeLeftSlow = getSwipeLeft(1);
const swipeLeft = getSwipeLeft(0.5);  
const swipeLeftFast = getSwipeLeft(0.2);

const scaleAll = 3;
const diag1 = (row: number, col: number) =>
  ((((maxRows - row) + col) / (maxRows + maxCols)) * 2) * scaleAll;

const diag2 = (row: number, col: number) => (((row + col) % 2)
  ? (((maxRows - row) + col) / (maxRows + maxCols)) * 0.3
  : (((maxRows - row) + col) / (maxRows + maxCols)) * 0.3 + 0.05) * scaleAll;

const diag3 = (row: number, col: number) =>
  ((((maxRows - row) * 2 + (maxCols - col)) / (maxRows + maxCols)) * 0.3) * scaleAll

const diag4 = (row: number, col: number) => (((row + col) % 2)
  ? (((maxRows - row) * 2 + col) / (maxRows * 2 + maxCols)) * 0.3
  : (((maxRows - row) * 2 + col) / (maxRows * 2 + maxCols)) * 0.3 + 0.05) * scaleAll;

const randomFade = () => Math.random() * 1;

const randomSwipeUp = (row: number, col: number) => ((maxRows - row) / maxRows) * 0.7 + randomFade() * 0.3;
const randomSwipeUp2 = (row: number, col: number) => ((maxRows - row) / maxRows) * 0.4 + randomFade() * 0.6;
const center = (row: number, col: number) => {

  const dist = Math.sqrt(Math.pow(getCenterX() - col, 2) + Math.pow(getCenterY() - row, 2) * 0.33);
  return dist / 20;
}

const thingRows = [
  [2, 17, 10, 1],
  [3, 18, 9, 0],
  [4, 19, 8, 5],
  [21, 20, 7, 6],
  [22, 13, 14, 23],
  [11, 12, 15, 16],
  [10, 1, 2, 17],
  [9, 0, 3, 18],
  [8, 5, 4, 19],
  [7, 6, 21, 20],
  [14, 23, 22, 13],
  [15, 16, 11, 12],
]

// a hexagon-shape-thing transition
const thing = (row: number, col: number) => {
  const a = thingRows[row % 12][col % 4] * 0.08;
  const b = diag1(row, col) * 0.5;
  return a + b;
}
export const getTimingFunction = (name: TimingFunctionName) => {
  switch (name) {
    case 'swipe_left_slow':
      return swipeLeftSlow;
    case 'swipe_left':
      return swipeLeft;
    case 'swipe_left_fast':
      return swipeLeftFast;
    case 'swipe_right_slow':
      return swipeRightSlow;
    case 'swipe_right':
      return swipeRight;
    case 'swipe_right_fast':
      return swipeRightFast;
    case 'diag_1':
      return diag1;
    case 'diag_2':
      return diag2;
    case 'diag_3':
      return diag3;
    case 'diag_4':
      return diag4;
    case 'rand':
      return randomFade;
    case 'rand_swipe':
      return randomSwipeUp;
    case 'rand_swipe_2':
      return randomSwipeUp2;
    case 'center':
      return center;
    case 'thing':
      return thing;
    default:
      return getZeroOffset;
  }
}

export const getTimingFunctionNameFromCode = (code: string): TimingFunctionName => {
  switch (code) {
    case '':
      return 'none';
    case '1':
      return 'swipe_right_slow';
    case '2':
      return 'swipe_right';
    case '3':
      return 'swipe_right_fast';
    case '4':
      return 'swipe_left_slow';
    case '5':
      return 'swipe_left';
    case '6':
      return 'swipe_left_fast';
    case '7':
      return 'diag_1';
    case '8':
      return 'diag_2';
    case '9':
      return 'diag_3';
    case '0':
      return 'diag_4';
    case '{':
      return 'rand';
    case '}':
      return 'rand_swipe';
    case '?':
      return 'rand_swipe_2';
    case '!':
      return 'center';
    case '[':
      return 'thing';
    default:
      return 'none';
  }
}

export const getTimingFunctionCodeSlug = (name: TimingFunctionName): string => {
  switch (name) {
    case 'swipe_right_slow':
      return ',1';
    case 'swipe_right':
      return ',2';
    case 'swipe_right_fast':
      return ',3';
    case 'swipe_left_slow':
      return ',4';
    case 'swipe_left':
      return ',5';
    case 'swipe_left_fast':
      return ',6';
    case 'diag_1':
      return ',7';
    case 'diag_2':
      return ',8';
    case 'diag_3':
      return ',9';
    case 'diag_4':
      return ',0';
    case 'rand':
      return ',{';
    case 'rand_swipe':
      return ',}';
    case 'rand_swipe_2':
      return ',?';
    case 'center':
      return ',!';
    case 'thing':
      return ',[';
    default:
      return '';
  }
}