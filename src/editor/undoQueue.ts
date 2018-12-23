import constants from "../constants";

export default class UndoQueue {
  queue: (() => void)[];
  constructor() {
    this.queue = [];
  }

  undo = () => {
    if (!this.queue.length) { return; }
    const undoFunc = this.queue.pop();
    undoFunc();
  }

  add = (undoFunc: () => void) => {
    if (this.queue.length < constants.maxUndoChanges) {
      this.queue.push(undoFunc);
    } else {
      this.queue = [...this.queue.slice(1, constants.maxUndoChanges), undoFunc];
    }
  }

  clear = () => {
    this.queue = [];
  }
}