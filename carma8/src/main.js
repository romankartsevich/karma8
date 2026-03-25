
//mock function
import VideoController from './video-controller.js';

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
  return new Array(to - from).fill('url').map((item, index) => new Video('/public/videos/video1.MP4', item + (index + from)));
}

setTimeout(() => test(), 10);

async function test() {
  const videoDispenser = init();
  const root = document.querySelector('.video-viewport');
  const template = document.querySelector('#videoContainerTemplate');

  const videoController = new VideoController(root, videoDispenser, template);

  await videoController.init();
}

function init() {
  const MAIN_CONFIG = {
    preload: {
      prev: 2,
      next: 2,
      time: 4000, // seconds
    },
    fetchSize: 5,
    fetchNewWhenLeft: 2,
  }

  return new VideoDispenser(MAIN_CONFIG);
}

class Video {
  url = "";
  name = "";

  state = {
    stop: null,
    play: null,
    pause: null,
    preload: null,
  };

  constructor (url, name) {
    this.url = url;
    this.name = name;
  }
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
    await this.getVideos(); // need add try catch for handle errors.
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

  async getVideos(amount = this.config.fetchSize) {
    // async video getter

    return await new Promise(resolve => resolve(getNextVideos(this.videos.length))).then(videos => {
      this.videos = videos;

      return Promise.resolve();
    })
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

      return Promise.resolve();
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

