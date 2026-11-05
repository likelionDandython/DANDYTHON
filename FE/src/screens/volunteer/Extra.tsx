import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { applicationApi, visitApi } from '../../api/services'
import { LATE_CANCEL_NOTE } from '../../api/labels'
import { Button } from '../../components/common/Button'
import { Character, CharacterPair } from '../../components/common/Character'
import { ErrorText } from '../../components/common/Form'
import { Icon } from '../../components/common/Icon'
import { Screen, Spacer, TopBar } from '../../components/common/Layout'
import { EmptyState, Status } from '../../components/common/States'
import { useAuth } from '../../auth/AuthContext'
import { useAction, useApi } from '../../hooks/useApi'
import { dDay, formatDate, minutesToText } from '../../lib/format'

/** 동행일까지 남은 날 (오늘 0) */
function daysUntil(date: string) {
  const d = dDay(date)
  return d === 'D-DAY' ? 0 : Number(d.slice(2))
}

/** 프로필 완성 */
export function VolunteerProfileDone() {
  const { session } = useAuth()
  return (
    <Screen bodyStyle={{ paddingTop: 56, alignItems: 'center', gap: 12, textAlign: 'center' }}>
      <CharacterPair width={240} />
      <h1 className="t-h1">
        프로필이 완성됐어요
        <br />
        이제 동행을 신청할 수 있어요
      </h1>
      <p className="t-sub">
        {session?.name} 님의 프로필은 동행을 요청한 분이 신청자를 고를 때 보여요.
        <br />
        승인 대기 없이 바로 신청할 수 있어요.
      </p>
      <Spacer />
      <Button to="/volunteer/requests">동행 요청 보러 가기</Button>
      <Button variant="ghost" to="/volunteer/home">
        홈으로
      </Button>
    </Screen>
  )
}

/** 신청 취소 (동행 2일 이내면 경고) — /volunteer/cancel?applicationId=&date=&hospital= */
export function VolunteerCancel() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const applicationId = Number(params.get('applicationId'))
  const date = params.get('date') ?? ''
  const hospital = params.get('hospital') ?? ''
  const late = !!date && daysUntil(date) <= 2
  const { pending, error, run } = useAction()

  const cancel = async () => {
    const res = await run(() => applicationApi.cancel(applicationId))
    if (res) navigate('/volunteer/my', { replace: true })
  }

  return (
    <Screen bodyStyle={{ gap: 14 }}>
      <TopBar title="신청 취소" />
      <div className="col" style={{ alignItems: 'center', gap: 8, textAlign: 'center', paddingTop: 8 }}>
        <Character who="elder" size={88} title="기다리는 동행받는 분 캐릭터" />
        <h1 className="t-h1">
          {late ? '동행이 얼마 남지 않았어요' : '이 동행 신청을 취소할까요?'}
        </h1>
        {date && (
          <p className="t-sub">
            {formatDate(date)} · {hospital} ({dDay(date)})
          </p>
        )}
      </div>
      {late ? (
        <div className="notice" style={{ alignItems: 'flex-start' }}>
          <Icon name="clock" size={20} />
          <span>
            {LATE_CANCEL_NOTE}. 갑자기 취소하면 다른 봉사자를 찾기 어려워요. 꼭 필요할 때만 취소해 주세요.
          </span>
        </div>
      ) : (
        <p className="t-body center">취소하면 요청한 분에게 알려지고, 다른 봉사자가 신청할 수 있어요.</p>
      )}
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button variant="secondary" to="/volunteer/my">
        취소하지 않을게요
      </Button>
      <Button variant="ghost" onClick={cancel} disabled={pending || !applicationId}>
        {pending ? '취소하는 중…' : late ? '그래도 취소하기' : '신청 취소하기'}
      </Button>
    </Screen>
  )
}

/** 봉사 확인서 (VOL-02) — /volunteer/certificate?visitId= (없으면 승인된 동행 목록) */
export function VolunteerCertificate() {
  const [params] = useSearchParams()
  const visitId = Number(params.get('visitId'))
  const apps = useApi(() => applicationApi.mine(), [], !visitId)
  const cert = useApi(() => visitApi.certificate(visitId), [visitId], !!visitId)
  const approved = (apps.data ?? []).filter((a) => a.requestStatus === 'APPROVED' && a.visitId)

  if (!visitId) {
    return (
      <Screen bodyStyle={{ gap: 14 }}>
        <TopBar title="봉사 확인서" />
        <p className="t-sub">요청한 분이 봉사시간을 승인한 동행만 확인서를 받을 수 있어요.</p>
        <Status loading={apps.loading} error={apps.error} onRetry={apps.reload} />
        {!apps.loading && !apps.error && approved.length === 0 && (
          <EmptyState title="아직 승인된 동행이 없어요" desc="동행을 마치고 요청한 분이 승인하면 여기에 생겨요." />
        )}
        <div className="card card--list" hidden={approved.length === 0}>
          {approved.map((a) => (
            <Link key={a.applicationId} to={`/volunteer/certificate?visitId=${a.visitId}`} className="list-item row--between">
              <span className="col" style={{ gap: 2 }}>
                <span className="t-body t-bold">{a.hospitalName}</span>
                <span className="t-caption">
                  {formatDate(a.date)}
                  {a.approvedMinutes ? ` · ${minutesToText(a.approvedMinutes)} 인정` : ''}
                </span>
              </span>
              <Icon name="chev" size={20} color="var(--icon-muted)" />
            </Link>
          ))}
        </div>
      </Screen>
    )
  }

  const c = cert.data
  const fullDate = (iso: string) => {
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
    const wd = '일월화수목금토'[new Date(y, m - 1, d).getDay()]
    return `${y}년 ${m}월 ${d}일 (${wd})`
  }
  const ampm = (iso: string) => {
    const [h, mm] = iso.slice(11, 16).split(':').map(Number)
    return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(mm).padStart(2, '0')}`
  }
  const rows: [string, string][] = c
    ? [
        ['이름', c.volunteerName],
        ['학교', c.school],
        ['활동일', fullDate(c.date)],
        ['활동 장소', c.hospitalName],
        ['활동 시간', `${ampm(c.startedAt)} ~ ${ampm(c.endedAt)}`],
        ['인정 시간', minutesToText(c.approvedMinutes)],
        ['승인일', fullDate(c.approvedAt).replace(/ \(.\)$/, '')],
      ]
    : []

  return (
    <Screen cta={c ? <Button onClick={() => window.print()}>확인서 저장하기</Button> : undefined}>
      <TopBar title="봉사 확인서" />
      <Status loading={cert.loading} error={cert.error} onRetry={cert.reload} />
      {c && (
        <>
          <section aria-label="봉사활동 확인서" className="col certificate" style={{ gap: 6, padding: '24px 22px 22px', borderRadius: 20, background: '#fff', border: '1.5px solid var(--line-default)' }}>
            <div className="col" style={{ alignItems: 'center', gap: 8, paddingBottom: 14, borderBottom: '2px solid var(--text-primary)' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-primary)' }}>같이가요</span>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '0.08em' }}>봉사활동 확인서</h2>
            </div>
            <div>
              {rows.map(([k, v], i) => (
                <div key={k} className="row" style={{ gap: 12, padding: '13px 0', alignItems: 'flex-start', borderBottom: i < rows.length - 1 ? '1px dashed var(--line-default)' : 'none' }}>
                  <span style={{ width: 84, flexShrink: 0, fontSize: 14, color: 'var(--text-secondary)' }}>{k}</span>
                  <span style={{ flex: 1, fontSize: k === '인정 시간' ? 18 : 16, fontWeight: k === '인정 시간' ? 700 : 500, lineHeight: 1.5 }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.7, textAlign: 'center', color: 'var(--chip-gray-ink)' }}>
              위 사람은 같이가요를 통해
              <br />
              병원 동행 봉사를 마쳤으며,
              <br />
              요청한 분이 봉사시간을 승인했음을 확인합니다.
            </p>
          </section>
          <p className="t-caption" style={{ fontSize: 14, padding: '0 4px' }}>
            확인서는 이 화면을 저장해서 학교에 내면 돼요. 공식 봉사시간(1365) 등록은 학교·자원봉사센터를 통해 진행해 주세요.
          </p>
        </>
      )}
    </Screen>
  )
}
