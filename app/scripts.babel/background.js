 /* exported authenticate, unAuthenticate */
 'use strict';

 var ref, userRef, clientID, senderID = '45203521863';

 Firebase.enableLogging(false);

 function getRandomToken() {
   // E.g. 8 * 32 = 256 bits token
   var randomPool = new Uint8Array(32);
   crypto.getRandomValues(randomPool);
   var hex = '';
   for (var i = 0; i < randomPool.length; ++i) {
     hex += randomPool[i].toString(16);
   }
   // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
   var token = hex.substring(0, 16);
   console.log(token);
   return token;
 }

 function setGCMRegId() {
   chrome.gcm.register([senderID], function(registrationId) {
     userRef.child('/devices/' + clientID + '/gcm_id').set(registrationId);
     userRef.child('/devices').once('value', function(dataSnapshot) {
       dataSnapshot.forEach(function(childSnapshot) {
         var regId = childSnapshot.child('gcm_id').val();
         var messageId = getRandomToken();
         if (regId !== clientID) {
           var message = {
             'destinationId': regId,
             'messageId': messageId,
             'data': {
               'action': 'test'
             }
           };
           chrome.gcm.send(message, function() {

           });
         }
       });
     });
   });
 }

 function useToken(userId) {
   clientID = userId;
   setGCMRegId();
 }

 function setClientId() {
   chrome.storage.sync.get('clientid', function(items) {
     var clientid = items.clientid;
     if (clientid) {
       useToken(clientid);
     } else {
       clientid = getRandomToken();
       chrome.storage.sync.set({
         clientid: clientid
       }, function() {
         useToken(clientid);
       });
     }
   });
 }

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

 function setUpNotificationOnClicks() {
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
         chrome.notifications.clear(notificationId);
       } else if (buttonIndex === 1) {
         userRef.child('notifications/' + notifObj.fbId).once('value', function(dataSnapshot) {
           userRef.child('ignored_apps/' + dataSnapshot.child('package').val()).set(true);
           chrome.notifications.clear(notificationId);
         });
       }
     }
   });
 }

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

 function setUp() {
   setClientId();
   setUpNotificationOnClicks();
   setUpFirebaseListen();
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
       setUp();
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
       setUp();
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
