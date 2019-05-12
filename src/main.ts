import './assets/styles.css';
import WindowHandler from './dom/handlers';
import Triangles from './dom/triangles';
import Patterns from './patterns';
import Globals from './globals';
import EventChannel from './editor/EventChannel';
import Editor from './editor';
import Elements from './editor/elements';
import Deserializer from './editor/deserializer';

// other classes should only depend on these:
const el = new Elements();
const ec = new EventChannel();
const g = new Globals();
// -- use event passing!

new Triangles(g, ec);
new Patterns(g, ec);
new Deserializer(ec, g);

const autoplayOnMobile = false;
if (g.mode === 'normal') {
  g.getGlobalSizingFromWindow();
  ec.dispatch({ type: 'triangles_init' });

  ec.dispatch({ type: 'load_animation_file_to_timeline', payload: { name: 'animation' } });
  const handler = new WindowHandler(g);

  if (g.isMobile && autoplayOnMobile){
    const playbackRate = 0.8;
    handler.setResizeHandler();
    g.tl.eventCallback('onComplete', () => g.tl.restart());
    g.tl.timeScale(playbackRate);
    g.tl.play();
  } else {
    handler.setScrollAndResizeHandlers();
  }

} else {
  g.renderType = 'svg';
  const editor = new Editor(ec, el, g);

  editor.initialize();
}

if (g.renderType === 'svg'){
  document.getElementById('svg_overlay').style.opacity = '0.35';
}