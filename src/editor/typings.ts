
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

export interface FrameWithGrid {
  type: 'grid',
  grid: number[][];
  wait: number;
  fade: number;
}

export interface FrameWithDeltas {
  type: 'deltas',
  deltas: TriangleDelta[];
  wait: number;
  fade: number;
}

export type FrameType = FrameWithGrid | FrameWithDeltas;
export type CompressedFrameType = FrameWithCompressedGrid | FrameWithCompressedDeltas;

// represents a 'blocked off' interval of time
export interface TweenBlock {
  start: number;
  end: number;
}

export interface FrameWithCompressedGrid {
  type: 'cgrid',
  grid: number[][];
  wait: number;
  fade: number;
}

export interface FrameWithCompressedDeltas {
  type: 'cdeltas',
  deltas: number[][];
  wait: number;
  fade: number;
}
export type AnimationSlug = string;
export type AnimationSlugEncoded = string;