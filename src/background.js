// Show option on install
chrome.runtime.onInstalled.addListener(function (){
  chrome.tabs.create({url:chrome.extension.getURL("options.html")},function(){})
});