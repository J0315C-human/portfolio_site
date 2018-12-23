import { TweenLite, Linear } from 'gsap';
import { PatternData } from "../typings";
import Globals from "../globals";
import EventChannel from '../editor/EventChannel';
import constants from '../constants';


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
    this.g.tl.time(constants.tlMargin * totalDur);
  }

  private initializePatternAnimations = (payload: { patterns: PatternData[] }) => {
    this.g.tl.clear();
    let elapsed = 0;
    payload.patterns.forEach(({ getColor, wait, fade, getOffset }, n) => {
      for (let j = 0; j < this.g.nRows; j++) {
        for (let i = 0; i < this.g.nCols; i++) {
          const color = getColor(i, j);
          if (color) {
            const startPos = elapsed + wait + getOffset(j, i);
            this.eventChannel.dispatch({
              type: 'triangle_call',
              payload: {
                j, i,
                // function to add the next tween
                call: (tri: SVGElement) => this.g.tl.add(TweenLite.to(tri, fade, { fill: color, ease: Linear.easeNone }), startPos)
              }
            });
          }
        }
      }
      elapsed += wait + fade;
    });

    this.updateTimelineGlobals();
  }
}