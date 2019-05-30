import Globals from "../globals";
import constants from "../constants";

const outer = document.getElementById("outer");
const svgRootGroup = document.getElementById("rootGroup");
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

export default class WindowHandler {
  g: Globals;
  tid: number;
  constructor(globals: Globals) {
    this.g = globals;
    this.tid = 0;
  }
  // stretch background to fit resized screen
  private resizeHandler = () => {
    const newWidth = outer.clientWidth;
    const newHeight = outer.clientHeight;
    const hRatio = newWidth / this.g.pageWidth;
    const vRatio = newHeight / this.g.pageHeight;
    svgRootGroup.style.transform = `scale(${hRatio}, ${vRatio})`;
    canvas.style.transform = `scale(${hRatio}, ${vRatio})`;
  };

  // set scroll handler
  private scrollHandler = () => {
    const { tl, scrollPos } = this.g;
    tl.time((constants.tlMargin + scrollPos * constants.tlActiveArea) * tl.duration());
  };

  private scrollHandlerThrottled = (e: any) => {
    const { lastUpdate } = this.g;
    window.clearTimeout(this.tid);
    const now = Date.now();
    const sinceLastUpdate = now - lastUpdate;
    if (sinceLastUpdate < constants.throttleScrollUpdatesMS) {
      this.tid = window.setTimeout(() => {
        this.scrollHandlerThrottled(e);
      }, constants.timeoutScrollUpdatesMS);
      return;
    }
    this.g.lastUpdate = now;
    const newScrollPos = 
      e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
    this.g.scrollPos = newScrollPos;
    // kick off all the expensive rendering in a RAF
    window.requestAnimationFrame(this.scrollHandler);
  };

  setScrollAndResizeHandlers = () => {
    document.getElementById("scrollOuter").onscroll = this.scrollHandlerThrottled;
    window.onresize = this.resizeHandler;
  }

  setResizeHandler = () => {
    window.onresize = this.resizeHandler;
  }
}