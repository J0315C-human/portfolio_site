const mPrefDiv = document.getElementById("malePreferences");
const fPrefDiv = document.getElementById("femalePreferences");
const resultsDiv = document.getElementById("results");
const statsDiv = document.getElementById("stats");
const logDiv = document.getElementById("log");
const pairsNumInput = document.getElementById("pairsNumInput");

const addItem = (el, htmlString) => {
    el.innerHTML = el.innerHTML + htmlString;
};
const clearOutput = () => {
    [mPrefDiv, fPrefDiv, resultsDiv, pairsNumInput, statsDiv, logDiv].forEach(
        el => (el.innerHTML = "")
    );
};

const generatePrefs = numPairs => {
    const p = [];
    while (p.length < numPairs) {
        const x = Math.round(Math.random() * (numPairs - 1));
        if (!p.includes(x)) p.push(x);
    }
    return p;
};

// generate set of males and females
const generatePairs = numPairs => {
    const males = [];
    const females = [];
    for (let i = 0; i < numPairs; i++) {
        males.push({
            prefs: generatePrefs(numPairs),
            current: -1,
            proposals: []
        });
        females.push({
            prefs: generatePrefs(numPairs),
            current: -1
        });
    }
    return { males, females };
};

const doGaleShapley = numPairs => {
    const { males, females } = generatePairs(numPairs);
    let proposals = 0;
    let steals = 0;
    while (males.reduce((prev, cur) => cur.current < 0 || prev, false)) {
        passes++;
        let m, mIdx;
        // get first male without a pair
        males.some((male, i) => {
            if (male.current < 0) {
                m = male;
                mIdx = i;
                return true;
            }
        });
        addItem(logDiv, `<span>M${mIdx} is single -</span>`);
        const wIdx = m.prefs.find(female => !m.proposals.includes(female));
        const w = females[wIdx];
        m.proposals.push(wIdx);
        proposals++;
        addItem(
            logDiv,
            `<span>&nbsp;&nbsp;&nbsp;-he proposes to F${wIdx}</span>`
        );
        //if she's not engaged, get engaged
        if (w.current === -1) {
            m.current = wIdx;
            w.current = mIdx;
            addItem(
                logDiv,
                `<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-she accepts</span>`
            );
        } else {
            const otherGuyPrefIdx = w.prefs.findIndex(guy => guy === w.current);
            const otherGuyIdx = w.current;
            const thisGuyPrefIdx = w.prefs.findIndex(guy => guy === mIdx);
            // if she likes him more, they get engaged
            if (thisGuyPrefIdx < otherGuyPrefIdx) {
                addItem(
                    logDiv,
                    `<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- she prefers him to M${
                    w.current
                    } and accepts </span>`
                );
                males[otherGuyIdx].current = -1;
                m.current = wIdx;
                w.current = mIdx;
                steals++;
            } else {
                addItem(
                    logDiv,
                    `<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-she'd rather stay with her current guy, M${w.current}</span>`
                );
            }
        }
    }

    males.forEach((m, mIdx) => {
        let prefs = `<span>${mIdx}: ${m.prefs.join(", ")}</span>`;
        let line = `<span>${mIdx} - ${m.current}</span>`;
        addItem(resultsDiv, line);
        addItem(mPrefDiv, prefs);
    });

    females.forEach((f, fIdx) => {
        let prefs = `<span>${fIdx}: ${f.prefs.join(", ")}</span>`;
        addItem(fPrefDiv, prefs);
    });
    const avgMalePref =
        males.reduce(
            (prev, cur) => prev + cur.prefs.findIndex(f => f === cur.current),
            0
        ) / numPairs;
    const avgFemalePref =
        females.reduce(
            (prev, cur) => prev + cur.prefs.findIndex(m => m === cur.current),
            0
        ) / numPairs;
    addItem(
        statsDiv,
        `<span>proposals: ${proposals}</span>
      <span>steals: ${steals}</steals>
      <span>avg male preference attained: ${avgMalePref.toFixed(2)}</steals>
      <span>avg female preference attained: ${avgFemalePref.toFixed(2)}</steals>`
    );
    addItem(
        logDiv,
        `<span>Everyone is now matched.</span>`
    );
};

doGaleShapley(5);

pairsNumInput.onchange = e => {
    clearOutput();
    doGaleShapley(e.target.value);
};
