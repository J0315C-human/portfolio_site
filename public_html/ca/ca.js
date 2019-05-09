// CA - cellular automata class
// takes care of calculating its cells' next states
// and drawing them, using rules, color scheme, etc.

class CA {
	constructor(settings, rule, colors) {
		this.ctx = settings.ctx;
		this.nRows = settings.pixelRows;
		this.nCols = settings.pixelCols;
		this.cellSize = settings.pixelSize;
		this.scrollSize = Math.ceil(settings.pixelCols / 20);
		this.colors = colors;
		this.cells = [];

		this.setRule(rule);
	}

	save() {
		this.savedCells = [];
		for (let i = 0; i < this.nRows; i++) {
			let row = [];
			for (let j = 0; j < this.nCols; j++) {
				row.push(this.cells[i][j]);
			}
			this.savedCells.push(row);
		}
	}

	restore() {
		// have to do a deep copy to avoid losing high cells when moving to fewer species
		this.cells = [];
		for (let i = 0; i < this.nRows; i++) {
			let row = [];
			for (let j = 0; j < this.nCols; j++) {
				row.push(this.savedCells[i][j]);
			}
			this.cells.push(row);
		}
		this.wrapHighCells();
		this.draw();
	}
	setRule(rule) {
		this.rule = rule;
		let old = this.nSpecies;
		this.nSpecies = rule.neighborTypes.length - 1;
		this.types = rule.neighborTypes;
		this.nextStates = rule.transitions;
		this.seedPercent = rule.seedPercent;
		if (this.nSpecies < old) {
			this.wrapHighCells();
		}
	}
	// when moving from higher number of species to lower,
	// convert higher ones to lower.
	wrapHighCells() {
		for (let i = 0; i < this.nRows; i++) {
			for (let j = 0; j < this.nCols; j++) {
				let n = this.cells[i][j];
				if (n > this.nSpecies) {
					while (n > this.nSpecies) {
						n -= this.nSpecies;
					}
					this.cells[i][j] = n;
				}
			}
		}
		this.draw();
	}

	randomFill(percent) {
		if (!percent) {
			percent = this.seedPercent;
		}
		let newCells = [];

		for (let i = 0; i < this.nRows; i++) {
			let row = [];
			for (let j = 0; j < this.nCols; j++) {
				if (rand(0, 100) < percent) {
					row.push(randInt(1, this.nSpecies));
				} else {
					row.push(0);
				}
			}
			newCells.push(row);
		}
		this.cells = newCells;
		this.draw();
	}

	patternFill(patternGrid) {
		// Fill cells with a repeated pattern
		let newCells = [];
		let repeatHeight = patternGrid.length;
		let repeatWidth = patternGrid[0].length;
		for (let i = 0; i < this.nRows; i++) {
			let row = [];
			for (let j = 0; j < this.nCols; j++) {
				row.push(patternGrid[i % repeatHeight][j % repeatWidth]);
			}
			newCells.push(row);
		}
		this.cells = newCells;
		this.wrapHighCells();
		this.draw();
	}

	cycle() {
		let vectors;
		let type;
		let species;
		let count;
		let newSpecies;
		let newCells = [];
		// for each cell, cycle and draw
		for (let i = 0; i < this.nRows; i++) {
			let newRow = [];
			for (let j = 0; j < this.nCols; j++) {
				species = this.cells[i][j];
				type = this.types[species];

				switch (type[0]) {
					case "+":
						vectors = [
							[0, -1],
							[0, 1],
							[-1, 0],
							[1, 0]
						];
						break;
					case "x":
						vectors = [
							[-1, -1],
							[1, -1],
							[-1, 1],
							[1, 1]
						];
						break;
					case "o":
						vectors = [
							[-1, -1],
							[-1, 0],
							[-1, 1],
							[0, -1],
							[0, 1],
							[1, -1],
							[1, 0],
							[1, 1]
						];
						break;
					default:
						console.log("Incorrect rule Type passed to cycle() ");
				}
				if (type[1] == "a") {
					count = this.countNeighbors(i, j, vectors, type[1], type[2]);
				} else {
					count = this.countNeighbors(i, j, vectors, type[1]);
				}
				// lookup and add new species value 
				newSpecies = this.nextStates[species][count];
				newRow.push(newSpecies);
				this.drawCell(j, i, newSpecies);
			}
			newCells.push(newRow);
		}
		this.cells = newCells;
	}

	// Used for all neighbor definition types (o, +, or x)
	countNeighbors(i, j, vectors, neighborType, affinities) {
		let total = 0;
		let types = new Set();

		// search for neighbors
		vectors.map(function(vec) {
			var rw_idx = (this.nRows + i + vec[0]) % this.nRows;
			var cl_idx = (this.nCols + j + vec[1]) % this.nCols;
			let n = this.cells[rw_idx][cl_idx];

			if (!affinities) { // count alive neighbors
				if (n > 0) {
					total++;
				}
			} else {
				if (affinities.indexOf(n) !== -1) {
					total++;
				} // count "preferred" neighbors
			}
			if (n > 0) {
				types.add(n);
			} // count neighbor types
		}, this);

		if (neighborType == "d") {
			return types.size;
		} else { // "vivacity" type
			return total;
		}

	}

	draw() {
		this.cells.map(function(row, i){
			row.map(function(s, j){
				this.drawCell(j, i, s)
			}, this);
		}, this);
	}

	drawCell(x, y, species) {

		let xPos = x * this.cellSize;
		let yPos = y * this.cellSize;

		if (!this.colors[species]) { // if somehow there are more species than colors
			this.ctx.fillStyle = "#000";

		} else {
			this.ctx.fillStyle = this.colors[species];
		}
		this.ctx.fillRect(xPos, yPos, this.cellSize, this.cellSize);
	}

	// wrap the cells so it appears to scroll
	scroll(direction) {
		switch (direction) {
			case "up":
				this.cells.push(this.cells.shift());
				break;
			case "down":
				this.cells.unshift(this.cells.pop());
				break;
			case "left":
				this.cells.map(function (row) {
					row.push(row.shift());
				});
				break;
			case "right":
				this.cells.map(function (row) {
					row.unshift(row.pop());
				});
				break;

		}

		this.draw();
	}

	scrollOnce() { // this gets reassigned when arrow keys are down
		return;
	}
}

//// utility functions //////////////



function clear() {
	main.ctx.clearRect(0, 0, main.canvas.offsetWidth, main.canvas.offsetHeight);
}

function randInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand(min, max) {
	return (Math.random() * (max - min + 1)) + min;
}

function generateRule(nSpecies) {
	let highSeedPercent = 15;
	let zeroRate = 65;
	let rule = {
		neighborTypes: [],
		transitions: [],
		seedPercent: (Math.pow(Math.random(), 2)) * highSeedPercent // exponential distribution
	};
	let nStates, newTransitions, nFriends, friends, neighborTypes;

	for (let i = 0; i <= nSpecies; i++) {
		// generate neighborType
		let t1 = ["o", "+", "x"][randInt(0, 2)];
		let t2 = ["v", "d", "a"][randInt(0, 2)];
		if (t1 == "o") {
			nStates = 8;
		} else {
			nStates = 4;
		}

		// generate transition list (next states)
		newTransitions = [];

		for (let j = 0; j <= nStates; j++) {
			// lower neighbor counts should have zeros more often
			if (randInt(0, 100) < ((nStates - j) / nStates) * zeroRate) {
				newTransitions.push(0);
			} else {
				newTransitions.push(randInt(0, nSpecies));
			}
		}

		// generate affinity list (friends) if needed.
		neighborTypes = [t1, t2];
		if (t2 == "affinity") {
			friends = new Set();
			nFriends = randInt(0, nSpecies - 1);

			for (let j = 0; j <= nFriends; j++) {
				friends.add(randInt(0, nSpecies));
			}
			neighborTypes.push([...friends]);
		}

		rule.neighborTypes.push(neighborTypes);
		rule.transitions.push(newTransitions);

	}
	return rule;
}

// Write js representation of rule to console (to copy/paste)
function logRule(rule) {

	let str = "{ neighborTypes: [";
	let n = rule.neighborTypes.length;
	for (let i = 0; i < n; i++) {
		let nt = rule.neighborTypes[i];
		str += '["' + nt[0] + '", "' + nt[1] + '"';
		if (nt[2]) {
			str += ', [' + nt[2].toString() + ']';
		}
		str += "],";
	}
	str = str.slice(0, -1);
	str += "], transitions: [";

	n = rule.transitions.length;
	for (let i = 0; i < n; i++) {
		str += '[' + rule.transitions[i].toString() + '],';
	}
	str = str.slice(0, -1);

	str += "], seedPercent: " + rule.seedPercent + "}";
	console.log(str);
}