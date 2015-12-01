 /* exported authenticate, unAuthenticate */
 'use strict';

 var ref, userRef;

 Firebase.enableLogging(false);

 function showSystemNotif(type, iconUrl, title, message, callback) {
   var notifId = {
     'type': 'system'
   };
   var options = {
     'type': type,
     'iconUrl': iconUrl,
     'title': title,
     'message': message
   };
   chrome.notifications.create(JSON.stringify(notifId), options, callback);
 }

 chrome.notifications.onClicked.addListener(function(notificationId) {
   var notifObj = JSON.parse(notificationId);
   if (notifObj.type === 'device_notif') {
     //userRef.child('notifications/' + notifObj.fbId).remove();
   }
 });

 chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
   var notifObj = JSON.parse(notificationId);
   if (notifObj.type === 'device_notif') {
     if (buttonIndex === 0) {
       userRef.child('notifications/' + notifObj.fbId).remove();
     } else if (buttonIndex === 1) {
       userRef.child('notifications/' + notifObj.fbId).once('value', function(dataSnapshot) {
         userRef.child('ignored_apps/' + dataSnapshot.child('package').val()).set(true);
       });
     }
   }
 });

 function onNewNotification(childSnapshot) {
   console.log(childSnapshot);
   //showNotif('basic', 'images/icon-128.png', childSnapshot.child('title').val(), childSnapshot.child('text').val(), null);
   var notifId = {
     'type': 'device_notif',
     'fbId': childSnapshot.key()
   };
   var title = childSnapshot.child('title').val();
   var text = childSnapshot.child('text').val();
   var options = {
     'type': 'basic',
     'iconUrl': 'images/icon-128.png',
     'title': title !== null ? title : '',
     'message': text !== null ? text : '',
     'buttons': [{
       'title': 'Dismiss'
     }, {
       'title': 'Ignore from this app'
     }]
   };
   chrome.notifications.create(JSON.stringify(notifId), options, null);
 }

 function setUpFirebase(url) {
   console.log(ref);
   console.log(url);
   ref = new Firebase(url);
 }

 function setUpFirebaseListen() {
   if (ref !== undefined) {
     userRef.child('notifications').off('child_added', onNewNotification);
     userRef.child('notifications').on('child_added', onNewNotification);
   }
 }

 chrome.runtime.onInstalled.addListener(details => {
   console.log('previousVersion', details.previousVersion);
 });

 // chrome.browserAction.setBadgeText({
 //   text: 'Notiforward'
 // });

 // chrome.storage.onChanged.addListener(function(changes, namespace) {
 //   for (var key in changes) {
 //     if (key === 'firebase-url') {
 //       setUpFirebase(changes[key].newValue);
 //       if (ref.getAuth() === null) {
 //         showSystemNotif('basic', 'images/icon-128.png', 'Authentication Error', 'Please log into your Firebase DB', null);
 //       } else {
 //         userRef = ref.child(ref.getAuth().uid);
 //         setUpFirebaseListen();
 //       }
 //     }
 //     var storageChange = changes[key];
 //     console.log('Storage key "%s" in namespace "%s" changed. ' +
 //       'Old value was "%s", new value is "%s".',
 //       key,
 //       namespace,
 //       storageChange.oldValue,
 //       storageChange.newValue);
 //   }
 // });

 chrome.storage.sync.get('firebase-url', function(items) {
   console.log('syncing settings');
   if (items['firebase-url'] !== undefined) {
     setUpFirebase(items['firebase-url']);
     if (ref.getAuth() === null || ref.getAuth() === undefined) {
       showSystemNotif('basic', 'images/icon-128.png', 'Authentication Error', 'Please log into your Firebase DB', null);
     } else {
       userRef = ref.child(ref.getAuth().uid);
       setUpFirebaseListen();
     }
   } else {
     showSystemNotif('basic', 'images/icon-128.png', 'Authentication Error', 'Please log into your Firebase DB', null);
   }
 });

 function authenticate(fDb, fUrl, email, pass, $result) {
   ref = new Firebase(fUrl);
   console.log('Authing: ' + ref);
   ref.authWithPassword({
     'email': email,
     'password': pass
   }, function(error, authData) {
     if (error) {
       ref = undefined;
       console.log('Login Failed!', error);
       $result.html('Authentication Failed');
     } else {
       var storages = {
         'firebase-db': fDb,
         'firebase-url': fUrl,
         'firebase-email': email
       };
       console.log('Authenticated successfully with payload:', authData);
       chrome.storage.sync.set(storages, function() {
         // Notify that we saved.
         console.log('Settings saved');
         console.log(storages);
       });
       userRef = ref.child(ref.getAuth().uid);
       showSystemNotif('basic', 'images/icon-128.png', 'Succesful Authentication', 'You will now receive notifications from attatched devices', null);
       $result.html('Successful Authentication');
       setUpFirebaseListen();
     }
   });
 }

 function unAuthenticate(wind) {
   console.log('unauthing');
   ref.unauth();
   ref = undefined;
   userRef = undefined;
   chrome.storage.sync.remove(['firebase-db', 'firebase-url', 'firebase-email'], function() {
     console.log('storage removed');
   });
   showSystemNotif('basic', 'images/icon-128.png', 'Notiforward Unauthenticated', 'You will no longer receive notifications on this device', null);
   wind.close();
 }
