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
      chrome.tabs.sendMessage(TAB_INFO.tabId, {
        ...video,
        message: 'ezpip:request_pip',
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
        TAB_INFO.tabId = tabs[0].id;

        const { videos } = await chrome.tabs.sendMessage(TAB_INFO.tabId, {
          message: 'ezpip:get_videos',
        });

        if (videos) {
          showVideosList(videos);
        } else {
          showEmptyMessage();
          consoleLog();
        }
      } catch (err) {
        showEmptyMessage();
        consoleLog(err.toString());
      }
    }
  );
});
