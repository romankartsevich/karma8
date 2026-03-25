class VideoItem {

  video;
  videoElement;
  videoContainer;

  cleared = false;
  destroyed = false;

  constructor(video, videoContainer) {
    this.video = video;
    this.videoContainer = videoContainer;
  }

  preload() {
    this.videoElement = document.createElement('video');
    this.videoElement.src = this.video.url;
    this.videoContainer.appendChild(this.videoElement);
    this.cleared = false;
  }

  play() {
    this.videoElement.play();
  }

  stop() {
    this.videoElement.pause();
    this.videoElement.currentTime = 0;
  }

  clear() {
    this.videoElement.remove();
    this.videoElement = null;
    this.cleared = true;
  }

  restore(viewContainer) {
    this.videoContainer = viewContainer;
    this.destroyed = false;
  }

  destroy() {
    const container = this.videoContainer;

    this.videoElement = null;
    this.videoContainer = null;
    this.destroyed = true;

    return container;
  }
}

export default VideoItem;