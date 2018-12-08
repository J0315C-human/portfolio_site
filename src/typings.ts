export interface PatternData {
  getColor: (col: number, row: number) => string | undefined; // when returning undefined, no animation happens
  getOffset: (col: number, row: number) => number;
  getDuration: (col: number, row: number) => number;
  wait: number;
}

export interface CoordFit {
  rows: number;
  cols: number;
  distFromIdeal: number;
  scale: number;
}