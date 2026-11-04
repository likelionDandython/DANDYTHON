/* FCM 백그라운드 푸시를 띄우는 서비스 워커. 설정값은 등록 주소의 쿼리로 받아요 (src/push/push.ts) */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

const params = new URL(self.location.href).searchParams
firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
})

const messaging = firebase.messaging()

// 서버가 notification 필드를 보내면 브라우저가 알아서 띄워요. data 만 오는 경우에만 직접 띄워요.
messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return
  const d = payload.data || {}
  self.registration.showNotification(d.title || '같이가요', {
    body: d.message || d.body || '새 소식이 있어요',
    icon: '/favicon.svg',
    data: d,
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/guardian/notifications'))
})
