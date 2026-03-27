import VideoItem from './video-item.js';
import LoaderController from '../loader/loader-controller.js';
import Scheduler from '../utils/scheduler.js';
import PlayList from '../play-list/play-list.js';
import PlayListControls from '../play-list/play-list-controls.js';

class VideoController {

  template;
  videoViewport;
  videoDispenser;

  loaderController;
  scheduler;
  playList;
  playListControls;

  upStreamScheduler;
  downStreamScheduler;
  optimizationScheduled = false;

  bufferSize = 10;
  triggerSize = 5;
  garbageCollector = { triggerSize: 15, removeSize: 5 };

  constructor(videoViewport, videoDispenser, template, config) {
    this.videoViewport = videoViewport;
    this.videoDispenser = videoDispenser;
    this.scheduler = new Scheduler(videoViewport);
    this.loaderController = new LoaderController(videoViewport, 'loader');
    this.template = template;
    this.playList = new PlayList([]);
    this.playListControls = new PlayListControls(videoViewport, this.playList);

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

  updateEnvironment(next) {
    const triggerBufferSize = 5;

    if (next) {
      if (this.playList.size() - this.playList.getCurrentIndex() < triggerBufferSize) {
        this.setupNextVideos();
        const optimizationCallback = this.optimize();

        if (optimizationCallback) {
          this.scheduler.executeAfterScrollEnd(optimizationCallback);
        }
      }
    } else if (this.playList.get(0).video.index > 0 && this.playList.getCurrentIndex() < triggerBufferSize) {
      const optimizationCallback = this.optimize();

      this.setupPrevVideos(optimizationCallback);
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

  setupPrevVideos(optimizationCallback) {
    if (this.upStreamScheduler) {
      return;
    }

    const to = Math.max(0,  this.playList.get(0).video.index - 1);
    const from = Math.max(0, to - this.bufferSize);

    this.upStreamScheduler = true;
    const callback = () => {
      this.videoDispenser
        .fetch(from, to)
        .then(videos => {
            this.setupVideos(false, videos);

            if (this.getCurrentVideo().video.index === (to + 1)) {
              this.getCurrentVideo(-1).preload();
            }

            this.upStreamScheduler = null;
            optimizationCallback?.();
        });
    }

    this.scheduler.executeAfterScrollEnd(callback);
  }

  setupNextVideos() {
    if (this.downStreamScheduler) {
      return;
    }

    const from = this.playList.get(-1).video.index + 1;
    const to = from + this.bufferSize;

    this.loaderController.showLoader();
    this.downStreamScheduler = this.videoDispenser.fetch(from, to)
      .then((videos) => {
        this.setupVideos(true, videos);

        if (this.getCurrentVideo().video.index === from - 1) {
          this.getCurrentVideo(1).preload();
        }

        this.loaderController.hideLoader();
        this.downStreamScheduler = null;
      });
  }

  optimize() {
    if (this.optimizationScheduled) {
      return;
    }

    if (this.playList.getCurrentIndex()  > this.garbageCollector.triggerSize) {  // check when slide down
      const videoItemsForDestroy = this.playList.getFromTo(0, this.garbageCollector.removeSize)

      if (videoItemsForDestroy.length > 0) {
        return this.getOptimizationCallback(
          videoItemsForDestroy,
          () => this.playList.trimPrev(this.garbageCollector.removeSize)
        );
      }
    } else if (this.playList.size() - this.playList.getCurrentIndex() > this.garbageCollector.triggerSize) { // check when slide up
      const videoItemsForDestroy = this.playList.getFromTo(this.playList.size() - this.garbageCollector.removeSize);

      if (videoItemsForDestroy.length > 0) {
       return this.getOptimizationCallback(
          videoItemsForDestroy,
          () => this.playList.trimNext(this.garbageCollector.removeSize),
        );
      }
    }
  }

  getOptimizationCallback(videoItemsForDestroy, callbackUpdate) {
    return () => {
      let documentFragment = document.createDocumentFragment();
      const containers = videoItemsForDestroy.map(videoItem => videoItem.destroy());

      callbackUpdate?.();
      documentFragment.replaceChildren(...containers);
    }
  }
}

export default VideoController;
