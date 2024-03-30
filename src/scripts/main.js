const TAB_INFO = {
  tabId: null,
};

const showVideosList = (videos) => {
  const videosList = document.querySelector('.videos-list');

  videos.forEach((video) => {
    const item = document.createElement('li');
    const itemButton = document.createElement('button');

    itemButton.onclick = () => {
      chrome.tabs.sendMessage(TAB_INFO.tabId, {
        ...video,
        message: 'easypip:request_pip',
      });
    };
    itemButton.innerHTML = `Video ${video.index}`;

    item.appendChild(itemButton);
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

        const {videos} = await chrome.tabs.sendMessage(TAB_INFO.tabId, {
          message: 'easypip:get_videos',
        });

        if (videos) {
          showVideosList(videos);
        } else {
          showEmptyMessage();
          consoleLog();
        }
      } catch (err) {
        showEmptyMessage();
        consoleLog(err);
      }
    }
  );
});
