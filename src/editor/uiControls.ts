import EventChannel from './EventChannel';
import '../assets/editor.css';
import Elements from './elements';
import Globals from '../globals';
import { TimingFunctionName, FrameWithGrid } from './typings';
import constants from '../constants';

export interface UIState {
  inputFocused: boolean;
  shiftDown: boolean;
  zDown: boolean;
  curColorIdx: number;
  curAltColorIdx: number;
  fade: number;
  wait: number;
  speed: number;
  animationName: string;
  timingFunction: TimingFunctionName;
  gridName: string;
  cursorMode: string;
}

const getTimingSelectHTML = (val: string) => `<select 
class="editor-frame-timing-item">
<option value="none" ${val === 'none' ? 'selected' : ''}>none</option>
<option value="swipe_right_slow" ${val === 'swipe_right_slow' ? 'selected' : ''}>swipe right slow</option>
<option value="swipe_right" ${val === 'swipe_right' ? 'selected' : ''}>swipe right</option>
<option value="swipe_right_fast" ${val === 'swipe_right_fast' ? 'selected' : ''}>swipe right fast</option>
<option value="swipe_left_slow" ${val === 'swipe_left_slow' ? 'selected' : ''}>swipe left slow</option>
<option value="swipe_left" ${val === 'swipe_left' ? 'selected' : ''}>swipe left</option>
<option value="swipe_left_fast" ${val === 'swipe_left_fast' ? 'selected' : ''} selected>swipe left fast</option>
<option value="diag_1" ${val === 'diag_1' ? 'selected' : ''}>diag 1</option>
<option value="diag_2" ${val === 'diag_2' ? 'selected' : ''}>diag 2</option>
<option value="diag_3" ${val === 'diag_3' ? 'selected' : ''}>diag 3</option>
<option value="diag_4" ${val === 'diag_4' ? 'selected' : ''}>diag 4</option>
<option value="rand" ${val === 'rand' ? 'selected' : ''}>rand</option>
<option value="rand_swipe" ${val === 'rand_swipe' ? 'selected' : ''}>rand swipe</option>
<option value="center" ${val === 'center' ? 'selected' : ''}>center</option>
<option value="thing" ${val === 'thing' ? 'selected' : ''}>thing</option>
</select>`;

const cursorModes = [
  'normal',
  'hex',
  'quad_1',
  'quad_2',
  'quad_3',
  'line_1',
  'line_2',
  'line_3',
  'line_4',
  'large',
  'left',
  'left_2',
  'right',
  'right_2',
]

const timingFunctions = [
  'none',
  'swipe_right_slow',
  'swipe_right',
  'swipe_right_fast',
  'swipe_left_slow',
  'swipe_left',
  'swipe_left_fast',
  'diag_1',
  'diag_2',
  'diag_3',
  'diag_4',
  'rand',
  'rand_swipe',
  'center',
  'thing',
]
class UIControls {
  state: UIState;
  toolboxLocation: 'left' | 'right' | 'bottomLeft' | 'bottomRight';
  toolboxVisible: boolean;
  frameTimingVisible: boolean;
  eventChannel: EventChannel;
  elements: Elements;
  colors: string[];
  g: Globals;
  constructor(eventChannel: EventChannel, elements: Elements, globals: Globals) {
    this.g = globals;
    this.elements = elements;
    this.toolboxLocation = 'left';
    this.state = {
      inputFocused: false,
      shiftDown: false,
      zDown: false,
      curColorIdx: 1,
      curAltColorIdx: 2,
      timingFunction: 'none',
      wait: parseFloat(elements.inputWait.value),
      fade: parseFloat(elements.inputFade.value),
      speed: parseFloat(elements.inputSpeed.value),
      animationName: elements.inputAnimationName.value,
      gridName: elements.inputGridName.value,
      cursorMode: elements.inputCursor.value,
    }
    this.toolboxVisible = true;
    this.frameTimingVisible = false;
    (window as any).logyou = () => console.log(this);
    this.eventChannel = eventChannel;
    this.colors = constants.colors;
  }

  initialize = () => {
    this.elements.setupForEditorMode(this.g);

    this.addColorPalette();
    this.addButtonEventSources();
    this.addInputEventSources();
    this.addFieldHandlers();
    this.setKeyHandlers();
    this.subscribeToEvents();
  }

  addColorPalette = () => {
    const { colorButtons } = this.elements;
    // create color buttons
    colorButtons.forEach((btn, n) => {
      btn.onclick = this.colorClickHandler(n);
      btn.style.backgroundColor = this.colors[n];
      if (n === 1) {
        btn.classList.add('editor-color-selected');
      }
    });
  }

  addButtonEventSources = () => {
    const ec = this.eventChannel;
    const el = this.elements;
    ec.addButtonEventSource('btnUndo', el.btnUndo);
    ec.addButtonEventSource('btnFrame', el.btnFrame);
    ec.addButtonEventSource('btnPlay', el.btnPlay);
    ec.addButtonEventSource('btnSave', el.btnSave);
    ec.addButtonEventSource('btnLoad', el.btnLoad);
    ec.addButtonEventSource('btnRecolor', el.btnRecolor);
    ec.addButtonEventSource('btnRandom', el.btnRandom);
    ec.addButtonEventSource('btnSaveGrid', el.btnSaveGrid);
    ec.addButtonEventSource('btnLoadGrid', el.btnLoadGrid);
    ec.addButtonEventSource('btnShowFrameTiming', el.btnShowFrameTiming);
    ec.addButtonEventSource('btnAddAnimation', el.btnAddAnimation);
  }

  addInputEventSources = () => {
    const ec = this.eventChannel;
    const el = this.elements;
    ec.addInputEventSource('inputWait', el.inputWait);
    ec.addInputEventSource('inputFade', el.inputFade);
    ec.addInputEventSource('inputSpeed', el.inputSpeed);
    ec.addInputEventSource('inputAnimationName', el.inputAnimationName);
    ec.addInputEventSource('inputGridName', el.inputGridName);
    ec.addInputEventSource('inputTiming', el.inputTiming);
    ec.addInputEventSource('inputCursor', el.inputCursor);
  }

  subscribeToEvents = () => {
    const ec = this.eventChannel;
    // const el = this.elements;
    ec.subscribe('set_frame_caret', (payload: { frameIdx: number }) => this.setFrameTimingCaret(payload.frameIdx));
  }
  colorClickHandler = (n: number) => () => {
    if (this.state.inputFocused) return;
    if (this.state.shiftDown) {
      this.setColorActiveAlt(n);
    } else {
      this.setColorActive(n);
    }
  }

  setColorActive = (idx: number) => {
    const { colorButtons } = this.elements;
    colorButtons.forEach((btn, i) => {
      if (i === idx) {
        btn.classList.add('editor-color-selected');
        btn.classList.remove('editor-color-selected-alt');
      } else {
        btn.classList.remove('editor-color-selected');
      }
    })
    this.state.curColorIdx = idx;
    this.eventChannel.dispatch({
      type: 'setColor',
      payload: idx,
    })
  }

  setColorActiveAlt = (idx: number) => {
    const { colorButtons } = this.elements;
    colorButtons.forEach((btn, i) => {
      if (i === idx) {
        btn.classList.add('editor-color-selected-alt');
        btn.classList.remove('editor-color-selected');
      } else {
        btn.classList.remove('editor-color-selected-alt');
      }
    })
    this.state.curAltColorIdx = idx;
    this.eventChannel.dispatch({
      type: 'setAltColor',
      payload: idx,
    })
  }


  addFieldHandlers = () => {
    const setInputFocused = (focused: boolean) => () => this.state.inputFocused = focused;

    const ec = this.eventChannel;
    this.elements.inputs.forEach(input => {
      input.onfocus = () => this.eventChannel.dispatch({ type: 'input_focus', payload: { input } });
      input.onblur = () => this.eventChannel.dispatch({ type: 'input_blur', payload: { input } });
    })

    ec.subscribe('input_focus', setInputFocused(true));
    ec.subscribe('input_blur', setInputFocused(false));
    ec.subscribe('inputWait', (payload) => this.state.wait = parseFloat(payload.value));
    ec.subscribe('inputFade', (payload) => this.state.fade = parseFloat(payload.value));
    ec.subscribe('inputSpeed', (payload) => this.state.speed = parseFloat(payload.value));
    ec.subscribe('inputAnimationName', (payload) => this.state.animationName = payload.value);
    ec.subscribe('inputGridName', (payload) => this.state.gridName = payload.value);
    ec.subscribe('inputTiming', (payload) => this.state.timingFunction = payload.value);
    ec.subscribe('inputCursor', (payload) => this.state.cursorMode = payload.value);
  }

  setKeyHandlers = () => {
    const ec = this.eventChannel;

    ec.subscribe('keypress_a', this.switchToolboxVisibility);
    ec.subscribe('keypress_t', this.switchToolboxLocation);
    for (let i = 0; i <= 9; i++) {
      ec.subscribe(`keypress_${i}`, this.colorClickHandler(i));
    }

    ec.subscribe('keydown_shift', () => this.state.shiftDown = true);
    ec.subscribe('keyup_shift', () => this.state.shiftDown = false);

    ec.subscribe('keydown_z', () => this.state.zDown = true);
    ec.subscribe('keyup_z', () => this.state.zDown = false);

    ec.subscribe('keypress_q', this.selectNextOption(this.elements.inputCursor, cursorModes, 'inputCursor'));
    ec.subscribe('keypress_w', this.selectNextOption(this.elements.inputTiming, timingFunctions, 'inputTiming'));
  }

  private selectNextOption = (input: HTMLSelectElement, options: string[], actionType: string) => () => {
    if (this.state.inputFocused) return;
    const shift = this.state.shiftDown ? -1 : 1;
    const newIdx = options.findIndex(v => v === input.value) + shift;
    const newVal = this.state.shiftDown ?
      (newIdx < 0 ?
        options[options.length - 1] : options[newIdx])
      : (newIdx > (options.length - 1) ?
        options[0] : options[newIdx]);
    input.value = newVal;
    this.eventChannel.dispatch({ type: actionType, payload: { value: newVal } });
  }

  switchToolboxLocation = () => {
    if (this.state.inputFocused) return;
    if (this.toolboxLocation === 'left') {
      this.elements.outerEditor.style.top = '10vh';
      this.elements.outerEditor.style.left = '60vw';
      this.toolboxLocation = 'right';
    } else if (this.toolboxLocation === 'right') {
      this.elements.outerEditor.style.top = '50vh';
      this.elements.outerEditor.style.left = '60vw';
      this.toolboxLocation = 'bottomRight';
    }
    else if (this.toolboxLocation === 'bottomRight') {
      this.elements.outerEditor.style.top = '50vh';
      this.elements.outerEditor.style.left = '10vw';
      this.toolboxLocation = 'bottomLeft';
    }
    else if (this.toolboxLocation === 'bottomLeft') {
      this.elements.outerEditor.style.top = '10vh';
      this.elements.outerEditor.style.left = '10vw';
      this.toolboxLocation = 'left';
    }
  }

  switchToolboxVisibility = () => {
    if (this.state.inputFocused) return;
    if (this.toolboxVisible) {
      this.elements.outerEditor.style.display = 'none';
      this.toolboxVisible = false;
    } else {
      this.elements.outerEditor.style.display = 'block';
      this.toolboxVisible = true;
    }
  }

  switchFrameTimingVisibility = () => {
    if (this.frameTimingVisible) {
      this.elements.frameTiming.style.display = 'none';
      this.frameTimingVisible = false;
    } else {
      this.elements.frameTiming.style.display = 'block';
      this.frameTimingVisible = true;
    }
  }


  getSingleFrameTimingRow = (frame: FrameWithGrid, idx: number) => {
    return `<div class="editor-frame-timing-row" id="frame-timing-row-${idx}">
      <input class="editor-frame-timing-item" type="text" value="${frame.wait}"/>
      <input class="editor-frame-timing-item" type="text" value="${frame.fade}"/>
      ${getTimingSelectHTML(frame.timingFunc)}
    </div>`;
  }
  createFrameTimingTable = (frames: FrameWithGrid[]) => {
    const el = document.getElementById('editor-frame-timing-inner');
    if (el) {
      el.innerHTML = `<div class="editor-frame-timing-row">
      <div class="editor-frame-timing-itemlabel">wait</div>
      <div class="editor-frame-timing-itemlabel">fade</div>
      <div class="editor-frame-timing-itemlabel">timingfunc</div>
    </div>` + frames.map(this.getSingleFrameTimingRow).join('');
    }
  }

  setFrameTimingCaret = (frameIdx: number) => {
    if (frameIdx === -1) { // clear all frame carets
      const rows = document.getElementsByClassName('editor-frame-timing-row');
      for (let i = 0; i < rows.length; i++) {
        (rows.item(i) as HTMLDivElement).style.backgroundColor = 'inherit';
      }
    } else {
      const row = document.getElementById('frame-timing-row-' + frameIdx);
      if (row) {
        row.style.backgroundColor = '#333';
      }
    }
  }
}

export default UIControls;