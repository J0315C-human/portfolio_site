import './assets/styles.css';
import { setScrollAndResizeHandlers } from './dom/handlers';
import { createTriangles, setInitialSizing } from './dom';
import { initializePatternAnimations } from './patterns';
import { fitToWindow } from './globals';
import deserializer from './editor/deserializer';
import EventChannel from './editor/EventChannel';
import UIControls from './editor/uiControls';
import Editor from './editor';
import Elements from './editor/elements';

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
  setInitialSizing();
  createTriangles();

  const ec = new EventChannel();
  const elements = new Elements();
  const uiControls = new UIControls(ec, elements);
  
  uiControls.initialize();

  const editor = new Editor(uiControls, ec);

  editor.initialize();
}