import VideoController from './video/video-controller.js';
import VideoDispenser from './video/video-dispenser.js';
import Scheduler from './utils/scheduler.js';
import LoaderController from './loader/loader-controller.js';
import PlayList from './play-list/play-list.js';
import PlayListControls from './play-list/play-list-controls.js';

const VIDEO_CONTROLLER_CONFIG = {
  bufferSize: 20,
  triggerSize: 5,
  garbageCollector: { triggerSize: 30, removeSize: 20 }
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const root = document.querySelector('.video-viewport');
    const template = document.querySelector('#videoContainerTemplate');
    const videoDispenser = new VideoDispenser();
    const scheduler = new Scheduler(root);
    const loaderController = new LoaderController(root, 'loader');
    const playList = new PlayList([]);
    const playListControls = new PlayListControls(root, playList);

    const videoController = new VideoController(
      root,
      videoDispenser,
      loaderController,
      playList,
      playListControls,
      scheduler,
      template,
      VIDEO_CONTROLLER_CONFIG,
    );

    videoController.init();
  },
  { once: true },
);
