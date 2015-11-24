'use strict'

//Firebase.enableLogging(true);

;
var bgPage = chrome.extension.getBackgroundPage();
$('#auth-form').submit(function () {
  //bgPage.showNotif('basic', '/icons/icon128.png', 'This Is A Notification', 'This is a message', function () {
  console.log('Submit form');
  var fDb = $('#firebase-db').val();
  var fUrl = 'https://' + fDb + '.firebaseio.com/';
  var email = $('#firebase-auth-email').val();
  var pass = $('#firebase-auth-password').val();
  var storages = {
    'firebase-db': fDb,
    'firebase-url': fUrl,
    'firebase-email': email
  };
  chrome.storage.sync.set(storages, function () {
    // Notify that we saved.
    console.log('Settings saved');
    console.log(storages);
    bgPage.authenticate(email, pass);
    //   $('#auth-results').html('Succesful Authentication');
    // } else {
    //   $('#auth-results').html('Authentication Error: Try Again');
    // }
  });
  return false;
});
$('#unset-unauth').click(function () {
  bgPage.unAuthenticate();
});
//# sourceMappingURL=popup.js.map
//# sourceMappingURL=popup.js.map
