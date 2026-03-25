class VideoController {
  videoViewport;
  observer;
  currentVideo;
  videoDispenser;
  template;
  updateNextListCallback;
  updatePrevListCallback;

  videoItems = [];

  constructor(videoViewport, videoDispenser, template) {
    this.videoViewport = videoViewport;
    this.videoDispenser = videoDispenser;
    this.template = template;
  }

  async init() {
    await this.videoDispenser.init();
    this.initState();
    this.initObservable();
  }

  initState() {
    this.addSetItems();
    this.currentVideo = this.videoViewport.children[0];
    this.preloadVideo(this.videoDispenser.get(0), this.currentVideo);
    this.preloadVideo(this.videoDispenser.get(1), this.currentVideo.nextElementSibling);
  }

  clearVideo = (c) => c?.querySelector('video')?.remove();

  updateState(forward = true)  {
    const siblingElements = [
      this.currentVideo.previousElementSibling?.previousElementSibling,
      this.currentVideo.previousElementSibling,
      this.currentVideo,
      this.currentVideo.nextElementSibling,
      this.currentVideo.nextElementSibling?.nextElementSibling
    ];

    if (!forward) {
      siblingElements.reverse();
    }

    if (siblingElements[0]) {
      this.clearVideo(siblingElements[0]);
    }

    if (siblingElements[1]) {
      this.pauseVideo(siblingElements[1]);
    }

    this.playVideo(siblingElements[2]);

    if (siblingElements[3]) {
      this.preloadVideo(this.videoDispenser.shift(forward), siblingElements[3]);
    }
  }

  addSetItems(forward = true, amount = 15) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < amount; i++) {
      fragment.appendChild(this.getTemplateInstance('url' + i));
    }

    if (forward) {
      this.videoViewport.appendChild(fragment);
    } else {
      this.videoViewport.insertBefore(fragment, this.videoViewport.firstChild);
    }

    // this.cutScrollableArea();
  }

  getTemplateInstance(name) {
    const clone = this.template.content.cloneNode(true);

    clone.firstElementChild.setAttribute('name', name);

    return clone;
  }

  pauseVideo = c => {
    const videoElement = c.querySelector('video');

    videoElement.pause();
    videoElement.currentTime = 0;
  };

  playVideo = c => {
    c.querySelector('video').play().catch(() => console.error("NEED INTERACT"));
  }
  preloadVideo = (video, c) => {
    const videoElement = document.createElement("video");

    videoElement.src = video.url;
    c.appendChild(videoElement);
  }

  updateScrollableArea(forward) {
    const triggerBufferSize = 5;
    const children =  Array.from(this.videoViewport.children);
    const currentIndex = children.indexOf(this.currentVideo);

    if (forward) {
      if (children.length - currentIndex < triggerBufferSize) {
        this.loadNextPool(currentIndex);
      }
    } else if (currentIndex < triggerBufferSize) {
      this.loadPrevPool(currentIndex);
    }
  }

  updateObservable = ({ nextElementSibling, previousElementSibling }, forward) => {
    this.observer.unobserve(this.currentVideo);
    this.currentVideo = forward ? nextElementSibling : previousElementSibling;
    this.observer.observe(this.currentVideo);
  };

  initObservable() {
    const options = {
      root: this.videoViewport,
      rootMargin: '0px',
      scrollMargin: '0px',
      threshold: 0.5,
    };

    this.observer = new IntersectionObserver((arg) => {
      const e = arg.find((a) => !a.isIntersecting);
      const target = e?.target;

      if (target === this.currentVideo) {
        const forward = e.rootBounds.top > e.boundingClientRect.top;

        this.updateScrollableArea(forward);
        this.updateObservable(target, forward);
        this.updateState(forward);
      }
    }, options);
    this.observer.observe(this.currentVideo);
  }

  loadPrevPool() {
    // const prevScrollBottom = this.videoViewport.scrollTop;

    this.addSetItems(false);
    // this.videoViewport.scrollTop = prevScrollTop;
    this.updatePrevListCallback = null;
  }

  loadNextPool(currentIndex) {
    this.updateNextListCallback = this.updateNextListCallback ?? this.videoDispenser
      .fetch(currentIndex, currentIndex + 20)
      .then(() => {
        const prevScrollTop = this.videoViewport.scrollTop;

        this.addSetItems(true, 20);
        this.preloadVideo(this.videoDispenser.get(currentIndex), this.currentVideo.nextElementSibling);

        this.videoViewport.scrollTop = prevScrollTop;
        this.updateNextListCallback = null;
      });
  }

  cutScrollableArea() {
    console.log('CUT');
    const childrenArray = Array.from(this.videoViewport.children);
    const currentIndex = childrenArray.indexOf(this.currentVideo);
    const bufferSize = 20;
    const documentFragment = document.createDocumentFragment();

    // cut forward
    if (childrenArray.length - currentIndex > bufferSize) {
      documentFragment.replaceChildren(...childrenArray.slice(currentIndex + bufferSize));
    }
    // cut backward
    if (currentIndex > bufferSize) {
      documentFragment.replaceChildren(...childrenArray.slice(0, currentIndex - bufferSize));
    }

    // check memory leak for documentFragment;
  }
}

export default VideoController;
