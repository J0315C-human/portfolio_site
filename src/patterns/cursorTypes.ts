import constants from '../constants';

export interface Position {
  j: number, i: number;
}

const { maxRows, maxCols } = constants;

export const addVector = (j: number, i: number) => (cursor: Position[]) =>
  cursor.map(pos => ({ j: pos.j + j, i: pos.i + i }));

const normalCursor = (j: number, i: number) => [{ j, i }];

const largeCursor = (j: number, i: number) => [
  { j, i },
  { j: j + 1, i, },
  { j: j + 1, i: i + 1, },
  { j, i: i + 1, },
  { j: j - 1, i, },
  { j: j - 1, i: i + 1, },
]
const line1Cursor = (j: number, i: number) => [
  { j, i },
  { j: j + 1, i },
  { j: j - 1, i },
]

const line2Cursor = (j: number, i: number) => [
  { j, i },
  { j, i: i + 1 },
  { j, i: i - 1 },
]

const line3Cursor = (j: number, i: number) => [
  { j, i },
  { j: j + 1, i },
  { j: j + 2, i },
  { j: j - 1, i },
  { j: j - 2, i },
]

const line4Cursor = (j: number, i: number) => [
  { j, i },
  { j, i: i + 1 },
  { j, i: i + 2 },
  { j, i: i - 1 },
  { j, i: i - 2 },
]

const ifLeft = (j: number, i: number, a: Position[], b: Position[]) => {
  const evenRow = j % 2 === 1;
  const evenCol = i % 2 === 0;
  const isLeft = evenRow ? evenCol : !evenCol;
  return isLeft ? a : b;
}

const rightCursor = (j: number, i: number) => ifLeft(j, i, [], [{ j, i }]);
const rightCursor2 = (j: number, i: number) => ifLeft(j, i, [], [
  { j, i },
  { j: j + 1, i: i + 1 },
  { j: j - 1, i: i - 1 },
  { j: j + 1, i: i - 1 },
  { j: j - 1, i: i + 1 },
]);

const leftCursor = (j: number, i: number) => ifLeft(j, i, [{ j, i }], []);
const leftCursor2 = (j: number, i: number) => ifLeft(j, i, [
  { j, i },
  { j: j + 1, i: i + 1 },
  { j: j - 1, i: i - 1 },
  { j: j + 1, i: i - 1 },
  { j: j - 1, i: i + 1 },
], []);

const hexCursor = (j: number, i: number) => ifLeft(j, i, [
  { j, i },
  { j, i: i + 1, },
  { j: j - 1, i, },
  { j: j - 1, i: i + 1, },
  { j: j - 2, i, },
  { j: j - 2, i: i + 1, },
], largeCursor(j, i));

const quad1Cursor = (j: number, i: number) => ifLeft(j, i,
  [{ j, i }, { j: j - 1, i }],
  [{ j, i }, { j: j + 1, i }],
);
const quad2Cursor = (j: number, i: number) => ifLeft(j, i,
  [{ j, i }, { j: j + 1, i }],
  [{ j, i }, { j: j - 1, i }],
);
const quad3Cursor = (j: number, i: number) => ifLeft(j, i,
  [{ j, i }, { j, i: i + 1 }],
  [{ j, i }, { j, i: i - 1 }],
);

const _getCursor = (name: string, j: number, i: number): Position[] => {
  switch (name) {
    case 'large':
      return largeCursor(j, i);
    case 'quad_1':
      return quad1Cursor(j, i);
    case 'quad_2':
      return quad2Cursor(j, i);
    case 'quad_3':
      return quad3Cursor(j, i);
    case 'line_1':
      return line1Cursor(j, i);
    case 'line_2':
      return line2Cursor(j, i);
    case 'line_3':
      return line3Cursor(j, i);
    case 'line_4':
      return line4Cursor(j, i);
    case 'hex':
      return hexCursor(j, i);
    case 'left':
      return leftCursor(j, i);
    case 'left_2':
      return leftCursor2(j, i);
    case 'right':
      return rightCursor(j, i);
    case 'right_2':
      return rightCursor2(j, i);
    default:
      return normalCursor(j, i);
  }
}

const removeOutOfBounds = (cursor: Position[]) =>
  cursor.filter(pos =>
    pos.i >= 0 && pos.j >= 0 && pos.i < maxCols && pos.j < maxRows
  )

export const getCursor = (name: string, j, i) => removeOutOfBounds(_getCursor(name, j, i));