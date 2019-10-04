const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const setOutput = (text) => {
  const output = document.getElementById("output");
  if (output){
    output.textContent = text;
  }
}


const numRows = 28;
const numCols = 32;
const totalCells = numRows * numCols;
const cellWidth = 20;
const halfWidth = cellWidth / 2;
canvas.width = numCols * cellWidth;
canvas.height = numRows * cellWidth;
let intervalIds = [];
let timeoutIds = [];
const edgeColor = "#000";
const pathColor = "#FFF"
const backtrackColor = "#000";

// find cell's tree's parent cell
const find = cell => {
  if (cell.parent) {
    return find(cell.parent);
  } else {
    return cell;
  }
};

const getDrawData = (maze) => {
  const cells = maze.cells.map(row => row.map(cell => {
    const parent = find(cell);
    return {x: cell.x, y: cell.y, color: parent.color};
  }));
  const edges = maze.edges.map(edge => ({
    type: edge.type,
    x: edge.cells[0].x,
    y: edge.cells[0].y,
  }));
  return { cells, edges };
}

const getPositionColor = (i, j) => {
    const r = Math.floor(Math.random() * 200 + 27.5);
    const g = Math.floor(Math.random() * 200 + 27.5);
    const b = Math.floor(Math.random() * 200 + 27.5);
    return `rgb(${r},${g},${b})`;
  }

const drawBackgrounds = cellSet => {
  cellSet.forEach(row => row.forEach(c => {
    ctx.fillStyle = c.color;
    ctx.fillRect(c.x, c.y, c.x + cellWidth, c.y + cellWidth);
    })
  )
};

const drawEdge = (edge, color, width) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  const { x, y, type } = edge;
  switch (type) {
    case "vertical":
      ctx.moveTo(x + cellWidth, y);
      ctx.lineTo(x + cellWidth, y + cellWidth);
      ctx.stroke();
      break;
    case "horizontal":
      ctx.moveTo(x + cellWidth, y + cellWidth);
      ctx.lineTo(x, y + cellWidth);
      ctx.stroke();
      break;
  }
  ctx.closePath();
};

const drawMaze = m => {
  drawBackgrounds(m.cells);
  m.edges.forEach(e => drawEdge(e, edgeColor, 2));
};

const getNumberOfTrees = cells => {
  const sets = [];
  cells.forEach(row => {
    row.forEach(cell => {
      const parent = find(cell);
      if (!sets.includes(parent)) {
        sets.push(parent);
      }
    });
  });
  return sets.length;
};

function runMaze() {
  // clear previous timeouts
  intervalIds.forEach(id => clearInterval(id));
  timeoutIds.forEach(id => clearTimeout(id));
  intervalIds.length = 0;
  timeoutIds.length = 0;

  const maze = {
    cells: [],
    edges: []
  };

  for (let i = 0; i < numRows; i++) {
    const row = [];
    for (let j = 0; j < numCols; j++) {
      row.push({
        i,
        j,
        x: j * cellWidth,
        y: i * cellWidth,
        color: getPositionColor(i, j),
        connected: [],
        weight: 1,
      });
    }
    maze.cells.push(row);
  }

  // add right edges
  for (let i = 0; i < numRows; i++) {
    const row = [];
    for (let j = 0; j < numCols - 1; j++) {
      maze.edges.push({
        cells: [maze.cells[i][j], maze.cells[i][j + 1]],
        type: "vertical"
      });
    }
  }
  // add bottom edges
  for (let i = 0; i < numRows - 1; i++) {
    const row = [];
    for (let j = 0; j < numCols; j++) {
      maze.edges.push({
        cells: [maze.cells[i][j], maze.cells[i + 1][j]],
        type: "horizontal"
      });
    }
  }

  let _timeoutMS = 0;
  const drawMazeDelayed = maze => {
    const drawData = getDrawData(maze);
    timeoutIds.push(setTimeout(() => {
      drawMaze(drawData);
    }, _timeoutMS));
    _timeoutMS += 50;
  };

  // generate maze by removing edges and uniting all subtrees of cells
  drawMazeDelayed(maze);
  const removalSet = [];
  setOutput('Joining Cells...');
  while (getNumberOfTrees(maze.cells) > 1) {
    const edge = maze.edges[Math.floor(Math.random() * maze.edges.length)];
    const cellA = edge.cells[0];
    const cellB = edge.cells[1];

    const parentA = find(cellA);
    const parentB = find(cellB);
    if (parentA !== parentB) {
      if (parentB.weight >= parentA.weight){
        parentA.parent = parentB;
        parentB.weight += parentA.weight;
      } else {
        parentB.parent = parentA;
        parentA.weight += parentB.weight;
      }
      cellA.connected.push(cellB);
      cellB.connected.push(cellA);
      maze.edges = maze.edges.filter(e => e !== edge);
      removalSet.push(edge);
      drawMazeDelayed(maze);
    }
  }

  const visited = [maze.cells[0][0]];
  const path = [maze.cells[0][0]];
  let foundExit = false;

  const moveOne = () => {
    if (foundExit) return setOutput('Solution Found!');
    const curCell = path[path.length - 1];

    let newCellFound = false;
    for (let n = 0; n < curCell.connected.length; n++) {
      const newCell = curCell.connected[n];
      if (!visited.includes(newCell)) {
        ctx.strokeStyle = pathColor;
        ctx.lineCap = "round";
        
        ctx.lineWidth = halfWidth;
        ctx.beginPath();
        ctx.moveTo(curCell.x + halfWidth, curCell.y + halfWidth);
        ctx.lineTo(newCell.x + halfWidth, newCell.y + halfWidth);
        ctx.stroke();
        ctx.closePath();
        visited.push(newCell);
        path.push(newCell);
        newCellFound = true;
        if (newCell.j === numCols - 1 && newCell.i === numRows - 1) {
          foundExit = true;
        }
        break;
      }
    }
    //backtrack
    if (!newCellFound) {
      setOutput('Finding Solution with Simple Backtracking...');
      const prevCell = path[path.length - 2];
      const prevPrevCell = path[path.length - 3];
      if (prevCell) {
        ctx.strokeStyle = backtrackColor;
        ctx.lineCap = "round";
        
        ctx.lineWidth = halfWidth + 1;
        ctx.beginPath();
        ctx.moveTo(curCell.x + halfWidth, curCell.y + halfWidth);
        ctx.lineTo(prevCell.x + halfWidth, prevCell.y + halfWidth);
        ctx.stroke();
        ctx.closePath();
        if (prevPrevCell) {
          ctx.strokeStyle = pathColor;
          ctx.lineWidth = halfWidth;
          ctx.beginPath();
          ctx.moveTo(prevCell.x + halfWidth, prevCell.y + halfWidth);
          ctx.lineTo(prevPrevCell.x + halfWidth, prevPrevCell.y + halfWidth);
          ctx.stroke();
          ctx.closePath();
        }
      }
      path.pop();
    }
  };
  timeoutIds.push(
    setTimeout(() => {
      intervalIds.push(setInterval(moveOne, 20));
    }, _timeoutMS + 500)
  );
}

document.getElementById("go").onclick = runMaze;
