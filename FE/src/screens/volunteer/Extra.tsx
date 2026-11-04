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
import { dDay, formatDate, hhmm, minutesToText } from '../../lib/format'

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
  const rows: [string, string][] = c
    ? [
        ['봉사자', `${c.volunteerName} · ${c.school}`],
        ['날짜', formatDate(c.date)],
        ['병원', c.hospitalName],
        ['동행 시간', `${hhmm(c.startedAt)} ~ ${hhmm(c.endedAt)}`],
        ['인정 시간', minutesToText(c.approvedMinutes)],
        ['승인일', formatDate(c.approvedAt.slice(0, 10))],
      ]
    : []

  return (
    <Screen bodyStyle={{ gap: 14 }}>
      <TopBar title="봉사 확인서" />
      <Status loading={cert.loading} error={cert.error} onRetry={cert.reload} />
      {c && (
        <>
          <section className="card certificate" style={{ gap: 14, padding: 20 }}>
            <div className="row row--between">
              <span className="t-h2">동행 봉사 확인서</span>
              <Character who="volunteer" size={48} />
            </div>
            {rows.map(([k, v]) => (
              <div key={k} className="row row--between" style={{ gap: 12 }}>
                <span className="t-sub">{k}</span>
                <span className="t-body t-bold" style={{ textAlign: 'right' }}>
                  {v}
                </span>
              </div>
            ))}
            <p className="t-caption" style={{ margin: 0 }}>
              위 봉사자는 같이가요를 통해 병원 동행 봉사를 마쳤으며, 요청한 분이 실제 동행 시간을 확인하고 승인했어요. 공식 봉사시간(1365) 등록은 학교·자원봉사센터를 통해 진행해 주세요.
            </p>
          </section>
          <Spacer />
          <Button onClick={() => window.print()}>PDF로 저장하기</Button>
        </>
      )}
    </Screen>
  )
}
