import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileApi } from '../../api/services'
import type { Gender } from '../../api/types'
import { Button } from '../../components/common/Button'
import { CharacterAvatar } from '../../components/common/Character'
import { ErrorText, Field, SelectField } from '../../components/common/Form'
import { Screen, Spacer, TopBar } from '../../components/common/Layout'
import { useAuth } from '../../auth/AuthContext'
import { useAction } from '../../hooks/useApi'

/** S-03 봉사자 프로필 (PRF-01). 사진 업로드는 없고 캐릭터가 고정으로 들어가요 */
export function VolunteerProfile() {
  const navigate = useNavigate()
  const { setProfileCompleted } = useAuth()
  const { pending, error, run, setError } = useAction()
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [school, setSchool] = useState('')
  const [major, setMajor] = useState('')
  const [grade, setGrade] = useState('')
  const [hometown, setHometown] = useState('')
  const [intro, setIntro] = useState('')

  const submit = async () => {
    const a = Number(age)
    const g = Number(grade)
    if (!a || !gender || !school.trim() || !major.trim() || !g || !hometown.trim() || !intro.trim()) {
      return setError('모든 항목을 채워 주세요. 다 채워야 동행을 신청할 수 있어요.')
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
      <Field label="고향" placeholder="안동" value={hometown} onChange={(e) => setHometown(e.target.value)} />
      <label className="field">
        <span className="t-label">한 줄 소개</span>
        <textarea className="textarea" maxLength={300} placeholder="누군가의 곁에서 천천히 걷는 건 자신 있어요." value={intro} onChange={(e) => setIntro(e.target.value)} />
      </label>
      <ErrorText>{error}</ErrorText>
      <Spacer />
      <Button onClick={submit} disabled={pending}>
        {pending ? '저장 중…' : '프로필 완성하기'}
      </Button>
    </Screen>
  )
}
