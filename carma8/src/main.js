import VideoController from './video/video-controller.js';
import VideoDispenser from './video/video-dispenser.js';

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

    const videoController = new VideoController(
      root,
      new VideoDispenser(),
      template,
      VIDEO_CONTROLLER_CONFIG,
    );

    videoController.init();
  },
  { once: true },
);
