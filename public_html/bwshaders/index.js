
var canvas = document.getElementById('JoelTV');
if (canvas.getContext){
  ctx = canvas.getContext('2d');
}
var pixelSize = 4;
var canvasWidth = canvas.offsetWidth;
var canvasHeight = canvas.offsetHeight;
var pixelRows = Math.floor(canvasHeight/pixelSize);
var pixelCols = Math.floor(canvasWidth/pixelSize);

//defines container for different pattern generators
var cycles = [PatternCycle3, PatternCycle1, PatternCycle2, PatternCycle4];
var current = 0;
var paused = false;

window.onload = function(){
	PatternCycle3.interval = 100;
	PatternCycle1.interval = 1000;
	PatternCycle2.interval = 1000;
	PatternCycle4.interval = 300;

	interv = window.setInterval(function () {
		if (!paused){
			cycles[current]();
		}
	}, cycles[current].interval);

	document.getElementById("btns").addEventListener("click", function(e) {
		ClickCycleBtn.apply(e.target);
		window.clearInterval(interv);
		interv = window.setInterval(function () {
			if (!paused){
				cycles[current]();
			}
		}, cycles[current].interval);
	});

	document.getElementById("pause").addEventListener("click", function(e){
		PauseTV.apply(e.target);
	});
};

//toggle the 'paused' global and change btn text
function PauseTV(){
if (this.textContent === "pause"){
			this.textContent = "resume";
			paused = true;
		}
		else  {
			this.textContent = "pause";
			paused = false;
		}
}



// Patterns using modulos and cycling through shades at varying speeds
function PatternCycle1(){
	if (!PatternCycle1.state){
		PatternCycle1.state = [1, 1, 1, 0, 1];
	}
	var state = PatternCycle1.state;
	state[0] = (state[0] + 1) % 17;
	state[1] = (state[1] + 1) % 13;
	state[2] = (state[2] + 1) % 16;
	state[3] = (state[3] + 1) % 10;
	state[4] = state[4] % 14;

	Clear();
	var c = state[4]; //color
	for (var i = 0; i < pixelCols; i++){
		for (var j = 0; j < pixelRows; j++){
			if ((i*j) % state[0] == 0 || (i*j) % state[1] == 0 ){
				Draw(i, j, c % (state[2] + 1));
				c += state[3] + 3;
			}
			else{
				Draw(i, j, 0);
			}
		}
	}	
	state[4] = c;
}

// Glitchy plaid patterns
function PatternCycle2(){
	if (!PatternCycle2.state){
			PatternCycle2.state = [1, 2, 0, 9, 3, 10, 4, 5, 7, 13];
	}
	var state = PatternCycle2.state;

	state[0] = (state[0] + 1) % 13; // horizontal divisions
	state[1] = (state[1] + 1) % 11;	// horizontal subdivisions
	state[6] = (state[6] + 1) % 17; // vertical divisions
	state[7] = (state[7] + 1) % 15; // vertical subdivisions

	state[2] = (state[2] + 1) % 14; // color 1
	state[3] = (state[3] + 1) % 12; // color 2
	state[4] = (state[4] + 1) % 13; // color 3
	state[5] = (state[5] + 1) % 10; // color 4

	state[8] = (state[8] + 1) % 23; // modifier
	state[9] = (state[9] + 1) % 29; // modifier

	Clear();
	var mod = 1;
	for (var i = 0; i < pixelCols; i++){
			mod = 1;
		for (var j = 0; j < pixelRows; j++){

			var color = 0;
			if (i % (state[0]+2) < (state[1] % (state[0]+2))) { //horizontal left
				color += state[2];
				mod += 2
			} else { //horizontal right
				color += state[3];
				mod += 1;
			}

			if (j % (state[6]+2) < (state[7] % (state[6]+2))) { //vertical top
				color += state[4];
				mod += 3;
			} else { //vertical down
				color += state[5];
			}
			if ((j * i) % state[8] > (state[9] % state[8])){
				color *= mod;
			}
			Draw(i, j, (color) % 15);
		}
	}
}	

// Crazy overlapping concentric circles pattern!!
function PatternCycle3(){
	if (!PatternCycle3.state){
			PatternCycle3.state = [new Zig(0, 214, 15), new Zig(0, 281, 2, false), //vertex locations
								   new Zig(0, 185, 30, false), new Zig(0, 200, 20), 
								   new Zig(5, 61, 27), new Zig(5, 43, 5, false)]; //circle sizes
	}
	var state = PatternCycle3.state;
	state[4].Next();
	state[5].Next();

	Clear();
	var focusY = Math.floor((pixelCols/state[0].high)* state[0].Next());
	var focusX = Math.floor((pixelRows/state[1].high)* state[1].Next());
	var focusbY = pixelCols - Math.floor((pixelCols/state[2].high)* state[2].Next());
	var focusbX = pixelRows - Math.floor((pixelRows/state[3].high)* state[3].Next());
	for (var i = 0; i < pixelCols; i++){
		for (var j = 0; j < pixelRows; j++){
			distA = Math.floor(Math.sqrt(Math.pow(i - focusX, 2) + Math.pow(j - focusY, 2))/(state[4].val/10));
			distB = Math.floor(Math.sqrt(Math.pow(i - focusbX, 2) + Math.pow(j - focusbY, 2))/(state[5].val/10));
			color = Math.floor((distA%14)-(distB%14));
			Draw(i, j, color);
		}
	}
}

//Garbled staticky pattern - mostly just a test for Zig class
function PatternCycle4() {
	if (!PatternCycle4.state) {
		PatternCycle4.state = [new Zig(0, 8), new Zig(9, 14), new Zig(20, 40), new Zig(1, 27), new Zig(1, 12)];
	}
	var state = PatternCycle4.state;
	var num = new Zig(state[0].val, state[1].val); //initial limits

	Clear();

	for (var i = 0; i < pixelCols; i++){
		for (var j = 0; j < pixelRows; j++){
			
			Draw(i, j, num.Skip(state[4].val));

			if ((i*j)%state[2].val == 0) {
				num.low = state[0].Next();
				num.high = state[1].Next();
			}
			if ((i*j)% state[3] == 0){
				num.val = num.low;
				state[4].Next();
			}
		}
	}
	state[2].Next();
	state[3].Next();
	state[4].Next();
}

// An Integer that zig-zags up and down between limits (inclusive).
class Zig {
	constructor(lowLim, highLim, start = lowLim, startAsc = true) {
		if ((start < lowLim) || (start> highLim)) {
			start = lowLim;
		}
		this.val = start;
		this.low = lowLim;
		this.high = highLim; 
		this.incr = -1;
		if (startAsc){
			this.incr = 1;
		}
	}
	Next() {
		if (this.val <= this.low) {
			this.incr = 1;
		} else if (this.val >= this.high) {
			this.incr = -1;
		}
		this.val += this.incr;
		return this.val;
	}
	Skip(n) {
		for (var i = 0; i<n; i++) {
			this.Next();
		}
		return this.val;
	}
}

function Draw(x, y, colorNum) {
	c = (colorNum * 17).toString();
	let color = "rgb(" + c + "," + c + "," + c + ")";
	let xPos = x * pixelSize;
	let yPos = y * pixelSize;

	ctx.fillStyle = color;
	ctx.fillRect(xPos, yPos, pixelSize, pixelSize);
}

function Clear() {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function ClickCycleBtn() {
	if (!isNaN(this.textContent)){
		current = this.textContent - 1;
		cycles[current]();
	}
}