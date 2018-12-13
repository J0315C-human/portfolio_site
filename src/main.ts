import './assets/styles.css';
import { setScrollAndResizeHandlers } from './dom/handlers';
import { createTriangles, setInitialSizing } from './dom';
import { initializePatternAnimations } from './patterns';
import editor from './editor';
import g, { fitToWindow } from './globals';
import { pattern0 } from './patterns/pattern0';
import deserializer from './editor/deserializer';
import { retileGrid } from './utils';

const toggle = window.localStorage.getItem("editor");

const runEditor = toggle && toggle === 'true';

if (!runEditor) {
  setInitialSizing();
  fitToWindow();
  createTriangles();
  const retiled = pattern0.map(frame => ({
    wait: frame.wait,
    fade: frame.fade,
    grid: retileGrid(frame.grid, g.nRows, g.nCols),
  }));
  const frames = deserializer.getPatternsFromFrames(retiled);
  initializePatternAnimations(frames);
  setScrollAndResizeHandlers();
} else {
  document.getElementById('editor-outer').style.display = 'block';
  setInitialSizing();
  createTriangles();
  editor.initialize();
}