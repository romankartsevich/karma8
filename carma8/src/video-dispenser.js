import Video from './video-entity.js';

function getNextVideos(shift = 0) {
  return [
    'url',
    'url',
    'url',
    'url',
    'url',
    'url',
    'url',
    'url',
    'url',
    'url',
    'url',
    'url',
    'url',
    'url',
    'url',
    'url',
    'url', // 18
  ].map((item, index) => new Video('/public/videos/video1.MP4', item + (index + shift)));
}
function mockFetch(from , to) {
  return new Array(to - from)
    .fill('url')
    .map((item, index) => new Video('/public/videos/video1.MP4', item + (index + from)));
}

class VideoDispenser {
  loading = false;

  config = null;
  videos = [];
  nextVideosFetchPromise = null;
  currentVideoIndex = 0;

  constructor(config) {
    this.config = config;
  }

  async init() {
    this.loading = true;
    await this.getVideosFromTo(0, 20); // need add try catch for handle errors.
    await this.start();
    this.loading = false;
  }

  next() {
    return this.shift();
  }

  prev() {
    return this.shift(false);
  }

  shift(isNext = true) {
    const newIndex = this.currentVideoIndex + (isNext ? 1 : -1);
    const video = this.videos[newIndex] || null;

    if (video) {
      this.currentVideoIndex = newIndex;
    }

    this.updateVideos();

    return video;
  }

  current() {
    return this.videos[this.currentVideoIndex];
  }

  get(index) {
    return this.videos[index];
  }

  fetch(from, to) {
    const list = this.videos.slice(from, to);

    console.log(`Fetch ${from} - ${to}`);

    if (list.length === from - to) {
      return Promise.resolve(list);
    } else {
      return this.getVideosFromTo(from, to);
    }
  }

  updateVideos() {
    const needUpdate = (this.videos.length - 1) - this.currentVideoIndex <= this.config.fetchNewWhenLeft;

    if (needUpdate && !this.nextVideosFetchPromise) {
      this.getNextVideos();
    }
  }

  async start() {
    return Promise.resolve();
  }

  async getVideosFromTo(from, to) {
    return await new Promise(resolve => {

      setTimeout(() => {
        resolve(mockFetch(from, to))
      }, 4000);

    }).then(videos => {
      const begin = this.videos.slice(0, from);
      const end = this.videos.slice(to);

      this.videos = [...begin, ...videos, ...end];

      return videos;
    });
  }

  getNextVideos(amount = this.config.fetchSize) {
    // async video getter
    this.nextVideosFetchPromise = new Promise(resolve => {
      console.log("get start;");
      setTimeout(() => {
        console.log("get end;");
        resolve(getNextVideos(this.videos.length))
      }, 5000);
    }).then(videos => {
      this.videos.push(...videos);

      return Promise.resolve();
    }).finally(() => this.nextVideosFetchPromise =null)
  }
}

export default VideoDispenser;