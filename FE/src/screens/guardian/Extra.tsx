import { useNavigate, useSearchParams } from 'react-router-dom'
import { profileApi, requestApi } from '../../api/services'
import { ABILITY_LABEL, LATE_CANCEL_NOTE, REGIONS, WEEKDAY_LABEL } from '../../api/labels'
import { Button } from '../../components/common/Button'
import { Character, CharacterAvatar } from '../../components/common/Character'
import { Chip } from '../../components/common/Chip'
import { ErrorText } from '../../components/common/Form'
import { HometownBadge } from '../../components/common/HometownBadge'
import { Icon } from '../../components/common/Icon'
import { Screen, Spacer, TopBar } from '../../components/common/Layout'
import { Status } from '../../components/common/States'
import { useAction, useApi } from '../../hooks/useApi'
import { dDay, formatDateTime, minutesToText } from '../../lib/format'
import { isHometownNeighbor } from '../../lib/hometown'

const GENDER_TEXT = { FEMALE: '여', MALE: '남' } as const

/** 신청자의 봉사자 프로필 상세 — /guardian/volunteer?userId=&requestId=&applicationId= */
export function GuardianVolunteerView() {
  const [params] = useSearchParams()
  const userId = Number(params.get('userId'))
  const requestId = params.get('requestId')
  const applicationId = params.get('applicationId')
  const profile = useApi(() => profileApi.getVolunteer(userId), [userId], !!userId)
  const p = profile.data
  // 어느 요청에서 들어왔는지 알 때만 동행받는 분 거주지와 비교해 '고향 연결'을 보여줘요
  const reqDetail = useApi(() => requestApi.detail(Number(requestId)), [requestId], !!requestId)
  const neighbor = isHometownNeighbor(p?.hometown, reqDetail.data?.senior.region)
  // 지역은 화면 선택지 순서대로 보여줘요
  const regions = p?.regions ? REGIONS.filter((r) => p.regions.includes(r)) : []

  return (
    <Screen bodyStyle={{ gap: 14 }}>
      <TopBar title="봉사자 프로필" />
      <Status loading={profile.loading} error={profile.error} onRetry={profile.reload} />
      {p && (
        <>
          <div className="col" style={{ alignItems: 'center', gap: 6, textAlign: 'center' }}>
            <CharacterAvatar who="volunteer" size={104} />
            <span className="t-h1" style={{ fontSize: 22 }}>
              {p.name} <span className="t-sub">· {p.age}세 · {GENDER_TEXT[p.gender]}</span>
            </span>
            <span className="t-sub">
              {p.school} {p.major} {p.grade}학년 · 고향 {p.hometown}
            </span>
            <span className="row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              {p.verified && <Chip tone="green">재학 인증</Chip>}
              {neighbor && <HometownBadge />}
              <Chip tone="gray">{`동행 ${p.visitCount}회`}</Chip>
              <Chip tone="gray">{minutesToText(p.totalMinutes)}</Chip>
            </span>
          </div>
          {p.intro && (
            <p className="bubble" style={{ margin: 0 }}>
              <span className="bubble__label">소개</span>
              {p.intro}
            </p>
          )}
          <div className="card" style={{ gap: 10 }}>
            {regions.length > 0 && <Row label="활동 지역" value={regions.join(', ')} />}
            {p.availableDays?.length > 0 && <Row label="가능한 요일" value={p.availableDays.map((d) => WEEKDAY_LABEL[d]).join(' ')} />}
            {p.abilities?.length > 0 && <Row label="할 수 있는 도움" value={p.abilities.map((a) => ABILITY_LABEL[a] ?? a).join(', ')} />}
          </div>
          {p.thanksMessages.length > 0 && (
            <div className="col" style={{ gap: 8 }}>
              <span className="t-body t-bold">다른 요청자 후기</span>
              {p.thanksMessages.slice(0, 3).map((t) => (
                <p key={t.createdAt + t.message} className="card t-sub" style={{ margin: 0, padding: 14, color: 'var(--text-primary)' }}>
                  “{t.message}”
                </p>
              ))}
            </div>
          )}
          <Spacer />
          {requestId && applicationId && (
            <Button to={`/guardian/applicants/confirm?requestId=${requestId}&applicationId=${applicationId}`}>이분과 같이 가요</Button>
          )}
        </>
      )}
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="col" style={{ gap: 2 }}>
      <span className="t-caption t-bold">{label}</span>
      <span className="t-body">{value}</span>
    </div>
  )
}

/** 요청 취소 확인 — /guardian/cancel?requestId= */
export function GuardianCancelRequest() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const requestId = Number(params.get('requestId'))
  const detail = useApi(() => requestApi.detail(requestId), [requestId], !!requestId)
  const d = detail.data
  const confirmed = d?.status === 'CONFIRMED'
  const late = !!d && (dDay(d.date) === 'D-DAY' || Number(dDay(d.date).slice(2)) <= 2)
  const { pending, error, run } = useAction()

  const cancel = async () => {
    const res = await run(() => requestApi.cancel(requestId))
    if (res) navigate('/guardian/home', { replace: true })
  }

  return (
    <Screen bodyStyle={{ gap: 14 }}>
      <TopBar title="요청 취소" />
      <Status loading={detail.loading} error={detail.error} onRetry={detail.reload} />
      {d && (
        <>
          <div className="col" style={{ alignItems: 'center', gap: 8, textAlign: 'center', paddingTop: 8 }}>
            <Character who="volunteer" size={88} />
            <h1 className="t-h1">이 동행 요청을 취소할까요?</h1>
            <p className="t-sub">
              {d.senior.name} 님 · {formatDateTime(d.date, d.meetTime)} · {d.hospital.name}
            </p>
          </div>
          {confirmed && (
            <p className="t-body center">확정된 봉사자{d.volunteers?.[0] ? `(${d.volunteers[0].name})` : ''}에게 취소 소식이 전해져요.</p>
          )}
          {late && (
            <div className="notice">
              <Icon name="clock" size={20} />
              {LATE_CANCEL_NOTE}
            </div>
          )}
          <ErrorText>{error}</ErrorText>
          <Spacer />
          <Button variant="secondary" onClick={() => navigate(-1)}>
            취소하지 않을게요
          </Button>
          <Button variant="ghost" onClick={cancel} disabled={pending}>
            {pending ? '취소하는 중…' : '요청 취소하기'}
          </Button>
        </>
      )}
    </Screen>
  )
}
