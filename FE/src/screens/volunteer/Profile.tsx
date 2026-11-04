import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileApi } from '../../api/services'
import { ABILITY_LABEL, REGIONS, TRANSPORT_LABEL, WEEKDAY_LABEL } from '../../api/labels'
import type { Gender, Transport, VolunteerProfileBody, Weekday } from '../../api/types'
import { Button } from '../../components/common/Button'
import { CharacterAvatar } from '../../components/common/Character'
import { ToggleChipGroup } from '../../components/common/Chip'
import { ErrorText, Field, SelectField } from '../../components/common/Form'
import { Screen, Spacer, TopBar } from '../../components/common/Layout'
import { useAuth } from '../../auth/AuthContext'
import { useAction, useApi } from '../../hooks/useApi'

const WEEKDAYS = Object.keys(WEEKDAY_LABEL) as Weekday[]
const TRANSPORTS = Object.keys(TRANSPORT_LABEL) as Transport[]
const ABILITIES = Object.keys(ABILITY_LABEL)

/** 코드 목록 ↔ 화면 문구 목록 */
const toLabels = <K extends string>(codes: K[] | undefined, map: Record<K, string>) => (codes ?? []).map((c) => map[c]).filter(Boolean)
const toCodes = <K extends string>(labels: string[], all: K[], map: Record<K, string>) => all.filter((c) => labels.includes(map[c]))

/** S-03 봉사자 프로필 (PRF-01). 사진 업로드는 없고 캐릭터가 고정으로 들어가요 */
export function VolunteerProfile() {
  const { session } = useAuth()
  // 이미 프로필이 있으면 불러와서 수정해요
  const mine = useApi(() => profileApi.myVolunteer(), [], !!session?.profileCompleted)
  if (session?.profileCompleted && mine.loading) {
    return (
      <Screen>
        <TopBar title="봉사자 프로필" />
        <p className="t-caption">불러오는 중…</p>
      </Screen>
    )
  }
  return <ProfileForm initial={mine.data ?? null} />
}

function ProfileForm({ initial }: { initial: VolunteerProfileBody | null }) {
  const navigate = useNavigate()
  const { setProfileCompleted } = useAuth()
  const { pending, error, run, setError } = useAction()
  const [age, setAge] = useState(initial ? String(initial.age) : '')
  const [gender, setGender] = useState<Gender | ''>(initial?.gender ?? '')
  const [school, setSchool] = useState(initial?.school ?? '')
  const [major, setMajor] = useState(initial?.major ?? '')
  const [grade, setGrade] = useState(initial ? String(initial.grade) : '')
  const [hometown, setHometown] = useState(initial?.hometown ?? '')
  const [intro, setIntro] = useState(initial?.intro ?? '')
  const [regions, setRegions] = useState<string[]>(initial?.regions ?? [])
  const [days, setDays] = useState<Weekday[]>(initial?.availableDays ?? [])
  const [transports, setTransports] = useState<Transport[]>(initial?.transports ?? ['PUBLIC'])
  const [abilities, setAbilities] = useState<string[]>(initial?.abilities ?? [])

  const submit = async () => {
    const a = Number(age)
    const g = Number(grade)
    if (!a || !gender || !school.trim() || !major.trim() || !g || !hometown.trim() || !intro.trim()) {
      return setError('기본 정보를 모두 채워 주세요. 다 채워야 동행을 신청할 수 있어요.')
    }
    if (a < 18) return setError('만 18세 이상부터 동행 봉사에 참여할 수 있어요.')
    const res = await run(() =>
      profileApi.saveVolunteer({
        age: a,
        gender,
        school: school.trim(),
        major: major.trim(),
        grade: g,
        hometown: hometown.trim(),
        intro: intro.trim(),
        photoUrl: '',
        regions,
        availableDays: days,
        transports,
        abilities,
      }),
    )
    if (!res) return
    setProfileCompleted(true)
    navigate('/volunteer/home', { replace: true })
  }

  return (
    <Screen bodyStyle={{ gap: 14 }}>
      <TopBar title="봉사자 프로필" />
      <h1 className="t-h1">
        동행을 요청한 분이
        <br />
        볼 프로필이에요
      </h1>
      <div className="row" style={{ gap: 16 }}>
        <CharacterAvatar who="volunteer" size={80} />
        <div className="col fill" style={{ gap: 4 }}>
          <span className="t-body t-bold">프로필 사진</span>
          <span className="t-sub">사진은 올리지 않아요. 같이가요 캐릭터가 대신 들어가요.</span>
        </div>
      </div>
      <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
        <div className="fill">
          <Field label="나이" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="fill">
          <SelectField
            label="성별"
            placeholder="선택"
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            options={[
              { value: 'FEMALE', label: '여성' },
              { value: 'MALE', label: '남성' },
            ]}
          />
        </div>
      </div>
      <Field label="대학교" placeholder="경북대학교" value={school} onChange={(e) => setSchool(e.target.value)} />
      <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
        <div className="fill">
          <Field label="학과" value={major} onChange={(e) => setMajor(e.target.value)} />
        </div>
        <div style={{ width: 96 }}>
          <Field label="학년" inputMode="numeric" value={grade} onChange={(e) => setGrade(e.target.value)} />
        </div>
      </div>
      <Field label="고향" placeholder="경북 안동시" value={hometown} onChange={(e) => setHometown(e.target.value)} />
      <label className="field">
        <span className="t-label">한 줄 소개</span>
        <textarea className="textarea" maxLength={300} placeholder="누군가의 곁에서 천천히 걷는 건 자신 있어요." value={intro} onChange={(e) => setIntro(e.target.value)} />
      </label>

      <span className="t-h2" style={{ marginTop: 8 }}>
        언제, 어디서 함께할 수 있나요?
      </span>
      <p className="t-caption" style={{ margin: 0 }}>
        선택 항목이에요. 신청은 그때그때 직접 골라서 하면 돼요.
      </p>
      <ToggleChipGroup label="활동 지역" options={REGIONS} defaultSelected={regions} onChange={setRegions} />
      <ToggleChipGroup
        label="가능한 요일"
        options={WEEKDAYS.map((d) => WEEKDAY_LABEL[d])}
        defaultSelected={toLabels(days, WEEKDAY_LABEL)}
        onChange={(l) => setDays(toCodes(l, WEEKDAYS, WEEKDAY_LABEL))}
      />
      <ToggleChipGroup
        label="이동 방법"
        options={TRANSPORTS.map((t) => TRANSPORT_LABEL[t])}
        defaultSelected={toLabels(transports, TRANSPORT_LABEL)}
        onChange={(l) => setTransports(toCodes(l, TRANSPORTS, TRANSPORT_LABEL))}
      />
      <ToggleChipGroup
        label="할 수 있는 도움"
        options={ABILITIES.map((a) => ABILITY_LABEL[a])}
        defaultSelected={toLabels(abilities, ABILITY_LABEL)}
        onChange={(l) => setAbilities(toCodes(l, ABILITIES, ABILITY_LABEL))}
      />
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={submit} disabled={pending}>
        {pending ? '저장 중…' : '프로필 저장하기'}
      </Button>
    </Screen>
  )
}
