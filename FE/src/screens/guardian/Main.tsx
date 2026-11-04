import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { profileApi, requestApi, visitApi } from '../../api/services'
import {
  GENDER_PREF_LABEL,
  MEET_PLACE_LABEL,
  TRAVEL_MODE_LABEL,
  NEED_LABEL,
  NEEDS,
  REQUEST_STATUS_LABEL,
  REQUEST_STATUS_TONE,
} from '../../api/labels'
import type { GenderPref, MeetPlaceType, MyRequestItem, Need, TargetType, TravelMode } from '../../api/types'
import { Button } from '../../components/common/Button'
import { Chip, FilterChips, ToggleChipGroup } from '../../components/common/Chip'
import { ErrorText, Field, SelectField, Switch } from '../../components/common/Form'
import { Icon, type IconName } from '../../components/common/Icon'
import { Avatar, Screen, Spacer, TopBar } from '../../components/common/Layout'
import { GUARDIAN_TABS, TabBar } from '../../components/common/TabBar'
import { ModeSwitchButton, ModeSwitchCard } from '../../components/common/ModeSwitch'
import { useAuth } from '../../auth/AuthContext'
import { useAction, useApi } from '../../hooks/useApi'
import { formatDate, formatDateTime, hhmm, todayString } from '../../lib/format'
import { MapPlaceholder } from '../volunteer/Main'

const tabs = <TabBar tabs={GUARDIAN_TABS} />

function Status({ loading, error }: { loading: boolean; error: string | null }) {
  if (loading) return <p className="t-caption">불러오는 중…</p>
  return <ErrorText>{error}</ErrorText>
}

/** 지금 동행 중인 요청 → 없으면 가장 가까운 확정 요청 */
function pickActive(list: MyRequestItem[] | null) {
  const items = list ?? []
  const byDate = (a: MyRequestItem, b: MyRequestItem) => a.date.localeCompare(b.date)
  return (
    items.filter((r) => r.status === 'IN_PROGRESS').sort(byDate)[0] ?? items.filter((r) => r.status === 'CONFIRMED').sort(byDate)[0]
  )
}

/** requestId → 요청 상세 → visitId → 동행 상태 */
function useVisitByRequest(requestId?: number) {
  const detail = useApi(() => requestApi.detail(requestId!), [requestId], !!requestId)
  const visitId = detail.data?.visitId ?? 0
  const visit = useApi(() => visitApi.get(visitId), [visitId], !!visitId)
  return { detail, visit, loading: detail.loading || visit.loading, error: detail.error ?? visit.error }
}

/** URL 의 requestId, 없으면 내 요청 중 진행/확정 건 */
function useTargetRequestId() {
  const [params] = useSearchParams()
  const fromUrl = Number(params.get('requestId'))
  const mine = useApi(() => requestApi.mine(), [], !fromUrl)
  return { requestId: fromUrl || pickActive(mine.data)?.requestId || 0, loading: mine.loading, error: mine.error }
}

/** G01 홈 */
export function GuardianHome() {
  const mine = useApi(() => requestApi.mine(), [])
  const seniors = useApi(() => profileApi.mySeniors(), [])
  const active = pickActive(mine.data)
  const { visit } = useVisitByRequest(active?.requestId)
  const v = visit.data
  const checklist = v?.checklist ?? []
  const nowIdx = checklist.findIndex((s) => !s.done)

  const upcoming = (mine.data ?? [])
    .filter((r) => r.status === 'RECRUITING' || r.status === 'CONFIRMED')
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <Screen footer={tabs}>
      <div className="row row--between">
        <span className="row" style={{ gap: 6, padding: '8px 12px', borderRadius: 999, background: '#fff', boxShadow: 'inset 0 0 0 1px var(--line-default)', fontSize: 15, fontWeight: 700 }}>
          {seniors.data?.[0] ? `${seniors.data[0].name} 님` : '나'}
        </span>
        <span className="row" style={{ gap: 4 }}>
          <ModeSwitchButton current="REQUEST" />
          <Icon name="bell" size={26} />
        </span>
      </div>

      {active && (
        <section className="col" style={{ gap: 12, padding: 20, borderRadius: 20, background: 'var(--brand-primary)', color: '#fff' }}>
          <div className="row row--between" style={{ fontSize: 14 }}>
            <span className="row t-bold" style={{ gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--brand-accent)' }} />
              {active.status === 'IN_PROGRESS' ? '지금 동행 중' : '동행 확정'}
            </span>
            <span style={{ fontSize: 13 }}>{formatDate(active.date)}</span>
          </div>
          <span style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.4 }}>
            {active.hospitalName}
            <br />
            {active.status === 'IN_PROGRESS' && nowIdx >= 0 ? `${checklist[nowIdx].label} 단계예요` : '동행을 준비하고 있어요'}
          </span>
          {checklist.length > 0 && (
            <>
              <div className="row" style={{ gap: 4 }}>
                {checklist.map((s, i) => (
                  <span
                    key={s.step}
                    style={{ flex: 1, height: 6, borderRadius: 3, background: s.done ? '#fff' : i === nowIdx ? 'var(--brand-accent)' : 'rgba(255,255,255,0.3)' }}
                  />
                ))}
              </div>
              <div className="row row--between" style={{ fontSize: 12, fontWeight: 500 }}>
                {checklist.map((s) => (
                  <span key={s.step}>{s.label}</span>
                ))}
              </div>
            </>
          )}
          <Button variant="secondary" size="sm" to={`/guardian/live?requestId=${active.requestId}`}>
            실시간으로 보기
          </Button>
        </section>
      )}

      <div className="row row--between">
        <span className="t-h2">다가오는 일정</span>
        <Link className="t-sub t-medium" to="/guardian/records">
          전체보기
        </Link>
      </div>
      <Status loading={mine.loading} error={mine.error} />
      <div className="card card--list">
        {upcoming.map((r) => (
          <Link key={r.requestId} to={r.status === 'CONFIRMED' ? `/guardian/confirmed?requestId=${r.requestId}` : '/guardian/home'} className="list-item" style={{ gap: 14 }}>
            <div className="col" style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-canvas)', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{Number(r.date.slice(5, 7))}.{Number(r.date.slice(8, 10))}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>{formatDate(r.date).slice(-2, -1)}</span>
            </div>
            <div className="col fill" style={{ gap: 4, alignItems: 'flex-start' }}>
              <span className="t-body t-bold">{r.hospitalName}</span>
              <span className="row" style={{ gap: 6 }}>
                <Chip tone={REQUEST_STATUS_TONE[r.status]}>{REQUEST_STATUS_LABEL[r.status]}</Chip>
                {r.status === 'RECRUITING' && <span className="t-caption">신청자 {r.applicantCount}명</span>}
              </span>
            </div>
          </Link>
        ))}
        {!mine.loading && upcoming.length === 0 && <div className="list-item"><span className="t-body">다가오는 일정이 없어요.</span></div>}
      </div>
      <Spacer />
      <Button to="/guardian/apply">새 동행 신청하기</Button>
    </Screen>
  )
}

/** G02 동행 신청 (나 / 가족) */
export function GuardianApply() {
  const navigate = useNavigate()
  const seniors = useApi(() => profileApi.mySeniors(), [])
  const hospitals = useApi(() => profileApi.hospitals(), [])
  const submit = useAction()

  const [targetType, setTargetType] = useState<TargetType>('FAMILY')
  const [seniorId, setSeniorId] = useState('')
  const [travelMode, setTravelMode] = useState<TravelMode>('BUS_TRAIN')
  const [hospitalId, setHospitalId] = useState('')
  const [department, setDepartment] = useState('')
  const [date, setDate] = useState('')
  const [meetTime, setMeetTime] = useState('')
  const [meetPlaceType, setMeetPlaceType] = useState<MeetPlaceType>('HOME')
  const [meetAddress, setMeetAddress] = useState('')
  const [needs, setNeeds] = useState<Need[]>([])
  const [helpersNeeded, setHelpersNeeded] = useState('1')
  const [genderPref, setGenderPref] = useState<GenderPref>('ANY')
  const [notes, setNotes] = useState('')

  const send = async () => {
    if ((targetType === 'FAMILY' && !seniorId) || !hospitalId || !department.trim() || !date || !meetTime || !meetAddress.trim()) {
      return submit.setError('동행받는 분, 병원, 진료과, 날짜·시간, 만나는 장소를 모두 입력해 주세요.')
    }
    if (date < todayString()) return submit.setError('과거 날짜는 선택할 수 없어요.')
    const res = await submit.run(() =>
      requestApi.create({
        targetType,
        seniorId: targetType === 'FAMILY' ? Number(seniorId) : null,
        travelMode,
        date,
        meetTime,
        meetPlaceType,
        meetAddress: meetAddress.trim(),
        hospitalId: Number(hospitalId),
        department: department.trim(),
        needs,
        notes,
        helpersNeeded: Math.max(1, Number(helpersNeeded) || 1),
        genderPref,
      }),
    )
    if (res) navigate('/guardian/home')
  }

  return (
    <Screen>
      <TopBar title="동행 신청" />
      <div className="field" style={{ gap: 8 }}>
        <span className="t-label">누구의 병원 동행인가요?</span>
        <div className="row" role="group" aria-label="요청 대상" style={{ gap: 8 }}>
          {(['SELF', 'FAMILY'] as TargetType[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={targetType === t}
              className={`toggle-chip fill ${targetType === t ? 'toggle-chip--on' : ''}`}
              style={{ justifyContent: 'center', height: 48 }}
              onClick={() => setTargetType(t)}
            >
              {t === 'SELF' ? '나' : '가족'}
            </button>
          ))}
        </div>
        <span className="t-caption">나를 고르면 내 정보로 바로 요청하고, 진료 요약도 나에게 와요.</span>
      </div>
      {targetType === 'FAMILY' && (
        <>
          <SelectField
            label="동행받는 분"
            icon="user"
            placeholder="동행받는 분을 선택해 주세요"
            value={seniorId}
            onChange={(e) => setSeniorId(e.target.value)}
            options={(seniors.data ?? []).map((s) => ({ value: s.seniorId, label: `${s.name} (${s.age}세) · ${s.region}` }))}
          />
          <Link className="t-sub t-medium t-primary" to="/guardian/senior/new">
            + 동행받는 분 등록하기
          </Link>
        </>
      )}
      <SelectField
        label="병원"
        icon="hospital"
        placeholder="병원을 선택해 주세요"
        value={hospitalId}
        onChange={(e) => setHospitalId(e.target.value)}
        options={(hospitals.data ?? []).map((h) => ({ value: h.hospitalId, label: h.name }))}
      />
      <Field label="진료과" placeholder="예: 정형외과" value={department} onChange={(e) => setDepartment(e.target.value)} />
      <Field label="날짜" icon="calendar" type="date" min={todayString()} value={date} onChange={(e) => setDate(e.target.value)} />
      <Field label="만나는 시간" type="time" value={meetTime} onChange={(e) => setMeetTime(e.target.value)} />
      <SelectField
        label="만나는 곳"
        value={meetPlaceType}
        onChange={(e) => setMeetPlaceType(e.target.value as MeetPlaceType)}
        options={(Object.keys(MEET_PLACE_LABEL) as MeetPlaceType[]).map((k) => ({ value: k, label: MEET_PLACE_LABEL[k] }))}
      />
      <Field label="만나는 주소" icon="pin" placeholder="경북 칠곡군 왜관읍 ○○로 12" value={meetAddress} onChange={(e) => setMeetAddress(e.target.value)} />
      <SelectField
        label="대구까지 이동 방법"
        value={travelMode}
        onChange={(e) => setTravelMode(e.target.value as TravelMode)}
        options={(Object.keys(TRAVEL_MODE_LABEL) as TravelMode[]).map((k) => ({ value: k, label: TRAVEL_MODE_LABEL[k] }))}
      />
      <p className="t-caption" style={{ margin: 0 }}>
        차비·진료비·약값은 동행받는 분이 직접 내요. 봉사자는 돈을 대신 내지 않아요.
      </p>
      <ToggleChipGroup
        label="필요한 도움"
        options={NEEDS.map((n) => NEED_LABEL[n])}
        onChange={(labels) => setNeeds(NEEDS.filter((n) => labels.includes(NEED_LABEL[n])))}
      />
      <Field label="필요한 봉사자 수" type="number" min={1} max={2} value={helpersNeeded} onChange={(e) => setHelpersNeeded(e.target.value)} />
      <SelectField
        label="봉사자 성별"
        value={genderPref}
        onChange={(e) => setGenderPref(e.target.value as GenderPref)}
        options={(Object.keys(GENDER_PREF_LABEL) as GenderPref[]).map((k) => ({ value: k, label: GENDER_PREF_LABEL[k] }))}
      />
      <label className="field">
        <span className="t-label">봉사자에게 전할 말</span>
        <textarea className="textarea" placeholder="귀가 어두우셔서 크게 천천히 말씀해 주세요." value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <Status loading={seniors.loading || hospitals.loading} error={seniors.error ?? hospitals.error} />
      <ErrorText>{submit.error}</ErrorText>
      <Spacer />
      <Button onClick={send} disabled={submit.pending}>
        {submit.pending ? '신청 중…' : '신청하기'}
      </Button>
    </Screen>
  )
}

/** G03 봉사자 확정 */
export function GuardianConfirmed() {
  const target = useTargetRequestId()
  const detail = useApi(() => requestApi.detail(target.requestId), [target.requestId], !!target.requestId)
  const d = detail.data
  const vol = d?.volunteers?.[0]
  const profile = useApi(() => profileApi.getVolunteer(vol!.userId), [vol?.userId], !!vol)
  const p = profile.data

  return (
    <Screen>
      <TopBar title="동행 확정" />
      <Status loading={target.loading || detail.loading} error={target.error ?? detail.error} />
      {d && !vol && <p className="t-body">아직 확정된 봉사자가 없어요.</p>}
      {d && vol && (
        <>
          <div className="col" style={{ gap: 4 }}>
            <h1 className="t-h1">
              {d.senior.name}님과 함께할
              <br />
              봉사자가 정해졌어요
            </h1>
            <p className="t-sub">
              {formatDateTime(d.date, d.meetTime)} {MEET_PLACE_LABEL[d.meetPlaceType]}에서 만나요
            </p>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div className="row" style={{ gap: 14 }}>
              <Avatar size={64} />
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontSize: 19, fontWeight: 700 }}>{vol.name} 봉사자</span>
                <span className="t-sub">{p ? `${p.school} · 동행 ${p.visitCount}회` : vol.phone}</span>
              </div>
            </div>
            {p && (
              <div className="col" style={{ gap: 10, paddingTop: 4 }}>
                {[p.verified ? '신원 확인 완료' : '신원 확인 대기', `${p.major} ${p.grade}학년`].map((s) => (
                  <span key={s} className="row t-body t-medium" style={{ gap: 8 }}>
                    <Icon name="shield" size={20} color="var(--brand-primary)" />
                    {s}
                  </span>
                ))}
              </div>
            )}
            {p?.thanksMessages[0] && (
              <div className="col" style={{ gap: 6, padding: '14px 16px', borderRadius: 14, background: 'var(--bg-canvas)' }}>
                <span className="t-sub" style={{ color: 'var(--text-primary)' }}>“{p.thanksMessages[0]}”</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>다른 요청자 후기</span>
              </div>
            )}
          </div>
          <Spacer />
          <div className="row" style={{ gap: 10 }}>
            <Button variant="ghost" style={{ width: 120 }} onClick={() => (window.location.href = `tel:${vol.phone}`)}>
              전화
            </Button>
            <Button className="fill" to="/guardian/home">
              일정 확인하기
            </Button>
          </div>
        </>
      )}
    </Screen>
  )
}

/** G04 실시간 동행 현황 */
export function GuardianLive() {
  const target = useTargetRequestId()
  const { detail, visit, loading, error } = useVisitByRequest(target.requestId || undefined)
  const v = visit.data
  const d = detail.data
  const vol = d?.volunteers?.[0]
  const done = (v?.checklist ?? []).filter((s) => s.done)
  const next = v?.checklist.find((s) => !s.done)

  return (
    <Screen bodyStyle={{ padding: 0, gap: 0 }}>
      <div style={{ position: 'relative' }}>
        <MapPlaceholder height={250} dashed={false} />
        <Link
          to="/guardian/home"
          className="row"
          style={{ position: 'absolute', top: 16, left: 16, gap: 8, padding: '8px 14px 8px 12px', borderRadius: 999, background: '#fff', fontSize: 14, fontWeight: 700 }}
        >
          <Icon name="back" size={20} />
          {d ? `${d.senior.name}님 동행 현황` : '동행 현황'}
        </Link>
      </div>
      <div className="col" style={{ flex: 1, gap: 14, padding: '20px 24px 24px' }}>
        <Status loading={target.loading || loading} error={target.error ?? error} />
        {!target.requestId && !target.loading && <p className="t-body">진행 중인 동행이 아직 없어요.</p>}
        {d && !v && !loading && <p className="t-body">동행이 확정되면 현황을 볼 수 있어요.</p>}
        {v && d && (
          <>
            <div className="row row--between">
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{v.endedAt ? '동행이 끝났어요' : next ? `${next.label} 단계` : '마무리 중'}</span>
                <span className="t-sub">{d.hospital.name} · {d.department}</span>
              </div>
              <Chip>{v.endedAt ? '동행 완료' : v.startedAt ? '안전하게 동행 중' : '출발 전'}</Chip>
            </div>
            <div className="card card--list">
              {[...done].reverse().map((s, i) => (
                <div key={s.step} className="list-item" style={{ alignItems: 'flex-start', padding: '12px 14px' }}>
                  <span className="circle-icon" style={{ width: 22, height: 22, background: i === 0 && !v.endedAt ? 'var(--brand-accent)' : 'var(--brand-primary)' }}>
                    <Icon name="check" size={13} color="#fff" strokeWidth={3} />
                  </span>
                  <div className="col fill" style={{ gap: 1 }}>
                    {s.step === 'MEET' && v.startedAt && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{hhmm(v.startedAt)}</span>
                    )}
                    <span className="t-body t-medium">{s.label} 완료</span>
                  </div>
                </div>
              ))}
              {done.length === 0 && <div className="list-item"><span className="t-body">아직 시작 전이에요.</span></div>}
            </div>
            {vol && <p className="t-caption" style={{ fontSize: 12 }}>{vol.name} 봉사자가 남긴 소식이에요</p>}
            <Spacer />
            <div className="row" style={{ gap: 10 }}>
              <Button className="fill" disabled={!vol} onClick={() => vol && (window.location.href = `tel:${vol.phone}`)}>
                봉사자에게 전화
              </Button>
            </div>
          </>
        )}
      </div>
    </Screen>
  )
}

/** G05 진료 결과 리포트 */
export function GuardianReport() {
  const [params] = useSearchParams()
  const requestId = Number(params.get('requestId'))
  const { detail, visit, loading, error } = useVisitByRequest(requestId || undefined)
  const v = visit.data
  const visitId = v?.visitId ?? 0
  const summary = useApi(() => visitApi.getSummary(visitId), [visitId], !!visitId && v?.hasSummary !== false)
  const approve = useAction()
  const [thanks, setThanks] = useState('')
  const [approved, setApproved] = useState(false)
  const s = summary.data
  const sum = s?.summary

  const facts: [IconName, string, string][] = sum
    ? [
        ['calendar', '다음 진료', sum.nextVisit],
        ['pill', '처방약', sum.medication],
        ['doc', '챙겨야 할 일', sum.guardianTodo.join(' / ')],
      ]
    : []

  const canApprove = detail.data?.status === 'COMPLETED' && !approved

  const doApprove = async () => {
    const res = await approve.run(() => visitApi.approve(visitId, thanks.trim() || undefined))
    if (res) setApproved(true)
  }

  return (
    <Screen>
      <TopBar title="오늘 진료 기록" />
      {!requestId && <ErrorText>동행 기록에서 들어와 주세요.</ErrorText>}
      <Status loading={loading || summary.loading} error={error ?? (v?.hasSummary === false ? null : summary.error)} />
      {v && (
        <div className="col" style={{ gap: 6, alignItems: 'flex-start' }}>
          {v.endedAt && <Chip>{`귀가 완료 ${hhmm(v.endedAt)}`}</Chip>}
          <h1 className="t-h1">
            {detail.data?.senior.name}님 동행
            <br />
            {v.endedAt ? '기록이에요' : '진행 중이에요'}
          </h1>
        </div>
      )}
      {v && v.hasSummary === false && <p className="t-body">아직 봉사자가 진료 요약을 작성하지 않았어요.</p>}
      {sum && (
        <div className="card" style={{ gap: 8 }}>
          <span className="t-bold t-primary" style={{ fontSize: 13 }}>
            진료 내용
          </span>
          {sum.todayPoints.map((p) => (
            <p key={p} className="t-body">· {p}</p>
          ))}
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sum.disclaimer}</span>
        </div>
      )}
      {s?.status === 'FALLBACK' && (
        <div className="card" style={{ gap: 8 }}>
          <span className="t-bold t-primary" style={{ fontSize: 13 }}>
            봉사자 메모 원문
          </span>
          <p className="t-body">{s.rawMemo}</p>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>요약을 만들지 못해 메모 원문을 보여드려요</span>
        </div>
      )}
      {facts.length > 0 && (
        <div className="card card--list">
          {facts.map(([ic, k, val]) => (
            <div key={k} className="list-item">
              <Icon name={ic} size={20} color="var(--brand-primary)" />
              <div className="col">
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{k}</span>
                <span className="t-body t-bold">{val}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {(canApprove || approved || v?.approved) && (
        <>
          {canApprove && <Field label="봉사자에게 감사 메시지 (선택)" value={thanks} onChange={(e) => setThanks(e.target.value)} />}
          <ErrorText>{approve.error}</ErrorText>
          {(approved || v?.approved) && <p className="t-caption t-accent t-medium">봉사시간을 승인했어요.</p>}
        </>
      )}
      <Spacer />
      {canApprove && (
        <Button onClick={doApprove} disabled={approve.pending}>
          {approve.pending ? '승인 중…' : '봉사시간 승인하기'}
        </Button>
      )}
      <Button variant="ghost" to="/guardian/apply">
        다음 동행 신청하기
      </Button>
    </Screen>
  )
}

/** G06 동행 기록 */
export function GuardianRecords() {
  const mine = useApi(() => requestApi.mine(), [])
  const [who, setWho] = useState('전체')
  const all = (mine.data ?? []).filter((r) => r.status === 'COMPLETED' || r.status === 'APPROVED' || r.status === 'CANCELED')
  const names = [...new Set(all.map((r) => r.seniorName))]
  const rows = all.filter((r) => who === '전체' || r.seniorName === who).sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Screen footer={tabs}>
      <h1 className="t-h1">동행 기록</h1>
      <FilterChips key={names.join(',')} options={['전체', ...names]} onChange={setWho} />
      <Status loading={mine.loading} error={mine.error} />
      {!mine.loading && rows.length === 0 && <p className="t-body">아직 동행 기록이 없어요.</p>}
      {rows.map((r) => (
        <Link
          key={r.requestId}
          to={r.status === 'CANCELED' ? '/guardian/records' : `/guardian/report?requestId=${r.requestId}`}
          className="card"
          style={{ flexDirection: 'row', alignItems: 'center', padding: '16px 12px 16px 18px', borderRadius: 16 }}
        >
          <div className="col fill" style={{ gap: 3 }}>
            <div className="row row--between">
              <span className="t-bold t-primary" style={{ fontSize: 13 }}>
                {formatDate(r.date)}
              </span>
              <Chip tone={REQUEST_STATUS_TONE[r.status]}>{REQUEST_STATUS_LABEL[r.status]}</Chip>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{r.hospitalName}</span>
            <span className="t-caption">{r.seniorName}</span>
          </div>
          <Icon name="chev" size={20} color="var(--icon-muted)" />
        </Link>
      ))}
    </Screen>
  )
}

/** G07 MY · 가족·알림 설정 */
export function GuardianMy() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const seniors = useApi(() => profileApi.mySeniors(), [])
  const notis: [string, boolean][] = [
    ['집에서 출발할 때', true],
    ['병원에 도착했을 때', true],
    ['진료가 끝났을 때', true],
    ['집에 도착했을 때', true],
    ['대기·진료 중 소식', false],
  ]
  return (
    <Screen footer={tabs}>
      <h1 className="t-h1">MY</h1>
      <p className="t-sub">{session?.name} 님</p>
      <ModeSwitchCard current="REQUEST" />
      <div className="row row--between">
        <span style={{ fontSize: 16, fontWeight: 700 }}>동행받는 분</span>
        <Link to="/guardian/senior/new" className="row t-primary t-bold" style={{ gap: 2, fontSize: 14 }}>
          <Icon name="plus" size={16} strokeWidth={2.4} />
          추가
        </Link>
      </div>
      <Status loading={seniors.loading} error={seniors.error} />
      <div className="card card--list">
        <div className="list-item" style={{ paddingRight: 12 }}>
          <Avatar size={44} />
          <div className="col fill">
            <span style={{ fontSize: 16, fontWeight: 700 }}>나 · {session?.name}</span>
            <span className="t-caption">내 병원 동행도 요청할 수 있어요</span>
          </div>
        </div>
        {(seniors.data ?? []).map((s) => (
          <div key={s.seniorId} className="list-item" style={{ paddingRight: 12 }}>
            <Avatar size={44} />
            <div className="col fill">
              <span style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</span>
              <span className="t-caption">
                {s.age}세 · {s.region}
              </span>
            </div>
            <Icon name="chev" size={20} color="var(--icon-muted)" />
          </div>
        ))}
      </div>
      <span style={{ fontSize: 16, fontWeight: 700 }}>알림 받을 순간</span>
      <div className="card card--list">
        {notis.map(([l, on]) => (
          <div key={l} className="list-item row--between" style={{ padding: '12px 14px' }}>
            <span className="t-body t-medium">{l}</span>
            <Switch defaultOn={on} label={l} />
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        onClick={() => {
          logout()
          navigate('/login', { replace: true })
        }}
      >
        로그아웃
      </Button>
    </Screen>
  )
}
