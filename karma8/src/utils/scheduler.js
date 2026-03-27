class Scheduler {

  videoViewport;
  scheduledCallback;

  constructor(videoViewport) {
    this.videoViewport = videoViewport;
  }

  executeAfterScrollEnd(callback) {
    this.cancelScheduleActionAfterScroll();
    this.scheduledCallback = () => {
      callback();
      this.scheduledCallback = null;
    };

    this.videoViewport.addEventListener("scrollend", this.scheduledCallback, { once: true });
  }

  cancelScheduleActionAfterScroll() {
    if (this.scheduledCallback) {
      this.videoViewport.removeEventListener("scrollend", this.scheduledCallback);
    }
  }

  isScrollEndScheduled() {
    return !!this.scheduledCallback;
  }
}

export default Scheduler;