import { TimingFunctionName } from "../editor/typings";

const nCols = 30;

const getZeroOffset = () => 0;
const swipeRight = (row: number, col: number) => col * 0.05;
const swipeLeft = (row: number, col: number) => (0.05 * nCols) - col * 0.05;

export const getTimingFunction = (name: TimingFunctionName) => {
  switch (name) {
    case 'swipe_left':
      return swipeLeft;
    case 'swipe_right':
      return swipeRight;
    default:
      return getZeroOffset;
  }
}

export const getTimingFunctionNameFromCode = (code: string): TimingFunctionName => {
  switch (code) {
    case '1':
      return 'swipe_right';
    case '2':
      return 'swipe_left';
    default:
      return 'none';
  }
}

export const getTimingFunctionCodeSlug = (name: TimingFunctionName): string => {
  switch (name) {
    case 'swipe_right':
      return ',1';
    case 'swipe_left':
      return ',2';
    default:
      return '';
  }
}