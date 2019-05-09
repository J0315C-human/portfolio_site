const WIDTH = 1300,
  HEIGHT = 1000;
const NCOLS = 42,
  NROWS = 30;

const cellWidth = WIDTH / NCOLS,
  cellHeight = HEIGHT / NROWS;
const colors = [
  "none",
  "#ff9f7c",
  "none",
  "#A22",
  "none",
  "#44A",
  "none",
  "#222",
  "#777"
];
const lineWidth = cellWidth / 8;
const colorSpread = 0.13;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const MAXTOCENTER = Math.sqrt(
  NCOLS / 2 * (NCOLS / 2) + NROWS / 2 * (NROWS / 2)
);
// setup canvas
canvas.setAttribute("width", WIDTH);
canvas.setAttribute("height", HEIGHT);
ctx.lineWidth = lineWidth;

function getStyle(col, row) {
  const idx = Math.round(
    ((col - row) / NCOLS + 1 + Math.random() * colorSpread) * colors.length
  );
  const idx2 = Math.round(
    ((row + col) / NROWS + Math.random() * colorSpread) * colors.length +
    colors.length / 2
  );
  const xDist = row - NROWS / 2,
    yDist = col - NCOLS / 2;
  const fromCenter = Math.sqrt(xDist * xDist + yDist * yDist);
  const fillColor = colors[idx % colors.length];
  const strokeColor = colors[idx2 % colors.length];
  return {
    fillColor,
    strokeColor,
    offsetAmt: Math.sqrt(fromCenter / MAXTOCENTER) * -0.9 + 0.92
  };
}

function clearCanvas() {
  ctx.beginPath();
  ctx.fillStyle = "#333";
  ctx.moveTo(0, 0);
  ctx.lineTo(WIDTH, 0);
  ctx.lineTo(WIDTH, HEIGHT);
  ctx.lineTo(0, HEIGHT);
  ctx.lineTo(0, 0);
  ctx.fill();
}
function drawShape(points, style) {
  const { strokeColor, fillColor, offsetAmt } = style;
  ctx.beginPath();
  ctx.fillStyle = style.fillColor;
  ctx.strokeStyle = style.strokeColor;

  points.forEach((pt, i) => {
    if (i === 0) return ctx.moveTo(pt[0], pt[1]);
    ctx.lineTo(pt[0], pt[1]);
    if (strokeColor !== "none") ctx.stroke();
  });
  if (fillColor !== "none") ctx.fill();
}

function draw(col, row, type) {
  const top = row * cellHeight + lineWidth / 2;
  const left = col * cellWidth + lineWidth / 2;
  const bottom = top + cellHeight - lineWidth;
  const right = left + cellWidth - lineWidth;
  const style = getStyle(col, row);
  const xOffset = cellWidth * style.offsetAmt,
    yOffset = cellHeight * style.offsetAmt;
  if (type === 0) {
    drawShape(
      [
        [left, top],
        [left + xOffset, top],
        [right, bottom - yOffset],
        [right, bottom],
        [right - xOffset, bottom],
        [left, top + yOffset],
        [left, top],
        [left + xOffset, top]
      ],
      style
    );
  } else {
    drawShape(
      [
        [right, top],
        [right - xOffset, top],
        [left, bottom - yOffset],
        [left, bottom],
        [left + xOffset, bottom],
        [right, top + yOffset],
        [right, top],
        [right - xOffset, top]
      ],
      style
    );
  }
}

let intervalId = 0;
let grid;
const drawTenPrint = () => {
  // shift the colors
  colors.push(colors.shift());
  if (intervalId) clearInterval(intervalId);
  grid = [];
  colors.push(colors.shift());
  clearCanvas();
  // initialize a grid of random zeros and ones
  for (let i = 0; i < NROWS; i++) {
    const row = [];
    for (let j = 0; j < NCOLS; j++) {
      row.push(Math.round(Math.random()));
    }
    grid.push(row);
  }

  grid.forEach((row, i) => {
    row.forEach((val, j) => {
      draw(j, i, val);
    });
  });

  intervalId = setInterval(drawRandom, 20);
}

function drawRandom() {
  if (Math.random() > 0.7) return;
  const i = Math.floor(Math.random() * NROWS);
  const j = Math.floor(Math.random() * NCOLS);
  draw(j, i, grid[i][j])
}

drawTenPrint();
canvas.onclick = drawTenPrint;