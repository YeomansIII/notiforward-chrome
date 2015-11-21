/* exported authenticate */
'use strict';

var ref;

Firebase.enableLogging(false);

// function showNotif(type, iconUrl, title, message, callback) {
//   var options = {
//     'type': type,
//     'iconUrl': iconUrl,
//     'title': title,
//     'message': message
//   };
//   chrome.notifications.create(options, callback);
// }

chrome.notifications.onClicked.addListener(function (notificationId) {
  ref.child('notifications/' + notificationId).remove();
});

function onNewNotification(childSnapshot) {
  console.log(childSnapshot);
  //showNotif('basic', 'images/icon-128.png', childSnapshot.child('title').val(), childSnapshot.child('text').val(), null);
  var options = {
    'type': 'basic',
    'iconUrl': 'images/icon-128.png',
    'title': childSnapshot.child('title').val(),
    'message': childSnapshot.child('text').val()
  };
  chrome.notifications.create(childSnapshot.key(), options, null);
}

function setUpFirebase(url) {
  console.log(ref);
  if (ref !== undefined) {
    ref.child('notifications').off('child_added', onNewNotification);
  }
  ref = new Firebase(url);
  ref.child('notifications').on('child_added', onNewNotification);
}

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({
  text: 'Notiforward'
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (var key in changes) {
    if (key === 'firebase-url') {
      setUpFirebase(changes[key].newValue);
    }
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' + 'Old value was "%s", new value is "%s".', key, namespace, storageChange.oldValue, storageChange.newValue);
  }
});

chrome.storage.sync.get('firebase-url', function (items) {
  if (items['firebase-url'] !== undefined) {
    setUpFirebase(items['firebase-url']);
  }
});

function authenticate(email, pass) {
  ref.authWithPassword({
    'email': email,
    'password': pass
  }, function (error, authData) {
    if (error) {
      console.log('Login Failed!', error);
    } else {
      console.log('Authenticated successfully with payload:', authData);
      $('#auth-results').html('Authentication Succesful');
    }
  });
}
//# sourceMappingURL=background.js.map
