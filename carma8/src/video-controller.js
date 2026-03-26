import VideoItem from './video-item.js';

const VIDEO_CONTROLLER_CONFIG = {
  bufferSize: 20,
  garbageCollector: { triggerSize: 30, removeSize: 20 }
}

class VideoController {

  observer;
  template;
  videoViewport;
  videoDispenser;
  videoItems = [];
  currentVideoIndex = 0;

  upStreamScheduler;
  downStreamScheduler;
  optimizationScheduled = false;

  bufferSize = 20;
  garbageCollector = { triggerSize: 30, removeSize: 20 };

  constructor(videoViewport, videoDispenser, template, config) {
    this.videoViewport = videoViewport;
    this.videoDispenser = videoDispenser;
    this.template = template;

    if (config) {
      this.bufferSize = config.bufferSize;
      this.garbageCollector = config.garbageCollector;
    }
  }

  async init() {
    await this.videoDispenser.init();
    this.initState();
    this.initObservable();
    this.initPlayPauseListener();
    this.initUpDownButtonsListener();
  }

  initState() {
    this.maintainVideos(true, this.videoDispenser.videos);
    this.videoItems[0].preload();
    this.videoItems[0].play();
    this.videoItems[1].preload();
  }

  updateState(forward = true)  {
    const siblingVideoItems = [
      this.videoItems[this.currentVideoIndex - 2],
      this.videoItems[this.currentVideoIndex - 1],
      this.videoItems[this.currentVideoIndex],
      this.videoItems[this.currentVideoIndex + 1],
      this.videoItems[this.currentVideoIndex + 2],
    ];

    if (!forward) {
      siblingVideoItems.reverse();
    }

    siblingVideoItems[0]?.clear();
    siblingVideoItems[1]?.stop();
    siblingVideoItems[2]?.play();
    siblingVideoItems[3]?.preload();
  }

  maintainVideos(forward = true, videos) {
    const fragment = document.createDocumentFragment();
    const newVideoItems = [];

    videos.forEach((video) => {
      const videoTemplate = this.getVideoContainer(video.name);

      newVideoItems.push(new VideoItem(video, videoTemplate.firstElementChild));
      fragment.appendChild(videoTemplate);
    });

    if (forward) {
      this.videoViewport.appendChild(fragment);
      this.videoItems.push(...newVideoItems);
    } else {
      this.videoViewport.insertBefore(fragment, this.videoViewport.firstChild);
      this.videoItems = [...newVideoItems, ...this.videoItems];
    }
  }

  getVideoContainer(name) {
    const clone = this.template.content.cloneNode(true);

    clone.firstElementChild.setAttribute('name', name);

    return clone;
  }

  updateScrollableArea(forward) {
    const triggerBufferSize = 5;

    if (forward) {
      if (this.videoItems.length - this.currentVideoIndex < triggerBufferSize) {
        this.loadNextPool(this.currentVideoIndex);
      }
    } else if (this.videoItems[0].video.index > 0 && this.currentVideoIndex < triggerBufferSize) {
      this.loadPrevPool(this.currentVideoIndex);
    }

    this.optimize();
  }

  initObservable() {
    const observerCallback = (arg) => {
      const e = arg.find((a) => !a.isIntersecting);
      const target = e?.target;

      if (target === observable) {
        const forward = e.rootBounds.top > e.boundingClientRect.top;
        const currentVideoItem = this.videoItems[this.currentVideoIndex];
        const nextVideoItem = this.videoItems[forward ? ++this.currentVideoIndex : --this.currentVideoIndex];

        observable = nextVideoItem.videoContainer;
        this.observer.observe(observable);
        this.observer.unobserve(currentVideoItem.videoContainer);

        this.updateScrollableArea(forward);
        this.updateState(forward);
      }
    };
    const options =  {
      root: this.videoViewport,
      rootMargin: '0px',
      scrollMargin: '0px',
      threshold: 0.5,
    };
    let observable = this.videoViewport.children[0];

    this.observer = new IntersectionObserver(observerCallback, options);
    this.observer.observe(observable);
  }

  loadPrevPool() {
    const to = Math.max(0, this.videoItems.at(0).video.index - 1);
    const from = Math.max(0, to - this.bufferSize);

    this.upStreamScheduler = this.upStreamScheduler ?? this.videoDispenser
      .fetch(from, to)
      .then(videos => {
        this.maintainVideos(false, videos);
        this.currentVideoIndex += to - from;

        if (this.videoItems[this.currentVideoIndex].video.index === (to + 1)) {
          this.videoItems[this.currentVideoIndex - 1].preload();
        }

        this.upStreamScheduler = null;
      });
  }

  loadNextPool() {
    const from = this.videoItems.at(-1).video.index + 1;
    const to = from + this.bufferSize;

    if (!this.downStreamScheduler) {
      this.showLoader();
      this.downStreamScheduler = this.videoDispenser.fetch(from, to)
        .then((videos) => {
          this.maintainVideos(true, videos);

          if (this.videoItems[this.currentVideoIndex].video.index === from - 1) {
            this.videoItems[this.currentVideoIndex + 1].preload();
          }

          this.hideLoader();
          this.downStreamScheduler = null;
        });
    }
  }

  optimize() {
    if (this.optimizationScheduled) {
      return;
    }

    let containers  = null;
    let callbackUpdate = null;

    if (this.currentVideoIndex  > this.garbageCollector.triggerSize) {  // check when slide down
      const videoItemsForRemove = this.videoItems.slice(0, this.garbageCollector.removeSize);

      containers = videoItemsForRemove.reduce((acc, videoItem) => [...acc, videoItem.destroy()], []);
      callbackUpdate = () => {
        this.videoItems = this.videoItems.slice(this.garbageCollector.removeSize);
        this.currentVideoIndex -= this.garbageCollector.removeSize;
      };
    } else if (this.videoItems.length - this.currentVideoIndex > this.garbageCollector.triggerSize) { // check when slide up
      const videoItemsForRemove = this.videoItems.slice(this.videoItems.length - this.garbageCollector.removeSize);

      containers = videoItemsForRemove.reduce((acc, videoItem) => [...acc, videoItem.destroy()], []);
      callbackUpdate = () => this.videoItems = this.videoItems.slice(0, this.garbageCollector.removeSize);
    }

    if (containers) {
      this.scheduleOptimization(containers, callbackUpdate);
    }
  }

  scheduleOptimization(containers, callbackUpdate) {
    this.optimizationScheduled = true;
    this.videoViewport.addEventListener("scrollend", () => {
      let documentFragment = document.createDocumentFragment();

      callbackUpdate?.();
      documentFragment.replaceChildren(...containers);
      this.observer.takeRecords();
      this.optimizationScheduled = false;
    }, { once: true} );
  }

  initPlayPauseListener() {
    this.videoViewport.addEventListener("click", () => this.videoItems[this.currentVideoIndex]?.togglePlayPause());
  }

  initUpDownButtonsListener() {
    document.querySelector(".controls").addEventListener("click", ({ target }) => {
      if (target.classList.contains("control-up")) {
        this.videoItems[this.currentVideoIndex - 1]?.scrollToItem();
      } else if (target.classList.contains("control-down")) {
        this.videoItems[this.currentVideoIndex + 1]?.scrollToItem();
      }
    });
  }

  showLoader() {
    const loaderTemplate = document.querySelector('#loader');
    const loader = loaderTemplate.content.cloneNode(true).firstElementChild;

    this.videoViewport.appendChild(loader);
  }

  hideLoader() {
    this.videoViewport.querySelector(".loader-container").remove();
  }
}

export default VideoController;
