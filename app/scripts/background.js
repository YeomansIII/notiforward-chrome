'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({
  text: '\'Allo'
});

// function showNotif(type, iconUrl, title, message, callback) {
//   var options = {
//     'type': type,
//     'iconUrl': iconUrl,
//     'title': title,
//     'message': message
//   };
//   chrome.notifications.create(options, callback);
// }
//# sourceMappingURL=background.js.map
