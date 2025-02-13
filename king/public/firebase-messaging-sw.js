importScripts('https://www.gstatic.com/firebasejs/11.3.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.3.1/firebase-messaging-compat.js');

self.addEventListener('install', function (e) {
  console.log('fcm sw install..');
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  console.log('fcm sw activate..');
});

const firebaseConfig = {
  apiKey: 'AIzaSyDcX1ZgeyUE8bnf1gQl6f9FFZCdbvRSX5o',
  authDomain: 'k-ing-bd98c.firebaseapp.com',
  projectId: 'k-ing-bd98c',
  storageBucket: 'k-ing-bd98c.firebasestorage.app',
  messagingSenderId: '773303654760',
  appId: '1:773303654760:web:7ebf6653f9292cda8e9edd',
  measurementId: 'G-B76WWE0B36',
};

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.title;
  const notificationOptions = {
    body: payload.body,
    icon: '/public/logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

//웹 푸시 알림 노출
self.addEventListener('push', function (e) {
  if (!e.data.json()) return;

  const resultData = e.data.json().notification;
  const notificationTitle = resultData.title;
  const notificationOptions = {
    body: resultData.body,
    icon: './logo.png',
    data: {
      click_action: resultData.click_action,
    },
  };

  e.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
});

self.addEventListener('notificationclick', function (event) {
  event.preventDefault();

  event.notification.close();

  // 이동할 url
  // 아래의 event.notification.data는 위의 푸시 이벤트를 한 번 거쳐서 전달 받은 options.data에 해당한다.
  const urlToOpen = event.notification.data.click_action;

  // 클라이언트에 해당 사이트가 열려있는지 체크
  const promiseChain = clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    .then(function (windowClients) {
      let matchingClient = null;

      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url.includes(urlToOpen)) {
          matchingClient = windowClient;
          break;
        }
      }

      // 열려있다면 focus, 아니면 새로 open
      if (matchingClient) {
        return matchingClient.focus();
      }
      return clients.openWindow(urlToOpen);
    });

  event.waitUntil(promiseChain);
});
