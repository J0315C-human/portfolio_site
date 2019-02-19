
export interface TriangleDelta {
  i: number;
  j: number;
  c: number; // new color
}

export type TimingFunctionName = 'none'
  | 'swipe_left'
  | 'swipe_left_slow'
  | 'swipe_left_fast'
  | 'swipe_right'
  | 'swipe_right_slow'
  | 'swipe_right_fast'
  | 'diag_1'
  | 'diag_2'
  | 'diag_3'
  | 'diag_4'
  | 'rand'
  | 'rand_swipe'
  | 'rand_swipe_2'
  | 'center'
  | 'thing'
  ;

// the animations are created using only FrameWithGrid
export interface FrameWithGrid {
  type: 'grid',
  grid: number[][];
  wait: number;
  fade: number;
  timingFunc: TimingFunctionName;
}

export interface FrameTimingRowObject extends FrameWithGrid {
  isFirstOfTimingType: boolean;
  timingTypeSiblingIndexes: number[];
}

export interface FrameWithDeltas {
  type: 'deltas',
  deltas: TriangleDelta[];
  wait: number;
  fade: number;
  timingFunc: TimingFunctionName;
}

export type FrameType = FrameWithGrid | FrameWithDeltas;
export type CompressedFrameType = FrameWithCompressedGrid | FrameWithCompressedDeltas;

// represents a 'blocked off' interval of time
export interface TweenBlock {
  start: number;
  end: number;
}
export interface TweenBlockWithCoords extends TweenBlock {
  i: number;
  j: number;
}

export interface FrameWithCompressedGrid {
  type: 'cgrid',
  grid: number[][];
  wait: number;
  fade: number;
  flipped?: boolean;
  timingFunc: TimingFunctionName;
}

export interface FrameWithCompressedDeltas {
  type: 'cdeltas',
  deltas: number[][];
  wait: number;
  fade: number;
  flipped?: boolean;
  timingFunc: TimingFunctionName;
}

export type AnimationSlug = string;
export type AnimationSlugEncoded = string;

export type CursorFunction = (j: number, i: number) => { j: number, i: number }[];