import { BellButton } from '../../components/common/BellButton'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { profileApi, requestApi, visitApi } from '../../api/services'
import {
  MEET_PLACE_LABEL,
  TRAVEL_MODE_LABEL,
  NEED_LABEL,
  NEEDS,
  REQUEST_STATUS_LABEL,
  REQUEST_STATUS_TONE,
} from '../../api/labels'
import type { GenderPref, MeetPlaceType, MyRequestItem, Need, TargetType, TravelMode } from '../../api/types'
import { Button } from '../../components/common/Button'
import { ChoiceChips, Chip, FilterChips, ToggleChipGroup } from '../../components/common/Chip'
import { ErrorText, Field, SelectField } from '../../components/common/Form'
import { Icon, type IconName } from '../../components/common/Icon'
import { Avatar, Screen, Spacer, TopBar } from '../../components/common/Layout'
import { GUARDIAN_TABS, TabBar } from '../../components/common/TabBar'
import { ThanksPresets } from '../../components/common/ThanksPresets'
import { ModeSwitchButton, ModeSwitchCard } from '../../components/common/ModeSwitch'
import { CharacterAvatar, CharacterPair } from '../../components/common/Character'
import { EmptyState, Status } from '../../components/common/States'
import { useAuth } from '../../auth/AuthContext'
import { HometownBadge } from '../../components/common/HometownBadge'
import { useAction, useApi } from '../../hooks/useApi'
import { formatDate, formatDateTime, hhmm, todayString } from '../../lib/format'
import { isHometownNeighbor } from '../../lib/hometown'

const tabs = <TabBar tabs={GUARDIAN_TABS} />

/** REQ-01 역·터미널 선택 시 자주 쓰는 대구 주요 역·터미널 퀵 버튼 */
const STATION_QUICK_PLACES = ['동대구역', '동대구터미널', '북부정류장', '서부정류장'] as const


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

const SELECTED_TARGET_KEY = 'hospital-companion.selected-target'

/** G01 홈 */
export function GuardianHome() {
  const { session } = useAuth()
  const mine = useApi(() => requestApi.mine(), [])
  const seniors = useApi(() => profileApi.mySeniors(), [])
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<string>(() => localStorage.getItem(SELECTED_TARGET_KEY) ?? '')

  const seniorList = seniors.data ?? []
  const effectiveTarget =
    selectedTarget === 'SELF' || seniorList.some((s) => String(s.seniorId) === selectedTarget)
      ? selectedTarget
      : seniorList[0]
        ? String(seniorList[0].seniorId)
        : 'SELF'

  const chosenSenior = seniorList.find((s) => String(s.seniorId) === effectiveTarget) ?? null
  const currentLabel = chosenSenior ? `${chosenSenior.name} 님` : '나'

  const selectTarget = (val: string) => {
    setSelectedTarget(val)
    try {
      localStorage.setItem(SELECTED_TARGET_KEY, val)
    } catch {
      /* noop */
    }
    setMenuOpen(false)
  }

  const targetName = chosenSenior ? chosenSenior.name : session?.name
  const filteredMine =
    mine.data && targetName && mine.data.some((r) => r.seniorName === targetName)
      ? mine.data.filter((r) => r.seniorName === targetName)
      : mine.data

  const active = pickActive(filteredMine ?? null)
  const { visit } = useVisitByRequest(active?.requestId)
  const v = visit.data
  const checklist = v?.checklist ?? []
  const nowIdx = checklist.findIndex((s) => !s.done)

  const upcoming = (filteredMine ?? [])
    .filter((r) => r.status === 'RECRUITING' || r.status === 'CONFIRMED')
    .sort((a, b) => a.date.localeCompare(b.date))

  const applyUrl = chosenSenior ? `/guardian/apply?target=FAMILY&seniorId=${chosenSenior.seniorId}` : '/guardian/apply?target=SELF'

  return (
    <Screen footer={tabs}>
      <div className="row row--between" style={{ position: 'relative' }}>
        <button
          type="button"
          className="row"
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            gap: 8,
            padding: '6px 14px 6px 8px',
            borderRadius: 999,
            background: '#fff',
            border: 0,
            boxShadow: 'inset 0 0 0 1.5px var(--line-soft)',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <CharacterAvatar who="elder" size={28} />
          {currentLabel}
          <Icon name="down" size={16} />
        </button>
        {menuOpen && (
          <div
            role="listbox"
            className="card"
            style={{
              position: 'absolute',
              top: 48,
              left: 0,
              zIndex: 30,
              minWidth: 210,
              padding: 8,
              gap: 4,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            <button
              type="button"
              onClick={() => selectTarget('SELF')}
              className="row row--between"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: 0,
                background: effectiveTarget === 'SELF' ? 'var(--bg-canvas)' : 'transparent',
                fontWeight: effectiveTarget === 'SELF' ? 700 : 500,
                fontSize: 15,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>나{session?.name ? ` · ${session.name}` : ''}</span>
              {effectiveTarget === 'SELF' && <Icon name="check" size={18} />}
            </button>
            {seniorList.map((s) => {
              const isSel = effectiveTarget === String(s.seniorId)
              return (
                <button
                  key={s.seniorId}
                  type="button"
                  onClick={() => selectTarget(String(s.seniorId))}
                  className="row row--between"
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: 0,
                    background: isSel ? 'var(--bg-canvas)' : 'transparent',
                    fontWeight: isSel ? 700 : 500,
                    fontSize: 15,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>
                    {s.name} 님 <span className="t-caption">({s.region})</span>
                  </span>
                  {isSel && <Icon name="check" size={18} />}
                </button>
              )
            })}
            <Link
              to="/guardian/senior/new"
              onClick={() => setMenuOpen(false)}
              className="row"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--brand-primary)',
                textDecoration: 'none',
                borderTop: '1px solid var(--line-soft)',
                marginTop: 2,
              }}
            >
              + 동행받는 분 추가
            </Link>
          </div>
        )}
        <span className="row" style={{ gap: 4 }}>
          <BellButton />
          <ModeSwitchButton current="REQUEST" />
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
          <Link className="btn btn--sm btn--on-dark" to={`/guardian/live?requestId=${active.requestId}`}>
            동행 현황 보기
          </Link>
        </section>
      )}

      <div className="row row--between">
        <span className="t-h2">다가오는 일정</span>
        <Link className="t-sub t-medium" to="/guardian/records">
          전체보기
        </Link>
      </div>
      <Status loading={mine.loading} error={mine.error} onRetry={mine.reload} />
      {!mine.loading && !mine.error && upcoming.length === 0 && (
        <EmptyState title="다가오는 일정이 없어요" desc="병원 가는 날이 정해지면 동행을 신청해 보세요." />
      )}
      <div className="card card--list" hidden={upcoming.length === 0}>
        {upcoming.map((r) => (
          <Link key={r.requestId} to={r.status === 'CONFIRMED' ? `/guardian/confirmed?requestId=${r.requestId}` : `/guardian/applicants?requestId=${r.requestId}`} className="list-item" style={{ gap: 14 }}>
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

      </div>
      <Spacer />
      <Button to={applyUrl}>새 동행 신청하기</Button>
    </Screen>
  )
}

/** G02 동행 신청 (나 / 가족) */
export function GuardianApply() {
  const navigate = useNavigate()
  const seniors = useApi(() => profileApi.mySeniors(), [])
  const hospitals = useApi(() => profileApi.hospitals(), [])
  const submit = useAction()

  const [params] = useSearchParams()
  const [targetType, setTargetType] = useState<TargetType>(() => (params.get('target') === 'SELF' ? 'SELF' : 'FAMILY'))
  const [seniorId, setSeniorId] = useState(() => params.get('seniorId') ?? '')
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

  const needLabels = NEEDS.map((n) => NEED_LABEL[n])
  return (
    <Screen
      cta={
        <Button onClick={send} disabled={submit.pending}>
          {submit.pending ? '신청 중…' : '신청하기'}
        </Button>
      }
    >
      <TopBar title="동행 신청" />
      <section className="card" style={{ gap: 16 }}>
        <h2 className="t-h2" style={{ fontSize: 17 }}>
          누구와, 어디로 갈까요
        </h2>
        <ChoiceChips
          label="누구의 병원 동행인가요?"
          options={[
            { value: 'SELF', label: '나' },
            { value: 'FAMILY', label: '가족' },
          ]}
          value={targetType}
          onChange={(v) => setTargetType(v as TargetType)}
          stretch
          hint="나를 고르면 내 정보로 바로 요청하고, 진료 요약도 나에게 와요."
        />
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
            <Link className="see-all" to="/guardian/senior/new">
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
      </section>

      <section className="card" style={{ gap: 16 }}>
        <h2 className="t-h2" style={{ fontSize: 17 }}>
          언제, 어디서 만날까요
        </h2>
        {/* 좁은 화면에서는 시간이 다음 줄로 내려가요 (날짜·시간 칸이 카드 밖으로 나가지 않게) */}
        <div className="row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1.3 1 150px', minWidth: 0 }}>
            <Field label="날짜" type="date" min={todayString()} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 120px', minWidth: 0 }}>
            <Field label="시간" type="time" value={meetTime} onChange={(e) => setMeetTime(e.target.value)} />
          </div>
        </div>
        <ChoiceChips
          label="만나는 곳"
          options={(Object.keys(MEET_PLACE_LABEL) as MeetPlaceType[]).map((k) => ({ value: k, label: MEET_PLACE_LABEL[k] }))}
          value={meetPlaceType}
          onChange={(v) => setMeetPlaceType(v as MeetPlaceType)}
        />
        {meetPlaceType === 'STATION' && (
          <div className="field" style={{ gap: 6 }}>
            <span className="t-caption t-bold" style={{ color: 'var(--text-secondary)' }}>
              대구 주요 역·터미널 빠른 선택
            </span>
            <div className="chip-group">
              {STATION_QUICK_PLACES.map((place) => {
                const active = meetAddress === place
                return (
                  <button
                    key={place}
                    type="button"
                    aria-pressed={active}
                    className={`filter-chip ${active ? 'filter-chip--on' : ''}`}
                    onClick={() => setMeetAddress(place)}
                  >
                    {place}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <ChoiceChips
          label="대구까지 이동 방법"
          options={(Object.keys(TRAVEL_MODE_LABEL) as TravelMode[]).map((k) => ({ value: k, label: TRAVEL_MODE_LABEL[k] }))}
          value={travelMode}
          onChange={(v) => setTravelMode(v as TravelMode)}
          hint="차비·진료비·약값은 동행받는 분이 직접 내요. 봉사자는 돈을 대신 내지 않아요."
        />
        <Field
          label={meetPlaceType === 'STATION' ? '만나는 역·터미널 (상세 위치)' : '만나는 주소'}
          placeholder={meetPlaceType === 'STATION' ? '예: 동대구터미널 1층 대합실 앞' : '경북 의성군 의성읍 ○○로 12'}
          value={meetAddress}
          onChange={(e) => setMeetAddress(e.target.value)}
        />
      </section>

      <section className="card" style={{ gap: 16 }}>
        <h2 className="t-h2" style={{ fontSize: 17 }}>
          어떤 도움이 필요한가요
        </h2>
        <ToggleChipGroup label="필요한 도움" options={needLabels} onChange={(labels) => setNeeds(NEEDS.filter((n) => labels.includes(NEED_LABEL[n])))} />
        <p className="t-caption" style={{ margin: '-4px 0 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          ※ 자립 보행이나 휠체어 탑승이 가능한 분을 대상으로 1:1 동행해요. 혼자 거동이 어려운 중증 와상·낙상 고위험군은 장기요양 요양보호사 제도를 이용해 주세요.
        </p>
        <label className="field">
          <span className="t-label">봉사자에게 전할 말</span>
          <textarea className="textarea" rows={3} placeholder="귀가 어두우셔서 크게 천천히 말씀해 주세요." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </section>

      <section className="card" style={{ gap: 16 }}>
        <h2 className="t-h2" style={{ fontSize: 17 }}>
          어떤 봉사자가 좋을까요
        </h2>
        <ChoiceChips
          label="필요한 봉사자 수"
          options={[
            { value: '1', label: '1명' },
            { value: '2', label: '2명' },
          ]}
          value={helpersNeeded}
          onChange={setHelpersNeeded}
        />
        <ChoiceChips
          label="봉사자 성별"
          options={[
            { value: 'ANY', label: '상관없어요' },
            { value: 'FEMALE', label: '여성' },
            { value: 'MALE', label: '남성' },
          ]}
          value={genderPref}
          onChange={(v) => setGenderPref(v as GenderPref)}
        />
      </section>
      <Status loading={seniors.loading || hospitals.loading} error={seniors.error ?? hospitals.error} />
      <ErrorText>{submit.error}</ErrorText>
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
    <Screen
      cta={
        d && vol ? (
          <>
            <div className="row" style={{ gap: 10 }}>
              <Button variant="secondary" style={{ width: 120 }} onClick={() => (window.location.href = `tel:${vol.phone}`)}>
                <Icon name="phone" size={20} />
                전화
              </Button>
              <Button className="fill" to="/guardian/home">
                일정 확인하기
              </Button>
            </div>
            <Button variant="ghost" to={`/guardian/cancel?requestId=${d.requestId}`}>
              요청 취소하기
            </Button>
          </>
        ) : undefined
      }
    >
      <TopBar title="동행 확정" />
      <Status loading={target.loading || detail.loading} error={target.error ?? detail.error} />
      {d && !vol && <EmptyState title="아직 확정된 봉사자가 없어요" waiting />}
      {d && vol && (
        <>
          <section className="col" style={{ gap: 10, alignItems: 'center', textAlign: 'center', padding: 20, borderRadius: 26, background: 'var(--brand-primary-soft)' }}>
            <CharacterPair width={200} />
            <h1 className="t-h1">
              {d.senior.name} 님과 함께할
              <br />
              봉사자가 정해졌어요
            </h1>
            <p className="t-sub" style={{ color: 'var(--chip-gray-ink)' }}>
              {formatDateTime(d.date, d.meetTime)} · {d.meetAddress ?? MEET_PLACE_LABEL[d.meetPlaceType]}에서 만나요
            </p>
          </section>
          <section className="card" style={{ gap: 14, padding: '16px 18px' }}>
            <div className="row" style={{ gap: 14 }}>
              <CharacterAvatar who="volunteer" size={64} />
              <div className="col" style={{ gap: 3 }}>
                <span style={{ fontSize: 19, fontWeight: 700 }}>{vol.name} 봉사자</span>
                <span className="t-sub">{p ? `${p.school} · 동행 ${p.visitCount}회` : ''}</span>
              </div>
            </div>
            {p && (
              <div className="col" style={{ gap: 8, fontSize: 15, fontWeight: 500 }}>
                {p.verified && (
                  <span className="row" style={{ gap: 8, color: 'var(--primary-ink)' }}>
                    <Icon name="shield" size={20} />
                    재학 인증
                  </span>
                )}
                {isHometownNeighbor(p.hometown, d.senior.region) && (
                  <span className="row" style={{ gap: 8 }}>
                    <HometownBadge />
                    <span className="t-caption">고향 {p.hometown}</span>
                  </span>
                )}
                <span className="row" style={{ gap: 8 }}>
                  <Icon name="user" size={20} color="var(--brand-primary)" />
                  {p.major} {p.grade}학년
                </span>
              </div>
            )}
            {p?.thanksMessages?.[0] && (
              <div className="col" style={{ gap: 4, padding: '12px 14px', borderRadius: 16, background: 'var(--brand-primary-soft)' }}>
                <span style={{ fontSize: 15, lineHeight: 1.6 }}>“{p.thanksMessages[0].message}”</span>
                <span className="t-caption">다른 요청자 후기</span>
              </div>
            )}
          </section>
        </>
      )}
    </Screen>
  )
}

/** G04 동행 현황 (지도 없이 체크리스트 단계로) */
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
      <div style={{ padding: '0 24px' }}>
        <TopBar title={d ? `${d.senior.name} 님 동행 현황` : '동행 현황'} />
      </div>
      <div className="col" style={{ flex: 1, gap: 14, padding: '20px 24px 24px' }}>
        <Status loading={target.loading || loading} error={target.error ?? error} />
        {!target.requestId && !target.loading && <EmptyState title="진행 중인 동행이 아직 없어요" desc="봉사자가 확정되면 여기서 단계를 볼 수 있어요." />}
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
                    {(s.completedAt ?? (s.step === 'MEET' ? v.startedAt : null)) && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{hhmm((s.completedAt ?? v.startedAt)!)}</span>
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
        ['user', '챙겨야 할 일', sum.guardianTodo.join(' / ')],
      ]
    : []

  const canApprove = detail.data?.status === 'COMPLETED' && !approved

  const doApprove = async () => {
    const res = await approve.run(() => visitApi.approve(visitId, thanks.trim() || undefined))
    if (res) setApproved(true)
  }

  return (
    <Screen
      cta={
        <>
          {canApprove && (
            <Button onClick={doApprove} disabled={approve.pending}>
              {approve.pending ? '승인 중…' : '봉사시간 승인하기'}
            </Button>
          )}
          <Button variant="ghost" to="/guardian/apply">
            다음 동행 신청하기
          </Button>
        </>
      }
    >
      <TopBar title="오늘 진료 기록" />
      {!requestId && <ErrorText>동행 기록에서 들어와 주세요.</ErrorText>}
      <Status loading={loading || summary.loading} error={error ?? (v?.hasSummary === false ? null : summary.error)} />
      {v && (
        <div className="col" style={{ gap: 8, alignItems: 'flex-start', padding: '0 4px' }}>
          {v.endedAt && <Chip>{`귀가 완료 ${hhmm(v.endedAt)}`}</Chip>}
          <h1 className="t-h1">
            {detail.data?.senior.name}님 동행 {v.endedAt ? '기록이에요' : '진행 중이에요'}
          </h1>
        </div>
      )}
      {v && v.hasSummary === false && <p className="t-body">아직 봉사자가 진료 요약을 작성하지 않았어요.</p>}
      {sum && (
        <p className="t-caption" style={{ margin: '0 4px', fontSize: 15, lineHeight: 1.6 }}>
          괜찮다는 말씀 뒤에 담긴 오늘의 진료 기록이에요
        </p>
      )}
      {sum && (
        <div className="card" style={{ gap: 10 }}>
          <span className="t-bold" style={{ fontSize: 14, color: 'var(--brand-primary-ink, #0E5F56)' }}>
            진료 내용
          </span>
          {sum.todayPoints.map((p) => (
            <p key={p} className="t-body">· {p}</p>
          ))}
          <span style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--text-secondary)' }}>{sum.disclaimer || '이 요약은 봉사자 메모를 정리한 것이에요. 정확한 내용은 의료진에게 확인해 주세요.'}</span>
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
        <div className="card" style={{ padding: '4px 18px', gap: 0 }}>
          {facts.map(([ic, k, val], n) => (
            <div key={k} className="row" style={{ gap: 12, alignItems: 'flex-start', padding: '14px 0', borderBottom: n < facts.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
              <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', background: 'var(--brand-primary-soft, #DDF3EC)', color: '#0E5F56', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={ic} size={20} />
              </span>
              <div className="col" style={{ gap: 2 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{k}</span>
                <span className="t-body t-bold">{val}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {(canApprove || approved || v?.approved) && (
        <>
          {canApprove && <ThanksPresets value={thanks} onPick={setThanks} />}
          {canApprove && (
            <label className="field">
              <span className="t-label">봉사자에게 감사 메시지 (선택)</span>
              <textarea className="textarea" rows={3} placeholder="고마운 마음을 전해 보세요." value={thanks} onChange={(e) => setThanks(e.target.value)} />
            </label>
          )}
          <ErrorText>{approve.error}</ErrorText>
          {(approved || v?.approved) && <p className="t-caption t-accent t-medium">봉사시간을 승인했어요.</p>}
        </>
      )}
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

/** G07 MY · 모드 전환 · 동행받는 분 */
export function GuardianMy() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const seniors = useApi(() => profileApi.mySeniors(), [])
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
          </div>
        ))}
      </div>
      <div className="card card--list">
        <Link to="/guardian/notifications/settings" className="list-item row--between" style={{ paddingRight: 12 }}>
          <span className="row" style={{ gap: 12 }}>
            <Icon name="gear" size={20} color="var(--brand-primary)" />
            <span className="col" style={{ gap: 2 }}>
              <span className="t-body t-bold">알림 설정</span>
              <span className="t-sub">받을 동행 소식을 골라요</span>
            </span>
          </span>
          <Icon name="chev" size={20} color="var(--icon-muted)" />
        </Link>
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