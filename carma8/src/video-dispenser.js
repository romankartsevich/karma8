import Video from './video-entity.js';

function* createCounter() {
  let start = 0;

  while (true) {
    start++;

    if (start === 10) {
      start = 1;
    }

    yield start;
  }
}

const counter = createCounter();

function mockFetch(from , to) {
  return new Array(to - from)
    .fill('url')
    .map((item, index) => new Video(index + from,`/public/videos/video ${counter.next().value}.MP4`, item + (index + from)));
}

class VideoDispenser {
  videos = [];

  async init() {
    await this.getVideosFromTo(0, 20);
  }

  fetch(from, to) {
    const list = this.videos.slice(from, to);

    if (list.length === to - from) {
      return Promise.resolve(list);
    } else {
      return this.getVideosFromTo(from, to);
    }
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
}

export default VideoDispenser;