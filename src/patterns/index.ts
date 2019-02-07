import { TweenLite, Linear, Power2 } from 'gsap';
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

  private addOverlayAnimatons = () => {
    const transitions = constants.overlayTransitions;
    const overlay = document.getElementById('svg_overlay');
    const totalDur = this.g.tl.totalDuration();
    let elapsed = 0;
    this.g.tl.add(TweenLite.set(overlay, { fill: '#000' }), 0);
    transitions.forEach(trans => {
      const startPos = (elapsed + trans.wait) * totalDur;
      const dur = trans.fade * totalDur;
      this.g.tl.add(TweenLite.to(overlay, dur, { fill: trans.color, ease: Power2.easeInOut }), startPos);
      elapsed += trans.fade + trans.wait;
    })
  }

  private initializePatternAnimations = (payload: { patterns: PatternData[], setFrameTimingCaret?: boolean }) => {
    this.g.tl.clear();
    let elapsed = 0;
    const setFrameTimingCaret = (frameIdx: number) => {
      this.eventChannel.dispatch({ type: 'set_frame_caret', payload: { frameIdx } });
    }

    payload.patterns.forEach(({ getColor, wait, fade, getOffset }, n) => {
      let didAddTween = false;

      if (payload.setFrameTimingCaret) {
        this.g.tl.add(() => setFrameTimingCaret(n), elapsed + wait);
      }
      for (let j = 0; j < this.g.nRows; j++) {
        for (let i = 0; i < this.g.nCols; i++) {
          const color = getColor(i, j);
          if (color) {
            didAddTween = true;
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
      if (!didAddTween) {
        const dummy = { x: 0 };
        const startPos = elapsed + wait
        this.g.tl.add(TweenLite.to(dummy, fade, { x: 0 }), startPos);
      }
      elapsed += wait + fade;
    });
    if (payload.setFrameTimingCaret) {
      this.g.tl.add(() => setFrameTimingCaret(-1), elapsed + 0.5);
    }
    this.updateTimelineGlobals();
    this.addOverlayAnimatons();
  }
}