'use strict';

//Firebase.enableLogging(true);

var bgPage = chrome.extension.getBackgroundPage();
var ref = bgPage.ref;
var userRef;

var $settingsPopup = $('.settings-popup');
var $notifPopup = $('.notif-popup');
var $ignoredPopup = $('.ignored-popup');


$('#settings-nav').click(function() {
  $notifPopup.hide();
  $ignoredPopup.hide();
  $settingsPopup.show();
});
$('#notif-nav').click(function() {
  if (ref !== null) {
    $ignoredPopup.hide();
    $settingsPopup.hide();
    $notifPopup.show();
  }
});
$('#ignored-nav').click(function() {
  if (ref !== null) {
    $settingsPopup.hide();
    $notifPopup.hide();
    $ignoredPopup.show();
  }
});

if (ref === null || ref.getAuth() === null) {
  $notifPopup.hide();
  $ignoredPopup.hide();
  $settingsPopup.show();
} else {
  console.log('Ref working');
  userRef = ref.child(ref.getAuth().uid);
  userRef.child('notifications').once('value', function(dataSnapshot) {
    console.log('Notifications Snapshot returned');
    var $notifCards = $('.notif-cards').html('');
    dataSnapshot.forEach(function(childSnapshot) {
      console.log('Notifications for each');
      $notifCards.append($(document.createElement('div'))
        .addClass('card blue-grey darken-1')
        .append($(document.createElement('div'))
          .addClass('card-content white-text')
          .append($(document.createElement('span'))
            .addClass('card-title')
            .html(childSnapshot.child('title').val()))
          .append($(document.createElement('p'))
            .html(childSnapshot.child('text').val())))
        .append($(document.createElement('div'))
          .addClass('card-action')
          .append($(document.createElement('a'))
            .html('Dismiss')
            .addClass('dismess-card-action')
            .data('key', childSnapshot.key()))
          .append($(document.createElement('a'))
            .html('Ignore from this app')
            .addClass('ignore-app-card-action')
            .data('key', childSnapshot.key()))));
    });
  });
  userRef.child('ignored_apps').once('value', function(dataSnapshot) {
    console.log('Notifications Snapshot returned');
    var $ignoredCards = $('.ignored-cards').html('');
    dataSnapshot.forEach(function(childSnapshot) {
      console.log('Notifications for each');
      $ignoredCards.append($(document.createElement('div'))
        .addClass('card blue-grey darken-1')
        .append($(document.createElement('div'))
          .addClass('card-content white-text')
          .append($(document.createElement('span'))
            .addClass('card-title')
            .html(childSnapshot.key())))
        .append($(document.createElement('div'))
          .addClass('card-action')
          .append($(document.createElement('a'))
            .html('Allow App')
            .addClass('allow-app-card-action')
            .data('key', childSnapshot.key()))));
    });
  });
  $('.dismess-card-action').click(function(e) {
    var $temp = $(e.target);
    userRef.child('notifications/' + $temp.data('key')).remove();
    $temp.closest('.card').hide();
  });
  $('.ignore-app-card-action').click(function(e) {
    var $temp = $(e.target);
    userRef.child('notifications/' + $temp.data('key')).once('value', function(dataSnapshot) {
      userRef.child('ignored_apps/' + dataSnapshot.child('package').val()).set(true);
      $temp.closest('.card').hide();
    });
  });
  $('.allow-app-card-action').click(function(e) {
    var $temp = $(e.target);
    userRef.child('ignored_apps/' + $temp.data('key')).remove();
    $temp.closest('.card').hide();
  });
}

$('#auth-form').submit(function() {
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
  chrome.storage.sync.set(storages, function() {
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
$('#unset-unauth').click(function() {
  bgPage.unAuthenticate();
});
//# sourceMappingURL=popup.js.map
