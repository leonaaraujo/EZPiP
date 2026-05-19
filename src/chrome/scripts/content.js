function captureVideoFrame(videoElement, format = 'image/png', quality = 0.92) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL(format, quality);
}

function resolveVideoLabel(video) {
  if (video.title && video.title !== 'undefined') {
    return video.title;
  }

  const ariaLabel = video.getAttribute('aria-label');
  if (ariaLabel && ariaLabel !== 'undefined') {
    return ariaLabel;
  }

  const src = video.src || video.currentSrc;
  if (src) {
    try {
      const url = new URL(src);
      const filename = url.pathname.split('/').pop();
      if (filename) {
        const label = decodeURIComponent(filename);
        if (label && label !== 'undefined') {
          return label;
        }
      }
    } catch (_) { }
  }

  return `Video ${video.index}`;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request?.message === 'ezpip:get_videos') {
    const videos = document.querySelectorAll('video');

    if (videos) {
      const response = { videos: [] };
      videos.forEach((video, index) => {
        const thumbnail = captureVideoFrame(video);

        if (typeof video.duration === 'number' && thumbnail !== 'data:,') {
          response.videos.push({
            index,
            src: video.src || video.currentSrc,
            label: resolveVideoLabel(video),
            active: document.pictureInPictureElement === video,
            thumbnail,
          });
        };
      });
      sendResponse(response);
    }
  }

  if (request?.message === 'ezpip:request_pip') {
    const videos = document.querySelectorAll('video');
    const index = parseInt(request.index);

    if (videos && index !== NaN && videos.length > index) {
      const el = videos[index];
      const active = document.pictureInPictureElement === el;

      if (active) {
        document.exitPictureInPicture();
      } else {
        el.disablePictureInPicture = false;
        el.requestPictureInPicture();
      }
    }
  }
});
