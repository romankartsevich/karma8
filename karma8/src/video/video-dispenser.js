import mockFetch from '../utils/mock.js';

class VideoDispenser {
  videos = [];

  async init(size) {
    await this.getVideosFromTo(0, size);
  }

  async fetch(from, to) {
    const list = this.videos.slice(from, to);

    if (list.length === to - from) {
      return list;
    } else {
      return await this.getVideosFromTo(from, to);
    }
  }

  // loading emulation
  async getVideosFromTo(from, to) {
    const videos = await new Promise((resolve) => {
      setTimeout(() => resolve(mockFetch(from, to)), 4000);
    });

    const begin = this.videos.slice(0, from);
    const end = this.videos.slice(to);

    this.videos = [...begin, ...videos, ...end];

    return videos;
  }
}

export default VideoDispenser;