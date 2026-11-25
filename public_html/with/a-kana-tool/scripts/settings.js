const settings = (() => {
  const storageKey = 'kana-atelier-settings-v2';
  const $ = id => document.getElementById(id);
  const fontOptions = [
    ['Shippori Mincho', "'Shippori Mincho',serif"],
    ['Noto Serif JP', "'Noto Serif JP',serif"],
    ['Klee One', "'Klee One',cursive"],
    ['Noto Sans JP', "'Noto Sans JP',sans-serif"],
    ['Zen Maru Gothic', "'Zen Maru Gothic',sans-serif"],
    ['Random', null]
  ];
  const kanaCharacters = [...new Set([...kanaCatalog.items, ...wordQuiz.extraSymbols].map(({kana}) => kana + kanaCatalog.toKatakana(kana)).join(''))].join('');

  // Request the web font subsets used by both scripts before the user switches fonts.
  const preloadedFonts = fontOptions.slice(0, -1).map(([name]) =>
    document.fonts.load(`16px "${name}"`, kanaCharacters).catch(() => [])
  );
  let fontRequest = 0;

  const dialog = $('settings-dialog');
  const speedControl = $('answer-speed');
  const modeControl = $('quiz-mode');
  const categoryControls = [...$('kana-categories').querySelectorAll('input')];
  const fontButton = $('fontSwitch');
  const fontLabel = fontButton.querySelector('span');
  const header = document.querySelector('.topbar');
  const actions = document.querySelector('.header-actions');
  const brandText = document.querySelector('.brand-copy');
  const savedSettings = readSettings();
  let metric = savedSettings.metric === 'speed' ? 'speed' : 'accuracy';
  let sortOrder = savedSettings.sortOrder === 'worst' ? 'worst' : 'best';
  modeControl.value = savedSettings.mode === 'word' ? 'word' : 'character';
  speedControl.disabled = modeControl.value === 'word';
  let fontIndex = Math.max(0, fontOptions.findIndex(([name]) => name === savedSettings.font));
  if (Array.from(speedControl.options).some(option => option.value === savedSettings.answerSpeed)) {
    speedControl.value = savedSettings.answerSpeed;
  }
  if (Array.isArray(savedSettings.categories) &&
      categoryControls.some(control => savedSettings.categories.includes(control.value))) {
    for (const control of categoryControls) {
      control.checked = savedSettings.categories.includes(control.value);
    }
  }

  function selectedCategories() {
    return categoryControls.filter(control => control.checked).map(control => control.value);
  }

  function updateCategoryControls() {
    const onlyOne = selectedCategories().length === 1;
    for (const control of categoryControls) {
      control.disabled = onlyOne && control.checked;
    }
  }

  function readSettings() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveSettings() {
    localStorage.setItem(storageKey, JSON.stringify({
      mode: modeControl.value,
      categories: selectedCategories(),
      answerSpeed: speedControl.value,
      font: fontOptions[fontIndex][0],
      metric,
      sortOrder
    }));
  }

  function fitFontLabel() {
    // Measure the wide button so a shorter name can reappear at the same viewport width.
    fontLabel.hidden = false;
    const sharesRow = actions.getBoundingClientRect().top < brandText.getBoundingClientRect().bottom;
    const crowdsBrand = sharesRow && Array.from(brandText.children).some(text => text.scrollWidth > text.clientWidth);
    fontLabel.hidden = crowdsBrand || actions.scrollWidth > header.clientWidth;
  }

  function updateFontButton() {
    const name = fontOptions[fontIndex][0];
    fontButton.setAttribute('aria-label', `Change kana font; current font: ${name}`);
    fontLabel.textContent = name;
    fitFontLabel();
  }

  async function applyFont() {
    const request = ++fontRequest;
    const isRandom = fontOptions[fontIndex][1] === null;
    const index = isRandom ? Math.floor(Math.random() * preloadedFonts.length) : fontIndex;
    await preloadedFonts[index];
    if (request !== fontRequest) return;

    const font = fontOptions[index][1];
    if (isRandom) {
      $('kana').style.fontFamily = font;
      return;
    }

    document.documentElement.style.setProperty('--kana-font', font);
    $('kana').style.fontFamily = '';
  }

  function applyQuestionFont() {
    if (fontOptions[fontIndex][1] === null) applyFont();
  }

  function cycleFont() {
    fontIndex = (fontIndex + 1) % fontOptions.length;
    applyFont();
    updateFontButton();
    saveSettings();
  }

  function initialize() {
    fontButton.onclick = cycleFont;
    new ResizeObserver(fitFontLabel).observe(header);
    document.fonts.addEventListener('loadingdone', fitFontLabel);
    modeControl.addEventListener('change', () => {
      speedControl.disabled = modeControl.value === 'word';
      saveSettings();
    });
    speedControl.addEventListener('change', saveSettings);
    $('kana-categories').addEventListener('change', () => {
      updateCategoryControls();
      saveSettings();
    });
    updateCategoryControls();
    if (fontOptions[fontIndex][1] !== null) applyFont();
    updateFontButton();
  }

  return {
    dialog,
    get mode() { return modeControl.value; },
    get categories() { return selectedCategories(); },
    get answerSpeed() { return Number(speedControl.value); },
    get metric() { return metric; },
    get sortOrder() { return sortOrder; },
    setMetric(value) {
      metric = value;
      saveSettings();
    },
    setSortOrder(value) {
      sortOrder = value;
      saveSettings();
    },
    applyQuestionFont,
    initialize
  };
})();
