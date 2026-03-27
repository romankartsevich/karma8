class PlayList {
  items;

  constructor(items) {
    this.items = items;
  }

  init() {
    this.items[0].preload();
    this.items[0].play();
    this.items[1].preload();
  }

  addToForward(items) {
    this.items.push(...items);
  }

  addToBackward(items) {
    this.items = [ ...items, ...this.items ];
  }

  trimForward(amount) {
    this.items = this.items.slice(0, this.size() - amount);
  }

  trimBackward(amount) {
    this.items = this.items.slice(amount);
  }

  next() {
    const currentIndex = this.getCurrentIndex();

    this.items[currentIndex]?.stop();
    this.items[currentIndex - 1]?.clear();
    this.items[currentIndex + 1]?.play();
    this.items[currentIndex + 2]?.preload();
  }

  prev() {
    const currentIndex = this.getCurrentIndex();

    this.items[currentIndex]?.stop();
    this.items[currentIndex + 1]?.clear();
    this.items[currentIndex - 1]?.play();
    this.items[currentIndex - 2]?.preload();
  }

  getCurrentIndex() {
    return this.items.findIndex(({ current }) => current);
  }

  size() {
    return this.items.length;
  }

  get(index) {
    return this.items.at(index);
  }

  getCurrentWithShift(shift = 0) {
    const currentIndex = this.getCurrentIndex();

    return this.items[currentIndex + shift];
  }

  getFromTo(from, to) {
    if (to) {
      return this.items.slice(from, to);
    }

    return this.items.slice(from);
  }
}

export default PlayList;