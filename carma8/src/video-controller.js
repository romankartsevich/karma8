import VideoItem from './video-item.js';

class VideoController {
  template;
  videoViewport;
  videoDispenser;
  videoItems = [];
  currentVideoIndex = 0;

  updateNextListCallback;
  updatePrevListCallback;

  bufferSize = 20;

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
    this.maintainVideos(true, this.videoDispenser.videos);
    this.videoItems[0].preload();
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
    } else if (this.currentVideoIndex < triggerBufferSize) {
      this.loadPrevPool(this.currentVideoIndex);
    }

    // this.optimize();
  }

  initObservable() {
    const options = {
      root: this.videoViewport,
      rootMargin: '0px',
      scrollMargin: '0px',
      threshold: 0.5,
    };
    let observable = this.videoViewport.children[0];
    const observer = new IntersectionObserver((arg) => {
      const e = arg.find((a) => !a.isIntersecting);
      const target = e?.target;

      if (target === observable) {
        const forward = e.rootBounds.top > e.boundingClientRect.top;
        const currentVideoItem = this.videoItems[this.currentVideoIndex];
        const nextVideoItem = this.videoItems[forward ? ++this.currentVideoIndex : --this.currentVideoIndex];

        observable = nextVideoItem.videoContainer;
        observer.observe(observable);
        observer.unobserve(currentVideoItem.videoContainer);

        this.updateScrollableArea(forward);
        this.updateState(forward);
      }
    }, options);

    observer.observe(observable);
  }

  loadPrevPool() {
    // const prevScrollBottom = this.videoViewport.scrollTop;
    // const buffer = 20;
    // const to =

    // this.maintainVideos(false);
    // this.videoViewport.scrollTop = prevScrollTop;
    // this.updatePrevListCallback = null;
  }

  loadNextPool() {
    const from = this.videoItems.length;
    const to = from + this.bufferSize;

    this.updateNextListCallback = this.updateNextListCallback ?? this.videoDispenser
      .fetch(from, to)
      .then(videos => {
        const prevScrollTop = this.videoViewport.scrollTop;

        this.maintainVideos(true, videos);
        this.videoItems[this.currentVideoIndex + 1].preload();

        this.videoViewport.scrollTop = prevScrollTop;
        this.updateNextListCallback = null;
      });
  }

  optimize() {
    let documentFragment = document.createDocumentFragment();

    const trimmedList = this.trimDestroyedVideoItems();
    const currentVideoIndex = this.currentVideoIndex - trimmedList.topDestroyedList.length;

    if (currentVideoIndex  > 20) {
      const topVideoItemsList = trimmedList.maintainedList.slice(0, this.bufferSize);
      const containers = topVideoItemsList.reduce((acc, videoItem) => [...acc, videoItem.destroy()], []);

      documentFragment.replaceChildren(...containers);

    }

    // if (bottomVideoItemIndex - this.currentVideoIndex > 20) {
    //   const topVideoItemsList = this.videoItems.slice(bottomVideoItemIndex - this.bufferSize, bottomVideoItemIndex);
    //   const containers = topVideoItemsList.reduce((acc, videoItem) => [...acc, videoItem.destroy()], []);
    //
    //   documentFragment.replaceChildren(...containers);
    // }

    documentFragment = null;
  }

  trimDestroyedVideoItems() {
    return this.videoItems.reduce((acc, videoItem) => {
      if (videoItem.destroyed) {
         if (acc.maintainedList.length > 0) {
           acc.topDestroyedList.push(videoItem);
         } else {
           acc.bottomDestroyedList.push(videoItem);
         }
      } else {
        acc.maintainedList.push(videoItem);
      }

      return acc;
    }, { topDestroyedList: [], bottomDestroyedList: [], maintainedList: []  });
  }
}

export default VideoController;
