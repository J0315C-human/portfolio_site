import { TweenLite, Linear } from 'gsap';
import { PatternData } from "../typings";
import Globals from "../globals";

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
  constructor(globals: Globals) {
    this.g = globals;
  }

  updateTimelineGlobals = () => {
    const totalDur = this.g.tl.duration();
    this.g.tl.time(this.g.config.tlMargin * totalDur);
  }

  initializePatternAnimations = (patternData: PatternData[]) => {
    patternData.forEach(({ getColor, wait, getDuration, getOffset }, n) => {
      const animStart = this.g.tl.duration() + wait;
      this.g.triangles.forEach((row, j) => {
        row.forEach((triangle, i) => {
          const color = getColor(i, j);
          if (!color) { return; };
          const startPos = animStart + getOffset(i, j);
          const duration = getDuration(i, j);

          // tween to the next value
          this.g.tl.add(TweenLite.to(triangle, duration, { fill: color, ease: Linear.easeNone }), startPos);
        });
      });
    });

    this.updateTimelineGlobals();
  }
}