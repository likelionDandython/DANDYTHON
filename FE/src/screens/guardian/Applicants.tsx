import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { applicationApi, requestApi } from '../../api/services'
import { MEET_PLACE_LABEL, NEED_LABEL } from '../../api/labels'
import type { ApplicationItem, RequestDetail } from '../../api/types'
import { Button } from '../../components/common/Button'
import { Character, CharacterAvatar, CharacterPair } from '../../components/common/Character'
import { ErrorText } from '../../components/common/Form'
import { HometownBadge } from '../../components/common/HometownBadge'
import { Icon } from '../../components/common/Icon'
import { Screen, TopBar } from '../../components/common/Layout'
import { useAction, useApi } from '../../hooks/useApi'
import { dDay, formatDateTime } from '../../lib/format'
import { isHometownNeighbor } from '../../lib/hometown'
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

/** 신청자 목록 + 수락 (요청자) — /guardian/applicants?requestId= */
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
          <section aria-label="동행 요청 내용" className="col" style={{ gap: 16, padding: '22px 20px 20px', borderRadius: 26, background: 'var(--brand-accent-soft)' }}>
            <div className="row" style={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
              <div className="col" style={{ gap: 10, paddingBottom: 6 }}>
                <span style={{ alignSelf: 'flex-start', padding: '4px 12px', borderRadius: 999, background: '#fff', color: 'var(--accent-ink)', fontSize: 13, fontWeight: 700 }}>{dDay(d.date)}</span>
                <h1 className="t-h1">
                  {d.senior.name} 님과
                  <br />
                  함께 갈 분을
                  <br />
                  골라 주세요
                </h1>
              </div>
              <Character who="elder" size={96} />
            </div>
            <dl className="info-list" style={{ margin: 0, background: '#fff', borderRadius: 18, padding: 16, display: 'grid', gridTemplateColumns: '84px 1fr', rowGap: 8, fontSize: 15, lineHeight: 1.5 }}>
              {infoRows(d).map(([k, v]) => (
                <div key={k} style={{ display: 'contents' }}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="row" style={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 8, padding: '8px 4px 0', flexWrap: 'wrap' }}>
            <h2 className="t-h2">신청한 봉사자 {list.length}명</h2>
            <span className="t-caption" style={{ fontSize: 14 }}>
              한 분을 고르면 나머지는 마감돼요
            </span>
          </div>

          {list.map((a) => (
            <ApplicantCard key={a.applicationId} a={a} requestId={requestId} seniorRegion={d?.senior.region} />
          ))}

        </>
      )}
    </Screen>
  )
}

function ApplicantCard({ a, requestId, seniorRegion }: { a: ApplicationItem; requestId: number; seniorRegion?: string }) {
  const v = a.volunteer
  const neighbor = isHometownNeighbor(v.hometown, seniorRegion)
  return (
    <article className="col" style={{ gap: 18, padding: 16, borderRadius: 24, background: '#fff', border: '1px solid var(--line-default)' }}>
      {a.message && (
        <div style={{ position: 'relative', background: 'var(--brand-primary-soft)', borderRadius: 18, padding: '14px 16px' }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--primary-ink)', marginBottom: 4 }}>신청 한 마디</span>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65 }}>{a.message}</p>
          <span aria-hidden="true" style={{ position: 'absolute', left: 34, bottom: -7, width: 14, height: 14, background: 'var(--brand-primary-soft)', transform: 'rotate(45deg)', borderRadius: 2 }} />
        </div>
      )}
      <div className="row" style={{ gap: 14 }}>
        <CharacterAvatar who="volunteer" size={60} />
        <div className="col fill" style={{ gap: 3 }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>
            {v.name} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>· {v.age}세 · {GENDER_TEXT[v.gender as 'MALE' | 'FEMALE'] ?? ''}</span>
          </span>
          <span className="t-caption" style={{ fontSize: 14 }}>
            {v.school} {v.major} {v.grade}학년 · 고향 {v.hometown}
          </span>
        </div>
      </div>
      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        {v.verified && (
          <span className="row" style={{ gap: 4, padding: '4px 10px', borderRadius: 999, background: 'var(--brand-primary-soft)', color: 'var(--primary-ink)', fontSize: 13, fontWeight: 700 }}>
            <Icon name="shield" size={14} />
            재학 인증
          </span>
        )}
        {neighbor && <HometownBadge />}
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>동행 {v.visitCount}회</span>
      </div>
      <div className="row" style={{ gap: 10 }}>
        <Link className="btn btn--sm btn--secondary" style={{ flex: 1, fontSize: 16, borderRadius: 16 }} to={`/guardian/volunteer?userId=${v.userId}&requestId=${requestId}&applicationId=${a.applicationId}`}>
          프로필 보기
        </Link>
        <Link className="btn btn--sm btn--primary" style={{ flex: 1.5, fontSize: 16, borderRadius: 16 }} to={`/guardian/applicants/confirm?requestId=${requestId}&applicationId=${a.applicationId}`}>
          이분과 같이 가요
        </Link>
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
            <CharacterPair width={180} />
            <h1 className="hero__title">
              {a.volunteer.name} 봉사자와
              <br />
              함께 갈까요?
            </h1>
            <p className="t-body" style={{ lineHeight: 1.6 }}>
              {a.volunteer.school} {a.volunteer.major} {a.volunteer.grade}학년
              {a.volunteer.verified ? ' · 재학 인증' : ''}
            </p>
          </section>

          <section className="point-list" aria-label="확정하면 달라지는 점">
            <h2 className="point-list__title">확정하면 이렇게 돼요</h2>
            <Point icon="phone" title="연락처가 서로 공개돼요" desc="동행 전에 직접 연락할 수 있어요." />
            {others > 0 && <Point icon="xcircle" warn title={`나머지 신청 ${others}건은 마감돼요`} desc="확정한 뒤에는 다른 봉사자를 다시 고를 수 없어요." />}
            <Point icon="alert" warn title="동행 2일 전 이후 취소는 기록에 남아요" desc="그 전에는 기록 없이 취소할 수 있어요." />
          </section>
        </>
      )}
    </Screen>
  )
}

function Point({ icon, title, desc, warn }: { icon: 'phone' | 'xcircle' | 'alert'; title: string; desc: string; warn?: boolean }) {
  return (
    <div className="point">
      <span className="point__icon" style={warn ? { background: 'var(--brand-accent-soft)', color: '#C24E36' } : undefined}>
        <Icon name={icon} size={20} />
      </span>
      <div className="col" style={{ gap: 2 }}>
        <span className="point__title">{title}</span>
        <span className="point__desc">{desc}</span>
      </div>
    </div>
  )
}
