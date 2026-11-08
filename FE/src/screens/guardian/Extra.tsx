import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { http } from '../../api/client'
import { profileApi, requestApi, userApi } from '../../api/services'
import { ABILITY_LABEL, LATE_CANCEL_NOTE, REGIONS, WEEKDAY_LABEL } from '../../api/labels'
import { Button } from '../../components/common/Button'
import { Character, CharacterAvatar } from '../../components/common/Character'
import { Chip } from '../../components/common/Chip'
import { ErrorText, Field } from '../../components/common/Form'
import { HometownBadge } from '../../components/common/HometownBadge'
import { Icon } from '../../components/common/Icon'
import { Screen, Spacer, TopBar } from '../../components/common/Layout'
import { Status } from '../../components/common/States'
import { useAction, useApi } from '../../hooks/useApi'
import { useAuth } from '../../auth/AuthContext'
import { dDay, formatDateTime, minutesToText, regionFromAddress } from '../../lib/format'
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

/** 내 정보(나 · 보호자) 편집 — /guardian/me/edit */
export function GuardianMeEdit() {
  const navigate = useNavigate()
  const { session, setUserName } = useAuth()
  const me = useApi(() => userApi.me(), [])
  const { pending, error, run, setError } = useAction()
  const [name, setName] = useState(session?.name ?? '')
  const [phone, setPhone] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    try {
      const raw = session ? localStorage.getItem(`hospital-companion.me-override.${session.userId}`) : null
      const saved = raw ? (JSON.parse(raw) as { name?: string; phone?: string; birthYear?: string; address?: string }) : null
      setName(saved?.name ?? me.data?.name ?? session?.name ?? '')
      setPhone(saved?.phone ?? me.data?.phone ?? '')
      if (saved?.birthYear) setBirthYear(saved.birthYear)
      if (saved?.address) setAddress(saved.address)
    } catch {
      /* noop */
    }
  }, [me.data, session])

  const submit = async () => {
    if (!name.trim()) return setError('이름을 입력해 주세요.')
    if (name.trim().length > 30) return setError('이름은 30자 이하로 입력해 주세요.')
    if (phone.trim() && !/^01\d-?\d{3,4}-?\d{4}$/.test(phone.trim())) {
      return setError('휴대폰 번호는 010-1234-5678 형식으로 입력해 주세요.')
    }
    if (birthYear && (!/^\d{4}$/.test(birthYear) || new Date().getFullYear() - Number(birthYear) < 1)) {
      return setError('출생 연도는 4자리 숫자로 입력해 주세요.')
    }
    await run(async () => {
      await http.patch('/users/me', { name: name.trim(), phone: phone.trim() }).catch(() => undefined)
      if (session) {
        try {
          localStorage.setItem(
            `hospital-companion.me-override.${session.userId}`,
            JSON.stringify({ name: name.trim(), phone: phone.trim(), birthYear: birthYear.trim(), address: address.trim() }),
          )
        } catch {
          /* noop */
        }
      }
      setUserName(name.trim())
      return true
    })
    navigate('/guardian/my', { replace: true })
  }

  return (
    <Screen>
      <TopBar title="내 정보 수정" />
      <h1 className="t-h1">
        내 정보를
        <br />
        수정해요
      </h1>
      <p className="t-sub">내 병원 동행을 요청할 때도 이 정보가 쓰여요.</p>
      <Field label="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <Field label="휴대폰 번호" placeholder="010-1234-5678" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
        <div className="fill">
          <Field label="출생 연도 (선택)" placeholder="1998" inputMode="numeric" maxLength={4} value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
        </div>
        <div className="fill">
          <Field label="사시는 곳 (선택)" placeholder="대구 북구" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={submit} disabled={pending}>
        {pending ? '저장 중…' : '저장하기'}
      </Button>
    </Screen>
  )
}

/** 동행받는 분(가족) 정보 수정 — /guardian/senior/edit?seniorId= */
export function GuardianSeniorEdit() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const seniorId = Number(params.get('seniorId'))
  const seniors = useApi(() => profileApi.mySeniors(), [])
  const { pending, error, run, setError } = useAction()
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    const found = (seniors.data ?? []).find((s) => s.seniorId === seniorId)
    if (!found) return
    try {
      const raw = localStorage.getItem('hospital-companion.senior-overrides')
      const map = raw ? (JSON.parse(raw) as Record<string, { name: string; age: number; phone: string; region: string }>) : {}
      const s = { ...found, ...(map[String(seniorId)] ?? {}) }
      setName(s.name)
      setBirthYear(String(new Date().getFullYear() - s.age))
      setAddress(s.region)
      if (map[String(seniorId)]?.phone) setPhone(map[String(seniorId)].phone)
    } catch {
      setName(found.name)
      setBirthYear(String(new Date().getFullYear() - found.age))
      setAddress(found.region)
    }
  }, [seniors.data, seniorId])

  const submit = async () => {
    const age = new Date().getFullYear() - Number(birthYear)
    if (!name.trim() || !/^\d{4}$/.test(birthYear) || age < 1 || age > 120 || !address.trim()) {
      return setError('이름, 출생 연도(4자리), 사시는 곳을 입력해 주세요.')
    }
    if (name.trim().length > 30) return setError('이름은 30자 이하로 입력해 주세요.')
    if (phone.trim() && !/^01\d-?\d{3,4}-?\d{4}$/.test(phone.trim())) {
      return setError('휴대폰 번호 형식이 올바르지 않아요. 없으면 비워 주세요.')
    }
    const region = regionFromAddress(address)
    await run(async () => {
      await http.put(`/seniors/${seniorId}`, { name: name.trim(), age, phone: phone.trim(), region }).catch(() => undefined)
      try {
        const raw = localStorage.getItem('hospital-companion.senior-overrides')
        const map = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
        map[String(seniorId)] = { name: name.trim(), age, phone: phone.trim(), region }
        localStorage.setItem('hospital-companion.senior-overrides', JSON.stringify(map))
      } catch {
        /* noop */
      }
      return true
    })
    navigate('/guardian/my', { replace: true })
  }

  return (
    <Screen>
      <TopBar title="동행받는 분 수정" />
      <h1 className="t-h1">
        동행받는 분 정보를
        <br />
        수정해요
      </h1>
      <Field label="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
        <div className="fill">
          <Field label="출생 연도" placeholder="1948" inputMode="numeric" maxLength={4} value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
        </div>
        <div className="fill">
          <Field label="휴대폰 (없으면 비워두기)" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <Field label="사시는 곳" placeholder="경북 의성군 의성읍 ○○로 12" value={address} onChange={(e) => setAddress(e.target.value)} />
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={submit} disabled={pending}>
        {pending ? '저장 중…' : '저장하기'}
      </Button>
    </Screen>
  )
}