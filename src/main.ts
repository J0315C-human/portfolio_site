import './assets/styles.css';
import { setScrollAndResizeHandlers } from './dom/handlers';
import { createTriangles, setInitialSizing } from './dom';
import { initializePatternAnimations } from './patterns';

setInitialSizing();

createTriangles();
initializePatternAnimations();
setScrollAndResizeHandlers();
