const TAB_INFO = {
  tabId: null,
};

const showVideosList = (videos) => {
  const videosList = document.querySelector('.videos-list');

  videos.forEach((video) => {
    const item = document.createElement('li');
    item.classList.add('valid');

    const thumbnail = document.createElement('img');
    thumbnail.src = video.thumbnail;

    const itemText = document.createElement('p');

    item.onclick = () => {
      chrome.tabs.sendMessage(TAB_INFO.tabId, {
        ...video,
        message: 'ezpip:request_pip',
      });
    };
    itemText.innerHTML = `Video ${video.index}`;

    item.appendChild(thumbnail);
    item.appendChild(itemText);
    videosList.appendChild(item);
  });
};

const showEmptyMessage = () => {
  const videosList = document.querySelector('.videos-list');
  const item = document.createElement('li');
  const msg = document.createElement('p');

  msg.innerHTML = 'No video available in this tab.';

  item.appendChild(msg);
  videosList.appendChild(item);
}

const consoleLog = (msg) => {
  const errorEl = document.querySelector('.console');

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
