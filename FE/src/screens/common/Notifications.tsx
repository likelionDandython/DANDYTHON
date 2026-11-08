import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestApi, visitApi } from '../../api/services'
import { useAuth } from '../../auth/AuthContext'
import { Icon, type IconName } from '../../components/common/Icon'
import { Screen, TopBar } from '../../components/common/Layout'
import { Status } from '../../components/common/States'
import { ErrorText } from '../../components/common/Form'
import {
  DEFAULT_SETTINGS,
  SETTING_ROWS,
  dayGroup,
  notificationApi,
  notificationTime,
  pushState,
  typeMeta,
  type NotificationItem,
  type NotificationSettings,
} from '../../design/notificationsApi'
import { useAction, useApi } from '../../hooks/useApi'
import '../../design/styles'

const TYPE_ICON: Record<string, IconName> = {
  DEPARTURE: 'play',
  ARRIVAL: 'pin',
  TREATMENT_DONE: 'hospital',
  HOMECOMING: 'home',
  WAITING: 'clock',
  SUMMARY_READY: 'doc',
  VISIT_APPROVED: 'check',
  APPLICATION_RECEIVED: 'users',
  APPLICATION_ACCEPTED: 'check',
  APPLICATION_CLOSED: 'info',
  MATCH_CONFIRMED: 'heart',
  APPLICATION_CANCELED: 'xcircle',
  REQUEST_CANCELED: 'xcircle',
}

const GROUPS = ['오늘', '어제', '이전'] as const

/** 알림 목록 — /guardian/notifications (요청자) */
export function NotificationList() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const list = useApi(() => notificationApi.list(), [])
  const action = useAction()
  // 눌러서 읽음 처리한 것을 바로 화면에 반영해요 (서버 응답을 기다리지 않아요)
  const [readIds, setReadIds] = useState<number[]>([])
  const [allRead, setAllRead] = useState(false)

  const items = list.data?.notifications ?? []
  const isRead = (n: NotificationItem) => n.read || allRead || readIds.includes(n.notificationId)
  const unread = items.filter((n) => !isRead(n)).length

  const open = async (n: NotificationItem) => {
    if (!isRead(n)) {
      setReadIds((ids) => [...ids, n.notificationId])
      notificationApi.read(n.notificationId).catch(() => undefined)
    }
    // 1) 신청 도착·신청 취소 알림 → 요청자의 신청자 보기(수락) 화면으로 이동
    if ((n.type === 'APPLICATION_RECEIVED' || n.type === 'APPLICATION_CANCELED') && n.requestId) {
      navigate(`/guardian/applicants?requestId=${n.requestId}`)
      return
    }
    // 2) 봉사시간 승인 알림 → 봉사자의 확인서 화면으로 이동
    if (n.type === 'VISIT_APPROVED' && n.visitId) {
      navigate(`/volunteer/certificate?visitId=${n.visitId}`)
      return
    }
    // 3) 진료 메모 정리 완료 알림 → 요청자의 진료 결과 리포트(승인) 화면으로 이동
    if (n.type === 'SUMMARY_READY') {
      const reqId = n.requestId ?? (n.visitId ? (await action.run(() => visitApi.get(n.visitId as number)))?.requestId : null)
      if (reqId) navigate(`/guardian/report?requestId=${reqId}`)
      return
    }
    // 4) 동행 확정 알림 → 내가 올린 요청이면 확정 상세(/guardian/confirmed), 봉사자면 수락 완료(/volunteer/accepted)
    if (n.type === 'MATCH_CONFIRMED' && n.requestId) {
      const detail = await action.run(() => requestApi.detail(n.requestId as number))
      if (detail && session && detail.requesterId === session.userId) {
        navigate(`/guardian/confirmed?requestId=${n.requestId}`)
      } else {
        navigate(`/volunteer/accepted?requestId=${n.requestId}`)
      }
      return
    }
    // 5) 그 외 visitId 가 없는 알림(수락/마감/취소 등) → 요청 상세로 이동
    if (!n.visitId) {
      if (n.requestId) navigate(`/volunteer/request-detail?requestId=${n.requestId}`)
      return
    }
    // 6) 동행 단계 알림(출발·도착·진료종료·귀가·대기) → 동행 현황 화면으로 이동
    const reqId = n.requestId ?? (await action.run(() => visitApi.get(n.visitId as number)))?.requestId
    if (reqId) navigate(`/guardian/live?requestId=${reqId}`)
  }

  const markAll = async () => {
    const ok = await action.run(() => notificationApi.readAll())
    if (ok !== undefined) setAllRead(true)
  }

  return (
    <Screen bodyStyle={{ gap: 12 }}>
      <TopBar
        title="알림"
        right={
          <div className="row" style={{ gap: 0 }}>
            <button
              type="button"
              className="t-primary t-bold"
              style={{ minHeight: 48, padding: '0 12px', border: 0, background: 'transparent', fontSize: 15 }}
              onClick={markAll}
              disabled={unread === 0 || action.pending}
            >
              모두 읽음
            </button>
            <button
              type="button"
              className="bell"
              aria-label="알림 설정"
              onClick={() => navigate('/guardian/notifications/settings')}
            >
              <Icon name="gear" size={24} strokeWidth={1.9} />
            </button>
          </div>
        }
      />
      <Status loading={list.loading} error={list.error} onRetry={list.reload} />
      <ErrorText>{action.error}</ErrorText>
      {list.data && items.length === 0 && (
        <div className="notif-empty">
          <span className="notif-empty__icon">
            <Icon name="bell" size={34} />
          </span>
          <span className="t-h2">새 알림이 없어요</span>
          <span className="t-sub">동행 소식이 생기면 여기에 모아 보여드려요.</span>
        </div>
      )}
      {list.data && items.length > 0 && (
        <>
          <p className="t-label t-bold" style={{ margin: '0 4px' }}>
            {unread > 0 ? `안 읽은 알림 ${unread}개` : '모두 읽었어요'}
          </p>
          {GROUPS.map((g) => {
            const rows = items.filter((n) => dayGroup(n.createdAt) === g)
            if (rows.length === 0) return null
            return (
              <section key={g} className="col" style={{ gap: 10 }}>
                <h2 className="notif-group-title">{g}</h2>
                <ul className="notif-list">
                  {rows.map((n) => {
                    const meta = typeMeta(n.type)
                    const read = isRead(n)
                    return (
                      <li key={n.notificationId}>
                        <button type="button" className={`notif ${read ? 'notif--read' : ''}`} onClick={() => open(n)}>
                          <span className={`notif__icon notif__icon--${meta.tone}`}>
                            <Icon name={TYPE_ICON[n.type] ?? 'bell'} size={22} />
                          </span>
                          <span className="notif__body">
                            <span className={`notif__kind notif__kind--${meta.tone}`}>{meta.label}</span>
                            <span className="notif__msg">{n.message}</span>
                            <span className="notif__time">{notificationTime(n.createdAt)}</span>
                          </span>
                          {!read && <span className="notif__dot" role="img" aria-label="읽지 않음" />}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </>
      )}
    </Screen>
  )
}

function NSwitch({ on, onChange, labelledBy, disabled }: { on: boolean; onChange: (v: boolean) => void; labelledBy: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-labelledby={labelledBy}
      disabled={disabled}
      className={`nswitch ${on ? 'nswitch--on' : ''}`}
      onClick={() => onChange(!on)}
    >
      <span className="nswitch__text">{on ? '켜짐' : '꺼짐'}</span>
      <span className="nswitch__knob" />
    </button>
  )
}

const PUSH_TEXT = {
  on: { title: '휴대폰 알림이 켜져 있어요', desc: '동행 소식이 생기면 앱을 열지 않아도 알려 드려요.' },
  off: {
    title: '휴대폰 알림이 꺼져 있어요',
    desc: '브라우저에서 알림을 허용하면 앱을 열지 않아도 알려 드려요. 지금은 앱 안 알림 목록에서만 볼 수 있어요.',
  },
  preparing: { title: '동행 소식을 알려 드려요', desc: '받고 싶은 소식만 골라 둘 수 있어요. 휴대폰 알림은 준비 중이라, 지금은 앱 안 알림 목록에서 볼 수 있어요.' },
} as const

function PushBanner() {
  const state = pushState()
  const t = PUSH_TEXT[state]
  return (
    <section className={`npush npush--${state}`} aria-label="휴대폰 알림 상태">
      <div className="npush__head">
        <span className="npush__icon">
          <Icon name="bell" size={20} />
        </span>
        <div className="col" style={{ gap: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{t.title}</span>
          <span className="t-sub">{t.desc}</span>
        </div>
      </div>
    </section>
  )
}

/** 알림 설정 — /guardian/notifications/settings (MY 에서 들어와요) */
export function NotificationSettingsScreen() {
  const settings = useApi(() => notificationApi.getSettings(), [])
  const save = useAction()
  const [overrides, setOverrides] = useState<Partial<NotificationSettings>>({})
  const values: NotificationSettings = { ...(settings.data ?? DEFAULT_SETTINGS), ...overrides }

  // 스위치를 누르면 바로 저장하고, 실패하면 이전 값으로 되돌려요
  const change = async (key: keyof NotificationSettings, next: boolean) => {
    const before = overrides
    const after = { ...values, [key]: next }
    setOverrides((prev) => ({ ...prev, [key]: next }))
    const ok = await save.run(() => notificationApi.saveSettings(after))
    if (ok === undefined) setOverrides(before)
  }

  return (
    <Screen bodyStyle={{ gap: 16 }}>
      <TopBar title="알림 설정" />
      <Status loading={settings.loading} error={settings.error} onRetry={settings.reload} />
      {!settings.loading && !settings.error && (
        <>
          <PushBanner />
          <section className="card" style={{ padding: '6px 18px' }} aria-labelledby="ns-title">
            <h2 id="ns-title" className="t-label t-bold" style={{ margin: '12px 0 2px' }}>
              이런 소식을 받을게요
            </h2>
            {SETTING_ROWS.map((r) => (
              <div key={r.key} className="nrow">
                <div className="col fill" style={{ gap: 2 }}>
                  <span id={`ns-${r.key}`} style={{ fontSize: 16, fontWeight: 700 }}>
                    {r.title}
                  </span>
                  <span className="t-sub">{r.desc}</span>
                </div>
                <NSwitch on={values[r.key]} labelledBy={`ns-${r.key}`} disabled={save.pending} onChange={(v) => change(r.key, v)} />
              </div>
            ))}
          </section>
          <ErrorText>{save.error}</ErrorText>
        </>
      )}
    </Screen>
  )
}
