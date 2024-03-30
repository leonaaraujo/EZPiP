chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request?.message === 'easypip:get_videos') {
    const videos = document.querySelectorAll('video');

    if (videos) {
      const response = { videos: [] };
      videos.forEach((video, index) => {
        if (typeof video.duration === 'number') {
          response.videos.push({
            index,
            src: video.src || video.currentSrc,
            active: document.pictureInPictureElement === video,
          });
        };
      });
      sendResponse(response);
    }
  }

  if (request?.message === 'easypip:request_pip') {
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
