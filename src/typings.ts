export interface PatternData {
  getColor: (row: number, col: number) => string | undefined; // when returning undefined, no animation happens
  getOffset: (row: number, col: number) => number;
  fade: number;
  wait: number;
}

export interface CoordFit {
  rows: number;
  cols: number;
  distFromIdeal: number;
  scale: number;
}