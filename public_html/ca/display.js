var _ruleDisplay = document.getElementById('ruleDisplay');

function displayRuleExplanation(rule, CA, ruleIndex, isRandom) {

  function getSingleSpeciesRule(neighborTypes, transitions, idx) {
    const el = document.createElement('div');
    el.className = 'speciesRule';

    el.appendChild(getSpeciesTitle(idx));
    el.appendChild(getSpeciesNeighbors(neighborTypes));
    el.appendChild(getSpeciesRuleType(neighborTypes));

    const txt = document.createElement('div');
    txt.textContent = 'transitions: ';
    txt.className = 'speciesRuleType';
    el.appendChild(txt);
    el.appendChild(getSpeciesTransitions(transitions));
    return el;
  }

  function getSpeciesSquare(idx, small = false) {
    const el = document.createElement('div');
    el.className = small ? 'speciesSquareSmall' : 'speciesSquare';
    el.style.backgroundColor = CA.colors[idx];
    return el;
  }

  function getSpeciesTitle(idx) {
    const el = document.createElement('div');
    el.className = 'speciesTitle';
    el.appendChild(getSpeciesSquare(idx));
    const text = document.createElement('span');
    text.textContent = ":";
    el.appendChild(text);
    return el;
  }

  function getSpeciesNeighbors(neighborTypes) {
    var neighborhood = neighborTypes[0];
    const el = document.createElement('div');
    el.className = 'speciesNeighborhood';
    switch (neighborhood) {
      case 'o':
        el.textContent = 'neighborhood: all eight nearby';
        break;
      case 'x':
        el.textContent = 'neighborhood: diagonals only';
        break;
      case '+':
        el.textContent = 'neighborhood: horizontal + vertical';
        break;
    }
    return el;
  }

  function getSpeciesRuleType(neighborTypes) {
    var type = neighborTypes[1];
    const el = document.createElement('div');
    const txt = document.createElement('span');
    el.className = 'speciesRuleType';
    el.appendChild(txt);
    switch (type) {
      case 'a':
        txt.textContent = 'counting type: only friendly neighbors';
        const friends = neighborTypes[2];
        el.appendChild(getSpeciesFriends(friends));
        el.style.height = '100px';
        break;
      case 'v':
        txt.textContent = 'counting type: only living neighbors';
        break;
      case 'd':
        txt.textContent = 'counting type: # of types of neighbors';
        break;
    }
    return el;
  }

  function getSpeciesFriends(friends) {
    const el = document.createElement('div');
    const txt = document.createElement('span');
    el.className = 'speciesRuleFriends';
    txt.style.marginRight = '10px';
    txt.textContent = 'friends: ';
    el.appendChild(txt);
    for (let i = 0;i < friends.length;i++) {
      el.appendChild(getSpeciesSquare(friends[i], true))
    }
    return el;
  }

  function getSpeciesTransitions(transitions) {
    const el = document.createElement('div');
    el.className = 'speciesRuleTransitions';
    for (var i = 0;i < transitions.length;i++) {
      const t = document.createElement('div');
      t.className = 'speciesRuleTransition';
      t.textContent = i + ':';
      t.appendChild(getSpeciesSquare(transitions[i], true));
      el.appendChild(t);
    }
    return el;
  }

  //// clear out the display and replace with new rules
  _ruleDisplay.innerHTML = '';
  const title = document.createElement('div');
  title.className = 'speciesRulesTitle';
  title.textContent = isRandom
    ? 'New Random Rule'
    : 'Rule Set ' + String.fromCharCode(65 + ruleIndex);
  _ruleDisplay.appendChild(title);
  const numSpecies = rule.neighborTypes.length;
  for (var i = 0;i < numSpecies;i++) {
    _ruleDisplay.appendChild(getSingleSpeciesRule(rule.neighborTypes[i], rule.transitions[i], i))
  }
}
