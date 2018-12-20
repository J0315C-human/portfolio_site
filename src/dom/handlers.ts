import Globals from "../globals";

const outer = document.getElementById("outer");
const svgOuter = document.getElementById("svg");

export default class ScrollResizeHandler {
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
    svgOuter.style.transform = `scale(${hRatio}, ${vRatio})`;
  };

  // set scroll handler
  private scrollHandler = () => {
    const { tl, scrollPos, config } = this.g;
    tl.time(0);
    tl.time((config.tlMargin + scrollPos * config.tlActiveArea) * tl.duration());
  };

  private scrollHandlerThrottled = (e: any) => {
    const { lastUpdate, config } = this.g;
    const now = Date.now();
    if (now - lastUpdate < config.throttleScrollUpdatesMS) {
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
}