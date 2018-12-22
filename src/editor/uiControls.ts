import EventChannel from './EventChannel';
import '../assets/editor.css';
import Elements from './elements';
import Globals from '../globals';

export interface UIState {
  inputFocused: boolean;
  shiftDown: boolean;
  curColorIdx: number;
  curAltColorIdx: number;
  fade: number;
  wait: number;
  speed: number;
  colorFrom: number;
  colorTo: number;
  animationName: string;
}

class UIControls {
  state: UIState;
  toolboxLocation: 'left' | 'right';
  toolboxVisible: boolean;
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
      curColorIdx: 1,
      curAltColorIdx: 2,
      wait: parseFloat(elements.inputWait.value),
      fade: parseFloat(elements.inputFade.value),
      speed: parseFloat(elements.inputSpeed.value),
      colorFrom: parseInt(elements.inputRecolorFrom.value, 10),
      colorTo: parseInt(elements.inputRecolorTo.value, 10),
      animationName: elements.inputAnimationName.value,
    }
    this.toolboxVisible = true;
    (window as any).logyou = () => console.log(this);
    this.eventChannel = eventChannel;
    this.colors = globals.config.colors;
  }

  initialize = () => {
    this.elements.setupForEditorMode(this.g);

    this.addColorPalette();
    this.addButtonEventSources();
    this.addInputEventSources();
    this.addFieldHandlers();
    this.setKeyHandlers();
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
  }

  addInputEventSources = () => {
    const ec = this.eventChannel;
    const el = this.elements;
    ec.addInputEventSource('inputWait', el.inputWait);
    ec.addInputEventSource('inputFade', el.inputFade);
    ec.addInputEventSource('inputSpeed', el.inputSpeed);
    ec.addInputEventSource('inputRecolorFrom', el.inputRecolorFrom);
    ec.addInputEventSource('inputRecolorTo', el.inputRecolorTo);
    ec.addInputEventSource('inputAnimationName', el.inputAnimationName);
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
    ec.subscribe('inputRecolorFrom', (payload) => this.state.colorFrom = parseInt(payload.value, 10));
    ec.subscribe('inputRecolorTo', (payload) => this.state.colorTo = parseInt(payload.value, 10));
    ec.subscribe('inputAnimationName', (payload) => this.state.animationName = payload.value);
  }

  setKeyHandlers = () => {
    const ec = this.eventChannel;

    ec.subscribe('keypress_a', this.switchToolboxVisibility);
    ec.subscribe('keypress_t', this.switchToolboxLocation);
    ec.subscribe('keypress_0', this.colorClickHandler(0));
    ec.subscribe('keypress_1', this.colorClickHandler(1));
    ec.subscribe('keypress_2', this.colorClickHandler(2));
    ec.subscribe('keypress_3', this.colorClickHandler(3));
    ec.subscribe('keypress_4', this.colorClickHandler(4));
    ec.subscribe('keypress_5', this.colorClickHandler(5));
    ec.subscribe('keypress_6', this.colorClickHandler(6));
    ec.subscribe('keypress_7', this.colorClickHandler(7));

    ec.subscribe('keydown_shift', () => this.state.shiftDown = true);
    ec.subscribe('keyup_shift', () => this.state.shiftDown = false);
  }


  switchToolboxLocation = () => {
    if (this.state.inputFocused) return;
    if (this.toolboxLocation === 'left') {
      this.elements.outerEditor.style.left = '60vw';
      this.toolboxLocation = 'right';
    } else {
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
}

export default UIControls;