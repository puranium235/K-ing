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
  apiKey: 'AIzaSyB8p08G09nNNBhhkfMSq7N13w2_m-DDqs4',
  authDomain: 'k-ing-963ce.firebaseapp.com',
  projectId: 'k-ing-963ce',
  storageBucket: 'k-ing-963ce.firebasestorage.app',
  messagingSenderId: '15736758900',
  appId: '1:15736758900:web:3de7509a7a6343c81de721',
  measurementId: 'G-8R193WXWGM',
};

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload.notification);

  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png',
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
    icon: '/logo.png',
    data: {
      click_action: resultData.click_action,
    },
  };

  e.waitUntil(
    self.registration
      .showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log('알림 성공');
      })
      .catch((error) => {
        console.error('알림 실패:', error);
      }),
  );
});

self.addEventListener('notificationclick', function (event) {
  event.preventDefault();

  event.notification.close();

  // 아래의 event.notification.data는 위의 푸시 이벤트를 한 번 거쳐서 전달 받은 options.data에 해당한다.
  const urlToOpen = 'https://i12a507.p.ssafy.io/';

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
