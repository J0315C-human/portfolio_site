import { TweenLite, Linear } from 'gsap';
import { PatternData } from "../typings";
import Globals from "../globals";
import EventChannel from '../editor/EventChannel';

// const patterns: PatternData[] = [
//   {
//     getColor: getColor(5),
//     wait: 0.5,
//     getOffset: staggeredDiagFade(0.2, -0.3, 0.5),
//     getDuration: () => 5,
//   },
//   {
//     getColor: pattern1,
//     wait: 2,
//     getOffset: diagFade(0.6, -0.2),
//     getDuration: () => 5,
//   },
//   {
//     getColor: getColor(4),
//     wait: 0.5,
//     getOffset: diagFade(0.6, -0.2),
//     getDuration: () => 5,
//   },
//   {
//     getColor: pattern3,
//     wait: 0.5,
//     getOffset: diagFadeDown(0.4, 0.2),
//     getDuration: () => 5,
//   },
// ];


export default class Patterns {
  g: Globals;
  eventChannel: EventChannel;
  constructor(globals: Globals, eventChannel: EventChannel) {
    this.g = globals;
    this.eventChannel = eventChannel;

    this.eventChannel.subscribe('patterns_init', this.initializePatternAnimations);
  }

  private updateTimelineGlobals = () => {
    const totalDur = this.g.tl.duration();
    this.g.tl.time(this.g.config.tlMargin * totalDur);
  }

  private initializePatternAnimations = (payload: { patterns: PatternData[] }) => {
    this.g.tl.clear();
    payload.patterns.forEach(({ getColor, wait, getDuration, getOffset }, n) => {
      const animStart = this.g.tl.duration() + wait;
      for (let j = 0; j < this.g.nRows; j++) {
        for (let i = 0; i < this.g.nCols; i++) {
          const color = getColor(i, j);
          if (color) {
            const startPos = animStart + getOffset(i, j);
            const duration = getDuration(i, j);
            this.eventChannel.dispatch({
              type: 'triangle_call',
              payload: {
                j, i,
                // function to add the next tween
                call: (tri: SVGElement) => this.g.tl.add(TweenLite.to(tri, duration, { fill: color, ease: Linear.easeNone }), startPos)
              }
            });
          }
        }
      }
    });

    this.updateTimelineGlobals();
  }
}