var tabData = {};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'getUrls') {
    var urls = Object.values(tabData).map(function(data) {
      return {
        url: data.url,
        startTime: data.startTime,
        endTime: data.endTime
      };
    });

    sendResponse({ urls: urls });
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    var url = tab.url;

    if (url && url.startsWith('http')) { // Check for valid URLs
      if (!tabData.hasOwnProperty(tabId)) {
        tabData[tabId] = {
          url: url,
          startTime: Date.now(),
          endTime: null
        };
      } else {
        tabData[tabId].endTime = null; // Reset the endTime when the tab is updated
      }

      console.log('Updated tab data:', tabData[tabId]);

      chrome.storage.local.set({ tabData: tabData }, function() {
        console.log('Tab data stored successfully');

        
        
      });
    }
  }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  var tabId = activeInfo.tabId;

  chrome.tabs.get(tabId, function(tab) {
    var url = tab.url;

    if (url && url.startsWith('http')) { // Check for valid URLs
      if (!tabData.hasOwnProperty(tabId)) {
        tabData[tabId] = {
          url: url,
          startTime: Date.now(),
          endTime: null
        };
      } else if (tabData[tabId].endTime !== null) {
        // Tab is reactivated after being closed, maintain the previous startTime
        var currentTime = Date.now();
        var duration = currentTime - tabData[tabId].endTime;
        tabData[tabId].startTime += duration;
        tabData[tabId].endTime = null;
      }
    }
  });
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if (tabData.hasOwnProperty(tabId)) {
    tabData[tabId].endTime = Date.now(); // Set the endTime when the tab is closed
  }
});