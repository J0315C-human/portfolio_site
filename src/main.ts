import './assets/styles.css';
import { setScrollAndResizeHandlers } from './dom/handlers';
import { createTriangles, setInitialSizing } from './dom';
import { initializePatternAnimations, patterns } from './patterns';
import editor from './editor';

const runEditor = true;
setInitialSizing();

createTriangles();
if (!runEditor) {

  initializePatternAnimations(patterns);
  setScrollAndResizeHandlers();
} else {
  editor.initialize();
}