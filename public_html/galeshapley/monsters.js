


const N_HEADS = 8;
const N_BODIES = 6;
const N_LEGS = 6;
const PRIMES = [1, 11, 13, 17, 19, 23];
let N_TYPES = 6; // how many of each body part type to use
let N_COLORS = 5; // how many colors to use
let MULT_RAND = 1;
let OFFSET_RAND = 0;
const COLORS = ['red', 'yellow', 'green', 'blue', 'purple'];
let T_SCALE = 1;
let S_SCALE = 0.8;

const getHeartScale = (affinity) => (affinity * 6 + 0.1);
const getRandInt = (num) => Math.floor(Math.random() * num);
const getRandomMonsterParams = (id) => {
  const getRandColor = () => COLORS[((Math.floor(Math.random() * N_COLORS) * MULT_RAND) + OFFSET_RAND) % COLORS.length];
  return {
    id: id,
    headColor: getRandColor(),
    headType: (getRandInt(N_TYPES) * MULT_RAND + OFFSET_RAND) % N_HEADS + 1,
    bodyColor: getRandColor(),
    bodyType: (getRandInt(N_TYPES) * MULT_RAND + OFFSET_RAND) % N_BODIES + 1,
    legColor: getRandColor(),
    legType: (getRandInt(N_TYPES) * MULT_RAND + OFFSET_RAND) % N_LEGS + 1,
    x: 350,
    y: -200,
    ratings: [],
    partner: undefined,
  }
}

// get how "far" one color is from another
const getColorDistance = (colorA, colorB) => {
  let idxA = COLORS.findIndex(col => col === colorA);
  let idxB = COLORS.findIndex(col => col === colorB);
  if (idxA === -1 || idxB === -1) return 0;
  if (idxA > idxB) {
    const temp = idxA;
    idxA = idxB;
    idxB = temp;
  }
  const dist = Math.min(idxB - idxA, (idxA + COLORS.length) - idxB);
  return (COLORS.length - (dist * 2)) / COLORS.length;
}

const getColorSimilarityRating = (a, b) => {
  const head = getColorDistance(a.headColor, b.headColor);
  const body = getColorDistance(a.bodyColor, b.bodyColor);
  const legs = getColorDistance(a.legColor, b.legColor);
  const x = Math.pow((head + body + legs) / 3, 2);
  return x
}

const getColorInclusionRating = (a, b) => {
  const aColors = [];
  const bColors = [];
  aColors.push(a.headColor);
  if (!aColors.find(c => c === a.bodyColor)) aColors.push(a.bodyColor);
  if (!aColors.find(c => c === a.legColor)) aColors.push(a.legColor);
  bColors.push(b.headColor);
  if (!bColors.find(c => c === b.bodyColor)) bColors.push(b.bodyColor);
  if (!bColors.find(c => c === b.legColor)) bColors.push(b.legColor);

  let score = 0;
  aColors.forEach(col => {
    if (bColors.includes(col))
      score++;
  })
  return Math.pow(score / aColors.length, 2);
}

const getTypeAffinity = (a, b) => {
  const head = a.headType === b.headType ? 1.75 : 0;
  const body = a.bodyType === b.bodyType ? 1.25 : 0;
  const legs = a.legType === b.legType ? 1 : 0;
  return (head + body + legs) / 6;
}

const getColorAffinity = (a, b) => {
  const af = (getColorInclusionRating(a, b) +
    getColorInclusionRating(b, a) +
    getColorSimilarityRating(a, b)
  ) / 3;
  return af * af * 0.8;
}

const getAffinity = (a, b) =>
  (
    getColorAffinity(a, b) +
    getTypeAffinity(a, b) * 1.5
  ) / 2;


const createMonsterObject = (m) => {
  const outer = document.createElement('div');
  outer.classList.add('monster-outer');

  outer.style.transform = `scale(${S_SCALE})`;
  const heart = document.createElement('img');
  heart.classList.add('monster-heart');
  heart.src = "sprites/heart.png";
  heart.style.display = "none";

  const bubble = document.createElement('img');
  bubble.classList.add('monster-bubble');
  bubble.src = "sprites/bubble.png";
  bubble.style.display = "none";

  const txt = document.createElement('div');
  txt.classList.add('monster-text');
  txt.style.display = "none";
  m.hideBubble = () => { bubble.style.display = "none"; txt.style.display = "none"; outer.style.zIndex = 10; };
  m.showBubble = () => { bubble.style.display = "inline"; txt.style.display = "inline"; outer.style.zIndex = 'auto'; };

  const head = document.createElement('img');
  head.src = "sprites/" + m.headColor + '-head-' + m.headType + '.png';
  head.classList.add('monster-head');
  head.classList.add('monster-head-' + m.headType);

  const body = document.createElement('img');
  body.classList.add('monster-body');
  body.classList.add('monster-body-' + m.bodyType);
  body.src = "sprites/" + m.bodyColor + '-body-' + m.bodyType + '.png';

  const legs = document.createElement('img');
  legs.classList.add('monster-legs');
  legs.classList.add('monster-legs-' + m.legType);
  legs.src = "sprites/" + m.legColor + '-legs-' + m.legType + '.png';

  outer.appendChild(legs);
  outer.appendChild(body);
  outer.appendChild(head);
  outer.appendChild(bubble);
  outer.appendChild(heart);
  outer.appendChild(txt);
  m.element = outer;
  m.setText = t => txt.textContent = t;

  m.setHeartSize = (affinity) => { heart.style.transform = "scale(" + getHeartScale(affinity) + ")"; }
  m.hideHeart = (delay) => { setTimeout(() => { heart.style.display = "none"; }, (delay || 0) * T_SCALE); };
  m.showHeart = (affinity, delay) => {
    setTimeout(() => {
      m.setHeartSize(affinity); heart.style.display = "inline";
    }, (delay || 0) * T_SCALE)
  };

  m.startHeartFlash = () => heart.classList.add('flashing');
  m.stopHeartFlash = () => heart.classList.remove('flashing');

  m.reposition = () => setMonsterPositionStyle(m);
  m.setAnimation = (x, y, msLength, msDelay) => setMonsterAnimation(m, x, y, msLength, msDelay);

  m.reposition();
  document.getElementById('monsters').appendChild(outer);
}

const createMonsterInlineImg = (m) => {
  const outer = document.createElement('div');
  outer.classList.add('stepImg');

  outer.style.transform = 'scale(0.4) translateY(-17px)';
 
  const head = document.createElement('img');
  head.src = "sprites/" + m.headColor + '-head-' + m.headType + '.png';
  head.classList.add('monster-head');
  head.classList.add('monster-head-' + m.headType);

  const body = document.createElement('img');
  body.classList.add('monster-body');
  body.classList.add('monster-body-' + m.bodyType);
  body.src = "sprites/" + m.bodyColor + '-body-' + m.bodyType + '.png';

  const legs = document.createElement('img');
  legs.classList.add('monster-legs');
  legs.classList.add('monster-legs-' + m.legType);
  legs.src = "sprites/" + m.legColor + '-legs-' + m.legType + '.png';

  outer.appendChild(legs);
  outer.appendChild(body);
  outer.appendChild(head);

  return outer;
}

function setMonsterPositionStyle(m) {
  m.element.style.left = m.x + 'px';
  m.element.style.top = m.y + 'px';
}

function setMonsterAnimation(m, x, y, msLength, msDelay) {
  msDelay = (msDelay || 0) * T_SCALE;
  m.animStartPos = {
    x: m.x,
    y: m.y,
  }
  m.animEndPos = { x: x, y: y };
  m.animStartTime = Date.now() + msDelay;
  m.animLength = msLength * T_SCALE;
}

const querp = (from, to, length, startTime, curTime) => {
  let p = (curTime - startTime) / length;
  if (p >= 1) p = 1;
  const dist = to - from;
  if (p < 0.5) {
    return from + dist * (Math.pow(2 * p, 2) / 2);
  } else {
    return from + dist * (1 - ((Math.pow(2 * p - 2, 2)) / 2))
  }
}

const updateMonsters = (monsters) => {
  const now = Date.now();
  monsters.forEach(m => {
    if (!m.animEndPos || now < m.animStartTime) return;
    const diff = Math.abs(m.x - m.animEndPos.x) + Math.abs(m.y - m.animEndPos.y);
    if (diff < 1) return;
    m.x = querp(m.animStartPos.x, m.animEndPos.x, m.animLength, m.animStartTime, now);
    m.y = querp(m.animStartPos.y, m.animEndPos.y, m.animLength, m.animStartTime, now);
    m.reposition();
  })
}

function animateMonsterGroup(monsters, area, time, staggerTime, arePairs, reverse, delay) {
  delay = delay || 0;
  reverse = reverse || false;
  arePairs = arePairs || false;
  const _monsters = arePairs ? monsters : monsters.filter(m => m.partner === undefined);
  const { xMin, xMax, yMin, yMax } = area;
  const width = xMax - xMin;
  const height = yMax - yMin;
  let rowHeight = 350;
  let colWidth = 200;
  let nRows = 0;
  let nCols = 0;
  while (nRows * nCols < _monsters.length || nCols % 2 === 1) {
    rowHeight *= 0.99;
    colWidth *= 0.99;
    nRows = Math.floor(height / rowHeight);
    nCols = Math.floor(width / colWidth);
  }
  const pairOffset = arePairs ? colWidth * 0.25 : 0;
  const paddingLeft = (width - (nCols * colWidth)) / 2;
  const paddingTop = (height - (nRows * rowHeight)) / 2;
  const nSpaces = nRows * nCols;
  if (staggerTime === undefined) staggerTime = 25;
  _monsters.forEach((m, i) => {
    const ord = reverse ? nSpaces - i - 1 : i;
    let xOffset = i % 2 == 0 ? pairOffset : -1 * pairOffset;
    if (reverse) xOffset *= -1;
    const xPos = xMin + xOffset + paddingLeft + (ord % nCols) * colWidth;
    const yPos = yMin + paddingTop + Math.floor(ord / nCols) * rowHeight;

    setTimeout(() => {
      m.setAnimation(xPos, yPos, time);
    }, ((_monsters.length - i) * staggerTime + delay) * T_SCALE)
  })
}

function removeMonsters(monsters) {
  monsters.forEach(m => {
    if (m.element.parentNode === document.getElementById('monsters'))
      document.getElementById('monsters').removeChild(m.element);
  })
}

const cmpByRating = (a, b) => {
  if (a._rating > b._rating) return -1;
  if (b._rating > a._rating) return 1;
  return 0;
}

function setPreferencesBy(affinityFunction) {
  return (groupA, groupB) => {
    groupA.forEach(aMonster => {
      // set affinities of all B monsters to this A monster
      groupB.forEach(bMonster => {
        bMonster._rating = affinityFunction(aMonster, bMonster);
      });
      const copy = groupB.slice();
      copy.sort(cmpByRating);
      aMonster.ratings = copy.map(m => m.id);
    })
  }
}