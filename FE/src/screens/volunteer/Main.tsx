import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { applicationApi, profileApi, requestApi, visitApi } from '../../api/services'
import { APPLICATION_STATUS_LABEL, MEET_PLACE_LABEL, NEED_LABEL, REQUEST_STATUS_LABEL } from '../../api/labels'
import type { MyApplication } from '../../api/types'
import { Button } from '../../components/common/Button'
import { Chip, FilterChips } from '../../components/common/Chip'
import { ErrorText } from '../../components/common/Form'
import { Icon, type IconName } from '../../components/common/Icon'
import { Avatar, Screen, Spacer, TopBar } from '../../components/common/Layout'
import { TabBar, VOLUNTEER_TABS } from '../../components/common/TabBar'
import { RequestCard } from '../../components/volunteer/RequestCard'
import { useAuth } from '../../auth/AuthContext'
import { useAction, useApi } from '../../hooks/useApi'
import { dDay, formatDate, formatDateTime, formatTime, hhmm, minutesToText, todayString, weekLater } from '../../lib/format'

const tabs = <TabBar tabs={VOLUNTEER_TABS} />

function Status({ loading, error }: { loading: boolean; error: string | null }) {
  if (loading) return <p className="t-caption">불러오는 중…</p>
  return <ErrorText>{error}</ErrorText>
}

/** 지금 진행/확정된 내 동행 (가장 가까운 날짜) */
function pickActive(apps: MyApplication[] | null) {
  return (apps ?? [])
    .filter((a) => a.status === 'ACCEPTED' && (a.requestStatus === 'CONFIRMED' || a.requestStatus === 'IN_PROGRESS'))
    .sort((a, b) => `${a.date}${a.meetTime}`.localeCompare(`${b.date}${b.meetTime}`))[0]
}

/** 03 홈 */
export function VolunteerHome() {
  const { session } = useAuth()
  const board = useApi(() => requestApi.board(), [])
  const apps = useApi(() => applicationApi.mine(), [])
  const active = pickActive(apps.data)
  const list = board.data ?? []

  return (
    <Screen footer={tabs} bodyStyle={{ gap: 18 }}>
      <div className="row row--between">
        <div className="col" style={{ gap: 2 }}>
          <span className="t-sub t-medium">안녕하세요, {session?.name}님</span>
          <span className="t-h1">오늘도 함께 걸어요</span>
        </div>
        <Icon name="bell" size={26} />
      </div>

      {session && !session.profileCompleted && (
        <div className="notice">
          <Icon name="id" size={20} />
          프로필을 완성해야 동행을 신청할 수 있어요
        </div>
      )}

      {active && (
        <section
          className="col"
          style={{ gap: 10, padding: 20, borderRadius: 20, background: 'var(--brand-primary)', color: 'var(--text-on-primary)' }}
        >
          <div className="row row--between" style={{ fontSize: 14 }}>
            <span className="t-bold">{dDay(active.date) === 'D-DAY' ? '오늘의 동행' : `다가오는 동행 ${dDay(active.date)}`}</span>
            <span className="t-medium">{formatTime(active.meetTime)} 만남</span>
          </div>
          <span style={{ fontSize: 19, fontWeight: 700 }}>{active.hospitalName}</span>
          <span style={{ fontSize: 14 }}>{formatDate(active.date)}</span>
          <Button variant="secondary" size="sm" to={`/volunteer/progress?visitId=${active.visitId}`}>
            동행 시작하기
          </Button>
        </section>
      )}

      <div className="row row--between" style={{ paddingTop: 4 }}>
        <span className="t-h2">새 동행 요청 {list.length}건</span>
        <Link className="t-sub t-medium" to="/volunteer/requests">
          전체보기
        </Link>
      </div>
      <Status loading={board.loading} error={board.error} />
      {list.slice(0, 2).map((r) => (
        <RequestCard key={r.requestId} request={r} />
      ))}
    </Screen>
  )
}

const FILTERS = ['전체', '이번 주', '휠체어 가능']

/** 04 동행 요청 목록 */
export function VolunteerRequests() {
  const [filter, setFilter] = useState(FILTERS[0])
  const board = useApi(() => requestApi.board(filter === '휠체어 가능' ? { need: 'WHEELCHAIR' } : {}), [filter])
  const limit = weekLater()
  const list = (board.data ?? []).filter((r) => filter !== '이번 주' || (r.date >= todayString() && r.date <= limit))

  return (
    <Screen footer={tabs} bodyStyle={{ gap: 14 }}>
      <div className="row row--between">
        <span className="t-h1">동행 요청</span>
        <Icon name="filter" />
      </div>
      <FilterChips options={FILTERS} onChange={setFilter} />
      <p className="t-caption">모집 중인 동행 요청이에요</p>
      <Status loading={board.loading} error={board.error} />
      {!board.loading && !board.error && list.length === 0 && <p className="t-body">조건에 맞는 요청이 없어요.</p>}
      {list.map((r) => (
        <RequestCard key={r.requestId} request={r} />
      ))}
    </Screen>
  )
}

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
      <Icon name={icon} size={20} color="var(--brand-primary)" />
      <div className="col" style={{ gap: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
        <span className="t-body t-medium">{value}</span>
      </div>
    </div>
  )
}

/** 05 요청 상세 */
export function VolunteerRequestDetail() {
  const [params] = useSearchParams()
  const requestId = Number(params.get('requestId'))
  const detail = useApi(() => requestApi.detail(requestId), [requestId], !!requestId)
  const apply = useAction()
  const [message, setMessage] = useState('')
  const [applied, setApplied] = useState(false)
  const r = detail.data

  const submit = async () => {
    const res = await apply.run(() => applicationApi.apply(requestId, message))
    if (res) setApplied(true)
  }

  return (
    <Screen>
      <TopBar title="동행 요청 상세" />
      {!requestId && <ErrorText>요청을 선택해 주세요. (요청 목록에서 들어와요)</ErrorText>}
      <Status loading={detail.loading} error={detail.error} />
      {r && (
        <>
          <div className="col" style={{ gap: 8, paddingTop: 4 }}>
            <div className="row" style={{ gap: 6 }}>
              <Chip tone="orange">{dDay(r.date)}</Chip>
              <Chip tone="gray">{REQUEST_STATUS_LABEL[r.status]}</Chip>
            </div>
            <h1 className="t-h1">
              {r.hospital.name} · {r.department}
            </h1>
          </div>
          <div className="card" style={{ gap: 14 }}>
            <InfoRow icon="calendar" label="일시" value={`${formatDateTime(r.date, r.meetTime)} 만남`} />
            <InfoRow icon="pin" label="만나는 곳" value={`${MEET_PLACE_LABEL[r.meetPlaceType]} · ${r.meetAddress ?? r.senior.region}`} />
            <InfoRow icon="hospital" label="병원" value={`${r.hospital.name} ${r.department}`} />
          </div>
          <div className="card" style={{ gap: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>
              {r.senior.name} 어르신 ({r.senior.age}세)
            </span>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {r.needs.map((n) => (
                <Chip key={n}>{NEED_LABEL[n]}</Chip>
              ))}
            </div>
            {r.notes && <p className="t-sub">“{r.notes}” — 보호자 요청</p>}
            {r.guardian && (
              <p className="t-sub">
                보호자 {r.guardian.name} · {r.guardian.phone}
              </p>
            )}
          </div>
          {r.meetAddress === null && (
            <div className="notice">
              <Icon name="lock" size={20} />
              동행이 확정되면 상세 주소와 연락처가 공개돼요
            </div>
          )}
          {r.status === 'RECRUITING' && !applied && (
            <label className="field">
              <span className="t-label">보호자에게 전할 말 (선택)</span>
              <textarea className="textarea" value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
          )}
          <ErrorText>{apply.error}</ErrorText>
          {applied && <p className="t-caption t-accent t-medium">신청했어요. 보호자가 수락하면 확정돼요.</p>}
          <Spacer />
          <Button onClick={submit} disabled={apply.pending || applied || r.status !== 'RECRUITING'}>
            {applied ? '신청 완료' : r.status !== 'RECRUITING' ? '모집이 끝났어요' : apply.pending ? '신청 중…' : '이 동행 맡을게요'}
          </Button>
        </>
      )}
    </Screen>
  )
}

/** 06 수락 완료 */
export function VolunteerAccepted() {
  const [params] = useSearchParams()
  const requestId = Number(params.get('requestId'))
  const detail = useApi(() => requestApi.detail(requestId), [requestId], !!requestId)
  const r = detail.data
  const rows: [string, string][] = r
    ? [
        ['일시', `${formatDateTime(r.date, r.meetTime)} 만남`],
        ['어르신', `${r.senior.name} 어르신`],
        ['병원', `${r.hospital.name} ${r.department}`],
        ['보호자 연락처', r.guardian?.phone ?? '확정 후 공개'],
      ]
    : []
  return (
    <Screen bodyStyle={{ paddingTop: 88, alignItems: 'center', gap: 14 }}>
      <div className="circle-icon" style={{ width: 96, height: 96, background: 'var(--brand-primary)' }}>
        <Icon name="check" size={48} color="#fff" strokeWidth={2.6} />
      </div>
      <div style={{ height: 8 }} />
      <h1 className="t-h1 center" style={{ fontSize: 24 }}>
        동행이 확정됐어요
      </h1>
      <p className="t-body center" style={{ color: 'var(--text-secondary)' }}>
        보호자에게 봉사자 정보가 전달됐어요.
      </p>
      <Status loading={detail.loading} error={detail.error} />
      {rows.length > 0 && (
        <div className="card" style={{ width: '100%', gap: 10 }}>
          {rows.map(([k, v]) => (
            <div key={k} className="row row--between" style={{ fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
              <span className="t-bold">{v}</span>
            </div>
          ))}
        </div>
      )}
      <Spacer />
      <Button to="/volunteer/home">일정 확인하기</Button>
      <Button variant="ghost" to="/volunteer/home">
        홈으로
      </Button>
    </Screen>
  )
}

export function MapPlaceholder({ height, dashed = true }: { height: number; dashed?: boolean }) {
  // 실제 지도 SDK(카카오맵 등)로 교체할 자리표시
  return (
    <svg width="100%" height={height} viewBox={`0 0 390 ${height}`} preserveAspectRatio="xMidYMid slice" style={{ display: 'block', background: '#dee8e0' }}>
      <path d={`M0 ${height * 0.23} L390 ${height * 0.13} M0 ${height * 0.7} L390 ${height * 0.83} M120 0 L150 ${height} M290 0 L260 ${height}`} stroke="#fff" strokeWidth="10" />
      <path
        d={`M70 ${height * 0.8} C140 ${height * 0.77} 150 ${height * 0.53} 210 ${height * 0.47} S300 ${height * 0.3} 320 ${height * 0.2}`}
        stroke="#14735E"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={dashed ? '2 10' : undefined}
        fill="none"
      />
      <circle cx="70" cy={height * 0.8} r="9" fill="#fff" stroke="#14735E" strokeWidth="4" />
      {dashed ? (
        <>
          <circle cx="320" cy={height * 0.2} r="12" fill="#E8963A" />
          <circle cx="210" cy={height * 0.47} r="14" fill="#14735E" stroke="#fff" strokeWidth="4" />
        </>
      ) : (
        <circle cx="320" cy={height * 0.2} r="15" fill="#14735E" stroke="#fff" strokeWidth="4" />
      )}
    </svg>
  )
}

/** 07 진행 현황 · 체크인/단계/체크아웃 */
export function VolunteerProgress() {
  const [params] = useSearchParams()
  const paramVisit = Number(params.get('visitId'))
  const apps = useApi(() => applicationApi.mine(), [], !paramVisit)
  const visitId = paramVisit || pickActive(apps.data)?.visitId || 0

  const visit = useApi(() => visitApi.get(visitId), [visitId], !!visitId)
  const v = visit.data
  const detail = useApi(() => requestApi.detail(v!.requestId), [v?.requestId], !!v)
  const d = detail.data
  const act = useAction()

  const checklist = v?.checklist ?? []
  const nextIdx = checklist.findIndex((s) => !s.done)
  const next = nextIdx >= 0 ? checklist[nextIdx] : null

  const advance = async () => {
    if (!v) return
    const res = await act.run(async () => {
      if (!v.startedAt) return visitApi.checkin(visitId)
      if (next) return visitApi.step(visitId, next.step, true)
      return visitApi.checkout(visitId)
    })
    if (res !== undefined) visit.reload()
  }

  const buttonLabel = !v
    ? ''
    : !v.startedAt
      ? '만남 체크인'
      : next
        ? `${next.label} 완료`
        : !v.endedAt
          ? '동행 마치기 (체크아웃)'
          : '동행이 끝났어요'

  return (
    <Screen bodyStyle={{ padding: 0, gap: 0 }}>
      <div style={{ position: 'relative' }}>
        <MapPlaceholder height={300} />
      </div>
      <div className="col" style={{ flex: 1, gap: 16, padding: '24px 24px 24px', marginTop: -24, borderRadius: '24px 24px 0 0', background: 'var(--bg-canvas)' }}>
        {!visitId && !apps.loading && <p className="t-body">진행할 동행이 아직 없어요.</p>}
        <Status loading={visit.loading || apps.loading} error={visit.error ?? apps.error} />
        {v && (
          <>
            <div className="row row--between">
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontSize: 19, fontWeight: 700 }}>{d ? `${d.senior.name} 어르신 ${v.endedAt ? '동행 완료' : v.startedAt ? '동행 중' : '동행 준비'}` : '동행'}</span>
                <span className="t-sub">{d ? `${d.hospital.name} · ${d.department}` : ''}</span>
              </div>
              <Chip>{next ? next.label : v.endedAt ? '완료' : '마무리'}</Chip>
            </div>
            <ol className="card" style={{ gap: 0, margin: 0, listStyle: 'none' }}>
              {checklist.map((s, i) => {
                const state = s.done ? 'done' : i === nextIdx ? 'now' : 'todo'
                return (
                  <li key={s.step} className="row" style={{ gap: 14, alignItems: 'stretch' }}>
                    <div className="col" style={{ alignItems: 'center' }}>
                      <span
                        className="circle-icon"
                        style={{
                          width: 24,
                          height: 24,
                          background: state === 'todo' ? 'var(--line-default)' : state === 'now' ? 'var(--brand-accent)' : 'var(--brand-primary)',
                        }}
                      >
                        {state === 'done' && <Icon name="check" size={14} color="#fff" strokeWidth={3} />}
                      </span>
                      {i < checklist.length - 1 && (
                        <span style={{ width: 2, flex: 1, minHeight: 26, background: state === 'done' ? 'var(--brand-primary)' : 'var(--line-default)' }} />
                      )}
                    </div>
                    <div className="col" style={{ paddingBottom: i < checklist.length - 1 ? 8 : 0 }}>
                      <span className="t-body" style={{ fontWeight: state === 'todo' ? 500 : 700, color: state === 'todo' ? 'var(--text-secondary)' : undefined }}>
                        {s.label}
                      </span>
                      {s.step === 'MEET' && v.startedAt && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{hhmm(v.startedAt)} 체크인</span>}
                    </div>
                  </li>
                )
              })}
            </ol>
            <ErrorText>{act.error}</ErrorText>
            <Spacer />
            <div className="row" style={{ gap: 10 }}>
              <Button
                variant="ghost"
                style={{ width: 120 }}
                disabled={!d?.guardian}
                onClick={() => d?.guardian && (window.location.href = `tel:${d.guardian.phone}`)}
              >
                보호자 연락
              </Button>
              <Button className="fill" onClick={advance} disabled={act.pending || !!v.endedAt}>
                {act.pending ? '처리 중…' : buttonLabel}
              </Button>
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}

/** 08 마이페이지 · 활동 내역 */
export function VolunteerMyPage() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const profile = useApi(() => profileApi.getVolunteer(session!.userId), [session?.userId], !!session)
  const apps = useApi(() => applicationApi.mine(), [])
  const p = profile.data

  const history = (apps.data ?? []).map((a) => {
    const label = a.status === 'ACCEPTED' ? REQUEST_STATUS_LABEL[a.requestStatus] : APPLICATION_STATUS_LABEL[a.status]
    const tone: 'green' | 'gray' = a.status === 'ACCEPTED' && a.requestStatus !== 'CANCELED' ? 'green' : 'gray'
    return { id: a.applicationId, date: formatDate(a.date), hospital: a.hospitalName, label, tone }
  })

  return (
    <Screen footer={tabs}>
      <div className="row" style={{ gap: 14 }}>
        <Avatar size={60} />
        <div className="col fill" style={{ gap: 2 }}>
          <span style={{ fontSize: 19, fontWeight: 700 }}>{session?.name} 봉사자</span>
          <span className="t-caption">{p ? `${p.verified ? '인증 봉사자' : '인증 대기'} · ${p.school}` : '프로필 미완성'}</span>
        </div>
        <button
          type="button"
          aria-label="로그아웃"
          onClick={() => {
            logout()
            navigate('/volunteer/login', { replace: true })
          }}
        >
          <Icon name="gear" color="var(--text-secondary)" />
        </button>
      </div>
      <div className="row" style={{ gap: 10 }}>
        {[
          [`${p?.visitCount ?? 0}회`, '누적 동행'],
          [minutesToText(p?.totalMinutes ?? 0), '봉사시간'],
          [`${p?.thanksMessages.length ?? 0}개`, '감사 메시지'],
        ].map(([v, l]) => (
          <div key={l} className="card fill" style={{ alignItems: 'center', gap: 2, padding: '14px 0', borderRadius: 16 }}>
            <span style={{ fontSize: 19, fontWeight: 700, color: 'var(--brand-primary)' }}>{v}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{l}</span>
          </div>
        ))}
      </div>
      <div className="row row--between">
        <span className="t-h2">활동 내역</span>
        <span className="t-sub t-medium">전체보기</span>
      </div>
      <Status loading={apps.loading} error={apps.error} />
      <div className="card card--list">
        {history.map((h) => (
          <div key={h.id} className="list-item">
            <div className="col fill" style={{ gap: 2 }}>
              <span className="t-body t-bold">{h.hospital}</span>
              <span className="t-caption">{h.date}</span>
            </div>
            <Chip tone={h.tone}>{h.label}</Chip>
          </div>
        ))}
      </div>
      <div className="card card--list">
        {['봉사시간 확인서 발급', '알림 설정', '자주 묻는 질문'].map((m) => (
          <button key={m} type="button" className="list-item row--between" style={{ width: '100%', paddingRight: 10 }}>
            <span className="t-body t-medium">{m}</span>
            <Icon name="chev" size={20} color="var(--icon-muted)" />
          </button>
        ))}
      </div>
    </Screen>
  )
}
