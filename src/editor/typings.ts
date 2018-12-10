
export interface TriangleChange {
  i: number;
  j: number;
  oldColor: number;
}

export interface TriangleDelta {
  i: number;
  j: number;
  c: number; // new color
}

export interface Frame {
  grid: number[][];
  wait: number;
  fade: number;
}

export interface FrameCompressedWithDeltaList {
  t: 'a';
  d: TriangleDelta[];
  w: number; // wait
  f: number; // fade
}

export interface FrameCompressedWithDeltaListSameColor {
  t: 'b';
  d: Array<{ i: number, j: number }>;
  c: number; // homogeneous new color
  w: number; // wait
  f: number; // fade
}

export interface FrameCompressedWithStringGrid {
  t: 'c';
  g: string[];
  w: number; // wait
  f: number; // fade
}

export type FrameCompressed = FrameCompressedWithDeltaList | FrameCompressedWithDeltaListSameColor | FrameCompressedWithStringGrid;
