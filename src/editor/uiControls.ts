import g from '../globals';
import EventChannel from './EventChannel';
import '../assets/editor.css';

const colors = g.config.colors;



class UIControls {
  curColorIdx: number;
  curAltColorIdx: number;
  inputFocused: boolean;
  toolboxLocation: 'left' | 'right';
  toolboxVisible: boolean;
  shiftDown: boolean;
  eventChannel: EventChannel;
  elements: {
    outerEditor: HTMLElement;
  }
  constructor(eventChannel: EventChannel) {
    this.curColorIdx = 1;
    this.curAltColorIdx = 0;
    this.inputFocused = false;
    this.toolboxLocation = 'left';
    this.shiftDown = false;
    this.toolboxVisible = true;
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
    this.setBtnHandlers();
    this.setFieldHandlers();
    // this.setTriangleHandlers();
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
        if (n === this.curColorIdx) {
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
    ec.addInputEventSource('inputWait', document.getElementById('editor-option-wait') as HTMLInputElement);
    ec.addInputEventSource('inputFade', document.getElementById('editor-option-fade') as HTMLInputElement);
    ec.addInputEventSource('inputSpeed', document.getElementById('editor-option-speed') as HTMLInputElement);
    ec.addInputEventSource('inputRecolorFrom', document.getElementById('editor-option-colorfrom') as HTMLInputElement);
    ec.addInputEventSource('inputRecolorTo', document.getElementById('editor-option-colorto') as HTMLInputElement);
    ec.addInputEventSource('inputAnimationName', document.getElementById('editor-option-name') as HTMLInputElement);
  }

  colorClickHandler = (n: number) => () => {
    if (this.shiftDown) {
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
  }

  setBtnHandlers = () => {
    // if (btnUndo) {
    //   btnUndo.onclick = this.undoDraw;
    // }
    // if (btnFrame) {
    //   btnFrame.onclick = () => this.saveFrame();
    // }
    // if (btnPlay) {
    //   btnPlay.onclick = this.play;
    // }
    // if (btnSave) {
    //   btnSave.onclick = this.save;
    // }
    // if (btnLoad) {
    //   btnLoad.onclick = this.load;
    // }
    // if (btnRecolor) {
    //   btnRecolor.onclick = this.recolor;
    // }
    // if (btnRandom) {
    //   btnRandom.onclick = this.random;
    // }
  }

  setFieldHandlers = () => {
    // inputFade.onfocus = () => this.inputFocused = true;
    // inputFade.onblur = () => this.inputFocused = false;
    // inputWait.onfocus = () => this.inputFocused = true;
    // inputWait.onblur = () => this.inputFocused = false;
    // inputAnimationName.onfocus = () => this.inputFocused = true;
    // inputAnimationName.onblur = () => this.inputFocused = false;

    // // update 'new' tweenblocks if this frame changes
    // inputWait.onchange = this.refreshNewTweenBlocks;
    // inputFade.onchange = this.refreshNewTweenBlocks;
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

    ec.subscribe('keydown_shift', () => this.shiftDown = true);
    ec.subscribe('keyup_shift', () => this.shiftDown = false);

    // document.onkeypress = (e) => {
    //   if (e.key.toLowerCase() === 's') { this.undoDraw(); }
    //   else if (e.key.toLowerCase() === 'f') { this.saveFrame(); }
    //   else if (e.key.toLowerCase() === 'p') { this.play(); }
    //   else if (e.key.toLowerCase() === 'c') { this.clear(); }
    //   else if (e.key.toLowerCase() === 'l') { this.load(); }
    //   else if (e.key.toLowerCase() === 'k') { this.save(); }
 
  }


  switchToolboxLocation = () => {
    if (this.toolboxLocation === 'left') {
      this.elements.outerEditor.style.left = '60vw';
      this.toolboxLocation = 'right';
    } else {
      this.elements.outerEditor.style.left = '10vw';
      this.toolboxLocation = 'left';
    }
  }

  switchToolboxVisibility = () => {
    if (this.toolboxVisible) {
      this.elements.outerEditor.style.display = 'none';
      this.toolboxVisible = false;
    } else {
      this.elements.outerEditor.style.display = 'block';
      this.toolboxVisible = true;
    }
  }

  // setTriangleHandlers = () => {
  //   g.triangles.forEach((row, j) => {
  //     row.forEach((tri, i) => {
  //       tri.onpointerdown = this.setTriangleColorClickHandler(tri, j, i, false);
  //       tri.onpointerenter = this.setTriangleColorClickHandler(tri, j, i, true);
  //     })
  //   });
  // }

  // setTriangleColorClickHandler = (el: SVGElement, j: number, i: number, checkMouseDown: boolean) => (e: PointerEvent) => {
  //   if (checkMouseDown && e.buttons === 0) { return; }
  //   this.setTriangleColor(j, i, this.shiftDown ? this.curAltColorIdx : this.curColorIdx);
  // }
}

const uiControls = new UIControls(new EventChannel());
export default uiControls;