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

  addToNext(items) {
    this.items.push(...items);
  }

  addToPrev(items) {
    this.items = [ ...items, ...this.items ];
  }

  trimNext(amount) {
    this.items = this.items.slice(0, this.size() - amount);
  }

  trimPrev(amount) {
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

    return this.get(currentIndex + shift);
  }

  getFromTo(from, to) {
    if (to) {
      return this.items.slice(from, to);
    }

    return this.items.slice(from);
  }

  nextVideosAmount() {
    return this.size() - this.getCurrentIndex();
  }

  prevVideosAmount() {
    return this.getCurrentIndex();
  }
}

export default PlayList;