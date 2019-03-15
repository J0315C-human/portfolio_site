import Globals from "../globals";
import constants from "../constants";

const outer = document.getElementById("outer");
const svgRootGroup = document.getElementById("rootGroup");

export default class WindowHandler {
  g: Globals;
  constructor(globals: Globals) {
    this.g = globals;
  }
  // stretch background to fit resized screen
  private resizeHandler = () => {
    const newWidth = outer.clientWidth;
    const newHeight = outer.clientHeight;
    const hRatio = newWidth / this.g.pageWidth;
    const vRatio = newHeight / this.g.pageHeight;
    svgRootGroup.style.transform = `scale(${hRatio}, ${vRatio})`;
  };

  // set scroll handler
  private scrollHandler = () => {
    const { tl, scrollPos } = this.g;
    tl.time((constants.tlMargin + scrollPos * constants.tlActiveArea) * tl.duration());
  };

  private scrollHandlerThrottled = (e: any) => {
    const { lastUpdate } = this.g;
    const now = Date.now();
    if (now - lastUpdate < constants.throttleScrollUpdatesMS) {
      return;
    }
    this.g.lastUpdate = now;
    this.g.scrollPos =
      e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
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