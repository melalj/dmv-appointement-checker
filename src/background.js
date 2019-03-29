var triggerTimeout;

var defaultCheck = 30000; // 30 sec

var checkTriggerSale = function() {
  chrome.storage.sync.get(['url', 'enabled', 'timestamp'], function(options) {
    var officialSaleTimestamp = Number(options.timestamp || 1522263600000);
    clearTimeout(triggerTimeout);
    var checkedTimestampName = 'opened-sale-' + officialSaleTimestamp;
    console.log('checkTriggerSale officialSaleTime ', new Date(officialSaleTimestamp).toLocaleString(),
      ' now: ', new Date().toLocaleString());
    chrome.storage.sync.get(checkedTimestampName, function (res) {
      if (Date.now() >= officialSaleTimestamp && !res[checkedTimestampName]) {
        console.log('main sale page opened');
        chrome.tabs.create({url: options.url + '&timestamp=' + Date.now()},function(){});
        var saveOpts = {};
        saveOpts[checkedTimestampName] = true;
        saveOpts.refreshTimes = 0;
        chrome.storage.sync.set(saveOpts, function (res) {});
      } else {
        var nextCheck = defaultCheck;
        var timeToSale = officialSaleTimestamp - Date.now();
        if (timeToSale < defaultCheck) {
          nextCheck = officialSaleTimestamp - Date.now();
        }
        if (timeToSale > 0) {
          console.log('next check in:', nextCheck, 'ms - ', new Date(Date.now() + nextCheck).toLocaleString());
          triggerTimeout = window.setTimeout(function() {
            checkTriggerSale();
          }, nextCheck);
        } else {
          console.log('main sale already passed and page opened!');
        }
        
      }
    });
  });
}

chrome.runtime.onInstalled.addListener(function (){
  chrome.tabs.create({url:chrome.extension.getURL("options.html")},function(){})
});

checkTriggerSale();