
const encodings = [] as Array<{ match: string, code: string }>;
let c = 65;
const getNextChar = () => {
  if (c === 91) {
    c = 97;
  }
  return String.fromCharCode(c++);
}

[24, 16, 8, 4, 3, 2].forEach(n => {
  ['0', '1', '2', '3', '4', '5'].forEach(colorIdx => {
    encodings.push({
      match: colorIdx.repeat(n),
      code: getNextChar(),
    })
  })
})

export const addEncodings = (s: string) => encodings.reduce((prev, cur) => prev.replace(new RegExp(cur.match, 'g'), cur.code), s);
export const removeEncodings = (s: string) => encodings.reduce((prev, cur) => prev.replace(new RegExp(cur.code, 'g'), cur.match), s);