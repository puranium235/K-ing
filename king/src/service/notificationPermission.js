import { getToken } from 'firebase/messaging';

import SericeWorkerManager from './SericeWorkerManager';

export async function handleAllowNotification() {
  SericeWorkerManager();

  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        console.log('token: ', token);
        //서버로 토큰을 전송하는 로직
        // sendTokenToServer(token);
      } else {
        alert('토큰 등록 싪패');
      }
    } else if (permission === 'denied') {
      alert('웹 푸시 권한 거부');
    }
  } catch (error) {
    console.error(error);
  }
}
