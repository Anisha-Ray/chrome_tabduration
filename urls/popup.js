// Send a message to the background script to retrieve the recorded data
chrome.runtime.sendMessage({ action: 'getUrls' }, function(response) {
  var urls = Array.isArray(response && response.urls) ? response.urls : [];
  displayUrls(urls);
});

function displayUrls(urls) {
  var urlList = document.getElementById('urlList');
  urlList.innerHTML = ''; // Clear the previous URL list

  if (Array.isArray(urls) && urls.length > 0) {
    var groupedUrls = groupUrlsByDomain(urls);
    Object.keys(groupedUrls).forEach(function(domain) {
      var listItem = document.createElement('li');
      var link = document.createElement('a');
      link.href = domain;
      link.textContent = domain + ' (' + formatDuration(calculateTotalDuration(groupedUrls[domain])) + ')';
      link.addEventListener('click', function(event) {
        event.preventDefault();
        chrome.tabs.create({ url: domain });
      });
      listItem.appendChild(link);
      urlList.appendChild(listItem);
    });
  } else {
    var listItem = document.createElement('li');
    listItem.textContent = 'No URLs found.';
    urlList.appendChild(listItem);
  }
}

function groupUrlsByDomain(urls) {
  var groupedUrls = {};
  urls.forEach(function(urlData) {
    var domain = extractDomain(urlData.url);
    if (groupedUrls.hasOwnProperty(domain)) {
      groupedUrls[domain].push(urlData);
    } else {
      groupedUrls[domain] = [urlData];
    }
  });
  return groupedUrls;
}

function calculateTotalDuration(urlDataArray) {
  var totalDuration = 0;
  urlDataArray.forEach(function(urlData) {
    var duration = calculateDuration(urlData.startTime, urlData.endTime);
    totalDuration += duration;
  });
  return totalDuration;
}

function calculateDuration(startTime, endTime) {
  if (endTime === null) {
    // Handle the case when the tab is still active
    var currentTime = Date.now();
    return currentTime - startTime;
  } else {
    // Handle the case when the tab is closed
    return endTime - startTime;
  }
}

function formatDuration(duration) {
  var seconds = Math.floor(duration / 1000) % 60;
  var minutes = Math.floor(duration / (1000 * 60)) % 60;
  var hours = Math.floor(duration / (1000 * 60 * 60));

  var formattedDuration = '';
  if (hours > 0) {
    formattedDuration += hours + 'h ';
  }
  if (minutes > 0) {
    formattedDuration += minutes + 'm ';
  }
  if (seconds > 0) {
    formattedDuration += seconds + 's';
  }
  return formattedDuration;
}

