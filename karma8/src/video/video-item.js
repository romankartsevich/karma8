class VideoItem {

  video;
  videoElement;
  videoContainer;

  current = false;

  classes = {
    manualPlay: 'need-manual-play',
    videoTitle: 'video-title',
    playing: 'playing',
  };

  constructor(video, videoContainer) {
    this.video = video;
    this.videoContainer = videoContainer;
    this.init();
  }

  init() {
    this.videoContainer.querySelector(`.${this.classes.videoTitle}`).textContent = `Example name #${this.video.name}`;
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
        this.videoContainer.classList.add(this.classes.playing);
        this.videoContainer.classList.remove(this.classes.manualPlay);
      })
      .catch(() => this.videoContainer.classList.add(this.classes.manualPlay));
  }

  pause() {
    this.videoElement.pause();
    this.videoContainer.classList.remove(this.classes.playing);
    this.videoContainer.classList.add(this.classes.manualPlay);
  }

  stop() {
    this.pause();
    this.current = false;
    this.videoContainer.classList.remove(this.classes.manualPlay);
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