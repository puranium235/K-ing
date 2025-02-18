import { getToken, onMessage } from 'firebase/messaging';

import { postFcmToken } from '../lib/fcm';
import { initFirebase } from './initFirebase';

export const handleAllowNotification = async () => {
  const messaging = initFirebase();

  try {
    console.log('권한 요청중...');
    const permission = await Notification.requestPermission();
    if (permission === 'denied') {
      console.log('알림 설정 거부');
      return;
    }

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        console.log('FCM Token:', token);
        localStorage.setItem('fcmToken', token);
        postFcmToken(token);
      } else {
        alert('Failed to register FCM token');
      }
    }
  } catch (error) {
    console.error('Error in notification permission:', error);
  }

  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);

    const notificationTitle = payload.notification?.title || '알림';
    const notificationOptions = {
      body: payload.notification?.body || '',
      // icon: payload.notification?.icon,
      data: { link: payload.fcmOptions?.link || '/' },
    };

    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(notificationTitle, notificationOptions);

        notification.onclick = function (event) {
          event.preventDefault();
          window.open(notificationOptions.data.link, '_blank');
        };
      } catch (error) {
        console.error('알림 생성 중 오류 발생:', error);
      }
    } else {
      console.warn('알림 권한이 허용되지 않았습니다.');
    }
  });
};
