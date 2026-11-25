const statsView = (() => {
  const $ = id => document.getElementById(id);
  const speedScore = milliseconds => 100 / (1 + (milliseconds / 4000) ** 2);
  const formatTime = milliseconds => `${(milliseconds / 1000).toFixed(1)}s`;

  function renderHistory(history) {
    const list = $('history');
    list.replaceChildren();
    if (!history.length) {
      list.innerHTML = '<p class="empty-state">Your mistakes will appear here.</p>';
      return;
    }
    for (const entry of history) {
      const row = document.createElement('div');
      row.className = entry.mode === 'word' ? 'history-item word-mistake' : 'history-item';
      row.innerHTML = '<span class="history-symbol"></span><span class="history-answers">' +
        '<span class="history-answer"></span> <span class="history-expected"></span></span>' +
        '<span class="history-time"></span>';
      row.querySelector('.history-symbol').textContent = entry.script === 'katakana'
        ? kanaCatalog.toKatakana(entry.kana) : entry.kana;
      row.querySelector('.history-answer').textContent = entry.answer;
      row.querySelector('.history-expected').textContent = '(' + entry.expected + ')';
      row.querySelector('.history-time').textContent = new Date(entry.time)
        .toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
      list.append(row);
    }
  }

  function renderSymbols(stats, speed, script, metric) {
    const counts = {strong: 0, learning: 0, 'needs-work': 0, new: 0};
    const practicedExtras = wordQuiz.extraSymbols.filter(symbol => stats[symbol.kana]);
    const symbols = [...kanaCatalog.items, ...practicedExtras].map((item, index) => {
      const result = stats[item.kana] || {correct: 0, total: 0};
      const timing = speed.symbols[item.kana];
      const averageMs = timing && timing.count ? timing.totalMs / timing.count : null;
      const value = metric === 'speed'
        ? (averageMs === null ? null : speedScore(averageMs))
        : (result.total ? Math.round(result.correct / result.total * 100) : null);
      const level = value === null ? 'new' : value >= 90 ? 'strong' : value >= 50 ? 'learning' : 'needs-work';
      counts[level]++;
      return {item, index, value, averageMs, level};
    });

    symbols.sort((a, b) => {
      if (a.value === null) return b.value === null ? a.index - b.index : 1;
      if (b.value === null) return -1;
      const difference = settings.sortOrder === 'best' ? b.value - a.value : a.value - b.value;
      return difference || a.index - b.index;
    });

    $('symbolStats').innerHTML = symbols.map(({item, value, averageMs, level}) => {
      const kana = script === 'katakana' ? kanaCatalog.toKatakana(item.kana) : item.kana;
      const bar = value === null
        ? '<span class="symbol-bar new">no data</span>'
        : `<span class="symbol-bar ${level}"><i style="width:${value.toFixed(1)}%"></i></span>`;
      const display = value === null ? '' : metric === 'speed' ? formatTime(averageMs) : `${value}%`;
      return `<div class="symbol-row"><span class="symbol-kana">${kana}</span>` +
        `<span class="symbol-romaji">${item.romaji}</span>` +
        bar +
        `<span class="symbol-pct">${display}</span></div>`;
    }).join('');

    const breakdown = $('symbolBreakdown');
    Object.entries(counts).forEach(([level, count]) => {
      const segment = breakdown.querySelector(`.${level}`);
      segment.hidden = count === 0;
      segment.style.flexGrow = count;
    });

    $('strongCount').textContent = counts.strong;
    $('learningCount').textContent = counts.learning;
    $('needsWorkCount').textContent = counts['needs-work'];
    $('newCount').textContent = counts.new;
    const labels = metric === 'speed'
      ? {strong: 'Fast', learning: 'Steady', 'needs-work': 'Slow', new: 'No speed data'}
      : {strong: 'Strong recall', learning: 'Still learning', 'needs-work': 'Needs work', new: 'New'};
    $('strongLabel').textContent = labels.strong;
    $('learningLabel').textContent = labels.learning;
    $('needsWorkLabel').textContent = labels['needs-work'];
    $('newLabel').textContent = labels.new;
    breakdown.setAttribute(
      'aria-label',
      `Symbol breakdown: ${counts.strong} ${labels.strong.toLowerCase()}, ${counts.learning} ${labels.learning.toLowerCase()}, ${counts['needs-work']} ${labels['needs-work'].toLowerCase()}, ${counts.new} ${labels.new.toLowerCase()}`
    );
  }

  function updateSortControl(metric) {
    const current = metric === 'speed'
      ? (settings.sortOrder === 'best' ? 'Fastest first' : 'Slowest first')
      : (settings.sortOrder === 'best' ? 'Best first' : 'Worst first');
    const next = metric === 'speed'
      ? (settings.sortOrder === 'best' ? 'Slowest first' : 'Fastest first')
      : (settings.sortOrder === 'best' ? 'Worst first' : 'Best first');
    $('statsSort').textContent = `${current} ↕`;
    $('statsSort').setAttribute('aria-label', `Sort stats by symbol: ${current}; click to show ${next}`);
  }

  function render(state, script) {
    const {attempts, correct, streak, best, history, stats, speed} = state;
    const metric = settings.metric;
    const accuracy = attempts ? Math.round(correct / attempts * 100) : 0;
    $('accuracy').textContent = metric === 'speed'
      ? (speed.units ? formatTime(speed.totalMs / speed.units) : '—')
      : (attempts ? `${accuracy}%` : '—');
    $('metricToggle').textContent = metric === 'speed' ? 'Speed' : 'Accuracy';
    $('metricToggle').setAttribute('aria-label', metric === 'speed'
      ? 'Show accuracy; currently showing speed' : 'Show speed; currently showing accuracy');
    $('summaryMetricLabel').textContent = metric === 'speed' ? 'Average time per symbol' : 'Overall accuracy';
    $('symbolMetricLabel').textContent = metric.toUpperCase();
    $('streak').textContent = streak;
    $('best').textContent = best;
    $('attemptsCount').textContent = attempts;
    renderHistory(history);
    renderSymbols(stats, speed, script, metric);
    updateSortControl(metric);
  }

  function toggleSort(state, script) {
    settings.setSortOrder(settings.sortOrder === 'best' ? 'worst' : 'best');
    render(state, script);
  }

  function toggleMetric(state, script) {
    settings.setMetric(settings.metric === 'accuracy' ? 'speed' : 'accuracy');
    render(state, script);
  }

  return {render, toggleSort, toggleMetric};
})();
