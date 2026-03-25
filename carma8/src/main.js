
//mock function
import VideoController from './video-controller.js';
import VideoDispenser from './video-dispenser.js';

setTimeout(() => test(), 10);

async function test() {
  const videoDispenser = init();
  const root = document.querySelector('.video-viewport');
  const template = document.querySelector('#videoContainerTemplate');

  const videoController = new VideoController(root, videoDispenser, template);
  await videoController.init();
}

function init() {
  const MAIN_CONFIG = {
    preload: {
      prev: 2,
      next: 2,
      time: 4000, // seconds
    },
    fetchSize: 15,
    fetchNewWhenLeft: 2,
  }

  return new VideoDispenser(MAIN_CONFIG);
}





