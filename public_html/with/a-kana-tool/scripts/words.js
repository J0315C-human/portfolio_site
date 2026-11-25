const wordQuiz = (() => {
  // Context-dependent marks appear in symbol stats after they are practiced.
  const extraSymbols = [
    ['っ', 'double consonant'], ['ー', 'long vowel'], ['でゅ', 'dyu'],
    ['ぁ', 'a'], ['ぃ', 'i'], ['ぅ', 'u'], ['ぇ', 'e'], ['ぉ', 'o'],
    ['ゃ', 'ya'], ['ゅ', 'yu'], ['ょ', 'yo']
  ].map(([kana, romaji]) => ({kana, romaji, category: kana === 'でゅ' ? 'extended' : 'gojuon'}));
  const symbols = new Map([...kanaCatalog.items, ...extraSymbols].map(item => [item.kana, item]));
  const pools = {};
  // Final-kana readings for words with a contextual pronunciation.
  const checkExceptions = new Map([
    ['こんにちは', ['wa', 'ha']],
    ['こんばんは', ['wa', 'ha']],
    ['それでは', ['wa', 'ha']]
  ]);

  function question(prompt, script) {
    const kana = prompt.replace(/[ァ-ヶ]/g, glyph => String.fromCharCode(glyph.charCodeAt(0) - 96));
    const units = [];
    for (let offset = 0; offset < kana.length;) {
      const symbol = symbols.get(kana.slice(offset, offset + 2)) || symbols.get(kana[offset]);
      units.push({symbol, readings: kanaCatalog.acceptedAnswers(symbol)});
      offset += symbol.kana.length;
    }

    for (const [index, unit] of units.entries()) {
      const next = units[index + 1];
      if (!next && checkExceptions.has(kana)) {
        unit.readings = checkExceptions.get(kana);
      } else if (unit.symbol.kana === 'っ') {
        const consonant = next.readings[0][0];
        unit.readings = next.readings[0].startsWith('ch') ? ['t', 'c'] : [consonant];
      } else if (unit.symbol.kana === 'ー') {
        unit.readings = [units[index - 1].readings[0].slice(-1)];
      } else if (unit.symbol.kana === 'ん' && next && /^[aeiouy]/.test(next.readings[0])) {
        unit.readings = ["n'", 'nn'];
      }
    }
    const romaji = units.map(unit => unit.readings[0]).join('');
    return {mode: 'word', prompt, script, romaji, units};
  }

  function pool(script) {
    if (!pools[script]) pools[script] = wordLists[script].map(prompt => question(prompt, script));
    return pools[script];
  }

  function normalize(answer) {
    const longVowels = {ā: 'aa', ī: 'ii', ū: 'uu', ē: 'ee', ō: 'oo'};
    return answer.normalize('NFC').replace(/’/g, "'").replace(/[āīūēō]/g, vowel => longVowels[vowel]);
  }

  function accepts(units, answer) {
    const text = normalize(answer);
    let offsets = new Set([0]);
    for (const {readings} of units) {
      const ends = new Set();
      for (const start of offsets) {
        for (const reading of readings) {
          if (text.startsWith(reading, start)) ends.add(start + reading.length);
        }
      }
      if (!ends.size) return false;
      offsets = ends;
    }
    return offsets.has(text.length);
  }

  // Edit costs for matching one reading to each prefix of the remaining answer.
  function prefixCosts(reading, text) {
    let previous = Array.from({length: text.length + 1}, (_, index) => index);
    for (const letter of reading) {
      const row = [previous[0] + 1];
      for (let i = 1; i <= text.length; i++) {
        row[i] = Math.min(row[i - 1] + 1, previous[i] + 1,
          previous[i - 1] + Number(letter !== text[i - 1]));
      }
      previous = row;
    }
    return previous;
  }

  function scoreMistake(units, answer) {
    const text = normalize(answer);
    // An unrelated paste provides no reliable symbol-level evidence.
    if (text.length > 128) return units.map(() => null);
    let costs = [0];
    const layers = [];
    for (const {readings} of units) {
      const next = Array(text.length + 1).fill(Infinity);
      const parents = next.map(() => []);
      costs.forEach((prior, start) => {
        const variants = readings.map(reading => prefixCosts(reading, text.slice(start)));
        for (let end = start; end <= text.length; end++) {
          const edits = Math.min(...variants.map(row => row[end - start]));
          const cost = prior + edits;
          if (cost < next[end]) parents[end] = [];
          if (cost <= next[end]) {
            next[end] = cost;
            parents[end].push({start, correct: edits === 0});
          }
        }
      });
      layers.push(parents);
      costs = next;
    }

    // Follow all equally good alignments. Only score occurrences they agree on.
    let ends = new Set([text.length]);
    const result = [];
    for (let i = layers.length - 1; i >= 0; i--) {
      const starts = new Set();
      const outcomes = new Set();
      for (const end of ends) {
        for (const {start, correct} of layers[i][end]) {
          starts.add(start);
          outcomes.add(correct);
        }
      }
      result[i] = outcomes.size === 1 ? outcomes.values().next().value : null;
      ends = starts;
    }
    return result;
  }

  function acceptedAnswers({units}) {
    const answers = units.reduce((prefixes, {readings}) =>
      prefixes.flatMap(prefix => readings.map(reading => prefix + reading)), ['']);
    return [...new Set(answers)];
  }

  return {pool, question, accepts, acceptedAnswers, scoreMistake, extraSymbols};
})();
