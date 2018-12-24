import Globals from "../globals";
import constants from "../constants";

export default class Elements {
  body: HTMLElement;
  outer: HTMLElement;
  svgOuter: HTMLElement;
  rootSvgGroup: HTMLElement;
  scrollContainer: HTMLDivElement;
  outerEditor: HTMLDivElement;
  outerColors: HTMLDivElement;
  inputWait: HTMLInputElement;
  inputFade: HTMLInputElement;
  inputSpeed: HTMLInputElement;
  inputRecolorFrom: HTMLInputElement;
  inputRecolorTo: HTMLInputElement;
  inputAnimationName: HTMLInputElement;
  inputGridName: HTMLInputElement;
  inputTiming: HTMLSelectElement;
  btnUndo: HTMLButtonElement;
  btnFrame: HTMLButtonElement;
  btnPlay: HTMLButtonElement;
  btnSave: HTMLButtonElement;
  btnLoad: HTMLButtonElement;
  btnAddAnimation: HTMLButtonElement;
  btnLoadGrid: HTMLButtonElement;
  btnSaveGrid: HTMLButtonElement;
  btnRecolor: HTMLButtonElement;
  btnRandom: HTMLButtonElement;
  divCurrentTime: HTMLDivElement;
  colorButtons: HTMLButtonElement[];
  inputs: HTMLInputElement[];
  constructor() {
    this.body = document.body;
    this.outer = document.getElementById("outer");
    this.svgOuter = document.getElementById("svg");
    this.rootSvgGroup = document.getElementById("rootGroup");
    this.scrollContainer = document.getElementById('scrollOuter') as HTMLDivElement;
    this.outerEditor = document.getElementById('editor-outer') as HTMLDivElement;
    this.outerColors = document.getElementById('editor-colors') as HTMLDivElement;
    this.inputWait = document.getElementById('editor-option-wait') as HTMLInputElement;
    this.inputFade = document.getElementById('editor-option-fade') as HTMLInputElement;
    this.inputSpeed = document.getElementById('editor-option-speed') as HTMLInputElement;
    this.inputRecolorFrom = document.getElementById('editor-option-colorfrom') as HTMLInputElement;
    this.inputRecolorTo = document.getElementById('editor-option-colorto') as HTMLInputElement;
    this.inputAnimationName = document.getElementById('editor-option-name') as HTMLInputElement;
    this.inputGridName = document.getElementById('editor-option-grid-name') as HTMLInputElement;
    this.inputTiming = document.getElementById('editor-option-timing') as HTMLSelectElement;

    this.btnUndo = document.getElementById('editor-option-undo') as HTMLButtonElement;
    this.btnFrame = document.getElementById('editor-option-frame') as HTMLButtonElement;
    this.btnPlay = document.getElementById('editor-option-play') as HTMLButtonElement;
    this.btnSave = document.getElementById('editor-option-save') as HTMLButtonElement;
    this.btnLoad = document.getElementById('editor-option-load') as HTMLButtonElement;
    this.btnAddAnimation = document.getElementById('editor-option-add-animation') as HTMLButtonElement;
    this.btnRecolor = document.getElementById('editor-option-recolor') as HTMLButtonElement;
    this.btnRandom = document.getElementById('editor-option-random') as HTMLButtonElement;
    this.btnSaveGrid = document.getElementById('editor-option-save-grid') as HTMLButtonElement;
    this.btnLoadGrid = document.getElementById('editor-option-load-grid') as HTMLButtonElement;

    this.divCurrentTime = document.getElementById('editor-current-time') as HTMLDivElement;
    this.colorButtons = [
      document.getElementById('btnColor_0') as HTMLButtonElement,
      document.getElementById('btnColor_1') as HTMLButtonElement,
      document.getElementById('btnColor_2') as HTMLButtonElement,
      document.getElementById('btnColor_3') as HTMLButtonElement,
      document.getElementById('btnColor_4') as HTMLButtonElement,
      document.getElementById('btnColor_5') as HTMLButtonElement,
      document.getElementById('btnColor_6') as HTMLButtonElement
    ]
    this.inputs = [
      this.inputWait,
      this.inputFade,
      this.inputSpeed,
      this.inputAnimationName,
      this.inputGridName,
    ]
  }

  setupForEditorMode = (g: Globals) => {
    this.scrollContainer.style.pointerEvents = 'none';
    this.outerEditor.style.display = 'block';
    this.body.style.backgroundColor = "#FFF";
  }

  setupForNormalMode = (g: Globals) => {
    this.scrollContainer.style.pointerEvents = 'auto';
    this.outerEditor.style.display = 'none';
    this.body.style.backgroundColor = constants.colors[0];
  }
}