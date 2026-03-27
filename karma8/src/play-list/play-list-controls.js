class PlayListControls {

  videoViewport;
  playList

  constructor(videoViewport, playList) {
    this.videoViewport = videoViewport;
    this.playList = playList;

    this.initPlayPauseListener();
    this.initUpDownButtonsListener();
  }

  initPlayPauseListener() {
    this.videoViewport.addEventListener("click", () => this.playList.getCurrentWithShift()?.togglePlayPause());
  }

  initUpDownButtonsListener() {
    document.querySelector(".controls").addEventListener("click", ({ target }) => {
      if (target.classList.contains("control-up")) {
        this.playList.getCurrentWithShift(-1)?.scrollToItem();
      } else if (target.classList.contains("control-down")) {
        this.playList.getCurrentWithShift(1)?.scrollToItem();
      }
    });
  }
}

export default PlayListControls;