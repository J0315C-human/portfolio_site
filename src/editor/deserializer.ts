import { FrameWithDeltas, FrameWithGrid, AnimationSlug, AnimationSlugEncoded, FrameWithCompressedGrid, FrameWithCompressedDeltas, CompressedFrameType } from "./typings";
import { retileGrid, gridCopy, gridFlippedDiag, getPatternsFromFrames } from "../utils";
import { removeEncodings } from "./encodings";
import { decompressDeltasToArrayArrayFromLeft } from "./deltas";
import Globals from "../globals";
import EventChannel from "./EventChannel";
import { getTimingFunctionNameFromCode } from "../patterns/timingFunctions";

const unslugFrame = (slug: AnimationSlug): CompressedFrameType => slug.includes('^') || slug.includes('<')
  ? unslugFrameWithGrid(slug)
  : unslugFrameWithDeltas(slug);

const unslugFrameWithDeltas = (slug: AnimationSlug): FrameWithCompressedDeltas => {
  // 10.2,3.005$1,1,1:1,2,5 or 10.2,3.005&1,1,1:1,2,5
  const IFirst = slug.includes('&');
  const [params, deltas] = IFirst ? slug.split('&') : slug.split('$');
  const [f, w, timingFuncCode] = params.split(',');
  const compressedDeltas = deltas.split(':');
  return {
    type: 'cdeltas',
    fade: parseFloat(f),
    wait: parseFloat(w),
    deltas: compressedDeltas.map(change => change.split(',').map(digit => parseInt(digit, 10))),
    flipped: IFirst,
    timingFunc: getTimingFunctionNameFromCode(timingFuncCode),
  }
}

const unslugFrameWithGrid = (slug: AnimationSlug): FrameWithCompressedGrid => {
  // 10.2,3.005^14325:00324:10101
  const flipped = slug.includes('<');
  const [params, rows] = flipped ? slug.split('<') : slug.split('^');
  const [f, w, timingFuncCode] = params.split(',');
  return {
    type: 'cgrid',
    flipped,
    fade: parseFloat(f),
    wait: parseFloat(w),
    grid: rows.split(':')
      .map(rowString => rowString.split('')
        .map(digit => parseInt(digit, 10))),
    timingFunc: getTimingFunctionNameFromCode(timingFuncCode),
  }
}

const decompressFrame = (frame: CompressedFrameType) => frame.type === 'cgrid'
  ? decompressFrameWithGrid(frame)
  : decompressFrameWithDeltas(frame);

const decompressFrameWithGrid = (frame: FrameWithCompressedGrid): FrameWithGrid => ({
  fade: frame.fade,
  wait: frame.wait,
  type: 'grid',
  timingFunc: frame.timingFunc,
  grid: frame.flipped
    ? gridFlippedDiag(decompressDeltasToArrayArrayFromLeft(frame.grid))
    : decompressDeltasToArrayArrayFromLeft(frame.grid),
})

const decompressFrameWithDeltas = (frame: FrameWithCompressedDeltas): FrameWithDeltas => {
  return {
    fade: frame.fade,
    wait: frame.wait,
    timingFunc: frame.timingFunc,
    type: 'deltas',
    deltas: decompressDeltasToArrayArrayFromLeft(frame.deltas).map(d => {
      return frame.flipped ? { j: d[1], i: d[0], c: d[2] } : { j: d[0], i: d[1], c: d[2] };
    }),
  }
}

const getFrameWithGridFromFrameWithDeltas = (frame: FrameWithDeltas, lastGrid: number[][]): FrameWithGrid => {
  const f: FrameWithGrid = {
    type: 'grid',
    wait: frame.wait,
    fade: frame.fade,
    timingFunc: frame.timingFunc,
    grid: lastGrid.map((row, j) => row.map((_, i) => {
      const delta = frame.deltas.find(d => d.i === i && d.j === j);
      if (!delta) { return lastGrid[j][i]; }
      else { return delta.c; }
    })),
  }
  return f;
}

const getFramesWithGridsFromSlugs = (allSlugsEncoded: AnimationSlugEncoded, nRows: number, nCols: number): FrameWithGrid[] => {
  const allSlugs = removeEncodings(allSlugsEncoded);
  let grid = new Array(nRows).fill(0).map(() => new Array(nCols).fill(0));
  const frames: FrameWithGrid[] = [];
  allSlugs.split(';')
    .forEach(slug => {
      const unsluggedFrame = unslugFrame(slug);
      const decompressedFrame = decompressFrame(unsluggedFrame);
      const frame = decompressedFrame.type === 'grid' ? decompressedFrame
        : getFrameWithGridFromFrameWithDeltas(decompressedFrame, grid);
      grid = gridCopy(frame.grid);
      frames.push(frame);
    })
  frames.forEach(f => console.log(f.timingFunc))
  return frames;
}

export default class Deserializer {
  eventChannel: EventChannel;
  g: Globals;
  constructor(eventChannel: EventChannel, g: Globals) {
    this.eventChannel = eventChannel;
    this.g = g;
    this.eventChannel.subscribe('load_animation_editor_to_timeline', this.loadAnimationToTimelineFromEditor);
    this.eventChannel.subscribe('load_animation_localstorage_to_timeline', this.loadAnimationToTimelineFromLocalStorage);
    this.eventChannel.subscribe('load_animation_localstorage_to_editor', this.loadAnimationToEditorFromLocalStorage);
  }

  private getAnimationFromLocalStorage = (name: string): FrameWithGrid[] => {
    const { nRows, nCols } = this.g;
    const encodedSlug = window.localStorage.getItem(name)
    const frames = getFramesWithGridsFromSlugs(encodedSlug, nRows, nCols);

    const retiled = frames.map(frame => ({
      ...frame,
      grid: retileGrid(frame.grid, nRows, nCols),
    }));
    return retiled;
  }

  private loadAnimationToTimelineFromLocalStorage = (payload: { name: string }): void => {
    const frames = this.getAnimationFromLocalStorage(payload.name);
    this.eventChannel.dispatch({
      type: 'patterns_init',
      payload: { patterns: getPatternsFromFrames(frames, this.g) },
    })
  }

  private loadAnimationToEditorFromLocalStorage = (payload: { name: string }): void => {
    this.eventChannel.dispatch({
      type: 'editor_load_frames',
      payload: { frames: this.getAnimationFromLocalStorage(payload.name) },
    })
  }

  private loadAnimationToTimelineFromEditor = (payload: { frames: FrameWithGrid[] }): void => {
    this.eventChannel.dispatch({
      type: 'patterns_init',
      payload: { patterns: getPatternsFromFrames(payload.frames, this.g) },
    })
  }
}