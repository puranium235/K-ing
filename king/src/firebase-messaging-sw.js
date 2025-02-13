// Import the functions you need from the SDKs you need
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import { getToken } from 'firebase/messaging';
import { onMessage } from 'firebase/messaging';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
const messaging = getMessaging(app);

async function requestPermission() {
  console.log('권한 요청중...');

  const permission = await Notification.requestPermission();
  if (permission === 'denied') {
    console.log('알림 설정 거부');
    return;
  }

  console.log('알림 권한이 허용됨');

  const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });

  if (token) console.log('token: ', token);
  else console.log('토큰 요청 실패');

  onMessage(messaging, (payload) => {
    console.log('메시지가 도착했습니다.', payload);
  });
}

requestPermission();
