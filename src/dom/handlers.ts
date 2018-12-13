import g from "../globals";

const outer = document.getElementById("outer");
const svgOuter = document.getElementById("svg");

// stretch background to fit resized screen
const resizeHandler = () => {
  const newWidth = outer.clientWidth;
  const newHeight = outer.clientHeight;
  const hRatio = newWidth / g.pageWidth;
  const vRatio = newHeight / g.pageHeight;
  svgOuter.style.transform = `scale(${hRatio}, ${vRatio})`;
};

// set scroll handler


const scrollHandler = () => {
  g.tl.time(0);
  g.tl.time((g.config.tlMargin + g.scrollPos * g.config.tlActiveArea) * g.tl.duration());
};

const scrollHandlerThrottled = (e: any) => {
  const now = Date.now();
  if (now - g.lastUpdate < g.config.throttleScrollUpdates) {
    return;
  }
  g.lastUpdate = now;
  g.scrollPos =
    e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
  // kick off all the expensive rendering in a RAF
  window.requestAnimationFrame(scrollHandler);
};

export const setScrollAndResizeHandlers = () => {
  document.getElementById("scrollOuter").onscroll = scrollHandlerThrottled;
  window.onresize = resizeHandler;
}