class LoaderController {

  template;
  videoViewport;
  loaderElement;

  constructor(videoViewport, loaderId) {
    this.template = document.querySelector(`#${loaderId}`);
    this.videoViewport = videoViewport;
  }

  showLoader() {
    if (this.loaderElement) {
      this.hideLoader();
    }

    this.loaderElement = this.getLoader();
    this.videoViewport.appendChild(this.loaderElement);
  }

  hideLoader() {
    this.loaderElement.remove();
    this.loaderElement = null;
  }

  getLoader() {
    return this.template.content.cloneNode(true).firstElementChild;
  }
}

export default LoaderController;