import g from '../globals';
import EventChannel from './EventChannel';
import '../assets/editor.css';

const colors = g.config.colors;

const inputWait = document.getElementById('editor-option-wait') as HTMLInputElement;
const inputFade = document.getElementById('editor-option-fade') as HTMLInputElement;
const inputSpeed = document.getElementById('editor-option-speed') as HTMLInputElement;
const inputRecolorFrom = document.getElementById('editor-option-colorfrom') as HTMLInputElement;
const inputRecolorTo = document.getElementById('editor-option-colorto') as HTMLInputElement;
const inputAnimationName = document.getElementById('editor-option-name') as HTMLInputElement;

class UIControls {
  state: {
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
  toolboxLocation: 'left' | 'right';
  toolboxVisible: boolean;
  eventChannel: EventChannel;
  elements: {
    outerEditor: HTMLElement;
  }
  constructor(eventChannel: EventChannel) {
    this.toolboxLocation = 'left';
    this.state = {
      inputFocused: false,
      shiftDown: false,
      curColorIdx: 1,
      curAltColorIdx: 2,
      wait: parseFloat(inputWait.value),
      fade: parseFloat(inputFade.value),
      speed: parseFloat(inputSpeed.value),
      colorFrom: parseInt(inputRecolorFrom.value, 10),
      colorTo: parseInt(inputRecolorTo.value, 10),
      animationName: inputAnimationName.value,
    }
    this.toolboxVisible = true;
    (window as any).logyou = () => console.log(this);
    this.eventChannel = eventChannel;
    this.elements = {
      outerEditor: document.getElementById('editor-outer'),
    }

  }

  initialize = () => {
    const scroll = document.getElementById('scrollOuter');
    if (scroll) {
      scroll.style.pointerEvents = 'none';
    }
    document.getElementById('editor-outer').style.display = 'block';
    document.body.style.backgroundColor = "#FFF";

    this.addColorPalette();
    this.addButtonEventSources();
    this.addInputEventSources();
    this.addFieldHandlers();
    this.setKeyHandlers();
  }

  addColorPalette = () => {
    const outerColors = document.getElementById('editor-colors');
    // create color buttons
    if (outerColors) {
      colors.forEach((color, n) => {
        const btn = document.createElement('button');
        btn.className = 'editor-color';
        btn.id = 'btnColor_' + n;
        btn.onclick = this.colorClickHandler(n);
        btn.style.backgroundColor = color;
        outerColors.appendChild(btn);
        if (n === 1) {
          btn.classList.add('editor-color-selected');
        }
      });
    }
  }

  addButtonEventSources = () => {
    const ec = this.eventChannel;
    ec.addButtonEventSource('btnUndo', document.getElementById('editor-option-undo'));
    ec.addButtonEventSource('btnFrame', document.getElementById('editor-option-frame'));
    ec.addButtonEventSource('btnPlay', document.getElementById('editor-option-play'));
    ec.addButtonEventSource('btnSave', document.getElementById('editor-option-save'));
    ec.addButtonEventSource('btnLoad', document.getElementById('editor-option-load'));
    ec.addButtonEventSource('btnRecolor', document.getElementById('editor-option-recolor'));
    ec.addButtonEventSource('btnRandom', document.getElementById('editor-option-random'));
  }

  addInputEventSources = () => {
    const ec = this.eventChannel;
    ec.addInputEventSource('inputWait', inputWait);
    ec.addInputEventSource('inputFade', inputFade);
    ec.addInputEventSource('inputSpeed', inputSpeed);
    ec.addInputEventSource('inputRecolorFrom', inputRecolorFrom);
    ec.addInputEventSource('inputRecolorTo', inputRecolorTo);
    ec.addInputEventSource('inputAnimationName', inputAnimationName);
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
    for (let i = 0; i < colors.length; i++) {
      const btn = document.getElementById('btnColor_' + i);
      if (btn) {
        if (i === idx) {
          btn.classList.add('editor-color-selected');
          btn.classList.remove('editor-color-selected-alt');
        } else {
          btn.classList.remove('editor-color-selected');
        }
      }
    }
    this.state.curColorIdx = idx;
    this.eventChannel.dispatch({
      type: 'setColor',
      payload: idx,
    })
  }

  setColorActiveAlt = (idx: number) => {
    for (let i = 0; i < colors.length; i++) {
      const btn = document.getElementById('btnColor_' + i);
      if (btn) {
        if (i === idx) {
          btn.classList.add('editor-color-selected-alt');
          btn.classList.remove('editor-color-selected');
        } else {
          btn.classList.remove('editor-color-selected-alt');
        }
      }
    }
    this.state.curAltColorIdx = idx;
    this.eventChannel.dispatch({
      type: 'setAltColor',
      payload: idx,
    })
  }

  setInputFocused = (focused: boolean) => () => this.state.inputFocused = focused;

  addFieldHandlers = () => {
    const ec = this.eventChannel;
    [
      document.getElementById('editor-option-wait') as HTMLInputElement,
      document.getElementById('editor-option-fade') as HTMLInputElement,
      document.getElementById('editor-option-speed') as HTMLInputElement,
      document.getElementById('editor-option-colorfrom') as HTMLInputElement,
      document.getElementById('editor-option-colorto') as HTMLInputElement,
      document.getElementById('editor-option-name') as HTMLInputElement,
    ]
      .forEach(input => {
        input.onfocus = () => this.eventChannel.dispatch({ type: 'input_focus', payload: { input } });
        input.onblur = () => this.eventChannel.dispatch({ type: 'input_blur', payload: { input } });
      })

    ec.subscribe('input_focus', this.setInputFocused(true));
    ec.subscribe('input_blur', this.setInputFocused(false));
    ec.subscribe('inputWait', (payload) => this.state.wait = parseFloat(payload.value));
    ec.subscribe('inputFade', (payload) => {
      console.log(payload, parseFloat(payload.value))
      this.state.fade = parseFloat(payload.value)
    });
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