import VideoItem from './video-item.js';

class VideoController {
  template;
  videoViewport;
  videoDispenser;

  scheduler;
  playList;
  playListControls;
  loaderController;

  prevVideoScheduled;
  nextVideoScheduled;
  optimizationScheduled = false;

  bufferSize = 10;
  triggerSize = 5;
  garbageCollector = { triggerSize: 15, removeSize: 5 };

  constructor(
    videoViewport,
    videoDispenser,
    loaderController,
    playList,
    playListControls,
    scheduler,
    template,
    config
  ) {
    this.template = template;
    this.scheduler = scheduler;
    this.playList = playList;
    this.playListControls = playListControls;
    this.videoViewport = videoViewport;
    this.videoDispenser = videoDispenser;
    this.loaderController = loaderController;

    if (config) {
      this.bufferSize = config.bufferSize;
      this.triggerSize = config.triggerSize;
      this.garbageCollector = config.garbageCollector;
    }
  }

  async init() {
    await this.videoDispenser.init(this.bufferSize);
    this.initState();
    this.initObservable();
  }

  getCurrentVideo(shift = 0) {
    return this.playList.getCurrentWithShift(shift);
  }

  initState() {
    this.setupVideos(true, this.videoDispenser.videos);
    this.playList.init();
  }

  setupVideos(next = true, videos) {
    const fragment = document.createDocumentFragment();
    const newVideoItems = [];

    videos.forEach((video) => {
      const videoTemplate = this.getVideoContainer(video.name);

      newVideoItems.push(new VideoItem(video, videoTemplate.firstElementChild));
      fragment.appendChild(videoTemplate);
    });

    if (next) {
      this.videoViewport.appendChild(fragment);
      this.playList.addToNext(newVideoItems);
    } else {
      this.videoViewport.insertBefore(fragment, this.videoViewport.firstChild);
      this.playList.addToPrev(newVideoItems);
    }
  }

  getVideoContainer(name) {
    const clone = this.template.content.cloneNode(true);

    clone.firstElementChild.setAttribute('name', name);

    return clone;
  }

  async updateEnvironment(next) {
    if (next) {
      if (this.playList.nextVideosAmount() < this.triggerSize) {
        await this.setupNextVideos();
        this.scheduleOptimization();
      }
    } else if (this.playList.get(0).video.index > 0 && this.playList.prevVideosAmount() < this.triggerSize) {
      this.setupPrevVideos();
    }
  }

  initObservable() {
    const observerCallback = ([entity]) => {
      const target = entity?.target;

      if (target && !entity.isIntersecting && target === observable) {
        const next = entity.rootBounds.top > entity.boundingClientRect.top;

        this.observer.unobserve(target);
        this.updateEnvironment(next);

        if (next) {
          this.playList.next();
          observable = target.nextElementSibling;
        } else {
          this.playList.prev();
          observable = target.previousElementSibling;
        }

        this.observer.observe(observable);
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
    this.observer.observe(this.videoViewport.children[0]);
  }

  setupPrevVideos() {
    if (this.prevVideoScheduled) {
      return;
    }

    this.prevVideoScheduled = true;

    const to = Math.max(0,  this.playList.get(0).video.index - 1);
    const from = Math.max(0, to - this.bufferSize);

    this.scheduler.executeAfterScrollEnd(async () => {
      const videos = await this.videoDispenser.fetch(from, to);

      this.setupVideos(false, videos);
      this.optimize();

      if (this.getCurrentVideo().video.index === (to + 1)) {
        this.getCurrentVideo(-1).preload();
      }

      this.prevVideoScheduled = false;
    });
  }

  async setupNextVideos() {
    if (this.nextVideoScheduled) {
      return;
    }

    this.nextVideoScheduled = true;
    this.loaderController.showLoader();

    const from = this.playList.get(-1).video.index + 1;
    const to = from + this.bufferSize;
    const videos = await this.videoDispenser.fetch(from, to);

    this.setupVideos(true, videos);

    if (this.getCurrentVideo().video.index === from - 1) {
      this.getCurrentVideo(1).preload();
    }

    this.loaderController.hideLoader();
    this.nextVideoScheduled = false;
  }

  scheduleOptimization() {
    if (this.optimizationScheduled) {
      return;
    }

    this.optimizationScheduled = true;
    this.scheduler.executeAfterScrollEnd(() => {
      this.optimize();
      this.optimizationScheduled = false;
    });
  }

  optimize() {
    const direction = this.getOptimizationDirection();

    if (direction !== null) {
      const itemsToDelete = direction === 'prev'
        ? this.playList.getFromTo(0, this.garbageCollector.removeSize)
        : this.playList.getFromTo(this.playList.size() - this.garbageCollector.removeSize);
      const trimFn = direction === 'prev'
        ? () => this.playList.trimPrev(this.garbageCollector.removeSize)
        : () => this.playList.trimNext(this.garbageCollector.removeSize);

      if (itemsToDelete.length > 0) {
        const documentFragment = document.createDocumentFragment();
        const containers = itemsToDelete.map(videoItem => videoItem.destroy());

        trimFn?.();
        documentFragment.replaceChildren(...containers);
      }
    }
  }

  getOptimizationDirection() {
    if (this.playList.prevVideosAmount() > this.garbageCollector.triggerSize) {
      return 'prev';
    } else if (this.playList.nextVideosAmount() > this.garbageCollector.triggerSize) {
      return 'next';
    }

    return null;
  }
}

export default VideoController;
