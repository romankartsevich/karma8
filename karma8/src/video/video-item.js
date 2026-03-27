class VideoItem {

  video;
  videoElement;
  videoContainer;

  current = false;

  constructor(video, videoContainer) {
    this.video = video;
    this.videoContainer = videoContainer;

    this.init();
  }

  init() {
    this.videoContainer.querySelector('.video-title').textContent = `Example name #${this.video.name}`;
  }

  preload() {
    this.videoElement = document.createElement('video');
    this.videoElement.loop = true;
    this.videoElement.src = this.video.url;
    this.videoElement.setAttribute('preload', 'auto');
    this.videoContainer.appendChild(this.videoElement);
  }

  play() {
    this.current = true;

    this.videoElement.play()
      .then(() => {
        this.videoContainer.classList.add('play');
        this.videoContainer.classList.remove('need-manual-play');
      })
      .catch(() => this.videoContainer.classList.add('need-manual-play'));
  }

  pause() {
    this.videoElement.pause();
    this.videoContainer.classList.remove('play');
    this.videoContainer.classList.add('need-manual-play');
  }

  stop() {
    this.pause();
    this.current = false;
    this.videoContainer.classList.remove('need-manual-play');
    this.videoElement.setAttribute('preload', 'none');
    this.videoElement.currentTime = 0;
  }

  clear() {
    this.videoElement.remove();
    this.videoElement = null;
    this.current = false;
  }

  togglePlayPause() {
    this.current = true;

    if (this.videoElement.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  scrollToItem() {
    this.videoContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  destroy() {
    const container = this.videoContainer;

    this.videoElement = null;
    this.videoContainer = null;
    this.current = false;

    return container;
  }
}

export default VideoItem;