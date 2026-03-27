import Video from "../video/video-entity.js";

function* createCounter() {
    let start = 0;

    while (true) {
        start++;

        if (start === 10) {
            start = 1;
        }

        yield start;
    }
}

const counter = createCounter();

function mockFetch(from , to) {
    return new Array(to - from)
        .fill('url')
        .map((item, index) => new Video(index + from,`/public/videos/video ${counter.next().value}.MP4`, item + (index + from)));
}

export default mockFetch;