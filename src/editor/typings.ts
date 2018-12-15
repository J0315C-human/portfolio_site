
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
  t: 'deltaList';
  d: TriangleDelta[];
  w: number; // wait
  f: number; // fade
}

export interface FrameCompressedWithGrid {
  t: 'grid';
  g: number[][]; // full grid
  w: number; // wait
  f: number; // fade
}

export type FrameCompressed = FrameCompressedWithDeltaList | FrameCompressedWithGrid;

// represents a 'blocked off' interval of time
export interface TweenBlock {
  start: number;
  end: number;
}