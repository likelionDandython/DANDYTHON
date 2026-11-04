/**
 * 알림 API (BE 답변 11/4 기준). 기존 api/services.ts, api/types.ts 는 건드리지 않고 여기에 따로 둬요.
 * 서버가 아직 배포되지 않았다면 호출은 실패하고, 화면은 오류 안내를 보여줘요.
 */
import { http } from '../api/client'
import { isPushConfigured } from '../push/push'

/** 알림 설정 스위치 5개 (기본값은 전부 켜짐) */
export type NotificationSettings = {
  departure: boolean
  arrival: boolean
  treatmentDone: boolean
  homecoming: boolean
  waiting: boolean
}

export type NotificationItem = {
  notificationId: number
  /** 예시에는 ARRIVAL 만 있어요. 나머지 값은 BE 확인 전이라 모르는 값도 받아줘요. */
  type: string
  message: string
  visitId: number | null
  read: boolean
  createdAt: string
}

export type NotificationList = {
  unreadCount: number
  notifications: NotificationItem[]
}

export const notificationApi = {
  list: () => http.get<NotificationList>('/notifications'),
  read: (notificationId: number) => http.patch<unknown>(`/notifications/${notificationId}/read`),
  readAll: () => http.patch<unknown>('/notifications/read-all'),
  getSettings: () => http.get<NotificationSettings>('/notifications/settings'),
  saveSettings: (body: NotificationSettings) => http.put<NotificationSettings>('/notifications/settings', body),
}

/** 화면 문구 ↔ 서버 필드. 서버가 알림을 만드는 시점(BE 답변 표)과 같아요. */
export const SETTING_ROWS: { key: keyof NotificationSettings; title: string; desc: string }[] = [
  { key: 'departure', title: '출발', desc: '봉사자를 만나 출발했을 때' },
  { key: 'arrival', title: '도착', desc: '병원에서 접수를 마쳤을 때' },
  { key: 'treatmentDone', title: '진료 종료', desc: '진료·검사가 끝났을 때' },
  { key: 'homecoming', title: '귀가', desc: '집까지 배웅을 마쳤을 때' },
  { key: 'waiting', title: '대기 소식', desc: '수납·약 수령 등 나머지 단계를 마쳤을 때' },
]

export const DEFAULT_SETTINGS: NotificationSettings = {
  departure: true,
  arrival: true,
  treatmentDone: true,
  homecoming: true,
  waiting: true,
}

/**
 * 알림 종류 → 작은 제목과 색.
 * type 값은 BE 확인 전이에요. ARRIVAL 만 확정이고, 나머지는 추측값이라 틀려도 '소식'으로 보여요.
 */
export const TYPE_META: Record<string, { label: string; tone: 'teal' | 'coral' }> = {
  DEPARTURE: { label: '출발', tone: 'teal' },
  ARRIVAL: { label: '도착', tone: 'coral' },
  TREATMENT_DONE: { label: '진료 종료', tone: 'teal' },
  HOMECOMING: { label: '귀가', tone: 'coral' },
  WAITING: { label: '대기 소식', tone: 'teal' },
}

export function typeMeta(type: string) {
  return TYPE_META[type] ?? { label: '소식', tone: 'teal' as const }
}

/** 오늘 / 어제 / 이전 으로 묶어요 */
export function dayGroup(iso: string, now = new Date()): '오늘' | '어제' | '이전' {
  const d = new Date(iso)
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((startOf(now) - startOf(d)) / 86_400_000)
  if (diff <= 0) return '오늘'
  if (diff === 1) return '어제'
  return '이전'
}

/** 오전 10:21 / 어제 오후 3:12 / 11월 3일 오후 3:12 */
export function notificationTime(iso: string, now = new Date()): string {
  const d = new Date(iso)
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const clock = `${h < 12 ? '오전' : '오후'} ${h % 12 === 0 ? 12 : h % 12}:${m}`
  const g = dayGroup(iso, now)
  if (g === '오늘') return clock
  if (g === '어제') return `어제 ${clock}`
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${clock}`
}

/**
 * 휴대폰 알림(푸시) 상태. 시안의 세 가지 안내와 같아요.
 * - on: 알림이 켜져 있어요
 * - off: 브라우저에서 알림을 막아 뒀어요 (켜는 방법 안내)
 * - preparing: Firebase 설정값(.env)이 없어 앱 안 목록만 되는 상태
 * 2단계에서 FCM 토큰 등록이 붙으면 PUSH_CONNECTED 를 true 로 바꾸세요.
 */
export const PUSH_CONNECTED = isPushConfigured
export type PushState = 'on' | 'off' | 'preparing'

export function pushState(): PushState {
  if (!PUSH_CONNECTED) return 'preparing'
  if (typeof Notification === 'undefined') return 'off'
  return Notification.permission === 'granted' ? 'on' : 'off'
}
