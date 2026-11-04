/**
 * FCM 웹 푸시 (BE 답변 11/4): 로그인 후 권한 요청 → FCM 토큰 발급 → 서버에 등록, 로그아웃 때 삭제.
 * Firebase 설정값(VITE_FIREBASE_*, VITE_FIREBASE_VAPID_KEY)은 BE 가 공유해 주면 FE/.env 에 넣어요.
 * 설정값이 없으면 푸시는 꺼진 채로 앱 안 알림 목록만 동작해요.
 */
import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, isSupported } from 'firebase/messaging'
import { http } from '../api/client'

const env = import.meta.env as Record<string, string | undefined>

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}
const VAPID_KEY = env.VITE_FIREBASE_VAPID_KEY

/** 푸시에 필요한 설정값이 다 들어 있는지 */
export const isPushConfigured = Object.values(config).every(Boolean) && !!VAPID_KEY

const TOKEN_KEY = 'hospital-companion.push-token'

/** 서비스 워커는 환경변수를 못 읽어서, 주소 뒤에 설정값을 붙여 넘겨요 */
function swUrl() {
  const q = new URLSearchParams(config as Record<string, string>)
  return `/firebase-messaging-sw.js?${q.toString()}`
}

/** 알림 권한을 받고 FCM 토큰을 서버에 등록해요. 어디서 실패해도 앱 동작에는 영향이 없어요 */
export async function registerPush(): Promise<void> {
  try {
    if (!isPushConfigured || typeof Notification === 'undefined' || !('serviceWorker' in navigator)) return
    if (!(await isSupported())) return
    if (Notification.permission === 'default') await Notification.requestPermission()
    if (Notification.permission !== 'granted') return

    const registration = await navigator.serviceWorker.register(swUrl())
    const app = getApps()[0] ?? initializeApp(config)
    const token = await getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })
    if (!token) return
    if (localStorage.getItem(TOKEN_KEY) === token) return
    await http.post('/notifications/push-token', { token })
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* 푸시는 보조 기능이라 조용히 넘어가요 */
  }
}

/** 로그아웃 때: 서버에서 이 기기 토큰을 지워요 (토큰이 아직 살아 있을 때 불러야 해요) */
export async function unregisterPush(): Promise<void> {
  try {
    if (!localStorage.getItem(TOKEN_KEY)) return
    localStorage.removeItem(TOKEN_KEY)
    await http.delete('/notifications/push-token')
  } catch {
    /* noop */
  }
}
