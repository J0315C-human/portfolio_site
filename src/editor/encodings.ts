const encodings = [
  {
    match: '000000000000000000000000',
    code: 'E',
  },
  {
    match: '111111111111111111111111',
    code: 'F',
  },
  {
    match: '222222222222222222222222',
    code: 'G',
  },
  {
    match: '333333333333333333333333',
    code: 'H',
  },
  {
    match: '444444444444444444444444',
    code: 'I',
  },
  {
    match: '555555555555555555555555',
    code: 'J',
  },
  {
    match: '0000000000000000',
    code: 'a',
  },
  {
    match: '1111111111111111',
    code: 'b',
  },
  {
    match: '2222222222222222',
    code: 'c',
  },
  {
    match: '3333333333333333',
    code: 'd',
  },
  {
    match: '4444444444444444',
    code: 'e',
  },
  {
    match: '5555555555555555',
    code: 'f',
  },
  {
    match: '00000000',
    code: 'g',
  },
  {
    match: '11111111',
    code: 'h',
  },
  {
    match: '22222222',
    code: 'i',
  },
  {
    match: '33333333',
    code: 'j',
  },
  {
    match: '44444444',
    code: 'k',
  },
  {
    match: '55555555',
    code: 'l',
  },
  {
    match: '0000',
    code: 'm',
  },
  {
    match: '1111',
    code: 'n',
  },
  {
    match: '2222',
    code: 'o',
  },
  {
    match: '3333',
    code: 'p',
  },
  {
    match: '4444',
    code: 'q',
  },
  {
    match: '5555',
    code: 'r',
  },
  {
    match: '000',
    code: 's',
  },
  {
    match: '111',
    code: 't',
  },
  {
    match: '222',
    code: 'u',
  },
  {
    match: '333',
    code: 'v',
  },
  {
    match: '444',
    code: 'w',
  },
  {
    match: '555',
    code: 'x',
  },
  {
    match: '00',
    code: 'y',
  },
  {
    match: '11',
    code: 'z',
  },
  {
    match: '22',
    code: 'A',
  },
  {
    match: '33',
    code: 'B',
  },
  {
    match: '44',
    code: 'C',
  },
  {
    match: '55',
    code: 'D',
  },
]

export const addEncodings = (s: string) => encodings.reduce((prev, cur) => prev.replace(new RegExp(cur.match, 'g'), cur.code), s);
export const removeEncodings = (s: string) => encodings.reduce((prev, cur) => prev.replace(new RegExp(cur.code, 'g'), cur.match), s);