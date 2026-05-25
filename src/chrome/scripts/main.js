const TAB_INFO = {
  tabId: null,
};

const showVideosList = (videos) => {
  const videosList = document.querySelector('.main__videos-list');

  videos.forEach((video) => {
    const item = document.createElement('li');
    item.classList.add('main__videos-list__valid');

    const thumbnail = document.createElement('img');
    thumbnail.src = video.thumbnail;
    item.appendChild(thumbnail);

    const itemText = document.createElement('p');
    itemText.innerHTML = `Video ${video.index}<br/><i>${video.label.slice(0, 7)}...</i>`;
    itemText.setAttribute('aria-label', video.label);
    itemText.setAttribute('title', video.label);
    item.appendChild(itemText);

    item.onclick = () => {
      chrome.scripting.executeScript({
        target: { tabId: TAB_INFO.tabId },
        func: togglePiP,
        args: [video.index],
      });
    };

    videosList.appendChild(item);
  });
};

const showEmptyMessage = () => {
  const videosList = document.querySelector('.main__videos-list');

  const item = document.createElement('li');
  item.classList.add('main__videos-list__invalid');

  const msg = document.createElement('p');

  msg.innerHTML = 'No video available in this tab.';

  item.appendChild(msg);
  videosList.appendChild(item);
}

const consoleLog = (msg) => {
  const errorEl = document.querySelector('.footer__console');

  if (msg.trim() === 'undefined' || msg.trim() === 'null') {
    errorEl.innerHTML = '';
    return;
  }

  errorEl.innerHTML = msg;
};

window.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    async (tabs) => {
      try {
        const tabId = tabs[0].id;
        TAB_INFO.tabId = tabId;

        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: scanForVideos,
        });

        const videos = results?.[0]?.result;

        if (videos && videos.length > 0) {
          showVideosList(videos);
        } else {
          showEmptyMessage();
        }
      } catch (err) {
        showEmptyMessage();
        consoleLog(err.toString());
      }
    }
  );
});

function scanForVideos() {
  const videos = document.querySelectorAll('video');

  return Array.from(videos)
    .map((video, index) => {
      const thumbnail = captureVideoFrame(video);

      if (typeof video.duration === 'number' && thumbnail !== 'data:,') {
        return {
          index,
          src: video.src || video.currentSrc,
          label: resolveVideoLabel(video, index),
          active: document.pictureInPictureElement === video,
          thumbnail,
        };
      }

      return null;
    })
    .filter(Boolean);

  function captureVideoFrame(videoElement, format = 'image/png', quality = 0.92) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL(format, quality);
  }

  function resolveVideoLabel(video, index) {
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

    return `Video ${index}`;
  }
}

function togglePiP(index) {
  const videos = document.querySelectorAll('video');

  if (videos && videos.length > index) {
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
