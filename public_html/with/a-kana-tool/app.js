(() => {
  const $ = id => document.getElementById(id);
  const answerInput = $('answer');
  const feedback = $('feedback');
  const nextButton = $('next');
  const quizCard = document.querySelector('.quiz-card');
  const quizContent = $('quiz-content');
  const pauseScreen = $('pause-screen');
  const pauseButton = $('pause-button');
  const resumeButton = $('resume-button');
  const scriptButtons = document.querySelectorAll('[data-script]');

  let script = 'both';
  let current;
  let locked = false;
  let quizTimer;
  let pendingAction = null;
  let questionSettingsChanged = false;
  let manualPaused = true;
  let hasStarted = false;
  let inputVisible = false;
  let questionStartedAt;
  let pausedMs = 0;
  let pauseStartedAt = null;
  let lastInputDuration = 0;

  function isTimingPaused() {
    return manualPaused || settings.dialog.open || !inputVisible || document.hidden;
  }

  function clearQuizTimer() {
    clearTimeout(quizTimer);
    quizTimer = undefined;
    pendingAction = null;
  }

  function pauseQuizTimer() {
    if (!pendingAction || pendingAction.startedAt === null) return;
    pendingAction.remaining = Math.max(0, pendingAction.remaining - (performance.now() - pendingAction.startedAt));
    pendingAction.startedAt = null;
    clearTimeout(quizTimer);
    quizTimer = undefined;
  }

  function resumeQuizTimer() {
    if (!pendingAction || pendingAction.startedAt !== null || isTimingPaused()) return;
    pendingAction.startedAt = performance.now();
    quizTimer = setTimeout(() => {
      const {callback} = pendingAction;
      pendingAction = null;
      quizTimer = undefined;
      callback();
    }, pendingAction.remaining);
  }

  function scheduleQuiz(callback, delay) {
    clearQuizTimer();
    pendingAction = {callback, remaining: delay, startedAt: null};
    resumeQuizTimer();
  }

  function syncTimingPause() {
    if (isTimingPaused()) {
      if (pauseStartedAt === null) pauseStartedAt = performance.now();
      pauseQuizTimer();
      return;
    }

    if (pauseStartedAt !== null) {
      pausedMs += performance.now() - pauseStartedAt;
      pauseStartedAt = null;
    }
    resumeQuizTimer();
    if (!pendingAction && !locked && current.mode === 'character' && answerInput.value.trim()) checkAnswer();
  }

  function updateInputVisibility() {
    const bounds = answerInput.getBoundingClientRect();
    inputVisible = !manualPaused && bounds.width > 0 && bounds.height > 0 &&
      bounds.bottom > 0 && bounds.top < window.innerHeight &&
      bounds.right > 0 && bounds.left < window.innerWidth;
    syncTimingPause();
  }

  function setManualPause(paused) {
    manualPaused = paused;
    if (paused) syncTimingPause();
    else hasStarted = true;

    quizCard.classList.toggle('is-paused', paused);
    quizContent.inert = paused;
    quizContent.setAttribute('aria-hidden', paused);
    pauseScreen.hidden = !paused;
    $('pause-message').textContent = hasStarted ? 'Practice paused.' : 'Ready to practice?';
    resumeButton.textContent = hasStarted ? 'Unpause' : 'Begin';
    if (paused) {
      inputVisible = false;
      resumeButton.focus();
    } else {
      updateInputVisibility();
      if (inputVisible && !answerInput.disabled) answerInput.focus();
      else if (inputVisible && !nextButton.hidden) nextButton.focus();
    }
  }

  function answerDuration(now = performance.now()) {
    const currentPause = pauseStartedAt === null ? 0 : now - pauseStartedAt;
    return Math.max(0, now - questionStartedAt - pausedMs - currentPause);
  }

  function nextQuestion() {
    clearQuizTimer();
    current = progress.selectQuestion(settings.mode, script, settings.categories);
    locked = !current;
    const isWord = settings.mode === 'word';
    $('answer-hint').hidden = isWord;
    $('kana').classList.toggle('word-prompt', isWord);
    $('kana').textContent = current ? current.prompt : '—';
    settings.applyQuestionFont();
    let questionLabel = 'Word';
    if (current) {
      const scriptLabel = current.script === 'hiragana' ? 'Hiragana' : 'Katakana';
      const category = isWord ? 'word' : current.category;
      questionLabel = `${scriptLabel} - ${category[0].toUpperCase()}${category.slice(1)}`;
    }
    $('category').textContent = questionLabel;
    answerInput.value = '';
    answerInput.disabled = !current;
    feedback.textContent = current ? '' : 'No words match. Choose more kana categories in Settings or switch scripts.';
    feedback.className = 'feedback';
    nextButton.hidden = true;
    if (current && !manualPaused && !settings.dialog.open) answerInput.focus();
    questionStartedAt = performance.now();
    pausedMs = 0;
    pauseStartedAt = isTimingPaused() ? questionStartedAt : null;
    lastInputDuration = 0;
    if (!manualPaused) updateInputVisibility();
  }

  function checkAnswer() {
    if (locked || isTimingPaused() || current.mode === 'word') return;
    clearQuizTimer();

    const answer = answerInput.value.trim().toLowerCase();
    if (!answer) return;

    const acceptedAnswers = kanaCatalog.acceptedAnswers(current);
    if (!acceptedAnswers.includes(answer)) {
      const delay = [1000, 500, 250][Math.min(answer.length, 3) - 1];
      const isPartialAnswer = acceptedAnswers.some(reading => reading.startsWith(answer));
      scheduleQuiz(showIncorrect, delay * settings.answerSpeed * (isPartialAnswer ? 4 : 1));
      return;
    }

    showCorrect(answer, lastInputDuration);
  }

  function showCorrect(answer, timeToAnswer) {
    locked = true;
    progress.record(current, true, answer, timeToAnswer);
    feedback.textContent = 'Correct — nice recall.';
    feedback.className = 'feedback correct';
    answerInput.disabled = true;
    statsView.render(progress.summary(script), script);
    scheduleQuiz(nextQuestion, 650);
  }

  function showIncorrect(timeToAnswer = lastInputDuration) {
    const answer = answerInput.value.trim().toLowerCase();
    if (locked || !answer) return;

    locked = true;
    progress.record(current, false, answer, timeToAnswer);
    const readings = current.mode === 'word'
      ? wordQuiz.acceptedAnswers(current)
      : [...kanaCatalog.acceptedAnswers(current)].sort((a, b) => a.length - b.length);
    const expected = document.createElement('strong');
    expected.textContent = new Intl.ListFormat('en-US', {type: 'disjunction'}).format(readings);
    feedback.replaceChildren('Not quite. The answer is ', expected);
    feedback.className = 'feedback incorrect';
    answerInput.disabled = true;
    nextButton.hidden = false;
    statsView.render(progress.summary(script), script);
  }

  scriptButtons.forEach(button => {
    button.onclick = () => {
      scriptButtons.forEach(choice => choice.classList.remove('active'));
      button.classList.add('active');
      script = button.dataset.script;
      statsView.render(progress.summary(script), script);
      nextQuestion();
    };
  });

  $('settings-button').onclick = () => {
    settings.dialog.showModal();
    syncTimingPause();
  };
  function refreshQuestionOnClose() {
    clearQuizTimer();
    questionSettingsChanged = true;
  }

  $('quiz-mode').addEventListener('change', refreshQuestionOnClose);
  $('kana-categories').addEventListener('change', refreshQuestionOnClose);
  settings.dialog.addEventListener('close', () => {
    if (questionSettingsChanged) {
      questionSettingsChanged = false;
      nextQuestion();
    } else {
      syncTimingPause();
      if (!manualPaused && inputVisible && !locked) answerInput.focus();
    }
  });
  $('reset-progress').onclick = () => {
    if (confirm('Reset all local progress?')) {
      progress.reset();
      location.reload();
    }
  };
  $('statsSort').onclick = () => statsView.toggleSort(progress.summary(script), script);
  $('metricToggle').onclick = () => statsView.toggleMetric(progress.summary(script), script);
  pauseButton.onclick = () => setManualPause(true);
  resumeButton.onclick = () => setManualPause(false);

  function submitAnswer() {
    if (locked || isTimingPaused()) return;
    const answer = answerInput.value.trim().toLowerCase();
    if (!answer) return;
    clearQuizTimer();
    const accepted = current.mode === 'word'
      ? wordQuiz.accepts(current.units, answer)
      : kanaCatalog.acceptedAnswers(current).includes(answer);
    const timeToAnswer = answerDuration();
    if (accepted) showCorrect(answer, timeToAnswer);
    else showIncorrect(timeToAnswer);
  }

  answerInput.addEventListener('input', () => {
    lastInputDuration = answerDuration();
    if (isTimingPaused()) clearQuizTimer();
    checkAnswer();
  });
  new IntersectionObserver(([entry]) => {
    inputVisible = entry.isIntersecting;
    syncTimingPause();
  }).observe(answerInput);
  document.addEventListener('visibilitychange', syncTimingPause);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || isTimingPaused() || event.isComposing) return;
    if (event.repeat) return;
    if (!locked && event.target === answerInput) {
      event.preventDefault();
      submitAnswer();
      return;
    }
    if (nextButton.hidden) return;
    if (document.activeElement.matches('button, a')) return;

    event.preventDefault();
    nextQuestion();
  });
  nextButton.onclick = nextQuestion;

  settings.initialize();
  statsView.render(progress.summary(script), script);
  nextQuestion();
  resumeButton.focus();
})();
