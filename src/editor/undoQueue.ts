
export default class UndoQueue {
  queue: (() => void)[];
  MAX_UNDO_CHANGES = 1500;
  constructor() {
    this.queue = [];
  }

  undo = () => {
    if (!this.queue.length) { return; }
    const undoFunc = this.queue.pop();
    undoFunc();
  }

  add = (undoFunc: () => void) => {
    if (this.queue.length < this.MAX_UNDO_CHANGES) {
      this.queue.push(undoFunc);
    } else {
      this.queue = [...this.queue.slice(1, this.MAX_UNDO_CHANGES), undoFunc];
    }
  }

  clear = () => {
    this.queue = [];
  }
}