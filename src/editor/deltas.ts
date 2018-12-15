
const getArrayDeltaFromLeft = (prev: string[], cur: string[]) => {
  let result = [];
  let changeFound = false;
  for (let i = cur.length - 1; i >= 0; i--) {
    if (changeFound) {
      result = [cur[i], ...result];
    }
    else if (cur[i] !== prev[i]) {
      result = [cur[i], ...result];
      changeFound = true;
    }
  }
  return result;
}

// consider lists as 'sequential' states, and remove deltas. (with padded values from left, because we need a fixed point of reference.)
export const compressArrayArrayToDeltasFromLeft = (lists: any[][]) => {
  if (lists.length === 0) { return lists; }
  const compressed = [[...lists[0]]];
  lists.slice(1).reduce((prev, cur) => {
    compressed.push(getArrayDeltaFromLeft(prev, cur));
    return cur;
  }, [...lists[0]])
  return compressed;
}

export const decompressDeltasToArrayArrayFromLeft = (lists: any[][]) => {
  if (lists.length === 0) { return lists; }
  const uncompressed = [lists[0]];
  const state = Array.from(lists[0])
  lists.slice(1).forEach(s => {
    const newList = Array.from(s);
    state.forEach((stateVal, i) => {
      if (newList[i] === undefined) {
        newList.push(stateVal);
      } else {
        state[i] = newList[i];
      }
    })
    uncompressed.push(newList);
  })
  return uncompressed;
}