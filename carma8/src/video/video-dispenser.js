import mockFetch from '../utils/mock.js';

class VideoDispenser {
  videos = [];

  async init(size) {
    await this.getVideosFromTo(0, size);
  }

  fetch(from, to) {
    const list = this.videos.slice(from, to);

    if (list.length === to - from) {
      return Promise.resolve(list);
    } else {
      return this.getVideosFromTo(from, to);
    }
  }

  // loading emulation
  async getVideosFromTo(from, to) {
    return await new Promise(resolve => {

      setTimeout(() => resolve(mockFetch(from, to)), 4000);

    }).then(videos => {
      const begin = this.videos.slice(0, from);
      const end = this.videos.slice(to);

      this.videos = [...begin, ...videos, ...end];

      return videos;
    });
  }
}

export default VideoDispenser;