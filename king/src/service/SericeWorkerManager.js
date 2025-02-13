import { useEffect } from 'react';

const SericeWorkerManager = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker
          .register('/firebase-messaging-sw.js')
          .then(function (registration) {
            console.log('service worker scope 등록', registration.scope);
          })
          .catch(function (err) {
            console.error(err);
          });
      });
    }
  }, []);

  return null;
};

export default SericeWorkerManager;
