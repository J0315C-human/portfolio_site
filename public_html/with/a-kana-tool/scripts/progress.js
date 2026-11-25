const progress = (() => {
  const storageKey = 'kana-atelier-progress-v3';
  const emptySummary = () => ({
    stats: {}, attempts: 0, correct: 0, streak: 0, best: 0, history: []
  });
  const state = JSON.parse(localStorage.getItem(storageKey) || 'null') || emptySummary();
  state.history = state.history || [];
  state.responses = state.responses || [];
  state.byScript = state.byScript || {};
  for (const script of ['hiragana', 'katakana']) {
    state.byScript[script] = state.byScript[script] || emptySummary();
  }

  const emptySpeed = () => ({totalMs: 0, units: 0, symbols: {}});
  const speed = {both: emptySpeed(), hiragana: emptySpeed(), katakana: emptySpeed()};
  const capAnswerTime = milliseconds => Math.min(60000, Math.max(0, Math.round(milliseconds)));

  function addSpeed(target, response) {
    if (!response.correct) return;
    const unitMs = response.timeToAnswer / response.symbols.length;
    target.totalMs += response.timeToAnswer;
    target.units += response.symbols.length;
    for (const key of response.symbols) {
      const symbol = target.symbols[key] || {totalMs: 0, count: 0};
      symbol.totalMs += unitMs;
      symbol.count++;
      target.symbols[key] = symbol;
    }
  }

  let cappedSavedTimes = false;
  for (const response of state.responses) {
    const capped = capAnswerTime(response.timeToAnswer);
    if (capped !== response.timeToAnswer) {
      response.timeToAnswer = capped;
      cappedSavedTimes = true;
    }
    addSpeed(speed.both, response);
    addSpeed(speed[response.script], response);
  }
  if (cappedSavedTimes) localStorage.setItem(storageKey, JSON.stringify(state));

  function summary(scriptChoice) {
    const data = scriptChoice === 'both' ? state : state.byScript[scriptChoice];
    return {...data, speed: speed[scriptChoice]};
  }

  function weight(symbol) {
    const stats = state.stats[symbol.kana];
    const accuracy = stats && stats.total ? stats.correct / stats.total : 0;
    return Math.max(1, Math.round(1 + (1 - accuracy) * 5));
  }

  function selectQuestion(mode, scriptChoice, categories) {
    const scripts = scriptChoice === 'both' ? ['hiragana', 'katakana'] : [scriptChoice];

    if (mode === 'word') {
      const pools = scripts.map(script => wordQuiz.pool(script).filter(word =>
        word.units.every(({symbol}) => categories.includes(symbol.category))
      )).filter(words => words.length);
      if (!pools.length) return null;
      const words = pools.length === 1 ? pools[0] : pools[Math.floor(Math.random() * pools.length)];
      const weights = words.map(({units}) =>
        units.reduce((sum, unit) => sum + weight(unit.symbol), 0) / units.length
      );
      let draw = Math.random() * weights.reduce((sum, value) => sum + value, 0);
      for (let index = 0; index < words.length; index++) {
        draw -= weights[index];
        if (draw < 0) return words[index];
      }
      return words[words.length - 1];
    }

    const eligible = kanaCatalog.items.filter(item => categories.includes(item.category));
    const weighted = eligible.flatMap(item => Array(weight(item)).fill(item));
    const item = weighted[Math.floor(Math.random() * weighted.length)];
    const script = scripts.length === 1 ? scripts[0] : scripts[Math.floor(Math.random() * scripts.length)];
    const prompt = script === 'katakana' ? kanaCatalog.toKatakana(item.kana) : item.kana;
    return {...item, prompt, script, mode, units: [{symbol: item}]};
  }

  function recordIn(summary, question, correct, answer, scores) {
    question.units.forEach(({symbol}, index) => {
      if (scores[index] === null) return;
      const {kana} = symbol;
      const stats = summary.stats[kana] || {correct: 0, total: 0};
      stats.total++;
      if (scores[index]) stats.correct++;
      summary.stats[kana] = stats;
    });
    summary.attempts++;
    if (correct) {
      summary.correct++;
      summary.streak++;
      summary.best = Math.max(summary.best, summary.streak);
    } else {
      summary.streak = 0;
      summary.history.unshift({
        mode: question.mode, kana: question.prompt, script: question.script,
        answer, expected: question.romaji, time: Date.now()
      });
      summary.history = summary.history.slice(0, 12);
    }
  }

  function record(question, correct, answer, timeToAnswer) {
    const scores = correct ? question.units.map(() => true)
      : question.mode === 'word' ? wordQuiz.scoreMistake(question.units, answer) : [false];
    recordIn(state, question, correct, answer, scores);
    recordIn(state.byScript[question.script], question, correct, answer, scores);
    const response = {
      script: question.script, mode: question.mode, prompt: question.prompt,
      answer, correct, timeToAnswer: capAnswerTime(timeToAnswer),
      symbols: question.units.map(({symbol}) => symbol.kana)
    };
    state.responses.push(response);
    addSpeed(speed.both, response);
    addSpeed(speed[question.script], response);
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function reset() {
    localStorage.removeItem(storageKey);
  }

  return {state, summary, selectQuestion, record, reset};
})();
