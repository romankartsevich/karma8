class VideoItem {

  video;
  videoElement;
  videoContainer;

  constructor(videoContainer, video) {
    this.video = video;
    this.videoContainer = videoContainer;
  }

  preload() {
    this.videoElement = document.createElement('video');
    this.videoElement.src = this.video.url;
    this.videoContainer.appendChild(this.videoElement);
  }

  play() {
    this.videoElement.play();
  }

  stop() {
    this.videoElement.pause();
    this.videoElement.currentTime = 0;
  }
}