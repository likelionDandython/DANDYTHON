import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { visitApi } from '../../api/services'
import { Icon, type IconName } from '../../components/common/Icon'
import { Screen, TopBar } from '../../components/common/Layout'
import { EmptyState, Status } from '../../components/common/States'
import { ErrorText } from '../../components/common/Form'
import {
  DEFAULT_SETTINGS,
  SETTING_ROWS,
  dayGroup,
  notificationApi,
  notificationTime,
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
}

const GROUPS = ['오늘', '어제', '이전'] as const

/** 알림 목록 — /guardian/notifications (요청자) */
export function NotificationList() {
  const navigate = useNavigate()
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
    if (!n.visitId) return
    // 알림에는 visitId 만 있어서, 동행 현황 화면에 필요한 requestId 를 찾아서 이동해요
    const visit = await action.run(() => visitApi.get(n.visitId as number))
    if (visit) navigate(`/guardian/live?requestId=${visit.requestId}`)
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
        <EmptyState title="아직 알림이 없어요" desc="동행 소식이 생기면 여기에 모아 보여 드려요." />
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

/** 알림 설정 — /guardian/notifications/settings (MY 에서 들어와요) */
export function NotificationSettingsScreen() {
  const settings = useApi(() => notificationApi.getSettings(), [])
  const save = useAction()
  const [values, setValues] = useState<NotificationSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    if (settings.data) setValues(settings.data)
  }, [settings.data])

  // 스위치를 누르면 바로 저장하고, 실패하면 이전 값으로 되돌려요
  const change = async (key: keyof NotificationSettings, next: boolean) => {
    const before = values
    const after = { ...values, [key]: next }
    setValues(after)
    const ok = await save.run(() => notificationApi.saveSettings(after))
    if (ok === undefined) setValues(before)
  }

  return (
    <Screen bodyStyle={{ gap: 16 }}>
      <TopBar title="알림 설정" />
      <Status loading={settings.loading} error={settings.error} onRetry={settings.reload} />
      {!settings.loading && !settings.error && (
        <>
          <section
            className="row"
            style={{ gap: 12, alignItems: 'flex-start', background: 'var(--brand-primary-soft)', borderRadius: 22, padding: '16px 18px' }}
          >
            <span
              className="row"
              style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', background: '#fff', color: 'var(--brand-primary)', justifyContent: 'center' }}
            >
              <Icon name="bell" size={20} />
            </span>
            <div className="col" style={{ gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>동행 소식을 알려 드려요</span>
              <span className="t-sub">받고 싶은 소식만 골라 둘 수 있어요. 알림은 앱 안 목록에서도 다시 볼 수 있어요.</span>
            </div>
          </section>
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
