import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { applicationApi, requestApi } from '../../api/services'
import { MEET_PLACE_LABEL, NEED_LABEL } from '../../api/labels'
import type { ApplicationItem, RequestDetail } from '../../api/types'
import { Button } from '../../components/common/Button'
import { Chip } from '../../components/common/Chip'
import { CharacterAvatar, CharacterPair } from '../../components/common/Character'
import { ErrorText } from '../../components/common/Form'
import { Icon } from '../../components/common/Icon'
import { Screen, TopBar } from '../../components/common/Layout'
import { useAction, useApi } from '../../hooks/useApi'
import { dDay, formatDateTime } from '../../lib/format'
import '../../design/styles'

const GENDER_TEXT = { MALE: '남', FEMALE: '여' } as const

function useRequestId() {
  const [params] = useSearchParams()
  return Number(params.get('requestId')) || 0
}

function infoRows(d: RequestDetail) {
  return [
    ['일시', formatDateTime(d.date, d.meetTime)],
    ['병원', `${d.hospital.name}${d.department ? ` · ${d.department}` : ''}`],
    ['만날 곳', d.meetAddress || MEET_PLACE_LABEL[d.meetPlaceType]],
    ['필요한 도움', d.needs.map((n) => NEED_LABEL[n]).join(' · ') || '-'],
    ['필요 인원', `${d.helpersNeeded}명`],
  ] as const
}

/** 신청자 목록 + 수락 (보호자) — /guardian/applicants?requestId= */
export function GuardianApplicants() {
  const requestId = useRequestId()
  const detail = useApi(() => requestApi.detail(requestId), [requestId], !!requestId)
  const apps = useApi(() => applicationApi.listForRequest(requestId), [requestId], !!requestId)
  const list = (apps.data ?? []).filter((a) => a.status === 'PENDING')
  const d = detail.data
  const loading = detail.loading || apps.loading
  const error = detail.error ?? apps.error

  const footer = (
    <div className="cta-footer">
      <Button to="/guardian/home">홈으로 돌아가기</Button>
    </div>
  )

  return (
    <Screen footer={list.length === 0 ? footer : undefined}>
      <TopBar title="신청자 보기" />
      {d && (
        <section className="card" aria-label="동행 요청 내용" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="col" style={{ gap: 4 }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{formatDateTime(d.date, d.meetTime)}</span>
            <span className="t-sub">
              {d.hospital.name}
              {d.department ? ` · ${d.department}` : ''}
            </span>
          </div>
          <Chip tone="orange">{dDay(d.date)}</Chip>
        </section>
      )}

      {loading && <p className="t-caption">불러오는 중…</p>}
      <ErrorText>{error}</ErrorText>

      {!loading && !error && list.length === 0 && (
        <div className="col center" style={{ alignItems: 'center', gap: 18, flex: 1, justifyContent: 'center', padding: '0 12px' }}>
          <CharacterPair width={240} waiting />
          <h2 className="t-h1">
            아직 신청한 봉사자가
            <br />
            없어요
          </h2>
          <p className="t-sub" style={{ lineHeight: 1.7 }}>
            동행 2일 전까지 신청이 없으면
            <br />
            '급해요'로 목록 맨 위에 올라가요.
            <br />
            신청이 들어오면 홈의 '다가오는 일정'에
            <br />
            신청자 수가 표시돼요.
          </p>
        </div>
      )}

      {d && list.length > 0 && (
        <>
          <section className="hero hero--coral" aria-label="요청 요약">
            <div className="row" style={{ gap: 12 }}>
              <CharacterAvatar who="elder" size={56} />
              <h1 className="hero__title" style={{ fontSize: 22 }}>
                {d.senior.name} 어르신과
                <br />
                함께 갈 분을 골라 주세요
              </h1>
            </div>
            <dl className="info-list">
              {infoRows(d).map(([k, v]) => (
                <div key={k} style={{ display: 'contents' }}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="col" style={{ gap: 4 }}>
            <h2 className="t-h2">신청한 봉사자 {list.length}명</h2>
            <p className="t-caption">한 분을 고르면 나머지는 마감돼요</p>
          </div>

          {list.map((a) => (
            <ApplicantCard key={a.applicationId} a={a} requestId={requestId} />
          ))}

        </>
      )}
    </Screen>
  )
}

function ApplicantCard({ a, requestId }: { a: ApplicationItem; requestId: number }) {
  const v = a.volunteer
  return (
    <article className="applicant">
      <div className="applicant__head">
        <CharacterAvatar who="volunteer" size={52} />
        <div className="col fill" style={{ gap: 2 }}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>
            {v.name} <span className="t-sub">· {v.age}세 · {GENDER_TEXT[v.gender as 'MALE' | 'FEMALE'] ?? ''}</span>
          </span>
          <span className="t-sub">
            {v.school} {v.major} {v.grade}학년 · 고향 {v.hometown}
          </span>
        </div>
      </div>
      <div className="row" style={{ gap: 6 }}>
        {v.verified && <Chip tone="green">신원 확인 완료</Chip>}
        <Chip tone="gray">{`동행 ${v.visitCount}회`}</Chip>
      </div>
      {a.message && (
        <p className="bubble" style={{ margin: 0 }}>
          <span className="bubble__label">신청 한 마디</span>
          {a.message}
        </p>
      )}
      <div className="col" style={{ gap: 8 }}>
        <Button to={`/guardian/applicants/confirm?requestId=${requestId}&applicationId=${a.applicationId}`}>이분과 같이 가요</Button>
      </div>
    </article>
  )
}

/** 봉사자 확정 — /guardian/applicants/confirm?requestId=&applicationId= */
export function GuardianApplicantConfirm() {
  const requestId = useRequestId()
  const [params] = useSearchParams()
  const applicationId = Number(params.get('applicationId')) || 0
  const navigate = useNavigate()
  const apps = useApi(() => applicationApi.listForRequest(requestId), [requestId], !!requestId)
  const act = useAction()
  const pending = (apps.data ?? []).filter((a) => a.status === 'PENDING')
  const a = pending.find((x) => x.applicationId === applicationId)
  const others = Math.max(pending.length - 1, 0)

  const accept = async () => {
    const r = await act.run(() => applicationApi.accept(applicationId))
    if (r) navigate(`/guardian/confirmed?requestId=${r.requestId}`, { replace: true })
  }

  return (
    <Screen
      footer={
        <div className="cta-footer">
          <Button onClick={accept} disabled={!a || act.pending}>
            {a ? `${a.volunteer.name} 봉사자로 확정하기` : '확정하기'}
          </Button>
          <Link className="link-quiet" to={`/guardian/applicants?requestId=${requestId}`}>
            다시 고를게요
          </Link>
        </div>
      }
    >
      <TopBar title="함께 갈 봉사자 확정" />
      {apps.loading && <p className="t-caption">불러오는 중…</p>}
      <ErrorText>{apps.error ?? act.error}</ErrorText>
      {a && (
        <>
          <section className="hero hero--teal hero--center">
            <CharacterPair width={220} />
            <h1 className="hero__title">
              {a.volunteer.name} 봉사자와
              <br />
              함께 갈까요?
            </h1>
            <p className="t-body" style={{ lineHeight: 1.6 }}>
              {a.volunteer.school} {a.volunteer.major} {a.volunteer.grade}학년
              {a.volunteer.verified ? ' · 신원 확인 완료' : ''}
            </p>
          </section>

          <section className="point-list" aria-label="확정하면 달라지는 점">
            <h2 className="point-list__title">확정하면 이렇게 돼요</h2>
            <Point icon="phone" title="연락처가 서로 공개돼요" desc="동행 전에 직접 연락할 수 있어요." />
            {others > 0 && <Point icon="check" title={`나머지 신청 ${others}건은 마감돼요`} desc="확정한 뒤에는 다른 봉사자를 다시 고를 수 없어요." />}
            <Point icon="calendar" title="동행 2일 전 이후 취소는 기록에 남아요" desc="그 전에는 기록 없이 취소할 수 있어요." />
          </section>
        </>
      )}
    </Screen>
  )
}

function Point({ icon, title, desc }: { icon: 'phone' | 'check' | 'calendar'; title: string; desc: string }) {
  return (
    <div className="point">
      <span className="point__icon">
        <Icon name={icon} size={20} />
      </span>
      <div className="col" style={{ gap: 2 }}>
        <span className="point__title">{title}</span>
        <span className="point__desc">{desc}</span>
      </div>
    </div>
  )
}
