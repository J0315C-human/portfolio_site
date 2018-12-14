

export const retileGrid = (grid: any[][], rows: number, cols: number) => {
  const newGrid = [];
  for (let j = 0; j < rows; j++) {
    const newRow = [];
    const row = grid[j % grid.length];
    for (let i = 0; i < cols; i++) {
      newRow.push(row[i % row.length]);
    }
    newGrid.push(newRow);
  }
  return newGrid;
}

export const gridCopy = (grid: any[][]) => grid.map((row) => [...row])

export const gridFlippedDiag = (grid: any[][]) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = [];
  for (let j = 0; j < cols; j++){
    const newRow = [];
    for (let i = 0; i < rows; i++){
      newRow.push(grid[i][j]);
    }
    newGrid.push(newRow);
  }
  return newGrid;
}
