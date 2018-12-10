

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