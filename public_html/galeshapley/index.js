let _actionAllowed = true;
let _autoPlayIntervalId = undefined;

let status = 'waiting';
let leftMonsters = [];
let rightMonsters = [];
let pairs = [];
let numPairs = parseInt(document.getElementById('pairsNumInput').value);

const affinityFuncs = {
    'color': getColorAffinity,
    'type': getTypeAffinity,
    'both': getAffinity,
}
let leftAffinityFunction = affinityFuncs[document.getElementById('leftGroupPreference').value];
let rightAffinityFunction = affinityFuncs[document.getElementById('rightGroupPreference').value];

function frameUpdate() {
    updateMonsters(leftMonsters);
    updateMonsters(rightMonsters);
    requestAnimationFrame(frameUpdate);
}
requestAnimationFrame(frameUpdate);

const monsterAreaWidth = 300;
const monsterAreaHeight = 250;
const leftArea = { xMin: 25, yMin: 10, xMax: 25 + monsterAreaWidth, yMax: 10 + monsterAreaHeight };
const rightArea = { xMin: 575, yMin: 10, xMax: 575 + monsterAreaWidth, yMax: 10 + monsterAreaHeight };
const pairsArea = { xMin: 80, yMin: 300, xMax: 820, yMax: 600 };
const finishArea = { xMin: 80, yMin: 150, xMax: 820, yMax: 600 };
const spotlightA = {}; // left monster (asker)
const spotlightB = {}; // right monster chooses new pair
const spotlightC = {}; // right monster's current pair
const spotlightD = {}; // middle undecided spot
const spotlightE = {}; // right monster chooses current pair

function setSpotlightPositions() {
    const offsetX = S_SCALE * 50;
    const spaceX = S_SCALE * 50;
    const spaceY = S_SCALE * 70;
    const leftCol = 465 - spaceX - offsetX;
    const rightCol = 465 + spaceX - offsetX;
    const topRow = 60;
    const bottomRow = 110 + spaceY;
    const midRow = (topRow + bottomRow) / 2;
    spotlightA.x = leftCol;
    spotlightA.y = topRow;
    spotlightB.x = rightCol;
    spotlightB.y = topRow;
    spotlightC.x = leftCol;
    spotlightC.y = bottomRow;
    spotlightD.x = rightCol;
    spotlightD.y = midRow;
    spotlightE.x = rightCol;
    spotlightE.y = bottomRow;
}

function initializeSimulation() {
    setSpotlightPositions();
    removeMonsters(leftMonsters);
    removeMonsters(rightMonsters);
    removeMonsters(pairs);

    leftMonsters = [];
    rightMonsters = [];
    pairs = [];
    // create random monsters
    for (let i = 0; i < numPairs; i++) {
        const m = getRandomMonsterParams(i);
        createMonsterObject(m);
        leftMonsters.push(m);
        m.element.onclick = () => { if (m.partner === undefined && _actionAllowed) { pairMonster(m); } }
    }

    for (let i = 0; i < numPairs; i++) {
        const m = getRandomMonsterParams(i + numPairs);
        createMonsterObject(m);
        rightMonsters.push(m);
    }

    setPreferencesBy(leftAffinityFunction)(leftMonsters, rightMonsters);
    animateMonsterGroup(leftMonsters, leftArea, 500, 8);
    animateMonsterGroup(rightMonsters, rightArea, 500, 8);

}

function bringToSpotlight(asker, reciever, delay) {
    setTimeout(() => {
        if (asker) asker.setAnimation(spotlightA.x, spotlightA.y, 500);
        if (reciever) {
            if ((reciever.partner !== undefined) && (reciever.partner !== asker)) {
                reciever.setAnimation(spotlightD.x, spotlightD.y, 500, 450);
                reciever.partner.setAnimation(spotlightC.x, spotlightC.y, 500, 550);
            } else {
                reciever.setAnimation(spotlightB.x, spotlightB.y, 500, 500);
            }
        }
    }, (delay || 0) * T_SCALE);
}

function pairMonster(asker) {
    _actionAllowed = false;
    const availableMatch = rightMonsters.find(m => m.id === asker.ratings[0] && m.partner === undefined);
    if (availableMatch) {
        addStepOutput([asker, 'proposes to', availableMatch, 'and is accepted.'], 1200);
        makePair(asker, availableMatch);
    } else {
        attemptSteal(asker);
    }
}

function makePair(asker, reciever, jiltedLeftOver) {
    jiltedLeftOver = jiltedLeftOver || false;
    asker.partner = reciever;
    reciever.partner = asker;
    // show hearts
    asker.showHeart(leftAffinityFunction(asker, reciever), 1000);
    reciever.showHeart(rightAffinityFunction(reciever, asker), 1300);
    pairs = pairs.concat([reciever, asker]);
    bringToSpotlight(asker, reciever, 100);
    animateMonsterGroup(pairs, pairsArea, 500, 5, true, true, 1700);
    if (!jiltedLeftOver) {
        setTimeout(() => {
            _actionAllowed = true;
        }, 2000 * T_SCALE);
    }
}

function attemptSteal(asker) {
    const reciever = pairs.find(m => m.id === asker.ratings[0])
    if (!asker || !reciever) { _actionAllowed = true; return; }
    bringToSpotlight(asker, reciever);
    addStepOutput([asker, 'proposes to', reciever], 500, true);
    asker.showHeart(leftAffinityFunction(asker, reciever), 1000);
    const curRating = rightAffinityFunction(reciever, reciever.partner);
    const askerRating = rightAffinityFunction(reciever, asker);
    // results of steal attempt
    setTimeout(() => {
        if (askerRating > curRating) {
            addStepOutput(['....', reciever, 'leaves', reciever.partner, 'for', asker], 500);
            // remove previous couple froM PAIRS
            pairs = pairs.filter(m => m !== reciever && m !== reciever.partner);
            const jilted = reciever.partner;
            jilted.hideHeart(500);
            // remove previous partner ratings
            jilted.ratings = jilted.ratings.filter(id => id !== reciever.id);
            jilted.partner = undefined;
            makePair(asker, reciever, true);
            setTimeout(() => pairMonster(jilted), 2200 * T_SCALE);
        } else {
            // asker is rejected
            addStepOutput(['....', reciever, 'prefers current partner,', reciever.partner, 'to', asker], 500);
            asker.ratings = asker.ratings.filter(id => id !== reciever.id);
            reciever.setAnimation(spotlightE.x, spotlightE.y, 500, 500);
            setTimeout(() => {
                animateMonsterGroup(pairs, pairsArea, 500, 5, true, true, 400);
                // move on to next preference in line
                setTimeout(() => pairMonster(asker), 1000 * T_SCALE);
            }, 800 * T_SCALE);
        }
    }, 1000 * T_SCALE);
}

function startAutoPlay() {
    clearInterval(_autoPlayIntervalId);
    _autoPlayIntervalId = setInterval(() => {
        if (!_actionAllowed) return;
        const available = leftMonsters.filter(m => m.partner === undefined);
        if (available.length === 0) {
            animateMonsterGroup(pairs, finishArea, 500, 100, true, true, 500);
            clearInterval(_autoPlayIntervalId);
            displayResults();
        }
        const monst = available[Math.floor(Math.random() * available.length)];
        if (monst) {
            pairMonster(monst);
        }
    }, 100);
}

function reinitialize() {
    status = 'waiting';
    document.getElementById('play').textContent = 'Begin Simulation';
    clearInterval(_autoPlayIntervalId);
    clearResults();
    setVariations();

    setTimeout(() => {
        numPairs = parseInt(document.getElementById('pairsNumInput').value);
        leftAffinityFunction = affinityFuncs[document.getElementById('leftGroupPreference').value];
        rightAffinityFunction = affinityFuncs[document.getElementById('rightGroupPreference').value];
        switch (numPairs) {
            case 4:
                S_SCALE = 1.2;
                break;
            case 8:
                S_SCALE = 1;
                break;
            case 16:
                S_SCALE = 0.8;
                break;
            case 32:
                S_SCALE = 0.7;
                break;
            case 64:
                S_SCALE = 0.57;
                break;
            case 128:
                S_SCALE = 0.45;
                break;
        }
        document.getElementById('stepsInner').innerHTML = '';
        initializeSimulation();

    }, 200);
}

function setVariations() {
    N_COLORS = parseInt(document.getElementById('colorVariationInput').value);
    N_TYPES = parseInt(document.getElementById('typeVariationInput').value);
    OFFSET_RAND = getRandInt(10);
    MULT_RAND = PRIMES[Math.floor(Math.random() * PRIMES.length)];
}

function clearResults() {
    document.getElementById('resultsHeart').style.visibility = "hidden";
    document.getElementById('results').style.visibility = "hidden";
    document.getElementById('resultsLeftHeart').style.visibility = "hidden";
    document.getElementById('resultsLeft').style.visibility = "hidden";
    document.getElementById('resultsRightHeart').style.visibility = "hidden";
    document.getElementById('resultsRight').style.visibility = "hidden";

}
function displayResults() {
    let tot = 0;
    let totLeft = 0;
    let totRight = 0;
    pairs.forEach((m, i) => {
        if (i % 2 == 0) {
            const aff = leftAffinityFunction(m, m.partner);
            tot += aff;
            totLeft += aff;
        } else {
            const aff = rightAffinityFunction(m, m.partner);
            tot += aff;
            totRight += aff;
        }
    })
    const avg = (tot / pairs.length);
    const avgLeft = (totLeft / numPairs);
    const avgRight = (totRight / numPairs);

    document.getElementById('resultsHeart').style.transform = "scale(" + getHeartScale(avg) + ")";
    document.getElementById('resultsHeart').style.visibility = "visible";
    document.getElementById('resultsHeartOuter').style.transform = "scale(" + S_SCALE + ")";
    document.getElementById('results').style.visibility = "visible";

    document.getElementById('resultsLeftHeart').style.transform = "scale(" + getHeartScale(avgLeft) + ")";
    document.getElementById('resultsLeftHeart').style.visibility = "visible";
    document.getElementById('resultsLeftHeartOuter').style.transform = "scale(" + S_SCALE + ")";
    document.getElementById('resultsLeft').style.visibility = "visible";

    document.getElementById('resultsRightHeart').style.transform = "scale(" + getHeartScale(avgRight) + ")";
    document.getElementById('resultsRightHeart').style.visibility = "visible";
    document.getElementById('resultsRightHeartOuter').style.transform = "scale(" + S_SCALE + ")";
    document.getElementById('resultsRight').style.visibility = "visible";
}

const _container = document.getElementById('stepsInner');
const _scrollOuter = document.getElementById('stepsOuter');
function addStepOutput(steps, delay, hideBottomBorder) {
    const el = document.createElement('div');
    el.classList.add(hideBottomBorder ? 'stepNoBorder' : 'step');
    steps.forEach(s => {
        if (typeof s === 'string') {
            const txt = document.createElement('span');
            txt.classList.add('stepText');
            txt.textContent = s;
            el.appendChild(txt);
        } else { // make inline monster image
            const image = createMonsterInlineImg(s);
            el.appendChild(image);
        }
    })
    setTimeout(() => {

        _container.appendChild(el);
        cleanSteps();
        _scrollOuter.scrollTop = _scrollOuter.scrollHeight;
    }, (delay || 0) * T_SCALE);
}

function cleanSteps() {
    const numChildren = _container.childElementCount;
    if (numChildren > 30) {
        for (let i = 0; i < (numChildren - 7); i++) {
            _container.removeChild(_container.childNodes[0]);
        }
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById('pairsNumInput').onchange = reinitialize;
document.getElementById('leftGroupPreference').onchange = reinitialize;
document.getElementById('rightGroupPreference').onchange = reinitialize;
document.getElementById('colorVariationInput').onchange = reinitialize;
document.getElementById('typeVariationInput').onchange = reinitialize;
document.getElementById('speedSelect').onchange = (e) => {
    const val = e.target.value;
    switch (val) {
        case 'veryslow':
            T_SCALE = 3.5;
            break;
        case 'slow':
            T_SCALE = 2;
            break;
        case 'normal':
            T_SCALE = 1;
            break;
        case 'fast':
            T_SCALE = 0.4;
            break;
        case 'crazyfast':
            T_SCALE = 0.05;
            break;
    }
};

reinitialize();


document.getElementById('play').onclick = () => {
    if (status === 'waiting') {
        startAutoPlay();
        document.getElementById('play').textContent = 'Restart';
        status = 'playing';
    } else {
        reinitialize();
    }
}

