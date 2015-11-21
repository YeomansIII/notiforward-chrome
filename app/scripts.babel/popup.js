'use strict';

Firebase.enableLogging(true);
var f = new Firebase('https://chrome-sample.firebaseio-demo.com/');

f.transaction(function(curr) {
  if (isNaN(parseFloat(curr))) {
    return 1; // initialize to 1.
  } else {
    return curr + 1; // increment.
  }
}, function() {
  // Once the transaction has completed, update the UI (and watch for updates).
  f.on('value', function(s) {
    document.getElementById('contents').innerHTML = s.val();
  });
});

var bgPage = chrome.extension.getBackgroundPage();
$('#set-auth').click(function() {
  bgPage.showNotif('basic', '/icons/icon128.png', 'This Is A Notification', 'This is a message', function() {
    console.log('Succesful notification');
  });
});
