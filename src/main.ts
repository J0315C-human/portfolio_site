import './assets/styles.css';
import { setScrollAndResizeHandlers } from './dom/handlers';
import { createTriangles, setInitialSizing } from './dom';
import { initializePatternAnimations } from './patterns';
import editor from './editor';
import { fitToWindow } from './globals';
import deserializer from './editor/deserializer';

const toggle = window.localStorage.getItem("editor");

const runEditor = toggle && toggle === 'true';

if (!runEditor) {
  setInitialSizing();
  fitToWindow();
  createTriangles();

  const decoded = deserializer.loadFromLocalStorage('animation');
  const patterns = deserializer.getPatternsFromFrames(decoded);
  initializePatternAnimations(patterns);
  setScrollAndResizeHandlers();
} else {
  document.getElementById('editor-outer').style.display = 'block';
  setInitialSizing();
  createTriangles();
  editor.initialize();
}