var FRAME_LIMIT = 16;

var main = {
	canvas: document.getElementById('JoelCA'),
	framesPerGeneration: 128,
	pixelSize: 6,
	paused: true,
	ruleIndex: 0,
	randomRule: false,
	//--- for when the user draws on the canvas ----
	drawType: 1,
	isdrawing: false,
	lastFrame: Date.now(),
}
if (main.canvas.getContext) {
	main.ctx = main.canvas.getContext('2d');
}
main.pixelRows = Math.floor(main.canvas.offsetHeight / main.pixelSize);
main.pixelCols = Math.floor(main.canvas.offsetWidth / main.pixelSize);

const clearDrawVars = () => {
	main.isDrawing = false;
	delete main.prevX;
	delete main.prevY;
}

//console.log("width: " + main.pixelCols + "\nheight: " + main.pixelRows);

main.keyMap = {
	"Enter": ["pause", "GO"],
	' ': ["reseed", "reseed"],
	"[": ["faster", "faster"],
	"]": ["slower", "slower"],
	'1': ['colorScheme', 'new colors'],
	'2': ['capture', "snap pic"],
	'3': ['restore', "load pic"],
	'4': ['showPalette', 'hide palette'],
	'<': ['switch', "switch rule"],
	',': ['switch', "switch rule"],
	'>': ['random', "generate rule"],
	'.': ['random', "generate rule"],
	'?': ['saveRule', "save rule"],
	'/': ['saveRule', "save rule"],
	'0': ['clear', "clear"]
};

//toggle 'paused' and change button text
const PauseCA = (el) => {
	if (el.textContent === "pause") {
		main.keyMap['Enter'][1] = "play";
		main.paused = true;
		document.getElementById('messages').textContent = "[paused]";
	} else {
		main.keyMap['Enter'][1] = "pause";
		main.paused = false;
		displayRuleUI();
	}
	refreshBtnText();
}

const showPalette = (el) => {
	if (el.textContent === "show palette") {
		main.keyMap['4'][1] = "hide palette";
		document.getElementById("palette").style.visibility = 'visible';
	} else {
		main.keyMap['4'][1] = "show palette";
		document.getElementById("palette").style.visibility = 'hidden';
		displayRuleUI();
	}
	refreshBtnText();
}

function refreshBtnText() {
	document.getElementById("showPalette").textContent = main.keyMap['4'][1];
	document.getElementById("pause").textContent = main.keyMap['Enter'][1];
}

const frame = (timestamp) => {
	window.requestAnimationFrame(frame);
	myCA.scrollOnce();
	const now = Date.now();
	const elapsed = now - main.lastFrame;

	if (!main.paused && elapsed > (main.framesPerGeneration)) {
		main.lastFrame = now;
		myCA.cycle();
	}
}

window.onload = ()=> {

	myCA = new CA(main, ruleSets[0], colorSchemes[0]);

	myCA.patternFill(textToPixels(introTxt, main.pixelCols, main.pixelRows, pxlFont0));
	myCA.save(); // save a "pic" to start with.
	refreshPalette();
	// myCA.cells.forEach(function(c) {
	// 	console.log(c);
	// }); 						// log cells for test

	var animRequestID = window.requestAnimationFrame(frame);
	displayRuleUI();

	document.getElementById("JoelCA").addEventListener("mouseup", clearDrawVars);
	document.getElementById("showPalette").addEventListener("click", (e) => showPalette(e.target));
	document.getElementById("JoelCA").addEventListener("mouseleave", clearDrawVars);
	document.getElementById("JoelCA").addEventListener("touchend", clearDrawVars);
	
	document.getElementById("JoelCA").addEventListener("mousemove", drawAtMouse);
	document.getElementById("JoelCA").addEventListener("touchmove", (e) => drawAtMouse(e, true));
	document.getElementById("pause").addEventListener("click", (e) => PauseCA(e.target));
	document.getElementById("reseed").addEventListener("click", () => myCA.randomFill());
	document.getElementById("capture").addEventListener("click", () => myCA.save());
	document.getElementById("restore").addEventListener("click", () => myCA.restore());
	document.getElementById("clear").addEventListener("click", () => myCA.patternFill([[0]]));
	document.getElementById("faster").addEventListener("click", () => changeFPG(0.5));
	document.getElementById("slower").addEventListener("click", () => changeFPG(2));
	document.addEventListener("keydown", checkKeyDown, false);
	document.addEventListener("keyup", checkKeyUp, false);
	document.getElementById("palette").addEventListener("click", (e) => selectPaletteButton(e.target));
	
	document.getElementById("JoelCA").addEventListener("mousedown", (e) => {
		drawAtMouse(e);
		main.isDrawing = true;
	});
	document.getElementById("JoelCA").addEventListener("touchstart", (e) => {
		drawAtMouse(e, true);
		main.isDrawing = true;
	});
	document.getElementById("switch").addEventListener("click", function(e) {
		main.ruleIndex = (main.ruleIndex + 1) % ruleSets.length;
		myCA.setRule(ruleSets[main.ruleIndex]);
		main.randomRule = false;
		displayRuleUI();
		refreshPalette();
		setSaveButtonText();
	});

	document.getElementById("aboutThis").addEventListener("click", () => {
		if (!main.paused) {
			PauseCA(document.getElementById("pause"));
		}
		myCA.patternFill(textToPixels(aboutThisTxt, main.pixelCols, main.pixelRows, pxlFont0));
	});
	document.getElementById("aboutMe").addEventListener("click", (e) => {
		if (!main.paused) {
			PauseCA(document.getElementById("pause"));
		}
		myCA.patternFill(textToPixels(aboutMeTxt, main.pixelCols, main.pixelRows, pxlFont0));
	});
	document.getElementById("colorScheme").addEventListener("click", (e) => {
		colorSchemes.push(colorSchemes.shift()); // rotation
		myCA.colors = colorSchemes[0];
		myCA.draw();
		refreshPalette();
		displayRuleUI();
	});
	
	const changeFPG = (multiplier) => {
		cancelAnimationFrame(animRequestID);
		const fpg = main.framesPerGeneration * multiplier;
		main.framesPerGeneration = (fpg < FRAME_LIMIT) ? FRAME_LIMIT : fpg;
	}


	/// these two listeners correspond to hidden buttons (left them so the kbd shortcuts still work)
	document.getElementById("random").addEventListener("click", function(e) {
		// generate random rule with same number of species
		let n = randInt(1, 7);
		myCA.setRule(generateRule(n));
		refreshPalette();
		main.randomRule = true;
		displayRuleUI();
	});
	document.getElementById("saveRule").addEventListener("click", function(e) {
		// Overwrite the current ruleSet with CA's current rule
		ruleSets[main.ruleIndex] = myCA.rule;
		main.randomRule = false;
		displayRuleExplanation(myCA.rule, myCA, main.ruleIndex, false);
		document.getElementById('messages').textContent = "Saved to Rule " + String.fromCharCode(65 + main.ruleIndex);
	});
};

function displayRuleUI(extraText = "") {
	displayRuleExplanation(myCA.rule, myCA, main.ruleIndex, main.randomRule);
	if (main.randomRule){
		document.getElementById("saveRule").style.opacity = '1';
		document.getElementById("saveRule").style.width = 'auto';
		document.getElementById("saveRule").style.height = 'auto';
		document.getElementById("saveRule").style.pointerEvents = 'auto';
	} else {
		document.getElementById("saveRule").style.opacity = '0';
		document.getElementById("saveRule").style.width = '0px';
		document.getElementById("saveRule").style.height = '0px';
		document.getElementById("saveRule").style.pointerEvents = 'none';
	}

	let disp;
	if (main.randomRule){
		disp = 'randomly generated rule';
	} else {
		disp = "Rule " + String.fromCharCode(65 + main.ruleIndex);
	}
	document.getElementById('messages').textContent = extraText + " " + disp;
}

function checkKeyDown(e) {
	k = e.key;
	if (!main.scrollDir && k.includes('Arrow')) {
		myCA.scrollOnce = () => {
			myCA.scroll({
				'ArrowUp': 'up',
				'ArrowDown': 'down',
				'ArrowLeft': 'left',
				'ArrowRight': 'right'
			}[k]);
		};
		e.preventDefault();
	}
	if (k == ' ') {
		e.preventDefault();
	}
	///
	else if (k == "Shift") { // switch buttons to show shortcuts
		for (let b in main.keyMap) {
			if (b == " ") { // show "Space" instead of " " btn text
				document.getElementById(main.keyMap[b][0]).textContent = "( Space )";
			} else {
				document.getElementById(main.keyMap[b][0]).textContent = "( " + b + " )";
			}
		}
		e.preventDefault();
	}
}

function checkKeyUp(e) { //  use char code conversions to index into ruleSets. note: find an easier way?

	if (e.key.includes('Arrow')) {
		myCA.scrollOnce = () => {};
		e.preventDefault();
	} //
	else if (e.key in main.keyMap) {
		document.getElementById(main.keyMap[e.key][0]).click();
		e.preventDefault();
	} else if (e.key == "Shift") { // switch back to normal button text
		for (let b in main.keyMap) {
			document.getElementById(main.keyMap[b][0]).textContent = main.keyMap[b][1];
		}
		e.preventDefault();
	} else if (e.key.length == 1) {
		let k = e.key.toString().toUpperCase();
		let idx = k.charCodeAt(0) - 65;
		if (idx >= 0 && idx < ruleSets.length) {
			main.ruleIndex = idx;
			main.saveIndex = main.ruleIndex;
			myCA.setRule(ruleSets[idx]);
			main.randomRule = false;
			displayRuleUI();
			setSaveButtonText();
		}
		refreshPalette();
	}
}

function setSaveButtonText (){
	document.getElementById("saveRule").textContent =  "save as rule " + String.fromCharCode(65 + main.ruleIndex);
}

const _draw = (x, y) => {
		if (x < main.pixelCols && y < main.pixelRows) {
		myCA.cells[y][x] = main.drawType;
	}
}

function getMousePosition(event) {
	var rect = main.canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left - 5,
		y: event.clientY - rect.top - 5,
	};
}

function getTouchPosition(event) {
	var rect = main.canvas.getBoundingClientRect();
  return {
    x: event.touches[0].clientX - rect.left - 5,
    y: event.touches[0].clientY - rect.top - 5,
  };
}

function drawAtMouse(event, isTouchEvent = false) {
	if (!main.isDrawing) return;

	var pos = isTouchEvent ? getTouchPosition(event) : getMousePosition(event);
	var x = Math.floor(pos.x / main.pixelSize);
	var y = Math.floor(pos.y / main.pixelSize);
	_draw(x, y)
	
	//really ad-hoc line drawing algorithm... replace with bresenham's
	if (main.prevX){
		let lastX = main.prevX;
		let lastY = main.prevY;
		let cursorX = main.prevX;
		let cursorY = main.prevY;
		const dX = x - cursorX;
		const dY = y - cursorY;
		const steps = Math.round(Math.sqrt(dX*dX + dY*dY));
		const incX = dX/steps;
		const incY = dY/steps;
		while (Math.round(cursorX) != x || Math.round(cursorY) != y){
			cursorX += incX;
			cursorY += incY;
			let roundedX = Math.round(cursorX);
			let roundedY = Math.round(cursorY);
			if (lastX != roundedX || lastY != roundedY){
				_draw(roundedX, roundedY);
				lastX = roundedX;
				lastY = roundedY;
			}
		}
	}
	main.prevX = x;
	main.prevY = y;

	myCA.draw();
	main.drawCount = 0;
	event.preventDefault();
}

function refreshPalette() {
	let palette = document.getElementById("palette");
	palette.innerHTML = "";
	if (myCA.nSpecies < main.drawType) {
		main.drawType = myCA.nSpecies;
	}
	for (let i = 0; i <= myCA.nSpecies; i++) {
		let p = document.createElement("div");
		if (i == main.drawType) {
			p.classList.add("selectedPaletteButton");
		}
		p.classList.add("paletteButton");
		p.style.backgroundColor = colorSchemes[0][i];
		palette.appendChild(p);
	}

}

function selectPaletteButton(target) {
	if (target === document.getElementById('palette')) { // don't select the parent element
		return;
	}
	let btns = Array.from(document.getElementsByClassName('paletteButton'));

	let n = btns.length;
	for (let i = 0; i < n; i++) {
		btns[i].classList.remove("selectedPaletteButton");
		if (target === btns[i]) {
			target.classList.add('selectedPaletteButton')
			main.drawType = i;
		}
	}
}