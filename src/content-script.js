var optionList = ['url', 'enabled'];
var triggerTimes = [0, 50, 500, 1000, 5000, 10000];

var checkIfOpen = function(){
  chrome.storage.sync.get(['url', 'enabled', 'timestamp', 'refreshTimes'], function(options) {
    var officialSaleTimestamp = Number(options.timestamp || 1522263600000);
    var refreshTimes = Number(options.refreshTimes || 0);

    // Check options
    if (!options.url) return;
    if (!options.enabled) return;

    // Check if bot loaded
    if (document.querySelector('#eventWrapper > section.selection-rsv-ga > footer > div > h2')) {
      chrome.storage.sync.set({refreshTimes: refreshTimes + 1}, function () {
        var nextRefreshTime = (refreshTimes >= triggerTimes.length) ? 10000 : triggerTimes[refreshTimes];
        console.log('Sale still closed... Next ', refreshTimes, 'th refresh in', nextRefreshTime, 'ms');
        window.setTimeout(function() {
          document.location.href = options.url + '&timestamp=' + Date.now();
        }, nextRefreshTime);
      });
    } else {
      alert('It\'s Open! \\°/');
    }
  });
};

checkIfOpen();
