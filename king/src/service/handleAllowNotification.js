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
    } else if (permission === 'denied') {
      alert('Notification permission denied');
    }
  } catch (error) {
    console.error('Error in notification permission:', error);
  }

  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
    };

    if (Notification.permission === 'granted') {
      new Notification(notificationTitle, notificationOptions);
    }
  });
};
