
import VideoController from './video-controller.js';
import VideoDispenser from './video-dispenser.js';

setTimeout(() => test(), 10);

async function test() {
  const root = document.querySelector('.video-viewport');
  const template = document.querySelector('#videoContainerTemplate');

  const videoController = new VideoController(root, new VideoDispenser(), template);
  await videoController.init();
}
