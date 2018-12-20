import './assets/styles.css';
import ScrollResizeHandler from './dom/handlers';
import Triangles from './dom/triangles';
import Patterns from './patterns';
import Globals from './globals';
import deserializer from './editor/deserializer';
import EventChannel from './editor/EventChannel';
import UIControls from './editor/uiControls';
import Editor from './editor';
import Elements from './editor/elements';

const elements = new Elements();
const globals = new Globals(elements);
const triangles = new Triangles(globals, elements);

const patternHandler = new Patterns(globals);
const toggle = window.localStorage.getItem("editor");
const runEditor = toggle && toggle === 'true';


if (!runEditor) {
  triangles.setInitialSizing();
  globals.getGlobalSizingFromWindow();
  triangles.createTriangles();

  const decoded = deserializer.loadFromLocalStorage('animation', globals);
  const patterns = deserializer.getPatternsFromFrames(decoded, globals);
  patternHandler.initializePatternAnimations(patterns);
  const handler = new ScrollResizeHandler(globals);
  handler.setScrollAndResizeHandlers();
} else {
  triangles.setInitialSizing();
  triangles.createTriangles();

  const ec = new EventChannel();
  const uiControls = new UIControls(ec, elements, globals);

  uiControls.initialize();

  const editor = new Editor(uiControls, ec, globals, triangles, patternHandler);

  editor.initialize();
}